# SmartLedger / Fuel Manager — Architectural Breakdown

*Generated from repository analysis. Package name: `fuel-manager-fe`.*

---

## 1. High-level overview

### Application purpose

**Single-page application (SPA)** for fuel / retail operations: **product & inventory**, **island (portfolio/shift) sales & cashflow**, **customers & credit**, **staff**, **global cashflow & transaction ledger**, **reports**, **tally**, and **domain settings** (banking/modes, profile). The UI targets operational workflows (meter readings, cashflow entries, credit tracking) with dashboards and export/print.

### Tech stack

| Layer | Technology |
|--------|------------|
| **UI** | React 18, JSX |
| **Routing** | `react-router-dom` v6 (`BrowserRouter`, nested `Routes`) |
| **Styling** | Tailwind CSS 3, SCSS entry (`index.scss`), `class-variance-authority`, Radix UI primitives (`@/components/ui/*`) |
| **Forms** | `react-hook-form`, Zod (`@hookform/resolvers`) |
| **Tables** | `@tanstack/react-table` (e.g. `BaseTable`) |
| **Server state** | `@tanstack/react-query` v5 (`QueryClientProvider` in `main.jsx`) |
| **Client state** | **Zustand** (primary); **Redux / RTK / redux-persist** are **listed in `package.json` but not wired** in `src/` (dead dependencies) |
| **HTTP** | Axios (`src/services/apiService.js` and feature-local axios instances) |
| **Auth token** | Read from Zustand `useAuthStore`; `axios401RefreshInterceptor` for refresh |
| **Toasts** | `react-hot-toast` |
| **PDF export** | Dynamic `import('html2pdf.js')` (e.g. Tally page) |
| **Tests** | Vitest, Testing Library (`src/test/`) |
| **Mock API** | MSW v2 (`public/mockServiceWorker.js`, `VITE_APP_MOCK === 'true'`) |
| **Build** | Vite 6, `@` → `src/` alias (`vite.config.js`, `jsconfig.json`) |

### Backend & infra

- **No backend code in this repo.** The app expects a REST API at `import.meta.env.VITE_BASE_URL`.
- **Deployment:** multi-stage **Dockerfile** (Node build → **nginx:stable-alpine** serving `dist/`). `docker-compose.yml` passes `VITE_BASE_URL`. **Bitbucket** pipeline / `deploy.sh` / `nginx*.conf` support static hosting + env injection.
- **Architecture type:** **Modular frontend monolith** — one deployable SPA, feature folders under `src/pages/*`, shared `components`, `store`, and `services`.

---

## 2. Folder structure

### Full tree (repository root, excluding `node_modules`, `dist`, `.git`)

```
.
├── Dockerfile
├── docker-compose.yml
├── bitbucket-pipelines.yml
├── deploy.sh
├── nginx.conf
├── nginx/
├── index.html
├── package.json
├── vite.config.js
├── vitest.config.js
├── tailwind.config.js
├── postcss.config.js
├── components.json          # shadcn-style UI config
├── jsconfig.json            # @ → src
├── propTypes.js
├── public/
│   ├── mockServiceWorker.js
│   └── vite.svg
├── store/                   # Zustand stores (ROOT — not under src/)
│   └── use*.js
├── docs/
├── src/
│   ├── main.jsx             # QueryClient + Router + MSW bootstrap
│   ├── App.jsx              # Auth gate + top-level routes
│   ├── ScrollableApp .jsx   # NOTE: filename contains a space
│   ├── index.scss
│   ├── App.css
│   ├── assets/
│   ├── components/          # layout, table, form, ui, etc.
│   ├── lib/
│   ├── pages/               # feature modules (see §3)
│   ├── services/            # axios + apiService (main)
│   ├── store/               # AuthContext, useUIStore (sparse)
│   ├── utils/               # queryClient, queryConfig, queryUtils
│   ├── queryHooks/
│   ├── mocks/               # MSW handlers, db, ryw.js
│   └── test/
└── QUERY_MIGRATION_SUMMARY.md / README.md
```

### Major folders — purpose, responsibilities, anti-patterns

