# Deploying on Railway

Railway is the only host. One service runs the whole app: the built SPA, the two AI endpoints and a
health check, from a single Node process (`server/index.js`).

## What runs

| Piece | Where | Notes |
|-------|-------|-------|
| Build | `railway.json` → `npm run build` | Railpack detects Node from `package.json` `engines` / `.nvmrc` (22). |
| Start | `npm start` → `server/index.js` | Listens on `$PORT` (Railway sets it). |
| Static files | `dist/` | Hashed `assets/` cached for a year; `index.html`, `sw.js`, manifest and `content/` revalidate. Unknown paths without an extension fall back to `index.html`. |
| API | `/api/plan-learning-path`, `/api/generate-lesson` | Same handlers as before, routed by `server/app.js`. `Cache-Control: no-store`. |
| Health | `/healthz` | Railway waits for `200` before switching traffic to a new deploy. |
| Headers | every response | `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` (moved from the old `vercel.json`). |

`npm run dev:api` uses the same `server/app.js` (API only, with CORS), so local and production
routing can't drift.

## One-time setup (Railway dashboard)

1. **New Project → Deploy from GitHub repo →** `sakshamgoyal06/history_scroller`, branch `main`.
   Railway picks up `railway.json`; no build or start command needs typing in.
2. **Variables:** add `OPENAI_API_KEY` and `OPENAI_MODEL`. `PORT` is set by Railway, don't add it.
   Use a separate OpenAI key (and project spend limit) for Railway, then revoke the old Vercel key.
3. **Settings → Networking → Generate Domain** to get a `*.up.railway.app` URL. Open it, check the
   feed loads and one "Learn a Topic" request works.
4. **Custom domain (if any):** Settings → Networking → Custom Domain, then add the CNAME Railway shows
   at your DNS provider. Remove the old Vercel DNS records at the same time.
5. **Replicas: keep 1.** The rate limiter is in memory (see below).
6. **Turn off Vercel:** once the Railway URL works, delete the Vercel project (or at least disconnect
   its Git integration so pushes stop deploying there) and delete its environment variables.

## Limits that matter

- **Always on, billed by usage.** Unlike Vercel functions, the service runs continuously. Railway
  charges for CPU/RAM time; this app idles at low memory. Set a usage limit under Workspace →
  Usage so a bug can't surprise you.
- **5-minute idle cutoff.** Railway closes an HTTP request after 5 minutes with no bytes sent.
  `generate-lesson` answers in one response inside its 280 s budget, so it fits, with little room.
  Moving generation to a background job (engineering review P1) removes this limit.
- **In-memory throttle.** `lib/serverUtils.js` counts requests per client IP in process memory,
  keyed on Railway's `X-Real-IP`. It resets on every deploy and is wrong with more than one
  replica. It is not a spend control: build plan M0.1 (identity, shared limiter, quotas, spend cap,
  kill switch) is still required before any public launch.
- **Redeploys drain.** `drainingSeconds: 300` lets in-flight lessons finish before the old
  instance is stopped.

## Preview environments

Vercel gave a preview URL per PR. On Railway, enable **PR Environments** in project settings to get
the same; each one needs the OpenAI variables (use a low-limit key) or it will answer
`MISSING_CONFIGURATION`, which the client already handles.

## Rolling back

Deployments → pick the last good one → **Redeploy**. Config is in the repo, so reverting the
commit on `main` also works.
