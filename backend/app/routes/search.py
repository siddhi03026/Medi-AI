from fastapi import APIRouter, Request

from app.controllers.search_controller import search_hospitals
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.search import SearchRequest, SearchResponse
from app.utils.sanitizers import sanitize_text

router = APIRouter(tags=["search"])
settings = get_settings()


@router.post("/search", response_model=SearchResponse)
@limiter.limit(settings.rate_limit_default)
async def run_search(request: Request, payload: SearchRequest):
    return await search_hospitals(sanitize_text(payload.query), payload.user_location)
