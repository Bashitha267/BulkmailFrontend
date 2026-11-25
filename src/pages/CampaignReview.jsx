import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  Mail, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Spinner } from '../components/Skeleton';

export default function CampaignReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { createCampaign, notify } = useApp();

  const draft = location.state?.campaignDraft || {
    title: 'December newsletter',
    subjectA: 'Our December update, {{firstName}}',
    subjectB: 'December at Acme: 3 things you’ll like',
    abTest: true,
    previewText: 'Our favourite updates from this year',
    fromName: 'Acme Team',
    fromEmail: 'news@acme.example.com',
    replyTo: 'support@acme.example.com',
    selectedGroups: ['Newsletter', 'Customers'],
    templateStrategy: 'same',
    selectedTemplateId: 'monthly-newsletter',
    sendSchedule: 'now',
    scheduledDate: 'Tue 1 Dec 2026, 9:00 am',
  };

  const [isCheckedConfirmation, setIsCheckedConfirmation] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!isCheckedConfirmation) {
      notify({ type: 'warning', message: 'Please confirm that you have checked the test email.' });
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCampaign(draft);
      navigate(`/campaigns/${created.id}/report`);
    } catch (err) {
      notify({ type: 'error', title: 'Could not launch campaign', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Ready to schedule?</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            December newsletter · last look before it goes out
          </p>
        </div>
      </div>

      {/* 3 Summary Black Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">To</p>
          <p className="text-2xl font-bold mt-0.5">942 people</p>
          <p className="text-xs text-zinc-400 mt-1">Newsletter group</p>
        </div>

        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">Goes out</p>
          <p className="text-2xl font-bold mt-0.5">Tue 1 Dec, 9:00 am</p>
          <p className="text-xs text-zinc-400 mt-1">Colombo time (UTC+5:30)</p>
        </div>

        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">From</p>
          <p className="text-2xl font-bold mt-0.5">Acme Team</p>
          <p className="text-xs text-zinc-400 font-mono mt-1 truncate">news@acme.example.com</p>
        </div>
      </div>

      {/* 2 Column Layout: Pre-send Checks (7 cols) | Subject Test & Confirmation (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pre-send checks */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="font-bold text-base text-gray-900">Pre-send checks</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✓ 8 passed
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                1 warning
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* 1. SPF and DKIM pass */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">SPF and DKIM pass</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Your domain is allowed to send through Amazon SES</p>
              </div>
            </div>

            {/* 2. DMARC record missing (Warning) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-950 leading-tight">DMARC record missing</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    You can still send, but Gmail may filter more of your mail
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/domains')}
                className="px-3 py-1 bg-white hover:bg-amber-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl transition-colors shrink-0 shadow-2xs"
              >
                Fix now
              </button>
            </div>

            {/* 3. One-click unsubscribe header added */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">One-click unsubscribe header added</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Gmail and Yahoo show an Unsubscribe button next to your name
                </p>
              </div>
            </div>

            {/* 4. Footer has business address */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">Footer has your business address</p>
                <p className="text-[11px] text-gray-500 mt-0.5">45 Example Street, Colombo 03</p>
              </div>
            </div>

            {/* 5. Plain-text version included */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">Plain-text version included</p>
              </div>
            </div>

            {/* 6. All 3 links work */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">All 3 links work</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Checked 5:09 pm</p>
              </div>
            </div>

            {/* 7. Test sent and opened */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">Test sent and opened</p>
                <p className="text-[11px] text-gray-500 mt-0.5">To 2 people at 4:58 pm</p>
              </div>
            </div>

            {/* 8. Within your daily sending limit */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">Within your daily sending limit</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Your warm-up plan ends 28 Nov, before this goes out</p>
              </div>
            </div>

            {/* 9. Unsubscribed, bounced and complained people removed */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  Unsubscribed, bounced and complained people removed
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">58 skipped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Subject test, Confirmation & Schedule CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Subject test summary card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900">Subject test</h3>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                A
              </span>
              <span>Our December update, Jane</span>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                B
              </span>
              <span>December at Acme: 3 things you’ll like</span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-medium pt-1">
              94 people get each version first. The winner goes to the other 754 at 1:00 pm.
            </p>
          </div>

          {/* Action Box */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-4">
            <div 
              onClick={() => setIsCheckedConfirmation(!isCheckedConfirmation)}
              className="flex items-start gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isCheckedConfirmation}
                onChange={() => {}}
                className="mt-0.5 rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-900 leading-snug">
                I’ve checked the test email and I’m ready for this to go to 942 people.
              </span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSchedule}
              className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99]"
            >
              {submitting ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : draft.sendSchedule === 'now' ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>
                {submitting
                  ? 'Queueing via Amazon SES...'
                  : draft.sendSchedule === 'now'
                  ? 'Send now via Amazon SES'
                  : `Schedule for ${draft.scheduledDate}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/campaigns/december-newsletter/edit')}
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 border border-gray-200 transition-colors shadow-2xs"
            >
              Back to editing
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              You can pause or cancel until it starts sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
