from pydantic import BaseModel, Field, ConfigDict


class User(BaseModel):
    id: int = Field(..., description="id пользователя")
    login: str = Field(..., description="логин пользователя")
    is_active: bool = Field(..., description="актуальность профиля")
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    login: str = Field(..., description="логин пользователя")
    password: str = Field(..., min_length=8, description="пароль пользователя")
