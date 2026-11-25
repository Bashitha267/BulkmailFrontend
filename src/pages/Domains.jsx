import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  Plus, 
  Check, 
  Copy, 
  AlertCircle, 
  BarChart, 
  Info,
  CheckCircle2
} from 'lucide-react';

export default function Domains() {
  const navigate = useNavigate();
  const [copiedKey, setCopiedKey] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckAgain = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      alert('DNS checked. DMARC record is still propagating.');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">acme.example.com</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Sending domain · added 14 Nov · last checked 2 min ago
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckAgain}
            disabled={isChecking}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <RotateCw className={`w-3.5 h-3.5 text-gray-500 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check again</span>
          </button>
          <button
            onClick={() => alert('Add domain modal')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add domain</span>
          </button>
        </div>
      </div>

      {/* 2 of 3 Records Verified Banner */}
      <div className="p-4 rounded-3xl bg-[#fef9c3]/50 border border-[#fef08a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900">2 of 3 records verified</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Add the DMARC record below to finish. DNS changes can take up to an hour to show.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48 bg-amber-200/60 h-2.5 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full w-[66%]" />
          </div>
          <span className="text-[11.5px] font-semibold text-amber-900 whitespace-nowrap">
            SPF ✓ · DKIM ✓ · DMARC waiting
          </span>
        </div>
      </div>

      {/* Record 1: SPF */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h3 className="font-bold text-sm text-gray-900">SPF · says Amazon SES may send for you</h3>
              <p className="text-xs text-gray-500 mt-0.5">TXT record on the root of your domain</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Verified
          </span>
        </div>

        <div className="bg-[#fafafa] rounded-2xl p-3 border border-gray-100 text-xs font-medium">
          <div className="grid grid-cols-12 gap-3 text-gray-400 font-semibold mb-2 px-2">
            <span className="col-span-2">Type</span>
            <span className="col-span-3">Name</span>
            <span className="col-span-6">Value</span>
            <span className="col-span-1 text-right"></span>
          </div>
          <div className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-gray-200/60">
            <span className="col-span-2 font-mono text-gray-800 font-bold">TXT</span>
            <span className="col-span-3 font-mono text-gray-600 truncate">acme.example.com</span>
            <span className="col-span-6 font-mono text-gray-700 truncate">v=spf1 include:amazonses.com ~all</span>
            <div className="col-span-1 text-right">
              <button
                onClick={() => handleCopy('v=spf1 include:amazonses.com ~all', 'spf')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                title="Copy Value"
              >
                {copiedKey === 'spf' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Record 2: DKIM */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h3 className="font-bold text-sm text-gray-900">DKIM · signs every email so it can’t be forged</h3>
              <p className="text-xs text-gray-500 mt-0.5">3 CNAME records</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Verified
          </span>
        </div>

        <div className="bg-[#fafafa] rounded-2xl p-3 border border-gray-100 text-xs font-medium space-y-2">
          <div className="grid grid-cols-12 gap-3 text-gray-400 font-semibold mb-1 px-2">
            <span className="col-span-2">Type</span>
            <span className="col-span-3">Name</span>
            <span className="col-span-6">Points to</span>
            <span className="col-span-1 text-right"></span>
          </div>

          {[1, 2, 3].map((idx) => {
            const name = `k${idx}._domainkey`;
            const val = `k${idx}.dkim.amazonses.com`;
            return (
              <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-gray-200/60">
                <span className="col-span-2 font-mono text-gray-800 font-bold">CNAME</span>
                <span className="col-span-3 font-mono text-gray-600">{name}</span>
                <span className="col-span-6 font-mono text-gray-700 truncate">{val}</span>
                <div className="col-span-1 text-right">
                  <button
                    onClick={() => handleCopy(val, `dkim-${idx}`)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === `dkim-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Copy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record 3: DMARC */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h3 className="font-bold text-sm text-gray-900">DMARC · tells inboxes what to do with fakes</h3>
              <p className="text-xs text-gray-500 mt-0.5">Required by Gmail and Yahoo for anyone sending 5,000+ a day</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Not found yet
          </span>
        </div>

        <div className="bg-[#fafafa] rounded-2xl p-3 border border-gray-100 text-xs font-medium">
          <div className="grid grid-cols-12 gap-3 text-gray-400 font-semibold mb-2 px-2">
            <span className="col-span-2">Type</span>
            <span className="col-span-3">Name</span>
            <span className="col-span-6">Value</span>
            <span className="col-span-1 text-right"></span>
          </div>
          <div className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-gray-200/60">
            <span className="col-span-2 font-mono text-gray-800 font-bold">TXT</span>
            <span className="col-span-3 font-mono text-gray-600">_dmarc</span>
            <span className="col-span-6 font-mono text-gray-700 truncate">
              v=DMARC1; p=none; rua=mailto:dmarc@acme.example.com
            </span>
            <div className="col-span-1 text-right">
              <button
                onClick={() => handleCopy('v=DMARC1; p=none; rua=mailto:dmarc@acme.example.com', 'dmarc')}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 font-bold text-xs inline-flex items-center gap-1 transition-colors"
              >
                {copiedKey === 'dmarc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <b>Start with p=none</b> to watch reports without blocking anything. Once reports look clean for a few weeks, move to <b>p=quarantine</b>.
          </p>
        </div>
      </div>

      {/* Warm-up Plan Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <BarChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Warm-up plan</h3>
              <p className="text-xs text-gray-500 mt-0.5">New domains build trust by growing volume slowly</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            Day 6 of 14
          </span>
        </div>

        {/* 7 Day Blocks (Responsive for mobile) */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
          {[
            { label: 'Day 1', val: '50' },
            { label: 'Day 2', val: '100' },
            { label: 'Day 3', val: '200' },
            { label: 'Day 4', val: '400' },
            { label: 'Day 5', val: '600' },
            { label: 'Today', val: '1,000', isToday: true },
            { label: 'Day 7', val: '1,500' },
          ].map((item, index) => (
            <div
              key={index}
              className={`p-2.5 sm:p-3 rounded-2xl text-center border transition-all ${
                item.isToday
                  ? 'bg-black text-white border-black shadow-sm scale-102 sm:scale-105 col-span-2 sm:col-span-1'
                  : 'bg-emerald-50/40 border-emerald-100 text-gray-800'
              }`}
            >
              <p className={`text-[10px] sm:text-[11px] font-semibold ${item.isToday ? 'text-zinc-300' : 'text-gray-500'}`}>
                {item.label}
              </p>
              <p className={`text-sm sm:text-base font-extrabold mt-0.5 ${item.isToday ? 'text-white' : 'text-gray-900'}`}>
                {item.val}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 font-medium">
          Today’s limit is 1,000 emails. The paused campaign’s remaining 774 fit inside it.
        </p>
      </div>
    </div>
  );
}
