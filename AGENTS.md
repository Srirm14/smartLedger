# SmartLedger FE — Agent Prompt File

> Feed this file to any AI agent (Cursor / Windsurf / Claude) before asking it to do anything.
> It has full context about this codebase. No need to re-explain.

---

## Who I am & what this repo is

I am a Senior Frontend Engineer. This is my portfolio project — **SmartLedger** (package: `fuel-manager-fe`).

It is a **React 18 SPA** for fuel/retail operations — covering inventory, island sales & cashflow, customer credit, staff, transaction ledger, reports, tally, and settings.

**My goal:** Strip the backend dependency, run 100% on MSW mocks, deploy the FE-only to Vercel as a portfolio demo that showcases my TanStack Query architecture and caching patterns.

---

## Tech stack (exact)

| Layer | Tech |
|-------|------|
| UI | React 18, JSX |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS 3, SCSS, Radix UI (`@/components/ui/*`) |
| Forms | react-hook-form + Zod |
| Tables | @tanstack/react-table |
| Server state | **@tanstack/react-query v5** — QueryClientProvider in `main.jsx` |
| Client state | **Zustand** (primary — `store/use*.js` at repo root) |
| HTTP | Axios — multiple instances (see API layer below) |
| Auth token | Zustand `useAuthStore` + `axios401RefreshInterceptor` |
| Toasts | react-hot-toast |
| PDF | dynamic `import('html2pdf.js')` — tally page only |
| Mock API | **MSW v2** — `public/mockServiceWorker.js`, `src/mocks/` |
| Build | Vite 6, `@` → `src/` alias |
| Deploy | nginx (Docker) / Vercel (portfolio) |

---

## Folder structure (key paths)

```
.
├── store/                        ← ROOT-level Zustand stores (NOT under src/)
│   └── use*.js                   ← useAuthStore, usePortfolioStore, useCashflowStore, etc.
├── src/
│   ├── main.jsx                  ← QueryClient + Router + MSW bootstrap (VITE_APP_MOCK)
│   ├── App.jsx                   ← Auth gate + top-level routes
│   ├── pages/                    ← Feature modules
│   │   ├── AuthV2/               ← Login, register, OTP, forgot password
│   │   ├── Product/              ← Product list, pricing
│   │   ├── Inventory/            ← Stock, alerts, transactions
│   │   │   └── api/inventoryService.js
│   │   ├── IslandManagement/     ← Portfolio → shifts → Sales/Cashflow tabs
│   │   │   └── island-details.jsx
│   │   ├── Tally/                ← Printable tally report
│   │   ├── Customer/             ← CRM, credit, vehicles
│   │   │   └── api/CustomerService.js
│   │   ├── Credit/               ← Global credit views
│   │   ├── Cashflow/             ← Transaction ledger + global entries
│   │   │   └── API/apiService.js ← SECOND axios instance (not shared)
│   │   ├── Reports/              ← Sales + integrated cashflow
│   │   │   ├── API/cashflow_integration_service.jsx ← THIRD axios instance
│   │   │   └── API/apiservice.jsx
│   │   ├── Staff/                ← Staff management
│   │   └── Settings/             ← Banking, modes, profile
│   ├── services/
│   │   ├── apiService.js         ← PRIMARY axios instance (auth, products, meter, tally, etc.)
│   │   └── axiosRefreshOn401.js  ← 401 refresh interceptor
│   ├── components/               ← BaseTable, AppLayout, ui/, Form/, DateFilter
│   ├── queryHooks/
│   │   └── storeCachedQueries/   ← useSalesTabQuery, useCashflowTabQuery, useInventoryQueries, useCustomerQueries
│   ├── utils/
│   │   ├── queryConfig.js        ← QUERY_KEYS centralized here
│   │   └── queryClient.js        ← QueryClient instance
│   ├── mocks/
│   │   ├── browser.js            ← MSW worker setup
│   │   ├── handlers/
│   │   │   ├── index.js          ← Order: auth → session → reports → domain
│   │   │   ├── auth.js
│   │   │   ├── session.js
│   │   │   ├── reports.js
│   │   │   └── domain.js         ← Large — covers most CRUD endpoints
│   │   ├── db/seed.js            ← In-memory seed data
│   │   └── ryw.js                ← Read-your-writes helpers (mutate db after POST/PUT)
│   ├── store/                    ← src-level: AuthContext.jsx, useUIStore.js only
│   └── lib/                      ← schemas/, cn(), formatINR
├── public/
│   └── mockServiceWorker.js      ← MSW service worker (committed)
└── .env / .env.production
```

---

## Environment variables

| Variable | Role |
|----------|------|
| `VITE_BASE_URL` | API origin for all axios instances |
| `VITE_APP_MOCK` | When `"true"` → MSW starts in `main.jsx`, no real BE needed |

**For portfolio/Vercel:** set `VITE_APP_MOCK=true` in `.env.production`. App runs fully in browser.

---

## Auth flow (exact)

- Login hits `POST /auth/login` via `src/services/apiService.js`
- On success → token stored in **Zustand `useAuthStore`** (not localStorage directly — check store)
- All axios instances attach `Authorization: Bearer <token>` via request interceptor
- **Test credentials for portfolio demo:** `username: test` / `password: test123`
- `axios401RefreshInterceptor` handles token refresh on 401

---

## MSW setup (already partially done)

MSW v2 is **already installed**. Key files exist:

