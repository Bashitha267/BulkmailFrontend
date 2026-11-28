import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header({ title, subtitle, rightActions }) {
  const { isSimulationMode, settings } = useApp();
  const navigate = useNavigate();
  const reason = settings?.sesInfo?.modeReason;

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200/60 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-[13px] text-gray-500 mt-0.5 font-medium flex items-center gap-2">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Read-only: the mode comes from the server. Change it in Settings. */}
        <button
          onClick={() => navigate('/settings')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isSimulationMode
              ? 'bg-amber-100/80 text-amber-900 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
          title={isSimulationMode ? reason || 'Nothing is really sent' : 'Emails are sent through Amazon SES'}
        >
          {isSimulationMode ? <FlaskConical className="w-3.5 h-3.5 text-amber-600" /> : <Radio className="w-3.5 h-3.5 text-emerald-600" />}
          <span>{isSimulationMode ? 'Simulation mode' : 'Live sending'}</span>
        </button>
        {rightActions}
      </div>
    </header>
  );
}
