import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  Check, 
  X, 
  Clock, 
  BarChart, 
  FileText, 
  CheckCircle2, 
  Mail, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CampaignEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { groups, segments, contacts, templates, setIsNewGroupModalOpen } = useApp();

  const [abTestEnabled, setAbTestEnabled] = useState(true);
  const [subjectA, setSubjectA] = useState('Our December update, {{firstName}}');
  const [subjectB, setSubjectB] = useState('December at Acme: 3 things you’ll like');
  const [previewText, setPreviewText] = useState('Our favourite updates from this year, plus what’s coming in 2027');
  
  const [fromName, setFromName] = useState('Acme Team');
  const [fromEmail, setFromEmail] = useState('news@acme.example.com');
  const [replyTo, setReplyTo] = useState('support@acme.example.com');

  const [selectedGroups, setSelectedGroups] = useState(['Newsletter', 'Customers']);
  const [selectedSegments, setSelectedSegments] = useState([]);
  
  // Multi-group template mapping: 'same' or 'custom_per_group'
  const [templateStrategy, setTemplateStrategy] = useState('same');
  const [selectedTemplateId, setSelectedTemplateId] = useState('monthly-newsletter');
  const [groupTemplateMap, setGroupTemplateMap] = useState({
    'Newsletter': 'Monthly newsletter',
    'Customers': 'Customer VIP promotion',
    'VIP': 'Customer VIP promotion',
    'Beta testers': 'Product launch announcement'
  });

  useEffect(() => {
    const paramTemplate = searchParams.get('template');
    if (paramTemplate && templates.some((t) => t.id === paramTemplate)) {
      setSelectedTemplateId(paramTemplate);
    }
  }, [searchParams, templates]);

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectSingleTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setSubjectA(tpl.subject);
      setPreviewText(tpl.previewText);
    }
  };

  const [sendSchedule, setSendSchedule] = useState('schedule'); // 'now' or 'schedule'
  const [scheduleDate, setScheduleDate] = useState('Tue 1 Dec 2026');
  const [scheduleTime, setScheduleTime] = useState('9:00 am');
  const [timeZone, setTimeZone] = useState('Colombo (UTC+5:30)');

  // Test email chips
  const [testEmails, setTestEmails] = useState(['admin@example.com', 'sanduni@acme.example.com']);
  const [newTestEmail, setNewTestEmail] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('Ravi Herath (real contact data)');

  const toggleGroup = (name) => {
    setSelectedGroups(prev => 
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
  };

  const toggleSegment = (name) => {
    setSelectedSegments(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const removeTestEmail = (email) => {
    setTestEmails(testEmails.filter(e => e !== email));
  };

  const addTestEmail = (e) => {
    if (e.key === 'Enter' && newTestEmail) {
      setTestEmails([...testEmails, newTestEmail]);
      setNewTestEmail('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/campaigns')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">December newsletter</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Draft · Autosaved 5:09 pm
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/campaigns')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Save and close
          </button>
          <button
            onClick={() => navigate(`/campaigns/${id || 'december-newsletter'}/review`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Review and send &gt;
          </button>
        </div>
      </div>

      {/* 2 Column Layout: Main Stepped Form | Right Side Preview & Test */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Sections 1-4 (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Inbox details */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-base text-gray-900">Inbox details</h2>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">Subject A</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">A/B test the subject</span>
                  <button
                    type="button"
                    onClick={() => setAbTestEnabled(!abTestEnabled)}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                      abTestEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${abTestEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={subjectA}
                onChange={(e) => setSubjectA(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              />
            </div>

            {abTestEnabled && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-gray-700">Subject B</label>
                <input
                  type="text"
                  value={subjectB}
                  onChange={(e) => setSubjectB(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />

                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-2.5 text-xs text-purple-900">
                  <BarChart className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    Send A and B to 20% of people. After 4 hours, the subject with more opens goes to everyone else.
                  </span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Preview text</label>
                <span className="text-[11px] text-gray-400">The grey line after the subject · {previewText.length} / 90</span>
              </div>
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">From name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">From email</label>
                <div className="relative">
                  <select
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black appearance-none pr-7"
                  >
                    <option>news@acme.example.com</option>
                    <option>hello@acme.example.com</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Replies go to</label>
                <input
                  type="text"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recipients */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-bold text-base text-gray-900">Recipients (Select Groups)</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsNewGroupModalOpen(true)}
                className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1 bg-gray-100 hover:bg-gray-200/80 px-2.5 py-1 rounded-xl transition-colors"
              >
                <span>+ Create group</span>
              </button>
            </div>

            {/* Groups Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500">Your Subscriber Groups ({selectedGroups.length} selected)</p>
                <span className="text-[11px] text-gray-400 font-medium">Select one or multiple groups</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'Newsletter', count: 942 },
                  { name: 'Customers', count: 487 },
                  { name: 'VIP', count: 63 },
                  { name: 'Beta testers', count: 87 }
                ].map((grp) => {
                  const isChecked = selectedGroups.includes(grp.name);
                  return (
                    <div
                      key={grp.name}
                      onClick={() => toggleGroup(grp.name)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked ? 'bg-black text-white border-black shadow-xs' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold">{grp.name}</span>
                      </div>
                      <span className={`text-xs font-medium ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {grp.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Segments Grid */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">Dynamic Segments (Optional)</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'Engaged last 30 days', count: 538 },
                  { name: 'Pro plan in Colombo', count: 86 }
                ].map((seg) => {
                  const isChecked = selectedSegments.includes(seg.name);
                  return (
                    <div
                      key={seg.name}
                      onClick={() => toggleSegment(seg.name)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked ? 'bg-black text-white border-black shadow-xs' : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-bold">{seg.name}</span>
                      </div>
                      <span className={`text-xs font-medium ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {seg.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total calculation indicator banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-emerald-900">
                  {selectedGroups.length > 1 ? '1,200 unique subscribers across selected groups' : '942 people will get this'}
                </span>
                <span className="text-xs text-emerald-800 font-medium">
                  58 skipped: unsubscribed, bounced or complained
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                ✓ Smart deduplication: Subscribers present in multiple groups will automatically receive only 1 email.
              </p>
            </div>
          </div>

          {/* Section 3: Content */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-bold text-base text-gray-900">Content &amp; Template Assignment</h2>
              </div>
            </div>

            {/* Template Strategy Switcher */}
            <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-200/80 space-y-2.5">
              <span className="text-xs font-bold text-gray-700 block">Dispatch Mode across Groups:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateStrategy('same')}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    templateStrategy === 'same'
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p>Same template for all groups</p>
                  <p className={`text-[10.5px] font-normal mt-0.5 ${templateStrategy === 'same' ? 'text-gray-300' : 'text-gray-400'}`}>
                    Single broadcast delivered to all selected groups
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateStrategy('custom_per_group')}
                  className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all ${
                    templateStrategy === 'custom_per_group'
                      ? 'bg-black text-white border-black shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p>Different template per group</p>
                  <p className={`text-[10.5px] font-normal mt-0.5 ${templateStrategy === 'custom_per_group' ? 'text-gray-300' : 'text-gray-400'}`}>
                    Automatically send tailored templates to each group
                  </p>
                </button>
              </div>
            </div>

            {templateStrategy === 'same' ? (
              <div className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {activeTemplate?.icon || '📰'}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-gray-900">{activeTemplate?.name}</h3>
                      <p className="text-[11px] text-gray-500">
                        {activeTemplate?.category} · Edits here apply to this campaign broadcast
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/templates')}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 rounded-xl transition-colors shadow-2xs shrink-0"
                  >
                    Edit design
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Choose a saved template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectSingleTemplate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.icon} {tpl.name} ({tpl.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1 animate-in fade-in">
                <span className="text-xs font-bold text-gray-700 block">
                  Assign Template for Each Selected Group:
                </span>
                {selectedGroups.map((grpName) => (
                  <div key={grpName} className="p-3 rounded-2xl bg-[#fafafa] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-xs text-gray-900">{grpName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={groupTemplateMap[grpName] || templates[0].name}
                        onChange={(e) => setGroupTemplateMap({ ...groupTemplateMap, [grpName]: e.target.value })}
                        className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-black"
                      >
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.name}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => navigate('/templates')}
                        className="text-xs font-bold text-gray-600 hover:text-black underline px-1"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Plain-text versions created automatically for all groups</span>
              </div>
              <button 
                type="button"
                onClick={() => alert('Viewing plain-text version...')}
                className="underline hover:text-emerald-950 font-bold"
              >
                View
              </button>
            </div>
          </div>

          {/* Section 4: When */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h2 className="font-bold text-base text-gray-900">When</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setSendSchedule('now')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  sendSchedule === 'now' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sendSchedule === 'now' ? 'border-white' : 'border-gray-400'}`}>
                  {sendSchedule === 'now' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-bold">Send now</span>
              </div>

              <div 
                onClick={() => setSendSchedule('schedule')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  sendSchedule === 'schedule' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sendSchedule === 'schedule' ? 'border-white' : 'border-gray-400'}`}>
                  {sendSchedule === 'schedule' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-bold">Schedule</span>
              </div>
            </div>

            {sendSchedule === 'schedule' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date</label>
                  <input
                    type="text"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Time</label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Time zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  >
                    <option>Colombo (UTC+5:30)</option>
                    <option>UTC (UTC+0)</option>
                    <option>New York (UTC-5)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium">
              <span>⚡ <b>Amazon SES Automated Dispatch</b>: 10 emails/sec. 500 emails across your selected groups will finish automatically in ~50 seconds.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Send Test (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Preview Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="text-[11px] text-gray-400 space-y-0.5">
              <p className="font-mono text-gray-600">{fromName} &lt;{fromEmail}&gt;</p>
              <p className="font-bold text-gray-900 text-xs">
                {subjectA.replace(/\{\{\s*firstName\s*\}\}/gi, selectedPersona.split(' ')[0] || 'Jane')}
              </p>
              <p className="truncate">{previewText}</p>
            </div>

            {/* Email mock card */}
            <div className="bg-[#fafafa] rounded-2xl p-4 border border-gray-200/80 space-y-3 text-xs">
              <h3 className="font-bold text-sm text-gray-900">
                {(activeTemplate?.heading || 'Hello {{firstName}}').replace(
                  /\{\{\s*firstName\s*\}\}/gi,
                  selectedPersona.split(' ')[0] || 'Jane'
                )}
              </h3>
              <p className="text-gray-600 leading-relaxed text-[11.5px]">
                {activeTemplate?.body}
              </p>
              <button
                type="button"
                style={{ backgroundColor: activeTemplate?.ctaColor || '#111111' }}
                className="text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                {activeTemplate?.ctaLabel || 'Read the full update'}
              </button>
              <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-400 text-center">
                {fromName} · 45 Example Street, Colombo 03 · <span className="underline">Unsubscribe</span>
              </div>
            </div>
          </div>

          {/* Send a test card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Send a test</h3>
              <span className="text-[10px] text-gray-400">Last test 4:58 pm</span>
            </div>

            {/* Email chips */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-[#fafafa] border border-gray-200 rounded-xl min-h-[42px] items-center">
              {testEmails.map((email) => (
                <span
                  key={email}
                  className="bg-white border border-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono shadow-2xs"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => removeTestEmail(email)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="email"
                placeholder="Add email..."
                value={newTestEmail}
                onChange={(e) => setNewTestEmail(e.target.value)}
                onKeyDown={addTestEmail}
                className="bg-transparent text-xs p-1 focus:outline-none flex-1 min-w-[100px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Show it as if sent to</label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              >
                <option>Ravi Herath (real contact data)</option>
                <option>Sophia Smith (real contact data)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => alert(`Test email dispatched to ${testEmails.length} recipients!`)}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send test to {testEmails.length} people</span>
            </button>
          </div>

          {/* Primary Review and Send CTA */}
          <button
            type="button"
            onClick={() => navigate(`/campaigns/${id || 'december-newsletter'}/review`)}
            className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-md active:scale-[0.99]"
          >
            Review and send
          </button>
        </div>
      </div>
    </div>
  );
}
