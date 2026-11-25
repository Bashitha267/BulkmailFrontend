import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function Preferences() {
  const navigate = useNavigate();

  const [newsletter, setNewsletter] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [frequency, setFrequency] = useState('as_it_happens'); // 'as_it_happens' or 'monthly'
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-black text-white font-bold text-sm flex items-center justify-center">
            AT
          </div>
          <span className="text-xs font-mono font-medium text-gray-400">
            r***@demo.org
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-snug">
            What would you like from Acme Team?
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
            Pick what’s useful. You can change this any time from the link in our emails.
          </p>
        </div>

        {/* Choices List */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2.5">
            {/* Newsletter */}
            <div
              onClick={() => setNewsletter(!newsletter)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                newsletter ? 'border-2 border-black bg-white shadow-2xs' : 'border-gray-200 bg-[#fafafa] hover:bg-gray-100/60'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                newsletter ? 'bg-black border-black text-white' : 'border-gray-400'
              }`}>
                {newsletter && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Monthly newsletter</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Product news, once a month</p>
              </div>
            </div>

            {/* Promotions */}
            <div
              onClick={() => setPromotions(!promotions)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                promotions ? 'border-2 border-black bg-white shadow-2xs' : 'border-gray-200 bg-[#fafafa] hover:bg-gray-100/60'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                promotions ? 'bg-black border-black text-white' : 'border-gray-400'
              }`}>
                {promotions && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Offers and promotions</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">A few times a year, like Black Friday</p>
              </div>
            </div>

            {/* Account updates */}
            <div
              onClick={() => setOrderUpdates(!orderUpdates)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                orderUpdates ? 'border-2 border-black bg-white shadow-2xs' : 'border-gray-200 bg-[#fafafa] hover:bg-gray-100/60'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 ${
                orderUpdates ? 'bg-black border-black text-white' : 'border-gray-400'
              }`}>
                {orderUpdates && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div>
                <h3 className="font-bold text-xs text-gray-900">Account and order updates</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Receipts and important changes</p>
              </div>
            </div>
          </div>

          {/* Frequency Toggle */}
          <div className="pt-2">
            <span className="text-xs text-gray-500 font-medium block mb-2">Or get less email</span>
            <div className="inline-flex rounded-2xl bg-gray-100 p-1 w-full">
              <button
                type="button"
                onClick={() => setFrequency('as_it_happens')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  frequency === 'as_it_happens' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                As it happens
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  frequency === 'monthly' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                Once a month at most
              </button>
            </div>
          </div>

          {savedMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs text-center font-bold animate-in fade-in">
              ✓ Preferences saved!
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-md active:scale-[0.99]"
          >
            Save my choices
          </button>
        </form>

        {/* Unsubscribe Everything Option */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/unsubscribed')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Unsubscribe from everything
          </button>
          <p className="text-[11px] text-gray-400 mt-0.5">Takes effect straight away</p>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        Acme Team · 45 Example Street, Colombo 03, Sri Lanka
      </p>
    </div>
  );
}
