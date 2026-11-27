import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { campaignsApi } from '../services/api';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';

function formatSendTime(sendMode, sendAt, timezone, fallbackDate, fallbackTime) {
  if (sendMode !== 'schedule') {
    return { primary: 'Immediately', secondary: timezone || 'UTC' };
  }
  if (sendAt) {
    const date = new Date(sendAt);
    if (!Number.isNaN(date.getTime())) {
      try {
        const primary = new Intl.DateTimeFormat('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: timezone || 'UTC',
        }).format(date);
        return { primary, secondary: timezone || 'UTC' };
      } catch {
        return { primary: date.toLocaleString(), secondary: timezone || 'UTC' };
      }
    }
  }
  if (fallbackDate) {
    return {
      primary: `${fallbackDate}${fallbackTime ? `, ${fallbackTime}` : ''}`,
      secondary: timezone || 'UTC',
    };
  }
  return { primary: 'Not scheduled', secondary: timezone || 'UTC' };
}

export default function CampaignReview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { groups, segments, loadWorkspace, notify } = useApp();

  const isBatch = id === 'batch';
  const batchPlan = location.state?.batchPlan || null;

  const [campaign, setCampaign] = useState(null);
  const [checks, setChecks] = useState([]);
  const [audience, setAudience] = useState({ count: 0, skipped: 0, total: 0 });
  const [canSend, setCanSend] = useState(true);
  const [loading, setLoading] = useState(!isBatch);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviewData = async () => {
    if (isBatch || !id) return;
    setLoading(true);
    setLoadError('');
    try {
      const [campaignRes, checksRes] = await Promise.all([
        campaignsApi.get(id),
        campaignsApi.checks(id),
      ]);
      setCampaign(campaignRes?.campaign || null);
      setChecks(Array.isArray(checksRes?.checks) ? checksRes.checks : []);
      setAudience(checksRes?.audience || { count: 0, skipped: 0, total: 0 });
      setCanSend(checksRes?.canSend !== false);
    } catch (err) {
      setLoadError(err.message || 'Could not load campaign review details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isBatch]);

  const audienceSummary = useMemo(() => {
    if (isBatch && batchPlan) {
      return `${batchPlan.groupAssignments?.length || 0} groups · custom templates`;
    }
    if (!campaign) return '';
    const groupNames = (campaign.groupIds || [])
      .map((gid) => groups.find((g) => g.id === gid)?.name || gid)
      .filter(Boolean);
    const segmentNames = (campaign.segmentIds || [])
      .map((sid) => segments.find((s) => s.id === sid)?.name || sid)
      .filter(Boolean);
    const labels = [...groupNames, ...segmentNames];
    if (labels.length === 0) return 'No audience selected';
    const base = labels.join(', ');
    return audience.skipped > 0 ? `${base} (${audience.skipped} skipped)` : base;
  }, [isBatch, batchPlan, campaign, groups, segments, audience.skipped]);

  const checkSummary = useMemo(() => {
    const passed = checks.filter((c) => c.status === 'pass').length;
    const warnings = checks.filter((c) => c.status === 'warn').length;
    const failed = checks.filter((c) => c.status === 'fail').length;
    return { passed, warnings, failed };
  }, [checks]);

  const handleCheckAction = (action) => {
    if (action === 'domains') navigate('/domains');
    else if (action === 'settings') navigate('/settings');
    else if (action === 'recipients') navigate('/contacts');
    else if (action === 'edit' || action === 'test') navigate(`/campaigns/${id}/edit`);
  };

  const handleLaunchSingle = async () => {
    if (!campaign) return;
    setSubmitting(true);
    try {
      const res = await campaignsApi.send(campaign.id);
      await loadWorkspace();
      const updated = res?.campaign || campaign;
      notify({
        type: 'success',
        title: updated.status === 'Scheduled' ? 'Campaign scheduled' : 'Campaign launched',
        message:
          updated.status === 'Scheduled'
            ? `"${campaign.title}" is scheduled to send.`
            : `"${campaign.title}" is queueing via Amazon SES.`,
      });
      navigate(`/campaigns/${campaign.id}/report`);
    } catch (err) {
      notify({ type: 'error', title: 'Could not launch campaign', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchBatch = async () => {
    if (!batchPlan?.groupAssignments?.length) return;
    setSubmitting(true);
    try {
      const createdCampaigns = [];
      for (const assignment of batchPlan.groupAssignments) {
        const createdRes = await campaignsApi.create({
          title: `${batchPlan.title || 'Campaign'} — ${assignment.groupName}`,
          subjectA: assignment.subject || batchPlan.subjectA || '',
          subjectB: batchPlan.abTest ? batchPlan.subjectB : '',
          abTest: batchPlan.abTest,
          previewText: assignment.previewText || batchPlan.previewText || '',
          fromName: batchPlan.fromName,
          fromEmail: batchPlan.fromEmail,
          replyTo: batchPlan.replyTo,
          groupIds: [assignment.groupId],
          segmentIds: [],
          templateId: assignment.templateId,
          sendMode: batchPlan.sendMode,
          timezone: batchPlan.timezone,
          ...(batchPlan.sendMode === 'schedule'
            ? { sendDate: batchPlan.sendDate, sendTime: batchPlan.sendTime }
            : {}),
        });
        const created = createdRes?.campaign;
        if (created?.id) {
          await campaignsApi.send(created.id);
          createdCampaigns.push(created);
        }
      }

      await loadWorkspace();
      notify({
        type: 'success',
        title: `${createdCampaigns.length} group campaigns queued`,
        message:
          batchPlan.sendMode === 'schedule'
            ? 'All custom-template group campaigns have been scheduled.'
            : 'All custom-template group campaigns are now sending via Amazon SES.',
      });
      if (createdCampaigns.length === 1) {
        navigate(`/campaigns/${createdCampaigns[0].id}/report`);
      } else {
        navigate('/campaigns');
      }
    } catch (err) {
      notify({ type: 'error', title: 'Could not launch group campaigns', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isBatch && !batchPlan) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Batch review session expired</h1>
        <p className="text-xs text-gray-500">
          Return to the campaign editor to choose templates for each group and review again.
        </p>
        <button
          type="button"
          onClick={() => navigate('/campaigns/new')}
          className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
        >
          Back to campaign builder
        </button>
      </div>
    );
  }

  if (!isBatch && (loadError || !campaign)) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4">
        <h1 className="text-lg font-bold text-gray-900">Could not load campaign</h1>
        <p className="text-xs text-gray-500">{loadError || 'Campaign not found.'}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="px-4 py-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Back to campaigns
          </button>
          <button
            type="button"
            onClick={fetchReviewData}
            className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeData = isBatch ? batchPlan : campaign;
  const recipientTotal = isBatch ? batchPlan.estimatedCount || 0 : audience.count || 0;
  const timing = formatSendTime(
    activeData.sendMode,
    activeData.sendAt,
    activeData.timezone,
    batchPlan?.sendDate,
    batchPlan?.sendTime
  );

  const testGroupPct = activeData.abSplitPct || 20;
  const variantCount = Math.floor((recipientTotal * (testGroupPct / 2)) / 100);
  const winnerCount = Math.max(0, recipientTotal - variantCount * 2);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(isBatch ? '/campaigns/new' : `/campaigns/${campaign.id}/edit`)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {activeData.sendMode === 'schedule' ? 'Ready to schedule?' : 'Ready to send?'}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {activeData.title || 'Untitled campaign'} · last look before it goes out
            </p>
          </div>
        </div>

        {!isBatch && (
          <button
            type="button"
            onClick={fetchReviewData}
            className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-check</span>
          </button>
        )}
      </div>

      {/* 3 Summary Black Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">To</p>
          <p className="text-2xl font-bold mt-0.5">
            {recipientTotal.toLocaleString()} {recipientTotal === 1 ? 'person' : 'people'}
          </p>
          <p className="text-xs text-zinc-400 mt-1 truncate">{audienceSummary}</p>
        </div>

        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">Goes out</p>
          <p className="text-2xl font-bold mt-0.5 truncate">{timing.primary}</p>
          <p className="text-xs text-zinc-400 mt-1 truncate">{timing.secondary}</p>
        </div>

        <div className="bg-black text-white p-5 rounded-3xl">
          <p className="text-xs text-zinc-400 font-medium">From</p>
          <p className="text-2xl font-bold mt-0.5 truncate">{activeData.fromName || 'Not set'}</p>
          <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
            {activeData.fromEmail || 'No sender address set'}
          </p>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Real Pre-send Checks OR Batch Group Breakdown */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
          {isBatch ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="font-bold text-base text-gray-900">Group templates to send</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {batchPlan.groupAssignments.length} campaigns
                </span>
              </div>
              <div className="space-y-2.5">
                {batchPlan.groupAssignments.map((item) => (
                  <div
                    key={item.groupId}
                    className="p-3.5 rounded-2xl bg-[#fafafa] border border-gray-100 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900">
                        {item.groupName} · {item.canReceive} people
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Template: <span className="font-semibold">{item.templateName}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        Subject: {item.subject || '(uses campaign subject)'}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 gap-2 flex-wrap">
                <h2 className="font-bold text-base text-gray-900">Pre-send checks</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ✓ {checkSummary.passed} passed
                  </span>
                  {checkSummary.warnings > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      ! {checkSummary.warnings} warning{checkSummary.warnings === 1 ? '' : 's'}
                    </span>
                  )}
                  {checkSummary.failed > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      ✕ {checkSummary.failed} blocking
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {checks.map((item) => {
                  const isPass = item.status === 'pass';
                  const isWarn = item.status === 'warn';
                  const cardClasses = isPass
                    ? 'p-3.5 rounded-2xl bg-[#fafafa] flex items-start justify-between gap-3'
                    : isWarn
                    ? 'p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3'
                    : 'p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start justify-between gap-3';

                  return (
                    <div key={item.key} className={cardClasses}>
                      <div className="flex items-start gap-3">
                        {isPass ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : isWarn ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-bold leading-tight ${
                              isPass
                                ? 'text-gray-900'
                                : isWarn
                                ? 'text-amber-950'
                                : 'text-rose-950'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isPass
                                ? 'text-gray-500'
                                : isWarn
                                ? 'text-amber-900'
                                : 'text-rose-900'
                            }`}
                          >
                            {item.detail}
                          </p>
                        </div>
                      </div>

                      {item.action && (
                        <button
                          type="button"
                          onClick={() => handleCheckAction(item.action)}
                          className={`text-[11px] font-bold hover:underline flex items-center gap-0.5 shrink-0 ${
                            isWarn ? 'text-amber-900' : isPass ? 'text-gray-700' : 'text-rose-900'
                          }`}
                        >
                          <span>Fix now</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Subject summary & Send CTA (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900">
              {activeData.abTest ? 'Subject A/B test' : 'Email subject'}
            </h3>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                {activeData.abTest ? 'A' : 'S'}
              </span>
              <span className="truncate">{activeData.subjectA || 'No subject set'}</span>
            </div>

            {activeData.abTest && (
              <>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-xs font-semibold text-gray-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-900 text-[10.5px] font-bold flex items-center justify-center shrink-0">
                    B
                  </span>
                  <span className="truncate">{activeData.subjectB || 'No variant B set'}</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-medium pt-1">
                  {variantCount.toLocaleString()} people get each version first ({testGroupPct}%
                  split). The winning subject goes to the remaining{' '}
                  {winnerCount.toLocaleString()} after {activeData.abWaitHours || 4}h.
                </p>
              </>
            )}

            {activeData.previewText && (
              <p className="text-[11px] text-gray-500 pt-1">
                Preview text: <span className="text-gray-700 font-medium">{activeData.previewText}</span>
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-4">
            {!isBatch && !canSend && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 font-medium">
                Resolve the blocking red checks on the left before launching this campaign.
              </div>
            )}

            <button
              type="button"
              disabled={submitting || (!isBatch && !canSend)}
              onClick={isBatch ? handleLaunchBatch : handleLaunchSingle}
              className="w-full py-3 rounded-2xl bg-black text-white hover:bg-zinc-800 disabled:bg-gray-300 disabled:text-gray-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99]"
            >
              {submitting ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : activeData.sendMode === 'now' ? (
                <Send className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>
                {submitting
                  ? 'Queueing via Amazon SES...'
                  : isBatch
                  ? activeData.sendMode === 'now'
                    ? `Send ${batchPlan.groupAssignments.length} campaigns now`
                    : `Schedule ${batchPlan.groupAssignments.length} campaigns`
                  : activeData.sendMode === 'now'
                  ? 'Send now via Amazon SES'
                  : `Schedule for ${timing.primary}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate(isBatch ? '/campaigns/new' : `/campaigns/${campaign.id}/edit`)}
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
