from fastapi.security import OAuth2PasswordBearer
from modules.auth.service import AuthService
from modules.users.repository import UserRepository
from modules.users.models import UserModel
from fastapi import Depends, HTTPException
from modules.users.dependency import get_user_repository
from core.security_exceptions import InvalidTokenError, ExpiredTokenError
from modules.auth.exceptions import UserNotFoundError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    auth_service = AuthService(user_repo)
    return auth_service


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> UserModel:
    try:
        return await auth_service.get_user_from_token(token)
    except ExpiredTokenError:
        raise HTTPException(
            401, "Token expired", headers={"WWW-Authenticate": "Bearer"}
        )
    except (InvalidTokenError, UserNotFoundError):
        raise HTTPException(
            401, "Invalid token", headers={"WWW-Authenticate": "Bearer"}
        )
