# Agent guidelines (react-boilerplate)

- Add dependencies with `yarn add` / `yarn add -D` only.
- After backend API changes: regenerate schema in django-boilerplate, then `yarn openapi-ts`.
- Do not hand-edit `src/shared/api` generated output.
- Keep the app private: only `/login` is public; all features under the authenticated shell.
- Prefer Playwright E2E (`yarn test:e2e`, live Django) over unit tests for auth/CRUD/permissions already covered by `e2e/`.
- Follow `../fullstack-bootstrap/specs/` especially `04-crud-pattern.md` and `03-auth-and-permissions.md`.
- Prefer Biome (`yarn lint` / `yarn format`) over adding ESLint/Prettier.
