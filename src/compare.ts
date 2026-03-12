#!/usr/bin/env npx tsx
/**
 * Visionary – Screenshots & side-by-side comparison
 * Captures "Before" and "After" URLs via Cloudflare /screenshot, then saves
 * a single side-by-side PNG to output/.
 *
 * Usage: npm run compare -- <beforeUrl> [afterUrl]
 * Example: npm run compare -- https://example.com https://redesign.example.com
 * If only one URL is given, creates a single screenshot (no comparison).
 */

import "dotenv/config";
import { join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { captureScreenshot } from "./screenshot.js";

const __filename = fileURLToPath(import.meta.url);

const VIEWPORT = { width: 1280, height: 720 };
const LABEL_HEIGHT = 48;
const PADDING = 16;
export const OUTPUT_DIR = "output";

function slug(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/\./g, "-").replace(/[^a-z0-9-]/gi, "");
  } catch {
    return "page";
  }
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

/**
 * Add a simple "Before" / "After" label on top of an image (same width, label strip at top).
 */
async function addLabel(
  buffer: Buffer,
  text: string,
  isRight: boolean
): Promise<Buffer> {
  const meta = await sharp(buffer).metadata();
  const w = meta.width ?? VIEWPORT.width;
  const h = (meta.height ?? VIEWPORT.height) + LABEL_HEIGHT;

  const labelSvg = `
    <svg width="${w}" height="${LABEL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${isRight ? "#0f172a" : "#1e293b"}"/>
      <text x="${PADDING}" y="32" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="white">${escapeXml(text)}</text>
    </svg>
  `;
  const labelBuffer = await sharp(Buffer.from(labelSvg)).png().toBuffer();

  const stacked = await sharp(buffer)
    .extend({ top: LABEL_HEIGHT, background: { r: 30, g: 41, b: 59 } })
    .composite([{ input: labelBuffer, top: 0, left: 0 }])
    .toBuffer();

  return stacked;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Run compare (from server or CLI). Returns the saved filename and full path. */
export async function runCompare(
  beforeUrl: string,
  afterUrl?: string
): Promise<{ filename: string; path: string }> {
  const beforeBuffer = await captureScreenshot(beforeUrl, {
    ...VIEWPORT,
    waitUntil: "networkidle0",
  });
  const beforeLabeled = await addLabel(beforeBuffer, "Before", false);

  let filename: string;
  let finalImage: Buffer;

  if (afterUrl?.startsWith("http")) {
    const afterBuffer = await captureScreenshot(afterUrl, {
      ...VIEWPORT,
      waitUntil: "networkidle0",
    });
    const afterLabeled = await addLabel(afterBuffer, "After", true);

    const beforeMeta = await sharp(beforeLabeled).metadata();
    const afterMeta = await sharp(afterLabeled).metadata();
    const totalWidth = (beforeMeta.width ?? 0) + (afterMeta.width ?? 0) + PADDING;
    const maxHeight = Math.max(
      beforeMeta.height ?? VIEWPORT.height,
      afterMeta.height ?? VIEWPORT.height
    );

    finalImage = await sharp({
      create: {
        width: totalWidth,
        height: maxHeight,
        channels: 3,
        background: { r: 30, g: 41, b: 59 },
      },
    })
      .png()
      .composite([
        { input: beforeLabeled, top: 0, left: 0 },
        { input: afterLabeled, top: 0, left: (beforeMeta.width ?? 0) + PADDING },
      ])
      .toBuffer();

    filename = `comparison-${slug(beforeUrl)}-${timestamp()}.png`;
  } else {
    filename = `screenshot-${slug(beforeUrl)}-${timestamp()}.png`;
    finalImage = beforeLabeled;
  }

  const outPath = join(OUTPUT_DIR, filename);
  const { mkdir, writeFile } = await import("fs/promises");
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(outPath, finalImage);
  return { filename, path: outPath };
}

async function main() {
  const beforeUrl = process.argv[2];
  const afterUrl = process.argv[3];

  if (!beforeUrl?.startsWith("http")) {
    console.error("Usage: npm run compare -- <beforeUrl> [afterUrl]");
    console.error("Example: npm run compare -- https://example.com https://redesign.example.com");
    process.exit(1);
  }

  console.log("Capturing Before:", beforeUrl);
  const result = await runCompare(beforeUrl, afterUrl);
  console.log("Saved →", result.path);
}

const runAsCli = process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("compare.ts"));
if (runAsCli) {
  main().catch((e) => {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
