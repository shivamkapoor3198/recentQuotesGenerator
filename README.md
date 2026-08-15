# Design Mantra — BOQ & Quote Generator

Full-stack implementation of the Design Mantra interior BOQ and quote-generator PRD.

## Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + Express + Prisma + PostgreSQL + Zod
- Document service: Python 3.11+ + FastAPI + ReportLab + python-docx
- Docker Compose is supported, but **Docker is not required for local development**.

## Option A — Run locally without Docker

### 1. Prerequisites
Install:
- Node.js 20+
- npm 10+
- Python 3.11+
- PostgreSQL 14+

Create a PostgreSQL database and user matching `.env.example`, or change `DATABASE_URL` to your own connection string.

Example using psql:

```sql
CREATE USER designmantra WITH PASSWORD 'designmantra';
CREATE DATABASE designmantra OWNER designmantra;
```

### 2. Install Node dependencies

From the repository root:

```bash
npm install
npm run install:all
```

Generate Prisma client:

```bash
npm run db:generate
```

Create/update the database schema:

```bash
npm run db:push
```

Seed the starter catalog:

```bash
npm run db:seed
```

### 3. Configure environment

Copy `.env.example` to `.env` and adjust `DATABASE_URL` if your PostgreSQL credentials differ.

Backend local configuration:

```env
DATABASE_URL=postgresql://designmantra:designmantra@localhost:5432/designmantra?schema=public
DOC_SERVICE_URL=http://localhost:8000
PORT=4000
```

Frontend can use:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Install Python dependencies

```bash
cd doc-service
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

On Windows PowerShell:

```powershell
cd doc-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

### 5. Start everything

From the repository root:

```bash
npm run dev
```

This starts:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Node API | http://localhost:4000 |
| Document service | http://localhost:8000 |

If you prefer separate terminals:

```bash
npm run dev:backend
npm run dev:docs
npm run dev:frontend
```

### 6. Verify services

```bash
curl http://localhost:4000/health
curl http://localhost:8000/health
```

Expected responses contain `"ok":true`.

## Document service tests

```bash
cd doc-service
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q
```

## Frontend/backend builds

```bash
npm run build
```

## Option B — Docker

Docker remains supported:

```bash
docker compose up --build
```

The Docker setup includes PostgreSQL, the Node API, the Python document service, and the Vite frontend.

## Important

The local non-Docker setup still requires PostgreSQL to be installed/running. Docker is optional; PostgreSQL itself is not currently replaced by an in-process database because the PRD specifies PostgreSQL + Prisma.
