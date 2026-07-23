# 🔐 Document Vault

A production-grade, secure document storage platform built with React, Node.js, PostgreSQL, and Docker — deployed live on AWS.

🌐 **Live Website**: [http://atharv-vault.duckdns.com](http://atharv-vault.duckdns.com)

---

## 📋 Table of Contents

- [Live Website](#-live-website)
- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security](#security)
- [CI/CD & Deployment](#cicd--deployment)
- [AWS Migration Guide](#aws-migration-guide)
- [License](#license)

---

## 🌐 Live Website

The application is deployed and accessible live at:
👉 **[atharv-vault.duckdns.com](http://atharv-vault.duckdns.com)**

---

## Overview

**Document Vault** is a secure, cloud-ready document storage platform where users can upload, manage, search, download, and organize personal documents such as Aadhaar, PAN, Passport, Education certificates, Resumes, and more. 

It features automated deployment via GitHub Actions to an AWS EC2 instance, dynamic DNS routing with DuckDNS, isolated containerized architecture using Docker Compose, and robust security measures including JWT authentication, rate limiting, and parameterization.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 LIVE DEPLOYMENT (DuckDNS)                   │
│                atharv-vault.duckdns.com                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                     AWS EC2 INSTANCE                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   DOCKER COMPOSE                      │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌───────────┐  │  │
│  │  │   Frontend   │   │   Backend    │   │ Postgres  │  │  │
│  │  │ React + Vite │──▶│  Express.js  │──▶│    DB     │  │  │
│  │  │  (Port 5173) │   │  (Port 5000) │   │(Port 5432)│  │  │
│  │  └──────────────┘   ───────┬───────┘   └───────────┘  │  │
│  │                            │                          │  │
│  │                   ┌────────▼────────┐                 │  │
│  │                   │  Storage Layer  │                 │  │
│  │                   │  (Local / S3)   │                 │  │
│  │                   └─────────────────┘                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL 15 (Alpine) |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **DevOps & Hosting** | Docker, Docker Compose, AWS EC2, DuckDNS |
| **CI/CD** | GitHub Actions (Auto SSH deployment on push to `main`) |
| **Security** | Helmet, rate-limiting, multer, express-validator |

---

## Features

- 🌐 **Live Online Deployment** — Accessible worldwide via `atharv-vault.duckdns.com`
- 🔐 **JWT Authentication** — Register, Login, User Profile (`/auth/me`), and secure token authorization
- 📁 **Document Management** — Upload, Download, Delete, Rename, and recategorize documents
- 🏷️ **Categorization** — Aadhaar, PAN, Passport, Education, Resume, Certificates, Personal, Other
- 🔍 **Search & Filter** — Instant search by file name or filtering by document category
- 📊 **Dashboard Analytics** — Total documents count, category breakdowns, and storage usage stats (`/documents/stats`)
- 🤖 **Automated CI/CD** — GitHub Actions automatically builds and deploys code updates to AWS EC2
- 🛡️ **Enterprise Security** — Rate limiting on authentication routes, helmet HTTP headers, input sanitization, double MIME-type checks
- 🌗 **Dark Mode & Responsive UI** — Styled with Tailwind CSS for mobile and desktop screens
- ☁️ **AWS-Ready Storage** — Storage service abstraction supporting local volume storage or AWS S3

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)
- Node.js (v18+) *(Optional, for local development without Docker)*

### 1. Clone the Repository

```bash
git clone https://github.com/atharvjadhav-dev/document-vault.git
cd document-vault
```

### 2. Set Up Environment Files

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your desired secrets (see [Environment Variables](#environment-variables)).

### 3. Run with Docker Compose

```bash
docker compose up --build
```

### 4. Access the Local Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health Check | http://localhost:5000/api/health |
| **Live Production** | **[http://atharv-vault.duckdns.com](http://atharv-vault.duckdns.com)** |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` / `production` |
| `PORT` | Express server port | `5000` |
| `DB_HOST` | PostgreSQL host | `postgres` (or `localhost`) |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `document_vault` |
| `DB_USER` | Database user | `vault_user` |
| `DB_PASSWORD` | Database password | `strongpassword` |
| `JWT_SECRET` | Secret key for JWT signing | `your-256-bit-secret` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `MAX_FILE_SIZE` | Max file upload limit in bytes | `10485760` (10MB) |
| `STORAGE_TYPE` | Storage engine (`local` or `s3`) | `local` |
| `UPLOAD_PATH` | Directory for local upload storage | `./uploads` |
| `CORS_ORIGIN` | Allowed origin for API requests | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Window timeframe for rate limiting | `900000` (15 mins) |
| `RATE_LIMIT_MAX` | Max requests per IP window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max login/register attempts per window | `10` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base endpoint | `http://localhost:5000/api` |

---

## API Documentation

### Base URL: `http://localhost:5000/api` (or `http://atharv-vault.duckdns.com/api`)

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login user & return JWT token | No |
| `GET` | `/auth/me` | Fetch active user profile details | Yes |

#### Register (`POST /auth/register`)
**Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login (`POST /auth/login`)
**Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

---

### Document Endpoints

*All document endpoints require header: `Authorization: Bearer <token>` (except direct download token links).*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/documents` | List documents (Supports `?search=` and `?category=`) |
| `POST` | `/documents` | Upload document (`multipart/form-data`) |
| `GET` | `/documents/stats` | Fetch usage statistics & storage summaries |
| `GET` | `/documents/:id` | Get metadata for a specific document |
| `PUT` | `/documents/:id` | Rename document filename or update category |
| `DELETE` | `/documents/:id` | Permanently delete document file and DB record |
| `GET` | `/documents/:id/download-url` | Generate timed secure download link |
| `GET` | `/documents/download/:id` | Download actual document binary file |

---

## Project Structure

```
document-vault/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Continuous deployment pipeline to EC2
├── backend/
│   ├── src/
│   │   ├── config/           # Database setup & initialization scripts
│   │   ├── controllers/      # Handlers for auth and document operations
│   │   ├── middleware/       # Auth, validation, upload & error handling
│   │   ├── models/           # Data access objects & SQL queries
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Storage abstraction (Local/S3) & auth logic
│   │   └── utils/            # Winston logger & helper utilities
│   ├── uploads/              # Local uploaded files directory (gitignored)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, Modal, DocumentCard, etc.)
│   │   ├── contexts/         # AuthContext & global state
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # View pages (Login, Dashboard, Documents, Profile)
│   │   ├── services/         # Axios API clients
│   │   └── utils/            # Formatting & UI helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Project documentation
```

---

## Security

- 🔒 **Password Protection**: Salting and hashing with `bcryptjs` (12 rounds)
- 🔑 **Token Authentication**: Stateless JWT authorization headers with configurable expiration
- 🛡️ **HTTP Hardening**: Security headers injected via `helmet`
- ⛔ **Rate Limiting**: IP-based rate limiting on global API and strict thresholds on login/register routes
- 📁 **File Upload Security**: Allowed file types and maximum payload sizes enforced via `multer` and MIME verification
- 💉 **SQL Injection Prevention**: Parameterized queries using PostgreSQL `pg` client
- 🌐 **CORS Configuration**: Restrictive cross-origin resource sharing policy

---

## CI/CD & Deployment

This project uses **GitHub Actions** for continuous integration and delivery.

- **Trigger**: Every push to the `main` branch.
- **Workflow** (`.github/workflows/deploy.yml`):
  1. Connects securely to the AWS EC2 instance via SSH.
  2. Pulls latest changes from GitHub repository.
  3. Rebuilds and restarts Docker containers (`docker compose up -d --build`).
- **Domain & Routing**: DuckDNS (`atharv-vault.duckdns.com`) maps dynamic DNS updates to the EC2 server IP.

---

## AWS Migration Guide

The platform is designed cloud-ready for seamless AWS scaling:

1. **Storage (AWS S3)**: Change `STORAGE_TYPE=s3` in `backend/.env` and supply `AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
2. **Database (AWS RDS)**: Update `DB_HOST` in `backend/.env` to point to an Amazon RDS PostgreSQL endpoint.
3. **Container Hosting (AWS ECS/ECR)**: Push Docker images to ECR and run services on Fargate or ECS clusters.
4. **CDN (AWS CloudFront)**: Route static assets and download streams through CloudFront distributions.

---

## License

MIT © Document Vault
