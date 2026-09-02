import cv2
import numpy as np
from app.schemas.measurement import ReferenceType, DetectedReferenceSchema

class ReferenceDetector:
    """
    Detects known calibration reference objects in the image to determine the pixel-to-cm scale.
    Supports:
    - CREDIT_CARD (8.56 cm x 5.398 cm)
    - A4_PAPER (21.0 cm x 29.7 cm)
    - ARUCO (Custom / 5x5 cm default)
    - CUSTOM / MANUAL_PIN
    """

    # Physical dimensions in centimeters
    REF_DIMENSIONS = {
        ReferenceType.CREDIT_CARD: (8.56, 5.398),
        ReferenceType.A4_PAPER: (21.0, 29.7),
        ReferenceType.ARUCO: (5.0, 5.0),
        ReferenceType.CUSTOM: (8.56, 5.398),
        ReferenceType.MANUAL_PIN: (10.0, 10.0)
    }

    @classmethod
    def detect(cls, image_path: str, ref_type: ReferenceType = ReferenceType.CREDIT_CARD, custom_width_cm: float = None) -> DetectedReferenceSchema:
        img = cv2.imread(image_path)
        if img is None:
            return cls._fallback_reference(ref_type, custom_width_cm)
            
        height, width = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        real_w, real_h = cls.REF_DIMENSIONS.get(ref_type, (8.56, 5.398))
        if custom_width_cm and custom_width_cm > 0:
            aspect = real_h / real_w if real_w > 0 else 1.0
            real_w = custom_width_cm
            real_h = custom_width_cm * aspect
            
        # Target aspect ratio
        target_aspect = real_w / real_h
        
        # 1. Try ArUco Detection if ARUCO specified or OpenCV ArUco module is present
        if ref_type == ReferenceType.ARUCO:
            try:
                aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_5X5_50)
                parameters = cv2.aruco.DetectorParameters()
                detector = cv2.aruco.ArucoDetector(aruco_dict, parameters)
                corners, ids, _ = detector.detectMarkers(gray)
                if ids is not None and len(corners) > 0:
                    c = corners[0][0]
                    # Calculate side length in pixels
                    side_px = np.linalg.norm(c[0] - c[1])
                    pixel_per_cm = side_px / real_w
                    x, y, w, h = cv2.boundingRect(c)
                    return DetectedReferenceSchema(
                        type=ReferenceType.ARUCO,
                        confidence=98.0,
                        bbox=[float(x), float(y), float(w), float(h)],
                        real_width_cm=real_w,
                        real_height_cm=real_h,
                        pixel_per_cm=round(float(pixel_per_cm), 2)
                    )
            except Exception:
                pass # Fall through to contour detection

        # 2. Contour & Aspect Ratio matching for Credit Card or A4 Paper
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        best_ref_bbox = None
        best_aspect_diff = 999.0
        best_area = 0.0
        
        img_area = width * height
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area < img_area * 0.005 or area > img_area * 0.4:
                continue
                
            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.04 * peri, True)
            
            if len(approx) == 4: # Quadrilateral candidate
                x, y, w, h = cv2.boundingRect(approx)
                if w > 0 and h > 0:
                    aspect = float(w) / float(h)
                    # Check both orientations (landscape vs portrait)
                    diff1 = abs(aspect - target_aspect)
                    diff2 = abs(aspect - (1.0 / target_aspect))
                    min_diff = min(diff1, diff2)
                    
                    if min_diff < 0.25 and min_diff < best_aspect_diff:
                        best_aspect_diff = min_diff
                        best_ref_bbox = (x, y, w, h)
                        best_area = area

        if best_ref_bbox:
            x, y, w, h = best_ref_bbox
            # Calculate pixel per cm scale
            pixel_per_cm = float(w) / real_w if w > h else float(h) / real_w
            confidence = max(70.0, 95.0 - (best_aspect_diff * 100.0))
            
            return DetectedReferenceSchema(
                type=ref_type,
                confidence=round(confidence, 1),
                bbox=[float(x), float(y), float(w), float(h)],
                real_width_cm=real_w,
                real_height_cm=real_h,
                pixel_per_cm=round(pixel_per_cm, 2)
            )

        # Fallback if reference not clearly auto-detected
        return cls._fallback_reference(ref_type, real_w, real_h, width, height)

    @classmethod
    def _fallback_reference(cls, ref_type: ReferenceType, real_w: float = 8.56, real_h: float = 5.398, width: int = 1200, height: int = 900) -> DetectedReferenceSchema:
        # Reference object not detected in image — return zero scale ratio
        return DetectedReferenceSchema(
            type=ref_type,
            confidence=0.0,
            bbox=[0.0, 0.0, 0.0, 0.0],
            real_width_cm=real_w,
            real_height_cm=real_h,
            pixel_per_cm=0.0
        )
