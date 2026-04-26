from fastapi import APIRouter, Query

from app.controllers.hospital_controller import get_hospital, list_hospitals
from app.schemas.hospital import HospitalDetailResponse, HospitalListResponse

router = APIRouter(tags=["hospitals"])


@router.get("/hospitals", response_model=HospitalListResponse)
async def hospitals(limit: int = Query(default=50, ge=1, le=200)):
    return await list_hospitals(limit)


@router.get("/hospital/{hospital_id}", response_model=HospitalDetailResponse)
async def hospital_detail(hospital_id: str):
    return await get_hospital(hospital_id)
