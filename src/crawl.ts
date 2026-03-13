/**
 * Cloudflare Browser Rendering /crawl endpoint.
 * Crawls a site and returns markdown content for each page.
 * @see https://developers.cloudflare.com/browser-rendering/rest-api/crawl-endpoint/
 */

import "dotenv/config";

const BASE = "https://api.cloudflare.com/client/v4";

export interface CrawlRecord {
  url: string;
  status: string;
  html?: string;
  markdown?: string;
  metadata?: { status: number; title?: string; url?: string };
}

export interface CrawlResult {
  id: string;
  status: string;
  total: number;
  finished: number;
  records: CrawlRecord[];
}

export interface CrawlOptions {
  limit?: number;
  depth?: number;
  render?: boolean;
  formats?: ("html" | "markdown" | "json")[];
}

/**
 * Start a crawl job and poll until completion. Returns records with markdown.
 * Uses limit=15, depth=2 by default for trades sites (fast, relevant pages).
 */
export async function runCrawl(
  url: string,
  options: CrawlOptions = {}
): Promise<CrawlResult | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
  }

  const { limit = 15, depth = 2, render = true, formats = ["markdown"] } = options;

  const initRes = await fetch(`${BASE}/accounts/${accountId}/browser-rendering/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      limit,
      depth,
      render,
      formats,
    }),
  });

  if (!initRes.ok) {
    const text = await initRes.text();
    throw new Error(`Crawl init failed ${initRes.status}: ${text}`);
  }

  const init = (await initRes.json()) as { success?: boolean; result?: string };
  const jobId = init.result;
  if (!jobId || typeof jobId !== "string") {
    throw new Error("Crawl init did not return job ID");
  }

  const maxAttempts = 36;
  const delayMs = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    const statusRes = await fetch(
      `${BASE}/accounts/${accountId}/browser-rendering/crawl/${jobId}?limit=1`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );

    if (!statusRes.ok) continue;

    const statusData = (await statusRes.json()) as { result?: { status?: string } };
    const status = statusData.result?.status;

    if (status !== "running") {
      const fullRes = await fetch(
        `${BASE}/accounts/${accountId}/browser-rendering/crawl/${jobId}?status=completed`,
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );
      if (!fullRes.ok) return null;
      const full = (await fullRes.json()) as { result?: CrawlResult };
      return full.result ?? null;
    }
  }

  return null;
}

/**
 * Run crawl with progress callback - call onProgress with new URLs as they're discovered.
 * Fetches completed records on each poll so we can stream them to the client.
 */
export async function runCrawlWithProgress(
  url: string,
  options: CrawlOptions & { onProgress?: (records: CrawlRecord[]) => void } = {}
): Promise<CrawlResult | null> {
  const { onProgress, ...opts } = options;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
  }

  const { limit = 15, depth = 2, render = true, formats = ["markdown"] } = opts;

  const initRes = await fetch(`${BASE}/accounts/${accountId}/browser-rendering/crawl`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, limit, depth, render, formats }),
  });

  if (!initRes.ok) {
    const text = await initRes.text();
    throw new Error(`Crawl init failed ${initRes.status}: ${text}`);
  }

  const init = (await initRes.json()) as { success?: boolean; result?: string };
  const jobId = init.result;
  if (!jobId || typeof jobId !== "string") {
    throw new Error("Crawl init did not return job ID");
  }

  const maxAttempts = 36;
  const delayMs = 3000;
  let lastSeen = 0;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, delayMs));

    // Fetch completed records (may return partial results while running)
    const recordsRes = await fetch(
      `${BASE}/accounts/${accountId}/browser-rendering/crawl/${jobId}?status=completed&limit=200`,
      { headers: { Authorization: `Bearer ${apiToken}` } }
    );

    if (recordsRes.ok) {
      const data = (await recordsRes.json()) as { result?: CrawlResult };
      const result = data.result;
      if (result?.records?.length && result.records.length > lastSeen && onProgress) {
        const newRecords = result.records.slice(lastSeen);
        lastSeen = result.records.length;
        onProgress(newRecords);
      }
      if (result?.status && result.status !== "running") {
        // Job finished - fetch full result (without status filter) for complete data
        const fullRes = await fetch(
          `${BASE}/accounts/${accountId}/browser-rendering/crawl/${jobId}?limit=200`,
          { headers: { Authorization: `Bearer ${apiToken}` } }
        );
        if (fullRes.ok) {
          const fullData = (await fullRes.json()) as { result?: CrawlResult };
          return fullData.result ?? result;
        }
        return result;
      }
    }
  }

  return null;
}

/**
 * Format crawl records as a single markdown string for the Brain.
 */
export function formatCrawlForBrain(records: CrawlRecord[]): string {
  return records
    .filter((r) => r.markdown && r.status === "completed")
    .map((r) => `## ${r.url}\n${r.metadata?.title ?? ""}\n\n${r.markdown}`)
    .join("\n\n---\n\n");
}
