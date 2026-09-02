from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class ReliabilityState(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NOT_MEASURABLE = "NOT_MEASURABLE"

class VerificationStatus(str, Enum):
    UNVERIFIED = "UNVERIFIED"
    AI_VERIFIED = "AI_VERIFIED"
    HUMAN_VERIFIED = "HUMAN_VERIFIED"

class ReferenceType(str, Enum):
    ARUCO = "ARUCO"
    CREDIT_CARD = "CREDIT_CARD"
    A4_PAPER = "A4_PAPER"
    CUSTOM = "CUSTOM"
    MANUAL_PIN = "MANUAL_PIN"

class QualityCheckResult(BaseModel):
    score: float = Field(..., description="Image quality score 0-100")
    blur_score: float = Field(..., description="Laplacian variance blur metric")
    is_blurry: bool
    lighting_score: float = Field(..., description="Lighting/contrast metric 0-100")
    is_well_lit: bool
    resolution_ok: bool
    border_cropped: bool
    warnings: List[str]
    is_measurable: bool

class DetectedObjectSchema(BaseModel):
    id: str
    label: str
    confidence: float
    bbox: List[float] = Field(..., description="[x, y, width, height] normalized or pixel")
    area_pixels: float
    is_selected: bool = False

class DetectedReferenceSchema(BaseModel):
    type: ReferenceType
    confidence: float
    bbox: List[float]
    real_width_cm: float
    real_height_cm: float
    pixel_per_cm: float

class UploadImageResponse(BaseModel):
    image_id: str
    image_url: str
    filename: str
    width: int
    height: int
    quality: QualityCheckResult

class AnalyzeRequest(BaseModel):
    image_id: str
    selected_object_id: Optional[str] = None
    reference_type: ReferenceType = ReferenceType.CREDIT_CARD
    custom_ref_width_cm: Optional[float] = 8.56
    custom_ref_height_cm: Optional[float] = 5.398

class MeasurementDimensions(BaseModel):
    width_cm: float
    height_cm: float
    depth_cm: Optional[float] = Field(None, description="Inferred 2D heuristic depth bound. Not a true physical 3D measurement.")
    area_sq_cm: float
    width_in: float
    height_in: float
    depth_in: Optional[float] = Field(None, description="Inferred 2D heuristic depth bound in inches.")
    area_sq_in: float

class AnalyzeResponse(BaseModel):
    measurement_id: str
    image_id: str
    selected_object: DetectedObjectSchema
    reference: DetectedReferenceSchema
    dimensions: Optional[MeasurementDimensions] = None
    confidence_score: float
    reliability_state: ReliabilityState
    reliability_reason: str
    warnings: List[str]
    annotated_image_url: str
    quality: QualityCheckResult

class VerificationRequest(BaseModel):
    corrected_width_cm: float
    corrected_height_cm: float
    corrected_depth_cm: Optional[float] = None
    user_notes: Optional[str] = None
