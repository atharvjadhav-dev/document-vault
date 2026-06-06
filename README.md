# 🔐 Document Vault

A production-grade, secure document storage platform built with React, Node.js, PostgreSQL, and Docker — designed for AWS deployment.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security](#security)
- [AWS Migration Guide](#aws-migration-guide)
- [Deployment Guide](#deployment-guide)

---

## Overview

Document Vault is a secure, cloud-ready document storage platform where users can upload, manage, search, download, and organize personal documents such as Aadhaar, PAN, Passport, Education certificates, Resumes, and more.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                        │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │   Frontend   │   │   Backend    │   │  PostgreSQL DB │  │
│  │  React+Vite  │──▶│  Express.js  │──▶│                │  │
│  │  Port: 5173  │   │  Port: 5000  │   │  Port: 5432    │  │
│  └──────────────┘   └──────┬───────┘   └────────────────┘  │
│                             │                                │
│                    ┌────────▼────────┐                      │
│                    │  Storage Layer  │                      │
│                    │ (Local / S3)    │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 15 |
| Auth | JWT, bcrypt |
| DevOps | Docker, Docker Compose |
| Security | Helmet, rate-limiting, multer, express-validator |

---

## Features

- 🔐 **JWT Authentication** — Register, Login, Logout with secure token handling
- 📁 **Document Management** — Upload, Download, Delete, Rename documents
- 🏷️ **Categories** — Aadhaar, PAN, Passport, Education, Resume, Certificates, Personal, Other
- 🔍 **Search** — Search by filename or category
- 📊 **Dashboard** — Storage usage, recent uploads, document stats
- 🛡️ **Security** — Rate limiting, helmet, input validation, SQL injection protection
- 🌗 **Dark Mode** — Full dark mode support
- 📱 **Responsive** — Mobile-first design
- ☁️ **AWS-Ready** — Storage service abstraction for S3 migration

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+)

### 1. Clone the Repository

```bash
git clone https://github.com/yourorg/document-vault.git
cd document-vault
```

### 2. Set Up Environment Files

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your secrets (see [Environment Variables](#environment-variables)).

### 3. Run with Docker Compose

```bash
docker compose up --build
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/api/health |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DB_HOST` | PostgreSQL host | `postgres` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `document_vault` |
| `DB_USER` | Database user | `vault_user` |
| `DB_PASSWORD` | Database password | `strongpassword` |
| `JWT_SECRET` | JWT signing secret | `your-256-bit-secret` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` |
| `STORAGE_TYPE` | `local` or `s3` | `local` |
| `UPLOAD_PATH` | Local upload directory | `./uploads` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

---

## API Documentation

### Base URL: `http://localhost:5000/api`

### Authentication

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "id": "uuid", "fullName": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGci..."
  }
}
```

---

#### POST `/auth/login`
Login with credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "fullName": "John Doe", "email": "john@example.com" },
    "token": "eyJhbGci..."
  }
}
```

---

### Documents

All document endpoints require `Authorization: Bearer <token>` header.

#### GET `/documents`
Fetch all documents. Supports query params: `?search=filename&category=PAN`

#### POST `/documents`
Upload a document. `Content-Type: multipart/form-data`

Fields: `file` (required), `category` (required), `originalFilename` (optional)

#### GET `/documents/:id`
Get document metadata by ID.

#### PUT `/documents/:id`
Update document (rename/recategorize).

```json
{ "originalFilename": "new-name.pdf", "category": "Personal" }
```

#### DELETE `/documents/:id`
Delete a document.

#### GET `/documents/download/:id`
Download the document file.

---

## Project Structure

```
document-vault/
├── backend/
│   ├── src/
│   │   ├── config/          # DB & app config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, error, upload middleware
│   │   ├── models/          # DB query models
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic (storage, auth)
│   │   └── utils/           # Logger, helpers
│   ├── uploads/             # Local file storage (gitignored)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React context providers
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── utils/           # Helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Security

- **bcrypt** password hashing (salt rounds: 12)
- **JWT** with configurable expiry
- **Helmet** HTTP security headers
- **Rate limiting** on all routes (stricter on auth)
- **Multer** file validation (type + size)
- **express-validator** input sanitization
- **Parameterized queries** — no raw SQL string interpolation
- **CORS** with explicit origin whitelist
- **File extension + MIME type** double validation

---

## AWS Migration Guide

The app is pre-wired for AWS migration:

1. **File Storage → S3**: Set `STORAGE_TYPE=s3` in backend `.env` and provide `AWS_BUCKET_NAME`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. The `StorageService` abstraction handles the rest.

2. **Database → RDS**: Change `DB_HOST` to your RDS endpoint.

3. **Auth → Cognito**: Replace `jwtService` with Cognito SDK calls.

4. **CDN → CloudFront**: Point your frontend static assets to a CloudFront distribution.

5. **API → API Gateway + ECS/EKS**: Containerize and push backend to ECR; configure API Gateway.

---

## Deployment Guide

### Production Docker Build

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Database Migrations

Migrations run automatically on backend startup via `initializeDatabase()`.

### Health Check

```bash
curl http://localhost:5000/api/health
```

### Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## License

MIT © Document Vault
