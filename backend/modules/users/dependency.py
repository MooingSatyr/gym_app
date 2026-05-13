from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from core.dependency import get_async_db
from modules.users.repository import UserRepository
from modules.users.service import UserService


def get_user_repository(db: AsyncSession = Depends(get_async_db)) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(user_repo)
