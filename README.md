# 🔐 Document Vault

[![Deploy Document Vault](https://github.com/atharvjadhav-dev/document-vault/actions/workflows/deploy.yml/badge.svg)](https://github.com/atharvjadhav-dev/document-vault/actions/workflows/deploy.yml)
[![Docker](https://img.shields.io/badge/Docker-Docker%20Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SSL](https://img.shields.io/badge/SSL-Let's%20Encrypt-003A70?logo=letsencrypt&logoColor=white)](https://letsencrypt.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-grade, secure cloud document vault built with **React 18**, **Node.js Express**, **PostgreSQL 15**, and **AWS S3** — fully containerized with **Docker Compose**, protected by **deep magic-byte malware detection**, and deployed live on **AWS EC2** with automated **GitHub Actions CI/CD**.

🌐 **Live Website**: [https://document-vault.atharvjadhav.xyz](https://document-vault.atharvjadhav.xyz)  
🩺 **API Healthcheck**: [https://document-vault.atharvjadhav.xyz/api/health](https://document-vault.atharvjadhav.xyz/api/health)  
📖 **DevOps Runbook & Handover**: [HANDOVER.md](HANDOVER.md)

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Security Hardening](#-security-hardening)
- [Disaster Recovery & Backups](#-disaster-recovery--backups)
- [Quick Start (Local)](#-quick-start-local)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [CI/CD & Deployment](#-cicd--deployment)
- [DevOps Runbook](#-devops-runbook)
- [License](#-license)

---

## 🏗️ Architecture

```
                                  [ Users & Clients ]
                                           │
                                           │ HTTPS (Port 443) / HTTP (Port 80)
                                           ▼
                       ┌───────────────────────────────────────┐
                       │            Hostinger DNS              │
                       │   document-vault.atharvjadhav.xyz     │
                       └───────────────────┬───────────────────┘
                                           │ (Resolves to 65.1.139.188)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AWS EC2 INSTANCE (Ubuntu)                              │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Host NGINX Reverse Proxy                                │   │
│   │   • Let's Encrypt SSL/TLS Certificate (Auto-renewed via Certbot timer)         │   │
│   │   • Port 80 ──[ 301 Permanent Redirect ]──▶ Port 443 (HTTPS)                   │   │
│   │   • Route "/"      ──▶ http://localhost:5173  (Frontend Container)            │   │
│   │   • Route "/api/"  ──▶ http://localhost:5000  (Backend API Container)          │   │
│   └───────────────────────┬───────────────────────────────┬────────────────────────┘   │
│                           │                               │                            │
│ ┌─────────────────────────┼───────────────────────────────┼──────────────────────────┐ │
│ │                         ▼                               ▼         vault_network    │ │
│ │              ┌──────────────────────┐        ┌──────────────────────┐              │ │
│ │              │    vault_frontend    │        │    vault_backend     │              │ │
│ │              │  React 18 + Vite SPA │        │   Express.js REST    │              │ │
│ │              │    (Nginx Alpine)    │        │  (Node 18 + Multer)  │              │ │
│ │              │    Port 5173:80      │        │    Port 5000:5000    │              │ │
│ │              └──────────────────────┘        └──────────┬───────────┘              │ │
│ │                                                         │                          │ │
│ │                                                         ▼                          │ │
│ │                                              ┌──────────────────────┐              │ │
│ │                                              │    vault_postgres    │              │ │
│ │                                              │    PostgreSQL 15     │              │ │
│ │                                              │    Port 5432:5432    │              │ │
│ │                                              │ (Vol: postgres_data) │              │ │
│ │                                              └──────────────────────┘              │ │
│ └─────────────────────────────────────────────────────────┼──────────────────────────┘ │
│                                                           │                            │
│   ┌───────────────────────────────────────────────────────┴────────────────────────┐   │
│   │                 Automated Daily DB Backup Script (scripts/backup-db.sh)        │   │
│   │                 • Triggered by host cron at 2:00 AM UTC (0 2 * * *)            │   │
│   │                 • Dumps PostgreSQL, compresses with gzip                       │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │
                                            ▼ (Direct AWS SDK S3 Stream)
                       ┌────────────────────────────────────────┐
                       │          Amazon S3 Storage             │
                       │      Bucket: document-vault-files      │
                       │                                        │
                       │  📁 /vault-documents/ (User uploads)   │
                       │  📁 /database-backups/ (SQL dumps)     │
                       └────────────────────────────────────────┘
```

---

## ✨ Key Features

- 🌐 **Custom Domain & HTTPS Ingress** — Live at `document-vault.atharvjadhav.xyz` with automated Let's Encrypt SSL certificates.
- 🛡️ **Zero-Trust Magic-Byte Inspection** — Validates true binary signatures (initial 512 bytes on disk). Rejects and immediately deletes disguised Windows executables (`MZ`), Linux ELF binaries, shell scripts, and Java bytecode.
- 🗄️ **Automated S3 Disaster Recovery** — Nightly cron job dumps PostgreSQL, compresses with gzip, and streams snapshots to AWS S3 with automated 30-day retention pruning.
- 📁 **Complete Document Lifecycle** — Upload, view, download, rename, recategorize, and delete documents with instant search and category filtering.
- 🏷️ **Intelligent Categorization** — Aadhaar, PAN, Passport, Education, Resume, Certificates, Personal, and Other.
- 📊 **Dashboard & Storage Analytics** — Live document counts, category distribution breakdowns, and disk/S3 storage usage summaries (`/api/documents/stats`).
- 🤖 **Automated CI/CD Pipeline** — GitHub Actions automatically deploys commits on `main` to EC2 via SSH with zero manual server intervention.
- 🔐 **Hardened Authentication** — Stateless JWT authentication, 12-round bcrypt password hashing, and role-based user profiles (`/api/auth/me`).
- 🌗 **Responsive Modern Interface** — Clean responsive layout with Tailwind CSS optimized for mobile and desktop screens.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios | Single-page application UI |
| **Backend** | Node.js, Express.js, Multer | REST API, validation, upload pipeline |
| **Database** | PostgreSQL 15 (Alpine) | Relational document metadata & user accounts |
| **Cloud Storage** | AWS S3 (`ap-south-1`) | Persistent object storage for documents & backups |
| **Compute & Host** | AWS EC2 (Ubuntu 22.04) | Microservice container host |
| **Domain & DNS** | Hostinger DNS | Managed DNS A-record routing |
| **Reverse Proxy** | NGINX (Host & Container) | SSL termination, HTTP-to-HTTPS redirect, proxy routing |
| **SSL / TLS** | Let's Encrypt / Certbot | Automatic SSL certificates with systemd timer renewal |
| **Containers** | Docker & Docker Compose | Multi-container isolation, healthchecks & bridge networking |
| **CI/CD** | GitHub Actions | Automated build, test, and remote SSH deployment |
| **Security** | Magic-byte inspector, Helmet, Rate Limiter | Anti-malware, header hardening, brute-force mitigation |

---

## 🛡️ Security Hardening

### 1. Magic-Byte File Signature Validator
Multer alone only verifies client-supplied MIME types and file extensions, which are easily spoofed by renaming `malware.exe` to `invoice.pdf`. Our [`fileValidator.js`](backend/src/utils/fileValidator.js) middleware inspects the raw binary bytes on disk:
* **Blocked Signatures**:
  * Windows Executable / PE (`4D 5A` / `MZ`)
  * Linux Executable / ELF (`7F 45 4C 46`)
  * Shell Scripts (`23 21` / `#!`)
  * Java Bytecode (`CA FE BA BE`)
  * Embedded PHP / Script tags (`<?php`, `<script`)
* **Verified Formats**: PDF (`%PDF-`), PNG, JPEG, MS Office OpenXML (`.docx`), Legacy Word (`.doc`).
* **Instant Disk Scrub**: Any prohibited or mismatched payload is immediately deleted via `fs.unlinkSync` before it can touch storage.

### 2. Path Traversal & Host Header Protection
* Merged security fixes (PR #1) ensuring filenames are sanitized against path traversal (`../`) and download URLs remain strictly relative to prevent host-header poisoning.

### 3. API Defense-in-Depth
* **Helmet**: Injects HTTP security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `HSTS`).
* **Rate Limiting**: 100 requests per 15 minutes globally; strict 10 attempts per 15 minutes on login/register routes.
* **SQL Injection Prevention**: 100% parameterized queries via PostgreSQL `pg` pool.

---

## 🗄️ Disaster Recovery & Backups

Automated database disaster recovery runs completely in the cloud:
* **Script**: [`scripts/backup-db.sh`](scripts/backup-db.sh)
* **Schedule**: Daily at `2:00 AM UTC` (`0 2 * * *`) via system cron on EC2.
* **Process**:
  1. Dumps the active database from the `vault_postgres` container using `pg_dump`.
  2. Compresses the SQL snapshot using `gzip`.
  3. Uses the AWS SDK inside `vault_backend` to stream the dump directly to `s3://document-vault-files/database-backups/`.
  4. Automatically removes snapshots older than 30 days.

---

## 🚀 Quick Start (Local)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
* [Docker Compose](https://docs.docker.com/compose/) (v2+)

### 1. Clone Repository
```bash
git clone https://github.com/atharvjadhav-dev/document-vault.git
cd document-vault
```

### 2. Configure Environment Files
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

### 3. Start Multi-Container Stack
```bash
docker compose up -d --build
```

### 4. Verify Services
| Service | Local Endpoint |
| :--- | :--- |
| **Frontend** | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | [http://localhost:5000](http://localhost:5000) |
| **Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Description | Production Value / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Node server listen port | `5000` |
| `DB_HOST` | Database host | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | PostgreSQL database name | `document_vault` |
| `DB_USER` | PostgreSQL username | `vault_user` |
| `DB_PASSWORD` | PostgreSQL password | `[REDACTED_STRONG_PASSWORD]` |
| `JWT_SECRET` | 256-bit secret key for token signing | `[REDACTED_RANDOM_SECRET]` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `MAX_FILE_SIZE` | Maximum upload limit in bytes | `10485760` (10 MB) |
| `STORAGE_TYPE` | Storage engine (`local` or `s3`) | `s3` |
| `AWS_REGION` | AWS S3 region | `ap-south-1` |
| `AWS_BUCKET_NAME` | AWS S3 bucket name | `document-vault-files` |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key | `[REDACTED_IAM_KEY]` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Key | `[REDACTED_IAM_SECRET]` |
| `CORS_ORIGIN` | Allowed client origin | `https://document-vault.atharvjadhav.xyz` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit timeframe in ms | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Global max requests per IP | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per IP | `10` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL | `/api` (or `http://localhost:5000/api`) |

---

## 📡 API Documentation

**Base Production URL**: `https://document-vault.atharvjadhav.xyz/api`

### 1. System & Authentication

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server health, database status, and uptime | No |
| `POST` | `/auth/register` | Register new account (`fullName`, `email`, `password`) | No |
| `POST` | `/auth/login` | Authenticate user & issue JWT token | No |
| `GET` | `/auth/me` | Retrieve authenticated user profile | **Yes** |

### 2. Document Management

*All document endpoints require `Authorization: Bearer <token>`.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/documents` | List documents (supports `?search=` and `?category=`) |
| `POST` | `/documents` | Upload document (`multipart/form-data`) |
| `GET` | `/documents/stats` | Retrieve total documents, category counts & storage totals |
| `GET` | `/documents/:id` | Get metadata for a specific document |
| `PUT` | `/documents/:id` | Rename document or update its category |
| `DELETE` | `/documents/:id` | Delete document from database and S3 storage |
| `GET` | `/documents/:id/download-url` | Generate secure download URL |
| `GET` | `/documents/download/:id` | Stream document binary file |

---

## 📂 Project Structure

```
document-vault/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline (SSH to EC2)
├── backend/
│   ├── src/
│   │   ├── config/             # PostgreSQL database pool & table migrations
│   │   ├── controllers/        # Auth & Document request handlers
│   │   ├── middleware/         # JWT auth, rate limits, upload & magic-byte validator
│   │   ├── models/             # Data access objects & SQL queries
│   │   ├── routes/             # Express API endpoints
│   │   ├── services/           # S3 & Local storage provider abstraction
│   │   └── utils/              # Magic-byte file validator, Winston logger & helpers
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Modals, DocumentCards, Analytics widgets
│   │   ├── contexts/           # AuthContext & global state
│   │   ├── pages/              # Login, Register, Dashboard, Documents, Profile
│   │   └── services/           # Axios API HTTP client
│   ├── nginx.conf              # Container NGINX config with /api/ proxy
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── scripts/
│   └── backup-db.sh            # Automated PostgreSQL-to-S3 backup & retention script
├── docker-compose.yml          # Multi-container orchestration (Backend, Frontend, DB)
├── HANDOVER.md                 # Complete DevOps Handover & Production Runbook
└── README.md                   # Project documentation
```

---

## 🔄 CI/CD & Deployment

Every push to the `main` branch triggers `.github/workflows/deploy.yml`:
1. Connects securely to the AWS EC2 instance via SSH.
2. Synchronizes repository state: `git fetch origin && git reset --hard origin/main`.
3. Rebuilds and relaunches updated Docker containers: `docker compose up -d --build`.
4. Prunes stale dangling Docker images automatically: `docker image prune -af`.

---

## 📖 DevOps Runbook

For day-to-day operations, SSH commands, container log streaming, manual backups, and SSL renewals, refer directly to:
👉 **[HANDOVER.md](HANDOVER.md)**

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
