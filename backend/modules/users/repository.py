from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from modules.users.models import UserModel


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, login: str, hashed_password: str):
        db_user = UserModel(login=login, hashed_password=hashed_password)

        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)

        return db_user

    async def get_by_login(self, login: str):
        user = await self.db.scalars(
            select(UserModel).where(UserModel.login == login, UserModel.is_active)
        )

        return user.first()
