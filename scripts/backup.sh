#!/usr/bin/env bash
# Local dev database backup — dumps the docker-compose Postgres service to
# ./backups/. Production backup strategy (frequency, retention, encryption,
# restore testing) is deferred until a hosting provider is chosen; DATABASE_URL
# and src/modules/documents/storage.service.ts are both already structured to
# swap to a hosted Postgres + S3-compatible store without code changes.
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/backups"
mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U counselor school_counselor \
  > "$BACKUP_DIR/school_counselor-$TIMESTAMP.sql"

echo "Backup written to $BACKUP_DIR/school_counselor-$TIMESTAMP.sql"
