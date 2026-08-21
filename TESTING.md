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

Last verified green: **2083/05/06 (BS)** — backend **124** tests, frontend 44 tests,
frontend lint 0 errors / 2 pre-existing warnings, frontend build OK, backend boots
with the `/api/turn` routes (water + rice + cleaning), `/api/notifications`,
`GET /api/health`, and `PUT /api/auth/profile`.
Both admin and partner login flows verified working with API-driven cookie auth.
Resend email verified end-to-end from the verified domain (`mail.sanikant.com.np`).

## Test inventory

### Backend — `backend/tests/` (124 tests, Node built-in runner)
- `calculation.test.js` — the money math that drives everything:
  - `splitPaise` splits any amount into exact integer paise shares summing to the total.
  - `expenseShares` always sums to `amount × 100` and is independent of partner-array order.
  - `computeSettlement` balances sum to ~0; grand total and net balance exact; payers credited in full.
  - `computeTransactions` fully resolves every debtor and creditor (no money left un-moved).
  - `computePartnerSummaries` per-partner totals reconcile with the grand total.
  - `aggregateMonthlyTrend` buckets by BS year/month, sorts chronologically.
  - `subtractBsMonths` rolls over year boundaries (2082/01 − 1 = 2081/12).
  - `computePayerTotals` / `findHighestPayers` / `findLowestPayers` — payer-based
    dashboard math; both helpers are **tie-aware** (return every tied partner) and
    `findLowestPayers` includes zero-paid partners (someone who paid nothing can be
    the lowest payer); highest ignores zero payers and returns `[]` when nobody paid.
- `routes.test.js` — boots the Express app on an ephemeral port, asserts all core
  routes exist (incl. auth `POST /refresh`, `POST /logout`, settlement `POST /pay`,
  `POST /confirm`, `POST /reset`) and that `POST /register` is **not** exposed.
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
- `validation.test.js` (19 tests) — request-validation guards (all pure 400s, no DB):
  - `parseBsDate` — slash/dash formats, single-digit parts, null for malformed and
    out-of-range year/month.
  - `login` / `partnerLogin` / `changePassword` — require email+password / old+new.
  - partner controllers — name required, phone-or-password for login, invalid `:id`
    rejected, `togglePartnerStatus` validates the status value; `updateProfile`
    requires a name (email is immutable).
  - group controllers — name and at least one partner required, invalid `:id` rejected.
  - `createExpense` — title/amount/paidBy/bsDate required, amount > 0, valid BS date,
    at least one applicable partner.
- `turn.test.js` (36 tests) — the water turn state machine, all with model mocks (no DB):
  - `computeTurnState` — empty/inactive-partner handling; **fulfillment follows the
    bringer** (`broughtByPartner`), not the assigned partner; absent partner stays
    pending when covered; out-of-order completions follow completion order, not rotation
    order; the critical scenario (order A,B,C,D; completions A then C then D then B →
    next cycle current A); cycle advances only after every active partner is fulfilled.
  - `completeTurn` — creates an event; throws **409** on the E11000 unique-constraint
    double completion (index `{ rotation, cycle, broughtByPartner }`).
  - `getTurnState` — returns `configured:false` with no rotation; returns `myStatus`
    (inRotation/fulfilled/isCurrentTurn) for a partner requester.
  - `createTurn` — rejects duplicate/empty/invalid partner lists; deactivates other
    active rotations and creates the new one.
  - `completeTurnAction` — current partner completes their own turn; a non-current
    partner covering fulfills their **own** obligation and keeps the current turn
    pending; 409 when already fulfilled; 403 for a non-rotation partner; admin must
    pass a valid `partnerId`; admin can record completion for a specific partner;
    admin marking a non-current partner fulfills that partner while the current turn
    stays pending; admin marking an already-fulfilled or inactive partner → 409 / 403;
    admin marking a partner outside the rotation → 403.
  - `resetTurnEvent` — 404 for a missing event; deletes the event and returns only
    `{ success, message }`.
