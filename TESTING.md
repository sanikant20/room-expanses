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

Last verified green: **2026-08-19** — backend 71 tests, frontend 35 tests,
frontend lint 0/0, frontend build OK, backend boots with 35 routes.

## Test inventory

### Backend — `backend/tests/` (71 tests, Node built-in runner)
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
- `settlement-logic.test.js` (22 tests) — the settlement state machine, all with
  model mocks (no DB):
  - `isAutoSettled` — auto-settled vs manual (`settledBy` + `settleActions` cases).
  - `settleScope` — already-settled shortcut, and E11000 race retry (re-fetches the
    existing record; asserts the second `findOne` happens).
  - `getSettlement` source-filter data — the category=null (all) view includes the
    all-record's `settleActions` so the frontend Manual/Auto filter has rows even
    when primary/secondary records carry none.
  - `markTransactionPaid` — admin may mark any transaction paid; the payer partner may
    mark their own; a partner who isn't the payer gets **403**; missing from/to → 400;
    no matching record → 404.
  - `confirmTransactionReceipt` — receiver-only 403; 404 when not found; 409 when not
    yet paid; marks the record confirmed; a non-receiver partner gets 403.
  - `resetTransactionPayment` — resets to pending; no matching record → 404.
  - Guard coverage — `settleMonth`/`revertSettlement` reject invalid scope/category
    (400) and refuse to revert an auto-settled record; re-settling an already-settled
    all scope → 409.
- `validation.test.js` (18 tests) — request-validation guards (all pure 400s, no DB):
  - `parseBsDate` — slash/dash formats, single-digit parts, null for malformed and
    out-of-range year/month.
  - `login` / `partnerLogin` / `changePassword` — require email+password / old+new.
  - partner controllers — name required, phone-or-password for login, invalid `:id`
    rejected, `togglePartnerStatus` validates the status value.
  - group controllers — name and at least one partner required, invalid `:id` rejected.
  - `createExpense` — title/amount/paidBy/bsDate required, amount > 0, valid BS date,
    at least one applicable partner.

### Frontend — `frontend/src/utils/*.test.js` + `constant`/`configurations`/`helper` (35 tests, vitest)
- `nepaliDate.test.js` — BS parsing/formatting, known calendar boundaries
  (2025-04-14 = BS 2082/01/01; 2025-04-13 = BS 2081/12/31), month arithmetic,
  `getBsMonthsRange`, `isValidBsDate`, current-date helpers.
- `currencyFormat.test.js` — en-IN grouping (`12,34,567.89`), 2 decimals, `Rs` symbol,
  null/undefined/NaN fallback to `0.00`.
- `dateConverter.test.js` — `convertToBSFormat` known conversions + invalid input.
- `configurations/axiosConfig.test.js` — `isLoginRequest` matches only `POST /login` and
  `POST /partner-login` (used by the interceptor so invalid credentials show the inline
  alert instead of the "Session Ended" dialog).
- `helper/getAuthData.test.js` — `getAuthData` default-filled shape for empty/corrupt
  storage, plain-JSON and encrypted round-trips, FullName fallback to email local-part;
  `isPartnerAccount` true/false. (Vitest `node` env: `sessionStorage` is stubbed.)
- `constant/constant.test.js` — `PAYMENT_STATUS` pending→paid→confirmed lifecycle and
  `SETTLEMENT_STATUS` receive/pay/settled labels.

## Bugs found & fixed (settlement payment status, 2026-08-18)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 8 | High | `POST /settlement/pay` returned success but paymentStatus stayed "pending" in DB. `Object.assign` on Mongoose subdocuments in arrays doesn't trigger change detection — `save()` silently persisted nothing. | Replaced `findOne` + `Object.assign` + `save` with `Settlement.updateMany` + `$set` + `arrayFilters` for atomic subdocument updates. |
| 9 | High | `netSettle()` hardcoded `paymentStatus: 'pending'` on every netted row, discarding real status from the DB. My Payments view always showed "Pending". | `netSettle` now accepts an optional `statusMap` and resolves the consolidated status (confirmed > paid > pending). Frontend groups pass the map. |
| 10 | High | `findOneAndUpdate` with `$` positional operator only updated 1 Settlement document, but `getSettlement` reads from primary + secondary records separately. Payment status updated on the wrong record. | `updateMany` with `arrayFilters` now updates the matching transaction in ALL scope records (primary, secondary, combined) for the month. |
| 11 | Medium | `getSettlement` response built a synthetic `settlement` object missing `settledBy`, `settledAt`, `fromDate`, `toDate` — so `SettlementStatus` component always showed "Auto System" and "—" for date/time. | Added `settledMeta` from the relevant record (primary for "all" scope, first settled secondary record, or the specific record) and spread into the response. `fetchSecondaryAggregatedStatus` now also returns `records`. |
| 12 | Low | `SettlementStatus` scope prop was only passed in Summary tab; Transactions and Calculation tabs omitted it, showing no date range in the "Settled by … on …" line. | Added `settledScopeLabel` derivation and `scope` prop to all 4 tabs (Summary, Transactions, MyPayments, Calculation) for consistency. |
| 13 | High | Transactions tab **Source filter (Manual/Auto) showed no rows** for a settled month. `getSettlement` category=null view aggregated `settleActions` only from primary + secondary records — which carry 0 because `settleAllCascade` settles the "all" scope first, so sub-scope records never get a `settleActions` push. The real source history lives on the category-null "all" record, which was never fetched. | `getSettlement` now also fetches the all-record and merges its `settleActions` into the response (`settledMeta` prefers it too). Frontend filter logic unchanged — it already reads `settlement.settleActions`. Covered by 2 new mocked unit tests. |

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
