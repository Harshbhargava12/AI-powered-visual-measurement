import React, { useState, useRef } from 'react';
import {
  Upload, Camera, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle,
  RefreshCw, Ruler, Box, Save, Check, Eye, ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import {
  UploadResponse, AnalyzeResponse, ReferenceType, DetectedObject, ReliabilityState
} from '../types';

interface MeasureStudioProps {
  onNavigate: (view: string) => void;
}

export const MeasureStudio: React.FC<MeasureStudioProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<number>(1);
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [referenceType, setReferenceType] = useState<ReferenceType>('CREDIT_CARD');
  const [customRefCm, setCustomRefCm] = useState<number>(8.56);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifyWidth, setVerifyWidth] = useState<number>(0);
  const [verifyHeight, setVerifyHeight] = useState<number>(0);
  const [verifyDepth, setVerifyDepth] = useState<number>(0);
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  
  // Product Save state
  const [productName, setProductName] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('General');
  const [productSku, setProductSku] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Upload Image
  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await apiService.uploadImage(file);
      setUploadData(resp);
      
      // Auto detect objects
      const detectResp = await apiService.detectObjects(resp.image_id);
      setDetectedObjects(detectResp.objects || []);
      if (detectResp.objects && detectResp.objects.length > 0) {
        setSelectedObjectId(detectResp.objects[0].id);
      }
      
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing uploaded image.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Run Measurement Analysis
  const handleRunAnalysis = async () => {
    if (!uploadData) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const resp = await apiService.analyzeMeasurement(
        uploadData.image_id,
        selectedObjectId || undefined,
        referenceType,
        referenceType === 'CUSTOM' ? customRefCm : undefined
      );
      setAnalysisResult(resp);
      if (resp.dimensions) {
        setVerifyWidth(resp.dimensions.width_cm);
        setVerifyHeight(resp.dimensions.height_cm);
        setVerifyDepth(resp.dimensions.depth_cm || 0);
      } else {
        setVerifyWidth(0);
        setVerifyHeight(0);
        setVerifyDepth(0);
      }
      setProductName(`Product ${uploadData.filename.slice(0, 6)}`);
      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running dimension estimation.');
    } finally {
      setLoading(false);
    }
  };

  // Human Verification Submit
  const handleSaveVerification = async () => {
    if (!analysisResult) return;
    setLoading(true);
    try {
      await apiService.submitVerification(
        analysisResult.measurement_id,
        verifyWidth,
        verifyHeight,
        verifyDepth,
        verifyNotes
      );

      // Create or update Product record
      await apiService.createProduct({
        name: productName || 'Verified Product',
        sku: productSku,
        category: productCategory,
        image_url: analysisResult.annotated_image_url,
        measurement_id: analysisResult.measurement_id,
        estimated_width_cm: analysisResult.dimensions ? analysisResult.dimensions.width_cm : 0,
        estimated_height_cm: analysisResult.dimensions ? analysisResult.dimensions.height_cm : 0,
        estimated_depth_cm: analysisResult.dimensions ? analysisResult.dimensions.depth_cm : undefined,
        verified_width_cm: verifyWidth,
        verified_height_cm: verifyHeight,
        verified_depth_cm: verifyDepth,
        unit: 'cm'
      });

      setSaveSuccess(true);
      setShowVerifyModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product verification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Workspace Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Camera className="w-7 h-7 text-blue-500" />
            Measure Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">Computer vision camera calibration & object dimension engine</p>
        </div>

        {step > 1 && (
          <button
            onClick={() => { setStep(1); setUploadData(null); setAnalysisResult(null); setSaveSuccess(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Image
          </button>
        )}
      </div>

      {/* Workflow Step Progress Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { num: 1, label: '1. Image Upload & Quality' },
          { num: 2, label: '2. Calibration & Object' },
          { num: 3, label: '3. Dimension Report' }
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all duration-200 ${
              step === s.num
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                : step > s.num
                ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                : 'bg-slate-950/40 border-slate-900 text-slate-600'
            }`}
          >
            <span className="text-xs">{s.label}</span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Upload Product Image */}
      {step === 1 && (
        <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400">
              <Upload className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white">Upload Product Photo</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Place a standard reference marker (e.g. Credit Card or ArUco tag) beside your product on a flat surface for millimeter accuracy.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <button
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/20 transition-all duration-200 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Inspecting Image Quality...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select Image File
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Calibration Reference & Object Selection */}
      {step === 2 && uploadData && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Image Preview & Object Selector */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
              <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-semibold text-slate-300">
                Uploaded Image ({uploadData.width} × {uploadData.height} px)
              </span>
              <img
                src={uploadData.image_url}
                alt="Product Preview"
                className="w-full h-auto max-h-[500px] object-contain rounded-xl bg-slate-950"
              />
            </div>

            {/* Object Selection */}
            <div className="glass-card p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" />
                Select Product to Measure
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detectedObjects.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all duration-150 ${
                      selectedObjectId === obj.id
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-200">{obj.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Detection Confidence: {obj.confidence}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Image Quality Report & Calibration Setup */}
          <div className="space-y-6">
            
            {/* Image Quality Report Box */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Image Quality Inspection</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  uploadData.quality.score >= 70
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  Score: {uploadData.quality.score}/100
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Sharpness / Focus</span>
                  <span className={uploadData.quality.is_blurry ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {uploadData.quality.is_blurry ? 'Blurry' : 'Sharp Focus'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Lighting & Contrast</span>
                  <span className={!uploadData.quality.is_well_lit ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {!uploadData.quality.is_well_lit ? 'Sub-optimal' : 'Good Lighting'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Product Framing</span>
                  <span className={uploadData.quality.border_cropped ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {uploadData.quality.border_cropped ? 'Border Cropped' : 'Fully Visible'}
                  </span>
                </div>
              </div>

              {uploadData.quality.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Quality Recommendations:
                  </div>
                  {uploadData.quality.warnings.map((w, idx) => (
                    <div key={idx}>• {w}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Calibration Selection Box */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-400" />
                Select Scale Reference Marker
              </h3>

              <div className="space-y-2">
                {[
                  { id: 'CREDIT_CARD', label: 'Standard Credit Card (8.56 × 5.4 cm)' },
                  { id: 'A4_PAPER', label: 'A4 Paper (21.0 × 29.7 cm)' },
                  { id: 'ARUCO', label: 'ArUco Calibration Tag (5.0 × 5.0 cm)' },
                  { id: 'CUSTOM', label: 'Custom Reference Object' }
                ].map((refOpt) => (
                  <button
                    key={refOpt.id}
                    onClick={() => setReferenceType(refOpt.id as ReferenceType)}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-semibold transition-all duration-150 ${
                      referenceType === refOpt.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {refOpt.label}
                  </button>
                ))}
              </div>

              {referenceType === 'CUSTOM' && (
                <div className="mt-2">
                  <label className="text-xs text-slate-400 block mb-1">Custom Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customRefCm}
                    onChange={(e) => setCustomRefCm(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <button
                disabled={loading}
                onClick={handleRunAnalysis}
                className="w-full mt-4 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all duration-200 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating Scale & Bounding Dimensions...
                  </>
                ) : (
                  <>
                    Calculate Dimensions
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* STEP 3: Results & Annotated Visual Viewer */}
      {step === 3 && analysisResult && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Annotated Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" />
                  Computer Vision Dimension Overlay
                </span>

                {/* Unit Switcher */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setUnit('cm')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      unit === 'cm' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    onClick={() => setUnit('in')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      unit === 'in' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    inches
                  </button>
                </div>
              </div>

              <img
                src={analysisResult.annotated_image_url}
                alt="Annotated Measurement Result"
                className="w-full h-auto max-h-[550px] object-contain rounded-xl bg-slate-950 border border-slate-800"
              />
            </div>
          </div>

          {/* Right Column: Dimension Breakdown & Human Verification trigger */}
          <div className="space-y-6">
            
            {/* Reliability Status Badge */}
            <div className={`p-6 rounded-2xl border ${
              analysisResult.reliability_state === 'HIGH'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                : analysisResult.reliability_state === 'MEDIUM'
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-400'
                : 'bg-red-950/20 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold tracking-wider">Reliability Rating</span>
                <span className="text-lg font-extrabold">{analysisResult.confidence_score}%</span>
              </div>
              <div className="text-sm font-bold">{analysisResult.reliability_state} CONFIDENCE</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {analysisResult.reliability_reason}
              </p>
            </div>

            {/* NOT_MEASURABLE state handling */}
            {analysisResult.reliability_state === 'NOT_MEASURABLE' || !analysisResult.dimensions ? (
              <div className="glass-panel p-6 rounded-2xl border border-red-500/30 space-y-4">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertOctagon className="w-5 h-5" />
                  Dimensions Not Available
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-world dimensions cannot be determined because no valid known-size scale reference (Credit Card / ArUco / A4) was detected in the photo.
                </p>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="font-bold text-slate-200">How to capture a measurable photo:</div>
                  <div>1. Place a standard Credit Card or ArUco tag flat beside the product.</div>
                  <div>2. Ensure full product and reference marker are framed without cropping.</div>
                  <div>3. Provide good lighting and hold camera steady.</div>
                </div>

                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <Ruler className="w-4 h-4 text-blue-400" />
                  Enter Manual Caliper Measurements
                </button>
              </div>
            ) : (
              /* MEASURABLE (HIGH / MEDIUM / LOW) state handling */
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">
                  {analysisResult.reliability_state === 'LOW' ? 'Approximate Visual Estimate' : 'Estimated Dimensions'}
                </h3>

                {analysisResult.reliability_state === 'LOW' && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Warning: Low-confidence visual estimate. Not suitable for precise catalog listing or dimensional shipping surcharges.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-medium">Width</span>
                    <span className="text-xl font-extrabold text-white">
                      {analysisResult.reliability_state === 'LOW' ? '~' : ''}
                      {unit === 'cm' ? `${analysisResult.dimensions.width_cm} cm` : `${analysisResult.dimensions.width_in} in`}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-medium">Height</span>
                    <span className="text-xl font-extrabold text-white">
                      {analysisResult.reliability_state === 'LOW' ? '~' : ''}
                      {unit === 'cm' ? `${analysisResult.dimensions.height_cm} cm` : `${analysisResult.dimensions.height_in} in`}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-amber-400/90 block font-semibold">Inferred Depth Bound (2D Visual Heuristic — Not Measured)</span>
                  <span className="text-[10px] text-slate-400 block mb-1">Physical depth cannot be directly measured from a single 2D photo.</span>
                  <span className="text-lg font-bold text-slate-300">
                    {analysisResult.dimensions.depth_cm ? (
                      `${analysisResult.reliability_state === 'LOW' ? '~' : ''}${unit === 'cm' ? `${analysisResult.dimensions.depth_cm} cm` : `${analysisResult.dimensions.depth_in} in`}`
                    ) : 'N/A'}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Audit & Verify Measurement
                  </button>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                <span>Product saved to catalog!</span>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="font-bold underline text-white"
                >
                  View Catalog
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* HUMAN VERIFICATION MODAL */}
      {showVerifyModal && analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 max-w-lg w-full space-y-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Human Verification & Product Entry
            </h2>
            <p className="text-xs text-slate-400">
              Audit the AI predicted measurements and submit verified dimensions to catalog.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-semibold">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Kitchenware">Kitchenware</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-semibold">SKU</label>
                  <input
                    type="text"
                    value={productSku}
                    placeholder="e.g. SKU-104-RED"
                    onChange={(e) => setProductSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Verified Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={verifyWidth}
                    onChange={(e) => setVerifyWidth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Verified Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={verifyHeight}
                    onChange={(e) => setVerifyHeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Verified Depth (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={verifyDepth}
                    onChange={(e) => setVerifyDepth(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVerification}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
              >
                Save Verified Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
