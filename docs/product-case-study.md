# VisionMeasure — Product Manager Case Study

## 1. Executive Summary
**VisionMeasure** is an AI-powered visual dimension intelligence platform designed for e-commerce sellers, marketplace operators, and warehouse catalog teams. It converts physical product photos into precise millimeter dimensions using computer vision, automated scale calibration, quality scoring, and uncertainty modeling.

---

## 2. Problem Statement
E-commerce catalog managers process hundreds of physical SKUs monthly. Manually measuring every product with a tape measure is:
* Slow (~4-6 minutes per product)
* Error-prone
* Difficult across decentralized seller networks

Standard computer vision demos often blindly guess physical size from a 2D image without calibration, leading to hallucinated numbers, incorrect shipping container selection, and customer return friction.

---

## 3. Target User Personas & User Journey

### Persona A: Sarah — E-Commerce Catalog Ops Lead
* **Goal**: Rapidly upload and list 200 new home decor products weekly.
* **Pain Point**: Missing product dimensions delay product launch on Shopify and Amazon.
* **Journey**: Photo Upload $\rightarrow$ Auto Quality Check $\rightarrow$ Calibration Marker Verification $\rightarrow$ Visual Review $\rightarrow$ Publish to Catalog.

### Persona B: Marcus — Logistics & Warehouse Manager
* **Goal**: Optimize packaging box sizing and avoid dimensional weight carrier surcharges.
* **Pain Point**: Inaccurate cubic volume estimates lead to bloated shipping costs.
* **Journey**: Bulk SKU Upload $\rightarrow$ Dimension Extraction $\rightarrow$ Volumetric Calculation $\rightarrow$ ERP Sync.

---

## 4. Feature Prioritization Framework (RICE)

| Feature | Reach (R) | Impact (I) | Confidence (C) | Effort (E) | RICE Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Known-Size Reference Calibration** | 100% | 3 (High) | 90% | 2 wks | **135** |
| **Image Quality & Blur Engine** | 80% | 3 (High) | 85% | 1.5 wks | **136** |
| **Human Verification Audit Flow** | 60% | 2 (Medium) | 95% | 1 wk | **114** |
| **Accuracy Benchmarking Dashboard** | 50% | 2 (Medium) | 90% | 1 wk | **90** |
| **Monocular Depth Estimation** | 30% | 1 (Low) | 60% | 3 wks | **6** |

---

## 5. North Star Metric & KPI Tree
* **North Star Metric**: *Verified Product Dimensions Created* (Successfully cataloged items with high confidence or human audit).
* **Secondary KPIs**:
  - Image-to-Measurement Conversion Rate ($\ge 85\%$)
  - Global Model Mean Absolute Percentage Error (MAPE) ($\le 3.5\%$)
  - Human Verification Override Rate ($\le 12\%$)
  - Time Saved per SKU ($\sim 3.5 \text{ min saved / SKU}$)

---

## 6. Experiment Design (A/B Test)
* **Hypothesis**: Requiring reference object calibration selection prior to image upload increases user measurement completion and reduces low-confidence retries.
* **Variant A (Control)**: Upload photo first, prompt for reference object afterward.
* **Variant B (Treatment)**: Select reference marker type first, then present guided photo overlay.
* **Metrics Tracked**: Completion conversion rate, human correction rate, average time-to-complete.
