from fastapi import APIRouter, Depends, HTTPException
from modules.users.schemas import User, UserCreate
from modules.users.dependency import get_user_service

from modules.users.exceptions import LoginAlreadyExistsError

from modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=User)
async def create_user(
    user: UserCreate, service: UserService = Depends(get_user_service)
):
    try:
        return await service.create_user(user)
    except LoginAlreadyExistsError:
        raise HTTPException(400, "Login already exists")
