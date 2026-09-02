export type ReliabilityState = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_MEASURABLE';
export type VerificationStatus = 'UNVERIFIED' | 'AI_VERIFIED' | 'HUMAN_VERIFIED';
export type ReferenceType = 'CREDIT_CARD' | 'A4_PAPER' | 'ARUCO' | 'CUSTOM' | 'MANUAL_PIN';

export interface QualityCheckResult {
  score: number;
  blur_score: number;
  is_blurry: boolean;
  lighting_score: number;
  is_well_lit: boolean;
  resolution_ok: boolean;
  border_cropped: boolean;
  warnings: string[];
  is_measurable: boolean;
}

export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  area_pixels: number;
  is_selected?: boolean;
}

export interface DetectedReference {
  type: ReferenceType;
  confidence: number;
  bbox: [number, number, number, number];
  real_width_cm: number;
  real_height_cm: number;
  pixel_per_cm: number;
}

export interface MeasurementDimensions {
  width_cm: number;
  height_cm: number;
  depth_cm?: number;
  area_sq_cm: number;
  width_in: number;
  height_in: number;
  depth_in?: number;
  area_sq_in: number;
}

export interface UploadResponse {
  image_id: string;
  image_url: string;
  filename: string;
  width: number;
  height: number;
  quality: QualityCheckResult;
}

export interface AnalyzeResponse {
  measurement_id: string;
  image_id: string;
  selected_object: DetectedObject;
  reference: DetectedReference;
  dimensions: MeasurementDimensions | null;
  confidence_score: number;
  reliability_state: ReliabilityState;
  reliability_reason: string;
  warnings: string[];
  annotated_image_url: string;
  quality: QualityCheckResult;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  image_url: string;
  estimated_width_cm: number;
  estimated_height_cm: number;
  estimated_depth_cm?: number;
  verified_width_cm?: number;
  verified_height_cm?: number;
  verified_depth_cm?: number;
  unit: string;
  verification_status: VerificationStatus;
  confidence_score: number;
  created_at: string;
}

export interface AnalyticsOverview {
  total_images_processed: number;
  total_products_measured: number;
  avg_confidence_score: number;
  total_human_verifications: number;
  avg_mape_percent?: number;
  reliability_distribution: Record<ReliabilityState, number>;
  category_breakdown: Record<string, number>;
  quality_distribution: Record<string, number>;
}

export interface Evaluation {
  id: string;
  measurement_id: string;
  actual_width_cm: number;
  actual_height_cm: number;
  predicted_width_cm: number;
  predicted_height_cm: number;
  abs_error_width_cm: number;
  abs_error_height_cm: number;
  pct_error_width: number;
  pct_error_height: number;
  mape: number;
  created_at: string;
}

export interface ExperimentVariant {
  variant: string;
  total_users: number;
  conversion_rate_pct: number;
  human_correction_rate_pct: number;
  avg_time_sec: number;
}
