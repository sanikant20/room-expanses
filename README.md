# We Roomies — Room Expenses Management

A room expenses management app with Nepali (Bikram Sambat) date support. Track shared
expenses, manage rotating duties (water/rice/cleaning turns), get notified in-app and by
email, and settle monthly balances between roommates.

## Features

- Expenses in BS (Bikram Sambat) dates only, with a BS month picker everywhere
- Partner, category, and month-wise reports
- Monthly settlement with who-pays-whom transactions, manual/auto settle + revert
- **Turn rotations** — water, rice, and flat-cleaning share one state machine:
  bringer-fulfillment, cycle advance, admin "mark brought", history, and live public
  status on the landing page
- **Notifications** — in-app bell (unread badge, mark read/all) plus best-effort email
  via Resend: next-partner alerts on turn completion and Saturday cleaning reminders
- **Cookie-based auth** — httpOnly access/refresh tokens with silent refresh and token
  rotation; auth state is API-driven (`GET /auth/me`), never sniffed from cookies
- **Profile editing** — name/phone updates and avatar upload straight to Cloudinary
  (old image replaced server-side)
- **Server health indicator** — polled every 60 s; shown as a chip in public headers and
  as a pulsing dot on the profile avatar in the app
- Dashboard with partner summaries and highest/lowest payers (ties shown together,
  zero-paid partners included as lowest)
- Nepali currency formatting

## Tech Stack

- **Frontend**: React 19, Vite, MUI (Material UI), React Query, Formik, Recharts, PWA
- **Backend**: Node.js, Express 5, Mongoose, JWT auth (httpOnly cookies), node-cron
- **Database**: MongoDB (Atlas)
- **Media**: Cloudinary (avatar storage)
- **Email**: Resend REST API (free tier, no npm dependency)
- **Dates**: Nepali date converters (`nepali-date-converter`, `@sbmdkl/nepali-datepicker-reactjs`)

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (or Atlas URI)

### Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env    # fill in MONGODB_URI, token secrets, etc.
npm start               # runs nodemon on port 5000

# Frontend
cd frontend
npm install
npm run dev             # Vite dev server (proxies /api to :5000)
```

## Scripts

| Frontend | Backend |
| --- | --- |
| `npm run dev` | `npm start` (nodemon) |
| `npm run build` | `npm run seed` |
| `npm run lint` | |
| `npm test` / `npm run test:watch` | `npm test` |

## Environment

Frontend and backend each read a local `.env` file (see `backend/.env.example`). Secret
files such as `*.env` and `atlas-credentials.env` are git-ignored and must never be committed.

Backend keys:

| Key | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI`, `DB_NAME` | yes | Atlas connection |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | yes | JWT signing |
| `CORS_ORIGIN`, `PORT`, `NODE_ENV` | yes | Server config |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | optional | Avatar uploads (skipped if missing) |
| `RESEND_API_KEY`, `EMAIL_FROM` | optional | Email notifications (skipped if missing) |

## Deployment (single origin)

Production runs as **one Render Web Service** that serves both the API and the
built React app from the same origin — auth cookies stay first-party, so
cross-site cookie blocking never applies.

| Setting | Value |
| --- | --- |
| Root Directory | *(blank)* |
| Build command | `npm run render-build` |
| Start command | `npm run render-start` |

The `render-*` scripts live in the root `package.json` (Render's build-command
input rejects `&&`, so the real commands are kept there):
- `render-build`: `cd frontend && npm install --include=dev && npm run build && cd ../backend && npm install`
- `render-start`: `cd backend && node -r dotenv/config src/server.js`

- `--include=dev` is required: with `NODE_ENV=production`, npm skips devDependencies (`vite`).
- Production starts plain `node` — `nodemon` is a devDependency and must not be used.
- Do **not** set `VITE_BASE_URL` in production; the build defaults to relative `/api`.
- Express serves `frontend/build` automatically when it exists (see `backend/src/app.js`);
  local dev is unaffected.

See [`TESTING.md`](./TESTING.md) for the full test/audit record — how to verify every
feature and what has already been covered (130 backend tests, 44 frontend tests).
