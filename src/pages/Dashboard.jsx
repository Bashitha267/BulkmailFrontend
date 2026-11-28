import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Flag, 
  Pause, 
  Play, 
  Upload, 
  Plus, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Sparkles,
  ArrowRight,
  Radio
} from 'lucide-react';

export default function Dashboard() {
  const { 
    dashboardMode, 
    setDashboardMode,
    isSimulationMode, 
    setIsSimulationMode,
    setIsImportModalOpen,
    contacts,
    campaigns,
    dataLoading,
    resumeCampaign,
    pauseCampaign,
    notify,
  } = useApp();
  const navigate = useNavigate();
  const [actionBusyId, setActionBusyId] = useState(null);
  const [dash, setDash] = useState(null);
  const { user } = useApp();
  const sendingNow = campaigns.some((c) => c.status === 'Sending');

  // Real numbers, alerts and setup status straight from the backend.
  useEffect(() => {
    let alive = true;
    const load = () =>
      dashboardApi
        .dashboard()
        .then((r) => alive && setDash(r))
        .catch(() => {});
    load();
    const t = setInterval(load, sendingNow ? 4000 : 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [sendingNow, campaigns.length]);

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  const contactsTotal = dash?.counts?.total ?? contacts.length;
  const canReceiveCount = dash?.counts?.receivable ?? contacts.filter((c) => c.status === 'Subscribed').length;
  const totalSent = dash?.totals?.sent ?? campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
  const totalDelivered = dash?.totals?.delivered ?? campaigns.reduce((sum, c) => sum + (c.delivered || 0), 0);
  const totalBounced = dash?.totals?.bounced ?? campaigns.reduce((sum, c) => sum + (c.bounced || 0), 0);
  const totalComplaints = dash?.totals?.complaints ?? campaigns.reduce((sum, c) => sum + (c.complaints || 0), 0);
  const deliveredPct = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
  const bouncedPct = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0.0';
  const complaintPct = totalDelivered > 0 ? ((totalComplaints / totalDelivered) * 100).toFixed(2) : '0.00';
  const attention = dash?.attention || [];
  const records = dash?.deliverability?.domain?.records || {};
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const nowLabel = new Date().toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });

  const activeOrPausedCampaign =
    campaigns.find((c) => c.status === 'Sending') ||
    campaigns.find((c) => c.status === 'Paused');

  const handleTogglePauseResume = async (camp) => {
    setActionBusyId(camp.id);
    try {
      if (camp.status === 'Sending') {
        await pauseCampaign(camp.id);
      } else {
        await resumeCampaign(camp.id);
      }
    } catch (err) {
      notify({ type: 'error', message: err.message });
    } finally {
      setActionBusyId(null);
    }
  };

  // If viewing Onboarding Empty State (Page 1)
  if (dashboardMode === 'empty') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome, Admin</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Five steps and you’re ready to send your first campaign
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulationMode(!isSimulationMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isSimulationMode 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-white text-gray-700 border-gray-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Simulation mode</span>
            </button>
            <button
              onClick={() => setDashboardMode('live')}
              className="text-xs bg-black text-white hover:bg-zinc-800 px-3 py-1.5 rounded-full font-medium transition-colors"
            >
              View live dashboard →
            </button>
          </div>
        </div>

        {/* Two Column Layout for Page 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main 5-Step Card */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-base">Get ready to send</h2>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                0 of 5 done
              </span>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-black text-white gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Connect an email provider</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Amazon SES or Brevo. Until then, nothing is really sent.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/settings')}
                  className="bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  Connect
                </button>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 transition-colors gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Verify your domain</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Add SPF, DKIM and DMARC records so mail lands in the inbox
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/domains')}
                  className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  Start
                </button>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 transition-colors gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Add your business address</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Required by law in every marketing email footer
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/settings')}
                  className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  Add
                </button>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 transition-colors gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Import your contacts</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Only people who agreed to hear from you
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  Import
                </button>
              </div>

              {/* Step 5 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 transition-colors gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Send yourself a test</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      See exactly what your audience will get
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/campaigns/new')}
                  className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors w-full sm:w-auto"
                >
                  Try it
                </button>
              </div>
            </div>
          </div>

          {/* Right Empty State Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* No contacts yet card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No contacts yet</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-5 leading-relaxed">
                Import a CSV or add people one by one. We’ll skip duplicates and invalid emails for you.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Import CSV
                </button>
                <button
                  onClick={() => navigate('/contacts')}
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Add one
                </button>
              </div>
            </div>

            {/* No campaigns yet card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">No campaigns yet</h3>
              <p className="text-xs text-gray-500 max-w-xs mb-5 leading-relaxed">
                Start from one of 3 ready-made templates: a newsletter, a promotion or an announcement.
              </p>
              <button
                onClick={() => navigate('/templates')}
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Browse templates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise: Page 2 (Live Active State)
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{greeting}, {user?.name || 'there'}</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="font-semibold text-gray-700">Live</span>
            <span>·</span>
            <span>{nowLabel}</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border ${isSimulationMode ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
            <span className={`w-2 h-2 rounded-full ${isSimulationMode ? 'bg-amber-500' : 'bg-emerald-600'}`} />
            <span>{isSimulationMode ? 'Simulation mode · nothing is really sent' : 'Amazon SES · live'}</span>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => navigate('/campaigns/new')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New campaign</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Contacts */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Contacts</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{contactsTotal.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">{canReceiveCount.toLocaleString()} can receive</p>
        </div>

        {/* Sent */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Sent</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{totalSent.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">All time</p>
        </div>

        {/* Delivered */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Delivered</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{deliveredPct}%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">{totalDelivered.toLocaleString()} emails</p>
        </div>

        {/* Bounced */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Bounced</span>
            <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{bouncedPct}%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">{totalBounced} · suppressed</p>
        </div>

        {/* Spam Complaints */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Spam complaints</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{complaintPct}%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">{totalComplaints} · keep under 0.3%</p>
        </div>
      </div>

      {/* Main Grid: Left Side (Paused/Sending + Recent Campaigns) and Right Side (Needs Attention + Deliverability) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Sending or Paused Campaign Banner Card */}
          {activeOrPausedCampaign && (
            <div
              className={`rounded-3xl p-5 shadow-2xs border ${
                activeOrPausedCampaign.status === 'Sending'
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-[#fef9c3]/70 border-[#fef08a]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      activeOrPausedCampaign.status === 'Sending'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-400 text-amber-950'
                    }`}
                  >
                    {activeOrPausedCampaign.status === 'Sending' ? (
                      <Spinner className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4 fill-current" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">
                      {activeOrPausedCampaign.status === 'Sending' ? (isSimulationMode ? 'Sending (simulation)' : 'Sending via Amazon SES') : 'Paused'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {activeOrPausedCampaign.title} · {activeOrPausedCampaign.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/campaigns/${activeOrPausedCampaign.id}/report`)}
                    className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold hover:bg-gray-50 border border-gray-200 transition-colors shadow-2xs"
                  >
                    Open
                  </button>
                  <button
                    disabled={actionBusyId === activeOrPausedCampaign.id}
                    onClick={() => handleTogglePauseResume(activeOrPausedCampaign)}
                    className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                      activeOrPausedCampaign.status === 'Sending'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {actionBusyId === activeOrPausedCampaign.id ? (
                      <Spinner className="w-3 h-3" />
                    ) : activeOrPausedCampaign.status === 'Sending' ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>{activeOrPausedCampaign.status === 'Sending' ? 'Pause' : 'Resume'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between text-xs mb-1.5">
                <span className="font-bold text-gray-900 text-sm">
                  Sent <span className="text-base">{activeOrPausedCampaign.progress?.sent || 0}</span> of{' '}
                  {activeOrPausedCampaign.progress?.total || 0}
                </span>
                <span className="text-amber-900 font-semibold bg-amber-200/80 px-2 py-0.5 rounded-full text-[11px]">
                  {activeOrPausedCampaign.progress?.waiting || 0} waiting
                </span>
              </div>

              <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    activeOrPausedCampaign.status === 'Sending' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                  style={{ width: `${activeOrPausedCampaign.progress?.percentage || 0}%` }}
                />
              </div>

              <p className="text-[11.5px] text-gray-600 font-medium">
                {activeOrPausedCampaign.status === 'Sending'
                  ? 'Emails are going out within your daily and per-second limits.'
                  : 'Nothing more goes out until you resume. Recipients already sent to won’t get it twice.'}
              </p>
            </div>
          )}

          {/* Recent Campaigns Card (Live from Backend) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Recent campaigns</h2>
                <p className="text-xs text-gray-400 font-medium">Newest first</p>
              </div>
              <button
                onClick={() => navigate('/campaigns')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
              >
                All campaigns
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No campaigns yet.</p>
              ) : (
                campaigns.slice(0, 4).map((camp) => {
                  const isDraft = camp.status === 'Draft';
                  const isScheduled = camp.status === 'Scheduled';
                  const isSending = camp.status === 'Sending';
                  const isPaused = camp.status === 'Paused';
                  const isCompleted = camp.status === 'Completed';

                  return (
                    <div
                      key={camp.id}
                      className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#fafafa] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            isDraft
                              ? 'bg-purple-50 text-purple-700'
                              : isScheduled
                              ? 'bg-blue-50 text-blue-700'
                              : isSending
                              ? 'bg-emerald-100 text-emerald-700'
                              : isPaused
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isDraft ? '✏️' : isScheduled ? <Clock className="w-4 h-4" /> : isSending ? <Spinner className="w-4 h-4" /> : isPaused ? <Pause className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-gray-900 truncate">{camp.title}</h3>
                          <p className="text-xs text-gray-500 truncate">
                            {isCompleted && camp.openedRate
                              ? `${camp.month} ${camp.day} · ${camp.openedRate} opened · ${camp.clickedRate || '0%'} clicked`
                              : isSending && camp.progress
                              ? `Sending · ${camp.progress.sent} of ${camp.progress.total}`
                              : camp.subtitle || camp.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${
                            isDraft
                              ? 'bg-gray-100 text-gray-600'
                              : isScheduled
                              ? 'bg-blue-50 text-blue-700'
                              : isPaused
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isCompleted ? '✓ Completed' : camp.status}
                        </span>
                        <button
                          onClick={() =>
                            isDraft
                              ? navigate(`/campaigns/${camp.id}/edit`)
                              : isScheduled
                              ? navigate(`/campaigns/${camp.id}/review`)
                              : navigate(`/campaigns/${camp.id}/report`)
                          }
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                            isDraft
                              ? 'bg-black text-white hover:bg-zinc-800'
                              : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {isDraft ? 'Continue' : isScheduled ? 'Review' : 'Report'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Needs Attention Card (Dynamic from Real Data) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900">Needs attention</h2>
              <p className="text-xs text-gray-400 font-medium">Handled in one click</p>
            </div>

            <div className="space-y-3">
              {attention.length === 0 && (
                <p className="text-xs text-gray-500 py-2">Nothing needs your attention right now.</p>
              )}
              {attention.map((item) => {
                const paused = item.kind === 'paused';
                const Icon = paused ? Pause : item.kind === 'complaint' ? Flag : item.kind === 'warn' ? AlertTriangle : ShieldAlert;
                const camp = item.campaignId ? campaigns.find((c) => c.id === item.campaignId) : null;
                return (
                  <div
                    key={item.key}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                      item.kind === 'error' ? 'bg-rose-50/50 border-rose-100' : paused || item.kind === 'warn' ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/70 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-gray-900 leading-tight">{item.title}</h3>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{item.detail}</p>
                      </div>
                    </div>
                    {item.action && (
                      <button
                        disabled={actionBusyId === item.campaignId}
                        onClick={() => (camp ? handleTogglePauseResume(camp) : item.to && navigate(item.to))}
                        className="px-3 py-1 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                      >
                        {actionBusyId === item.campaignId ? '...' : item.action}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deliverability Card (Real Rates) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Deliverability</h2>
                <p className="text-xs text-gray-400 font-medium">What inbox providers check</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${records.spf === 'pass' && records.dkim === 'pass' && records.dmarc === 'pass' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                {records.spf === 'pass' && records.dkim === 'pass' && records.dmarc === 'pass' ? 'Good' : 'Needs setup'}
              </span>
            </div>

            {/* 3 Status Pills (real DNS check results) */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              {[['SPF', records.spf], ['DKIM', records.dkim], ['DMARC', records.dmarc]].map(([label, val]) => {
                const ok = val === 'pass';
                return (
                  <div key={label} className={`p-2.5 rounded-2xl border ${ok ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'}`}>
                    <p className="text-[11px] font-bold text-gray-700">{label}</p>
                    <p className={`text-xs font-extrabold mt-0.5 ${ok ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {ok ? '✓ Pass' : dash?.deliverability?.domain ? '! Not confirmed' : 'Not set up'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Complaint Rate */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Complaint rate</span>
                <span className="font-bold text-gray-900">{complaintPct}% of 0.3%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (Number(complaintPct) / 0.3) * 100)}%` }}
                />
              </div>
            </div>

            {/* Bounce Rate */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Bounce rate</span>
                <span className="font-bold text-gray-900">{bouncedPct}% of 5%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (Number(bouncedPct) / 5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Guarantee Pill */}
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 rounded-2xl text-xs font-bold text-emerald-800 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{dash?.deliverability?.oneClickUnsubscribe === false ? 'One-click unsubscribe is off' : 'One-click unsubscribe on every email'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
