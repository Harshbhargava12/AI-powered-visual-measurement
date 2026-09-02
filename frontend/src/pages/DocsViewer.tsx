import React, { useState } from 'react';
import { FileText, BookOpen, Target, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DocsViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'case-study' | 'prd'>('case-study');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-400" />
            Product Portfolio Documentation
          </h1>
          <p className="text-xs text-slate-400 mt-1">Product Thinking, PRD & Architectural Documentation</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('case-study')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'case-study'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Product Case Study
          </button>
          <button
            onClick={() => setActiveTab('prd')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'prd'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PRD Specification
          </button>
        </div>
      </div>

      {activeTab === 'case-study' ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-slate-300 space-y-6 text-sm leading-relaxed">
          <h2 className="text-2xl font-extrabold text-white">VisionMeasure — Product Manager Case Study</h2>
          <hr className="border-slate-800" />

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              1. Problem Discovery
            </h3>
            <p>
              Small and medium-sized e-commerce sellers process hundreds of SKUs monthly. Manual ruler measurements are labor-intensive, error-prone, and delay catalog publishing times. However, single 2D images do not contain intrinsic scale. Blindly guessing dimensions with AI creates return friction and shipping calculation failures.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              2. Target User Personas
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1">Primary: E-Commerce Catalog Ops Lead</div>
                <p className="text-slate-400">Needs rapid, batch product dimensioning with audit capability before publishing listings to Shopify or Amazon.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-bold text-white mb-1">Secondary: Warehouse Operations Manager</div>
                <p className="text-slate-400">Needs volumetric calculations (L &times; W &times; H) for box sizing and dimensional weight shipping estimates.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              3. RICE Feature Prioritization Framework
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Feature</th>
                    <th className="p-2.5">Reach</th>
                    <th className="p-2.5">Impact</th>
                    <th className="p-2.5">Confidence</th>
                    <th className="p-2.5">Effort</th>
                    <th className="p-2.5">RICE Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold text-white">Reference Object Calibration</td>
                    <td className="p-2.5">100%</td>
                    <td className="p-2.5">High (3)</td>
                    <td className="p-2.5">90%</td>
                    <td className="p-2.5">2 wk</td>
                    <td className="p-2.5 font-bold text-emerald-400">135</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Image Quality Engine</td>
                    <td className="p-2.5">80%</td>
                    <td className="p-2.5">High (3)</td>
                    <td className="p-2.5">85%</td>
                    <td className="p-2.5">1.5 wk</td>
                    <td className="p-2.5 font-bold text-emerald-400">136</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">Human Verification Flow</td>
                    <td className="p-2.5">60%</td>
                    <td className="p-2.5">Medium (2)</td>
                    <td className="p-2.5">95%</td>
                    <td className="p-2.5">1 wk</td>
                    <td className="p-2.5 font-bold text-emerald-400">114</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-slate-300 space-y-6 text-sm leading-relaxed">
          <h2 className="text-2xl font-extrabold text-white">Product Requirements Document (PRD)</h2>
          <hr className="border-slate-800" />

          <section className="space-y-2">
            <h3 className="text-base font-bold text-white">1. Functional Requirements</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
              <li>Must check image resolution (&ge; 600x600 px) and blur variance (Laplacian &ge; 50).</li>
              <li>Must support Credit Card, A4 paper, ArUco tags, and Custom calibration markers.</li>
              <li>Must compute Width, Height, Area (cm&sup2; / in&sup2;), and estimated Depth bounds.</li>
              <li>Must categorize output into HIGH, MEDIUM, LOW, or NOT MEASURABLE reliability states.</li>
              <li>Must allow human sellers to override and save verified measurements.</li>
            </ul>
          </section>
        </div>
      )}

    </div>
  );
};
