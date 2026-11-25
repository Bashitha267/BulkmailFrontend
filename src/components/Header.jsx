import React from 'react';
import { useApp } from '../context/AppContext';
import { FlaskConical, Server, ExternalLink } from 'lucide-react';

export default function Header({ title, subtitle, rightActions }) {
  const { isSimulationMode, setIsSimulationMode } = useApp();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/60 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-0.5 font-medium flex items-center gap-2">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Simulation mode indicator / toggle */}
        <button
          onClick={() => setIsSimulationMode(!isSimulationMode)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isSimulationMode
              ? 'bg-amber-100/80 text-amber-900 border-amber-300'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
          title="Toggle Simulation vs Live Mode"
        >
          <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
          <span>{isSimulationMode ? 'Simulation mode active' : 'Simulation mode'}</span>
        </button>

        {rightActions}
      </div>
    </header>
  );
}
