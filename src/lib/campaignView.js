/**
 * The API returns campaign numbers under `stats` and `rates`, and dates as ISO strings.
 * Several pages read friendlier names (progress, openedRate, month, day, ...).
 * decorateCampaign() adds those names from the real values. It never invents data.
 */
const pct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;

export function decorateCampaign(c) {
  if (!c) return c;
  const s = c.stats || {};
  const total = s.total || 0;
  const sent = s.sent || 0;
  const when = c.startedAt || c.sendAt || c.createdAt;
  const d = when ? new Date(when) : null;
  const dateLabel = d && !Number.isNaN(d.getTime()) ? d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

  let subtitle = c.note || '';
  if (c.status === 'Sending') subtitle = `${sent} of ${total} sent`;
  else if (c.status === 'Paused') subtitle = `Paused · ${s.waiting || 0} waiting`;
  else if (c.status === 'Scheduled') subtitle = c.sendAt ? `Scheduled ${new Date(c.sendAt).toLocaleString()}` : 'Scheduled';
  else if (c.status === 'Completed') subtitle = `${sent} sent${s.failed ? `, ${s.failed} failed` : ''}`;
  else if (c.status === 'Draft' && !subtitle) subtitle = 'Draft';

  return {
    ...c,
    subtitle,
    progress: {
      sent,
      total,
      waiting: s.waiting || 0,
      failed: s.failed || 0,
      percentage: total ? Math.min(100, Math.round((sent / total) * 100)) : 0,
    },
    sent,
    delivered: s.delivered || 0,
    bounced: s.bounced || 0,
    complaints: s.complaints || 0,
    recipientsCount: total,
    openedRate: pct(c.rates?.open),
    clickedRate: pct(c.rates?.click),
    month: d ? d.toLocaleString(undefined, { month: 'short' }) : '',
    day: d ? String(d.getDate()) : '',
    dateLabel,
    scheduledDate: c.sendAt ? new Date(c.sendAt).toLocaleString() : '',
  };
}

export const decorateCampaigns = (list) => (list || []).map(decorateCampaign);
