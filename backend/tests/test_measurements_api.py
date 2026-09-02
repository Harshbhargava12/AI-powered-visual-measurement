import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
import cv2
import numpy as np

from app.db.init_db import init_db

# Ensure tables exist
init_db()
client = TestClient(app)

def create_dummy_image_with_ref():
    img = np.ones((800, 1000, 3), dtype=np.uint8) * 230
    cv2.rectangle(img, (200, 200), (600, 500), (40, 80, 180), -1)
    cv2.rectangle(img, (50, 600), (221, 708), (220, 140, 40), -1)
    is_success, buffer = cv2.imencode(".jpg", img)
    return io.BytesIO(buffer.tobytes())

def create_dummy_image_without_ref():
    img = np.ones((800, 1000, 3), dtype=np.uint8) * 230
    cv2.rectangle(img, (200, 200), (600, 500), (40, 80, 180), -1)
    is_success, buffer = cv2.imencode(".jpg", img)
    return io.BytesIO(buffer.tobytes())

def test_api_workflow_valid_reference():
    # 1. Root & Health Check
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["health"] == "OK"

    # 2. Upload Image Endpoint
    img_bytes = create_dummy_image_with_ref()
    res = client.post(
        "/api/measurements/upload",
        files={"file": ("test_product.jpg", img_bytes, "image/jpeg")}
    )
    assert res.status_code == 200
    upload_data = res.json()
    image_id = upload_data["image_id"]

    # 3. Detect Objects Endpoint
    res = client.post(
        "/api/measurements/detect-objects",
        data={"image_id": image_id}
    )
    assert res.status_code == 200
    det_data = res.json()
    obj_id = det_data["objects"][0]["id"]

    # 4. Analyze Measurement Endpoint
    res = client.post(
        "/api/measurements/analyze",
        json={
            "image_id": image_id,
            "selected_object_id": obj_id,
            "reference_type": "CREDIT_CARD"
        }
    )
    assert res.status_code == 200
    analyzed = res.json()
    assert analyzed["reliability_state"] in ["HIGH", "MEDIUM"]
    assert analyzed["dimensions"] is not None
    assert analyzed["dimensions"]["width_cm"] > 0
    assert analyzed["dimensions"]["height_cm"] > 0
    meas_id = analyzed["measurement_id"]

    # 5. Verify Measurement Endpoint
    res = client.post(
        f"/api/measurements/{meas_id}/verify",
        json={
            "corrected_width_cm": 20.5,
            "corrected_height_cm": 15.2,
            "corrected_depth_cm": 10.0,
            "user_notes": "Audited via digital caliper"
        }
    )
    assert res.status_code == 200
    assert res.json()["status"] == "success"

def test_api_workflow_unmeasurable_missing_reference():
    img_bytes = create_dummy_image_without_ref()
    res = client.post(
        "/api/measurements/upload",
        files={"file": ("unmeasurable_product.jpg", img_bytes, "image/jpeg")}
    )
    assert res.status_code == 200
    image_id = res.json()["image_id"]

    res = client.post(
        "/api/measurements/analyze",
        json={
            "image_id": image_id,
            "reference_type": "CREDIT_CARD"
        }
    )
    assert res.status_code == 200
    analyzed = res.json()
    
    # Must be NOT_MEASURABLE and dimensions MUST be null
    assert analyzed["reliability_state"] == "NOT_MEASURABLE"
    assert analyzed["dimensions"] is None
    assert "not detected" in analyzed["reliability_reason"].lower()
