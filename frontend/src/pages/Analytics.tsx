import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertOctagon, Layers, Plus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../services/api';
import { AnalyticsOverview, Evaluation } from '../types';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ground Truth submission state
  const [measurementId, setMeasurementId] = useState<string>('demo-meas-001');
  const [actualW, setActualW] = useState<number>(51.8);
  const [actualH, setActualH] = useState<number>(81.0);
  const [actualD, setActualD] = useState<number>(47.5);
  const [submitting, setSubmitting] = useState<boolean>(false);

  async function loadData() {
    setLoading(true);
    try {
      const [sData, eData] = await Promise.all([
        apiService.getAnalytics(),
        apiService.getEvaluations()
      ]);
      setStats(sData);
      setEvaluations(eData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.createEvaluation({
        measurement_id: measurementId,
        actual_width_cm: actualW,
        actual_height_cm: actualH,
        actual_depth_cm: actualD
      });
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const pieColors = ['#10b981', '#f59e0b', '#ef4444', '#64748b'];

  const pieData = stats?.reliability_distribution
    ? Object.entries(stats.reliability_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const categoryData = stats?.category_breakdown
    ? Object.entries(stats.category_breakdown).map(([category, count]) => ({ category, count }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-cyan-500" />
          Accuracy & Model Evaluation Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">Ground truth error benchmarking (MAE & MAPE metrics)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Global Model MAPE</span>
          <div className="text-3xl font-extrabold text-emerald-400">
            {stats?.avg_mape_percent !== undefined ? `${stats.avg_mape_percent}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Mean Absolute Percentage Error</p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Average Confidence Score</span>
          <div className="text-3xl font-extrabold text-blue-400">
            {stats?.avg_confidence_score || 0}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Computer vision certainty index</p>
        </div>

        <div className="glass-card p-6 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Ground Truth Benchmarks</span>
          <div className="text-3xl font-extrabold text-white">
            {evaluations.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Physical verification samples</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Reliability State Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Reliability State Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs text-slate-300">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Products Measured by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ground Truth Test Benchmark Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          Submit Ground Truth Benchmark (Actual Physical Measurement)
        </h2>

        <form onSubmit={handleAddEvaluation} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Measurement ID</label>
            <input
              type="text"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Actual Width (cm)</label>
            <input
              type="number"
              step="0.1"
              value={actualW}
              onChange={(e) => setActualW(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Actual Height (cm)</label>
            <input
              type="number"
              step="0.1"
              value={actualH}
              onChange={(e) => setActualH(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Actual Depth (cm)</label>
            <input
              type="number"
              step="0.1"
              value={actualD}
              onChange={(e) => setActualD(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
          >
            Compute Error Metric
          </button>
        </form>
      </div>

      {/* Evaluations Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Stored Accuracy Benchmarks</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Measurement ID</th>
                <th className="px-4 py-3">Actual (W × H)</th>
                <th className="px-4 py-3">Predicted (W × H)</th>
                <th className="px-4 py-3">Absolute Error (W / H)</th>
                <th className="px-4 py-3">% Error (W / H)</th>
                <th className="px-4 py-3">MAPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {evaluations.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 font-mono text-slate-400">{ev.measurement_id}</td>
                  <td className="px-4 py-3 font-bold text-white">{ev.actual_width_cm} × {ev.actual_height_cm} cm</td>
                  <td className="px-4 py-3 text-slate-300">{ev.predicted_width_cm} × {ev.predicted_height_cm} cm</td>
                  <td className="px-4 py-3 text-slate-400">{ev.abs_error_width_cm} cm / {ev.abs_error_height_cm} cm</td>
                  <td className="px-4 py-3 text-slate-400">{ev.pct_error_width}% / {ev.pct_error_height}%</td>
                  <td className="px-4 py-3 font-bold text-emerald-400">{ev.mape}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
