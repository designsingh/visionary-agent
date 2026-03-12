# Visionary – Autonomous Design Scout

Automate the sales funnel for local business redesigns: analyze sites with Cloudflare Browser Rendering `/json`, generate modern mockups with the v0 Platform API, and produce side-by-side before/after screenshots.

## Tech stack (2026)

- **Analysis**: Cloudflare Browser Rendering `/json` (AI-powered structured extraction)
- **Redesign**: Vercel v0 Platform API (`v0-sdk`)
- **Visuals**: Cloudflare `/screenshot` for before/after captures
- **Runtime**: Node 22+ (CLI); optional Cloudflare Workers later

## Quick start

1. **Clone and install**
   ```bash
   cd visionary-agent && npm install
   ```

2. **Configure env**
   ```bash
   cp .env.example .env
   ```
   Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (token needs **Browser Rendering - Edit**). Get account ID from the Cloudflare dashboard URL; create a token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).

3. **Run the scout (analyze a URL)**
   ```bash
   npm run scout -- https://www.google.com
   ```
   Or any URL:
   ```bash
   npm run scout -- https://example.com
   ```

The scout prints extracted branding: `businessName`, `primaryColors`, `services`, `tagline`, `targetAudience`.

## Pipeline (generate-pitch)

1. **Scout** (this repo) – `scout.ts` uses CF `/json` to extract branding from a URL.
2. **Redesign** – Call v0 with the “Redesign Logic” prompt and generated Bento-style landing page.
3. **Compare** – `compare.ts` uses CF `/screenshot` for one or two URLs and saves a side-by-side PNG to `output/` (with Before/After labels).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run scout -- <url>` | Analyze URL with Cloudflare `/json`, print branding JSON. |
| `npm run compare -- <beforeUrl> [afterUrl]` | Screenshot one or two URLs via CF `/screenshot`, save side-by-side PNG to `output/`. |
| `npm run ui` | Start the web UI at http://localhost:3333 (analyze, generate pitch, compare, gallery). |
| `npm run dev` | Watch mode for `scout.ts`. |

## Design principles

- Redesigns: design leadership (clear hierarchy, contrast, mobile-first).
- Use the site’s real services in the layout; no generic hero copy.
- Footer: “Verified by DesignX” badge.

## Web UI

Run `npm run ui` and open **http://localhost:3333**. You get:

- **Analyze** – Scout a URL (CF `/json`) and see branding JSON.
- **Generate pitch** – Run the full pipeline: capture screenshot → Gemini Brain (Design Director) → v0 build. Returns brain JSON and links to v0 chat + preview.
- **Compare** – Capture before/after screenshots or side-by-side; images saved to `output/`.
- **Output** – Gallery of screenshots and comparisons.

## Push to GitHub

1. **Create a new repo** on GitHub (e.g. `visionary-agent`). Do not add a README or .gitignore there.

2. **From this directory:**
   ```bash
   git add .
   git commit -m "Visionary: scout, compare, UI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/visionary-agent.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username (or use the repo URL GitHub shows).

3. **Secrets:** Never commit `.env`. It’s in `.gitignore`. For CI or deployment, set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as repository secrets.

## Env reference

| Variable | Required for | Description |
|----------|--------------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Capture, scout, compare | Cloudflare account ID. |
| `CLOUDFLARE_API_TOKEN` | Capture, scout, compare | API token with Browser Rendering - Edit. |
| `GEMINI_API_KEY` | Generate pitch (Brain) | From [Google AI Studio](https://aistudio.google.com/apikey). |
| `GEMINI_MODEL` | Optional | Default `gemini-2.5-pro`. Set to `gemini-3.1-pro-preview` for 3.1 Pro. |
| `V0_API_KEY` | Generate pitch (Build) | From [v0.dev/chat/settings/keys](https://v0.dev/chat/settings/keys). |
