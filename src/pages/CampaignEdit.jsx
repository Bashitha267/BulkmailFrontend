import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  X,
  CheckCircle2,
  ChevronDown,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { campaignsApi } from '../services/api';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';

function renderBlockText(block) {
  if (!block) return '';
  return block.text ?? block.content ?? '';
}

function interpolateVars(str, contact) {
  if (!str) return '';
  const first = contact?.firstName || contact?.name?.split(' ')[0] || 'there';
  const last = contact?.lastName || contact?.name?.split(' ').slice(1).join(' ') || '';
  return str
    .replace(/\{\{\s*firstName\s*\}\}/gi, first)
    .replace(/\{\{\s*lastName\s*\}\}/gi, last)
    .replace(/\{\{\s*city\s*\}\}/gi, contact?.city || '')
    .replace(/\{\{\s*plan\s*\}\}/gi, contact?.plan || '');
}

export default function CampaignEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id && id !== 'new');

  const {
    user,
    groups,
    segments,
    contacts,
    templates,
    settings,
    dataLoading,
    loadWorkspace,
    setIsNewGroupModalOpen,
    summary,
    notify,
  } = useApp();

  const [loadingDraft, setLoadingDraft] = useState(isEditMode);
  const [draftId, setDraftId] = useState(isEditMode ? id : null);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [showPlainText, setShowPlainText] = useState(false);

  const [title, setTitle] = useState('');
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [subjectA, setSubjectA] = useState('');
  const [subjectB, setSubjectB] = useState('');
  const [previewText, setPreviewText] = useState('');

  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');

  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);

  const [templateStrategy, setTemplateStrategy] = useState('same');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [groupTemplateMap, setGroupTemplateMap] = useState({});

  const [sendMode, setSendMode] = useState('now');
  const [sendDate, setSendDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [sendTime, setSendTime] = useState('09:00');
  const [timezone, setTimezone] = useState('Asia/Colombo');

  const [testEmails, setTestEmails] = useState([]);
  const [newTestEmail, setNewTestEmail] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('');

  const [estimate, setEstimate] = useState({ count: 0, skipped: 0, total: 0 });
  const [estimating, setEstimating] = useState(false);

  // Initialize defaults from real backend settings / templates / user when creating a new campaign
  useEffect(() => {
    if (isEditMode) return;

    const defaultSender = settings.senders?.find((s) => s.isDefault) || settings.senders?.[0];
    if (!fromName) {
      setFromName(settings.general?.fromName || settings.general?.teamName || user?.teamName || '');
    }
    if (!fromEmail && defaultSender?.email) {
      setFromEmail(defaultSender.email);
    }
    if (!replyTo) {
      setReplyTo(settings.general?.replyTo || defaultSender?.email || '');
    }
    if (testEmails.length === 0 && user?.email) {
      setTestEmails([user.email]);
    }
  }, [isEditMode, settings, user]);

  // Pre-select template from ?template= query param or first available template
  useEffect(() => {
    if (isEditMode || templates.length === 0) return;
    const paramTpl = searchParams.get('template');
    const chosen =
      (paramTpl && templates.find((t) => t.id === paramTpl)) ||
      (!selectedTemplateId ? templates[0] : null);

    if (chosen) {
      setSelectedTemplateId(chosen.id);
      if (!subjectA) setSubjectA(chosen.subject || '');
      if (!previewText) setPreviewText(chosen.previewText || '');
      if (!title) setTitle(chosen.name || '');
    }
  }, [isEditMode, searchParams, templates]);

  // Default first persona contact for live preview
  useEffect(() => {
    if (!selectedContactId && contacts.length > 0) {
      setSelectedContactId(contacts[0].id);
    }
  }, [contacts, selectedContactId]);

  // Load existing campaign draft if editing
  useEffect(() => {
    if (!isEditMode) return;
    let active = true;
    setLoadingDraft(true);
    campaignsApi
      .get(id)
      .then((res) => {
        if (!active || !res?.campaign) return;
        const c = res.campaign;
        setDraftId(c.id);
        setTitle(c.title || '');
        setSubjectA(c.subjectA || '');
        setSubjectB(c.subjectB || '');
        setAbTestEnabled(Boolean(c.abTest));
        setPreviewText(c.previewText || '');
        setFromName(c.fromName || '');
        setFromEmail(c.fromEmail || '');
        setReplyTo(c.replyTo || '');
        setSelectedGroupIds(Array.isArray(c.groupIds) ? c.groupIds : []);
        setSelectedSegmentIds(Array.isArray(c.segmentIds) ? c.segmentIds : []);
        if (c.templateId) setSelectedTemplateId(c.templateId);
        setSendMode(c.sendMode === 'schedule' ? 'schedule' : 'now');
        if (c.timezone) setTimezone(c.timezone);
        if (c.sendAt) {
          const d = new Date(c.sendAt);
          if (!Number.isNaN(d.getTime())) {
            setSendDate(d.toISOString().slice(0, 10));
            setSendTime(d.toTimeString().slice(0, 5));
          }
        }
      })
      .catch((err) => {
        notify({ type: 'error', title: 'Could not load campaign', message: err.message });
      })
      .finally(() => {
        if (active) setLoadingDraft(false);
      });

    return () => {
      active = false;
    };
  }, [id, isEditMode, notify]);

  // Live backend audience estimate whenever selected groups or segments change
  useEffect(() => {
    if (selectedGroupIds.length === 0 && selectedSegmentIds.length === 0) {
      setEstimate({ count: 0, skipped: 0, total: 0 });
      return;
    }

    let active = true;
    setEstimating(true);
    campaignsApi
      .estimate({ groupIds: selectedGroupIds, segmentIds: selectedSegmentIds })
      .then((res) => {
        if (active) {
          setEstimate({
            count: res.count || 0,
            skipped: res.skipped || 0,
            total: res.total || 0,
          });
        }
      })
      .catch(() => {
        // Fallback count from loaded group totals
      })
      .finally(() => {
        if (active) setEstimating(false);
      });

    return () => {
      active = false;
    };
  }, [selectedGroupIds, selectedSegmentIds]);

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || templates[0] || null,
    [templates, selectedTemplateId]
  );

  const previewContact = useMemo(
    () => contacts.find((c) => c.id === selectedContactId) || contacts[0] || null,
    [contacts, selectedContactId]
  );

  if ((dataLoading && templates.length === 0) || loadingDraft) {
    return <DashboardSkeleton />;
  }

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const toggleSegment = (segId) => {
    setSelectedSegmentIds((prev) =>
      prev.includes(segId) ? prev.filter((s) => s !== segId) : [...prev, segId]
    );
  };

  const handleSelectSingleTemplate = (tplId) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      if (tpl.subject) setSubjectA(tpl.subject);
      if (tpl.previewText) setPreviewText(tpl.previewText);
      if (!title.trim()) setTitle(tpl.name);
    }
  };

  const removeTestEmail = (email) => {
    setTestEmails((prev) => prev.filter((e) => e !== email));
  };

  const addTestEmail = (e) => {
    if (e.key === 'Enter' && newTestEmail.trim()) {
      e.preventDefault();
      const email = newTestEmail.trim();
      if (!testEmails.includes(email)) {
        setTestEmails((prev) => [...prev, email]);
      }
      setNewTestEmail('');
    }
  };

  const buildPayload = (override = {}) => ({
    title: title.trim() || subjectA.replace(/\{\{\s*firstName\s*\}\}/gi, '').trim() || 'Untitled campaign',
    subjectA,
    subjectB: abTestEnabled ? subjectB : '',
    abTest: abTestEnabled,
    previewText,
    fromName,
    fromEmail,
    replyTo,
    groupIds: selectedGroupIds,
    segmentIds: selectedSegmentIds,
    templateId: activeTemplate?.id || null,
    sendMode,
    timezone,
    ...(sendMode === 'schedule' ? { sendDate, sendTime } : {}),
    ...override,
  });

  const saveDraftToBackend = async () => {
    const payload = buildPayload();
    if (draftId) {
      const res = await campaignsApi.update(draftId, payload);
      return res.campaign;
    }
    const res = await campaignsApi.create(payload);
    setDraftId(res.campaign.id);
    return res.campaign;
  };

  const handleSaveAndClose = async () => {
    if (templateStrategy === 'custom_per_group') {
      notify({ type: 'info', message: 'Multi-group per-template batches are created when you click Review and send.' });
      navigate('/campaigns');
      return;
    }
    setSaving(true);
    try {
      await saveDraftToBackend();
      await loadWorkspace();
      notify({ type: 'success', message: 'Campaign draft saved.' });
      navigate('/campaigns');
    } catch (err) {
      notify({ type: 'error', title: 'Could not save draft', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    const pendingEmail = newTestEmail.trim();
    const list = pendingEmail && !testEmails.includes(pendingEmail) ? [...testEmails, pendingEmail] : testEmails;
    if (list.length === 0) {
      notify({ type: 'warning', message: 'Add at least one test email address.' });
      return;
    }
    if (pendingEmail) {
      setTestEmails(list);
      setNewTestEmail('');
    }

    setSendingTest(true);
    try {
      const saved = await saveDraftToBackend();
      const res = await campaignsApi.sendTest(saved.id, list, previewContact?.id);
      notify({
        type: 'success',
        title: 'Test email sent',
        message: `Sent to ${res.sent || list.length} recipient(s)${res.simulated ? ' (Simulation mode)' : ' via Amazon SES'}.`,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Test send failed', message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  const handleReviewAndSend = async () => {
    if (selectedGroupIds.length === 0 && selectedSegmentIds.length === 0) {
      notify({ type: 'warning', message: 'Select at least one group or segment.' });
      return;
    }
    if (!subjectA.trim()) {
      notify({ type: 'warning', message: 'Enter a subject line before continuing.' });
      return;
    }

    if (templateStrategy === 'custom_per_group') {
      if (selectedGroupIds.length === 0) {
        notify({ type: 'warning', message: 'Select at least one group for per-group templates.' });
        return;
      }
      const groupAssignments = selectedGroupIds.map((gid) => {
        const grp = groups.find((g) => g.id === gid);
        const tplId = groupTemplateMap[gid] || activeTemplate?.id || templates[0]?.id;
        const tpl = templates.find((t) => t.id === tplId) || activeTemplate;
        return {
          groupId: gid,
          groupName: grp?.name || gid,
          canReceive: grp?.canReceive ?? grp?.total ?? 0,
          templateId: tpl?.id,
          templateName: tpl?.name || 'Template',
          subject: tpl?.subject || subjectA,
          previewText: tpl?.previewText || previewText,
        };
      });

      navigate('/campaigns/batch/review', {
        state: {
          batchPlan: {
            ...buildPayload(),
            groupAssignments,
            estimatedCount: estimate.count,
            estimatedSkipped: estimate.skipped,
          },
        },
      });
      return;
    }

    setSaving(true);
    try {
      const saved = await saveDraftToBackend();
      await loadWorkspace();
      navigate(`/campaigns/${saved.id}/review`);
    } catch (err) {
      notify({ type: 'error', title: 'Could not save campaign', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const previewBlocks = activeTemplate?.blocks || [];
  const plainTextVersion = previewBlocks
    .map((b) => {
      if (b.type === 'heading' || b.type === 'text') return interpolateVars(renderBlockText(b), previewContact);
      if (b.type === 'button') return `${b.label}: ${b.url}`;
      if (b.type === 'columns') return `${b.left || ''}\n${b.right || ''}`;
      if (b.type === 'divider') return '---';
      return '';
    })
    .filter(Boolean)
    .join('\n\n');

  const sendRate = Number(settings.ses?.sendRate) || 10;
  const estSeconds = estimate.count > 0 ? Math.max(1, Math.ceil(estimate.count / sendRate)) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate('/campaigns')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="text"
              placeholder="Campaign name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 w-full max-w-md"
            />
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {draftId ? 'Draft saved in database' : 'New campaign draft'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveAndClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            {saving ? <Spinner className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save and close</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleReviewAndSend}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Review and send &gt;
          </button>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Sections 1-4 (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Inbox details */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-base text-gray-900">Inbox details</h2>
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
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        abTestEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Write a clear subject line (supports {{firstName}})"
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
                  placeholder="Alternative subject line to test"
                  value={subjectB}
                  onChange={(e) => setSubjectB(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900">
                  Send A and B to 20% of people. After 4 hours, the subject with more opens goes to everyone else.
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Preview text</label>
                <span className="text-[11px] text-gray-400">
                  The grey line after the subject · {previewText.length} / 90
                </span>
              </div>
              <input
                type="text"
                placeholder="Short summary shown in inbox"
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
                  placeholder="Sender name"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">From email</label>
                {settings.senders && settings.senders.length > 0 ? (
                  <div className="relative">
                    <select
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black appearance-none pr-7"
                    >
                      {settings.senders.map((s) => (
                        <option key={s.email} value={s.email}>
                          {s.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="email"
                    placeholder="sender@yourdomain.com"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Replies go to</label>
                <input
                  type="email"
                  placeholder="replies@yourdomain.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Recipients (Real Groups & Segments) */}
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

            {/* Real Groups Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500">
                  Your Subscriber Groups ({selectedGroupIds.length} selected)
                </p>
                <span className="text-[11px] text-gray-400 font-medium">Select one or multiple groups</span>
              </div>

              {groups.length === 0 ? (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                  <span>No groups yet. Create a group to organize your subscribers.</span>
                  <button
                    type="button"
                    onClick={() => setIsNewGroupModalOpen(true)}
                    className="px-3 py-1 bg-black text-white rounded-xl font-bold"
                  >
                    Create group
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {groups.map((grp) => {
                    const isChecked = selectedGroupIds.includes(grp.id);
                    const count = grp.canReceive ?? grp.total ?? 0;
                    return (
                      <div
                        key={grp.id}
                        onClick={() => toggleGroup(grp.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-bold truncate">{grp.name}</span>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Everyone who is subscribed, no group needed */}
            <div
              onClick={() => toggleSegment('all')}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedSegmentIds.includes('all')
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedSegmentIds.includes('all')}
                  onChange={() => {}}
                  className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer shrink-0"
                />
                <span className="text-xs font-bold truncate">All subscribed contacts (including people in no group)</span>
              </div>
              <span className="text-xs font-medium shrink-0 opacity-70">{summary?.counts?.contacts ?? ''}</span>
            </div>

            {/* Real Segments Grid */}
            {segments.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">Dynamic Segments (Optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {segments.map((seg) => {
                    const isChecked = selectedSegmentIds.includes(seg.id);
                    return (
                      <div
                        key={seg.id}
                        onClick={() => toggleSegment(seg.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-black focus:ring-black accent-black w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-bold truncate">{seg.name}</span>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>
                          {seg.count ?? 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Real Audience Estimate Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  {estimating && <Spinner className="w-3.5 h-3.5" />}
                  <span>
                    {estimate.count} {estimate.count === 1 ? 'person' : 'people'} will get this
                  </span>
                </span>
                <span className="text-xs text-emerald-800 font-medium">
                  {estimate.skipped} skipped (unsubscribed, bounced or complained)
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                ✓ Smart deduplication: Subscribers present in multiple groups will automatically receive only 1 email.
              </p>
            </div>
          </div>

          {/* Section 3: Content & Template Assignment */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-bold text-base text-gray-900">Content &amp; Template Assignment</h2>
            </div>

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
                  <div>
                    <h3 className="font-bold text-xs text-gray-900">{activeTemplate?.name || 'No template selected'}</h3>
                    <p className="text-[11px] text-gray-500">
                      {activeTemplate?.category || 'Newsletter'} · Edits in Templates apply to new drafts
                    </p>
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
                    value={activeTemplate?.id || ''}
                    onChange={(e) => handleSelectSingleTemplate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} ({tpl.category})
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
                {selectedGroupIds.length === 0 ? (
                  <p className="text-xs text-gray-500">Select one or more groups in Step 2 first.</p>
                ) : (
                  selectedGroupIds.map((gid) => {
                    const grp = groups.find((g) => g.id === gid);
                    const assignedTplId = groupTemplateMap[gid] || activeTemplate?.id || templates[0]?.id || '';
                    return (
                      <div
                        key={gid}
                        className="p-3 rounded-2xl bg-[#fafafa] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="font-bold text-xs text-gray-900">{grp?.name || gid}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={assignedTplId}
                            onChange={(e) => setGroupTemplateMap({ ...groupTemplateMap, [gid]: e.target.value })}
                            className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-black"
                          >
                            {templates.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
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
                    );
                  })
                )}
              </div>
            )}

            <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Plain-text versions created automatically</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPlainText(!showPlainText)}
                className="underline hover:text-emerald-950 font-bold"
              >
                {showPlainText ? 'Hide' : 'View'}
              </button>
            </div>

            {showPlainText && (
              <pre className="p-3 rounded-2xl bg-gray-900 text-gray-100 text-[11px] font-mono whitespace-pre-wrap">
                {plainTextVersion || '(No content yet)'}
              </pre>
            )}
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
                onClick={() => setSendMode('now')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  sendMode === 'now' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sendMode === 'now' ? 'border-white' : 'border-gray-400'}`}>
                  {sendMode === 'now' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-bold">Send now</span>
              </div>

              <div
                onClick={() => setSendMode('schedule')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                  sendMode === 'schedule' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sendMode === 'schedule' ? 'border-white' : 'border-gray-400'}`}>
                  {sendMode === 'schedule' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs font-bold">Schedule</span>
              </div>
            </div>

            {sendMode === 'schedule' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Time</label>
                  <input
                    type="time"
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Time zone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                  >
                    <option value="Asia/Colombo">Colombo (Asia/Colombo)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">New York (America/New_York)</option>
                    <option value="Europe/London">London (Europe/London)</option>
                    <option value="Asia/Singapore">Singapore (Asia/Singapore)</option>
                    <option value="Australia/Sydney">Sydney (Australia/Sydney)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
              ⚡ <b>Amazon SES Automated Dispatch</b>: {sendRate} emails/sec.{' '}
              {estimate.count > 0
                ? `${estimate.count} recipient(s) will finish in ~${estSeconds}s.`
                : 'Select recipients above to calculate dispatch duration.'}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Send Test (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Preview Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="text-[11px] text-gray-400 space-y-0.5">
              <p className="font-mono text-gray-600">
                {fromName || 'Sender'} &lt;{fromEmail || 'not-set'}&gt;
              </p>
              <p className="font-bold text-gray-900 text-xs">
                {interpolateVars(subjectA || '(No subject)', previewContact)}
              </p>
              <p className="truncate">{previewText || '(No preview text)'}</p>
            </div>

            {/* Real Template Blocks Preview */}
            <div className="bg-[#fafafa] rounded-2xl p-4 border border-gray-200/80 space-y-3 text-xs">
              {previewBlocks.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Select a template to preview its content.</p>
              ) : (
                previewBlocks.map((b, i) => {
                  if (b.type === 'heading') {
                    return (
                      <h3 key={b.id || i} className="font-bold text-sm text-gray-900">
                        {interpolateVars(renderBlockText(b), previewContact)}
                      </h3>
                    );
                  }
                  if (b.type === 'text') {
                    return (
                      <p key={b.id || i} className="text-gray-600 leading-relaxed text-[11.5px]">
                        {interpolateVars(renderBlockText(b), previewContact)}
                      </p>
                    );
                  }
                  if (b.type === 'button') {
                    return (
                      <button
                        key={b.id || i}
                        type="button"
                        style={{ backgroundColor: b.color || '#111111' }}
                        className="text-white px-4 py-2 rounded-xl text-xs font-bold"
                      >
                        {b.label}
                      </button>
                    );
                  }
                  if (b.type === 'image' && b.url) {
                    return (
                      <img
                        key={b.id || i}
                        src={b.url}
                        alt={b.alt || ''}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    );
                  }
                  if (b.type === 'divider') {
                    return <hr key={b.id || i} className="border-gray-200" />;
                  }
                  return null;
                })
              )}
              <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-400 text-center">
                {settings.compliance?.address || fromName || 'Acme Team'} · <span className="underline">Unsubscribe</span>
              </div>
            </div>
          </div>

          {/* Send a test card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900">Send a test</h3>
              <span className="text-[10px] text-gray-400">Dispatches via Amazon SES</span>
            </div>

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
                placeholder="Type email & press Enter..."
                value={newTestEmail}
                onChange={(e) => setNewTestEmail(e.target.value)}
                onKeyDown={addTestEmail}
                className="bg-transparent text-xs p-1 focus:outline-none flex-1 min-w-[140px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Show it as if sent to</label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              >
                {contacts.length === 0 ? (
                  <option value="">Default sample subscriber</option>
                ) : (
                  contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            <button
              type="button"
              disabled={sendingTest}
              onClick={handleSendTest}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {sendingTest ? <Spinner className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{sendingTest ? 'Sending test...' : 'Send test'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleReviewAndSend}
            className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400 text-xs font-bold transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {saving && <Spinner className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving draft...' : 'Review and send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
