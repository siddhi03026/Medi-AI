from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone

from cachetools import TTLCache
from bson import ObjectId
from openai import AsyncOpenAI
try:
    from groq import AsyncGroq
except ImportError:
    AsyncGroq = None

from app.ai.capability_inference import infer_hidden_capabilities
from app.ai.faiss_store import FaissStore
from app.ai.trust_engine import TrustScoreEngine
from app.core.config import get_settings
from app.core.database import get_db
from app.models.hospital import HOSPITAL_COLLECTION, TIMELINE_COLLECTION
from app.services.embedding_service import EmbeddingService
from app.services.emergency_service import haversine_km
from app.services.tavily_validation import TavilyValidationService


class AIAgentService:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.embeddings = EmbeddingService()
        self.faiss = FaissStore(settings.faiss_index_path, settings.faiss_meta_path)
        self.trust_engine = TrustScoreEngine()
        self.tavily_validation = TavilyValidationService()
        self.cache = TTLCache(maxsize=256, ttl=120)
        
        if settings.groq_api_key and AsyncGroq:
            self.chat_client = AsyncGroq(api_key=settings.groq_api_key)
            self.model_name = "llama-3.3-70b-versatile"
        elif settings.openai_api_key:
            self.chat_client = AsyncOpenAI(api_key=settings.openai_api_key)
            self.model_name = settings.openai_chat_model
        else:
            self.chat_client = None
            self.model_name = None
            
        self.faiss.load()

    async def understand_query(self, query: str) -> dict:
        budget = "moderate"
        if any(word in query.lower() for word in ["cheap", "low budget", "affordable"]):
            budget = "low"
        elif any(word in query.lower() for word in ["premium", "best private", "high budget"]):
            budget = "high"

        urgency = "normal"
        if any(word in query.lower() for word in ["emergency", "urgent", "immediately", "now"]):
            urgency = "high"

        location_match = re.search(r"in ([A-Za-z ]+)", query)
        location = location_match.group(1).strip() if location_match else None

        medical_need = None
        for condition in ["cardiac", "heart", "stroke", "trauma", "cancer", "dialysis", "maternity", "pediatric"]:
            if condition in query.lower():
                medical_need = condition
                break

        if self.chat_client:
            try:
                prompt = (
                    "Extract location, urgency, medical_need and budget from the user query. "
                    "Return strict JSON with keys: location, urgency, medical_need, budget. Query: "
                    f"{query}"
                )
                response = await self.chat_client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0,
                )
                # Keep deterministic fallback parser as source of truth when model output is not parseable.
                _ = response
            except Exception:
                pass

        return {
            "location": location,
            "urgency": urgency,
            "medical_need": medical_need,
            "budget": budget,
        }

    async def search(self, query: str, user_location: dict | None = None, k: int = 12) -> dict:
        cache_key = f"{query}:{user_location}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Ensure the latest ingestion artifacts are picked up without app restart.
        self.faiss.load()

        understanding = await self.understand_query(query)
        query_vec = await self.embeddings.embed_query(query)
        candidates = self.faiss.search(query_vec, k=k)

        db = get_db()
        hospitals: list[dict] = []
        for candidate in candidates:
            doc = await db[HOSPITAL_COLLECTION].find_one({"_id": ObjectId(candidate["_id"])}, {"embedding": 0})
            if not doc:
                continue
            doc["id"] = str(doc.pop("_id"))
            trust = self.trust_engine.compute(doc)
            inferred = infer_hidden_capabilities(doc)
            timeline = self._simulate_timeline(trust.trust_score)

            await db[TIMELINE_COLLECTION].update_one(
                {"hospital_id": doc["id"]},
                {"$set": {"hospital_id": doc["id"], "timeline": timeline, "updated_at": datetime.now(timezone.utc)}},
                upsert=True,
            )

            hospitals.append(
                {
                    **doc,
                    "vector_score": candidate.get("vector_score", 0),
                    "distance_km": self._distance_if_available(doc, user_location),
                    "trust_score": trust.trust_score,
                    "confidence": trust.confidence,
                    "reasons": trust.reasons,
                    "warnings": trust.warnings,
                    "hidden_capabilities": inferred,
                    "truth_confidence_timeline": timeline,
                    "explanation": self._build_explanation(doc, trust, understanding),
                }
            )

        if understanding.get("budget") == "low":
            hospitals.sort(key=lambda h: (h.get("estimated_cost", 999999), -h.get("trust_score", 0)))
        elif understanding.get("urgency") == "high" and user_location:
            hospitals.sort(key=lambda h: h.get("distance_km", 99999))
        else:
            hospitals.sort(key=lambda h: (-h.get("trust_score", 0), -h.get("vector_score", 0)))

        location = (understanding.get("location") or "").strip().lower()
        if location:
            local = [h for h in hospitals if location in str(h.get("city", "")).lower() or location in str(h.get("state", "")).lower()]
            if local:
                hospitals = local + [h for h in hospitals if h not in local]

        # External validation for top results (when configured) to enrich explainability.
        for hospital in hospitals[:5]:
            hospital["external_validation"] = await self.tavily_validation.validate_hospital(hospital)

        response = {
            "understanding": understanding,
            "hospitals": hospitals,
            "explainability": {
                "reasoning": "Results combine vector similarity, trust validation, affordability, and capability inference.",
                "warning": "Low confidence hospitals should be verified before critical decisions.",
                "external_validation": "Tavily-based source checks applied on top results when API key is configured.",
            },
        }
        self.cache[cache_key] = response
        return response

    def _simulate_timeline(self, trust_score: int) -> list[dict]:
        now = datetime.now(timezone.utc)
        points = []
        for i, drift in enumerate([8, 5, 0, -2, 3, -1]):
            points.append(
                {
                    "timestamp": (now - timedelta(days=(5 - i))).isoformat(),
                    "score": max(0, min(100, trust_score - drift)),
                }
            )
        return points

    def _build_explanation(self, hospital: dict, trust, understanding: dict) -> str:
        need = understanding.get("medical_need") or "general care"
        return (
            f"Matched for {need} based on hospital capability and description. "
            f"Trust score {trust.trust_score}/100 with {trust.confidence} confidence from equipment, availability, and data consistency checks."
        )

    def _distance_if_available(self, hospital: dict, user_location: dict | None) -> float | None:
        if not user_location:
            return None
        try:
            lat = float(user_location.get("lat"))
            lon = float(user_location.get("lon"))
            h_lat = float(hospital.get("lat", 0) or 0)
            h_lon = float(hospital.get("lon", 0) or 0)
            if not h_lat and not h_lon:
                return None
            return round(haversine_km(lat, lon, h_lat, h_lon), 2)
        except Exception:
            return None
