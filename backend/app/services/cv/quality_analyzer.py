import cv2
import numpy as np
from app.schemas.measurement import QualityCheckResult

class ImageQualityAnalyzer:
    """
    Analyzes uploaded product images for visual measurement suitability.
    Checks blur, lighting/contrast, resolution, and object cropping.
    """

    @staticmethod
    def analyze(image_path: str) -> QualityCheckResult:
        img = cv2.imread(image_path)
        if img is None:
            return QualityCheckResult(
                score=0.0,
                blur_score=0.0,
                is_blurry=True,
                lighting_score=0.0,
                is_well_lit=False,
                resolution_ok=False,
                border_cropped=True,
                warnings=["Unable to load or decode image file."],
                is_measurable=False
            )
        
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur Detection using Laplacian Variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = laplacian_var < 50.0
        
        # Blur score normalized 0-100 (var >= 300 is 100%)
        blur_score = min(100.0, (laplacian_var / 300.0) * 100.0)
        
        # 2. Lighting & Contrast Analysis via Grayscale Histogram
        mean_val = np.mean(gray)
        std_val = np.std(gray)
        
        # Good lighting has mean between 60 and 200 and standard deviation > 30
        is_well_lit = (60.0 <= mean_val <= 210.0) and (std_val >= 25.0)
        
        lighting_score = 100.0
        if mean_val < 50: # Underexposed
            lighting_score -= (50 - mean_val) * 1.5
        elif mean_val > 220: # Overexposed
            lighting_score -= (mean_val - 220) * 1.5
        if std_val < 25: # Low contrast
            lighting_score -= (25 - std_val) * 2.0
            
        lighting_score = max(0.0, min(100.0, lighting_score))

        # 3. Resolution Check
        resolution_ok = (width >= 600 and height >= 600)
        
        # 4. Border Cropping / Edge Padding Check
        # Check if high contrast edges touch the image boundary
        border_cropped = False
        border_width = 10
        borders = [
            gray[0:border_width, :], # Top
            gray[-border_width:, :], # Bottom
            gray[:, 0:border_width], # Left
            gray[:, -border_width:]  # Right
        ]
        
        # Edge detection threshold
        edges = cv2.Canny(gray, 50, 150)
        border_edges_count = 0
        for b in [edges[0:border_width, :], edges[-border_width:, :], edges[:, 0:border_width], edges[:, -border_width:]]:
            border_edges_count += np.count_nonzero(b)
            
        if border_edges_count > (width + height) * 0.15:
            border_cropped = True
            
        # Collect Warnings
        warnings = []
        if is_blurry:
            warnings.append("Image appears blurry or out of focus. Hold camera steady or use better lighting.")
        if not is_well_lit:
            if mean_val < 50:
                warnings.append("Image is underexposed/dark. Increase lighting around product.")
            elif mean_val > 220:
                warnings.append("Image is overexposed/glary. Avoid harsh direct reflections.")
            else:
                warnings.append("Low image contrast between product and background.")
        if not resolution_ok:
            warnings.append(f"Low resolution ({width}x{height} px). Recommend at least 800x600 px for accurate measurements.")
        if border_cropped:
            warnings.append("Product appears clipped or touching image edges. Ensure full product is framed with margin.")

        # Compute overall quality score (weighted sum)
        quality_score = (
            (blur_score * 0.35) +
            (lighting_score * 0.35) +
            ((100.0 if resolution_ok else 50.0) * 0.15) +
            ((100.0 if not border_cropped else 50.0) * 0.15)
        )
        
        is_measurable = quality_score >= 40.0 and (not is_blurry or laplacian_var > 40.0)
        
        return QualityCheckResult(
            score=round(quality_score, 1),
            blur_score=round(laplacian_var, 1),
            is_blurry=is_blurry,
            lighting_score=round(lighting_score, 1),
            is_well_lit=is_well_lit,
            resolution_ok=resolution_ok,
            border_cropped=border_cropped,
            warnings=warnings,
            is_measurable=is_measurable
        )
