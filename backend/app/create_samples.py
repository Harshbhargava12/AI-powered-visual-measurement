import cv2
import numpy as np
import os

def create_sample_images():
    samples_dir = os.path.join(os.path.dirname(__file__), "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    # 1. Sample Chair
    img_chair = np.ones((600, 800, 3), dtype=np.uint8) * 240
    # Draw chair shape
    cv2.rectangle(img_chair, (250, 150), (550, 480), (120, 100, 80), -1)
    cv2.rectangle(img_chair, (270, 170), (530, 350), (60, 50, 40), -1)
    # Draw credit card reference bottom-left
    cv2.rectangle(img_chair, (50, 450), (180, 530), (220, 150, 50), -1)
    cv2.putText(img_chair, "CREDIT CARD", (60, 495), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
    cv2.imwrite(os.path.join(samples_dir, "sample_chair.jpg"), img_chair)
    
    # 2. Sample Mug
    img_mug = np.ones((600, 800, 3), dtype=np.uint8) * 245
    cv2.circle(img_mug, (400, 300), 120, (50, 50, 180), -1)
    cv2.rectangle(img_mug, (50, 450), (180, 530), (220, 150, 50), -1)
    cv2.imwrite(os.path.join(samples_dir, "sample_mug.jpg"), img_mug)

    # 3. Sample Shoebox
    img_box = np.ones((600, 800, 3), dtype=np.uint8) * 235
    cv2.rectangle(img_box, (200, 200), (600, 420), (80, 140, 80), -1)
    cv2.rectangle(img_box, (50, 450), (180, 530), (220, 150, 50), -1)
    cv2.imwrite(os.path.join(samples_dir, "sample_shoebox.jpg"), img_box)

if __name__ == "__main__":
    create_sample_images()
