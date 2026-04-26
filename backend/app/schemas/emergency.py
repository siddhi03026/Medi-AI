from pydantic import BaseModel, Field


class EmergencyRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    medical_need: str | None = None


class EmergencyResponse(BaseModel):
    nearest_hospital: dict
    call_link: str
    ambulance: dict
    note: str
