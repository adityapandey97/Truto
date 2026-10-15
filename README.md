# CodePilot AI (Truto) ⚡
### Enterprise-Grade, Repository-Aware AI Coding Assistant & Monorepo Platform

[![CI Backend](https://img.shields.io/badge/Backend%20Tests-22%20Passed-emerald.svg)](backend/)
[![CI AI Service](https://img.shields.io/badge/AI%20Tests-20%20Passed-emerald.svg)](ai/)
[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20Verified-blue.svg)](frontend/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Layered%20N--Tier-indigo.svg)](#architecture-overview)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

CodePilot AI is an open-source, full-stack, repository-aware AI coding assistant engineered for large software codebases. Inspired by Cursor and modern agentic developer tools, it combines **Tree-sitter AST symbol extraction**, **hybrid lexical (BM25Plus) and semantic (pgvector) code retrieval**, an **autonomous Finite-State Machine agent orchestrator**, **multi-file patch generation**, and **sandboxed verification**.

---

## 📑 Table of Contents
1. [Master Deployment Roadmap & Manual Tasks Checklist](#1-master-deployment-roadmap--manual-tasks-checklist)
2. [Monorepo Architecture & Tech Stack](#2-monorepo-architecture--tech-stack)
3. [Local Development Setup (Zero-Config to Full Stack)](#3-local-development-setup-zero-config-to-full-stack)
4. [Environment Variables Reference (All Keys Explained)](#4-environment-variables-reference-all-keys-explained)
5. [Step-by-Step Production Deployment Guide](#5-step-by-step-production-deployment-guide)
   - [Option A: Free/PaaS Deployment (Vercel + Render + MongoDB Atlas + Neon)](#option-a-free--low-cost-paas-deployment-recommended)
   - [Option B: Single Cloud VPS / Docker Compose (DigitalOcean / EC2 / Hetzner)](#option-b-single-vps--docker-compose-deployment)
6. [Pre-Deployment & Post-Deployment Verification](#6-pre-deployment--post-deployment-verification)
7. [SDE Placement & Interview Presentation Guide](#7-sde-placement--interview-presentation-guide)

---

## 1. Master Deployment Roadmap & Manual Tasks Checklist

Before deploying this application to production, complete the following manual tasks:

### 📋 Phase A: Account Creation & Service Provisioning
- [ ] **1. Cloud MongoDB (Document Database)**:
  - Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
  - Create a **Free Shared Cluster (M0 Sandbox)** in your preferred region.
  - In **Database Access**: Create a database user (e.g., `codepilot_admin`) with read/write privileges and a secure password.
  - In **Network Access**: Add IP Access `0.0.0.0/0` (allow access from anywhere for cloud microservices).
  - Copy your connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/codepilot?retryWrites=true&w=majority`.

- [ ] **2. Cloud PostgreSQL with pgvector (Vector Database)**:
  - Register at [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) (both provide free PostgreSQL with `pgvector` pre-installed).
  - Create a project named `codepilot-vectors`.
  - Open the **SQL Editor** in Neon/Supabase and execute [`ai/app/migrations/001_initial_pgvector.sql`](ai/app/migrations/001_initial_pgvector.sql) to provision tables, schemas, and HNSW indexes.
  - Copy your pooled connection URI: `postgresql://<user>:<password>@<host>/codepilot_vectors?sslmode=require`.

- [ ] **3. LLM Provider API Key (AI Reasoning)**:
  - Register at [OpenAI Platform](https://platform.openai.com/) or [Anthropic Console](https://console.anthropic.com/).
  - Create a secret API key (`sk-...`).
  - Ensure payment method / credit balance is active on your OpenAI/Anthropic account.
  - *(Alternative for zero-cost self-hosting)*: Setup [Ollama](https://ollama.ai) on your server with `llama3` or `codellama`.

- [ ] **4. Cloud Hosting Accounts**:
  - Register at [Render](https://render.com) or [Railway](https://railway.app) (for Backend & AI microservices).
  - Register at [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (for React Frontend).
  - Connect your GitHub repository: `https://github.com/adityapandey97/Truto`.

---

### 📋 Phase B: Configuration & Secret Generation
- [ ] **5. Generate Cryptographic JWT Secret**:
  - Generate a 64-character random key in your terminal:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
  - Store this key as `JWT_SECRET` in `backend/.env`.

- [ ] **6. Generate Internal Service Key**:
  - Generate an internal token for Node.js-to-FastAPI authentication:
    ```bash
    node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
    ```
  - Use this value for `INTERNAL_SERVICE_KEY` in both `backend/.env` and `ai/.env`.

- [ ] **7. Setup Domain & DNS Records (Optional for Custom Domains)**:
  - If using a custom domain (e.g., `codepilot.dev`):
    - `app.codepilot.dev` $\to$ CNAME pointing to Vercel/Netlify.
    - `api.codepilot.dev` $\to$ CNAME or A Record pointing to Express backend.

---

### 📋 Phase C: Build & Test Verification
- [ ] **8. Run Automated Backend Tests**:
  - In `backend/`: Run `npm test` $\to$ Ensure all **22 test suites pass**.
- [ ] **9. Run Automated AI Service Tests**:
  - In `ai/`: Run `python -m pytest ai/tests` $\to$ Ensure all **20 pytest tests pass**.
- [ ] **10. Verify Frontend Build Bundle**:
  - In `frontend/`: Run `npm run build` $\to$ Verify zero compilation errors.

---

## 2. Monorepo Architecture & Tech Stack

```
truto/
├── frontend/       # React 19, Vite, Tailwind CSS, Lucide Icons, Recharts
├── backend/        # Node.js 22, Express, MongoDB (Mongoose), JWT, Zod, Pino, Helmet
├── ai/             # Python 3.13, FastAPI, Tree-sitter, BM25Plus, pgvector, Pytest
├── docker-compose.yml # Containerized orchestration (MongoDB + Postgres/pgvector + Services)
└── .gitignore      # Monorepo hygiene rules
```

```mermaid
graph TD
    User["Developer Browser / Client"] -->|HTTPS / WSS| Vercel["Frontend SPA (React 19 + Vite)"]
    Vercel -->|REST API / Cookies / Bearer| Express["Node.js Express Gateway (:5000)"]
    
    subgraph "Core Backend Services"
        Express --> Auth["Auth & RBAC (JWT & bcrypt)"]
        Express --> ProjectService["Project & Repo Service"]
        Express --> MongoDB[("MongoDB Atlas (Docs, Users, Chats, Jobs)")]
    end
    
    subgraph "AI Intelligence Service"
        Express -->|X-Internal-Service-Key| FastAPI["Python FastAPI Service (:8000)"]
        FastAPI --> AST["Tree-sitter AST & Syntax Chunker"]
        FastAPI --> Hybrid["Hybrid Retriever (BM25Plus + Vector RRF)"]
        FastAPI --> Postgres[("PostgreSQL 16 + pgvector (HNSW Index)")]
        FastAPI --> Agent["Agent Orchestrator FSM"]
        FastAPI --> LLM["LLM Provider (OpenAI / Anthropic / Ollama)"]
    end
```

---

## 3. Local Development Setup (Zero-Config to Full Stack)

### Prerequisites
* **Node.js**: v20.x or v22.x (`node --version`)
* **Python**: 3.11, 3.12, or 3.13 (`python --version`)
* **Git**: Installed and configured

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/adityapandey97/Truto.git
cd Truto
```

---

### Step 2: Backend Setup (Node.js & Express)
```bash
cd backend

# Install dependencies (255 packages)
npm install

# Setup environment variables
cp .env.example .env

# Run automated integration tests (Runs with zero-config in-memory MongoDB)
npm test

# Start development server with file-watching
npm run dev
```
* Backend runs at: `http://localhost:5000`
* Health probe: `http://localhost:5000/health`
* Readiness check: `http://localhost:5000/ready`

> **Note on Database**: If you do not have local MongoDB running, the backend automatically falls back to an embedded `mongodb-memory-server` in development mode, allowing you to code and test immediately!

---

### Step 3: AI Service Setup (Python & FastAPI)
```bash
cd ../ai

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env

# Run automated pytest suite (20 tests)
python -m pytest tests/ -v

# Start FastAPI development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* FastAPI runs at: `http://localhost:8000`
* Interactive OpenAPI Docs: `http://localhost:8000/docs`
* Health probe: `http://localhost:8000/health`

---

### Step 4: Frontend Setup (React & Vite)
```bash
cd ../frontend

# Install dependencies
npm install

# Verify production build
npm run build

# Start Vite development server
npm run dev
```
* Frontend runs at: `http://localhost:5173`

---

### Step 5: Full Containerized Stack (One-Command Startup)
If Docker and Docker Compose are installed on your machine:
```bash
docker compose up --build
```
This boots up:
* `mongodb` on `27017`
* `postgres` (with `pgvector`) on `5432`
* `ai-service` on `8000`
* `backend` on `5000`
* `frontend` on `5173`

---

## 4. Environment Variables Reference (All Keys Explained)

### A. Backend Variables (`backend/.env`)
| Variable | Example / Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express HTTP listener. |
| `NODE_ENV` | `development` / `production` | Environment mode. In production, hides error stacks and enables secure cookies. |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin(s), comma-separated. |
| `JWT_SECRET` | *(64-char string)* | Cryptographic secret for signing JWT access and refresh tokens. |
| `JWT_EXPIRES_IN` | `15m` | Lifetime of short-lived access tokens. |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Lifetime of long-lived refresh tokens. |
| `MONGODB_URI` | `mongodb://localhost:27017/codepilot` | MongoDB connection URI (or MongoDB Atlas URI in production). |
| `AI_SERVICE_URL` | `http://localhost:8000` | Internal URL to reach the Python FastAPI service. |
| `INTERNAL_SERVICE_KEY` | *(Secret token)* | Shared internal key for Node.js-to-FastAPI authentication. |

---

### B. AI Service Variables (`ai/.env`)
| Variable | Example / Default | Description |
|---|---|---|
| `AI_SERVICE_PORT` | `8000` | Port for Uvicorn listener. |
| `ENVIRONMENT` | `development` / `production` | Service environment. |
| `INTERNAL_SERVICE_KEY` | *(Secret token)* | Must match the `INTERNAL_SERVICE_KEY` configured in the backend. |
| `POSTGRES_URI` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string for pgvector. |
| `ENABLE_PGVECTOR` | `false` / `true` | Set to `true` when live PostgreSQL with pgvector is connected. |
| `LLM_PROVIDER` | `mock` / `openai` / `anthropic` / `ollama` | Selected LLM backend provider. |
| `LLM_MODEL` | `gpt-4o-mini` | LLM model identifier. |
| `LLM_API_KEY` | `sk-...` | API Key for hosted LLM provider. |
| `EMBEDDING_PROVIDER` | `mock` / `sentence_transformers` / `openai` | Selected embedding generation provider. |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Embedding model identifier. |
| `EMBEDDING_DIM` | `384` | Dimension of vectors (must match PostgreSQL schema). |
| `MAX_AGENT_ITERATIONS` | `8` | Maximum execution cycles allowed in agent FSM. |
| `VERIFICATION_TIMEOUT_SECONDS` | `30` | Timeout for sandboxed test execution. |

---

### C. Frontend Variables (`frontend/.env`)
| Variable | Example / Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | Base URL pointing to the Express backend gateway. |
| `VITE_DEMO_MODE` | `false` | Set to `false` for live full-stack backend integration; `true` for offline simulated demo. |

---

## 5. Step-by-Step Production Deployment Guide

---

### Option A: Free / Low-Cost PaaS Deployment (Recommended)
This is the fastest, zero-maintenance deployment stack for student portfolios and live demonstrations.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Vercel      │       │     Render      │       │     Render      │
│ (React Frontend)│ ────> │(Express Backend)│ ────> │  (FastAPI AI)   │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
                                   │                         │
                                   ▼                         ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │  MongoDB Atlas  │       │ Neon (pgvector) │
                          │(Document Store) │       │ (Vector Store)  │
                          └─────────────────┘       └─────────────────┘
```

#### 1. Deploy Databases:
* **MongoDB Atlas**: Follow [Phase A, Task 1](#1-master-deployment-roadmap--manual-tasks-checklist). Save connection string.
* **Neon.tech PostgreSQL**: Follow [Phase A, Task 2](#1-master-deployment-roadmap--manual-tasks-checklist). Run [`001_initial_pgvector.sql`](ai/app/migrations/001_initial_pgvector.sql). Save connection string.

#### 2. Deploy AI Microservice on Render:
1. Log in to [Render](https://render.com) $\to$ Click **New +** $\to$ **Web Service**.
2. Connect `https://github.com/adityapandey97/Truto`.
3. Set **Root Directory**: `ai`
4. Set **Runtime**: `Python 3`
5. Set **Build Command**: `pip install -r requirements.txt`
6. Set **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. In **Environment Variables**, add:
   * `ENVIRONMENT`: `production`
   * `INTERNAL_SERVICE_KEY`: *(Your generated internal key)*
   * `POSTGRES_URI`: *(Your Neon connection string)*
   * `ENABLE_PGVECTOR`: `true`
   * `LLM_PROVIDER`: `openai`
   * `LLM_API_KEY`: *(Your OpenAI API key)*
   * `EMBEDDING_PROVIDER`: `mock` (or `sentence_transformers`)
   * `EMBEDDING_DIM`: `384`
8. Deploy and copy your service URL (e.g. `https://codepilot-ai.onrender.com`).

#### 3. Deploy Express Backend on Render:
1. Click **New +** $\to$ **Web Service**.
2. Connect repository.
3. Set **Root Directory**: `backend`
4. Set **Runtime**: `Node`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. In **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `PORT`: `10000`
   * `MONGODB_URI`: *(Your MongoDB Atlas URI)*
   * `JWT_SECRET`: *(Your 64-char JWT secret)*
   * `AI_SERVICE_URL`: `https://codepilot-ai.onrender.com`
   * `INTERNAL_SERVICE_KEY`: *(Your internal service key)*
   * `CORS_ORIGIN`: `https://codepilot-frontend.vercel.app`
8. Deploy and copy your backend URL (e.g. `https://codepilot-api.onrender.com`).

#### 4. Deploy Frontend on Vercel:
1. Log in to [Vercel](https://vercel.com) $\to$ Click **Add New...** $\to$ **Project**.
2. Select your GitHub repository.
3. In **Root Directory**: Select `frontend`.
4. Framework Preset: **Vite** (auto-detected).
5. In **Environment Variables**, add:
   * `VITE_API_BASE_URL`: `https://codepilot-api.onrender.com/api`
   * `VITE_DEMO_MODE`: `false`
6. Click **Deploy**. Your frontend is now live worldwide!

---

### Option B: Single VPS / Docker Compose Deployment
Ideal for self-hosting on AWS EC2, DigitalOcean Droplet ($12-24/mo), or Hetzner.

#### 1. Server Preparation (Ubuntu 22.04 / 24.04):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-v2 git nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker
```

#### 2. Clone Monorepo & Configure Production Secrets:
```bash
cd /opt
sudo git clone https://github.com/adityapandey97/Truto.git codepilot
cd codepilot

# Setup environment files
sudo cp backend/.env.example backend/.env
sudo cp ai/.env.example ai/.env
sudo cp frontend/.env.example frontend/.env
```
Edit `backend/.env`, `ai/.env`, and `frontend/.env` with your real secrets using `sudo nano`.

#### 3. Start Containerized Stack:
```bash
sudo docker compose up -d --build
```
Verify all 5 containers are running:
```bash
sudo docker compose ps
```

#### 4. Setup Nginx Reverse Proxy & SSL:
Create `/etc/nginx/sites-available/codepilot`:
```nginx
server {
    server_name codepilot.yourdomain.com;
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable and obtain free SSL certificates:
```bash
sudo ln -s /etc/nginx/sites-available/codepilot /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d codepilot.yourdomain.com -d api.yourdomain.com
```

---

## 6. Pre-Deployment & Post-Deployment Verification

### Pre-Deployment Test Matrix
Before deploying any commit to production, execute the automated regression test matrix:

| Component | Test Command | Passing Criteria |
|---|---|---|
| **AI Microservice** | `python -m pytest ai/tests -v` | **20 / 20 tests pass** |
| **Node.js Gateway** | `npm test` *(inside `backend/`)* | **22 / 22 tests pass** |
| **React Frontend** | `npm run build` *(inside `frontend/`)* | **Exit code 0, bundle generated** |

### Post-Deployment Live Smoke Tests
Once deployed, test your live production URLs using curl:

1. **Verify Backend Liveness**:
   ```bash
   curl -i https://codepilot-api.onrender.com/health
   # Expected: HTTP 200 {"status":"healthy","uptime":...}
   ```
2. **Verify Backend Database Readiness**:
   ```bash
   curl -i https://codepilot-api.onrender.com/ready
   # Expected: HTTP 200 {"status":"ready","database":"connected"}
   ```
3. **Verify AI Microservice Health**:
   ```bash
   curl -i https://codepilot-ai.onrender.com/health
   # Expected: HTTP 200 {"status":"healthy","service":"codepilot-ai-service"}
   ```
4. **End-to-End User Verification**:
   - Open your live frontend URL.
   - Register a new developer account.
   - Open the **Assistant** tab and ask: `"Explain the authentication architecture in this codebase"`.
   - Verify that the response contains grounded source citations and file references.

---

## 7. SDE Placement & Interview Presentation Guide

When showcasing CodePilot AI during Software Engineering (SDE-1 / SDE-2) placement interviews, highlight these **5 core architectural achievements**:

### 🎯 1. Layered Architecture & Separation of Concerns
* *Talking Point*: "I implemented a strict N-Tier architecture (`routes` $\to$ `middleware` $\to$ `controllers` $\to$ `services` $\to$ `models`). The controllers act solely as transport adapters; database access and business rules never bleed into the HTTP layer."
* *Interview Question Answer*: Operational errors are normalized via a custom `ApiError` hierarchy. Request correlation IDs (`X-Request-ID`) are propagated across Node.js and FastAPI services for end-to-end distributed tracing.

### 🎯 2. Non-Blocking Event Loop & Background Worker Pipelines
* *Talking Point*: "Node.js runs on a single-threaded event loop. If we performed heavy AST parsing and vector embeddings synchronously on the main thread, it would block concurrent incoming HTTP requests. I solved this by delegating indexing to background worker jobs tracked asynchronously through the `BackgroundJob` model."

### 🎯 3. Dual Authentication & Cookie Security
* *Talking Point*: "We use a dual authentication strategy: HTTP-only `SameSite=Lax` cookies for browser clients to prevent XSS credential theft, paired with `Authorization: Bearer <token>` support for CLI developer tools (`agy`) and programmatic integrations."

### 🎯 4. Hybrid Retrieval with Reciprocal Rank Fusion (RRF)
* *Talking Point*: "Pure vector search often misses exact code identifier names like `verifyJwtToken` or specific variable names, while pure keyword search misses conceptual queries like 'Where is database connection configured?'. I implemented a Hybrid Retriever using Reciprocal Rank Fusion ($k = 60$) that merges BM25Plus lexical scores with pgvector cosine similarity."

### 🎯 5. Safe Multi-File Patching & Sandboxed Execution
* *Talking Point*: "LLMs should never write arbitrary files directly to disk. CodePilot generates unified Git diffs, validates that proposed paths cannot escape the workspace via path traversal, checks SHA-256 hashes against stale file versions, and verifies patches inside a resource-capped subprocess sandbox with command allowlists."

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
Built with ❤️ for modern software engineering by Aditya Pandey.
