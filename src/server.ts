/**
 * Visionary UI – web server for scout, compare, and gallery.
 * Run: npm run ui
 */

import "dotenv/config";
import express from "express";
import { readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { analyzeWithCloudflareJson } from "./scout.js";
import { runCompare, OUTPUT_DIR } from "./compare.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const outputDir = join(root, OUTPUT_DIR);

const app = express();
app.use(express.json());

// Static: UI and output images
app.use(express.static(publicDir));
app.use("/output", express.static(outputDir));

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

const PORT = Number(process.env.PORT) || 3333;
app.listen(PORT, () => {
  console.log(`Visionary UI → http://localhost:${PORT}`);
});
