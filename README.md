# React Boilerplate

Login-gated Vite SPA (Yarn, React Router, TanStack Query, shadcn-style UI, Biome) talking to `../django-boilerplate` over JWT.

Shared SPECS: `../fullstack-bootstrap/specs/`.

## Setup

```bash
cp .env.example .env
yarn install
yarn openapi-ts   # if schema changed; generated client is committed
yarn playwright install chromium   # once, for E2E
yarn dev
```

Open `http://localhost:5173/login`.

## OpenAPI client

After backend API changes:

```bash
cd ../django-boilerplate && make schema
cd ../react-boilerplate && yarn openapi-ts
```

Do not hand-edit `src/shared/api`.

## Testing (Playwright E2E)

Browser tests hit the **live Django API**. Prefer these over Vitest/RTL for auth, CRUD, and permissions.

1. In `django-boilerplate`: `make migrate && make seed-e2e && make run`
2. Here:

```bash
yarn test:e2e       # or: make test-e2e
yarn test:e2e:ui
```

Playwright starts Vite on `:5173` (or reuses an existing `yarn dev`). Specs are under `e2e/`.

Seeded logins (from `seed_e2e`): `e2e-admin@example.com` / `e2e-viewer@example.com`, password `e2epass123`.

## Agent rules

See `AGENTS.md` and `../fullstack-bootstrap/specs/05-agent-conventions.md`.
Use `yarn add` — do not hand-edit lockfiles when the CLI works.
