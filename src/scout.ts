#!/usr/bin/env npx tsx
/**
 * Visionary Design Scout – Step 1
 * Uses Cloudflare Browser Rendering /json endpoint to analyze a URL and extract
 * branding data: businessName, primaryColors, services, tagline, targetAudience.
 *
 * Usage: npm run scout -- <url>
 * Example: npm run scout -- https://www.google.com
 */

import "dotenv/config";
import { fileURLToPath } from "url";
import Cloudflare from "cloudflare";

const __filename = fileURLToPath(import.meta.url);

/** Response format for Cloudflare /json – SDK expects type + json_schema. */
const BRANDING_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    type: "object",
    properties: {
      businessName: { type: "string", description: "Primary brand or site name" },
      primaryColors: {
        type: "array",
        items: { type: "string" },
        description: "Hex or named colors dominant on the page (e.g. #4285F4, blue)",
      },
      services: {
        type: "array",
        items: { type: "string" },
        description: "Products, services, or main offerings listed or implied",
      },
      tagline: { type: "string", description: "Short tagline or value proposition if present" },
      targetAudience: { type: "string", description: "Who the site appears to target (e.g. consumers, developers)" },
    },
    required: ["businessName"],
    additionalProperties: false,
  },
} as const;

const BRANDING_PROMPT = `Analyze this webpage as if it were a local business or product site.
Extract: the main business or brand name; up to 5 primary colors (hex or names) used in the design;
any listed services, products, or offerings; a short tagline or value proposition if visible;
and the apparent target audience. For generic or non-business pages, infer from content and layout.`;

export type BrandingData = {
  businessName: string;
  primaryColors?: string[];
  services?: string[];
  tagline?: string;
  targetAudience?: string;
};

export async function analyzeWithCloudflareJson(url: string): Promise<BrandingData> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN. Copy .env.example to .env and set values."
    );
  }

  const client = new Cloudflare({ apiToken });

  const response = await client.browserRendering.json.create({
    account_id: accountId,
    url,
    prompt: BRANDING_PROMPT,
    response_format: BRANDING_RESPONSE_FORMAT,
  });

  const result = response.result as BrandingData | null | undefined;
  if (result != null && typeof result === "object" && typeof result.businessName === "string") {
    return result;
  }

  const err = response as { success?: boolean; errors?: unknown[] };
  throw new Error(
    "Cloudflare /json request failed: " + JSON.stringify(err.errors ?? result ?? response)
  );
}

async function main() {
  const url =
    process.argv[2] ?? "https://www.google.com";

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("Usage: npm run scout -- <url>");
    console.error("Example: npm run scout -- https://www.google.com");
    process.exit(1);
  }

  console.log("Visionary Scout – analyzing:", url);
  console.log("");

  try {
    const data = await analyzeWithCloudflareJson(url);
    console.log("Extracted branding data:");
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

const runAsCli = process.argv[1] && (process.argv[1] === __filename || process.argv[1].endsWith("scout.ts"));
if (runAsCli) main();
