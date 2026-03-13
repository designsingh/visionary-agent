/**
 * Generate-pitch pipeline: CAPTURE → BRAIN → BUILD → COMPARE.
 * Streams progress via callback so the UI can show each step as it completes.
 */

import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { captureScreenshot } from "./screenshot.js";
import { runCrawl, formatCrawlForBrain } from "./crawl.js";
import { designDirector, type GeminiBrainOutput } from "./brain.js";
import { v0 } from "v0-sdk";

const OUTPUT_DIR = "output";

export interface PipelineStep {
  step: "crawl" | "capture" | "brain" | "build" | "comparison" | "done" | "error";
  message: string;
  data?: Record<string, unknown>;
}

export type StepCallback = (step: PipelineStep) => void;

function slug(url: string): string {
  try {
    return new URL(url).hostname.replace(/\./g, "-").replace(/[^a-z0-9-]/gi, "");
  } catch {
    return "page";
  }
}

function ts(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function buildV0Message(brain: GeminiBrainOutput): string {
  const secondary = brain.secondaryColorHex || brain.primaryColorHex;
  const hierarchy = brain.contentHierarchy ? `\nContent hierarchy (preserve this order): ${brain.contentHierarchy}` : "";

  const copyBlock = `
EXACT COPY AND COLORS (do not change):
- Business name: ${brain.businessName}
- Primary color: ${brain.primaryColorHex}
- Secondary color: ${secondary}
- Hero headline: ${brain.heroH1}
- Hero subtext: ${brain.heroSubtext}
- Services (use exactly as listed, in this order):
${brain.services.map((s, i) => `  ${i + 1}. ${s.title}: ${s.description}`).join("\n")}
- Logo: Keep/use the existing logo — do not redesign it.
${hierarchy}
`.trim();

  return `${brain.v0DesignPrompt}\n\n${copyBlock}`;
}

async function buildSideBySide(beforeBuf: Buffer, afterBuf: Buffer): Promise<Buffer> {
  const PAD = 16;
  const LABEL_H = 48;

  const labelSvg = (text: string, w: number, dark: boolean) => `
    <svg width="${w}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${dark ? "#0f172a" : "#1e293b"}"/>
      <text x="16" y="32" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="white">${text}</text>
    </svg>`;

  async function labeled(buf: Buffer, text: string, dark: boolean): Promise<Buffer> {
    const meta = await sharp(buf).metadata();
    const w = meta.width ?? 1280;
    const lbl = await sharp(Buffer.from(labelSvg(text, w, dark))).png().toBuffer();
    return sharp(buf)
      .extend({ top: LABEL_H, background: { r: 30, g: 41, b: 59 } })
      .composite([{ input: lbl, top: 0, left: 0 }])
      .toBuffer();
  }

  const [bL, aL] = await Promise.all([
    labeled(beforeBuf, "Before", false),
    labeled(afterBuf, "After", true),
  ]);
  const bM = await sharp(bL).metadata();
  const aM = await sharp(aL).metadata();
  const totalW = (bM.width ?? 0) + (aM.width ?? 0) + PAD;
  const maxH = Math.max(bM.height ?? 720, aM.height ?? 720);

  return sharp({ create: { width: totalW, height: maxH, channels: 3, background: { r: 30, g: 41, b: 59 } } })
    .png()
    .composite([
      { input: bL, top: 0, left: 0 },
      { input: aL, top: 0, left: (bM.width ?? 0) + PAD },
    ])
    .toBuffer();
}

/**
 * Full pipeline with step-by-step callback.
 */
export async function generatePitch(legacyUrl: string, onStep: StepCallback): Promise<void> {
  const host = slug(legacyUrl);
  const t = ts();
  await mkdir(OUTPUT_DIR, { recursive: true });

  // ── STEP 0: CRAWL (runs in parallel with CAPTURE) ──
  onStep({ step: "crawl", message: "Crawling site and capturing screenshot…" });
  let screenshotBuffer: Buffer;
  let crawlMarkdown: string | undefined;

  const [crawlResult, captureResult] = await Promise.allSettled([
    runCrawl(legacyUrl, { limit: 15, depth: 2 }),
    captureScreenshot(legacyUrl, { width: 1280, height: 720, waitUntil: "networkidle0" }),
  ]);

  if (crawlResult.status === "fulfilled" && crawlResult.value?.records?.length) {
    crawlMarkdown = formatCrawlForBrain(crawlResult.value.records);
    onStep({
      step: "crawl",
      message: `Crawl complete (${crawlResult.value.records.length} pages).`,
      data: { pageCount: crawlResult.value.records.length },
    });
  } else {
    onStep({ step: "crawl", message: "Crawl skipped (using screenshot only)." });
  }

  if (captureResult.status === "rejected") {
    onStep({ step: "error", message: `Capture failed: ${captureResult.reason?.message ?? captureResult.reason}` });
    return;
  }

  screenshotBuffer = captureResult.value;
  const origFile = `original-${host}-${t}.png`;
  await writeFile(join(OUTPUT_DIR, origFile), screenshotBuffer);
  onStep({
    step: "capture",
    message: "Original site captured.",
    data: { imageUrl: `/output/${origFile}` },
  });

  // ── STEP 2: BRAIN ──
  onStep({ step: "brain", message: "Gemini is analyzing the design and content…" });
  let brain: GeminiBrainOutput;
  try {
    brain = await designDirector(screenshotBuffer, legacyUrl, crawlMarkdown);
    onStep({
      step: "brain",
      message: "Design brief ready.",
      data: { brain },
    });
  } catch (e) {
    onStep({ step: "error", message: `Brain failed: ${e instanceof Error ? e.message : e}` });
    return;
  }

  // ── STEP 3: BUILD ──
  const v0Key = process.env.V0_API_KEY;
  if (!v0Key) {
    onStep({ step: "error", message: "V0_API_KEY not set. Brain output is above; add the key to .env to generate the redesign." });
    return;
  }

  onStep({ step: "build", message: "v0 is building the redesigned landing page…" });
  let v0DemoUrl: string | undefined;
  let v0WebUrl: string | undefined;
  try {
    const message = buildV0Message(brain);
    const chat = await v0.chats.create({
      message,
      system: `You are an expert React/Next.js developer doing a VISUAL REDESIGN of an existing site.

CRITICAL RULES (do not violate):
1. PRESERVE the exact content hierarchy — same sections, same order. Do not add, remove, or reorder.
2. PRESERVE the logo — place it in the header as-is. Do not redesign or replace it.
3. USE only the provided primaryColorHex and secondaryColorHex — no other brand colors.
4. USE the exact copy provided — hero headline, subtext, services with their titles and descriptions. No lorem ipsum, no invented text.
5. Apply a VISUAL upgrade only: better typography (Inter or system sans), improved spacing, cleaner contrast, subtle polish. Same structure and content — better visual execution.

Use Tailwind CSS. Light/white backgrounds unless the brand colors imply otherwise.`,
    });
    v0WebUrl = chat.webUrl;
    v0DemoUrl = chat.latestVersion?.demoUrl ?? undefined;

    // Poll until the version is completed and demoUrl is available
    if (!v0DemoUrl && chat.id) {
      onStep({ step: "build", message: "Waiting for v0 to finish building…" });
      const MAX_POLLS = 30;
      for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        try {
          const updated = await v0.chats.getById({ chatId: chat.id });
          const ver = updated.latestVersion;
          if (ver?.demoUrl) {
            v0DemoUrl = ver.demoUrl;
            break;
          }
          if (ver?.status === "failed") {
            onStep({ step: "build", message: "v0 build failed internally. You can still edit the chat." });
            break;
          }
        } catch {
          break;
        }
      }
    }

    onStep({
      step: "build",
      message: v0DemoUrl ? "Redesign generated." : "Redesign created (preview may still be building).",
      data: { v0WebUrl, v0DemoUrl, v0ChatId: chat.id },
    });
  } catch (e) {
    onStep({ step: "error", message: `v0 build failed: ${e instanceof Error ? e.message : e}` });
    return;
  }

  // ── STEP 4: COMPARISON ──
  if (v0DemoUrl) {
    onStep({ step: "comparison", message: "Capturing the redesign and building side-by-side…" });
    try {
      const redesignBuffer = await captureScreenshot(v0DemoUrl, {
        width: 1280, height: 720, waitUntil: "networkidle2",
      });
      const redesignFile = `redesign-${host}-${t}.png`;
      await writeFile(join(OUTPUT_DIR, redesignFile), redesignBuffer);

      const comparisonBuffer = await buildSideBySide(screenshotBuffer, redesignBuffer);
      const compFile = `comparison-${host}-${t}.png`;
      await writeFile(join(OUTPUT_DIR, compFile), comparisonBuffer);

      onStep({
        step: "comparison",
        message: "Side-by-side comparison ready.",
        data: {
          redesignUrl: `/output/${redesignFile}`,
          comparisonUrl: `/output/${compFile}`,
        },
      });
    } catch (e) {
      onStep({ step: "comparison", message: `Comparison capture failed (redesign link still works): ${e instanceof Error ? e.message : e}` });
    }
  }

  onStep({ step: "done", message: "Pipeline complete." });
}
