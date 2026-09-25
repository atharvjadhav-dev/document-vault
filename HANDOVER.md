# 🚀 Document Vault — DevOps Handover & Production Runbook

> **Last Updated:** September 2026  
> **Maintainer:** atharvjadhav-dev (`atharvjadhav2024@gmail.com`)  
> **Status:** Production Live & Healthy ✅  

This document serves as the master operational source of truth. Any developer or DevOps engineer picking up this project can resume work immediately using the specifications and runbooks below.

---

## 📌 1. Production Quick Reference

| Attribute | Value / Location |
| :--- | :--- |
| **Live Application URL** | [https://document-vault.atharvjadhav.xyz](https://document-vault.atharvjadhav.xyz) |
| **Live API Healthcheck** | [https://document-vault.atharvjadhav.xyz/api/health](https://document-vault.atharvjadhav.xyz/api/health) |
| **AWS EC2 Public IP** | `65.1.139.188` (Region: `ap-south-1` / Mumbai) |
| **Hostinger DNS Record** | `A` record: `document-vault` ➔ `65.1.139.188` (TTL: 300s) |
| **EC2 SSH Access** | User: `ubuntu` \| Key: `doc-vault.pem` |
| **AWS S3 Bucket** | `document-vault-files` (Region: `ap-south-1`) |
| **GitHub Repository** | `https://github.com/atharvjadhav-dev/document-vault.git` (`main` branch) |
| **CI/CD Automation** | GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys on push to `main` |

---

## 🏗️ 2. Production Architecture & Ingress Flow

```
[User Browser]
      │
      ▼ (HTTPS:443 / HTTP:80)
[Hostinger DNS: document-vault.atharvjadhav.xyz]
      │
      ▼ (Resolves to 65.1.139.188)
[AWS EC2 Host OS (Ubuntu 22.04)]
  ├── NGINX Reverse Proxy (Port 80 & 443)
  │     ├── Let's Encrypt SSL/TLS Certificate (/etc/letsencrypt/live/...)
  │     ├── Port 80 ➔ 301 Permanent Redirect to HTTPS
  │     ├── Proxy "/" ➔ http://localhost:5173 (Docker Frontend)
  │     └── Proxy "/api/" ➔ http://localhost:5000 (Docker Backend)
  │
  └── Docker Compose Engine (vault_network bridge)
        ├── vault_frontend (Port 5173:80) — React 18 + Vite static build via NGINX Alpine
        ├── vault_backend  (Port 5000:5000) — Express.js REST API
        └── vault_postgres (Port 5432:5432) — PostgreSQL 15 Alpine DB (Volume: postgres_data)
```

### Critical Port Architecture Note:
* The EC2 host runs native NGINX listening on ports **80** and **443**.
* Docker maps container ports to `5173:80` (frontend), `5000:5000` (backend), and `5432:5432` (database).
* Do **NOT** map Docker frontend directly to `80:80` on EC2, as it will collide with the host NGINX reverse proxy.

---

## 🔑 3. Server Access & SSH

### Local SSH Command (Windows / Linux):
```bash
# Using the existing private key (ensure permissions are restricted to current user)
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188
```

### Project Path on EC2:
```bash
cd /home/ubuntu/document-vault
```

---

## 🔐 4. SSL / TLS Certificate Management

* **Provider:** Let's Encrypt (Certbot)
* **Domain:** `document-vault.atharvjadhav.xyz`
* **Certificate Files on EC2:**
  * Fullchain: `/etc/letsencrypt/live/document-vault.atharvjadhav.xyz/fullchain.pem`
  * Private Key: `/etc/letsencrypt/live/document-vault.atharvjadhav.xyz/privkey.pem`
* **Auto-Renewal:** Managed by systemd timer `certbot.timer`.
* **Test Renewal Command:**
  ```bash
  sudo certbot renew --dry-run
  ```

---

## 🛡️ 5. Security Systems Implemented

### A. Deep Magic-Byte File Signature Validator
* **Code:** [`backend/src/utils/fileValidator.js`](file:///c:/Users/Nikita%20Jadhav/Downloads/document-vault/backend/src/utils/fileValidator.js)
* **Middleware Integration:** [`backend/src/middleware/uploadMiddleware.js`](file:///c:/Users/Nikita%20Jadhav/Downloads/document-vault/backend/src/middleware/uploadMiddleware.js)
* **Functionality:** Inspects the first 512 bytes of uploaded files directly from disk before moving to storage.
  * **Blocked signatures:** Windows PE executables/DLLs (`MZ` / `4D 5A`), Linux ELF (`7F 45 4C 46`), Shell scripts (`#!` / `23 21`), Java bytecode (`CA FE BA BE`), and executable script tags in text files (`<?php`, `<script`).
  * **Verified types:** PDF (`%PDF-`), PNG (`89 50 4E 47`), JPEG (`FF D8 FF`), MS Office OpenXML / DOCX (`PK\x03\x04`), Legacy DOC (`D0 CF 11 E0`).
  * **Immediate purge:** Any rejected payload is unlinked (`fs.unlinkSync`) immediately from disk.

### B. Path Traversal & Host Header Hardening (PR #1 from Jules)
* Implemented sanitized download filenames and relative download URLs.
* CORS configured to accept only `https://document-vault.atharvjadhav.xyz` in production.

---

## 🗄️ 6. Automated Disaster Recovery (Database Backups to S3)

* **Script:** [`scripts/backup-db.sh`](file:///c:/Users/Nikita%20Jadhav/Downloads/document-vault/scripts/backup-db.sh)
* **S3 Destination:** `s3://document-vault-files/database-backups/vault_db_YYYYMMDD_HHMMSS.sql.gz`
* **Cron Schedule on EC2:**
  ```cron
  0 2 * * * /home/ubuntu/document-vault/scripts/backup-db.sh >> /tmp/db-backup.log 2>&1
  ```
  *(Runs daily at 2:00 AM UTC)*
* **Retention Policy:** Automatically prunes snapshots older than 30 days.
* **Manual Backup Trigger:**
  ```bash
  ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "/home/ubuntu/document-vault/scripts/backup-db.sh"
  ```

---

## 🛠️ 7. DevOps Operational Runbook

### Check Container Status:
```bash
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "cd ~/document-vault && docker compose ps"
```

### View Live Backend Logs:
```bash
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "docker logs -f --tail=100 vault_backend"
```

### Restart All Containers on EC2:
```bash
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "cd ~/document-vault && docker compose down && docker compose up -d"
```

### Reload Host NGINX (after config edits):
```bash
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "sudo nginx -t && sudo systemctl reload nginx"
```

### Check Database Backup Log:
```bash
ssh -i "C:\Users\Nikita Jadhav\Downloads\doc-vault.pem" ubuntu@65.1.139.188 "cat /tmp/db-backup.log"
```

---

## 🔄 8. Git & CI/CD Workflow

* All commits must use the identity:
  ```bash
  git config user.name "atharvjadhav-dev"
  git config user.email "atharvjadhav2024@gmail.com"
  ```
* When pushing from local Windows:
  ```bash
  git add <files>
  git commit -m "feat/fix: <description>"
  git push origin main
  ```
* GitHub Actions will automatically connect via SSH, run `git reset --hard origin/main`, and execute `docker compose up -d --build`.

---

## 🎯 9. Next Planned Milestones & Ideas for the Project

1. **Antivirus Scanning Container (ClamAV Daemon)**:
   Add a lightweight ClamAV container to the Docker Compose network to scan uploaded files against updated malware hash databases asynchronously.
2. **Prometheus & Grafana Monitoring**:
   Set up `node-exporter`, `cadvisor`, and a Grafana dashboard on EC2 to track CPU, RAM, disk I/O, container health, and API request latency.
3. **AWS S3 Presigned URLs for Downloads**:
   Instead of streaming files through Express memory, generate secure, expiring AWS S3 presigned GET URLs (`getSignedUrl`) so clients download directly from AWS S3, reducing EC2 bandwidth.
4. **Terraform Infrastructure as Code (IaC)**:
   Create a `terraform/` directory defining the AWS EC2 instance, Security Groups (ports 22, 80, 443), and S3 Bucket for 1-click cloud provisioning.
