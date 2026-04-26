from __future__ import annotations

from bson import ObjectId

from app.core.database import get_db
from app.models.hospital import HOSPITAL_COLLECTION, TIMELINE_COLLECTION


class HospitalService:
    async def list_hospitals(self, limit: int = 50) -> list[dict]:
        db = get_db()
        cursor = db[HOSPITAL_COLLECTION].find({}, {"embedding": 0}).limit(limit)
        hospitals = await cursor.to_list(length=limit)
        return [self._normalize(h) for h in hospitals]

    async def get_hospital(self, hospital_id: str) -> dict | None:
        db = get_db()
        doc = await db[HOSPITAL_COLLECTION].find_one({"_id": ObjectId(hospital_id)}, {"embedding": 0})
        if not doc:
            return None
        timeline = await db[TIMELINE_COLLECTION].find_one({"hospital_id": hospital_id})
        hospital = self._normalize(doc)
        hospital["truth_confidence_timeline"] = (timeline or {}).get("timeline", [])
        return hospital

    def _normalize(self, item: dict) -> dict:
        item = dict(item)
        if "_id" in item:
            item["id"] = str(item.pop("_id"))
        return item
