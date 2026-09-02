import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid)
    sku = Column(String, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="General")
    image_url = Column(String, nullable=False)
    
    estimated_width_cm = Column(Float, nullable=False)
    estimated_height_cm = Column(Float, nullable=False)
    estimated_depth_cm = Column(Float, nullable=True)
    
    verified_width_cm = Column(Float, nullable=True)
    verified_height_cm = Column(Float, nullable=True)
    verified_depth_cm = Column(Float, nullable=True)
    
    unit = Column(String, default="cm")
    verification_status = Column(String, default="UNVERIFIED")
    confidence_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    measurements = relationship("Measurement", back_populates="product")

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(String, primary_key=True, default=generate_uuid)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    
    image_path = Column(String, nullable=False)
    annotated_image_path = Column(String, nullable=True)
    
    estimated_width_cm = Column(Float, nullable=False)
    estimated_height_cm = Column(Float, nullable=False)
    estimated_depth_cm = Column(Float, nullable=True)
    area_sq_cm = Column(Float, nullable=False)
    
    unit = Column(String, default="cm")
    confidence_score = Column(Float, nullable=False)
    reliability_state = Column(String, nullable=False) # HIGH, MEDIUM, LOW, NOT_MEASURABLE
    reliability_reason = Column(Text, nullable=False)
    
    image_quality_score = Column(Float, nullable=False)
    quality_details = Column(JSON, nullable=True)
    reference_type = Column(String, nullable=False)
    pixel_per_cm = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="measurements")
    verifications = relationship("Verification", back_populates="measurement")
    evaluations = relationship("Evaluation", back_populates="measurement")

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    measurement_id = Column(String, ForeignKey("measurements.id"), nullable=False)
    
    original_width_cm = Column(Float, nullable=False)
    original_height_cm = Column(Float, nullable=False)
    original_depth_cm = Column(Float, nullable=True)
    
    corrected_width_cm = Column(Float, nullable=False)
    corrected_height_cm = Column(Float, nullable=False)
    corrected_depth_cm = Column(Float, nullable=True)
    
    user_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    measurement = relationship("Measurement", back_populates="verifications")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, default=generate_uuid)
    measurement_id = Column(String, ForeignKey("measurements.id"), nullable=False)
    
    actual_width_cm = Column(Float, nullable=False)
    actual_height_cm = Column(Float, nullable=False)
    actual_depth_cm = Column(Float, nullable=True)
    
    predicted_width_cm = Column(Float, nullable=False)
    predicted_height_cm = Column(Float, nullable=False)
    predicted_depth_cm = Column(Float, nullable=True)
    
    abs_error_width_cm = Column(Float, nullable=False)
    abs_error_height_cm = Column(Float, nullable=False)
    pct_error_width = Column(Float, nullable=False)
    pct_error_height = Column(Float, nullable=False)
    mape = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    measurement = relationship("Measurement", back_populates="evaluations")

class ExperimentLog(Base):
    __tablename__ = "experiment_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    experiment_key = Column(String, nullable=False)
    variant = Column(String, nullable=False)
    session_id = Column(String, nullable=False)
    completed_measurement = Column(Boolean, default=False)
    has_human_correction = Column(Boolean, default=False)
    time_to_complete_sec = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
