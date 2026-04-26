from fastapi import HTTPException

from app.services.ai_agent import AIAgentService

agent = AIAgentService()


async def search_hospitals(query: str, user_location: dict | None = None) -> dict:
    try:
        return await agent.search(query=query, user_location=user_location)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Search failed: {exc}") from exc
