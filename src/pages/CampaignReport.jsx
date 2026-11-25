import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  Copy, 
  XOctagon, 
  Link as LinkIcon, 
  AlertCircle, 
  RotateCw, 
  Eye, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CampaignReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { resumeCampaign } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/campaigns')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">November newsletter</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                Paused
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Our monthly update, &#123;&#123;firstName&#125;&#125; · Newsletter · 942 people
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Canceling the rest...')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-gray-200 transition-colors shadow-2xs"
          >
            Cancel the rest
          </button>
          <button
            onClick={() => alert('Duplicated campaign')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              resumeCampaign('november-newsletter');
              alert('Campaign resumed!');
            }}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume sending</span>
          </button>
        </div>
      </div>

      {/* Main Paused Banner Card */}
      <div className="bg-[#fef9c3]/70 border border-[#fef08a] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0">
              <Pause className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Paused at 168 of 942</h2>
              <p className="text-xs text-gray-600 mt-1">
                By Admin at 5:12 pm · 774 people are waiting · nobody gets it twice when you resume
              </p>
            </div>
          </div>

          <span className="text-4xl font-extrabold text-amber-950">17.8%</span>
        </div>

        <div className="w-full bg-amber-200/80 h-3 rounded-full overflow-hidden mb-2">
          <div className="bg-amber-600 h-full rounded-full w-[17.8%]" />
        </div>
      </div>

      {/* 6 Metric KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Delivered</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">149</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Opened</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Bounced</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Failed</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-rose-500">Spam complaints</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">1</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Waiting</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">774</p>
        </div>
      </div>

      {/* 2 Column Layout: Left (Links + Problems) | Right (Activity + Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Link clicks */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Link clicks</h3>
                <p className="text-xs text-gray-400">Which links people tapped</p>
              </div>
              <span className="text-xs font-bold text-gray-500">0 clicks so far</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#fafafa] rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <p className="font-bold text-gray-900">Read the full update</p>
                    <p className="text-[11px] text-gray-400 font-mono">example.com/blog</p>
                  </div>
                </div>
                <span className="font-bold text-gray-700">0</span>
              </div>

              <div className="p-3 bg-[#fafafa] rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-400">👤</span>
                  <div>
                    <p className="font-bold text-gray-900">Unsubscribe</p>
                    <p className="text-[11px] text-gray-400">Footer and one-click header</p>
                  </div>
                </div>
                <span className="font-bold text-gray-700">0</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">Clicks usually build over the first 24 hours.</p>
          </div>

          {/* Problems */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Problems</h3>
              <button
                onClick={() => alert('Full recipient log modal')}
                className="text-xs font-semibold text-gray-600 hover:text-black"
              >
                Full recipient log
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Row 1 */}
              <div className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Dilan Silva</p>
                  <p className="text-[11px] text-gray-500 font-mono">dilan.silva1010@example.com</p>
                </div>
                <span className="text-rose-600 font-bold text-xs">! Marked as spam · suppressed</span>
                <button
                  onClick={() => navigate('/contacts/dilan-silva')}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  Profile
                </button>
              </div>

              {/* Row 2 */}
              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Olivia Rajapaksha</p>
                  <p className="text-[11px] text-gray-500 font-mono">olivia.rajapaksha240@sample.net</p>
                </div>
                <span className="text-gray-600 font-medium text-xs">Bounced · mailbox doesn’t exist</span>
                <button
                  onClick={() => navigate('/contacts/olivia-rajapaksha')}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  Profile
                </button>
              </div>

              {/* Row 3 */}
              <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Nimal Gunawardena</p>
                  <p className="text-[11px] text-gray-500 font-mono">nimal.gunawardena35@demo.org</p>
                </div>
                <span className="text-amber-800 font-bold text-xs">! Failed · rejected after 3 tries</span>
                <button
                  onClick={() => alert('Retrying send to Nimal Gunawardena...')}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  Retry
                </button>
              </div>

              {/* Row 4 */}
              <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Tharindu Wilson</p>
                  <p className="text-[11px] text-gray-500 font-mono">tharindu.wilson82@sample.net</p>
                </div>
                <span className="text-amber-800 font-bold text-xs">! Failed · rejected after 3 tries</span>
                <button
                  onClick={() => alert('Retrying send to Tharindu Wilson...')}
                  className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Activity feed */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Activity</h3>

            <div className="space-y-4 pt-1 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Paused by Admin</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">5:12 pm</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Dilan Silva marked it as spam</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">5:11 pm · suppressed automatically</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">First opens</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">5:11 pm · 3 people</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">4 emails failed after 3 retries</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">5:10 pm</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Sending started</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">5:10 pm · 10 a second</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject and preview */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Subject and preview</h3>
            <div className="bg-[#fafafa] p-3.5 rounded-2xl border border-gray-100 text-xs space-y-1">
              <p className="font-bold text-gray-900">Our monthly update, Jane</p>
              <p className="text-gray-500">Here is what happened this month…</p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
            >
              View email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
