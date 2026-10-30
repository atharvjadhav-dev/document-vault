#!/usr/bin/env bash
set -eo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Document Vault — Phase 2: PostgreSQL Container to Amazon RDS Migration Script
# ─────────────────────────────────────────────────────────────────────────────

echo "====================================================================="
echo " Document Vault: PostgreSQL Container ➔ Amazon RDS Migration"
echo "====================================================================="

# Required environment variables or arguments
RDS_HOST="${RDS_HOST:-$1}"
RDS_PORT="${RDS_PORT:-5432}"
RDS_DB="${RDS_DB:-document_vault}"
RDS_USER="${RDS_USER:-vault_user}"
DB_SSL="${DB_SSL:-true}"

if [ -z "${RDS_HOST}" ]; then
  echo "❌ Error: RDS_HOST is required."
  echo "Usage:"
  echo "   read -s RDS_PASSWORD"
  echo "   export RDS_PASSWORD"
  echo "   ./scripts/migrate-to-rds.sh <rds_endpoint>"
  echo "   unset RDS_PASSWORD"
  exit 1
fi

if [ -z "${RDS_PASSWORD}" ]; then
  echo -n "Enter RDS master/database password: "
  read -s RDS_PASSWORD
  echo ""
  if [ -z "${RDS_PASSWORD}" ]; then
    echo "❌ Error: RDS password cannot be empty."
    exit 1
  fi
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MIGRATION_DIR="/tmp/document_vault_migration_${TIMESTAMP}"
BACKUP_SQL="${MIGRATION_DIR}/vault_pre_migration_${TIMESTAMP}.sql"
MIGRATION_DUMP="${MIGRATION_DIR}/vault_pre_migration_${TIMESTAMP}.dump"

mkdir -p "${MIGRATION_DIR}"

echo "[$(date)] Step 1: Pre-migration safety backup of existing PostgreSQL container..."

if docker ps --format '{{.Names}}' | grep -q "^vault_postgres$"; then
  echo "   ↳ Dumping existing database from vault_postgres container..."
  # Clean, no-owner, no-privileges dump ensures seamless import into managed RDS
  docker exec vault_postgres pg_dump -U "${RDS_USER}" -d "${RDS_DB}" \
    --clean --if-exists --no-owner --no-privileges > "${BACKUP_SQL}"
  
  BACKUP_SIZE=$(du -h "${BACKUP_SQL}" | cut -f1)
  echo "   ✅ Backup created: ${BACKUP_SQL} (${BACKUP_SIZE})"
else
  echo "   ⚠️ vault_postgres container is not running. Checking for existing SQL schema..."
  if [ -f "./backend/src/config/init.sql" ]; then
    cp "./backend/src/config/init.sql" "${BACKUP_SQL}"
    echo "   ✅ Using schema from ./backend/src/config/init.sql"
  else
    echo "   ❌ No source database found to migrate!"
    exit 1
  fi
fi

echo "[$(date)] Step 2: Testing connectivity to Amazon RDS endpoint..."
echo "   ↳ Host: ${RDS_HOST}:${RDS_PORT}"
echo "   ↳ Database: ${RDS_DB}"
echo "   ↳ User: ${RDS_USER}"

# Test TCP socket reachability
if command -v nc >/dev/null 2>&1; then
  if ! nc -z -w 5 "${RDS_HOST}" "${RDS_PORT}"; then
    echo "   ❌ Connection to ${RDS_HOST}:${RDS_PORT} timed out or refused."
    echo "   Please verify that the EC2 Security Group is allowed in the RDS Security Group."
    exit 1
  fi
  echo "   ✅ TCP port 5432 reachable."
fi

echo "[$(date)] Step 3: Restoring schema and data into Amazon RDS..."
PGPASSWORD="${RDS_PASSWORD}" psql \
  -h "${RDS_HOST}" \
  -p "${RDS_PORT}" \
  -U "${RDS_USER}" \
  -d "${RDS_DB}" \
  --set ON_ERROR_STOP=on \
  < "${BACKUP_SQL}"

echo "   ✅ Data successfully imported into RDS."

echo "[$(date)] Step 4: Verifying schema, tables, and constraints in RDS..."
VERIFICATION_RESULT=$(PGPASSWORD="${RDS_PASSWORD}" psql \
  -h "${RDS_HOST}" \
  -p "${RDS_PORT}" \
  -U "${RDS_USER}" \
  -d "${RDS_DB}" \
  -t -A -c "
    SELECT 
      'users_count=' || count(*) FROM users
    UNION ALL
    SELECT 
      'documents_count=' || count(*) FROM documents;
  ")

echo "   📊 RDS Table Counts:"
echo "${VERIFICATION_RESULT}" | while read -r line; do
  echo "      • ${line}"
done

echo "[$(date)] Step 5: Updating backend/.env configuration..."
ENV_FILE="./backend/.env"
if [ -f "${ENV_FILE}" ]; then
  # Backup current .env
  cp "${ENV_FILE}" "${ENV_FILE}.bak_${TIMESTAMP}"
  chmod 600 "${ENV_FILE}.bak_${TIMESTAMP}"
  
  # Update DB configuration in .env
  sed -i "s|^DB_HOST=.*|DB_HOST=${RDS_HOST}|" "${ENV_FILE}"
  sed -i "s|^DB_PORT=.*|DB_PORT=${RDS_PORT}|" "${ENV_FILE}"
  sed -i "s|^DB_NAME=.*|DB_NAME=${RDS_DB}|" "${ENV_FILE}"
  sed -i "s|^DB_USER=.*|DB_USER=${RDS_USER}|" "${ENV_FILE}"
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${RDS_PASSWORD}|" "${ENV_FILE}"
  
  # Remove insecure reject_unauthorized setting if present
  sed -i '/^DB_SSL_REJECT_UNAUTHORIZED=/d' "${ENV_FILE}"

  if ! grep -q "^DB_SSL=" "${ENV_FILE}"; then
    echo "DB_SSL=true" >> "${ENV_FILE}"
  else
    sed -i "s|^DB_SSL=.*|DB_SSL=true|" "${ENV_FILE}"
  fi

  if ! grep -q "^DB_CA_CERT_PATH=" "${ENV_FILE}"; then
    echo "DB_CA_CERT_PATH=/app/src/config/certs/global-bundle.pem" >> "${ENV_FILE}"
  else
    sed -i "s|^DB_CA_CERT_PATH=.*|DB_CA_CERT_PATH=/app/src/config/certs/global-bundle.pem|" "${ENV_FILE}"
  fi
  
  chmod 600 "${ENV_FILE}"
  echo "   ✅ Updated ${ENV_FILE} with RDS endpoint and TLS configuration."
fi

# Clean up sensitive variables from script environment
unset RDS_PASSWORD
unset PGPASSWORD

echo "====================================================================="
echo " ✅ MIGRATION COMPLETED SUCCESSFULLY!"
echo " Pre-migration backup kept at: ${BACKUP_SQL}"
echo "====================================================================="
