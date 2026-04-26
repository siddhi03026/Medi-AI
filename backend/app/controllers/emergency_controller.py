from fastapi import HTTPException

from app.services.emergency_service import EmergencyService

service = EmergencyService()


async def trigger_emergency(lat: float, lon: float, medical_need: str | None = None) -> dict:
    try:
        result = await service.find_nearest_viable(lat=lat, lon=lon, medical_need=medical_need)
        return {
            "nearest_hospital": result["hospital"],
            "call_link": result["call_link"],
            "ambulance": result["ambulance"],
            "note": result["note"],
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
