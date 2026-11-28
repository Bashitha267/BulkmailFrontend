import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { publicApi } from '../services/api';

const REASONS = [
  ['too_many', 'Too many emails'],
  ['not_relevant', 'Not relevant to me'],
  ['never_signed_up', 'I never signed up'],
];

export default function Unsubscribed() {
  const [params] = useSearchParams();
  const token = params.get('t') || '';

  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const [reason, setReason] = useState('too_many');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Opening the link from the email unsubscribes this person.
  useEffect(() => {
    if (!token) {
      setError('This link isn’t valid any more.');
      return;
    }
    publicApi.unsubscribe(token).then(setInfo).catch((e) => setError(e.message));
  }, [token]);

  const resubscribed = info?.status === 'Subscribed';

  const toggle = async () => {
    setBusy(true);
    try {
      setInfo(resubscribed ? await publicApi.unsubscribe(token) : await publicApi.resubscribe(token));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const sendFeedback = async (e) => {
    e.preventDefault();
    try {
      await publicApi.feedback(token, reason);
      setFeedbackSent(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !info) {
    return (
      <div className="w-full max-w-md mx-auto my-6 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center text-sm text-gray-700">
        {error}
      </div>
    );
  }
  if (!info) {
    return <div className="text-xs text-gray-500 font-semibold">Loading…</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Check className="w-7 h-7 stroke-[2.5]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {resubscribed ? 'You’re resubscribed!' : 'You’re unsubscribed'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed max-w-xs mx-auto">
            {resubscribed
              ? `You have been added back to ${info.teamName} updates.`
              : `${info.email} won’t get marketing emails from ${info.teamName} any more. You may still get receipts for orders you place.`}
          </p>
        </div>

        {info.status !== 'Complained' && info.status !== 'Bounced' && (
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs">
            <span className="text-gray-600 font-medium">{resubscribed ? 'Changed your mind?' : 'Unsubscribed by mistake?'}</span>
            <button
              type="button"
              disabled={busy}
              onClick={toggle}
              className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-900 font-bold border border-gray-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            >
              {resubscribed ? 'Unsubscribe again' : 'Resubscribe'}
            </button>
          </div>
        )}

        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

        {!resubscribed &&
          (!feedbackSent ? (
            <div className="text-left border border-gray-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFeedback(!showFeedback)}
                className="w-full p-3.5 bg-gray-50/70 hover:bg-gray-100/70 flex items-center justify-between text-xs font-bold text-gray-800 transition-colors"
              >
                <span>Tell us why (optional)</span>
                {showFeedback ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              {showFeedback && (
                <form onSubmit={sendFeedback} className="p-4 space-y-3 bg-white text-xs">
                  {REASONS.map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="radio" name="unsubReason" checked={reason === key} onChange={() => setReason(key)} className="accent-black text-black w-4 h-4" />
                      <span className="font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                  <button type="submit" className="mt-2 w-full py-2 bg-black text-white hover:bg-zinc-800 rounded-xl font-bold transition-colors shadow-2xs">
                    Send
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold">
              ✓ Thank you for your feedback!
            </div>
          ))}

        {info.address && <p className="text-[11px] text-gray-400">{info.teamName} · {info.address}</p>}
      </div>
    </div>
  );
}
