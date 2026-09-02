import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { MeasureStudio } from './pages/MeasureStudio';
import { ProductCatalog } from './pages/ProductCatalog';
import { Analytics } from './pages/Analytics';
import { ExperimentDashboard } from './pages/ExperimentDashboard';
import { DocsViewer } from './pages/DocsViewer';

export function App() {
  const [currentView, setCurrentView] = useState<string>('landing');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1">
        {currentView === 'landing' && (
          <Landing
            onStartMeasure={() => setCurrentView('studio')}
            onViewDemo={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard
            onStartMeasure={() => setCurrentView('studio')}
            onNavigate={setCurrentView}
          />
        )}
        {currentView === 'studio' && (
          <MeasureStudio onNavigate={setCurrentView} />
        )}
        {currentView === 'catalog' && (
          <ProductCatalog />
        )}
        {currentView === 'analytics' && (
          <Analytics />
        )}
        {currentView === 'experiments' && (
          <ExperimentDashboard />
        )}
        {currentView === 'docs' && (
          <DocsViewer />
        )}
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950">
        VisionMeasure AI — Visual Dimension Intelligence SaaS Platform for E-Commerce
      </footer>
    </div>
  );
}

export default App;
