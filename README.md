# Sports Calendar MVP

A local-first sports calendar web app with a clean Google Calendar/Outlook-inspired UI.

## Sports covered
- NY Mets (MLB)
- NY Giants (NFL)
- Formula 1
- NASCAR
- UCI WorldTour Cycling

## Core features
- Calendar views: **Month / Week / Day / Agenda**.
- Category filters: MLB / NFL / F1 / NASCAR / Cycling.
- Search by team/race name.
- Event cards include title, ET start time, and sport label.
- Times displayed in `America/New_York` with daylight savings transitions handled automatically.
- Incoming feed data normalized to UTC internally.
- Daily auto-refresh plus manual refresh endpoint.
- Future-proof category/feed management via config (`server/config/sources.json`).

## Event schema
```json
{
  "id": "string",
  "title": "string",
  "sport": "string",
  "start": "UTC ISO",
  "end": "UTC ISO",
  "location": "string",
  "source": "string",
  "last_updated": "UTC ISO"
}
```

## Project structure
```text
.
├── server
│   ├── config/sources.json
│   ├── data/samples/*.ics
│   ├── ingest.js
│   ├── scheduler.js
│   ├── storage.js
│   └── index.js
├── src
│   ├── components/
│   ├── lib/
│   ├── App.jsx
│   └── styles.css
├── render.yaml
└── package.json
```

## Run locally
```bash
npm install
npm run dev
```
Open: `http://localhost:5173`

## Deploy (simplest: Render)
This repo includes `render.yaml` for one-click deployment.

1. Push this branch to GitHub.
2. In Render: **New +** → **Blueprint**.
3. Select your repo.
4. Render reads `render.yaml`, builds, and deploys automatically.
5. Open the generated `https://<service>.onrender.com` URL in browser.

### Runtime behavior on deploy
- Backend serves API and built frontend from one process (`npm start`).
- Initial ingestion runs on boot.
- Daily refresh runs at 4:00 AM server time.

## API
- `GET /api/config`
- `GET /api/events?search=...&sports=mlb,nfl`
- `POST /api/refresh`

## Add/remove categories later
Update `server/config/sources.json`:
- add or remove entries under `categories`
- add `feeds` (and optional fallback ICS path)

UI filters and labels update automatically from config.