- Mutation endpoints (`POST /turn`, `PUT /turn/:id`, `POST /turn/complete`,
  `POST /turn/reset`) return **only `{ success, message }`** — no state data. The
  frontend refetches via query invalidation; state data is returned only by the GET
  endpoints (`GET /`, `GET /public`, `GET /history`).
- `turn type handling` — resolves `rice` **and `cleaning`** rotations via
  `?type=`; defaults to `water`; unsupported types fall back to `water`;
  `createTurn` stores the requested type; rice + cleaning completion records
  correctly.
- `notification.test.js` (11 tests) — the notification service + controller, all
  with model mocks:
  - `notifyPartner` creates an in-app notification, skips email when the partner has
    no email address, and never throws on DB failures.
  - `notifyPartner` omits `refKey` from the stored doc when none is provided (sparse
    unique index can't collide on repeated `null`s) and stores it when provided.
  - `notifyNextTurnPartner` notifies the next current partner after a completion
    (recomputed from events) with the email sent from the app's Resend sender (no
    partner email in `from`/`reply_to`) and does nothing when no next partner exists.
  - controller: `getNotifications` returns own list + unreadCount; `markNotificationRead`
    404 on missing, 403 on another partner's notification, marks own read;
    `markAllNotificationsRead` scopes the update to the requesting partner.
- `routes.test.js` — also asserts the new `/api/turn` router exposes
  `GET /public` (no auth), `GET /`, `GET /history`, `POST /`, `PUT /:id`,
  `POST /complete`, `POST /reset`, and the `/api/notifications` router
  (`GET /`, `PUT /:id/read`, `PUT /read-all`) is JWT-gated.

### Frontend — `frontend/src/utils/*.test.js` + `constant`/`configurations`/`helper` (44 tests, vitest)
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
  cookie, plain-JSON round-trips, FullName fallback to email local-part;
  `isPartnerAccount` true/false. (Vitest `node` env: `document.cookie` is stubbed.)
- `constant/constant.test.js` — `PAYMENT_STATUS` pending→paid→confirmed lifecycle and
  `SETTLEMENT_STATUS` receive/pay/settled labels.
- `turnFormat.test.js` — `getTurnPartnerStatus` (current/done/pending), `isCoveredEvent`
  (a different carrier vs self-completion), `formatTurnDateTime` (BS date + time via
  `convertToBSFormat`).
- `turnTypeConfig` (not unit-tested; driven by `TurnView` via props) — per-type
  labels/verbs/icons for water, cleaning, and rice (order: water → cleaning → rice on
  both the tab and the landing page).

## Water Turn feature (2083/05/04 BS)

A persistent turn/queue state machine (not an index rotation). Design decisions:

