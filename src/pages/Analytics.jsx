import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Eye, 
  MousePointer, 
  RotateCcw, 
  Flag, 
  UserX, 
  Download, 
  AlertTriangle, 
  BarChart3,
  ExternalLink
} from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30 days');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            All campaigns · 23 Oct to 20 Nov
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-0.5 border border-gray-200/60">
            {['7 days', '30 days', '90 days'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Downloading CSV report...')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">96.7%</p>
          <p className="text-[11px] text-gray-400 mt-1">1,707 of 1,765</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Opened</span>
            <Eye className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">39.5%</p>
          <p className="text-[11px] text-gray-400 mt-1">674 opens</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Clicked</span>
            <MousePointer className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">9.8%</p>
          <p className="text-[11px] text-gray-400 mt-1">168 clicks</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Bounced</span>
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2.3%</p>
          <p className="text-[11px] text-gray-400 mt-1">40 · keep under 5%</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Spam complaints</span>
            <Flag className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">0.06%</p>
          <p className="text-[11px] text-gray-400 mt-1">1 · keep under 0.3%</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Unsubscribed</span>
            <UserX className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2.4%</p>
          <p className="text-[11px] text-gray-400 mt-1">41 people</p>
        </div>
      </div>

      {/* Middle Row: Sent Bar Chart + Where Mail Lands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Emails sent per send day (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Emails sent per send day</h2>
            <p className="text-xs text-gray-400">Accepted by Amazon SES</p>
          </div>

          <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4 pb-2 border-b border-gray-100">
            {/* 23 Oct */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-gray-800">986</span>
              <div className="w-full max-w-[56px] bg-[#fed7aa] hover:bg-[#fdba74] rounded-t-xl transition-all h-[95%]" />
              <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">23 Oct</span>
            </div>

            {/* 8 Nov */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-gray-800">517</span>
              <div className="w-full max-w-[56px] bg-[#e9d5ff] hover:bg-[#d8b4fe] rounded-t-xl transition-all h-[52%]" />
              <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">8 Nov</span>
            </div>

            {/* 16 Nov */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-gray-800">94</span>
              <div className="w-full max-w-[56px] bg-[#a7f3d0] hover:bg-[#6ee7b7] rounded-t-xl transition-all h-[12%]" />
              <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">16 Nov</span>
            </div>

            {/* 20 Nov · paused */}
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-xs font-bold text-amber-900">168</span>
              <div className="w-full max-w-[56px] bg-[#fef08a] hover:bg-[#fde047] rounded-t-xl transition-all h-[18%]" />
              <span className="text-[11px] font-medium text-amber-800 whitespace-nowrap">20 Nov · paused</span>
            </div>
          </div>
        </div>

        {/* Where your mail lands (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Where your mail lands</h2>
            <p className="text-xs text-gray-400">Delivered emails by inbox provider</p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Gmail */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800">Gmail</span>
                <span className="text-gray-500">912 · 41.2% opened</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[54%]" />
              </div>
            </div>

            {/* Other providers */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800">Other providers</span>
                <span className="text-gray-500">268 · 37.7% opened</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full w-[26%]" />
              </div>
            </div>

            {/* Yahoo */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800">Yahoo</span>
                <span className="text-gray-500">286 · 36.0% opened</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full w-[28%]" />
              </div>
            </div>

            {/* Outlook */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-800">Outlook</span>
                <span className="text-gray-500">241 · 38.6% opened</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full w-[24%]" />
              </div>
            </div>
          </div>

          {/* DMARC Callout */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                !
              </span>
              <p className="text-amber-900 leading-snug">
                Over half your list uses Gmail. Adding DMARC protects this the most.
              </p>
            </div>
            <button
              onClick={() => navigate('/domains')}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-gray-200 text-gray-800 font-bold rounded-lg shrink-0 shadow-2xs"
            >
              Fix
            </button>
          </div>
        </div>
      </div>

      {/* Top Links Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Top links</h2>
          <p className="text-xs text-gray-400">What people clicked across all campaigns</p>
        </div>

        <div className="space-y-3">
          {/* Link 1 */}
          <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-xs text-gray-900 leading-tight">Read the full update</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">example.com/blog · October newsletter</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-sm justify-end">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                <div className="bg-blue-600 h-full rounded-full w-[85%]" />
              </div>
              <span className="text-sm font-extrabold text-gray-900 w-8 text-right">104</span>
            </div>
          </div>

          {/* Link 2 */}
          <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-xs text-gray-900 leading-tight">Shop now</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">example.com/shop?code=SAVE20 · Black Friday</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-sm justify-end">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                <div className="bg-purple-600 h-full rounded-full w-[45%]" />
              </div>
              <span className="text-sm font-extrabold text-gray-900 w-8 text-right">53</span>
            </div>
          </div>

          {/* Link 3 */}
          <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-xs text-gray-900 leading-tight">See what’s new</p>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">example.com/dashboard · Dashboard launch</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-sm justify-end">
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                <div className="bg-emerald-600 h-full rounded-full w-[15%]" />
              </div>
              <span className="text-sm font-extrabold text-gray-900 w-8 text-right">11</span>
            </div>
          </div>
        </div>
      </div>

      {/* By Campaign Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">By campaign</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] text-gray-400 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-3">Sent</th>
                <th className="py-3 px-3">Delivered</th>
                <th className="py-3 px-3">Opened</th>
                <th className="py-3 px-3">Clicked</th>
                <th className="py-3 px-3">Bounced</th>
                <th className="py-3 px-3">Complaints</th>
                <th className="py-3 px-4">Unsubscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              <tr className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">November newsletter</p>
                  <p className="text-[11px] text-gray-400">20 Nov · paused</p>
                </td>
                <td className="py-3 px-3">168</td>
                <td className="py-3 px-3">149</td>
                <td className="py-3 px-3">2.0%</td>
                <td className="py-3 px-3">0.0%</td>
                <td className="py-3 px-3">1</td>
                <td className="py-3 px-3 text-rose-600 font-bold">1</td>
                <td className="py-3 px-4">0</td>
              </tr>

              <tr className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">Dashboard launch</p>
                  <p className="text-[11px] text-gray-400">16 Nov</p>
                </td>
                <td className="py-3 px-3">94</td>
                <td className="py-3 px-3">93</td>
                <td className="py-3 px-3 font-semibold text-gray-900">44.1%</td>
                <td className="py-3 px-3 font-semibold text-gray-900">11.8%</td>
                <td className="py-3 px-3">1</td>
                <td className="py-3 px-3">0</td>
                <td className="py-3 px-4">4</td>
              </tr>

              <tr className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">Black Friday early access</p>
                  <p className="text-[11px] text-gray-400">8 Nov</p>
                </td>
                <td className="py-3 px-3">517</td>
                <td className="py-3 px-3">503</td>
                <td className="py-3 px-3 font-semibold text-gray-900">40.8%</td>
                <td className="py-3 px-3 font-semibold text-gray-900">10.3%</td>
                <td className="py-3 px-3">14</td>
                <td className="py-3 px-3">0</td>
                <td className="py-3 px-4">15</td>
              </tr>

              <tr className="hover:bg-gray-50/70 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">October newsletter</p>
                  <p className="text-[11px] text-gray-400">23 Oct</p>
                </td>
                <td className="py-3 px-3">986</td>
                <td className="py-3 px-3">962</td>
                <td className="py-3 px-3 font-semibold text-gray-900">43.7%</td>
                <td className="py-3 px-3 font-semibold text-gray-900">10.9%</td>
                <td className="py-3 px-3">24</td>
                <td className="py-3 px-3">0</td>
                <td className="py-3 px-4">22</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
