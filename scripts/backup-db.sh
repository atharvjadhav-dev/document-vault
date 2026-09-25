#!/usr/bin/env bash
set -eo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Document Vault — Containerized PostgreSQL Backup to AWS S3
# ─────────────────────────────────────────────────────────────────────────────

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/document_vault_backups"
BACKUP_FILE="${BACKUP_DIR}/vault_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting Document Vault PostgreSQL backup..."

# 1. Dump database from running Postgres container
docker exec vault_postgres pg_dump -U vault_user -d document_vault | gzip > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Database dumped and compressed successfully (${BACKUP_SIZE})"

# 2. Transfer dump into backend container to utilize AWS SDK & credentials
docker cp "${BACKUP_FILE}" vault_backend:/tmp/backup.sql.gz

# 3. Stream backup to AWS S3 bucket
docker exec -i vault_backend node -e "
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

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