- `public/mockServiceWorker.js` ✅
- `src/mocks/browser.js` ✅
- `src/mocks/handlers/` ✅ (auth, session, reports, domain)
- `src/mocks/db/seed.js` ✅
- `src/mocks/ryw.js` ✅ (read-your-writes for POST/PUT mutations)

MSW starts in `main.jsx` when `VITE_APP_MOCK === 'true'`.

**Handler order matters:** `auth → session → reports → domain` (defined in `handlers/index.js`)

---

## API layer — multiple axios instances (important)

This app has **3 separate axios instances** — all point to `VITE_BASE_URL`:

| Instance | File | Covers |
|----------|------|--------|
| Primary | `src/services/apiService.js` | Auth, products, meter readings, tally, customers (partial), bank, portfolio, credit, stock, employees, org, user |
| Cashflow | `src/pages/Cashflow/API/apiService.js` | Transaction ledger, global cashflow entries |
| Reports | `src/pages/Reports/API/cashflow_integration_service.jsx` | Integrated cashflow reports |
| Reports2 | `src/pages/Reports/API/apiservice.jsx` | Report overview endpoints |

**When writing MSW handlers:** URLs must match the `baseURL + path` of each instance. All share the same `VITE_BASE_URL` origin so MSW intercepts all of them.

---

## State management — two patterns coexist

### Pattern 1: TanStack Query (newer, island features)

Used in: `queryHooks/storeCachedQueries/` for sales tab, cashflow tab, inventory, customers

- Query keys centralized: `src/utils/queryConfig.js` → `QUERY_KEYS`
- Invalidation on mutations
- `staleTime` / `gcTime` configured

### Pattern 2: Zustand + direct axios (older, majority of app)

Used in: Cashflow page, Reports, Ledger, Settings, Staff, most domain stores

- Stores in `store/use*.js` (repo root)
- Manual `fetchX()` methods inside each store
- No staleTime semantics — fetch on mount

**Do NOT break either pattern.** Both must work with MSW.

---

## Known issues / gotchas (read before touching anything)

1. **Two `store/` directories** — `store/` at repo root AND `src/store/`. Root one is primary (all feature stores). `src/store/` has only `AuthContext` and `useUIStore`.

2. **Root store imports src/pages paths** — `store/useGlobalEntriesStore.js` and others import from `../src/pages/.../apiService` directly. Don't move files without updating these.

3. **Tally API returns array tuple** — `POST /tally/get` returns `[salesMap, incomeExpense, tally]` as array, NOT an object. `TallyPage` destructures by index. MSW mock must return array in this exact shape.

4. **Cashflow response shape** — some endpoints return `{ ok: true }`, others `{ status: true }`, others `{ success: true, data: [] }`. Stores are adjusted for mock parity — don't normalize without checking each store.

5. **Filename with space** — `src/ScrollableApp .jsx` has a trailing space. Don't rename without checking all imports.

6. **Dead dependencies** — `@reduxjs/toolkit`, `react-redux`, `redux`, `redux-persist`, `redux-logger` are in `package.json` but NOT used anywhere in `src/`. Do not wire them.

7. **Multiple axios instances** — each has its own interceptor. If you add a new interceptor, add it to ALL instances or they'll behave inconsistently.

8. **Handler order in MSW** — `handlers/index.js` order is `auth → session → reports → domain`. More specific routes must come before catch-all routes.

9. **`ryw.js` read-your-writes** — after every POST/PUT/PATCH in MSW handlers, call the appropriate `ryw` helper to update the in-memory `db` so subsequent GETs return updated data.

---

## TanStack Query architecture (showcase goals)

This is the most important part for the portfolio. When improving or extending:

### Query key factory pattern (centralized in `src/utils/queryConfig.js`)

```js
// Structure: [scope, entity, params]
QUERY_KEYS.sales.list({ portfolioId, date })
QUERY_KEYS.inventory.detail(productId)
```

### Caching patterns to highlight

- `staleTime` — how long cached data is fresh (no refetch)
- `gcTime` — how long unused cache is kept in memory
- Optimistic updates on mutations (update cache before server confirms)
- Cache invalidation — `queryClient.invalidateQueries(QUERY_KEYS.sales.list(...))`
- Prefetch on hover — `queryClient.prefetchQuery(...)`

### Do NOT change existing query hooks

MSW intercepts at network level. `useQuery` / `useMutation` hooks stay 100% untouched.

---

## Vercel deployment (portfolio)

- Only the `src/` + `public/` FE is deployed — no backend
- `.env.production` must have `VITE_APP_MOCK=true`
- `vercel.json` must have SPA fallback: all routes → `index.html`
- `public/mockServiceWorker.js` must be committed and served at root
- Build command: `npm run build`
- Output dir: `dist`

---

## What "done" looks like for portfolio demo

- `npm run dev` starts with no backend running
- Login with `test` / `test123` works
- All major routes load with realistic seed data (15–20 records per entity minimum)
- Island → portfolio → shift → Sales tab shows meter readings, products, totals
- Island → Cashflow tab shows entries
- Customer list, credit, vehicles load
- Reports load with chart-ready data
- Tally page renders and PDF export works
- No console errors about failed API calls
- TanStack Query devtools shows queries cached correctly
- Vercel deploy works as static site — visitor needs zero backend

---

*End of context file. Feed this to any agent before starting work.*