| Folder | Purpose | Key responsibilities | Anti-patterns / risks |
|--------|---------|----------------------|------------------------|
| **`store/` (root)** | Global Zustand stores used across pages | Auth, portfolio, island tabs, cashflow, customer, inventory, ledger, integrated reports, etc. | Imports often use **`../src/pages/...`** — couples root `store/` to `src/` paths; **duplicates** mental model with `src/store/`. |
| **`src/store/`** | Secondary state | `AuthContext.jsx`, `useUIStore.js` — small surface | Splitting “store” across **two** locations is confusing. |
| **`src/pages/`** | Feature modules | Route-mounted screens; each may have local `api/` or `Components/` | Inconsistent API placement (`Cashflow/API`, `Reports/API`, `Customer/api`, `Inventory/api` vs central `services/apiService.js`). |
| **`src/services/`** | Shared HTTP | `apiService.js` (large), `axiosRefreshOn401.js`, `AuthService/` | Multiple axios instances (e.g. Cashflow `apiService.jsx`) → **duplicate interceptors** and drift risk. |
| **`src/components/`** | Reusable UI | `ui/` (Radix wrappers), `Table/`, `AppLayout/`, `Form/`, etc. | Some pages are very large; smart/dumb split uneven. |
| **`src/mocks/`** | API simulation | `handlers/*.js`, `db/seed.js`, **`ryw.js`** (read-your-writes mutations), `browser.js` | `domain.js` is very large; MSW order matters (`handlers/index.js`). |
| **`src/queryHooks/`** | React Query hooks | `storeCachedQueries/*` for island tabs (sales, cashflow, inventory, customer) | Not all features migrated — **parallel** Zustand fetch + React Query patterns. |
| **`src/lib/`** | Schemas, utils | e.g. `schemas/`, formatters | — |
| **`src/utils/`** | Query client config | Centralized `QUERY_KEYS`, `queryClient` | Good; some features bypass and call axios directly. |
| **`public/`** | Static assets | MSW worker | — |
| **`nginx/`** | Server config | SPA fallback for client routing | — |

---

## 3. Module / feature breakdown

| Module | Responsibility | Entry / route | Key files | Dependencies |
|--------|----------------|---------------|-----------|--------------|
| **Auth** | Login, register, OTP, forgot password | `/login`, `/register`, … | `pages/AuthV2/*`, `store/useAuthStore.js`, `services/apiService.js` | Axios, Zustand |
| **Product / pricing** | Product list, details, pricing UI | `/product-management`, `/product-management/:product` | `pages/Product/*`, `InventoryManagement` | API via `apiService`, stores as needed |
| **Inventory** | Stock list, details, alerts, transactions | `/inventory-management`, nested routes | `pages/Inventory/*`, `inventoryService.js`, `useInventoryStore`, `useInventoryQueries` | React Query + Zustand |
| **Island** | Portfolio → shifts → **Sales** / **Cashflow** tabs | `/island-management`, `/island-management/:portfolioName`, tally: `.../:portfolioName/tallyreport_*` | `IslandManagement`, `island-details.jsx`, `SalesTab`, `CashflowTab`, `IslandDynamicTable` | `useSalesTabQuery`, `useCashflowTabQuery`, `usePortfolioStore`, `useGlobalStore` (date) |
| **Tally** | Printable tally report | Nested under island: `TallyPage` | `pages/Tally/*`, `usePortfolioSalesTallyStore`, `POST /tally/get` | Zustand + `getTallySummary` |
| **Customer** | CRM-style list, credit, vehicle, reports | `/customer-management`, customer detail routes | `CustomerManagement.jsx`, `CustomerService.js`, `useCustomerQueries` | Mixed API module |
| **Credit** | Global credit views | `/global-credit` | `pages/Credit/*` | Credit stores |
| **Cashflow (app-level)** | Transaction ledger + global entries (not island tab) | `/cashflow` | `pages/Cashflow/Cashflow.jsx`, **separate** `pages/Cashflow/API/apiService.js`, `useTransactionLedgerStore`, `useGlobalEntriesStore` | Duplicate axios stack |
| **Reports** | Sales / integrated cashflow reports | `/reports` | `SalesReports.jsx`, `useIntegratedCashflowStore`, `Reports/API/cashflow_integration_service.jsx` | Own axios instance |
| **Staff** | Staff management | `/staff-management` | `pages/Staff/*`, `useEmployeeStore` | — |
| **Domain settings** | Banking, modes, profile | `/settings/*`, `/user-profile/*` | `BankingPayments.jsx`, `useBankAccountStore`, `ProfileLayout`, `useUserProfileDetails` | `apiService`, MSW session |
| **Layout / shell** | Sidebar, header, nav | Wraps all authenticated routes | `components/AppLayout/*` | `useAuthStore`, portfolio list APIs |

---

