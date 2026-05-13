from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


class CreateFoodReport(BaseModel):
    proteins: int = Field(..., description="белки на 100 грамм продукта")
    fats: int = Field(..., description="жиры на 100 грамм продукта")
    carbs: int = Field(..., description="жиры на 100 грамм продукта")
    gramms: int = Field(..., description="Грамм продукта")
    name: str = Field(..., description="Название продукта")


class FoodReport(BaseModel):
    id: int
    user_id: int
    calories: int
    proteins: int
    fats: int
    carbs: int
    gramms: int
    name: str
    report_time: datetime
    model_config = ConfigDict(from_attributes=True)


class DailySummary(BaseModel):
    date: date
    total_calories: float
    total_proteins: float
    total_fats: float
    total_carbs: float
