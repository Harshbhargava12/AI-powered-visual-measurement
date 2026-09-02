import pytest
import numpy as np
import cv2
import tempfile
import os
from app.services.cv.quality_analyzer import ImageQualityAnalyzer
from app.services.cv.object_detector import ObjectDetector
from app.services.cv.reference_detector import ReferenceDetector
from app.services.cv.dimension_engine import DimensionEngine
from app.services.cv.confidence_engine import ConfidenceEngine
from app.schemas.measurement import ReferenceType, ReliabilityState, DetectedObjectSchema, DetectedReferenceSchema, QualityCheckResult

@pytest.fixture
def synthetic_image_with_ref():
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = np.ones((800, 1000, 3), dtype=np.uint8) * 240
        # Draw product box
        cv2.rectangle(img, (200, 200), (600, 500), (50, 100, 200), -1)
        # Draw credit card reference box
        cv2.rectangle(img, (50, 600), (221, 708), (200, 120, 40), -1)
        cv2.imwrite(tmp.name, img)
        yield tmp.name
    if os.path.exists(tmp.name):
        os.remove(tmp.name)

@pytest.fixture
def synthetic_image_without_ref():
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = np.ones((800, 1000, 3), dtype=np.uint8) * 240
        # Draw product box only, no credit card or reference marker
        cv2.rectangle(img, (200, 200), (600, 500), (50, 100, 200), -1)
        cv2.imwrite(tmp.name, img)
        yield tmp.name
    if os.path.exists(tmp.name):
        os.remove(tmp.name)

def test_quality_analyzer(synthetic_image_with_ref):
    quality = ImageQualityAnalyzer.analyze(synthetic_image_with_ref)
    assert quality.score > 50.0
    assert quality.resolution_ok is True
    assert quality.is_blurry is False

def test_valid_reference_returns_dimensions(synthetic_image_with_ref):
    # 1. Detect objects & reference
    objects = ObjectDetector.detect(synthetic_image_with_ref)
    ref = ReferenceDetector.detect(synthetic_image_with_ref, ref_type=ReferenceType.CREDIT_CARD)
    
    assert ref.confidence > 0.0
    assert ref.pixel_per_cm > 0.0
    
    # 2. Calculate dimensions
    dims = DimensionEngine.calculate(objects[0], ref)
    assert dims is not None
    assert dims.width_cm > 0.0
    assert dims.height_cm > 0.0
    
    # 3. Evaluate state
    quality = ImageQualityAnalyzer.analyze(synthetic_image_with_ref)
    score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, objects[0])
    assert state in [ReliabilityState.HIGH, ReliabilityState.MEDIUM]

def test_missing_reference_returns_not_measurable(synthetic_image_without_ref):
    # 1. Detect objects & reference on image without calibration marker
    objects = ObjectDetector.detect(synthetic_image_without_ref)
    ref = ReferenceDetector.detect(synthetic_image_without_ref, ref_type=ReferenceType.CREDIT_CARD)
    
    # Scale MUST be 0.0 when reference object is missing
    assert ref.confidence == 0.0
    assert ref.pixel_per_cm == 0.0
    
    # Dimensions MUST be None when reference scale is 0.0
    dims = DimensionEngine.calculate(objects[0], ref)
    assert dims is None
    
    # Reliability state MUST be NOT_MEASURABLE
    quality = ImageQualityAnalyzer.analyze(synthetic_image_without_ref)
    score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, objects[0])
    
    assert state == ReliabilityState.NOT_MEASURABLE
    assert "not detected" in reason.lower()
    assert score <= 40.0

def test_low_confidence_handling():
    # Test low confidence classification (score between 40 and 64)
    quality = QualityCheckResult(
        score=65.0,
        blur_score=45.0,
        is_blurry=True,
        lighting_score=80.0,
        is_well_lit=True,
        resolution_ok=True,
        border_cropped=False,
        warnings=["Image slightly blurry"],
        is_measurable=True
    )
    ref = DetectedReferenceSchema(
        type=ReferenceType.CREDIT_CARD,
        confidence=75.0,
        bbox=[50.0, 600.0, 171.0, 108.0],
        real_width_cm=8.56,
        real_height_cm=5.398,
        pixel_per_cm=20.0
    )
    obj = DetectedObjectSchema(
        id="obj-1",
        label="Product",
        confidence=65.0,
        bbox=[200.0, 200.0, 400.0, 300.0],
        area_pixels=120000.0
    )
    score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, obj)
    assert state == ReliabilityState.LOW
    assert 40.0 <= score < 65.0
