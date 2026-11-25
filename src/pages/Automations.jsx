import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Plus, 
  Clock, 
  GitBranch, 
  Mail, 
  Check, 
  Sparkles, 
  ArrowDown, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Automations() {
  const navigate = useNavigate();
  const { automations, toggleAutomation } = useApp();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Automations</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Emails that send themselves when something happens
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <span className="text-rose-500 font-bold">⚡</span>
            <span>1 running</span>
          </span>

          <button
            onClick={() => alert('New automation wizard')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New automation</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Your Automations List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Your automations</h2>

            <div className="space-y-2.5">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-between gap-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                      ⚡
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 leading-tight">{auto.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{auto.trigger}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAutomation(auto.id)}
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      auto.active ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${auto.active ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Start from an idea */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Start from an idea</h2>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xs shrink-0 font-bold">
                    👥
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">
                      Auto-dispatch template by group
                    </span>
                    <span className="text-[10.5px] text-gray-400">
                      Send different template to each group via Amazon SES
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Loaded template: Group-specific automatic dispatch')}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl transition-colors"
                >
                  Use
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xs shrink-0">
                    🧹
                  </div>
                  <span className="font-bold text-xs text-gray-900">Clean your list automatically</span>
                </div>
                <button
                  onClick={() => alert('Loaded template: Clean your list')}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl transition-colors"
                >
                  Use
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xs shrink-0">
                    ⏱️
                  </div>
                  <span className="font-bold text-xs text-gray-900 leading-snug">
                    Remind people who clicked but didn’t buy
                  </span>
                </div>
                <button
                  onClick={() => alert('Loaded template: Abandoned click')}
                  className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl transition-colors"
                >
                  Use
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Automation Workflow Builder (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex items-start justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Welcome series</h2>
              <p className="text-xs text-gray-400 mt-0.5">Running since 14 Nov</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ On
            </span>
          </div>

          {/* Top 3 Quick Counters */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500">Started</span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">38</p>
              <span className="text-[10px] text-gray-400">people</span>
            </div>

            <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500">Opened welcome</span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">71%</p>
              <span className="text-[10px] text-gray-400">27 people</span>
            </div>

            <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
              <span className="text-[11px] font-medium text-gray-500">In progress</span>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">9</p>
              <span className="text-[10px] text-gray-400">waiting for step 3</span>
            </div>
          </div>

          {/* Workflow Chain Nodes */}
          <div className="space-y-3 pt-2">
            {/* Node 1: Trigger */}
            <div className="p-4 rounded-2xl bg-black text-white flex items-center gap-3.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">When</span>
                <p className="font-bold text-sm text-white">Someone joins Newsletter</p>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-4 bg-gray-200" />
            </div>

            {/* Node 2: Send right away */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10.5px] text-gray-400 font-semibold block">Send right away</span>
                  <p className="font-bold text-xs text-gray-900">Welcome to Acme</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/templates')}
                className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl"
              >
                Edit
              </button>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-4 bg-gray-200" />
            </div>

            {/* Node 3: Wait 3 days */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-gray-900">Wait 3 days</span>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-4 bg-gray-200" />
            </div>

            {/* Node 4: Only if */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10.5px] text-purple-700 font-semibold block">Only if</span>
                <p className="font-bold text-xs text-purple-950">They didn’t click the welcome email</p>
              </div>
            </div>

            {/* Connector */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-4 bg-gray-200" />
            </div>

            {/* Node 5: Send step */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10.5px] text-gray-400 font-semibold block">Send</span>
                  <p className="font-bold text-xs text-gray-900">3 tips to get started</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/templates')}
                className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl"
              >
                Edit
              </button>
            </div>

            {/* Add Step Button */}
            <button
              onClick={() => alert('Add automation action / delay / rule')}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add step</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400 font-medium pt-2 text-center">
            People who unsubscribe or complain leave the automation straight away.
          </p>
        </div>
      </div>
    </div>
  );
}
