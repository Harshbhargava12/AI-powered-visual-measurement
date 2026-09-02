import React, { useEffect, useState } from 'react';
import { Box, Search, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { Product } from '../types';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await apiService.getProducts(category || undefined, search || undefined);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Box className="w-7 h-7 text-indigo-500" />
            Product Dimension Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">E-Commerce SKU listings with verified visual dimensions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Furniture">Furniture</option>
            <option value="Kitchenware">Kitchenware</option>
            <option value="Footwear">Footwear</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Apparel</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400 glass-panel rounded-2xl">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No products found matching filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-4">
              
              <div className="aspect-video w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800 relative">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  p.verification_status === 'HUMAN_VERIFIED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-md'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md'
                }`}>
                  {p.verification_status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{p.category}</span>
                  <span className="text-[11px] font-mono text-slate-400">{p.sku}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{p.name}</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>AI Estimated (W × H × D):</span>
                  <span className="font-semibold text-slate-200">
                    {p.estimated_width_cm} × {p.estimated_height_cm} {p.estimated_depth_cm ? `× ${p.estimated_depth_cm}` : ''} cm
                  </span>
                </div>

                {p.verified_width_cm && (
                  <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-2 font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Listing:
                    </span>
                    <span>
                      {p.verified_width_cm} × {p.verified_height_cm} {p.verified_depth_cm ? `× ${p.verified_depth_cm}` : ''} cm
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>AI Confidence: <strong className="text-white">{p.confidence_score}%</strong></span>
                <span>Unit: <strong className="text-white">{p.unit}</strong></span>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
