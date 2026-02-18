# Sports Calendar MVP (Next.js + Vercel)

A personalized sports calendar web app with a clean Google Calendar / Outlook style UI.

## Why events were blank in production (root cause)
The empty calendar issue on Vercel was caused by runtime fragility in server-side ingestion:
- cache writes were targeting a repo path (`server/data/events-cache.json`) that is not reliably writable in serverless
- config/sample file reads depended on filesystem paths that can be brittle in bundled serverless output

This version fixes that by:
- using in-code feed config + in-code sample fallback events
- writing runtime cache to `/tmp` (safe writable location on Vercel functions)
- always returning sample fallback events if all live feeds fail
- generating rolling fallback sample dates near current time so the month view is visibly populated

## Sports included
- NY Mets (MLB)
- NY Giants (NFL)
- Formula 1
- NASCAR
- UCI WorldTour Cycling

## Features
- Views: **Month / Week / Day / Agenda**.
- Filters by sport category.
- Search by team/race name.
- Unified normalized event schema:
  `{ id, title, sport, start, end, location, source, last_updated }`.
- Feed ingestion and ICS parsing on the **server** (`/api/events`) to avoid browser CORS issues.
- UTC normalization internally, display in `America/New_York` with DST-aware ET formatting.
- Daily refresh via Vercel Cron (`/api/refresh`).
- Visible loading state + warning/error banners in UI.
- Fallback sample events so UI never appears blank when feeds fail.
- Auto-jump to the nearest month containing events if the current month has none.
- Ingestion from ICS feeds with local fallback ICS files.
- UTC normalization internally, display in `America/New_York` with DST-aware ET formatting.
- Daily refresh via Vercel Cron.
- Config-driven categories/feeds via `server/config/sources.json`.

## Project structure
```text
.
├── src
│   ├── app
│   │   ├── api/{config,events,refresh}/route.js
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/{EventCard,FilterBar}.jsx
│   └── lib
│       ├── calendar.js
│       ├── time.js
│       └── server/{config,ingest,sources,storage}.js
├── server/data/samples/*.ics   # kept as optional reference samples
│       └── server/{config,ingest,storage}.js
├── server
│   ├── config/sources.json
│   └── data/samples/*.ics
├── scripts/manualRefresh.mjs
├── vercel.json
└── package.json
```

## Local run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Vercel deployment
1. Push to GitHub.
2. Import repo in Vercel.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (below).
5. Deploy.

## Required / optional env vars
- `CRON_SECRET` (recommended): protects `/api/refresh`.

### How to set env vars in Vercel
- Vercel Dashboard → Project → **Settings** → **Environment Variables**
- Add `CRON_SECRET` with a strong random value
- Redeploy (or trigger a new deployment)
4. Deploy.

Optional env var:
- `CRON_SECRET` to protect `/api/refresh` (set same secret in cron auth if used).

### Daily refresh
`vercel.json` config triggers `/api/refresh` once daily at `09:00 UTC`.

## API routes
- `GET /api/config`
- `GET /api/events?search=...&sports=mlb,nfl`
- `GET/POST /api/refresh`

## Debugging production quickly
1. Open browser DevTools → Network → check `/api/events` response.
2. If `warnings` exist in JSON, one or more feeds failed but fallback/partial data is active.
3. In Vercel logs, filter for:
   - `[api/events] failed to load events`
   - `[api/refresh] refresh failed`
4. Trigger `POST /api/refresh` manually to force a refresh.

## Future-proofing categories/teams
Update `src/lib/server/sources.js` categories/feeds.
## Future-proofing categories/teams
Edit `server/config/sources.json` and add/remove entries under `categories`.
UI filters and labels update automatically.