## 4. Data flow

### Typical path

1. **UI** — User action in a page or tab component.
2. **State** — Either:
   - **Zustand:** `useXStore.getState().fetch…()` or hook-triggered effects (many legacy flows), or
   - **TanStack Query:** `useQuery` / `useMutation` in `queryHooks/storeCachedQueries/*` (island sales/cashflow/inventory/customer).
3. **API** — `axios` to `VITE_BASE_URL` + path (e.g. `/meter_reading/...`, `/cashflow/...`). Token attached in interceptor from `useAuthStore`.
4. **Backend** — External REST API (not in repo).
5. **Response** — Parsed as `response.data`; store `set()` or query cache update; MSW can short-circuit when `VITE_APP_MOCK=true`.

### State management approach (explicit)

- **Zustand** is the **dominant** global pattern for feature state and server-backed lists where React Query was not adopted.
- **TanStack Query** is used for **cached server state** with `QUERY_KEYS` and invalidation on mutations (island flows).
- **No Redux store** is mounted despite dependencies — **RTK/redux-persist are unused** in application code.

### Notable inconsistency

- **Island** features increasingly use **React Query**; **Cashflow page**, **Reports**, **Ledger**, **Settings** rely heavily on **Zustand + direct axios** — two coexist without a single data-access layer.

---

## 5. API layer

### Structure

- **`src/services/apiService.js`** — Large central file: auth, products, meter, cashflow (island), tally, customer, bank/mode, portfolio, credit, stock, employees, organisation, user, etc.
- **`src/pages/Cashflow/API/apiService.js`** — **Second axios instance** for cashflow ledger/global endpoints (same env base URL pattern).
- **`src/pages/Reports/API/cashflow_integration_service.jsx`** — Third axios instance for report endpoints.
- **`src/pages/Reports/API/apiservice.jsx`** — Report overview endpoints (naming collision: `apiservice` vs `apiService`).
- **`src/pages/Customer/api/CustomerService.js`**, **`src/pages/Inventory/api/inventoryService.js`** — Feature-scoped wrappers.

### How calls are handled

- Shared pattern: `axios.create({ baseURL: VITE_BASE_URL })`, request interceptor adds `Authorization: Bearer <token>`, response uses **`axios401RefreshInterceptor`** for 401 refresh.
- **Error handling:** Mix of `try/catch` + `throw new Error(message)`, `console.error`, and **react-hot-toast** in mutations. **No unified error boundary** for API failures across the app. Some endpoints return `{ ok: true }` vs `{ status: true }` — stores had to be adjusted (e.g. global entries) for mock parity.

### Inconsistencies (specific)

- **Multiple axios instances** → duplicated interceptors and risk of **different behavior** per feature.
- **Relative imports from `store/` to `src/pages/...`** for API modules (e.g. `useGlobalEntriesStore`) break the usual “`@/` = src” convention.
- **`getTallySummaryByDate`** historically used path without leading `/` (fixed in places to `/tally/...`) — easy to mis-resolve against `baseURL`.

---

## 6. State management

### What is used

| Mechanism | Usage |
|-----------|--------|
| **Zustand** | Primary: `store/use*.js` stores for auth, portfolio, island context, cashflow, customers, inventory, ledger, integrated cashflow, tally, bank accounts, profile, etc. |
| **TanStack Query** | Island-related data: sales products, cashflow tab, inventory, customers (see `queryHooks/storeCachedQueries`) |
| **React Context** | `AuthContext` in `src/store` (limited); Radix/shadcn contexts inside UI |
| **Redux** | **Not used in `src/`** — packages are dead weight unless removed |

### Structure

- **Flat Zustand stores** per domain — no shared normalized entity cache.
- **Query keys** centralized in `src/utils/queryConfig.js` (`QUERY_KEYS`).

### Problems

- **Duplication:** Same domain (e.g. cashflow) may be represented in **island** cashflow + **global** cashflow + **reports** with different stores and APIs.
- **Over-fetching / stale UI:** Zustand + manual `fetch` without React Query **staleTime** semantics unless carefully invalidated.
- **Tight coupling:** Stores importing page-level API paths (`../src/pages/...`) ties infrastructure to folder structure.

---

## 7. Component architecture

### Reusability

- **Strong:** `components/ui/*` (Radix + Tailwind), `BaseTable`, layout primitives, `DateFilter` — used across features.
- **Weaker:** Large page components (e.g. customer, island) mix **data loading, validation, and layout** in one file.

