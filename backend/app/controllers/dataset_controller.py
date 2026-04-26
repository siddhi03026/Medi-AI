from fastapi import HTTPException

from app.services.dataset_service import DatasetService

service = DatasetService()


async def ingest_dataset(path: str | None = None) -> dict:
    try:
        return await service.ingest(path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {exc}") from exc
