import React, { useEffect, useState } from 'react';
import { FlaskConical, Clock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import { apiService } from '../services/api';
import { ExperimentVariant } from '../types';

export const ExperimentDashboard: React.FC = () => {
  const [experimentKey, setExperimentKey] = useState<string>('');
  const [variants, setVariants] = useState<ExperimentVariant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiService.getExperiments();
        setExperimentKey(res.experiment_key);
        setVariants(res.variants);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <FlaskConical className="w-7 h-7 text-amber-500" />
          A/B Experimentation Dashboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">Product Onboarding Flow Variant Performance ({experimentKey})</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">Active Experiment: Onboarding Calibration Strategy</h2>
          <p className="text-xs text-slate-400 mt-1">
            Testing whether requiring reference object selection before upload increases accuracy and reduces drop-offs.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading experiment data...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {variants.map((v) => (
              <div key={v.variant} className="glass-card p-6 rounded-xl border border-slate-800 space-y-4">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">{v.variant}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {v.total_users} Users
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Measurement Completion Conversion Rate</span>
                    <span className="text-base font-extrabold text-emerald-400">{v.conversion_rate_pct}%</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Human Manual Correction Rate</span>
                    <span className="text-sm font-bold text-amber-400">{v.human_correction_rate_pct}%</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Average Completion Time</span>
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {v.avg_time_sec} sec
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
