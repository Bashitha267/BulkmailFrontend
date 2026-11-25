import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronRight, Check } from 'lucide-react';

export default function Unsubscribed() {
  const navigate = useNavigate();

  const [resubscribed, setResubscribed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const [selectedReason, setSelectedReason] = useState('Too many emails');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSendFeedback = (e) => {
    e.preventDefault();
    setFeedbackSent(true);
  };

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-6">
        {/* Checkmark Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Check className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Title & Explanation */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {resubscribed ? 'You’re resubscribed!' : 'You’re unsubscribed'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed max-w-xs mx-auto">
            {resubscribed ? (
              'You have been successfully added back to Acme Team updates.'
            ) : (
              'r***@demo.org won’t get marketing emails from Acme Team any more. You may still get receipts for orders you place.'
            )}
          </p>
        </div>

        {/* Resubscribe Card */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-600 font-medium">Unsubscribed by mistake?</span>
          <button
            type="button"
            onClick={() => setResubscribed(!resubscribed)}
            className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-900 font-bold border border-gray-200 rounded-xl transition-colors shadow-2xs"
          >
            {resubscribed ? 'Unsubscribe again' : 'Resubscribe'}
          </button>
        </div>

        {/* Collapsible Feedback */}
        {!feedbackSent ? (
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
              <form onSubmit={handleSendFeedback} className="p-4 space-y-3 bg-white text-xs">
                {['Too many emails', 'Not relevant to me', 'I never signed up'].map((reason) => (
                  <label key={reason} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="unsubReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-black text-black w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">{reason}</span>
                  </label>
                ))}

                <button
                  type="submit"
                  className="mt-2 w-full py-2 bg-black text-white hover:bg-zinc-800 rounded-xl font-bold transition-colors shadow-2xs"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold">
            ✓ Thank you for your feedback!
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        Acme Team · 45 Example Street, Colombo 03, Sri Lanka
      </p>
    </div>
  );
}
