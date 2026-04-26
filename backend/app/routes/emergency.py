from fastapi import APIRouter, Request

from app.controllers.emergency_controller import trigger_emergency
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.schemas.emergency import EmergencyRequest, EmergencyResponse

router = APIRouter(tags=["emergency"])
settings = get_settings()


@router.post("/emergency", response_model=EmergencyResponse)
@limiter.limit(settings.rate_limit_default)
async def emergency(request: Request, payload: EmergencyRequest):
    return await trigger_emergency(lat=payload.lat, lon=payload.lon, medical_need=payload.medical_need)
