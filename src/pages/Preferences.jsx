import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { publicApi } from '../services/api';

export default function Preferences() {
  const [params] = useSearchParams();
  const token = params.get('t') || '';

  const [info, setInfo] = useState(null);
  const [topics, setTopics] = useState({});
  const [frequency, setFrequency] = useState('any');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const apply = (r) => {
    setInfo(r);
    setTopics(Object.fromEntries((r.topics || []).map((t) => [t.key, t.subscribed])));
    setFrequency(r.frequency || 'any');
  };

  useEffect(() => {
    if (!token) {
      setError('This link isn’t valid any more.');
      return;
    }
    publicApi.preferences(token).then(apply).catch((e) => setError(e.message));
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      apply(await publicApi.savePreferences(token, { topics, frequency }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error && !info) {
    return (
      <div className="w-full max-w-md mx-auto my-6 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center text-sm text-gray-700">
        {error}
      </div>
    );
  }
  if (!info) return <div className="text-xs text-gray-500 font-semibold">Loading…</div>;

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center">
            {(info.teamName || 'BM').slice(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-mono font-medium text-gray-400">{info.email}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-snug">What would you like from {info.teamName}?</h1>
          <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
            Pick what’s useful. You can change this any time from the link in our emails.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2.5">
            {info.topics.map((t) => {
              const on = Boolean(topics[t.key]);
              return (
                <div
                  key={t.key}
                  onClick={() => setTopics((p) => ({ ...p, [t.key]: !on }))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    on ? 'border-2 border-black bg-white shadow-2xs' : 'border-gray-200 bg-[#fafafa] hover:bg-gray-100/60'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${on ? 'bg-black border-black text-white' : 'border-gray-400'}`}>
                    {on && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-gray-900">{t.name}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <span className="text-xs text-gray-500 font-medium block mb-2">Or get less email</span>
            <div className="inline-flex rounded-2xl bg-gray-100 p-1 w-full">
              {[['any', 'As it happens'], ['monthly', 'Once a month at most']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFrequency(val)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${frequency === val ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {saved && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs text-center font-bold">✓ Preferences saved!</div>}
          {error && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs text-center font-bold">{error}</div>}

          <button type="submit" disabled={saving} className="w-full py-3.5 rounded-2xl bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save my choices'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to={`/unsubscribed?t=${encodeURIComponent(token)}`} className="text-xs font-bold text-rose-600 hover:text-rose-700 underline">
            Unsubscribe from everything
          </Link>
          <p className="text-[11px] text-gray-400 mt-0.5">Takes effect straight away</p>
        </div>
      </div>

      {info.address && <p className="text-center text-[11px] text-gray-400 mt-6">{info.teamName} · {info.address}</p>}
    </div>
  );
}
