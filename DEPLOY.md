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

### Via Netlify UI

1. **Railway** (backend): same as Option A. Copy your Railway URL from the service dashboard (e.g. `https://visionary-api-production.up.railway.app`).
2. **Netlify** → Site settings → Environment variables:
   - Add `VITE_API_URL` = your Railway URL (no trailing slash)
3. **Netlify** → Site settings → Build & deploy → Link repository (if not already connected)
4. Trigger a **new deploy** in Netlify (so the build uses the new env var).

### Via Netlify CLI

From the project root (where `netlify.toml` lives):

```bash
# 1. Install and log in (opens browser)
npm i -g netlify-cli
netlify login

# 2. Create site + connect GitHub repo (opens browser for GitHub auth if needed)
netlify init

# 3. Set build env var (VITE_API_URL is also in .env.production; this overrides for UI)
netlify env:set VITE_API_URL "https://visionary-api-production.up.railway.app"

# 4. Deploy
netlify deploy --prod
```

**Notes:**

- `netlify init` creates a new site (or links to existing), configures build from `netlify.toml`, and **connects the GitHub repo** for continuous deployment. It will prompt for GitHub access.
- `netlify link` only links a folder to an existing site – it does **not** connect the repo. Use `netlify init` for full CI/CD setup.
- `netlify env:set` pushes vars to Netlify’s UI; `scraper-ui/.env.production` also embeds `VITE_API_URL` at build time.
- `netlify deploy --prod` does a one-off deploy. After `init`, pushes to the connected repo will auto-deploy.

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

---

## Troubleshooting

### "Authentication error" (401) from Cloudflare

Railway returns `500` with `"Authentication error"` from Cloudflare. Fix:

1. **Token permissions** – In [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens), create a token with **Browser Rendering - Edit**.
2. **Account ID** – Copy from Cloudflare dashboard (right sidebar).
3. **Railway** – Update `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, then redeploy.

### "Unexpected token '<'" (JSON parse error)

Frontend expected JSON but got HTML. Usually means `VITE_API_URL` was empty at build time, so requests hit Netlify (HTML) instead of Railway. Fix: ensure `scraper-ui/.env.production` exists with `VITE_API_URL` and redeploy Netlify.

### Netlify production deploy locked

If `netlify deploy --prod` says "Deployments are locked", new builds won’t publish to the live site.

1. **Netlify** → Site settings → **Build & deploy** → **Deploy locks** → disable "Lock production deploys".
2. Then: **Deploys** → **Trigger deploy** → **Deploy site**, or run `netlify deploy --prod` from the project.
