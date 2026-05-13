from db.base import Base

from sqlalchemy import Integer, String, Boolean
from sqlalchemy.orm import mapped_column, Mapped, relationship


class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    login: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    food_reports = relationship(
        "FoodReportModel", back_populates="user", cascade="all, delete-orphan"
    )
