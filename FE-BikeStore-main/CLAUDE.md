# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`velos-enterprise` — React SPA that consumes the `LightWeightBikeStore` backend. Design system is documented in [DESIGN.md](DESIGN.md) (codename **"The Precision Atelier" / "Mechanical Ledger"**) — read it before any UI work, it is load-bearing (strict color palette, no-border rule, typography tokens).

## Commands

```bash
npm install
npm run dev       # Vite dev server on port 5173
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle
```

There are **no lint, format, or test scripts** configured — adding one requires wiring it into `package.json` first. Do not assume `npm test` exists.

## Environment

Create `.env` at project root:

```
VITE_API_BASE_URL=http://localhost:8000
```

Fallback if unset is `http://localhost:8000` (hardcoded in [src/api/client.js](src/api/client.js)). The backend must be running on that URL for anything beyond the login page to work.

## Architecture

### Routing & guards — [src/App.jsx](src/App.jsx)

Flat route table wrapped by two guards from [src/auth/RouteGuards.jsx](src/auth/RouteGuards.jsx):

- `<ProtectedRoute>` — any authenticated staff: `/orders`, `/orders/:orderId`, `/customers`, `/products`, `/profile`
- `<AdminRoute>` — `role === "ADMIN"` only: `/dashboard`, `/brands`, `/categories`, `/staffs`, `/statistics`
- Public: `/login`, `/access-denied`

Non-authenticated staff hitting an admin route is redirected to `/access-denied` (not `/login`). `/` redirects to `/dashboard`. All protected routes are wrapped in `<AppLayout>` = `AppShell` (sidebar + topbar + content frame).

When adding a new page: add the import + `<Route>` in `App.jsx` under the correct guard, then add the sidebar link in [src/components/layout/Sidebar.jsx](src/components/layout/Sidebar.jsx).

### Auth — [src/auth/AuthContext.jsx](src/auth/AuthContext.jsx)

Single source of truth for session. `AuthProvider` wraps the app in [src/main.jsx](src/main.jsx). Exposes `{ user, loading, login, logout, refreshMe, isAdmin }` via `useAuth()`.

Flow:
1. On mount, reads `access_token` from `localStorage` and calls `authApi.me()` to hydrate `user`. If it fails, the token is wiped.
2. `login(payload)` POSTs to `/api/auth/login` (JSON endpoint, **not** the OAuth2 `/token` form endpoint), stores the token, re-fetches `/me`.
3. `logout()` clears local state only — no backend call.

### API layer — [src/api/](src/api/)

- [src/api/client.js](src/api/client.js) — the single Axios instance. Request interceptor attaches `Authorization: Bearer <token>` from localStorage. Response interceptor **hard-redirects to `/login` via `window.location.href`** on any 401 (bypasses React Router). Do not add a second axios instance; extend this one.
- [src/api/services.js](src/api/services.js) — domain-grouped API objects (`authApi`, `brandsApi`, `categoriesApi`, `productsApi`, `customersApi`, `ordersApi`, `staffsApi`, `statisticsApi`). Every new backend endpoint must be added here — pages should never call `api.get` directly.

### Pages — [src/pages/](src/pages/)

One file per route. Pattern: each page owns its own data fetching (no central store, no React Query), uses `useState` + `useEffect`, renders `react-hot-toast` notifications via `getErrorMessage(error)` from [src/utils/helpers.js](src/utils/helpers.js).

### UI primitives — [src/components/ui/Ui.jsx](src/components/ui/Ui.jsx)

All shared primitives (buttons, inputs, cards, chips, etc.) live in this single file. Extend it rather than creating one-off components. The Tailwind config in [tailwind.config.js](tailwind.config.js) defines the full token set (`surface`, `primary`, `secondary`, shadows `ambient`/`diffusion`, gradient `primary-gradient`, fonts `headline`/`body`/`mono`) — always use these tokens instead of raw hex/arbitrary values.

### Fonts

Google Fonts (Be Vietnam Pro, Outfit, JetBrains Mono) are preconnected + loaded in [index.html](index.html). The Tailwind config declares `body: ["Outfit", ...]` but the README mentions "Inter body" — the running font is **Outfit**, not Inter. DESIGN.md is stylistic intent, not always literal.

## Conventions

- **Status codes:** Order status is an integer 1–4 (Pending/Processing/Rejected/Completed) — use `orderStatusOptions` / `orderStatusMap` from [src/utils/helpers.js](src/utils/helpers.js), never hardcode.
- **Currency:** Format with `formatCurrency()` (VND, `vi-VN` locale, no decimals).
- **Errors:** Always surface via `toast.error(getErrorMessage(error))` — the helper unwraps FastAPI's `{ detail: "..." }` shape.
- **Class names:** Compose with `cn(...)` from helpers, not template strings.
- **Design rules from DESIGN.md that are enforced by code review:** no 1px solid borders for layout sectioning (use surface elevation), no pure black text (use `on-surface`), no drop shadows (use `ambient`/`diffusion` tokens), no decorative icons.

## Backend coupling

The backend contract lives in [../LightWeightBikeStore-main/](../LightWeightBikeStore-main/). Key things to know without leaving this project:

- Auth: JWT Bearer. Login uses `/api/auth/login` (JSON). The profile endpoint is `/api/auth/me` and returns `{ ..., role: "ADMIN" | "STAFF", is_active, ... }`.
- All resource endpoints are prefixed `/api/<resource>`; see [src/api/services.js](src/api/services.js) for the full surface the frontend uses.
- Admin-only backend routes will return 403; the frontend mirrors this by gating with `<AdminRoute>`. If a user sees 403 on a page they should access, check the guard first, then the backend role check.
