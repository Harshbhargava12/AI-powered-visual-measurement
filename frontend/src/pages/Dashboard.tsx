import React, { useEffect, useState } from 'react';
import { Camera, Box, CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { AnalyticsOverview, Product } from '../types';
import { ProductImage } from '../components/common/ProductImage';

interface DashboardProps {
  onStartMeasure: () => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartMeasure, onNavigate }) => {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sData, pData] = await Promise.all([
          apiService.getAnalytics(),
          apiService.getProducts()
        ]);
        setStats(sData);
        setProducts(pData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Catalog Operations Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time computer vision dimension intelligence metrics</p>
        </div>

        <button
          onClick={onStartMeasure}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-95 text-sm"
        >
          <Camera className="w-4 h-4" />
          Measure Product
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-card p-6 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Processed Images</span>
            <Camera className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.total_images_processed || 0}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            +12% vs last week
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Products Cataloged</span>
            <Box className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.total_products_measured || 0}
          </div>
          <p className="text-xs text-slate-400 mt-2">Active SKUs</p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg AI Confidence</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {loading ? '...' : `${stats?.avg_confidence_score || 0}%`}
          </div>
          <p className="text-xs text-slate-400 mt-2">High accuracy threshold</p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Human Verified</span>
            <AlertCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.total_human_verifications || 0}
          </div>
          <p className="text-xs text-slate-400 mt-2">Audited by seller team</p>
        </div>

      </div>

      {/* Recent Catalog Products */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Measured Products</h2>
            <p className="text-xs text-slate-400">Catalog items processed via VisionMeasure pipeline</p>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            View Full Catalog
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-300">No products measured yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Upload an image in Measure Studio to generate your first profile</p>
            <button
              onClick={onStartMeasure}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Start Measurement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Estimated (W × H × D)</th>
                  <th className="px-4 py-3">Verified (W × H × D)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AI Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-white flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                        <ProductImage src={p.image_url} alt={p.name} className="w-full h-full" objectFit="cover" />
                      </div>
                      <span>{p.name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{p.sku}</td>
                    <td className="px-4 py-3.5 text-xs">{p.category}</td>
                    <td className="px-4 py-3.5 text-xs font-medium">
                      {p.estimated_width_cm} × {p.estimated_height_cm} {p.estimated_depth_cm ? `× ${p.estimated_depth_cm}` : ''} cm
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-emerald-400">
                      {p.verified_width_cm ? (
                        `${p.verified_width_cm} × ${p.verified_height_cm} ${p.verified_depth_cm ? `× ${p.verified_depth_cm}` : ''} cm`
                      ) : (
                        <span className="text-slate-500 italic">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                        p.verification_status === 'HUMAN_VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {p.verification_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-200">
                      {p.confidence_score}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
