from fastapi import APIRouter
from app.api.endpoints.measurements import router as measurements_router
from app.api.endpoints.products import (
    products_router, evaluations_router, analytics_router, experiments_router
)

api_router = APIRouter()

api_router.include_router(measurements_router, prefix="/measurements", tags=["measurements"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(evaluations_router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(experiments_router, prefix="/experiments", tags=["experiments"])
