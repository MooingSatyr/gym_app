from datetime import datetime

from db.base import Base
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import mapped_column, Mapped, relationship


class FoodReportModel(Base):
    __tablename__ = "food_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    proteins: Mapped[int] = mapped_column(Integer, nullable=False)
    fats: Mapped[int] = mapped_column(Integer, nullable=False)
    gramms: Mapped[int] = mapped_column(Integer, nullable=False)
    carbs: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    report_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    user = relationship("UserModel", back_populates="food_reports")
