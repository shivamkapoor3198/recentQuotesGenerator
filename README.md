# Design Mantra — BOQ & Quote Generator

Full-stack implementation from the PRD.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind
- Backend: Node.js + Express + Prisma + PostgreSQL + Zod
- Document service: FastAPI + ReportLab + python-docx
- Docker Compose

## Run
```bash
cp .env.example .env
docker compose up --build
```
Frontend: http://localhost:5173
Backend: http://localhost:4000/health
Docs service: http://localhost:8000/health
