import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.schemas.measurement import (
    UploadImageResponse, AnalyzeRequest, AnalyzeResponse, VerificationRequest,
    QualityCheckResult, ReferenceType, ReliabilityState
)
from app.services.cv.quality_analyzer import ImageQualityAnalyzer
from app.services.cv.object_detector import ObjectDetector
from app.services.cv.reference_detector import ReferenceDetector
from app.services.cv.dimension_engine import DimensionEngine
from app.services.cv.confidence_engine import ConfidenceEngine
from app.services.cv.visualizer import Visualizer
from app.models.db_models import Measurement, Verification, Product

router = APIRouter()

# In-memory store for transient image uploads during studio session
UPLOAD_CACHE = {}

@router.post("/upload", response_model=UploadImageResponse)
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded must be an image.")
        
    image_id = f"img-{str(uuid.uuid4())[:8]}"
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{image_id}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Analyze Image Quality
    quality = ImageQualityAnalyzer.analyze(filepath)
    
    # Store transient metadata in memory cache
    import cv2
    img = cv2.imread(filepath)
    h, w = (img.shape[0], img.shape[1]) if img is not None else (800, 600)
    
    relative_url = f"/static/uploads/{filename}"
    UPLOAD_CACHE[image_id] = {
        "filepath": filepath,
        "filename": filename,
        "url": relative_url,
        "width": w,
        "height": h,
        "quality": quality
    }

    return UploadImageResponse(
        image_id=image_id,
        image_url=relative_url,
        filename=filename,
        width=w,
        height=h,
        quality=quality
    )

@router.post("/detect-objects")
async def detect_objects(image_id: str = Form(...)):
    if image_id not in UPLOAD_CACHE:
        raise HTTPException(status_code=404, detail="Image session not found. Please upload image first.")
        
    filepath = UPLOAD_CACHE[image_id]["filepath"]
    objects = ObjectDetector.detect(filepath)
    return {"image_id": image_id, "objects": objects}

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_measurement(req: AnalyzeRequest, db: Session = Depends(get_db)):
    if req.image_id not in UPLOAD_CACHE:
        raise HTTPException(status_code=404, detail="Image session not found. Please upload image first.")
        
    cached = UPLOAD_CACHE[req.image_id]
    filepath = cached["filepath"]
    quality: QualityCheckResult = cached["quality"]
    
    # 1. Detect Objects
    objects = ObjectDetector.detect(filepath)
    selected_obj = objects[0]
    if req.selected_object_id:
        for o in objects:
            if o.id == req.selected_object_id:
                selected_obj = o
                selected_obj.is_selected = True
                break

    # 2. Detect Calibration Reference Scale
    ref = ReferenceDetector.detect(
        filepath,
        ref_type=req.reference_type,
        custom_width_cm=req.custom_ref_width_cm
    )
    
    # 3. Calculate Real-World Dimensions
    dimensions = DimensionEngine.calculate(selected_obj, ref)
    
    # 4. Evaluate Reliability & Confidence
    confidence_score, reliability_state, reliability_reason, warnings = ConfidenceEngine.evaluate(
        quality, ref, selected_obj
    )

    if reliability_state == ReliabilityState.NOT_MEASURABLE:
        dimensions = None

    # 5. Draw Annotated Overlay Image
    annotated_filename = f"annotated_{cached['filename']}"
    annotated_filepath = os.path.join(settings.ANNOTATED_DIR, annotated_filename)
    Visualizer.draw_annotations(
        filepath,
        annotated_filepath,
        selected_obj,
        ref,
        dimensions,
        reliability_state,
        confidence_score
    )
    
    annotated_url = f"/static/uploads/annotated/{annotated_filename}"
    
    # 6. Save Measurement to Database
    measurement_id = f"meas-{str(uuid.uuid4())[:8]}"
    db_measurement = Measurement(
        id=measurement_id,
        image_path=cached["url"],
        annotated_image_path=annotated_url,
        estimated_width_cm=dimensions.width_cm if dimensions else 0.0,
        estimated_height_cm=dimensions.height_cm if dimensions else 0.0,
        estimated_depth_cm=dimensions.depth_cm if dimensions else None,
        area_sq_cm=dimensions.area_sq_cm if dimensions else 0.0,
        unit="cm",
        confidence_score=confidence_score,
        reliability_state=reliability_state.value,
        reliability_reason=reliability_reason,
        image_quality_score=quality.score,
        quality_details={
            "blur_score": quality.blur_score,
            "lighting_score": quality.lighting_score,
            "resolution_ok": quality.resolution_ok,
            "border_cropped": quality.border_cropped,
            "warnings": quality.warnings
        },
        reference_type=ref.type.value,
        pixel_per_cm=ref.pixel_per_cm
    )
    db.add(db_measurement)
    db.commit()
    db.refresh(db_measurement)

    return AnalyzeResponse(
        measurement_id=measurement_id,
        image_id=req.image_id,
        selected_object=selected_obj,
        reference=ref,
        dimensions=dimensions,
        confidence_score=confidence_score,
        reliability_state=reliability_state,
        reliability_reason=reliability_reason,
        warnings=warnings,
        annotated_image_url=annotated_url,
        quality=quality
    )

@router.post("/{measurement_id}/verify")
async def verify_measurement(
    measurement_id: str,
    req: VerificationRequest,
    db: Session = Depends(get_db)
):
    meas = db.query(Measurement).filter(Measurement.id == measurement_id).first()
    if not meas:
        raise HTTPException(status_code=404, detail="Measurement record not found.")
        
    verification = Verification(
        measurement_id=measurement_id,
        original_width_cm=meas.estimated_width_cm,
        original_height_cm=meas.estimated_height_cm,
        original_depth_cm=meas.estimated_depth_cm,
        corrected_width_cm=req.corrected_width_cm,
        corrected_height_cm=req.corrected_height_cm,
        corrected_depth_cm=req.corrected_depth_cm,
        user_notes=req.user_notes
    )
    db.add(verification)
    
    # Update linked product if exists
    if meas.product_id:
        prod = db.query(Product).filter(Product.id == meas.product_id).first()
        if prod:
            prod.verified_width_cm = req.corrected_width_cm
            prod.verified_height_cm = req.corrected_height_cm
            prod.verified_depth_cm = req.corrected_depth_cm
            prod.verification_status = "HUMAN_VERIFIED"
            
    db.commit()
    return {"status": "success", "message": "Measurement human verification saved successfully."}
