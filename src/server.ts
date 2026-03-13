/**
 * Visionary UI – web server for scout, compare, and gallery.
 * Run: npm run ui
 */

import "dotenv/config";
import cors from "cors";
import express from "express";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { analyzeWithCloudflareJson } from "./scout.js";
import { runCompare, OUTPUT_DIR } from "./compare.js";
import { generatePitch, type PipelineStep } from "./pipeline.js";
import { runCrawl, runCrawlWithProgress, type CrawlRecord } from "./crawl.js";
import { captureScreenshot } from "./screenshot.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const outputDir = join(root, OUTPUT_DIR);

const app = express();
app.use(cors());
app.use(express.json());

// Static: output images
app.use("/output", express.static(outputDir));
// UI: Scraper at / (homepage), Visionary at /visionary
app.use(express.static(publicDir));
app.get("/visionary", (_req, res) => {
  res.sendFile(join(publicDir, "visionary.html"));
});

// API: list comparison/screenshot images
app.get("/api/output", async (_req, res) => {
  try {
    const files = await readdir(outputDir).catch(() => []);
    const pngs = files.filter((f) => f.endsWith(".png")).sort().reverse();
    res.json({ files: pngs.map((name) => ({ name, url: `/output/${name}` })) });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// API: analyze URL (scout)
app.post("/api/scout", async (req, res) => {
  const url = req.body?.url;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url in body" });
  }
  if (!url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid url" });
  }
  try {
    const data = await analyzeWithCloudflareJson(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// API: run compare (screenshot or side-by-side)
app.post("/api/compare", async (req, res) => {
  const beforeUrl = req.body?.beforeUrl;
  const afterUrl = req.body?.afterUrl;
  if (!beforeUrl || typeof beforeUrl !== "string") {
    return res.status(400).json({ error: "Missing beforeUrl in body" });
  }
  if (!beforeUrl.startsWith("http")) {
    return res.status(400).json({ error: "Invalid beforeUrl" });
  }
  try {
    const result = await runCompare(beforeUrl, afterUrl?.startsWith("http") ? afterUrl : undefined);
    res.json({ filename: result.filename, url: `/output/${result.filename}` });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// API: generate pitch (SSE stream – CAPTURE → BRAIN → BUILD → COMPARE)
app.get("/api/generate-pitch", async (req, res) => {
  const url = req.query.url as string | undefined;
  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "Missing or invalid ?url= query param" });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (step: PipelineStep) => {
    res.write(`data: ${JSON.stringify(step)}\n\n`);
  };

  try {
    await generatePitch(url, send);
  } catch (e) {
    send({ step: "error", message: e instanceof Error ? e.message : String(e) });
  }

  res.end();
});

// --- Scraper platform API ---

function sameSite(url: string, baseUrl: string): boolean {
  try {
    const a = new URL(url).hostname.replace(/^www\./, "");
    const b = new URL(baseUrl).hostname.replace(/^www\./, "");
    return a === b;
  } catch {
    return false;
  }
}

function recordToDiscovered(rec: CrawlRecord, baseUrl: string): { path: string; title: string; size: string; selected: boolean } | null {
  try {
    if (!sameSite(rec.url, baseUrl)) return null;
    const u = new URL(rec.url);
    let path = u.pathname || "/";
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    const pathStr = path === "/" ? "/" : path;
    const size = rec.html ? `${Math.round(rec.html.length / 1024)} KB` : "—";
    const title = rec.metadata?.title || (pathStr === "/" ? "Homepage" : pathStr.slice(1).split("/").pop() || pathStr);
    return {
      path: pathStr,
      title,
      size,
      selected: true,
    };
  } catch {
    return null;
  }
}

// GET /api/scraper/crawl-stream?url=xxx - SSE stream, sends urls as they're found, then final result
app.get("/api/scraper/crawl-stream", async (req, res) => {
  const url = req.query.url as string;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Missing or invalid url query param" });
  }
  const limit = Math.min(50, parseInt((req.query.limit as string) || "30", 10));
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();
  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (typeof (res as { flush?: () => void }).flush === "function") (res as { flush: () => void }).flush();
  };
  send("started", {});
  const heartbeat = setInterval(() => send("ping", {}), 8000);
  try {
    const result = await runCrawlWithProgress(url, {
      limit,
      depth: 5,
      formats: ["html", "markdown"],
      onProgress: (records) => {
        records.forEach((r) => {
          if (r.status === "completed" && r.url) {
            send("url", { url: r.url, title: r.metadata?.title });
          }
        });
      },
    });
    if (!result?.records?.length) {
      const jobStatus = result?.status || "unknown";
      const msg =
        jobStatus === "errored"
          ? "The crawl encountered an error. This site may block automated access (e.g. banks, secure portals)."
          : jobStatus === "cancelled_due_to_timeout"
            ? "The crawl timed out. Try a smaller site or reduce the page limit."
            : "No pages could be extracted. This site may block crawlers or require JavaScript that didn't load in time.";
      clearInterval(heartbeat);
      send("crawl_error", { error: msg });
    } else {
      clearInterval(heartbeat);
      const pages = result.records
        .map((r) => recordToDiscovered(r, url))
        .filter((p): p is NonNullable<typeof p> => p !== null);
      const records = result.records
        .filter((r) => r.status === "completed" && sameSite(r.url, url))
        .map((r) => {
          const u = new URL(r.url);
          let path = u.pathname || "/";
          if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
          return { path: path || "/", html: r.html, markdown: r.markdown, url: r.url };
        });
      send("done", { pages, records });
    }
  } catch (e) {
    clearInterval(heartbeat);
    send("crawl_error", { error: e instanceof Error ? e.message : "Crawl failed" });
  }
  res.end();
});

// POST /api/scraper/crawl - crawl URL, return pages + full content (html, markdown)
app.post("/api/scraper/crawl", async (req, res) => {
  const url = req.body?.url;
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return res.status(400).json({ error: "Missing or invalid url" });
  }
  const limit = Math.min(50, parseInt(req.body?.limit, 10) || 30);
  try {
    const result = await runCrawlWithProgress(url, { limit, depth: 5, formats: ["html", "markdown"] });
    if (!result?.records?.length) {
      const jobStatus = result?.status || "unknown";
      const msg =
        jobStatus === "errored"
          ? "This site may block automated access (e.g. banks, secure portals). Try a different URL."
          : jobStatus === "cancelled_due_to_timeout"
            ? "The crawl timed out. Try a smaller site."
            : "No pages could be extracted. This site may block crawlers.";
      return res.status(500).json({ error: msg });
    }
    const pages = result.records
      .map((r) => recordToDiscovered(r, url))
      .filter((p): p is NonNullable<typeof p> => p !== null);
    const records = result.records
      .filter((r) => r.status === "completed" && sameSite(r.url, url))
      .map((r) => {
        const u = new URL(r.url);
        let path = u.pathname || "/";
        if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
        const pathStr = path || "/";
        return { path: pathStr, html: r.html, markdown: r.markdown, url: r.url };
      });
    res.json({ pages, records });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// POST /api/scraper/screenshots - capture screenshots for URLs, return base64
app.post("/api/scraper/screenshots", async (req, res) => {
  const urls = req.body?.urls;
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 50) {
    return res.status(400).json({ error: "urls must be an array of 1-50 URLs" });
  }
  try {
    const results: Record<string, string> = {};
    for (const url of urls) {
      if (typeof url !== "string" || !url.startsWith("http")) continue;
      try {
        const buf = await captureScreenshot(url, { fullPage: true });
        results[url] = buf.toString("base64");
      } catch {
        results[url] = "";
      }
    }
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

// Scraper SPA: fallback for client-side routes (must be last)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/output")) return next();
  res.sendFile(join(publicDir, "index.html"));
});

const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Visionary UI → http://localhost:${PORT}`);
  console.log(`            → http://127.0.0.1:${PORT}`);
}).on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is in use. Try: PORT=${PORT + 1} npm run ui`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
