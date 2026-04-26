from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import ast

import pandas as pd

from app.ai.faiss_store import FaissStore
from app.core.config import get_settings
from app.core.database import get_db
from app.models.hospital import HOSPITAL_COLLECTION
from app.services.embedding_service import EmbeddingService


class DatasetService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embedding_service = EmbeddingService()
        self.faiss = FaissStore(self.settings.faiss_index_path, self.settings.faiss_meta_path)

    async def ingest(self, dataset_path: str | None = None) -> dict:
        path = Path(dataset_path or self.settings.dataset_path)
        if not path.exists():
            raise FileNotFoundError(f"Dataset not found: {path}")

        df = pd.read_excel(path)
        cleaned = self._clean(df)

        records = cleaned.to_dict(orient="records")
        text_blobs = [self._build_text_blob(r) for r in records]
        vectors = await self.embedding_service.embed_texts(text_blobs)

        db = get_db()
        await db[HOSPITAL_COLLECTION].delete_many({})

        mongo_docs = []
        faiss_meta = []
        for row in records:
            name = row.get("name") or row.get("hospital_name") or "Unknown Hospital"
            city = row.get("city") or row.get("address_city") or row.get("location") or "Unknown"
            state = row.get("state") or row.get("address_stateOrRegion") or "Unknown"

            capability_tokens = self._parse_listish(row.get("capability"))
            specialty_tokens = self._parse_listish(row.get("specialties"))
            procedure_tokens = self._parse_listish(row.get("procedure"))
            equipment_tokens = self._parse_listish(row.get("equipment"))

            capability_text = ", ".join([*capability_tokens, *specialty_tokens, *procedure_tokens]).strip(", ")
            equipment_text = ", ".join(equipment_tokens)

            lat_val = row.get("latitude") if row.get("latitude") not in [None, ""] else row.get("lat")
            lon_val = row.get("longitude") if row.get("longitude") not in [None, ""] else row.get("lon")

            doc = {
                "name": name,
                "city": city,
                "state": state,
                "description": row.get("description") or "",
                "capability": capability_text,
                "equipment": equipment_text,
                "doctor_availability": row.get("doctor_availability") or row.get("numberDoctors") or row.get("doctors") or "",
                "estimated_cost": float(row.get("estimated_cost", 0) or 0),
                "phone": self._format_phone(row.get("officialPhone") or row.get("phone") or row.get("phone_numbers") or row.get("contact") or "+911080000000"),
                "lat": float(lat_val or 0),
                "lon": float(lon_val or 0),
                "source_updated_at": row.get("updated_at") or datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc),
            }
            mongo_docs.append(doc)

        if mongo_docs:
            insert_result = await db[HOSPITAL_COLLECTION].insert_many(mongo_docs)
            for idx, inserted_id in enumerate(insert_result.inserted_ids):
                faiss_meta.append({"_id": str(inserted_id)})

        self.faiss = FaissStore(self.settings.faiss_index_path, self.settings.faiss_meta_path)
        if len(faiss_meta) > 0:
            self.faiss.add(vectors, faiss_meta)
            self.faiss.save()

        return {
            "records_loaded": len(records),
            "dataset": str(path),
        }

    def _clean(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        expected_columns = [
            "name",
            "hospital_name",
            "description",
            "capability",
            "equipment",
            "specialties",
            "procedure",
            "city",
            "state",
            "address_city",
            "address_stateOrRegion",
            "estimated_cost",
            "phone",
            "officialPhone",
            "phone_numbers",
            "lat",
            "lon",
            "latitude",
            "longitude",
            "numberDoctors",
        ]
        for col in expected_columns:
            if col not in df.columns:
                df[col] = ""
        df.fillna("", inplace=True)
        df["description"] = df["description"].astype(str).str.strip()
        df["capability"] = df["capability"].astype(str).str.strip()
        df["equipment"] = df["equipment"].astype(str).str.strip()
        return df

    def _build_text_blob(self, row: dict) -> str:
        return " | ".join(
            [
                str(row.get("name") or row.get("hospital_name") or ""),
                str(row.get("city") or row.get("address_city") or ""),
                str(row.get("description") or ""),
                str(row.get("capability") or ""),
                str(row.get("specialties") or ""),
                str(row.get("procedure") or ""),
                str(row.get("equipment") or ""),
            ]
        )

    def _format_phone(self, raw: str) -> str:
        digits = "".join(ch for ch in str(raw) if ch.isdigit())
        if len(digits) >= 10:
            return f"+91{digits[-10:]}"
        return "+911080000000"

    def _parse_listish(self, raw: object) -> list[str]:
        if raw is None:
            return []
        value = str(raw).strip()
        if not value or value.lower() == "nan":
            return []
        if value.startswith("[") and value.endswith("]"):
            try:
                parsed = ast.literal_eval(value)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except Exception:
                return [value]
        return [value]
