#!/bin/sh
set -e

# Runs on every start so `docker compose up` is genuinely the only command
# needed. Both steps are idempotent: alembic skips migrations already applied,
# and the seed does nothing when documents already exist.
echo "==> Applying migrations"
alembic upgrade head

echo "==> Seeding demo data"
python -m app.seed

exec "$@"
