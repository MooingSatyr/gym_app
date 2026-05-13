from datetime import date

from modules.food.dto import FoodReportDTO
from modules.food.exceptions import FoodReportNotExistError
from modules.food.models import FoodReportModel
from modules.food.repository import FoodReportRepository
from modules.food.schemas import CreateFoodReport, DailySummary
from modules.users.models import UserModel


class FoodReportService:
    def __init__(self, food_report_repo: FoodReportRepository) -> None:
        self.food_report_repo = food_report_repo

    async def get_food_by_id(self, id: int, current_user: UserModel) -> FoodReportModel:
        food = await self.food_report_repo.get_by_id(id)
        if not food:
            raise FoodReportNotExistError()

        if food.user_id != current_user.id:
            raise FoodReportNotExistError()

        return food

    async def create_food_report(
        self, food: CreateFoodReport, current_user: UserModel
    ) -> FoodReportModel:

        dto = FoodReportDTO.from_raw(
            user_id=current_user.id,
            name=food.name,
            gramms=food.gramms,
            proteins_per_100=food.proteins,
            fats_per_100=food.fats,
            carbs_per_100=food.carbs,
        )

        return await self.food_report_repo.create_food_report(dto)

    async def get_daily_summary(
        self, date: date, current_user: UserModel
    ) -> DailySummary:

        reports_list = await self.food_report_repo.get_by_user_and_date(
            current_user.id, date
        )

        return DailySummary(
            date=date,
            total_calories=sum(elem.calories for elem in reports_list),
            total_proteins=sum(elem.proteins for elem in reports_list),
            total_fats=sum(elem.fats for elem in reports_list),
            total_carbs=sum(elem.carbs for elem in reports_list),
        )

    async def update_food_report(
        self, id: int, food: CreateFoodReport, current_user: UserModel
    ):

        await self.get_food_by_id(id, current_user)

        dto = FoodReportDTO.from_raw(
            user_id=current_user.id,
            name=food.name,
            gramms=food.gramms,
            proteins_per_100=food.proteins,
            fats_per_100=food.fats,
            carbs_per_100=food.carbs,
        )

        return await self.food_report_repo.update_food_report(id, dto)

    async def get_food_list(self, day: date, current_user: UserModel):
        return await self.food_report_repo.get_food_list(day, current_user.id)
