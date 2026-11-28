import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, MousePointer, RotateCcw, Flag, UserX, Download } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton } from '../components/Skeleton';

const RANGES = [
  [7, '7 days'],
  [30, '30 days'],
  [90, '90 days'],
  [365, '1 year'],
];
const BAR_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600', 'bg-rose-500'];

const pct = (n, digits = 1) => `${(Number(n || 0) * 100).toFixed(digits)}%`;
const num = (n) => Number(n || 0).toLocaleString();
const dayLabel = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '');

export default function Analytics() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    dashboardApi
      .analytics(days)
      .then((r) => alive && setData(r))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [days]);

  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data) {
    return <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 text-center text-xs text-rose-600">{error}</div>;
  }

  const t = data?.totals || {};
  const campaigns = data?.campaigns || [];
  const perDay = data?.perSendDay || [];
  const providers = data?.providers || [];
  const topLinks = data?.topLinks || [];
  const maxSent = Math.max(1, ...perDay.map((d) => d.sent));
  const maxDelivered = Math.max(1, ...providers.map((p) => p.delivered));
  const maxClicks = Math.max(1, ...topLinks.map((l) => l.clicks));
  const empty = !t.sent;
  const topProvider = providers[0];
  const totalDelivered = providers.reduce((s, p) => s + p.delivered, 0);

  const exportCsv = () => {
    const rows = [
      ['Campaign', 'Status', 'Date', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Complaints', 'Unsubscribed'],
      ...campaigns.map((c) => [
        c.title,
        c.status,
        c.startedAt || c.createdAt || '',
        c.stats.sent,
        c.stats.delivered,
        c.stats.opened,
        c.stats.clicked,
        c.stats.bounced,
        c.stats.complaints,
        c.stats.unsubscribed,
      ]),
    ];
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const blob = new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `analytics-${days}d.csv` });
    a.click();
    URL.revokeObjectURL(url);
    notify({ type: 'success', message: `Exported ${campaigns.length} campaigns.` });
  };

  const tiles = [
    { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', value: pct(t.deliveredRate), sub: `${num(t.delivered)} of ${num(t.sent)}` },
    { label: 'Opened', icon: Eye, color: 'text-purple-600', value: pct(t.openRate), sub: `${num(t.opened)} opens` },
    { label: 'Clicked', icon: MousePointer, color: 'text-blue-600', value: pct(t.clickRate), sub: `${num(t.clicked)} clicks` },
    { label: 'Bounced', icon: RotateCcw, color: 'text-amber-600', value: pct(t.bounceRate), sub: `${num(t.bounced)} · keep under 5%` },
    { label: 'Spam complaints', icon: Flag, color: 'text-rose-600', value: pct(t.complaintRate, 2), sub: `${num(t.complaints)} · keep under 0.3%` },
    { label: 'Unsubscribed', icon: UserX, color: 'text-amber-600', value: pct(t.unsubscribeRate), sub: `${num(data?.unsubscribedContacts)} people` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            All campaigns · last {days} days{loading ? ' · updating…' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-0.5 border border-gray-200/60">
            {RANGES.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${days === value ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            disabled={campaigns.length === 0}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 disabled:bg-gray-300 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {empty && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
          Nothing has been sent in this period yet. Numbers appear here after your first campaign goes out.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {tiles.map(({ label, icon: Icon, color, value, sub }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">{label}</span>
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Emails sent per send day</h2>
            <p className="text-xs text-gray-400">Accepted by the mail provider</p>
          </div>
          {perDay.length === 0 ? (
            <p className="text-xs text-gray-500 py-10 text-center">No sends in this period.</p>
          ) : (
            <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4 pb-2 border-b border-gray-100 overflow-x-auto">
              {perDay.map((d, i) => (
                <div key={d.id} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-xs font-bold text-gray-800">{num(d.sent)}</span>
                  <div
                    className="w-full max-w-[56px] rounded-t-xl bg-blue-300 hover:bg-blue-400 transition-all"
                    style={{ height: `${Math.max(3, (d.sent / maxSent) * 78)}%` }}
                    title={d.title}
                  />
                  <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                    {dayLabel(d.date)}
                    {d.status === 'Paused' ? ' · paused' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Where your mail lands</h2>
            <p className="text-xs text-gray-400">Delivered emails by inbox provider</p>
          </div>
          {providers.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No delivered emails in this period.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {providers.map((p, i) => (
                <div key={p.provider}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-gray-800">{p.provider}</span>
                    <span className="text-gray-500">{num(p.delivered)} · {pct(p.openRate)} opened</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`${BAR_COLORS[i % BAR_COLORS.length]} h-full rounded-full`} style={{ width: `${(p.delivered / maxDelivered) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {topProvider?.provider === 'Gmail' && totalDelivered > 0 && topProvider.delivered / totalDelivered > 0.5 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3 text-xs">
              <p className="text-amber-900 leading-snug">Over half your list uses Gmail. Passing SPF, DKIM and DMARC protects this the most.</p>
              <button onClick={() => navigate('/domains')} className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-gray-200 text-gray-800 font-bold rounded-lg shrink-0 shadow-2xs">
                Check
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Top links</h2>
          <p className="text-xs text-gray-400">What people clicked across all campaigns</p>
        </div>
        {topLinks.length === 0 ? (
          <p className="text-xs text-gray-500">No link clicks recorded yet. Click tracking must be on and the backend address must be public.</p>
        ) : (
          <div className="space-y-3">
            {topLinks.map((l, i) => (
              <div key={`${l.url}-${i}`} className="p-3.5 rounded-2xl bg-[#fafafa] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${i === 0 ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-gray-900 leading-tight truncate">{l.label || l.url}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">{l.url} · {l.campaign}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-sm justify-end">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div className={`${BAR_COLORS[i % BAR_COLORS.length]} h-full rounded-full`} style={{ width: `${(l.clicks / maxClicks) * 100}%` }} />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 w-10 text-right">{num(l.clicks)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 px-4 text-center text-gray-500">No campaigns sent in this period.</td>
                </tr>
              )}
              {campaigns.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/campaigns/${c.id}/report`)} className="hover:bg-gray-50/70 transition-colors cursor-pointer">
                  <td className="py-3 px-4">
                    <p className="font-bold text-gray-900">{c.title}</p>
                    <p className="text-[11px] text-gray-400">{dayLabel(c.startedAt || c.createdAt)} · {c.status.toLowerCase()}</p>
                  </td>
                  <td className="py-3 px-3">{num(c.stats.sent)}</td>
                  <td className="py-3 px-3">{num(c.stats.delivered)}</td>
                  <td className="py-3 px-3 font-semibold text-gray-900">{pct(c.rates.open)}</td>
                  <td className="py-3 px-3 font-semibold text-gray-900">{pct(c.rates.click)}</td>
                  <td className="py-3 px-3">{num(c.stats.bounced)}</td>
                  <td className={`py-3 px-3 ${c.stats.complaints ? 'text-rose-600 font-bold' : ''}`}>{num(c.stats.complaints)}</td>
                  <td className="py-3 px-4">{num(c.stats.unsubscribed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
