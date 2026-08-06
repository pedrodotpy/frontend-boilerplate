.PHONY: build dev lint build-app openapi-ts test-e2e test-e2e-2fa

COMPOSE ?= docker compose
COMPOSE_E2E ?= $(COMPOSE) -f docker-compose.e2e.yml
FRONTEND = $(COMPOSE) run --rm frontend

build:
	$(COMPOSE) build

dev:
	$(COMPOSE) up frontend

lint:
	$(FRONTEND) yarn lint

build-app:
	$(FRONTEND) yarn build

openapi-ts:
	$(FRONTEND) yarn openapi-ts

# Seed + run Playwright against Compose stack (Django + Postgres + Vite).
test-e2e:
	$(COMPOSE_E2E) build
	$(COMPOSE_E2E) run --rm backend uv run python manage.py migrate
	$(COMPOSE_E2E) run --rm backend uv run python manage.py seed_e2e --extra-users 15
	$(COMPOSE_E2E) run --rm playwright yarn test:e2e
	$(COMPOSE_E2E) down --remove-orphans

# Requires LOGIN_2FA on the backend during the run.
test-e2e-2fa:
	$(COMPOSE_E2E) build
	$(COMPOSE_E2E) run --rm backend uv run python manage.py migrate
	$(COMPOSE_E2E) run --rm backend uv run python manage.py seed_e2e --extra-users 15
	LOGIN_2FA_ENABLED=True E2E_LOGIN_2FA=1 $(COMPOSE_E2E) run --rm -e E2E_LOGIN_2FA=1 playwright yarn test:e2e e2e/auth.2fa.spec.ts
	$(COMPOSE_E2E) down --remove-orphans
