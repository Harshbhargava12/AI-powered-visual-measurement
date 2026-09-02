from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.measurement import VerificationStatus, ReliabilityState

class ProductCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: str
    image_url: str
    measurement_id: Optional[str] = None
    estimated_width_cm: float
    estimated_height_cm: float
    estimated_depth_cm: Optional[float] = None
    verified_width_cm: Optional[float] = None
    verified_height_cm: Optional[float] = None
    verified_depth_cm: Optional[float] = None
    unit: str = "cm"

class ProductResponse(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    image_url: str
    estimated_width_cm: float
    estimated_height_cm: float
    estimated_depth_cm: Optional[float] = None
    verified_width_cm: Optional[float] = None
    verified_height_cm: Optional[float] = None
    verified_depth_cm: Optional[float] = None
    unit: str
    verification_status: VerificationStatus
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class EvaluationCreate(BaseModel):
    measurement_id: str
    actual_width_cm: float
    actual_height_cm: float
    actual_depth_cm: Optional[float] = None

class EvaluationResponse(BaseModel):
    id: str
    measurement_id: str
    actual_width_cm: float
    actual_height_cm: float
    predicted_width_cm: float
    predicted_height_cm: float
    abs_error_width_cm: float
    abs_error_height_cm: float
    pct_error_width: float
    pct_error_height: float
    mape: float
    created_at: datetime

    class Config:
        from_attributes = True

class AnalyticsOverview(BaseModel):
    total_images_processed: int
    total_products_measured: int
    avg_confidence_score: float
    total_human_verifications: int
    avg_mape_percent: Optional[float] = None
    reliability_distribution: dict
    category_breakdown: dict
    quality_distribution: dict
