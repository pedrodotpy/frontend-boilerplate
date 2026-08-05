.PHONY: dev build openapi-ts lint test-e2e

dev:
	yarn dev

build:
	yarn build

openapi-ts:
	yarn openapi-ts

lint:
	yarn lint

test-e2e:
	yarn test:e2e