- **Fulfillment follows the bringer.** A partner's obligation for a cycle is fulfilled
  only when that partner is the `broughtByPartner` of an event in the cycle. The
  `assignedPartner` field records the partner whose turn was scheduled at the time.
  When a non-current partner brings water for the current turn ("I Brought Water For
  This Turn"), the record is `assigned: currentTurn, broughtBy: the partner` — the
  current turn stays pending and the bringer fulfills their **own** obligation.
- **Covering keeps the absent partner pending.** If A is absent and B brings water, A
  remains outstanding and comes back as the next turn. Out-of-order completions are
  allowed and advance only the bringer.
- **Cycle is derived from events.** `computeTurnState` uses the latest event cycle; when
  every active partner has fulfilled their obligation in that cycle, it advances to the
  next cycle and everyone resets. Cycle state is never stored, so it can't drift.
- **Concurrency.** Unique index `{ rotation, cycle, broughtByPartner }` prevents a
  partner from fulfilling the same obligation twice; the service maps `E11000` to a 409.
- **Inactive partners** are excluded from turn selection but their historical events
  remain untouched.

## Turn types (rice, 2083/05/05 BS)

The same state machine powers multiple turn types. The `TurnRotation.type` field is the
key (`"water"` | `"rice"`); each type keeps its own independent active rotation, events,
cycles, and history.

- **API**: type is passed as a query param on GETs (`GET /turn?type=rice`,
  `GET /turn/history?type=rice`, `GET /turn/public?type=rice`) and in the body on
  mutations (`POST /turn` with `{ type, partners }`, `POST /turn/complete` with
  `{ type, partnerId? }`). Unsupported types fall back to `"water"`. `POST /turn/reset`
  is type-agnostic (resets by `eventId`).
- **Frontend**: Turn menu → `/turn` renders `TurnTabs` with Water + Rice tabs, both
  driving the same generalized `TurnView` component via a type config
  (`frontend/src/utils/turnTypeConfig.jsx` — labels, verbs, icons, actions per type).
  The public landing page shows **both** live turns side by side.
- Admin-only "Mark X Brought" select in the Admin Actions card records completion for
  any active, unfulfilled rotation partner of that type; marking buttons show a
  spinner + "Marking..." while the request is in flight.
- The public endpoints (`GET /turn/public?type=...`) are registered before `verifyJWT`.

Known considerations (accepted, not changed):
- A simultaneous double-click race can record an event against a stale cycle read; the
  unique index still prevents double-fulfillment, so this is harmless for a room app.
- `POST /turn/reset` does not verify the event belongs to a water rotation (admin-only).
- `assignedPartner` for an out-of-order completion records the scheduled current turn
  (not the completing partner's own name) — intentional; the critical test outcome
  (order A→C→D→B, next cycle A) is preserved.

## Cleaning turn + notifications (2083/05/06 BS)

Third turn type (`"cleaning"` — flat/floor cleaning) runs on the **same state machine**
as water/rice: rotation order, bringer-fulfillment, cycle advance, admin mark, history.
The only behavioural difference is the **Saturday reminder**.

- **Type plumbing**: enum `["water","rice","cleaning"]`; `resolveType` accepts
  `cleaning`; type-specific error/success messages (no more hardcoded "water").
  `turnTypeConfig.jsx` gained a `cleaning` entry (icons `CleaningServicesRounded`,
  obligation phrase "clean the flat"); `TurnTabs` gained a Cleaning tab; the landing
  page now **iterates `TURN_TYPES`** instead of hardcoding water+rice.
- **In-app notifications (Option A)**: new `Notification` model (`partner`, `type`,
  `title`, `message`, `read`, `readAt`, unique-sparse `refKey`). Routes under
  `/api/notifications` (JWT-gated): `GET /` (own list + unreadCount), `PUT /:id/read`,
  `PUT /read-all`. Partners see only their own; marking someone else's → 403. The
  frontend `NotificationBell` (DesktopHeader + MobileHeader) polls every 60 s, shows a
  badge, and lists notifications with a "Mark all read" action.
- **Email (Option B, Resend free tier)**: `email.service.js` posts to Resend's REST API
  with `RESEND_API_KEY`. **Best-effort** — missing key or send failure is logged, never
  thrown, and in-app notifications still work. All emails are sent from the app's
  Resend sender (`EMAIL_FROM`, falling back to `onboarding@resend.dev` / `RESEND_DOMAIN`)
  — **never from a partner's personal email** (Resend requires the sending domain to be
  verified, so partner Gmail addresses can't be the sender).
- **Saturday 6 AM reminder** (`cleaningReminder.service.js`): cron `0 6 * * 6`
  Asia/Kathmandu + a startup catch-up (only fires if today is a Kathmandu Saturday).
  It loads the active cleaning rotation, computes the current turn, and notifies the
  current partner (in-app + email). `refKey = cleaning-saturday-<date>` dedupes so a
  restart or double-fire can't duplicate the reminder.
- **Next-partner notification**: after a partner completes their own turn (any type),
  `notifyNextTurnPartner` recomputes state and notifies the next current partner
  (in-app + email). Admin-recorded completions do **not** trigger this.
- `.env.example` documents `RESEND_API_KEY` / `EMAIL_FROM` / `RESEND_DOMAIN`.

Known considerations (accepted, not changed):
- Email requires a free Resend API key; until `EMAIL_FROM` is a verified sender domain,
  Resend's onboarding address can only deliver to your own account email.
- Notification route ordering: `PUT /read-all` and `PUT /:id/read` are both registered;
  Express matches `/read-all` literally before the `:id` param route is hit for that
  path (id validation rejects non-ObjectIds anyway).
- The reminder fires based on the current active rotation's `currentTurn` at 6 AM
  Saturday; if the current partner changed since the last Saturday (e.g. nobody marked
  it), the new current partner gets the reminder.

## Cloudinary image storage (2083/05/07 BS)

Partner profile images are uploaded to **Cloudinary** (free tier: 25 GB storage, 25K
transformations/mo) under the `we-roomies` folder. Only the Cloudinary URL is stored in
MongoDB — no base64 in the database.

- **Backend flow**: partner create/update routes accept `multipart/form-data` via multer
  (memory storage, 500 KB limit, images only). The controller uploads the buffer to
  Cloudinary (`uploadBuffer`), which returns a secure URL. The URL is stored in the
  partner's `image` field. Old images are deleted from Cloudinary on update/delete
  (`deleteImage` — best-effort, never throws).
- **Cloudinary config** (`config/cloudinary.js`): uses `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars. If missing, image uploads are
  silently skipped and the existing URL (or null) is kept.
- **Frontend flow**: `CustomFileUpload` passes the raw `File` object to the parent via
  `onFileSelect`. `PartnerForm` stores it in `imageFile` state; on submit, if a file is
  selected, a `FormData` is built and sent as multipart (multer parses it on the backend).
  If no file is selected, the existing URL string is sent as JSON (backward-compatible).
- **Migration**: `scripts/migrate-images.js` uploads existing base64 images to Cloudinary
  and replaces the stored value with the URL. Run once: `node scripts/migrate-images.js`.
- **Display**: all `<Avatar src>` and `<img src>` usages already work with URLs — no
  frontend display changes needed. The `noAvatar.svg` fallback is used when `image` is
  null/undefined.
- `.env.example` / `.env.production.example` document `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Health status, payer ties & upload hardening (2083/05/06 BS)

- **Server health indicator** (`frontend/src/components/HealthStatus.jsx` +
  `useGetHealthStatus` hook): polls the public `GET /api/health` every 60 s
  (retry ×1). Three states — **Checking…** (spinner), **Connected** (green dot with
  pulse animation + uptime tooltip), **Offline** (red dot; auto-retries).
  - Public layout: labeled chip in the desktop header (left of theme toggle),
    **dot-only** compact variant in the mobile header (space is tight).
  - Protected layout: the status lives **directly on the OptionsMenu avatar badge**
    (`Optionsmenu.jsx`) — grey while checking, pulsing green when connected, red
    when unreachable; the tooltip shows server state + "Click for profile options".
    No separate chip in the protected headers.
  - All instances share one react-query poll (same `queryKey`).
- **Dashboard highest/lowest payers** now return **arrays**:
  `highestPayers` / `lowestPayers` (was singular `highestPayer` / `lowestPayer`).
  - Ties show **all** tied partners ("Tied for most/least paid this month").
  - Lowest includes partners who paid **0**; highest still ignores zero payers.
  - Empty month → highest shows "No expenses recorded", lowest lists all-at-zero ties.
- **Upload middleware hardening** (`upload.middleware.js`):
  - Strict mime whitelist — only `image/jpeg`, `image/png`, `image/webp`
    (matches the frontend hook; GIF/BMP/SVG rejected server-side).
  - Multer errors are wrapped as clean JSON **400** ApiErrors
    ("Image must be smaller than 500 KB" / "Only JPG, PNG, or WebP images are
    allowed") instead of unhandled HTML 500s.
  - Cloudinary `public_id` no longer double-timestamps — callers pass a plain name
    (`"partner"` / `"user"`), the service appends the single timestamp.
- **Email logging**: every send logs `[email] sending … from … to …`, success logs
  `[email] SENT ✓`, failures log `[email] FAILED (<status>)` with Resend's body;
  partners without an email log `[notify] partner "X" has no email — in-app
  notification only` instead of skipping silently.
- **Auth perf**: AuthProvider context value is memoized; after a profile save the
  mutation response feeds `setUser(response.user)` directly — no extra `/me`
  round-trip.

## Landing page simplification & public header (2083/05/05 BS)

- **Rotation queue card removed.** The landing page no longer lists the whole pending
  rotation. Each type card now shows exactly three rows: **Current turn**, **Next
  turn**, and **Recent** (last brought). The hero still shows the live badge, cycle
  number, and Partner Login.
- **Cycle-ending message.** When there is no next turn (`nextTurn` is null) and a
  current turn exists, the Next turn row shows **"Cycle ending — this is the last
  turn, the cycle will restart next"** instead of a bare `—`. Rendered via the
  `TurnRow` `emptyText`/`sub` props in `frontend/src/pages/public/LandingPage.jsx`.
- **Public desktop menus removed.** The desktop header
  (`PublicDesktopHeader.jsx`) no longer renders the Home/Features/Product/Contact nav
  — only the logo (left) and theme toggle + login (right) remain. `PublicMenuContent`
  was trimmed to the mobile-only list rendering (the desktop `Stack`/Button branch was
  deleted as dead code); `PublicMenuItems` is unchanged and still drives the mobile
  drawer menu.

## Bugs found & fixed (turn feature UI, 2083/05/04 BS)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 14 | High | Partner marking buttons passed the click event to `handleComplete` (`onClick={handleComplete}`), so the event object became a truthy `partnerId` and was serialized into the request body — the API call failed and nothing was marked. | Wrapped the handlers as `onClick={() => handleComplete()}` so no argument leaks through. |
| 15 | Medium | `LiveTurnCard` on the landing page crashed with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` — inline configs lacked the `label` field. | Switch to `getTurnTypeConfig('water' | 'rice')` from the shared config so `label`/`title`/`noun`/icons are always present. |
| 16 | Low | Mutation endpoints (`POST /turn`, `PUT /turn/:id`, `POST /turn/complete`, `POST /turn/reset`) returned full state data that the UI never used. | All mutations now return only `{ success, message }`; the frontend refetches via query invalidation. State data is returned only by GET endpoints. |
| 17 | High | Next-partner in-app notifications silently stopped after the first one: `notifyPartner` always wrote `refKey: null`, and MongoDB's sparse unique index still indexes `null` — so the 2nd notification hit E11000 and `notifyPartner` bailed *before* sending email. | `refKey` is now omitted from the document when not provided (`default: null` removed from the schema), so sparse-indexed docs are skipped and every next-partner notification creates + emails. Covered by 2 new tests. |

## Bugs found & fixed (settlement payment status, 2083/05/02 BS)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 8 | High | `POST /settlement/pay` returned success but paymentStatus stayed "pending" in DB. `Object.assign` on Mongoose subdocuments in arrays doesn't trigger change detection — `save()` silently persisted nothing. | Replaced `findOne` + `Object.assign` + `save` with `Settlement.updateMany` + `$set` + `arrayFilters` for atomic subdocument updates. |
| 9 | High | `netSettle()` hardcoded `paymentStatus: 'pending'` on every netted row, discarding real status from the DB. My Payments view always showed "Pending". | `netSettle` now accepts an optional `statusMap` and resolves the consolidated status (confirmed > paid > pending). Frontend groups pass the map. |
| 10 | High | `findOneAndUpdate` with `$` positional operator only updated 1 Settlement document, but `getSettlement` reads from primary + secondary records separately. Payment status updated on the wrong record. | `updateMany` with `arrayFilters` now updates the matching transaction in ALL scope records (primary, secondary, combined) for the month. |
| 11 | Medium | `getSettlement` response built a synthetic `settlement` object missing `settledBy`, `settledAt`, `fromDate`, `toDate` — so `SettlementStatus` component always showed "Auto System" and "—" for date/time. | Added `settledMeta` from the relevant record (primary for "all" scope, first settled secondary record, or the specific record) and spread into the response. `fetchSecondaryAggregatedStatus` now also returns `records`. |
| 12 | Low | `SettlementStatus` scope prop was only passed in Summary tab; Transactions and Calculation tabs omitted it, showing no date range in the "Settled by … on …" line. | Added `settledScopeLabel` derivation and `scope` prop to all 4 tabs (Summary, Transactions, MyPayments, Calculation) for consistency. |
| 13 | High | Transactions tab **Source filter (Manual/Auto) showed no rows** for a settled month. `getSettlement` category=null view aggregated `settleActions` only from primary + secondary records — which carry 0 because `settleAllCascade` settles the "all" scope first, so sub-scope records never get a `settleActions` push. The real source history lives on the category-null "all" record, which was never fetched. | `getSettlement` now also fetches the all-record and merges its `settleActions` into the response (`settledMeta` prefers it too). Frontend filter logic unchanged — it already reads `settlement.settleActions`. Covered by 2 new mocked unit tests. |

## Bugs found & fixed (audit pass, 2083/04/30 BS)

| # | Severity | Bug | Fix |
|---|---|---|---|
| 1 | High | `POST /api/auth/register` was public and created users with `role: req.body.role \|\| 'admin'` — anyone could self-register an admin. Frontend never used it. | Removed route, controller, and unused `useRegister` hook. |
| 2 | Medium | Duplicate `POST` and `PUT /change-password` routes; frontend only calls `PUT`. | Removed the `POST` route. |
| 3 | Medium | Login form pre-filled `admin@room.local` / `Admin@123` in Formik `initialValues`. | Cleared to empty values. |
| 4 | High | Missing `VITE_ENCRYPTION_KEY` **crashes login** (`CryptoJS.AES.encrypt(..., undefined)` throws). No frontend `.env*` existed. | Encryption layer removed (cookie-based auth); `VITE_ENCRYPTION_KEY` no longer needed. |
| 5 | Low | `backend/.env.example` pointed `MONGODB_URI` at localhost. | Changed to Atlas `mongodb+srv://` template (Atlas-only storage). |
| 6 | Low | 10 ESLint warnings (react-hooks/react-refresh). | All fixed — see `git log`/diff: context-hook splits, DataTable ref-guard, SettlementTransactions useMemo, AppTheme dep, ThemeColorSelection exports. |
| 7 | Low | Dead code: `expenseCalculation.js`, `setupEnterAsTab.js`, `getComID.js`, `getBrowserDetails.js` + 11 unused exports (−670 lines). | Removed (verified zero importers). |

## Known issues / not changed (needs your call)

- **No rate limiting / helmet** on the backend — recommended for production.
- **Partner `email` has no unique index** — duplicate emails make `partner-login` ambiguous.
- `login`/`partnerLogin` return `404 "User/Partner not found"` → user enumeration; prefer a uniform `401`.
- `useGetExpenses` polls every **15 s** (`refetchInterval: 15000`).
- `dashboard.getSummary` (6 queries) and `getGroups` (per-group count) are N+1-ish — fine at current scale.
- Backend has **no lint script** — add one if desired.
- Both `.env.example` files are gitignored by the root `.env.*` rule; add `!.env.example` if they should ship.
- `encryption.js` is dead code (zero importers) — can be removed in a future cleanup.

## Cookie-based auth (2083/05/07 BS)

Access and refresh tokens are stored in **httpOnly cookies** instead of
`sessionStorage`. User profile data is stored in a regular (non-httpOnly) cookie
for synchronous frontend access.

- **Both User and Partner models** now have a `refreshToken` field and
  `generateRefreshToken()` method. Partner JWT refresh tokens include
  `{ _id, type: "partner" }` so the refresh endpoint can distinguish user vs partner.
- **Cookies set by backend** on login/partnerLogin:
  - `accessToken` — httpOnly, `sameSite: Lax`, `path: /`, maxAge 1 day
  - `refreshToken` — httpOnly, `sameSite: Lax`, `path: /api/auth`, maxAge 30 days
  - `user` — non-httpOnly (JS-readable), `sameSite: Lax`, maxAge 30 days
- **Frontend** sends `withCredentials: true` on all requests; browser auto-attaches
  cookies. No manual `Authorization` header. No more `sessionStorage` for auth.
- **Token refresh** (`POST /api/auth/refresh`): on 401, the axios interceptor calls
  the refresh endpoint (reads `refreshToken` cookie), rotates both tokens, and retries
  the original request. If refresh fails, redirects to `/logout`.
- **Logout** (`POST /api/auth/logout`): clears the refresh token in DB + clears all
  cookies. Frontend fallback clears cookies client-side if the API call fails.
- **`getAuthData()`** reads from the `user` cookie via `document.cookie` instead of
  `sessionStorage`. The encryption layer (`encryption.js`) is no longer used.
- **`AuthProvider`** checks `document.cookie` for the `user` key on mount.
  **Superseded (2083/05/06 BS)**: auth state is now **API-driven** — AuthProvider
  calls `GET /auth/me` on mount and keeps the user in an in-memory store
  (`getAuthData.js`); cookies are never sniffed to decide login state. The `user`
  cookie is still set for convenience but is not trusted by the frontend. A failing
  `/me` is the expected "not logged in" signal and does NOT trigger the logout
  redirect (guarded via `isAuthMeRequest` in `axiosConfig.js`).
- **Backward compatibility**: `verifyJWT` still reads `Authorization: Bearer` header
  as a fallback (for Postman/testing). `POST /logout` no longer requires
  `verifyUserOnly` — any authenticated user/partner can log out.

## Context consolidation & cleanup (2083/05/07 BS)

- **Auth context** merged into a single `authContext.jsx` (was: `authContext.js` +
  `AuthProvider.jsx` + `useAuth.js`). Exports `AuthProvider` and `useAuth`.
- **Theme context** merged into a single `themeModeContext.jsx` (was: `themeModeContext.js`
  + `ThemeModeProvider.jsx` + `useThemeMode.js`). Exports `ThemeModeProvider` and
  `useThemeMode`.
- **AuthExpirationProvider removed** — the inactivity timer, session-expiry dialog, and
  the `setAuthExpirationHandler` bridge in `axiosConfig.js` are all deleted. Refresh
  failure now redirects straight to `/logout` with no dialog.
- **`AxiosInterceptorSetup`** component removed from `App.jsx` (no longer needed).
- `encryption.js` is dead code (zero importers) — can be removed in a future cleanup.

## Debug / deployment notes

- **Landing/header changes (2083/05/05 BS)**: desktop public header has no nav menu;
  mobile drawer menu still uses `PublicMenuItems`. Landing page per-type card shows
  Current / Next / Recent rows; Next shows a "Cycle ending" message when the current
  turn is the last of the cycle.
- **Turn UI debug (2083/05/04 BS)**: partner buttons must not pass the click event to
  mutation handlers (see bug #14); mutation endpoints return only `{ success,
  message }` so the backend dev server **must be restarted** after this change to see
  it. Dev-tools `[Violation] 'setTimeout' handler took Xms` warnings come from
  `react-toastify`/react-query internals, not app code.
- `backend/.env` must set: `MONGODB_URI` (Atlas), `DB_NAME=room-expanses`, `ACCESS_TOKEN_SECRET`,
  `REFRESH_TOKEN_SECRET`, `CORS_ORIGIN` (= deployed frontend origin), `NODE_ENV=production`,
  `PORT`. Current values are **dev defaults**. Optional: `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for avatar uploads.
- **Email notifications (2083/05/06 BS)**: optional. Set `RESEND_API_KEY` for
  best-effort email via Resend's free tier (REST API, no npm dep). Without it, email is
  skipped silently and only in-app notifications (the header bell) are delivered.
  Emails always come from the app's Resend sender: `EMAIL_FROM` if set, else
  `RESEND_DOMAIN`, else the default `onboarding@resend.dev` (which can only deliver to
  your own account email until a domain is added). Partner emails are only ever
  recipients (`to`) — never the sender. **Domain verified (2083/05/06 BS)**:
  `mail.sanikant.com.np` is verified in Resend; `.env` sets
  `EMAIL_FROM="We Roomies <noreply@mail.sanikant.com.np>"` so all partner inboxes
  receive mail. Every send/failure is visible in backend logs (`[email] …` lines).
- **Health endpoint**: `GET /api/health` is public (no auth) and returns
  `{ success, status, db, uptime, timestamp }`; the frontend polls it every 60 s for
  the header/avatar status indicator. App.jsx also pings it every 5 min
  (`HealthPoller`) to keep free-tier hosts awake.
- **Cloudinary image storage (2083/05/07 BS)**: optional. Set `CLOUDINARY_CLOUD_NAME`,
  `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for avatar uploads. Without them, image
  uploads are silently skipped. Old base64 images can be migrated via
  `node scripts/migrate-images.js`.
- **Cleaning reminder (2083/05/06 BS)**: cron `0 6 * * 6` Asia/Kathmandu (node-cron) plus
  a startup catch-up that only fires on a Kathmandu Saturday. Dedup via the
  `cleaning-saturday-<date>` refKey (unique sparse index), so restarts can't duplicate.
  Next-partner emails/in-app notifications fire after a partner completes their own turn
  (not on admin-recorded completions).
- **Settlement index repair (2083/04/31 BS)**: the `settlements` collection carried a stale
  legacy unique index `bsYear_1_bsMonth_1_category_1` (3-field) left over from before the
  `group` field existed. It made secondary settlements of different groups collide with
  `E11000` for the same month (schema index is correctly 4-field: `+ group`). Dropped via
  `backend/src/scripts/repair-settlement-index.js` (`node src/scripts/repair-settlement-index.js`).
  `settleScope` also now retries on `code 11000` by re-fetching the existing record so a
  concurrent upsert (auto-settle cron racing a manual settle) can't 500 mid-cascade.
- Frontend build env needs `VITE_BASE_URL` (defaults to `/api`; dev proxy: Vite → `http://localhost:5000`).
- Auth flow: httpOnly cookies (`accessToken` + `refreshToken`) set by backend on login;
  `withCredentials: true` on all axios requests; 401 triggers `POST /api/auth/refresh`
  which rotates tokens and retries. User profile in a non-httpOnly `user` cookie,
  read by `getAuthData()`. Logout calls `POST /api/auth/logout` to clear cookies +
  DB refresh token. `verifyJWT` reads `req.cookies.accessToken` first, falls back to
  `Authorization: Bearer` header.
- Auto-settle: cron `30 0 * * *` Asia/Kathmandu, fires on BS day 1, settles the previous BS month
  (All + Primary + each group's Secondary). Auto-settled settlements cannot be reverted.
- Settlement math is paise-exact (`splitPaise`); legacy records without `settleActions`
  are treated as auto-settled when `settledBy` is unset.
