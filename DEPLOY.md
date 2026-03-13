# Deploying PageGrab

## What is VITE_API_URL?

**VITE_API_URL** = the URL of your backend server.

- **Netlify** only hosts static files (HTML, JS, CSS). It has no Node server.
- Your **crawl** and **screenshot** APIs need a real server (they take 1–2 minutes).
- So the backend runs on **Railway** (e.g. `https://visionary-api-production.up.railway.app`).
- The frontend needs to know: "when I call the API, hit that URL."
- `VITE_API_URL` is set at build time – e.g. `https://visionary-api-production.up.railway.app`
- Then `fetch(\`${VITE_API_URL}/api/scraper/crawl\`)` becomes `fetch('https://visionary-api-production.up.railway.app/api/scraper/crawl')`

**When running locally:** No `VITE_API_URL` – frontend and backend are same origin (localhost:3333), so `/api/...` works.

---

## Option A: Deploy everything to Railway (simplest)

One deployment. No VITE_API_URL needed. Frontend + API served from the same URL.

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Connect **designsingh/visionary-agent** and select the repo
3. Railway will use `railway.json`. If not, set:
   - **Build:** `npm install && npm run build:scraper`
   - **Start:** `npx tsx src/server.ts`
4. Add env vars in **Variables**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
5. Deploy. Railway assigns a URL like `https://visionary-agent-production.up.railway.app` (or your custom domain).

---

## Option B: Netlify (frontend) + Railway (backend)

Frontend on Netlify, backend on Railway. Needs `VITE_API_URL`.

1. **Railway** (backend): same as Option A. Copy your Railway URL from the service dashboard (e.g. `https://visionary-api-production.up.railway.app`).
2. **Netlify** → Site settings → Environment variables:
   - Add `VITE_API_URL` = your Railway URL (no trailing slash)
3. Trigger a **new deploy** in Netlify (so the build uses the new env var).

---

## Railway env vars

Add these in the Railway service **Variables** tab:

| Variable | Required | Notes |
|----------|----------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Yes | For crawl + screenshot |
| `CLOUDFLARE_API_TOKEN` | Yes | For crawl + screenshot |
| `GEMINI_API_KEY` | No | For Visionary pipeline |
| `V0_API_KEY` | No | For v0 redesign |

---

## Railway vs Render

- **Railway** keeps services warm longer; no forced spin-down after 15 min.
- Railway uses `PORT` automatically – your server already reads `process.env.PORT`.
