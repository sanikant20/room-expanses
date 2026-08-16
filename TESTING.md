# Testing & Audit Record

Single source of truth for how to verify this project and what has already been
audited, so the whole suite never needs to be re-derived from scratch.

## Quick start

| Command | What it checks |
|---|---|
| `cd backend && npm test` | Backend unit tests (`node --test`, no deps needed) |
| `cd frontend && npm test` | Frontend unit tests (vitest) |
| `cd frontend && npm run lint` | ESLint — must be **0 errors / 0 warnings** |
| `cd frontend && npm run build` | Production build (must pass) |
| `cd backend && node --check src/*.js src/**/*.js` | Backend syntax (no lint script configured) |

Last verified green: **2026-08-16** — backend 31 tests, frontend 22 tests,
frontend lint 0/0, frontend build OK, backend boots with 35 routes.

## Test inventory

### Backend — `backend/tests/` (31 tests, Node built-in runner)
- `calculation.test.js` — the money math that drives everything:
  - `splitPaise` splits any amount into exact integer paise shares summing to the total.
  - `expenseShares` always sums to `amount × 100` and is independent of partner-array order.
  - `computeSettlement` balances sum to ~0; grand total and net balance exact; payers credited in full.
  - `computeTransactions` fully resolves every debtor and creditor (no money left un-moved).
  - `computePartnerSummaries` per-partner totals reconcile with the grand total.
  - `aggregateMonthlyTrend` buckets by BS year/month, sorts chronologically.
  - `subtractBsMonths` rolls over year boundaries (2082/01 − 1 = 2081/12).
  - `computePayerTotals` / `findHighestPayer` / `findLowestPayer` — payer-based dashboard math.
- `routes.test.js` — boots the Express app on an ephemeral port, asserts all core
  routes exist (incl. settlement `POST /pay`, `POST /confirm`, `POST /reset`) and
  that `POST /register` is **not** exposed.
- `settlement-payment.test.js` — pay/confirm role guards (partner who isn't the
  payer/receiver gets 403; missing from/to gets 400) and settlement service surface.

### Frontend — `frontend/src/utils/*.test.js` (22 tests, vitest)
- `nepaliDate.test.js` — BS parsing/formatting, known calendar boundaries
  (2025-04-14 = BS 2082/01/01; 2025-04-13 = BS 2081/12/31), month arithmetic,
  `getBsMonthsRange`, `isValidBsDate`, current-date helpers.
- `currencyFormat.test.js` — en-IN grouping (`12,34,567.89`), 2 decimals, `Rs` symbol,
  null/undefined/NaN fallback to `0.00`.
- `dateConverter.test.js` — `convertToBSFormat` known conversions + invalid input.

## Bugs found & fixed (audit pass, 2026-08-15)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 1 | High | `POST /api/auth/register` was public and created users with `role: req.body.role \|\| 'admin'` — anyone could self-register an admin. Frontend never used it. | Removed route, controller, and unused `useRegister` hook. |
| 2 | Medium | Duplicate `POST` and `PUT /change-password` routes; frontend only calls `PUT`. | Removed the `POST` route. |
| 3 | Medium | Login form pre-filled `admin@room.local` / `Admin@123` in Formik `initialValues`. | Cleared to empty values. |
| 4 | High | Missing `VITE_ENCRYPTION_KEY` **crashes login** (`CryptoJS.AES.encrypt(..., undefined)` throws). No frontend `.env*` existed. | Added `frontend/.env.example` documenting the required var; **must be set in the build env**. |
| 5 | Low | `backend/.env.example` pointed `MONGODB_URI` at localhost. | Changed to Atlas `mongodb+srv://` template (Atlas-only storage). |
| 6 | Low | 10 ESLint warnings (react-hooks/react-refresh). | All fixed — see `git log`/diff: context-hook splits, DataTable ref-guard, SettlementTransactions useMemo, AppTheme dep, ThemeColorSelection exports. |
| 7 | Low | Dead code: `expenseCalculation.js`, `setupEnterAsTab.js`, `getComID.js`, `getBrowserDetails.js` + 11 unused exports (−670 lines). | Removed (verified zero importers). |

## Known issues / not changed (needs your call)

- **No rate limiting / helmet** on the backend — recommended for production.
- **Partner `email` has no unique index** — duplicate emails make `partner-login` ambiguous.
- `login`/`partnerLogin` return `404 "User/Partner not found"` → user enumeration; prefer a uniform `401`.
- `useGetExpenses` polls every **15 s** (`refetchInterval: 15000`).
- `dashboard.getSummary` (6 queries) and `getGroups` (per-group count) are N+1-ish — fine at current scale.
- Access token is 1-day; refresh-token/cookie infra exists but is unused (token lives in `sessionStorage`).
- Backend has **no lint script** — add one if desired.
- Both `.env.example` files are gitignored by the root `.env.*` rule; add `!.env.example` if they should ship.

## Debug / deployment notes

- `backend/.env` must set: `MONGODB_URI` (Atlas), `DB_NAME=room-expanses`, `ACCESS_TOKEN_SECRET`,
  `REFRESH_TOKEN_SECRET`, `CORS_ORIGIN` (= deployed frontend origin), `NODE_ENV=production`,
  `PORT`. Current values are **dev defaults**.
- **Settlement index repair (2026-08-16)**: the `settlements` collection carried a stale
  legacy unique index `bsYear_1_bsMonth_1_category_1` (3-field) left over from before the
  `group` field existed. It made secondary settlements of different groups collide with
  `E11000` for the same month (schema index is correctly 4-field: `+ group`). Dropped via
  `backend/src/scripts/repair-settlement-index.js` (`node src/scripts/repair-settlement-index.js`).
  `settleScope` also now retries on `code 11000` by re-fetching the existing record so a
  concurrent upsert (auto-settle cron racing a manual settle) can't 500 mid-cascade.
- Frontend build env needs `VITE_ENCRYPTION_KEY` (required — see item 4 above). `VITE_BASE_URL`
  defaults to `/api` (dev proxy: Vite → `http://localhost:5000`).
- Auth flow: JWT in `sessionStorage['auth']` → `Authorization: Bearer` via axios interceptor;
  401 → `authExpirationHandler()` → `/logout`. `verifyJWT` accepts user and partner tokens;
  `verifyUserOnly` gates admin-only routes.
- Auto-settle: cron `30 0 * * *` Asia/Kathmandu, fires on BS day 1, settles the previous BS month
  (All + Primary + each group's Secondary). Auto-settled settlements cannot be reverted.
- Settlement math is paise-exact (`splitPaise`); legacy records without `settleActions`
  are treated as auto-settled when `settledBy` is unset.
