# Graph Report - document-vault  (2026-10-30)

## Corpus Check
- Corpus is ~25,361 words - fits in a single context window. You may not need a graph.

## Summary
- 412 nodes · 853 edges · 27 communities (14 shown, 13 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.85)
- Token cost: 1,500 input · 800 output

## Community Hubs (Navigation)
- React Application & Routing
- Frontend UI Components & Modals
- Database Configuration & Pool
- Backend Authentication Controllers
- Frontend Dependencies & Libraries
- Production Docker Compose Stack
- Development Docker Compose Stack
- GitHub Actions CI/CD Deployment
- Express Server & Security Middleware
- Backend Core Dependencies & AWS S3
- Backend Package & Development Tooling
- Documentation Architecture & Ingress Flow
- Document Storage Service (S3 & Local)
- AWS SDK S3 Dependencies
- Frontend Scripts & Tooling
- Bcrypt Password Hashing
- HTTP Response Compression
- Cross-Origin Resource Sharing (CORS)
- Express Framework Core
- Rate Limiting Middleware
- Request Validation Middleware
- Helmet Security Headers
- JSON Web Token (JWT) Auth
- Database Backup Script (S3)
- Database Migration Script (RDS)

## God Nodes (most connected - your core abstractions)
1. `react` - 32 edges
2. `Button()` - 22 edges
3. `sendError()` - 17 edges
4. `App()` - 15 edges
5. `DocumentsPage()` - 15 edges
6. `react-router-dom` - 14 edges
7. `FileIcon()` - 14 edges
8. `useToast()` - 13 edges
9. `useAuth()` - 13 edges
10. `DashboardPage()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Vite HTML Single-Page Entrypoint` --conceptually_related_to--> `Document Vault System Architecture`  [INFERRED]
  frontend/index.html → README.md
- `Vite HTML Single-Page Entrypoint` --references--> `Vault Shield & Padlock Brand Icon`  [EXTRACTED]
  frontend/index.html → frontend/public/vault-icon.svg
- `startServer()` --calls--> `initializeDatabase()`  [EXTRACTED]
  backend/src/server.js → backend/src/config/database.js
- `uploadSingle()` --calls--> `validateFileSignature()`  [EXTRACTED]
  backend/src/middleware/uploadMiddleware.js → backend/src/utils/fileValidator.js
- `handleValidationErrors()` --calls--> `sendError()`  [EXTRACTED]
  backend/src/middleware/validationMiddleware.js → backend/src/utils/helpers.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Production Hosting & Ingress Flow** — handover_dns_routing, handover_production_ec2, handover_nginx_proxy [EXTRACTED 1.00]

## Communities (27 total, 13 thin omitted)

### Community 0 - "React Application & Routing"
Cohesion: 0.11
Nodes (37): App(), ProtectedRoute(), AppLayout(), NAV_ITEMS, Sidebar(), Input, LoadingSpinner(), PageLoader() (+29 more)

### Community 1 - "Frontend UI Components & Modals"
Cohesion: 0.13
Nodes (34): DeleteConfirmModal(), DocumentCard(), DetailRow(), DocumentDetailModal(), DocumentPreviewModal(), DocumentRow(), EditDocumentModal(), Button() (+26 more)

### Community 2 - "Database Configuration & Pool"
Cohesion: 0.06
Nodes (33): fs, initializeDatabase(), path, { Pool }, poolConfig, query(), ALLOWED_EXTENSIONS, ALLOWED_TYPES (+25 more)

### Community 3 - "Backend Authentication Controllers"
Cohesion: 0.10
Nodes (36): bcrypt, getMe(), login(), register(), deleteDocument(), downloadDocument(), getDocument(), getDocuments() (+28 more)

### Community 4 - "Frontend Dependencies & Libraries"
Cohesion: 0.07
Nodes (35): dependencies, axios@^1.6.8, react@^18.3.0, react-dom@^18.3.0, react-router-dom@^6.22.3, description, devDependencies, autoprefixer@^10.4.19 (+27 more)

### Community 5 - "Production Docker Compose Stack"
Cohesion: 0.07
Nodes (31): VITE_API_URL, build, container_name, env_file, healthcheck, networks, ports, restart (+23 more)

### Community 6 - "Development Docker Compose Stack"
Cohesion: 0.07
Nodes (28): depends_on, environment, postgres, DB_HOST, DB_PORT, DB_SSL, POSTGRES_DB, POSTGRES_PASSWORD (+20 more)

### Community 7 - "GitHub Actions CI/CD Deployment"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, name, runs-on, steps, timeout-minutes, jobs (+14 more)

### Community 8 - "Express Server & Security Middleware"
Cohesion: 0.16
Nodes (12): morgan@^1.10.0, allowedOrigins, app, compression, cors, express, helmet, morgan (+4 more)

### Community 9 - "Backend Core Dependencies & AWS S3"
Cohesion: 0.15
Nodes (13): dependencies, @aws-sdk/client-s3@^3.1067.0, dotenv@^16.4.5, multer@^1.4.5-lts.1, pg@^8.11.5, uuid@^9.0.1, winston@^3.13.0, @aws-sdk/client-s3 (+5 more)

### Community 10 - "Backend Package & Development Tooling"
Cohesion: 0.18
Nodes (11): @aws-sdk/s3-request-presigner@^3.1067.0, description, devDependencies, nodemon@^3.1.0, engines, node, @aws-sdk/s3-request-presigner, main (+3 more)

### Community 11 - "Documentation Architecture & Ingress Flow"
Cohesion: 0.18
Nodes (11): Vite HTML Single-Page Entrypoint, Vault Shield & Padlock Brand Icon, DevOps Handover & Production Runbook, Automated S3 Database Disaster Recovery, Hostinger DNS A-Record (document-vault), NGINX Host Reverse Proxy (Ports 80/443), AWS EC2 Production Server (65.1.139.188), Document Vault System Architecture (+3 more)

### Community 13 - "AWS SDK S3 Dependencies"
Cohesion: 0.47
Nodes (5): dependencies, @aws-sdk/client-s3@^3.1067.0, @aws-sdk/s3-request-presigner@^3.1067.0, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner

### Community 14 - "Frontend Scripts & Tooling"
Cohesion: 0.50
Nodes (4): scripts, dev, lint, start

## Knowledge Gaps
- **6 isolated node(s):** `NGINX Host Reverse Proxy (Ports 80/443)`, `Hostinger DNS A-Record (document-vault)`, `Automated S3 Database Disaster Recovery`, `Zero-Trust Magic-Byte Malware Inspection`, `GitHub Actions Automated CI/CD Deploy` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 149 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React Application & Routing` to `Frontend UI Components & Modals`, `Frontend Dependencies & Libraries`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `NGINX Host Reverse Proxy (Ports 80/443)`, `Hostinger DNS A-Record (document-vault)`, `Automated S3 Database Disaster Recovery` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `React Application & Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.10971348707197764 - nodes in this community are weakly interconnected._
- **Why does `StorageService` connect `Document Storage Service (S3 & Local)` to `Database Configuration & Pool`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Should `Frontend UI Components & Modals` be split into smaller, more focused modules?**
  _Cohesion score 0.12941176470588237 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `React Application & Routing` to `Frontend UI Components & Modals`, `Frontend Dependencies & Libraries`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `Database Configuration & Pool` be split into smaller, more focused modules?**
  _Cohesion score 0.05585106382978723 - nodes in this community are weakly interconnected._