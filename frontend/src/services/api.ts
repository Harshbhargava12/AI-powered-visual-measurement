import {
  UploadResponse, AnalyzeResponse, ReferenceType, Product,
  AnalyticsOverview, Evaluation, ExperimentVariant
} from '../types';

const API_BASE = '/api';

export const apiService = {
  // Upload Image
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/measurements/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image.');
    return res.json();
  },

  // Detect Objects
  async detectObjects(imageId: string) {
    const formData = new FormData();
    formData.append('image_id', imageId);
    const res = await fetch(`${API_BASE}/measurements/detect-objects`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to detect objects.');
    return res.json();
  },

  // Analyze Measurement
  async analyzeMeasurement(
    imageId: string,
    selectedObjectId?: string,
    referenceType: ReferenceType = 'CREDIT_CARD',
    customRefWidthCm?: number
  ): Promise<AnalyzeResponse> {
    const res = await fetch(`${API_BASE}/measurements/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_id: imageId,
        selected_object_id: selectedObjectId,
        reference_type: referenceType,
        custom_ref_width_cm: customRefWidthCm,
      }),
    });
    if (!res.ok) throw new Error('Failed to analyze measurement.');
    return res.json();
  },

  // Submit Human Verification
  async submitVerification(
    measurementId: string,
    correctedWidthCm: number,
    correctedHeightCm: number,
    correctedDepthCm?: number,
    notes?: string
  ) {
    const res = await fetch(`${API_BASE}/measurements/${measurementId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        corrected_width_cm: correctedWidthCm,
        corrected_height_cm: correctedHeightCm,
        corrected_depth_cm: correctedDepthCm,
        user_notes: notes,
      }),
    });
    if (!res.ok) throw new Error('Failed to submit verification.');
    return res.json();
  },

  // Products
  async getProducts(category?: string, search?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products.');
    return res.json();
  },

  async createProduct(data: {
    name: string;
    sku?: string;
    category: string;
    image_url: string;
    measurement_id?: string;
    estimated_width_cm: number;
    estimated_height_cm: number;
    estimated_depth_cm?: number;
    verified_width_cm?: number;
    verified_height_cm?: number;
    verified_depth_cm?: number;
    unit?: string;
  }): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create product.');
    return res.json();
  },

  // Analytics Overview
  async getAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch analytics.');
    return res.json();
  },

  // Evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    const res = await fetch(`${API_BASE}/evaluations`);
    if (!res.ok) throw new Error('Failed to fetch evaluations.');
    return res.json();
  },

  async createEvaluation(data: {
    measurement_id: string;
    actual_width_cm: number;
    actual_height_cm: number;
    actual_depth_cm?: number;
  }): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit evaluation.');
    return res.json();
  },

  // Experiments
  async getExperiments(): Promise<{ experiment_key: string; variants: ExperimentVariant[] }> {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error('Failed to fetch experiments.');
    return res.json();
  }
};
