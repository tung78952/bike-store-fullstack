# Velos Enterprise Frontend

React + Tailwind + Axios frontend for LightWeightBikeStore backend.

## Run

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build production bundle

```bash
npm run build
```

## Environment

Create `.env` in this folder:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

If `.env` is not provided, app defaults to `http://localhost:8000`.

## Implemented Modules

- Authentication (login, token-based session, profile update)
- Dashboard (overview, staff sales, top products, top customers)
- Orders (list/filter/create/detail/update/delete admin, order items CRUD)
- Customers (list/filter/create/update/delete admin)
- Products (list/filter/create/update/delete admin)
- Brands (CRUD admin)
- Categories (CRUD admin)
- Staff management (CRUD admin + active toggles)
- Statistics (store series, top lists, staff by id)

## Design Language

Implemented following the design principles in DESIGN.md:
- Surface layering over hard borders
- Mechanical navy + emerald palette
- Be Vietnam Pro headline + Inter body
- Gradient primary CTA and high-density data cards