### Smart vs dumb

- **Island:** `IslandDynamicTable` + tab components are somewhat reusable; **containers** (`island-details.jsx`) orchestrate navigation and shift state (**smart**).
- **Dumb** presentational pieces exist (tables, cards) but many **pages** remain **smart** end-to-end.

### Violations / smells

- **TallyPage** treats API payload as **array tuple** `[salesMap, incomeExpense, tally]` — fragile contract; errors when mock returned an object (fixed in mocks, but contract remains implicit).
- **Filename:** `src/ScrollableApp .jsx` has a **trailing space** — breaks tooling and imports on strict systems.

---

## 8. Utilities & shared logic

| Area | Notes |
|------|--------|
| **`@/lib/utils`** | `cn()`, `formatINR` (formatters) |
| **`src/utils/queryConfig.js`** | Query keys, stale times — **good** centralization |
| **`src/mocks/ryw.js`** | **Read-your-writes** helpers mutating `db` for MSW — **high** reuse for demo parity |
| **`src/mocks/db/seed.js`** | In-memory seed state |
| **Duplication** | Similar “bucket key” logic (`cfKey`) in `ryw.js` vs handlers; multiple CSV export implementations (e.g. reports) |

---

## 9. Performance risks

| Risk | Evidence |
|------|----------|
| **Large bundle** | Vite reports **~2.1MB** main JS chunk after build — **html2pdf**, **framer-motion**, **full icon set** (lucide) pull weight |
| **Dynamic import** | `html2pdf.js` loaded on demand for tally PDF — good |
| **Re-renders** | Zustand + large lists without virtualization in some tables |
| **MSW in dev** | `worker.start` adds overhead; acceptable for dev |

---

## 10. Code quality issues (specific)

| Issue | Detail |
|-------|--------|
| **Tight coupling** | Root `store/` imports `../src/pages/.../apiService` |
| **Dead dependencies** | `@reduxjs/toolkit`, `react-redux`, `redux`, `redux-persist`, `redux-logger` unused in app source |
| **Naming** | `fuel-manager-fe` vs product branding (“SmartLedger”); duplicate `apiservice` vs `apiService` |
| **Two `store` directories** | `store/` vs `src/store/` |
| **API response contracts** | Implicit shapes (tally array, ledger `success/data`) — easy to break mocks or backend |
| **Tests** | Vitest present; coverage unknown — **not** exhaustive from tree alone |

---

## 11. Scalability analysis

### Can this scale to 10× users?

- **Frontend scale:** Static SPA on nginx scales **horizontally**; **per-user load** is browser-side — OK.
- **Bottlenecks:** **Backend API** and **DB** (not in repo) dominate; **large JS bundle** hurts **slow networks** and mobile.
- **Team scale:** **Feature-local APIs** and **split state** increase merge conflicts and inconsistent patterns — **medium** risk as team grows.

---

## 12. Final verdict

### Strengths (keep)

- **Vite + React + Tailwind + Radix** — modern, fast dev.
- **TanStack Query** + **query key factory** for newer island flows.
- **MSW + `ryw.js` + seeded `db`** — strong **demo and local dev** story when `VITE_APP_MOCK=true`.
- **Axios** interceptors + **401 refresh** centralized in main `apiService`.
- **Docker + nginx** — simple production deploy for static assets.

### Weaknesses (fix soon)

1. **Remove or adopt Redux** — remove unused packages or commit to one global store.
2. **Consolidate API layer** — one axios factory + feature modules; **eliminate** `../src/pages` imports from root `store/`.
3. **Unify `store/` location** — move root `store/` under `src/` or use `@/store` with path aliases.
4. **Normalize** Cashflow/Reports/Customer API usage (single module, shared types).
5. **Rename** `ScrollableApp .jsx` (remove space).
6. **Split** large `apiService.js` and `domain.js` MSW handler by domain.

### Risk level

| Area | Level |
|------|--------|
| **Maintainability** (split state, duplicate HTTP) | **Medium–High** |
| **Runtime / security** | **Medium** (token in Zustand; standard SPA risks) |
| **Deploy / ops** | **Low** (static SPA + env) |

---

## 13. Appendix — environment & mock

| Variable | Role |
|----------|------|
| `VITE_BASE_URL` | API origin for axios |
| `VITE_APP_MOCK` | When `"true"`, starts MSW in `main.jsx` |

MSW handlers: `auth` → `session` → `reports` → `domain` (`handlers/index.js`).

---

*End of document.*
