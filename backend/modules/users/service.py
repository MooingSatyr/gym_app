from modules.users.repository import UserRepository
from modules.users.schemas import UserCreate
from modules.users.models import UserModel
from modules.users.exceptions import LoginAlreadyExistsError

from core.security import hash_password


class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def create_user(self, user: UserCreate) -> UserModel:
        existing = await self.user_repo.get_by_login(user.login)
        if existing:
            raise LoginAlreadyExistsError()

        return await self.user_repo.create(
            login=user.login, hashed_password=hash_password(user.password)
        )
