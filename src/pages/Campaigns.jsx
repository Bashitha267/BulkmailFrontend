import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Send, 
  Pause, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Clock, 
  BarChart2,
  Calendar
} from 'lucide-react';

export default function Campaigns() {
  const navigate = useNavigate();
  const { campaigns, resumeCampaign } = useApp();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { label: 'All', count: '6' },
    { label: 'Drafts', count: '1' },
    { label: 'Scheduled', count: '1' },
    { label: 'Paused', count: '1' },
    { label: 'Completed', count: '3' },
  ];

  const filteredCampaigns = campaigns.filter(c => {
    if (activeTab === 'Drafts') return c.status === 'Draft';
    if (activeTab === 'Scheduled') return c.status === 'Scheduled';
    if (activeTab === 'Paused') return c.status === 'Paused';
    if (activeTab === 'Completed') return c.status === 'Completed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaigns</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            6 campaigns · 1 draft · 1 paused
          </p>
        </div>

        <button
          onClick={() => navigate('/campaigns/new')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New campaign</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.label;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                isSelected
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100/70 border border-gray-200'
              }`}
            >
              {tab.label} · {tab.count}
            </button>
          );
        })}
      </div>

      {/* Campaign List Cards */}
      <div className="space-y-3">
        {/* December newsletter (Draft) */}
        <div className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Dec</span>
              <span className="text-base font-extrabold text-gray-700 leading-none mt-1">–</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">December newsletter</h2>
              <p className="text-xs text-gray-500 mt-0.5">Newsletter · 942 people · autosaved 5:09 pm</p>
            </div>
          </div>

          <div className="hidden lg:block text-xs text-gray-500 max-w-xs font-medium">
            Subject, recipients and content set · not reviewed yet
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-600">
              Draft
            </span>
            <button
              onClick={() => alert('Duplicated!')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => navigate('/campaigns/december-newsletter/edit')}
              className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>

        {/* November newsletter (Paused - Highlighted Row) */}
        <div className="bg-[#fef9c3]/70 border border-[#fef08a] rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider leading-none">Nov</span>
              <span className="text-base font-extrabold text-amber-900 leading-none mt-1">20</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">November newsletter</h2>
              <p className="text-xs text-amber-900 font-medium mt-0.5">
                Paused by Admin at 5:12 pm · 774 waiting
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-gray-700 font-bold mb-1">
              <span>168 of 942 sent</span>
              <span className="text-amber-800">17.8%</span>
            </div>
            <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full w-[17.8%]" />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-amber-200 text-amber-900 flex items-center gap-1">
              <Pause className="w-3 h-3 fill-current" />
              <span>Paused</span>
            </span>
            <button
              onClick={() => navigate('/campaigns/november-newsletter/report')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Open
            </button>
            <button
              onClick={() => resumeCampaign('november-newsletter')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Resume</span>
            </button>
          </div>
        </div>

        {/* VIP thank you (Scheduled) */}
        <div className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider leading-none">Nov</span>
              <span className="text-base font-extrabold text-blue-700 leading-none mt-1">23</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">VIP thank you</h2>
              <p className="text-xs text-gray-500 mt-0.5">VIP · 63 people</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 font-medium">
            Mon 23 Nov, 5:10 pm Colombo (UTC+5:30)
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700">
              Scheduled
            </span>
            <button
              onClick={() => navigate('/campaigns/december-newsletter/edit')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => navigate('/campaigns/december-newsletter/review')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Review
            </button>
          </div>
        </div>

        {/* Dashboard launch (Completed) */}
        <div className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">Nov</span>
              <span className="text-base font-extrabold text-emerald-700 leading-none mt-1">16</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Dashboard launch</h2>
              <p className="text-xs text-gray-500 mt-0.5">Beta testers · 95 people</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 font-semibold">
            44.1% opened · 11.8% clicked
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700">
              ✓ Completed
            </span>
            <button
              onClick={() => alert('Duplicated!')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => navigate('/campaigns/november-newsletter/report')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Report
            </button>
          </div>
        </div>

        {/* Black Friday early access (Completed) */}
        <div className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider leading-none">Nov</span>
              <span className="text-base font-extrabold text-purple-700 leading-none mt-1">8</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Black Friday early access</h2>
              <p className="text-xs text-gray-500 mt-0.5">Customers · 519 people</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 font-semibold">
            40.8% opened · 298 didn’t open
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700">
              ✓ Completed
            </span>
            <button
              onClick={() => navigate('/campaigns/november-newsletter/report')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Report
            </button>
            <button
              onClick={() => alert('Resending to 298 non-openers...')}
              className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resend to non-openers</span>
            </button>
          </div>
        </div>

        {/* October newsletter (Completed) */}
        <div className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-none">Oct</span>
              <span className="text-base font-extrabold text-amber-700 leading-none mt-1">23</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">October newsletter</h2>
              <p className="text-xs text-gray-500 mt-0.5">Newsletter · 1,000 people</p>
            </div>
          </div>

          <div className="text-xs text-gray-600 font-semibold">
            43.7% opened · 10.9% clicked
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700">
              ✓ Completed
            </span>
            <button
              onClick={() => alert('Duplicated!')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={() => navigate('/campaigns/november-newsletter/report')}
              className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
