# Sports Calendar MVP (Next.js + Vercel)

A personalized sports calendar web app with a clean Google Calendar / Outlook style UI.

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
4. Deploy.

Optional env var:
- `CRON_SECRET` to protect `/api/refresh` (set same secret in cron auth if used).

### Daily refresh
`vercel.json` config triggers `/api/refresh` once daily at `09:00 UTC`.

## API routes
- `GET /api/config`
- `GET /api/events?search=...&sports=mlb,nfl`
- `GET/POST /api/refresh`

## Future-proofing categories/teams
Edit `server/config/sources.json` and add/remove entries under `categories`.
UI filters and labels update automatically.
