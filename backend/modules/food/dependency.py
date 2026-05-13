from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.dependency import get_async_db
from modules.food.repository import FoodReportRepository
from modules.food.service import FoodReportService


def get_food_report_repository(
    db: AsyncSession = Depends(get_async_db),
) -> FoodReportRepository:
    return FoodReportRepository(db)


def get_food_report_service(
    food_report_repo: FoodReportRepository = Depends(get_food_report_repository),
) -> FoodReportService:
    return FoodReportService(food_report_repo)
