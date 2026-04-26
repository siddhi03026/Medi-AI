from __future__ import annotations

import hashlib

import numpy as np
from openai import AsyncOpenAI

from app.core.config import get_settings


class EmbeddingService:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.dim = 1536

    async def embed_texts(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dim), dtype="float32")

        if self.client:
            response = await self.client.embeddings.create(model=self.settings.openai_embed_model, input=texts)
            vectors = np.array([d.embedding for d in response.data], dtype="float32")
            return vectors

        # Deterministic fallback for local development without API key.
        return np.array([self._hash_to_vector(text) for text in texts], dtype="float32")

    async def embed_query(self, text: str) -> np.ndarray:
        vectors = await self.embed_texts([text])
        return vectors[0]

    def _hash_to_vector(self, text: str) -> np.ndarray:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(digest[:8], "big", signed=False)
        rng = np.random.default_rng(seed)
        vec = rng.random(self.dim, dtype=np.float32)
        return vec
