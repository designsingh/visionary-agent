/**
 * Capture a screenshot of a URL using Cloudflare Browser Rendering /screenshot.
 * Uses fetch so we get the raw PNG response body (SDK returns JSON).
 */

import "dotenv/config";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BASE = "https://api.cloudflare.com/client/v4";

export interface CaptureOptions {
  /** Viewport width (default 1280) */
  width?: number;
  /** Viewport height (default 720) */
  height?: number;
  /** Full-page scroll capture */
  fullPage?: boolean;
  /** Wait until network idle before capture */
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
}

/**
 * Capture a single URL and return the PNG as a Buffer.
 */
export async function captureScreenshot(
  url: string,
  options: CaptureOptions = {}
): Promise<Buffer> {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    throw new Error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env"
    );
  }

  const {
    width = 1280,
    height = 720,
    fullPage = false,
    waitUntil = "networkidle0",
  } = options;

  const endpoint = `${BASE}/accounts/${CF_ACCOUNT_ID}/browser-rendering/screenshot`;
  const body = {
    url,
    viewport: { width, height },
    screenshotOptions: { type: "png" as const, fullPage },
    gotoOptions: { waitUntil, timeout: 30000 },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Screenshot failed ${res.status}: ${text}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("image")) {
    const text = await res.text();
    throw new Error(`Expected image response, got: ${contentType} - ${text.slice(0, 200)}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
