# Room Expenses

A room expenses management app with Nepali (Bikram Sambat) date support. Track shared expenses, generate reports, and settle monthly balances between roommates.

## Features

- Expenses in BS (Bikram Sambat) dates only
- Partner, category, and month-wise reports
- Monthly settlement with who-pays-whom transactions
- Dashboard with partner expense summaries
- Nepali currency formatting

## Tech Stack

- **Frontend**: React 19, Vite, MUI (Material UI), React Query, Formik, Recharts, PWA
- **Backend**: Node.js, Express 5, Mongoose, JWT auth
- **Database**: MongoDB (Atlas)
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
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, etc.
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
| `npm test` / `npm run test:watch` | |

## Environment

Frontend and backend each read a local `.env` file (see `backend/.env.example`). Secret files such as `*.env` and `atlas-credentials.env` are git-ignored and must never be committed.
