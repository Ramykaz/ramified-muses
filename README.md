# Ramified Muses

Portfolio and writing site built with React + TypeScript + Vite.

## What changed

- Full UI refresh with distinct visuals per section (reading, research, films, projects, blog)
- Day/Night theme system (global switcher)
- Admin content now persists to a database-backed API (JSON DB via LowDB)

## Run locally

1. Install dependencies

```bash
npm install
```

2. Run frontend + backend together

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8787

## API

- `GET /api/health` — server status
- `GET /api/content` — full content payload
- `PUT /api/content` — overwrite full content payload

Database file is stored at `server/data/content-db.json`.

## Build

```bash
npm run build
```
