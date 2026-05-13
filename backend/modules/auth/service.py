from core.security import decode_token
from core.security_exceptions import InvalidTokenError
from modules.users.repository import UserRepository
from modules.users.models import UserModel
from modules.auth.exceptions import UserNotFoundError
from core.security import verify_password, create_access_token


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_from_token(self, token: str) -> UserModel:

        payload = decode_token(token)

        login = payload.get("sub")
        if not login:
            raise InvalidTokenError()

        user = await self.user_repo.get_by_login(login)

        if not user:
            raise UserNotFoundError()

        return user

    async def login(self, login: str, password: str) -> str:
        user = await self.user_repo.get_by_login(login)

        if not user or not verify_password(password, user.hashed_password):
            raise UserNotFoundError()

        return create_access_token({"sub": user.login, "id": user.id})
