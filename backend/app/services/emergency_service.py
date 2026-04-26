from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

from app.core.database import get_db
from app.models.hospital import HOSPITAL_COLLECTION


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return r * c


class EmergencyService:
    async def find_nearest_viable(self, lat: float, lon: float, medical_need: str | None = None) -> dict:
        db = get_db()
        try:
            await db.command('ping')
            hospitals = await db[HOSPITAL_COLLECTION].find({}, {"embedding": 0}).to_list(length=1000)
        except Exception:
            print("⚠️ DEMO MODE: MongoDB unreachable, using mock emergency results")
            hospitals = [
                {
                    "_id": "mock_hospital_id",
                    "name": "Demo Emergency Hospital",
                    "city": "New Delhi",
                    "lat": lat + 0.01,
                    "lon": lon + 0.01,
                    "phone": "+91 9999999999",
                    "capability": "Trauma, Cardiac, ER",
                    "description": "Best emergency care in the city."
                }
            ]

        if not hospitals:
            raise ValueError("No hospitals available. Load dataset first.")


        scored = []
        for hospital in hospitals:
            h_lat = float(hospital.get("lat", 0) or 0)
            h_lon = float(hospital.get("lon", 0) or 0)
            if h_lat == 0 and h_lon == 0:
                continue
            distance = haversine_km(lat, lon, h_lat, h_lon)
            viability = 1
            text = f"{hospital.get('capability', '')} {hospital.get('description', '')}".lower()
            if medical_need and medical_need.lower() in text:
                viability = 0
            scored.append((distance + viability, distance, hospital))

        if not scored:
            raise ValueError("No geocoded hospitals available")

        scored.sort(key=lambda row: row[0])
        _, distance, best = scored[0]

        phone = best.get("phone", "+911080000000")
        return {
            "hospital": {
                "id": str(best.get("_id")),
                "name": best.get("name", "Unknown Hospital"),
                "city": best.get("city", "Unknown"),
                "distance_km": round(distance, 2),
                "phone": phone,
                "lat": best.get("lat"),
                "lon": best.get("lon"),
            },
            "call_link": f"tel:{phone}",
            "ambulance": {
                "provider": "108 National Ambulance Service (simulated)",
                "booking_status": "ready_to_dispatch",
                "eta_minutes": max(6, int(distance * 3)),
            },
            "note": "Emergency mode prioritizes nearest viable hospital, not overall best score.",
        }
