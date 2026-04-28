#!/bin/sh
set -e

echo "Waiting for database to be ready..."
python - <<'PY'
import os
import time

import psycopg2

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise SystemExit("DATABASE_URL is not set")

attempts = 30
for i in range(1, attempts + 1):
    try:
        conn = psycopg2.connect(database_url.replace("+psycopg2", ""), connect_timeout=3)
        conn.close()
        print("Database is ready.")
        break
    except Exception as exc:
        if i == attempts:
            raise SystemExit(f"Database is not ready after {attempts} attempts: {exc}") from exc
        print(f"Database not ready (attempt {i}/{attempts}): {exc}")
        time.sleep(2)
PY

echo "Running database migrations..."
alembic upgrade head

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
