# Agent guidelines (react-boilerplate)

- Development is **Docker-first**: use Make / `docker compose` (not host `yarn`) for dev, lint, openapi-ts, and E2E.
- Add dependencies with `docker compose run --rm frontend yarn add` / `yarn add -D` only.
- After backend API changes: regenerate schema in django-boilerplate (`make schema`), then `make openapi-ts`.
- Do not hand-edit `src/shared/api` generated output.
- Keep the app private: only `/login` (and forgot/reset password pages) are public; all features under the authenticated shell.
- **Must** add/update Playwright E2E under `e2e/` for new/changed auth/CRUD/permissions UI; leave `make test-e2e` green. Do not ask whether tests are wanted.
- Prefer Playwright E2E (`make test-e2e`, Compose stack) over unit tests for auth/CRUD/permissions already covered by `e2e/`.
- Follow `../fullstack-bootstrap/specs/` especially `04-crud-pattern.md` and `03-auth-and-permissions.md`.
- Prefer Biome (`make lint` / Compose `yarn format`) over adding ESLint/Prettier.
