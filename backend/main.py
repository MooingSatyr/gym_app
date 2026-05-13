from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from modules.users import api as users_api
from modules.auth import api as auth_api
from modules.food import api as food_api

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_api.router)
app.include_router(auth_api.router)
app.include_router(food_api.router)
