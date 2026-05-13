from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm


from modules.auth.dependency import AuthService, get_auth_service

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    try:
        token = await service.login(
            login=form_data.username, password=form_data.password
        )
        return {"access_token": token, "token_type": "bearer"}

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
