# VisionMeasure — AI Visual Dimension Intelligence for E-Commerce

VisionMeasure is an AI product built for e-commerce sellers, catalog operations, and logistics teams. It estimates physical product dimensions (Width, Height, Area, Depth bounds) from digital product photos using computer vision, automated scale calibration, uncertainty scoring, and human verification workflows.

---

## Key Features

1. **Automated Scale Calibration**: Supports Credit Cards, A4 Paper, ArUco markers, and Custom calibration markers to establish real-world scale (pixels per cm).
2. **Image Quality Intelligence**: Automatically inspects image resolution, blur score (Laplacian variance), contrast/lighting, and border cropping before estimation.
3. **Uncertainty & Reliability Matrix**: Scores confidence ($0-100\%$) and classifies measurements into `HIGH`, `MEDIUM`, `LOW`, or `NOT_MEASURABLE` states with clear explanations.
4. **Annotated Overlay Renderer**: Generates visual measurement graphics with bounding boxes, dimension arrows, real-world labels, and confidence badges.
5. **Human-in-the-Loop Audit & Verification**: Allows sellers to manually correct AI measurements and save verified records to the product catalog.
6. **Ground Truth Accuracy Analytics**: Evaluates Mean Absolute Error (MAE) and Mean Absolute Percentage Error (MAPE) against physical benchmarks.
7. **PM A/B Experimentation Engine**: Tracks onboarding variant conversion rates, completion time, and human correction rates.

---

## Computer Vision Pipeline

```
[ Upload Photo ] ──► [ Quality Inspection (Blur, Lighting, Resolution, Cropping) ]
                          │
                          ▼
[ Reference Marker Detector (ArUco / Credit Card Contour / A4 Quad) ] ──► [ Scale Ratio (px/cm) ]
                          │
                          ▼
[ Object Detector & Oriented Bounding Box (minAreaRect) ]
                          │
                          ▼
[ Dimension Calculation Engine & Depth Bound ]
                          │
                          ▼
[ Confidence & Reliability Decision Matrix (HIGH / MEDIUM / LOW / NOT_MEASURABLE) ]
                          │
                          ▼
[ Visual Annotation Renderer & Catalog Verification Flow ]
```

---

## Quick Start & Installation

### Backend Setup (FastAPI & OpenCV)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Initialize database & sample images
python3 app/create_samples.py
python3 app/db/init_db.py

# Start API server
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### Frontend Setup (React, Vite, Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Running Tests

```bash
cd backend
pytest tests/
```

---

## Documentation Links

- [Product Manager Case Study](file:///Users/harshbhargava20gamil.com/Desktop/AI-powered%20visual%20measurement%20/docs/product-case-study.md)
- [Product Requirements Document (PRD)](file:///Users/harshbhargava20gamil.com/Desktop/AI-powered%20visual%20measurement%20/docs/prd.md)
