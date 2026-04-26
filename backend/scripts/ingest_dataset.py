import asyncio

from app.services.dataset_service import DatasetService


async def main() -> None:
    service = DatasetService()
    result = await service.ingest()
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
