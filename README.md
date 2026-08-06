# React Boilerplate

Login-gated Vite SPA (Yarn, React Router, TanStack Query, shadcn-style UI, Biome) talking to `../django-boilerplate` over JWT.

Shared SPECS: `../fullstack-bootstrap/specs/`.

**Docker-first:** Vite, Playwright, and the E2E stack (Postgres + Django + frontend) run via Docker Compose. Make wraps Compose.

## Setup

```bash
cp .env.example .env
make build
make dev
```

Open `http://localhost:5173/login` (expects the Django API on `http://localhost:8000` via `make run` in the sibling repo).

## OpenAPI client

After backend API changes:

```bash
cd ../django-boilerplate && make schema
cd ../react-boilerplate && make openapi-ts
```

Do not hand-edit `src/shared/api`.

## Testing (Playwright E2E)

Browser tests hit the **live Django API** inside Compose. Prefer these over Vitest/RTL for auth, CRUD, and permissions. New/changed auth or CRUD UI **must** extend these specs.

```bash
make test-e2e       # migrate + seed + Playwright (Compose)
make test-e2e-2fa   # LOGIN_2FA_ENABLED=True + auth.2fa.spec.ts
```

OTP helpers read codes from Postgres on the Compose network (`E2E_DATABASE_URL`). Specs are under `e2e/`.

Seeded logins (from `seed_e2e`): `e2e-admin@example.com` / `e2e-viewer@example.com`, password `e2epass123`.

## Agent rules

See `AGENTS.md` and `../fullstack-bootstrap/specs/05-agent-conventions.md`.
Use `yarn add` via Compose — do not hand-edit lockfiles when the CLI works.
