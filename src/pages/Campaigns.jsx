import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TableSkeleton, Spinner } from '../components/Skeleton';
import { 
  Plus, 
  Pause, 
  Play, 
  RotateCcw
} from 'lucide-react';

export default function Campaigns() {
  const navigate = useNavigate();
  const { campaigns, dataLoading, resumeCampaign, pauseCampaign, notify } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [busyId, setBusyId] = useState(null);

  if (dataLoading && campaigns.length === 0) {
    return <TableSkeleton rows={5} />;
  }

  const draftsCount = campaigns.filter((c) => c.status === 'Draft').length;
  const scheduledCount = campaigns.filter((c) => c.status === 'Scheduled').length;
  const pausedCount = campaigns.filter((c) => c.status === 'Paused').length;
  const sendingCount = campaigns.filter((c) => c.status === 'Sending').length;
  const completedCount = campaigns.filter((c) => c.status === 'Completed').length;

  const tabs = [
    { label: 'All', count: String(campaigns.length) },
    ...(sendingCount > 0 ? [{ label: 'Sending', count: String(sendingCount) }] : []),
    { label: 'Drafts', count: String(draftsCount) },
    { label: 'Scheduled', count: String(scheduledCount) },
    { label: 'Paused', count: String(pausedCount) },
    { label: 'Completed', count: String(completedCount) },
  ];

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'Sending') return c.status === 'Sending';
    if (activeTab === 'Drafts') return c.status === 'Draft';
    if (activeTab === 'Scheduled') return c.status === 'Scheduled';
    if (activeTab === 'Paused') return c.status === 'Paused';
    if (activeTab === 'Completed') return c.status === 'Completed';
    return true;
  });

  const handleToggle = async (camp) => {
    setBusyId(camp.id);
    try {
      if (camp.status === 'Sending') {
        await pauseCampaign(camp.id);
      } else {
        await resumeCampaign(camp.id);
      }
    } catch (err) {
      notify({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Campaigns</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {campaigns.length} campaigns · {draftsCount} draft · {pausedCount} paused{sendingCount > 0 ? ` · ${sendingCount} sending` : ''}
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

      {/* Live Campaign Cards */}
      <div className="space-y-3">
        {filteredCampaigns.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center text-xs text-gray-500">
            No campaigns match this filter yet.
          </div>
        )}

        {filteredCampaigns.map((camp) => {
          const isSending = camp.status === 'Sending';
          const isPaused = camp.status === 'Paused';
          const isDraft = camp.status === 'Draft';
          const isScheduled = camp.status === 'Scheduled';
          const isCompleted = camp.status === 'Completed';

          return (
            <div
              key={camp.id}
              className={`rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors border ${
                isSending
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isPaused
                  ? 'bg-[#fef9c3]/70 border-[#fef08a]'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center text-center shrink-0 ${
                    isSending
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-900'
                      : isPaused
                      ? 'bg-amber-100 border-amber-200 text-amber-900'
                      : isScheduled
                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                      : isCompleted
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none opacity-75">
                    {camp.month}
                  </span>
                  <span className="text-base font-extrabold leading-none mt-1">{camp.day}</span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">{camp.title}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{camp.subtitle}</p>
                </div>
              </div>

              {(isSending || isPaused) && camp.progress ? (
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs text-gray-700 font-bold mb-1">
                    <span>
                      {camp.progress.sent} of {camp.progress.total} sent
                    </span>
                    <span className={isSending ? 'text-emerald-700' : 'text-amber-800'}>
                      {camp.progress.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isSending ? 'bg-emerald-600' : 'bg-amber-600'
                      }`}
                      style={{ width: `${camp.progress.percentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600 font-medium max-w-xs">
                  {isCompleted && camp.openedRate
                    ? `${camp.openedRate} opened · ${camp.clickedRate || '0%'} clicked`
                    : camp.description || camp.scheduledDate || ''}
                </div>
              )}

              <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl inline-flex items-center gap-1 ${
                    isSending
                      ? 'bg-emerald-100 text-emerald-900'
                      : isPaused
                      ? 'bg-amber-200 text-amber-900'
                      : isScheduled
                      ? 'bg-blue-50 text-blue-700'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isSending && <Spinner className="w-3 h-3" />}
                  {isPaused && <Pause className="w-3 h-3 fill-current" />}
                  {isCompleted && '✓ '}
                  <span>{camp.status}</span>
                </span>

                {(isSending || isPaused) && (
                  <>
                    <button
                      onClick={() => navigate(`/campaigns/${camp.id}/report`)}
                      className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Report
                    </button>
                    <button
                      disabled={busyId === camp.id}
                      onClick={() => handleToggle(camp)}
                      className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                        isSending ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-800'
                      }`}
                    >
                      {busyId === camp.id ? (
                        <Spinner className="w-3 h-3" />
                      ) : isSending ? (
                        <Pause className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                      <span>{isSending ? 'Pause' : 'Resume'}</span>
                    </button>
                  </>
                )}

                {isDraft && (
                  <button
                    onClick={() => navigate(`/campaigns/${camp.id}/edit`)}
                    className="px-4 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                )}

                {isScheduled && (
                  <>
                    <button
                      onClick={() => navigate(`/campaigns/${camp.id}/edit`)}
                      className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/campaigns/${camp.id}/review`)}
                      className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50"
                    >
                      Review
                    </button>
                  </>
                )}

                {isCompleted && (
                  <>
                    <button
                      onClick={() => navigate(`/campaigns/${camp.id}/report`)}
                      className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold border border-gray-200 hover:bg-gray-50"
                    >
                      Report
                    </button>
                    {camp.description?.includes('didn’t open') && (
                      <button
                        onClick={() => notify({ type: 'info', message: 'Prepared resend for non-openers.' })}
                        className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resend to non-openers</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
