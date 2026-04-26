from __future__ import annotations

import httpx

from app.core.config import get_settings


class TavilyValidationService:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def validate_hospital(self, hospital: dict) -> dict:
        if not self.settings.tavily_api_key:
            return {
                "provider": "tavily",
                "enabled": False,
                "confidence": "unavailable",
                "summary": "Tavily API key missing. External validation not executed.",
                "signals": [],
            }

        query = (
            f"Validate hospital details in India: {hospital.get('name', '')}, "
            f"city {hospital.get('city', '')}, state {hospital.get('state', '')}, "
            f"capability {hospital.get('capability', '')}. Find whether details are consistent."
        )

        payload = {
            "api_key": self.settings.tavily_api_key,
            "query": query,
            "search_depth": "advanced",
            "max_results": 3,
            "include_answer": True,
        }

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(self.settings.tavily_base_url, json=payload)
                response.raise_for_status()
                data = response.json()

            sources = [item.get("url", "") for item in data.get("results", []) if item.get("url")]
            answer = data.get("answer") or "External sources found for validation."

            return {
                "provider": "tavily",
                "enabled": True,
                "confidence": "high" if len(sources) >= 2 else "medium",
                "summary": answer,
                "signals": sources,
            }
        except Exception:
            return {
                "provider": "tavily",
                "enabled": True,
                "confidence": "low",
                "summary": "External validation request failed.",
                "signals": [],
            }
