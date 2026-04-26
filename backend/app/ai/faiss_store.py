from __future__ import annotations

import json
from pathlib import Path

import faiss
import numpy as np


class FaissStore:
    def __init__(self, index_path: str, meta_path: str, dim: int = 1536):
        self.index_path = Path(index_path)
        self.meta_path = Path(meta_path)
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.metadata: list[dict] = []

    def normalize(self, vectors: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return vectors / norms

    def add(self, vectors: np.ndarray, metadata: list[dict]) -> None:
        vectors = vectors.astype("float32")
        vectors = self.normalize(vectors)
        self.index.add(vectors)
        self.metadata.extend(metadata)

    def search(self, query_vector: np.ndarray, k: int = 10) -> list[dict]:
        if self.index.ntotal == 0:
            return []
        q = query_vector.astype("float32").reshape(1, -1)
        q = self.normalize(q)
        distances, indices = self.index.search(q, k)
        results: list[dict] = []
        for rank, idx in enumerate(indices[0].tolist()):
            if idx < 0 or idx >= len(self.metadata):
                continue
            item = dict(self.metadata[idx])
            item["vector_score"] = float(distances[0][rank])
            results.append(item)
        return results

    def save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))
        self.meta_path.write_text(json.dumps(self.metadata, ensure_ascii=True, indent=2), encoding="utf-8")

    def load(self) -> None:
        if self.index_path.exists() and self.meta_path.exists():
            self.index = faiss.read_index(str(self.index_path))
            self.metadata = json.loads(self.meta_path.read_text(encoding="utf-8"))
