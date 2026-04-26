from fastapi import HTTPException

from app.services.hospital_service import HospitalService

service = HospitalService()


async def list_hospitals(limit: int = 50) -> dict:
    hospitals = await service.list_hospitals(limit)
    return {"hospitals": hospitals}


async def get_hospital(hospital_id: str) -> dict:
    hospital = await service.get_hospital(hospital_id)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {"hospital": hospital}
