# IndiaMedicare AI - Smart Healthcare, Trusted Decisions

Production-ready full-stack healthcare decision support platform.

## Features

- AI-assisted hospital search with explainable recommendations
- Trust scoring and confidence labels
- Truth Confidence Timeline (simulated and persisted)
- Emergency Reality Mode (nearest viable hospital + tel call + 108 ambulance simulation)
- Hidden Capability Detection from equipment and staffing clues
- Financial-aware ranking
- Accessibility-first UX (large text, high contrast, voice input, text-to-speech, keyboard-friendly controls)
- Full auth system: signup, login, Google login (mock/Firebase-ready), OTP login (mock/Firebase-ready), forgot password

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion + React Leaflet
- Backend: FastAPI (async)
- Database: MongoDB (Motor)
- AI: OpenAI embeddings/chat (optional) + FAISS vector search
- Security: JWT, bcrypt, rate limiting, CORS, input sanitization

## Project Structure

- backend/
  - app/routes
  - app/controllers
  - app/models
  - app/services
  - app/ai
  - main.py
- frontend/
  - src/components
  - src/pages
  - src/services
  - src/hooks
  - src/App.jsx

## Setup

### 1) Start MongoDB

Option A: local MongoDB

Option B: Docker

```bash
docker compose up -d
```

### 2) Backend setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Update `backend/.env` values as needed.

### 3) Dataset placement (required)

Place your dataset file exactly here:

- `backend/data/VF_Hackathon_Dataset_India_Large.xlsx`

This implementation uses this dataset path by default and ingests only this file unless an explicit alternate path is provided via admin endpoint.

### 4) Ingest dataset into MongoDB + FAISS

```bash
cd backend
python -m scripts.ingest_dataset
```

Or via API after backend starts:

```bash
POST /admin/ingest
```

### 5) Run backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 6) Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:8000`

## Environment Variables

### Backend (`backend/.env`)

See `backend/.env.example`.

Important:

- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY` (optional, fallback deterministic embeddings available for local dev)
- `DATASET_PATH`
- `FAISS_INDEX_PATH`

### Frontend (`frontend/.env`)

See `frontend/.env.example`.

- `VITE_API_BASE_URL=http://localhost:8000`

## API Endpoints

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/forgot-password`
- `POST /auth/mobile/request`
- `POST /auth/mobile/verify`

### Search/Hospitals

- `POST /search`
- `GET /hospitals`
- `GET /hospital/{id}`

### Emergency

- `POST /emergency`

### Admin

- `POST /admin/ingest`

## Performance Notes

- Search responses cached for 120 seconds in backend memory
- Vector retrieval by FAISS
- Frontend pages lazy-loaded

## Security Notes

- JWT auth and bcrypt hashing
- Rate limiting using SlowAPI
- CORS restricted by `FRONTEND_ORIGIN`
- Query sanitization on search input
- Environment variable based secrets

## Disclaimer

This system provides guidance. Please verify hospital details before emergency decisions.
