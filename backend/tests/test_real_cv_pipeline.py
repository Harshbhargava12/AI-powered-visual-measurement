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
from app.schemas.measurement import ReferenceType, ReliabilityState

def create_case_a_image():
    """Case A: Product (300x450 px) + Valid Credit Card Reference (171 border x 108 px)."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = np.ones((800, 1000, 3), dtype=np.uint8) * 240
        # Product box: x=200, y=200, w=400, h=300
        cv2.rectangle(img, (200, 200), (600, 500), (50, 100, 200), -1)
        # Credit Card: w=171.2 px, h=108.0 px (Aspect ratio ~1.585)
        # 171.2 px / 8.56 cm = 20.0 px/cm
        cv2.rectangle(img, (50, 600), (221, 708), (200, 120, 40), -1)
        cv2.imwrite(tmp.name, img)
        return tmp.name

def create_case_b_image():
    """Case B: Product box only, NO reference marker in image."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = np.ones((800, 1000, 3), dtype=np.uint8) * 240
        cv2.rectangle(img, (200, 200), (600, 500), (50, 100, 200), -1)
        cv2.imwrite(tmp.name, img)
        return tmp.name

def create_case_c_image():
    """Case C: Blurry & dark image with product + reference."""
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        img = np.ones((800, 1000, 3), dtype=np.uint8) * 35 # Dark background
        cv2.rectangle(img, (200, 200), (600, 500), (55, 65, 80), -1)
        cv2.rectangle(img, (50, 600), (221, 708), (100, 70, 40), -1)
        # Apply heavy blur
        img = cv2.GaussianBlur(img, (25, 25), 0)
        cv2.imwrite(tmp.name, img)
        return tmp.name

def test_case_a_valid_reference():
    img_path = create_case_a_image()
    try:
        quality = ImageQualityAnalyzer.analyze(img_path)
        objects = ObjectDetector.detect(img_path)
        ref = ReferenceDetector.detect(img_path, ref_type=ReferenceType.CREDIT_CARD)
        
        assert ref.confidence > 70.0
        assert ref.pixel_per_cm > 0.0
        
        dims = DimensionEngine.calculate(objects[0], ref)
        assert dims is not None
        # 400 px / 20.0 px/cm = 20.0 cm
        assert abs(dims.width_cm - 20.0) < 1.0
        # 300 px / 20.0 px/cm = 15.0 cm
        assert abs(dims.height_cm - 15.0) < 1.0
        
        score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, objects[0])
        assert state in [ReliabilityState.HIGH, ReliabilityState.MEDIUM]
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

def test_case_b_no_reference():
    img_path = create_case_b_image()
    try:
        quality = ImageQualityAnalyzer.analyze(img_path)
        objects = ObjectDetector.detect(img_path)
        ref = ReferenceDetector.detect(img_path, ref_type=ReferenceType.CREDIT_CARD)
        
        assert ref.confidence == 0.0
        assert ref.pixel_per_cm == 0.0
        
        dims = DimensionEngine.calculate(objects[0], ref)
        assert dims is None
        
        score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, objects[0])
        assert state == ReliabilityState.NOT_MEASURABLE
        assert "not detected" in reason.lower()
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

def test_case_c_poor_quality():
    img_path = create_case_c_image()
    try:
        quality = ImageQualityAnalyzer.analyze(img_path)
        objects = ObjectDetector.detect(img_path)
        ref = ReferenceDetector.detect(img_path, ref_type=ReferenceType.CREDIT_CARD)
        
        score, state, reason, warnings = ConfidenceEngine.evaluate(quality, ref, objects[0] if objects else None)
        assert state in [ReliabilityState.LOW, ReliabilityState.NOT_MEASURABLE]
        assert quality.is_blurry or not quality.is_well_lit
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)
