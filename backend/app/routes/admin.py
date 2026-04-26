from fastapi import APIRouter, Query

from app.controllers.dataset_controller import ingest_dataset

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/ingest")
async def run_ingestion(path: str | None = Query(default=None)):
    return await ingest_dataset(path)
