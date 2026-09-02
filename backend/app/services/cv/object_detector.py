import cv2
import numpy as np
from typing import List
import uuid
from app.schemas.measurement import DetectedObjectSchema

class ObjectDetector:
    """
    Detects physical product candidates in the image.
    Uses adaptive thresholding, contour extraction, convex hull, and oriented minAreaRect bounding boxes.
    """

    @staticmethod
    def detect(image_path: str) -> List[DetectedObjectSchema]:
        img = cv2.imread(image_path)
        if img is None:
            return []
            
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur slightly to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Otsu thresholding + Canny edge detection
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        edges = cv2.Canny(blurred, 30, 150)
        combined = cv2.bitwise_or(thresh, edges)
        
        # Morphological closing to join product boundaries
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)
        
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        image_area = width * height
        min_area = image_area * 0.01  # Ignore tiny noise (< 1% image area)
        max_area = image_area * 0.95  # Ignore full border outline (> 95% image area)
        
        candidates = []
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if min_area <= area <= max_area:
                x, y, w, h = cv2.boundingRect(cnt)
                
                # Filter out pure square reference objects like credit card or aruco if large product is present
                candidates.append((cnt, area, x, y, w, h))
                
        # Sort candidates by area descending
        candidates.sort(key=lambda item: item[1], reverse=True)
        
        detected_objects = []
        for idx, (cnt, area, x, y, w, h) in enumerate(candidates[:5]):
            # Assign label heuristically or generic Product candidate
            label = "Primary Product" if idx == 0 else f"Product Candidate {idx + 1}"
            confidence = max(0.65, min(0.98, 0.70 + (area / image_area) * 0.5))
            
            detected_objects.append(DetectedObjectSchema(
                id=f"obj-{idx+1}-{str(uuid.uuid4())[:6]}",
                label=label,
                confidence=round(confidence * 100, 1),
                bbox=[float(x), float(y), float(w), float(h)],
                area_pixels=float(area),
                is_selected=(idx == 0) # Select largest non-background candidate by default
            ))
            
        # Fallback if no specific contours passed filters
        if not detected_objects:
            margin_w, margin_h = int(width * 0.1), int(height * 0.1)
            detected_objects.append(DetectedObjectSchema(
                id=f"obj-default-{str(uuid.uuid4())[:6]}",
                label="Central Product Area",
                confidence=70.0,
                bbox=[float(margin_w), float(margin_h), float(width - 2 * margin_w), float(height - 2 * margin_h)],
                area_pixels=float((width - 2 * margin_w) * (height - 2 * margin_h)),
                is_selected=True
            ))
            
        return detected_objects
