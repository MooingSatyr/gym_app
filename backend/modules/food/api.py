from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query

from modules.auth.dependency import get_current_user
from modules.food.dependency import get_food_report_service
from modules.food.exceptions import FoodReportNotExistError
from modules.food.schemas import DailySummary, FoodReport, CreateFoodReport
from modules.food.service import FoodReportService
from modules.users.models import UserModel

router = APIRouter(prefix="/food", tags=["food"])


@router.get("/list", response_model=list[FoodReport])
async def get_food_list(
    day: date = date.today(),
    current_user: UserModel = Depends(get_current_user),
    food_report_service: FoodReportService = Depends(get_food_report_service),
):

    food_list = await food_report_service.get_food_list(day, current_user)
    return food_list


@router.get("/{id}", response_model=FoodReport)
async def get_food_report_by_id(
    id: int,
    current_user: UserModel = Depends(get_current_user),
    food_report_service: FoodReportService = Depends(get_food_report_service),
):

    try:
        return await food_report_service.get_food_by_id(id, current_user)
    except FoodReportNotExistError:
        raise HTTPException(404, "Food report does not exist")


@router.get("/", response_model=DailySummary)
async def get_daily_summary(
    date: date = Query(default_factory=date.today),
    current_user: UserModel = Depends(get_current_user),
    food_repost_service: FoodReportService = Depends(get_food_report_service),
):

    return await food_repost_service.get_daily_summary(date, current_user)


@router.post("/", response_model=FoodReport)
async def create_food_report(
    food: CreateFoodReport,
    current_user: UserModel = Depends(get_current_user),
    food_report_service: FoodReportService = Depends(get_food_report_service),
):

    return await food_report_service.create_food_report(food, current_user)


@router.put("/{id}", response_model=FoodReport)
async def update_food_report(
    id: int,
    food_report: CreateFoodReport,
    food_report_service: FoodReportService = Depends(get_food_report_service),
    current_user: UserModel = Depends(get_current_user),
):

    try:
        return await food_report_service.update_food_report(
            id, food_report, current_user
        )
    except FoodReportNotExistError:
        raise HTTPException(404, "Food report does not exist")
