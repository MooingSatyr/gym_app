from datetime import date

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from modules.food.dto import FoodReportDTO
from modules.food.models import FoodReportModel


class FoodReportRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, id: int) -> FoodReportModel | None:
        food = await self.db.scalars(
            select(FoodReportModel).where(FoodReportModel.id == id)
        )

        return food.first()

    async def create_food_report(self, dto: FoodReportDTO) -> FoodReportModel:
        db_food_report = FoodReportModel(**dto.model_dump())

        self.db.add(db_food_report)

        await self.db.commit()
        await self.db.refresh(db_food_report)

        return db_food_report

    async def get_by_user_and_date(
        self, user_id: int, date: date
    ) -> list[FoodReportModel]:
        result = await self.db.scalars(
            select(FoodReportModel).where(
                FoodReportModel.user_id == user_id,
                func.date(FoodReportModel.report_time) == date,
            )
        )
        return list(result.all())

    async def update_food_report(self, id: int, dto: FoodReportDTO) -> FoodReportModel:
        result = await self.db.execute(
            update(FoodReportModel)
            .where(FoodReportModel.id == id)
            .values(**dto.model_dump())
            .returning(FoodReportModel)
        )

        await self.db.commit()

        return result.scalar_one()

    async def get_food_list(self, day: date, user_id: int):
        result = await self.db.scalars(
            select(FoodReportModel).where(
                FoodReportModel.user_id == user_id,
                func.date(FoodReportModel.report_time) == day,
            )
        )

        return result.all()
