from typing import Tuple, List
from app.schemas.measurement import ReliabilityState, QualityCheckResult, DetectedReferenceSchema, DetectedObjectSchema

class ConfidenceEngine:
    """
    Evaluates measurement reliability and certainty.
    Combines image quality, reference object calibration confidence, object visibility,
    and perspective alignment into a single explainable metric.
    """

    @classmethod
    def evaluate(
        cls,
        quality: QualityCheckResult,
        ref: DetectedReferenceSchema,
        obj: DetectedObjectSchema
    ) -> Tuple[float, ReliabilityState, str, List[str]]:
        
        # 1. Base components
        quality_score = quality.score
        ref_confidence = ref.confidence
        obj_confidence = obj.confidence
        
        # 2. Weighted Score Formula
        # Formula: C = 0.40 * RefConf + 0.35 * Quality + 0.25 * ObjConf
        total_score = (ref_confidence * 0.40) + (quality_score * 0.35) + (obj_confidence * 0.25)
        
        # Penalties for quality issues
        penalties = []
        if quality.is_blurry:
            total_score -= 15.0
            penalties.append("Penalty for image blur (-15%)")
        if not quality.is_well_lit:
            total_score -= 10.0
            penalties.append("Penalty for poor lighting/contrast (-10%)")
        if quality.border_cropped:
            total_score -= 15.0
            penalties.append("Penalty for product border cropping (-15%)")
        if ref.confidence < 70.0:
            total_score -= 20.0
            penalties.append("Penalty for uncalibrated reference scale (-20%)")
            
        final_confidence = max(10.0, min(99.0, round(total_score, 1)))

        # If reference scale missing or 0, measurement is NOT_MEASURABLE
        if ref.confidence <= 0.0 or ref.pixel_per_cm <= 0.0:
            final_confidence = min(35.0, round((quality_score * 0.35) + (obj_confidence * 0.25), 1))
            state = ReliabilityState.NOT_MEASURABLE
            reason = "Insufficient visual information: Scale reference object (Credit Card / ArUco / A4 Paper) was not detected in the image. Physical real-world dimensions cannot be determined without a valid reference."
            warnings = list(quality.warnings)
            warnings.append("No calibration reference marker detected in the photo. Position a standard Credit Card flat next to the product.")
            return final_confidence, state, reason, warnings

        # 3. Categorization Decision Matrix
        if final_confidence >= 85.0 and ref.confidence >= 75.0 and not quality.border_cropped:
            state = ReliabilityState.HIGH
            reason = "High confidence: Calibration reference clearly detected with good contrast and full product visibility."
        elif final_confidence >= 65.0:
            state = ReliabilityState.MEDIUM
            reason = "Medium confidence: Measurement is possible but approximate. Verify reference object positioning and lighting."
        elif final_confidence >= 40.0:
            state = ReliabilityState.LOW
            reason = "Low confidence: Measurement may be inaccurate due to image blur, cropping, or unverified scale."
        else:
            state = ReliabilityState.NOT_MEASURABLE
            reason = "Insufficient visual information: Unable to reliably estimate dimensions. Please re-take photo with reference card beside product."

        warnings = list(quality.warnings)
        if ref.confidence < 70.0:
            warnings.append("Reference marker auto-detection confidence is low. Position a standard credit card flat next to product.")

        return final_confidence, state, reason, warnings
