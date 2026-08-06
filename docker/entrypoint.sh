#!/bin/sh
set -e

if [ ! -f .env ]; then
  cp .env.example .env
fi

yarn install --frozen-lockfile

exec "$@"
