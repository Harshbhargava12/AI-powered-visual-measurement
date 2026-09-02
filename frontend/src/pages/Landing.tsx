import React from 'react';
import { Camera, CheckCircle2, ShieldAlert, ArrowRight, Zap, Target, BarChart2, Layers } from 'lucide-react';

interface LandingProps {
  onStartMeasure: () => void;
  onViewDemo: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStartMeasure, onViewDemo }) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      
      {/* Glow Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[250px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          Enterprise Computer Vision for E-Commerce Cataloging
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          AI Visual Dimension Intelligence <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
            With Zero Hallucinations.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Stop manually measuring hundreds of physical products. VisionMeasure extracts millimeter-accurate dimensions from single images using automated scale calibration, visual quality scoring, and uncertainty modeling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartMeasure}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all duration-200"
          >
            <Camera className="w-5 h-5" />
            Launch Measure Studio
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onViewDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all duration-200"
          >
            Explore Demo Products & KPIs
          </button>
        </div>
      </div>

      {/* Problem vs Solution Comparison Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
        <div className="glass-panel rounded-2xl p-8 border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">The Core User Problem</h2>
          <p className="text-slate-400 text-center max-w-2xl mx-auto mb-8 text-sm">
            Single 2D images do not contain intrinsic scale. Generic AI models invent dimensions. VisionMeasure uses explicit uncertainty analysis.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Generic AI Box */}
            <div className="p-6 rounded-xl bg-red-950/20 border border-red-500/20">
              <div className="flex items-center gap-3 mb-4 text-red-400 font-bold">
                <ShieldAlert className="w-5 h-5" />
                Generic "AI Guessing" Demos
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  Blindly invents physical scale without reference markers
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  False confidence on blurry, cropped, or dark photos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  No human verification workflow or ground truth tracking
                </li>
              </ul>
            </div>

            {/* VisionMeasure Box */}
            <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4 text-emerald-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                VisionMeasure Intelligence System
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Automated scale calibration (Credit Cards, ArUco, A4 paper)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Image quality inspection (Blur, contrast, resolution, cropping)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Reliability matrix (HIGH, MEDIUM, LOW, NOT MEASURABLE)
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Core Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Product Capabilities</h2>
          <p className="text-slate-400 text-sm mt-2">Built specifically for e-commerce catalog teams and sellers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl hover:border-blue-500/40 transition-all duration-200">
            <Target className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Automated Calibration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Supports standard reference markers like credit cards, A4 sheets, and ArUco tags to establish precise pixel-to-real-world scale.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl hover:border-blue-500/40 transition-all duration-200">
            <Layers className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Human Verification</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Allows sellers to audit and manually correct AI estimated dimensions. Stores AI vs Human verified data for model retraining.
            </p>
          </div>

          <div className="glass-card p-6 rounded-xl hover:border-blue-500/40 transition-all duration-200">
            <BarChart2 className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Accuracy Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tracks real ground truth Mean Absolute Percentage Error (MAPE), error distributions, and onboarding experiment conversion metrics.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
