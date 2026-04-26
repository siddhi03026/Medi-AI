from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=500)
    user_location: dict | None = None


class QueryUnderstanding(BaseModel):
    location: str | None = None
    urgency: str = "normal"
    medical_need: str | None = None
    budget: str = "moderate"


class SearchResponse(BaseModel):
    understanding: QueryUnderstanding
    hospitals: list[dict]
    explainability: dict
