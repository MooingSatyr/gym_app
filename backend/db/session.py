from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from core.config import settings

assert settings.DATABASE_URL is not None

async_engine = create_async_engine(settings.DATABASE_URL, echo=True)


async_session_maker = async_sessionmaker(
    async_engine, expire_on_commit=False, class_=AsyncSession
)
