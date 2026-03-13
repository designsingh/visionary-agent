#!/usr/bin/env npx tsx
/**
 * Standalone site scraper – crawls a URL and saves all pages (HTML + Markdown) to a folder.
 * Output: ~/Downloads/scraped-sites/{domain}-{timestamp}/
 *
 * Usage: npx tsx scripts/scrape-site.ts <url> [--output /path/to/folder] [--limit 50]
 */

import "dotenv/config";
import { homedir } from "os";
import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { runCrawl } from "../src/crawl.js";

function urlToPath(url: string, baseHost: string): string {
  try {
    const u = new URL(url);
    if (u.origin !== baseHost) return ""; // skip external
    let path = u.pathname || "/";
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    if (path === "/") return "index";
    return path.slice(1).replace(/\/+/g, "/");
  } catch {
    return "";
  }
}

function sanitizeFilename(s: string): string {
  return s.replace(/[<>:"|?*]/g, "-").replace(/\.\./g, "-");
}

async function main() {
  const args = process.argv.slice(2);
  const urlIdx = args.findIndex((a) => !a.startsWith("--"));
  const url = args[urlIdx];
  const outIdx = args.indexOf("--output");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) || 50 : 50;

  if (!url?.startsWith("http")) {
    console.error("Usage: npx tsx scripts/scrape-site.ts <url> [--output /path] [--limit 50]");
    process.exit(1);
  }

  const baseHost = new URL(url).origin;
  const domain = new URL(url).hostname.replace(/\./g, "-");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const defaultOut = join(homedir(), "Downloads", "scraped-sites", `${domain}-${timestamp}`);
  const outputDir = outIdx >= 0 ? args[outIdx + 1] : defaultOut;

  await mkdir(outputDir, { recursive: true });
  console.log("Scraping:", url);
  console.log("Output:  ", outputDir);

  const result = await runCrawl(url, {
    limit,
    depth: 5,
    formats: ["html", "markdown"],
  });

  if (!result?.records?.length) {
    console.error("Crawl returned no pages.");
    process.exit(1);
  }

  let saved = 0;
  for (const rec of result.records) {
    if (rec.status !== "completed") continue;

    const relPath = urlToPath(rec.url, baseHost);
    if (!relPath) continue;

    const safePath = sanitizeFilename(relPath);
    const dir = join(outputDir, safePath.split("/").slice(0, -1).join("/"));
    const base = safePath.split("/").pop() || "index";

    await mkdir(dir, { recursive: true });

    if (rec.html) {
      const htmlPath = join(dir, base ? `${base}.html` : "index.html");
      await writeFile(htmlPath, rec.html, "utf-8");
      saved++;
    }
    if (rec.markdown) {
      const mdPath = join(dir, base ? `${base}.md` : "index.md");
      await writeFile(mdPath, rec.markdown, "utf-8");
    }
  }

  await writeFile(join(outputDir, "_manifest.json"), JSON.stringify({
    url,
    crawledAt: new Date().toISOString(),
    pageCount: result.records.filter((r) => r.status === "completed").length,
    records: result.records.map((r) => ({ url: r.url, status: r.status })),
  }, null, 2), "utf-8");

  console.log(`Saved ${saved} pages to ${outputDir}`);
  console.log("Done.");
}

main().catch((e) => {
  console.error("Error:", e instanceof Error ? e.message : e);
  process.exit(1);
});
