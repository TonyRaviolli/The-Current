# The-Current

Local-first intelligence briefing site. Run locally, refresh feeds, review weekly digests, or deploy it so other people can access it.

## Quick start

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Refresh

- Manual refresh button in the top nav triggers `/api/refresh`.
- CLI refresh: `npm run refresh`
- Scheduler: `npm run schedule` (uses `config/refresh.json` times)

## Config

- `config/sources.json` defines tiers and RSS feeds.
- `config/refresh.json` controls budgets, timeouts, circuit breakers, and scoring.
- `.env.example` for environment variables.

## Data

- `data/store.json` holds the latest feed state.
- `data/cache.json` stores ETag/Last-Modified + circuit breaker state.
- `data/submissions/` stores form submissions (jsonl).
- In production, use a persistent `DATA_DIR`. This app writes live runtime state and should not rely on ephemeral disk.

## Tests

`npm test`

## Deploy on Render

The easiest way to share the site is to deploy it as a Node web service on Render.

### Why Render works here

- The app is already a Node server: [src/server.js](./src/server.js)
- A production start script already exists: `npm start`
- The site can refresh itself through `/api/refresh`
- Runtime files can live on a persistent disk via `DATA_DIR`

### Included config

This repo now includes [render.yaml](./render.yaml), which configures:

- a Node web service
- health check at `/api/status`
- persistent disk mounted at `/var/data/the-undercurrent`
- `DATA_DIR=/var/data/the-undercurrent`

### Deploy steps

1. Push this repo to GitHub.
2. Create a new Blueprint or Web Service in Render.
3. Point Render at the repo.
4. If using Blueprint, Render will read `render.yaml`.
5. Set these environment variables in Render:
   - `BASE_URL=https://your-render-url.onrender.com`
   - `ADMIN_TOKEN=...` a long random secret for admin actions
   - `ANTHROPIC_API_KEY` if you want AI enrichment
   - `CONGRESS_API_KEY` for Congress API reliability
   - `GOVINFO_API_KEY` for GovInfo reliability
   - `API_DATA_GOV_KEY` if you use a shared data.gov key
6. Deploy.

### First production refresh

After the site is live:

1. Open the site.
2. Set the admin token in your browser once by visiting:
   - `https://your-site.example/?admin_token=YOUR_ADMIN_TOKEN`
3. Trigger the refresh button in the UI, or call:
   - `POST /api/refresh`
4. Optionally run a deeper local backfill before deployment so the archive is already populated.

### GitHub push checklist

Before pushing:

1. Make sure `.env` is not committed.
2. Leave `data/` runtime files untracked.
3. Commit source files, config, tests, `render.yaml`, and docs.
4. Push to a new GitHub repo, then connect that repo to Render.

### Protected admin actions

When `NODE_ENV=production` and `ADMIN_TOKEN` is set, these endpoints require admin auth:

- `/api/refresh`
- `/api/refresh-stream`
- `/api/sources`
- `/api/sources/history`
- `/api/sources/toggle`
- `/api/sources/add`
- `/api/sources/:id`
- `/api/scoring`

The public reading surfaces remain open.

### Important note

Without a persistent disk, the archive, cache, health state, and refreshed content can disappear after redeploys or restarts. The `DATA_DIR` mount is required for stable hosted behavior.
