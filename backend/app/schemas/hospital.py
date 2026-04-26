from pydantic import BaseModel


class HospitalListResponse(BaseModel):
    hospitals: list[dict]


class HospitalDetailResponse(BaseModel):
    hospital: dict
