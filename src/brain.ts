/**
 * THE BRAIN – Gemini 3.1 Pro as Design Director & Copywriter.
 * Analyzes a legacy site screenshot + URL and returns structured brief for v0.
 */

import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export interface GeminiService {
  title: string;
  description: string;
}

export interface GeminiBrainOutput {
  businessName: string;
  primaryColorHex: string;
  secondaryColorHex?: string;
  heroH1: string;
  heroSubtext: string;
  services: GeminiService[];
  contentHierarchy?: string;
  v0DesignPrompt: string;
}

const DESIGN_DIRECTOR_PROMPT = `You are a Senior Product Designer analyzing the screenshot of an existing business website.

CRITICAL CONSTRAINT: This is a VISUAL REDESIGN only. You must preserve:
- The EXACT SAME CONTENT HIERARCHY: same sections, same order, same headings, same copy. Do not add, remove, or reorder sections.
- The LOGO: it cannot change. Identify it and instruct the generator to keep/use it as-is.
- PRIMARY and SECONDARY brand colors: extract what they actually use. Do not suggest new colors. The redesign must use these exact hues.

Your job is to create a brief for a VISUAL redesign — better typography, spacing, contrast, polish — while keeping structure, content, logo, and colors intact.

Return a strict JSON object with exactly these fields (no extra fields, no markdown, no code fence):
- businessName: string (canonical business name from the site)
- primaryColorHex: string (the main brand color used on the site — extract the hex. Use exactly what you see.)
- secondaryColorHex: string (a secondary/accent color from the site if present; otherwise a complementary shade derived from primary, e.g. darker/lighter)
- heroH1: string (the main headline EXACTLY as it appears on the site)
- heroSubtext: string (the supporting text under the hero EXACTLY as it appears, or empty string if none)
- services: array of objects with { "title": string, "description": string } — extract EXACTLY what the site shows. If they list 4 services, return 4. If 5, return 5. Use their wording.
- contentHierarchy: string (a bullet list describing the sections in order as they appear: e.g. "Hero with H1 and CTA, Services grid, Testimonials, Contact/Footer")
- v0DesignPrompt: string (a strict instruction for a UI generator). It must say: (1) PRESERVE the exact content hierarchy and section order — do not add, remove, or reorder sections, (2) KEEP the logo as-is — place it in the header, do not redesign it, (3) USE these exact colors: primaryColorHex and secondaryColorHex — no other brand colors, (4) Apply a VISUAL upgrade only: cleaner typography (Inter or system sans), better spacing and padding, improved contrast and readability, subtle shadows/borders where appropriate, modern but not techy. Same structure, same copy, same colors — just better visual execution. Write as one paragraph.`;

const BRAIN_JSON_SCHEMA = {
  type: "object",
  properties: {
    businessName: { type: "string" },
    primaryColorHex: { type: "string" },
    secondaryColorHex: { type: "string" },
    heroH1: { type: "string" },
    heroSubtext: { type: "string" },
    services: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
      minItems: 1,
    },
    contentHierarchy: { type: "string" },
    v0DesignPrompt: { type: "string" },
  },
  required: ["businessName", "primaryColorHex", "heroH1", "heroSubtext", "services", "v0DesignPrompt"],
  additionalProperties: false,
};

/**
 * Run the Brain: screenshot buffer + URL → Gemini → structured JSON brief.
 */
export async function designDirector(screenshotBuffer: Buffer, url: string): Promise<GeminiBrainOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env");
  }

  const ai = new GoogleGenAI({ apiKey });
  const imageBase64 = screenshotBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model,
    contents: [
      { text: `${DESIGN_DIRECTOR_PROMPT}\n\nURL of the site: ${url}` },
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: BRAIN_JSON_SCHEMA,
    },
  });

  const raw = response.text;
  if (!raw || typeof raw !== "string") {
    throw new Error("Gemini returned no text");
  }

  const parsed = JSON.parse(raw.trim()) as GeminiBrainOutput;
  if (!parsed.businessName || !parsed.v0DesignPrompt || !Array.isArray(parsed.services) || parsed.services.length < 1) {
    throw new Error("Gemini response missing required fields or invalid services array");
  }

  return parsed;
}
