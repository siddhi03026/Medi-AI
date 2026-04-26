from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from urllib.parse import urlsplit, urlunsplit
from app.core.config import get_settings


def _masked_mongo_uri(uri: str) -> str:
    parsed = urlsplit(uri)
    netloc = parsed.netloc

    if "@" not in netloc:
        return uri

    userinfo, hostinfo = netloc.rsplit("@", 1)
    if ":" in userinfo:
        username, _ = userinfo.split(":", 1)
        safe_netloc = f"{username}:***@{hostinfo}"
        return urlunsplit((parsed.scheme, safe_netloc, parsed.path, parsed.query, parsed.fragment))

    return uri


class MongoManager:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    @classmethod
    def connect(cls) -> None:
        settings = get_settings()
        cls.client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
        cls.db = cls.client[settings.mongo_db_name]
        print(f"📡 Attempting to connect to MongoDB at {_masked_mongo_uri(settings.mongo_uri)}...")

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
