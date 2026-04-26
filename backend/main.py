from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.core.config import get_settings
from app.core.database import MongoManager
from app.core.rate_limit import limiter
from app.routes import admin, auth, emergency, hospitals, search

settings = get_settings()


def _normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def _build_cors_origins(frontend_origin: str) -> list[str]:
    origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    }

    for origin in frontend_origin.split(","):
        cleaned = _normalize_origin(origin)
        if cleaned:
            origins.add(cleaned)

    return sorted(origins)


@asynccontextmanager
async def lifespan(app: FastAPI):
    MongoManager.connect()
    try:
        # Verify connection
        await MongoManager.client.admin.command('ping')
        print("✅ Successfully connected to MongoDB")
    except Exception as e:
        print(f"❌ Could not connect to MongoDB: {e}")
    yield
    MongoManager.close()


app = FastAPI(
    title="IndiaMedicare AI - Smart Healthcare, Trusted Decisions",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins(settings.frontend_origin),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(search.router)
app.include_router(hospitals.router)
app.include_router(emergency.router)
app.include_router(admin.router)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "disclaimer": "This system provides guidance. Please verify hospital details before emergency decisions.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
