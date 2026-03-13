# Deploying PageGrab / Visionary

The scraper needs a **long-running backend** (crawls take 1–2 min). Netlify serverless functions time out at ~26s, so we use:

- **Netlify** – frontend (static)
- **Render** – backend (Node/Express)

## 1. Deploy backend to Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → New → Web Service.
3. Connect your repo, choose the `visionary-agent` directory if it’s in a monorepo.
4. Render will detect `render.yaml`. Otherwise set:
   - **Build command:** `npm install && npm run build:scraper`
   - **Start command:** `npx tsx src/server.ts`
5. Add environment variables (Dashboard → Environment):
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `GEMINI_API_KEY` (optional, for Visionary)
   - `V0_API_KEY` (optional, for Visionary)
6. Deploy. Copy your backend URL (e.g. `https://visionary-api-xxx.onrender.com`).

## 2. Deploy frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git.
2. Connect the same repo.
3. Settings:
   - **Base directory:** `visionary-agent` (if repo root is higher)
   - **Build command:** `npm run build:scraper`
   - **Publish directory:** `visionary-agent/public` or `public`
4. **Environment variables** → add:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://visionary-api-xxx.onrender.com`)
5. Deploy.

The frontend will call the backend at `VITE_API_URL`. If `VITE_API_URL` is unset, it uses relative `/api` (same-origin), which only works when frontend and backend are served together (e.g. localhost).

## 3. CORS

The Render backend must allow the Netlify frontend origin. Add CORS in `src/server.ts` if you see cross-origin errors.
