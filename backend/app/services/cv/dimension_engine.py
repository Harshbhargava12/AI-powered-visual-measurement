from typing import Tuple, Optional
from app.schemas.measurement import MeasurementDimensions, DetectedObjectSchema, DetectedReferenceSchema

class DimensionEngine:
    """
    Computes real-world product dimensions using the pixel-per-centimeter scale
    derived from the reference object calibration.
    """

    CM_TO_INCH = 0.393701

    @classmethod
    def calculate(cls, obj: DetectedObjectSchema, ref: DetectedReferenceSchema) -> Optional[MeasurementDimensions]:
        if not ref or ref.pixel_per_cm <= 0.0 or ref.confidence <= 0.0:
            return None
            
        x, y, w_px, h_px = obj.bbox
        pixel_per_cm = ref.pixel_per_cm
        
        # Calculate real-world width and height in centimeters
        width_cm = w_px / pixel_per_cm
        height_cm = h_px / pixel_per_cm
        
        # Estimated depth heuristic for single 2D view (proportional estimate with bounds)
        # Note: Clearly labeled as estimated depth bound
        depth_cm = min(width_cm, height_cm) * 0.75
        
        area_sq_cm = width_cm * height_cm
        
        # Convert to inches
        width_in = width_cm * cls.CM_TO_INCH
        height_in = height_cm * cls.CM_TO_INCH
        depth_in = depth_cm * cls.CM_TO_INCH if depth_cm else None
        area_sq_in = area_sq_cm * (cls.CM_TO_INCH ** 2)
        
        return MeasurementDimensions(
            width_cm=round(width_cm, 1),
            height_cm=round(height_cm, 1),
            depth_cm=round(depth_cm, 1),
            area_sq_cm=round(area_sq_cm, 1),
            width_in=round(width_in, 1),
            height_in=round(height_in, 1),
            depth_in=round(depth_in, 1) if depth_in else None,
            area_sq_in=round(area_sq_in, 1)
        )
