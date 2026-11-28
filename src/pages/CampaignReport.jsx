import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  Link as LinkIcon, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { campaignsApi } from '../services/api';
import { decorateCampaign } from '../lib/campaignView';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';

export default function CampaignReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { campaigns, dataLoading, resumeCampaign, pauseCampaign, cancelCampaign, notify } = useApp();
  const [liveCampaign, setLiveCampaign] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const contextCampaign = campaigns.find((c) => c.id === id) || campaigns[0];
  const campaign = liveCampaign || contextCampaign;

  useEffect(() => {
    if (!id) return;
    let active = true;

    const fetchDetail = async () => {
      try {
        // The report endpoint has the real SES errors, activity and link clicks.
        const res = await campaignsApi.report(id);
        if (active && res?.campaign) {
          const reasonOf = (p) =>
            p.kind === 'bounce' ? 'Bounced' : p.kind === 'complaint' ? 'Marked as spam' : p.error || 'Failed to send';
          setLiveCampaign({
            ...decorateCampaign(res.campaign),
            problems: (res.problems || []).map((p) => ({
              recipient: p.name || p.email,
              email: p.email,
              reason: reasonOf(p),
              action: 'View',
            })),
            activity: (res.activity || []).map((a) => ({
              id: a.id,
              title: a.title,
              time: a.at ? new Date(a.at).toLocaleString() : '',
            })),
            links: res.links,
          });
        }
      } catch {
        // Fallback to contextCampaign
      }
    };

    fetchDetail();
    const timer = setInterval(() => {
      if (campaign?.status === 'Sending') {
        fetchDetail();
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id, campaign?.status]);

  if (dataLoading && !campaign) {
    return <DashboardSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 text-center text-xs text-gray-500">
        Campaign not found.
      </div>
    );
  }

  const isSending = campaign.status === 'Sending';
  const isPaused = campaign.status === 'Paused';
  const isCompleted = campaign.status === 'Completed';

  const stats = campaign.stats || {
    total: campaign.recipientsCount || campaign.sent || 0,
    sent: campaign.sent || 0,
    waiting: 0,
    delivered: campaign.delivered || 0,
    opened: 0,
    bounced: campaign.bounced || 0,
    failed: 0,
    complaints: campaign.complaints || 0,
  };

  const progressTotal = stats.total ?? campaign.recipientsCount ?? campaign.sent ?? 0;
  const progressSent = stats.sent ?? campaign.sent ?? 0;
  const progress = campaign.progress || {
    sent: progressSent,
    total: progressTotal,
    waiting: stats.waiting ?? Math.max(0, progressTotal - progressSent),
    percentage:
      progressTotal > 0
        ? Math.min(100, Math.round((progressSent / progressTotal) * 100))
        : isCompleted
        ? 100
        : 0,
  };

  const handleAction = async (actionType) => {
    setBusyAction(actionType);
    try {
      let updated;
      if (actionType === 'resume') updated = await resumeCampaign(campaign.id);
      if (actionType === 'pause') updated = await pauseCampaign(campaign.id);
      if (actionType === 'cancel') updated = await cancelCampaign(campaign.id);
      if (updated) setLiveCampaign(updated);
    } catch (err) {
      notify({ type: 'error', message: err.message });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/campaigns')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{campaign.title}</h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
                  isSending
                    ? 'bg-emerald-100 text-emerald-900'
                    : isPaused
                    ? 'bg-amber-100 text-amber-900'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isSending && <Spinner className="w-3 h-3" />}
                <span>{campaign.status}</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {campaign.subjectA || campaign.subject || campaign.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(isSending || isPaused) && (
            <button
              disabled={busyAction !== null}
              onClick={() => handleAction('cancel')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-gray-200 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              {busyAction === 'cancel' && <Spinner className="w-3 h-3" />}
              <span>Cancel the rest</span>
            </button>
          )}

          {isSending && (
            <button
              disabled={busyAction !== null}
              onClick={() => handleAction('pause')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {busyAction === 'pause' ? <Spinner className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>Pause sending</span>
            </button>
          )}

          {isPaused && (
            <button
              disabled={busyAction !== null}
              onClick={() => handleAction('resume')}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {busyAction === 'resume' ? <Spinner className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>Resume sending</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Banner Card */}
      <div
        className={`rounded-3xl p-6 shadow-2xs border ${
          isSending
            ? 'bg-emerald-50/70 border-emerald-200'
            : isPaused
            ? 'bg-[#fef9c3]/70 border-[#fef08a]'
            : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isSending
                  ? 'bg-emerald-600 text-white'
                  : isPaused
                  ? 'bg-amber-400 text-amber-950'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isSending ? (
                <Spinner className="w-4 h-4" />
              ) : isPaused ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {campaign.status} at {progress.sent} of {progress.total}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {isSending
                  ? `Amazon SES cron worker is delivering batches · ${progress.waiting} waiting`
                  : isPaused
                  ? `${progress.waiting} people are waiting · nobody gets it twice when you resume`
                  : `All ${progress.sent} emails processed`}
              </p>
            </div>
          </div>

          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            {progress.percentage}%
          </span>
        </div>

        <div className="w-full bg-gray-200/80 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isSending || isCompleted ? 'bg-emerald-600' : 'bg-amber-600'
            }`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* 6 Metric KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Delivered</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.delivered}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Opened</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.opened}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Bounced</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.bounced}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Failed</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.failed}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-rose-500">Spam complaints</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats.complaints}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-400">Waiting</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.waiting}</p>
        </div>
      </div>

      {/* 2 Column Layout: Left (Links + Problems) | Right (Activity + Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Link clicks</h3>
                <p className="text-xs text-gray-400">Which links people tapped</p>
              </div>
              <span className="text-xs font-bold text-gray-500">Tracked via SES</span>
            </div>

            <div className="space-y-2">
              {(campaign.linkClicks || [{ title: 'Primary CTA', url: 'example.com', clicks: 0 }]).map((lk, idx) => (
                <div key={idx} className="p-3 bg-[#fafafa] rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <p className="font-bold text-gray-900">{lk.title}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{lk.url}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-700">{lk.clicks}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Problems ({(campaign.problems || []).length})</h3>
            </div>

            {(campaign.problems || []).length === 0 ? (
              <p className="text-xs text-gray-500">No delivery problems recorded.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {campaign.problems.map((prob, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-900">{prob.recipient}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{prob.email}</p>
                    </div>
                    <span className="text-rose-600 font-bold text-xs">{prob.reason}</span>
                    <button
                      onClick={() => navigate('/contacts')}
                      className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                    >
                      {prob.action || 'View'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-gray-900">Activity</h3>

            <div className="space-y-4 pt-1 text-xs">
              {(campaign.activity || [
                { id: 1, title: `Campaign status: ${campaign.status}`, time: 'Live' },
              ]).map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{act.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Subject and preview</h3>
            <div className="bg-[#fafafa] p-3.5 rounded-2xl border border-gray-100 text-xs space-y-1">
              <p className="font-bold text-gray-900">{campaign.subjectA || campaign.subject || campaign.title}</p>
              <p className="text-gray-500">{campaign.previewText || 'Preview text'}</p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-800 transition-colors shadow-2xs"
            >
              View email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
