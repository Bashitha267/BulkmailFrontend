import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Users, 
  Sparkles, 
  X, 
  Check, 
  Filter, 
  Layers, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function Segments() {
  const navigate = useNavigate();
  const { groups, segments, setIsNewGroupModalOpen } = useApp();

  const [matchType, setMatchType] = useState('any'); // 'any' or 'all'
  const [conditions, setConditions] = useState([
    { id: 1, event: 'Opened any email', timeframe: 'in the last', duration: '30 days' },
    { id: 2, event: 'Clicked any link', timeframe: 'in the last', duration: '30 days' }
  ]);
  const [selectedSegment, setSelectedSegment] = useState('engaged-30');

  const removeCondition = (id) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now(), event: 'Opened any email', timeframe: 'in the last', duration: '7 days' }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Groups and segments</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Groups are lists you manage. Segments update themselves from rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewGroupModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            New group
          </button>
          <button
            onClick={() => alert('New segment creator')}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New segment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar matching contacts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => navigate('/contacts')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        >
          All · 1,200
        </button>
        <button
          onClick={() => navigate('/contacts')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        >
          Can receive · 1,129
        </button>
        <button
          onClick={() => navigate('/contacts')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        >
          Unsubscribed · 41
        </button>
        <button
          onClick={() => navigate('/contacts')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        >
          Bounced · 29
        </button>
        <button
          onClick={() => navigate('/contacts')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
        >
          Complained · 1
        </button>
        <button
          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-black text-white shadow-sm flex items-center gap-1"
        >
          <span>Groups &amp; segments · 7</span>
        </button>
      </div>

      {/* 2-Column Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Groups + Segments List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Groups (4) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-900">Groups</h2>
              <span className="text-xs font-bold text-gray-400">4</span>
            </div>

            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-3 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                      ✉️
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">{group.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {group.total.toLocaleString()} people · {group.canReceive.toLocaleString()} can receive
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/contacts')}
                    className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 rounded-xl transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Segments (Auto-updating) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-900">Segments</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                Auto-updating
              </span>
            </div>

            <div className="space-y-2">
              {/* Active editing segment */}
              <div 
                onClick={() => setSelectedSegment('engaged-30')}
                className="p-3.5 rounded-2xl bg-white border-2 border-black shadow-xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Filter className="w-4 h-4 text-gray-800" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">Engaged last 30 days</p>
                      <p className="text-xs text-gray-500">538 people · <span className="text-purple-700 font-semibold">editing</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other segments */}
              <div 
                onClick={() => setSelectedSegment('no-open-bf')}
                className="p-3 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="font-bold text-xs text-gray-900">Didn’t open Black Friday</p>
                    <p className="text-[11px] text-gray-500">298 people</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/campaigns/new');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-200 rounded-xl"
                >
                  Email them
                </button>
              </div>

              <div 
                onClick={() => setSelectedSegment('pro-colombo')}
                className="p-3 rounded-2xl bg-[#fafafa] hover:bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-bold text-xs text-gray-900">Pro plan in Colombo</p>
                    <p className="text-[11px] text-gray-500">86 people</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/campaigns/new');
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-800 text-[11px] font-bold border border-gray-200 rounded-xl"
                >
                  Email them
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Segment Rule Builder (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-400">Segment</span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">Engaged last 30 days</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-gray-900 leading-none">538</span>
              <p className="text-xs font-medium text-gray-500 mt-1">people match right now</p>
            </div>
          </div>

          {/* Any / All Toggle */}
          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <span>Include people who match</span>
            <div className="inline-flex rounded-xl bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setMatchType('any')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  matchType === 'any' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                any
              </button>
              <button
                type="button"
                onClick={() => setMatchType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  matchType === 'all' ? 'bg-black text-white shadow-2xs' : 'text-gray-600 hover:text-black'
                }`}
              >
                all
              </button>
            </div>
            <span>of these</span>
          </div>

          {/* Condition Rows */}
          <div className="space-y-2.5">
            {conditions.map((cond) => (
              <div key={cond.id} className="flex items-center gap-2 bg-[#fafafa] p-2.5 rounded-2xl border border-gray-100">
                <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 flex-1 focus:outline-none focus:border-black">
                  <option>{cond.event}</option>
                  <option>Clicked any link</option>
                  <option>Received specific campaign</option>
                </select>

                <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-black">
                  <option>{cond.timeframe}</option>
                  <option>more than</option>
                  <option>exactly</option>
                </select>

                <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-black">
                  <option>{cond.duration}</option>
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                </select>

                <button
                  type="button"
                  onClick={() => removeCondition(cond.id)}
                  className="p-2 hover:bg-gray-200/60 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCondition}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add condition</span>
            </button>
          </div>

          {/* And only if */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-700 mb-2">And only if</p>
            <div className="flex items-center gap-2 bg-[#fafafa] p-2.5 rounded-2xl border border-gray-100">
              <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 flex-1 focus:outline-none focus:border-black">
                <option>Status</option>
                <option>City</option>
                <option>Plan</option>
              </select>
              <span className="text-xs text-gray-500 font-medium px-1">is</span>
              <select className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 flex-1 focus:outline-none focus:border-black">
                <option>Can receive</option>
                <option>Subscribed</option>
              </select>
            </div>
          </div>

          {/* Available Filter Tags */}
          <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 block">You can filter on</span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['Opens', 'Clicks', 'A specific campaign', 'Group', 'Date added'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-2xs">
                  {tag}
                </span>
              ))}
              {['City', 'Plan', 'Last purchase'].map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-semibold shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-medium pt-1">
              Purple ones are your custom fields.
            </p>
          </div>

          {/* Live Preview & Actions */}
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              <b>Preview:</b> Ravi Herath, Sophia Smith, John Silva and 535 more
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => alert('Segment saved successfully!')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Save segment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
