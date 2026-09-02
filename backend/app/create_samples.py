import cv2
import numpy as np
import os

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")

SAMPLE_FILES = (
    "sample_chair.jpg",
    "sample_mug.jpg",
    "sample_shoebox.jpg",
    "annotated_chair.jpg",
)


def ensure_sample_images() -> str:
    """Create demo sample images if they do not already exist."""
    os.makedirs(SAMPLES_DIR, exist_ok=True)

    if not os.path.exists(os.path.join(SAMPLES_DIR, "sample_chair.jpg")):
        img_chair = np.ones((600, 800, 3), dtype=np.uint8) * 240
        cv2.rectangle(img_chair, (250, 150), (550, 480), (120, 100, 80), -1)
        cv2.rectangle(img_chair, (270, 170), (530, 350), (60, 50, 40), -1)
        cv2.rectangle(img_chair, (50, 450), (180, 530), (220, 150, 50), -1)
        cv2.putText(img_chair, "CREDIT CARD", (60, 495), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        cv2.imwrite(os.path.join(SAMPLES_DIR, "sample_chair.jpg"), img_chair)

    if not os.path.exists(os.path.join(SAMPLES_DIR, "sample_mug.jpg")):
        img_mug = np.ones((600, 800, 3), dtype=np.uint8) * 245
        cv2.circle(img_mug, (400, 300), 120, (50, 50, 180), -1)
        cv2.rectangle(img_mug, (50, 450), (180, 530), (220, 150, 50), -1)
        cv2.imwrite(os.path.join(SAMPLES_DIR, "sample_mug.jpg"), img_mug)

    if not os.path.exists(os.path.join(SAMPLES_DIR, "sample_shoebox.jpg")):
        img_box = np.ones((600, 800, 3), dtype=np.uint8) * 235
        cv2.rectangle(img_box, (200, 200), (600, 420), (80, 140, 80), -1)
        cv2.rectangle(img_box, (50, 450), (180, 530), (220, 150, 50), -1)
        cv2.imwrite(os.path.join(SAMPLES_DIR, "sample_shoebox.jpg"), img_box)

    if not os.path.exists(os.path.join(SAMPLES_DIR, "annotated_chair.jpg")):
        img_annotated = np.ones((600, 800, 3), dtype=np.uint8) * 240
        cv2.rectangle(img_annotated, (250, 150), (550, 480), (120, 100, 80), -1)
        cv2.rectangle(img_annotated, (270, 170), (530, 350), (60, 50, 40), -1)
        cv2.rectangle(img_annotated, (50, 450), (180, 530), (220, 150, 50), -1)
        cv2.rectangle(img_annotated, (245, 145), (555, 485), (0, 200, 255), 3)
        cv2.rectangle(img_annotated, (45, 445), (185, 535), (0, 255, 120), 2)
        cv2.putText(img_annotated, "52.4 x 81.7 cm", (260, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
        cv2.imwrite(os.path.join(SAMPLES_DIR, "annotated_chair.jpg"), img_annotated)

    return SAMPLES_DIR


def create_sample_images():
    """Backward-compatible alias used by manual scripts."""
    return ensure_sample_images()


if __name__ == "__main__":
    path = ensure_sample_images()
    print(f"Sample images ready in {path}")
