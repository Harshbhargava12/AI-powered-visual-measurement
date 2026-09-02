from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from app.db.session import get_db
from app.models.db_models import Product, Measurement, Evaluation, ExperimentLog
from app.schemas.product import ProductCreate, ProductResponse, EvaluationCreate, EvaluationResponse, AnalyticsOverview

products_router = APIRouter()
evaluations_router = APIRouter()
analytics_router = APIRouter()
experiments_router = APIRouter()

# --- PRODUCTS ENDPOINTS ---
@products_router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    return query.order_by(Product.created_at.desc()).all()

@products_router.post("", response_model=ProductResponse)
def create_product(req: ProductCreate, db: Session = Depends(get_db)):
    product_id = f"prod-{str(uuid.uuid4())[:8]}"
    sku = req.sku or f"SKU-{str(uuid.uuid4())[:6].upper()}"
    
    prod = Product(
        id=product_id,
        sku=sku,
        name=req.name,
        category=req.category,
        image_url=req.image_url,
        estimated_width_cm=req.estimated_width_cm,
        estimated_height_cm=req.estimated_height_cm,
        estimated_depth_cm=req.estimated_depth_cm,
        verified_width_cm=req.verified_width_cm,
        verified_height_cm=req.verified_height_cm,
        verified_depth_cm=req.verified_depth_cm,
        unit=req.unit,
        verification_status="HUMAN_VERIFIED" if req.verified_width_cm else "AI_VERIFIED"
    )
    db.add(prod)
    
    if req.measurement_id:
        meas = db.query(Measurement).filter(Measurement.id == req.measurement_id).first()
        if meas:
            meas.product_id = product_id
            
    db.commit()
    db.refresh(prod)
    return prod

# --- EVALUATIONS ENDPOINTS ---
@evaluations_router.post("", response_model=EvaluationResponse)
def create_evaluation(req: EvaluationCreate, db: Session = Depends(get_db)):
    meas = db.query(Measurement).filter(Measurement.id == req.measurement_id).first()
    if not meas:
        raise HTTPException(status_code=404, detail="Measurement not found")
        
    pred_w = meas.estimated_width_cm
    pred_h = meas.estimated_height_cm
    pred_d = meas.estimated_depth_cm or 0.0
    
    abs_err_w = abs(req.actual_width_cm - pred_w)
    abs_err_h = abs(req.actual_height_cm - pred_h)
    
    pct_err_w = (abs_err_w / req.actual_width_cm) * 100.0 if req.actual_width_cm > 0 else 0.0
    pct_err_h = (abs_err_h / req.actual_height_cm) * 100.0 if req.actual_height_cm > 0 else 0.0
    
    mape = (pct_err_w + pct_err_h) / 2.0
    
    eval_id = f"eval-{str(uuid.uuid4())[:8]}"
    evaluation = Evaluation(
        id=eval_id,
        measurement_id=req.measurement_id,
        actual_width_cm=req.actual_width_cm,
        actual_height_cm=req.actual_height_cm,
        actual_depth_cm=req.actual_depth_cm,
        predicted_width_cm=pred_w,
        predicted_height_cm=pred_h,
        predicted_depth_cm=pred_d,
        abs_error_width_cm=round(abs_err_w, 2),
        abs_error_height_cm=round(abs_err_h, 2),
        pct_error_width=round(pct_err_w, 2),
        pct_error_height=round(pct_err_h, 2),
        mape=round(mape, 2)
    )
    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)
    return evaluation

@evaluations_router.get("", response_model=List[EvaluationResponse])
def list_evaluations(db: Session = Depends(get_db)):
    return db.query(Evaluation).order_by(Evaluation.created_at.desc()).all()

# --- ANALYTICS ENDPOINTS ---
@analytics_router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    total_images = db.query(Measurement).count()
    total_products = db.query(Product).count()
    
    measurements = db.query(Measurement).all()
    avg_conf = sum(m.confidence_score for m in measurements) / len(measurements) if measurements else 0.0
    
    verifications_count = db.query(Product).filter(Product.verification_status == "HUMAN_VERIFIED").count()
    
    evals = db.query(Evaluation).all()
    avg_mape = sum(e.mape for e in evals) / len(evals) if evals else None
    
    rel_dist = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "NOT_MEASURABLE": 0}
    for m in measurements:
        rel_dist[m.reliability_state] = rel_dist.get(m.reliability_state, 0) + 1
        
    prods = db.query(Product).all()
    cat_dist = {}
    for p in prods:
        cat_dist[p.category] = cat_dist.get(p.category, 0) + 1
        
    return AnalyticsOverview(
        total_images_processed=total_images,
        total_products_measured=total_products,
        avg_confidence_score=round(avg_conf, 1),
        total_human_verifications=verifications_count,
        avg_mape_percent=round(avg_mape, 2) if avg_mape is not None else None,
        reliability_distribution=rel_dist,
        category_breakdown=cat_dist,
        quality_distribution={"High (>80)": 5, "Medium (50-80)": 2, "Low (<50)": 0}
    )

# --- EXPERIMENTS ENDPOINTS ---
@experiments_router.get("")
def get_experiments(db: Session = Depends(get_db)):
    logs = db.query(ExperimentLog).all()
    variants = {}
    for log in logs:
        v = log.variant
        if v not in variants:
            variants[v] = {"name": v, "count": 0, "completed": 0, "corrections": 0, "total_time": 0.0}
        variants[v]["count"] += 1
        if log.completed_measurement:
            variants[v]["completed"] += 1
        if log.has_human_correction:
            variants[v]["corrections"] += 1
        if log.time_to_complete_sec:
            variants[v]["total_time"] += log.time_to_complete_sec
            
    summary = []
    for k, data in variants.items():
        cnt = data["count"] or 1
        summary.append({
            "variant": k,
            "total_users": cnt,
            "conversion_rate_pct": round((data["completed"] / cnt) * 100.0, 1),
            "human_correction_rate_pct": round((data["corrections"] / cnt) * 100.0, 1),
            "avg_time_sec": round(data["total_time"] / cnt, 1)
        })
        
    return {"experiment_key": "onboarding_flow_v1", "variants": summary}
