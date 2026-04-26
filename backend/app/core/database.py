from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings


class MongoManager:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    @classmethod
    def connect(cls) -> None:
        settings = get_settings()
        cls.client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
        cls.db = cls.client[settings.mongo_db_name]
        print(f"📡 Attempting to connect to MongoDB at {settings.mongo_uri}...")

    @classmethod
    def close(cls) -> None:
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None


def get_db() -> AsyncIOMotorDatabase:
    if MongoManager.db is None:
        MongoManager.connect()
    return MongoManager.db
