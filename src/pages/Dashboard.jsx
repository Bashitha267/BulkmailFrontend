import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
    campaigns,
    resumeCampaign 
  } = useApp();
  const navigate = useNavigate();

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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Good evening, Admin</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span className="font-semibold text-gray-700">Live</span>
            <span>·</span>
            <span>Friday 20 November, 5:12 pm</span>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Amazon SES · connected</span>
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

      {/* Multi-Group Amazon SES Quick Dispatch Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-zinc-800 text-white p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm border border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold text-sm shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Automated Multi-Group Amazon SES Sending</h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Select multiple groups, assign distinct templates, and blast ~500 emails automatically in ~50 seconds with duplicate protection.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/campaigns/new')}
          className="px-4 py-2 bg-white text-black hover:bg-zinc-100 font-bold text-xs rounded-xl transition-all shrink-0 shadow-sm"
        >
          Create Multi-Group Blast →
        </button>
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
          <p className="text-2xl font-bold text-gray-900 tracking-tight">1,200</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">1,129 can receive</p>
        </div>

        {/* Sent */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Sent</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">1,765</p>
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
          <p className="text-2xl font-bold text-gray-900 tracking-tight">96.7%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">1,707 emails</p>
        </div>

        {/* Bounced */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Bounced</span>
            <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">2.3%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">40 · suppressed</p>
        </div>

        {/* Spam Complaints */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Spam complaints</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">0.06%</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">1 · limit is 0.3%</p>
        </div>
      </div>

      {/* Main Grid: Left Side (Paused + Recent Campaigns) and Right Side (Needs Attention + Deliverability) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Paused Campaign Banner Card */}
          <div className="bg-[#fef9c3]/70 border border-[#fef08a] rounded-3xl p-5 shadow-2xs">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
                  <Pause className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">Paused</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    November newsletter · paused by Admin at 5:12 pm
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/campaigns/november-newsletter/report')}
                  className="px-3 py-1.5 rounded-xl bg-white text-gray-800 text-xs font-bold hover:bg-gray-50 border border-gray-200 transition-colors shadow-2xs"
                >
                  Open
                </button>
                <button
                  onClick={() => resumeCampaign('november-newsletter')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Resume</span>
                </button>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="font-bold text-gray-900 text-sm">
                Sent <span className="text-base">168</span> of 942
              </span>
              <span className="text-amber-900 font-semibold bg-amber-200/80 px-2 py-0.5 rounded-full text-[11px]">
                774 waiting
              </span>
            </div>

            <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden mb-3">
              <div className="bg-amber-600 h-full rounded-full w-[17.8%]" />
            </div>

            <p className="text-[11.5px] text-gray-600 font-medium">
              Nothing more goes out until you resume. Recipients already sent to won’t get it twice.
            </p>
          </div>

          {/* Recent Campaigns Card */}
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
              {/* December newsletter */}
              <div className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#fafafa] flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✏️
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">December newsletter</h3>
                    <p className="text-xs text-gray-500">Draft · autosaved 5:09 pm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                    Draft
                  </span>
                  <button
                    onClick={() => navigate('/campaigns/december-newsletter/edit')}
                    className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>

              {/* VIP thank you */}
              <div className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#fafafa] flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">VIP thank you</h3>
                    <p className="text-xs text-gray-500">
                      Mon 23 Nov, 5:10 pm (Colombo time) · 63 people
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    Scheduled
                  </span>
                  <button
                    onClick={() => navigate('/campaigns/december-newsletter/review')}
                    className="px-3 py-1.5 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* Dashboard launch */}
              <div className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#fafafa] flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Dashboard launch</h3>
                    <p className="text-xs text-gray-500">
                      16 Nov · 44.1% opened · 11.8% clicked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    ✓ Completed
                  </span>
                  <button
                    onClick={() => navigate('/campaigns/november-newsletter/report')}
                    className="px-3 py-1.5 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    Report
                  </button>
                </div>
              </div>

              {/* Black Friday early access */}
              <div className="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-[#fafafa] flex items-center justify-between gap-3 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Black Friday early access</h3>
                    <p className="text-xs text-gray-500">
                      8 Nov · 40.8% opened · 10.3% clicked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    ✓ Completed
                  </span>
                  <button
                    onClick={() => alert('Resending to non-openers...')}
                    className="px-3 py-1.5 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    Resend to non-openers
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Needs Attention Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900">Needs attention</h2>
              <p className="text-xs text-gray-400 font-medium">Handled in one click</p>
            </div>

            <div className="space-y-3">
              {/* DMARC record missing */}
              <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 leading-tight">DMARC record missing</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      Gmail and Yahoo require it for bulk mail
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/domains')}
                  className="px-3 py-1 bg-white hover:bg-rose-50 text-gray-800 border border-gray-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Fix
                </button>
              </div>

              {/* November newsletter paused */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 leading-tight">November newsletter paused</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      774 people still waiting
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => resumeCampaign('november-newsletter')}
                  className="px-3 py-1 bg-white hover:bg-amber-50 text-gray-800 border border-gray-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Resume
                </button>
              </div>

              {/* 1 spam complaint */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Flag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 leading-tight">1 spam complaint</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      Contact suppressed automatically
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/contacts')}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            </div>
          </div>

          {/* Deliverability Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Deliverability</h2>
                <p className="text-xs text-gray-400 font-medium">What inbox providers check</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Good
              </span>
            </div>

            {/* 3 Status Pills */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-[11px] font-bold text-gray-700">SPF</p>
                <p className="text-xs font-extrabold text-emerald-700 mt-0.5">✓ Pass</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-[11px] font-bold text-gray-700">DKIM</p>
                <p className="text-xs font-extrabold text-emerald-700 mt-0.5">✓ Pass</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <p className="text-[11px] font-bold text-gray-700">DMARC</p>
                <p className="text-xs font-extrabold text-rose-600 mt-0.5">! Missing</p>
              </div>
            </div>

            {/* Complaint Rate */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Complaint rate</span>
                <span className="font-bold text-gray-900">0.06% of 0.3%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[20%]" />
              </div>
            </div>

            {/* Bounce Rate */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>Bounce rate</span>
                <span className="font-bold text-gray-900">2.3% of 5%</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-[46%]" />
              </div>
            </div>

            {/* Guarantee Pill */}
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 rounded-2xl text-xs font-bold text-emerald-800 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>One-click unsubscribe on every email</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
