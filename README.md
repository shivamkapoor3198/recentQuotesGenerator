# Design Mantra — BOQ & Quote Generator

Full-stack implementation of the Design Mantra interior BOQ and quote-generator PRD.

## Stack
- Frontend: React 18 + TypeScript + Vite
- Backend: Node.js + Express + Prisma + PostgreSQL + Zod
- Document service: Python 3.11+ + FastAPI + ReportLab + python-docx
- Docker Compose is supported, but **Docker is not required for local development**.

## Run locally without Docker

### 1. Prerequisites
Install Node.js 20+, npm 10+, Python 3.11+, and PostgreSQL 14+.

Create a PostgreSQL database/user. Example with `psql`:

```sql
CREATE USER designmantra WITH PASSWORD 'designmantra';
CREATE DATABASE designmantra OWNER designmantra;
```

### 2. Install dependencies

From the repository root:

```bash
npm install
npm run install:all
npm run db:generate
```

### 3. Configure the backend

```bash
cp backend/.env.example backend/.env
```

The default file points to:

```env
DATABASE_URL=postgresql://designmantra:designmantra@localhost:5432/designmantra?schema=public
DOC_SERVICE_URL=http://localhost:8000
PORT=4000
```

Change the PostgreSQL URL if your local credentials differ.

Prepare and seed the database:

```bash
npm run db:push
npm run db:seed
```

### 4. Configure the frontend

```bash
cp frontend/.env.example frontend/.env
```

Default:

```env
VITE_API_URL=http://localhost:4000
```

### 5. Install Python dependencies

```bash
cd doc-service
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

Windows PowerShell:

```powershell
cd doc-service
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

### 6. Start all three application services

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

Or use three terminals:

```bash
npm run dev:backend
npm run dev:docs
npm run dev:frontend
```

### 7. Verify

```bash
curl http://localhost:4000/health
curl http://localhost:8000/health
```

Then open http://localhost:5173.

## Tests

Document-service smoke tests:

```bash
cd doc-service
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest -q
```

Frontend/backend production builds:

```bash
npm run build
```

## Docker option

Docker remains fully supported:

```bash
docker compose up --build
```

This starts PostgreSQL, Node API, FastAPI document service, and frontend together.

## Note about PostgreSQL

The non-Docker setup does **not** mean the application is database-free. PostgreSQL is still required because the PRD specifies PostgreSQL + Prisma. Docker is simply optional.
