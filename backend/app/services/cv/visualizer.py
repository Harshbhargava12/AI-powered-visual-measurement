import cv2
import numpy as np
import os
from app.schemas.measurement import DetectedObjectSchema, DetectedReferenceSchema, MeasurementDimensions, ReliabilityState

class Visualizer:
    """
    Renders visual dimension overlays, bounding boxes, dimension arrows,
    and reliability badges onto the product image.
    """

    @staticmethod
    def draw_annotations(
        image_path: str,
        output_path: str,
        obj: DetectedObjectSchema,
        ref: DetectedReferenceSchema,
        dims: Optional[MeasurementDimensions],
        reliability: ReliabilityState,
        confidence: float
    ) -> str:
        img = cv2.imread(image_path)
        if img is None:
            return image_path
            
        annotated = img.copy()
        height, width = annotated.shape[:2]
        
        # Color definitions (BGR)
        CYAN = (255, 200, 0)
        GREEN = (72, 210, 80)
        YELLOW = (0, 215, 255)
        RED = (70, 70, 230)
        WHITE = (255, 255, 255)
        DARK_BG = (20, 20, 30)

        # Select color based on reliability state
        if reliability == ReliabilityState.HIGH:
            theme_color = GREEN
        elif reliability == ReliabilityState.MEDIUM:
            theme_color = YELLOW
        else:
            theme_color = RED
            
        # 1. Draw Product Bounding Box
        x, y, w, h = [int(v) for v in obj.bbox]
        cv2.rectangle(annotated, (x, y), (x + w, y + h), theme_color, 3)
        
        # Product label tag
        tag_text = f"{obj.label} ({confidence}%)" if dims else f"{obj.label} (Scale Unavailable)"
        (t_w, t_h), _ = cv2.getTextSize(tag_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(annotated, (x, max(0, y - t_h - 12)), (x + t_w + 12, max(0, y)), theme_color, -1)
        cv2.putText(annotated, tag_text, (x + 6, max(12, y - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, WHITE, 2)

        # 2. Draw Dimension Arrows (Only if valid dimensions exist)
        if dims is not None:
            prefix = "~" if reliability == ReliabilityState.LOW else ""
            # Width Arrow (Top of bounding box)
            arrow_y = max(25, y - 25)
            cv2.arrowedLine(annotated, (x, arrow_y), (x + w, arrow_y), theme_color, 2, tipLength=0.03)
            cv2.arrowedLine(annotated, (x + w, arrow_y), (x, arrow_y), theme_color, 2, tipLength=0.03)
            w_text = f"{prefix}{dims.width_cm} cm ({prefix}{dims.width_in} in)"
            (wt_w, wt_h), _ = cv2.getTextSize(w_text, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
            cv2.rectangle(annotated, (x + w//2 - wt_w//2 - 6, arrow_y - wt_h - 6), (x + w//2 + wt_w//2 + 6, arrow_y + 4), DARK_BG, -1)
            cv2.putText(annotated, w_text, (x + w//2 - wt_w//2, arrow_y - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.65, WHITE, 2)

            # Height Arrow (Right of bounding box)
            arrow_x = min(width - 25, x + w + 25)
            cv2.arrowedLine(annotated, (arrow_x, y), (arrow_x, y + h), theme_color, 2, tipLength=0.03)
            cv2.arrowedLine(annotated, (arrow_x, y + h), (arrow_x, y), theme_color, 2, tipLength=0.03)
            h_text = f"{prefix}{dims.height_cm} cm ({prefix}{dims.height_in} in)"
            (ht_w, ht_h), _ = cv2.getTextSize(h_text, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
            cv2.rectangle(annotated, (arrow_x - ht_w//2 - 6, y + h//2 - ht_h//2 - 6), (arrow_x + ht_w//2 + 6, y + h//2 + ht_h//2 + 6), DARK_BG, -1)
            cv2.putText(annotated, h_text, (arrow_x - ht_w//2, y + h//2 + ht_h//2 - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.65, WHITE, 2)

        # 3. Draw Reference Object Bounding Box (if detected)
        if ref and ref.pixel_per_cm > 0:
            rx, ry, rw, rh = [int(v) for v in ref.bbox]
            cv2.rectangle(annotated, (rx, ry), (rx + rw, ry + rh), CYAN, 2)
            ref_text = f"Ref: {ref.type.value} ({ref.pixel_per_cm} px/cm)"
            cv2.putText(annotated, ref_text, (rx, max(15, ry - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, CYAN, 1)

        # 4. Header Reliability Badge
        badge_text = f"VisionMeasure: {reliability.value} ({confidence}%)"
        cv2.rectangle(annotated, (15, 15), (480, 55), DARK_BG, -1)
        cv2.rectangle(annotated, (15, 15), (480, 55), theme_color, 2)
        cv2.putText(annotated, badge_text, (25, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.55, WHITE, 2)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cv2.imwrite(output_path, annotated)
        return output_path
