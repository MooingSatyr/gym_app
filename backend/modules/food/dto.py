from pydantic import BaseModel
from typing import Self


class FoodReportDTO(BaseModel):
    user_id: int
    name: str
    gramms: int
    proteins: float
    fats: float
    carbs: float
    calories: float

    @classmethod
    def from_raw(
        cls,
        user_id: int,
        name: str,
        gramms: int,
        proteins_per_100: float,
        fats_per_100: float,
        carbs_per_100: float,
    ) -> Self:
        p = proteins_per_100 * gramms / 100
        f = fats_per_100 * gramms / 100
        c = carbs_per_100 * gramms / 100
        return cls(
            user_id=user_id,
            name=name,
            gramms=gramms,
            proteins=p,
            fats=f,
            carbs=c,
            calories=4 * (p + c) + 9 * f,
        )
