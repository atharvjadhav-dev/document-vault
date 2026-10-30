#!/usr/bin/env bash
set -eo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Document Vault — Containerized PostgreSQL Backup to AWS S3
# ─────────────────────────────────────────────────────────────────────────────

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/document_vault_backups"
BACKUP_FILE="${BACKUP_DIR}/vault_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

DB_USER="${DB_USER:-vault_user}"
DB_NAME="${DB_NAME:-document_vault}"
DB_PORT="${DB_PORT:-5432}"
DB_HOST="${DB_HOST:-}"

echo "[$(date)] Starting Document Vault PostgreSQL backup..."

# 1. Dump database from RDS or running Postgres container
if [ -n "${DB_HOST}" ] && [ "${DB_HOST}" != "localhost" ] && [ "${DB_HOST}" != "127.0.0.1" ] && [ "${DB_HOST}" != "postgres" ]; then
  echo "[$(date)] Performing pg_dump from remote/RDS database host (${DB_HOST})..."
  PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^vault_postgres$"; then
  echo "[$(date)] Performing pg_dump from vault_postgres container..."
  docker exec vault_postgres pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
else
  echo "[$(date)] Performing pg_dump from host (${DB_HOST:-localhost})..."
  PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST:-localhost}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Database dumped and compressed successfully (${BACKUP_SIZE})"

# 2. Transfer dump into backend container to utilize AWS SDK & credentials
docker cp "${BACKUP_FILE}" vault_backend:/tmp/backup.sql.gz

# 3. Stream backup to AWS S3 bucket (relies on EC2 IAM Instance Profile / AWS SDK credential chain)
docker exec -i vault_backend node -e "
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

if (process.env.AWS_ACCESS_KEY_ID && (process.env.AWS_ACCESS_KEY_ID.startsWith('YOUR_') || process.env.AWS_ACCESS_KEY_ID.trim() === '')) {
  delete process.env.AWS_ACCESS_KEY_ID;
}
if (process.env.AWS_SECRET_ACCESS_KEY && (process.env.AWS_SECRET_ACCESS_KEY.startsWith('YOUR_') || process.env.AWS_SECRET_ACCESS_KEY.trim() === '')) {
  delete process.env.AWS_SECRET_ACCESS_KEY;
}

async function upload() {
  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
  });
  const fileStream = fs.createReadStream('/tmp/backup.sql.gz');
  const bucket = process.env.AWS_BUCKET_NAME || 'document-vault-files';
  const key = 'database-backups/vault_db_${TIMESTAMP}.sql.gz';
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
  });
  await client.send(command);
  console.log('Successfully uploaded backup to s3://' + bucket + '/' + key);
}
upload().catch(err => {
  console.error('Backup upload failed:', err.message);
  process.exit(1);
});
"

# 4. Clean up temp files
docker exec -u 0 vault_backend rm -f /tmp/backup.sql.gz
rm -f "${BACKUP_FILE}"

echo "[$(date)] Automated backup finished successfully."
