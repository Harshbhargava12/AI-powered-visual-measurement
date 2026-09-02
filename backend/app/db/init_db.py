from app.db.session import engine, Base, SessionLocal
from app.models.db_models import Product, Measurement, Verification, Evaluation, ExperimentLog
from app.create_samples import ensure_sample_images
from datetime import datetime, timedelta

def init_db():
    ensure_sample_images()
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Product).count() == 0:
            print("Seeding initial demo product catalog and accuracy evaluations...")
            
            # Demo Product 1: Wooden Desk Chair
            p1 = Product(
                id="demo-prod-001",
                sku="CHAIR-OAK-01",
                name="Nordic Oak Desk Chair",
                category="Furniture",
                image_url="/samples/sample_chair.jpg",
                estimated_width_cm=52.4,
                estimated_height_cm=81.7,
                estimated_depth_cm=48.0,
                verified_width_cm=51.8,
                verified_height_cm=81.0,
                verified_depth_cm=47.5,
                unit="cm",
                verification_status="HUMAN_VERIFIED",
                confidence_score=91.5
            )
            
            # Demo Product 2: Ceramic Coffee Mug
            p2 = Product(
                id="demo-prod-002",
                sku="MUG-CER-04",
                name="Artisan Matte Ceramic Mug",
                category="Kitchenware",
                image_url="/samples/sample_mug.jpg",
                estimated_width_cm=12.2,
                estimated_height_cm=9.5,
                estimated_depth_cm=9.5,
                verified_width_cm=12.0,
                verified_height_cm=9.4,
                verified_depth_cm=9.4,
                unit="cm",
                verification_status="HUMAN_VERIFIED",
                confidence_score=94.0
            )

            # Demo Product 3: Running Shoes Box
            p3 = Product(
                id="demo-prod-003",
                sku="SHOE-BOX-88",
                name="Pro Runner Sneaker Box",
                category="Footwear",
                image_url="/samples/sample_shoebox.jpg",
                estimated_width_cm=34.1,
                estimated_height_cm=21.0,
                estimated_depth_cm=13.2,
                verified_width_cm=33.5,
                verified_height_cm=20.5,
                verified_depth_cm=13.0,
                unit="cm",
                verification_status="AI_VERIFIED",
                confidence_score=87.2
            )

            db.add_all([p1, p2, p3])
            
            # Add demo measurement 1
            m1 = Measurement(
                id="demo-meas-001",
                product_id=p1.id,
                image_path="/samples/sample_chair.jpg",
                annotated_image_path="/samples/annotated_chair.jpg",
                estimated_width_cm=52.4,
                estimated_height_cm=81.7,
                estimated_depth_cm=48.0,
                area_sq_cm=4281.08,
                unit="cm",
                confidence_score=91.5,
                reliability_state="HIGH",
                reliability_reason="High confidence: Reference Credit Card clearly detected with high contrast. Product bounding box fully enclosed.",
                image_quality_score=92.0,
                quality_details={
                    "blur_score": 450.2,
                    "lighting_score": 88.5,
                    "resolution_ok": True,
                    "border_cropped": False,
                    "warnings": []
                },
                reference_type="CREDIT_CARD",
                pixel_per_cm=40.2
            )
            db.add(m1)
            
            # Add demo evaluation
            e1 = Evaluation(
                id="demo-eval-001",
                measurement_id=m1.id,
                actual_width_cm=51.8,
                actual_height_cm=81.0,
                actual_depth_cm=47.5,
                predicted_width_cm=52.4,
                predicted_height_cm=81.7,
                predicted_depth_cm=48.0,
                abs_error_width_cm=0.6,
                abs_error_height_cm=0.7,
                pct_error_width=1.15,
                pct_error_height=0.86,
                mape=1.00
            )
            db.add(e1)
            
            # Add demo experiment logs
            exp1 = ExperimentLog(
                id="demo-exp-001",
                experiment_key="onboarding_flow_v1",
                variant="variant_a_ref_first",
                session_id="sess-101",
                completed_measurement=True,
                has_human_correction=True,
                time_to_complete_sec=42.5
            )
            exp2 = ExperimentLog(
                id="demo-exp-002",
                experiment_key="onboarding_flow_v1",
                variant="variant_b_upload_first",
                session_id="sess-102",
                completed_measurement=True,
                has_human_correction=False,
                time_to_complete_sec=35.0
            )
            db.add_all([exp1, exp2])
            
            db.commit()
            print("Database initialized successfully with seed data.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
