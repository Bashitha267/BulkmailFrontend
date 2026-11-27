import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { contactsApi } from '../services/api';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Plus,
  Save,
  X,
  Mail,
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, groups, templates, settings, updateContact, loadWorkspace, notify } = useApp();

  const [detailContact, setDetailContact] = useState(null);
  const [detailSegments, setDetailSegments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  // Editable state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [plan, setPlan] = useState('Free');
  const [email, setEmail] = useState('');
  const [customFields, setCustomFields] = useState({});
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);
  const [assignedGroupIds, setAssignedGroupIds] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);

  // Direct email composer modal state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState('custom'); // 'custom' | 'template'
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailPreviewText, setMailPreviewText] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailFromEmail, setMailFromEmail] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [mailReplyTo, setMailReplyTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fallbackContact = useMemo(() => contacts.find((c) => c.id === id) || null, [contacts, id]);
  const contact = detailContact || fallbackContact;

  const hydrateForm = (c) => {
    if (!c) return;
    const parts = String(c.name || '').trim().split(/\s+/);
    setFirstName(c.firstName || parts[0] || '');
    setLastName(c.lastName || parts.slice(1).join(' ') || '');
    setCity(c.city || '');
    setPlan(c.plan || 'Free');
    setEmail(c.email || '');
    setCustomFields(c.customFields && typeof c.customFields === 'object' ? c.customFields : {});
    setAssignedGroupIds(
      (c.groups || [])
        .map((g) => (typeof g === 'string' ? groups.find((x) => x.name === g)?.id || g : g?.id || g?.name))
        .filter(Boolean)
    );
  };

  const fetchContactDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await contactsApi.get(id);
      if (res?.contact) {
        setDetailContact(res.contact);
        setDetailSegments(Array.isArray(res.segments) ? res.segments : []);
        setActivity(Array.isArray(res.activity) ? res.activity : []);
        hydrateForm(res.contact);
      }
    } catch (err) {
      if (fallbackContact) {
        hydrateForm(fallbackContact);
      } else {
        notify({ type: 'error', title: 'Could not load contact', message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep composer defaults synced with settings & templates
  const senders = settings?.senders || [];
  const defaultSender = senders.find((s) => s.isDefault) || senders[0];

  const openComposer = () => {
    setMailFromEmail(defaultSender?.email || '');
    setMailFromName(settings?.general?.fromName || settings?.general?.teamName || '');
    setMailReplyTo(settings?.general?.replyTo || '');
    setSelectedTemplateId((prev) => prev || templates[0]?.id || '');
    setComposerOpen(true);
  };

  const handleTemplatePick = (tplId) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      setMailSubject(tpl.subject || '');
      setMailPreviewText(tpl.previewText || '');
    }
  };

  const handleSendDirectEmail = async (e) => {
    e.preventDefault();
    if (!contact) return;

    if (composerMode === 'template' && !selectedTemplateId) {
      notify({ type: 'error', title: 'Choose a template', message: 'Select a template to send.' });
      return;
    }
    if (!mailSubject.trim() && composerMode === 'custom') {
      notify({ type: 'error', title: 'Subject required', message: 'Enter a subject line for this email.' });
      return;
    }
    if (composerMode === 'custom' && !mailBody.trim()) {
      notify({ type: 'error', title: 'Message required', message: 'Write a message to send.' });
      return;
    }

    setSendingEmail(true);
    try {
      const payload = {
        subject: mailSubject.trim(),
        previewText: mailPreviewText.trim(),
        fromEmail: mailFromEmail.trim(),
        fromName: mailFromName.trim(),
        replyTo: mailReplyTo.trim(),
        ...(composerMode === 'template'
          ? { templateId: selectedTemplateId }
          : { body: mailBody.trim() }),
      };
      const res = await contactsApi.sendEmail(contact.id, payload);
      notify({
        type: 'success',
        title: res?.simulated ? 'Email queued (simulation)' : 'Email sent via Amazon SES',
        message: `Sent "${res?.subject || mailSubject}" to ${contact.email}`,
      });
      setComposerOpen(false);
      setMailSubject('');
      setMailPreviewText('');
      setMailBody('');
      await Promise.all([fetchContactDetail(), loadWorkspace()]);
    } catch (err) {
      notify({ type: 'error', title: 'Could not send email', message: err.message });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleToggleSubscription = async () => {
    if (!contact) return;
    setStatusBusy(true);
    try {
      if (contact.status === 'Subscribed') {
        await contactsApi.unsubscribe(contact.id);
        notify({ type: 'info', title: 'Unsubscribed', message: `${contact.email} will no longer receive campaigns.` });
      } else {
        await contactsApi.resubscribe(contact.id);
        notify({ type: 'success', title: 'Resubscribed', message: `${contact.email} is subscribed again.` });
      }
      await Promise.all([fetchContactDetail(), loadWorkspace()]);
    } catch (err) {
      notify({ type: 'error', title: 'Could not update subscription', message: err.message });
    } finally {
      setStatusBusy(false);
    }
  };

  const handleSaveFields = async (e) => {
    e.preventDefault();
    if (!contact) return;
    try {
      const updatedName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const updated = await updateContact(contact.id, {
        name: updatedName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        city: city.trim(),
        plan,
        customFields,
        groupIds: assignedGroupIds,
      });
      if (updated) {
        setDetailContact(updated);
      }
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      await fetchContactDetail();
    } catch (err) {
      notify({ type: 'error', title: 'Could not save fields', message: err.message });
    }
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !newFieldValue.trim()) return;
    const key = newFieldName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCustomFields((prev) => ({ ...prev, [key]: newFieldValue.trim() }));
    setNewFieldName('');
    setNewFieldValue('');
    setShowAddField(false);
    setIsEditing(true);
  };

  const toggleGroup = (groupId) => {
    setIsEditing(true);
    setAssignedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const filteredActivity = useMemo(() => {
    return activity.filter((item) => {
      if (activeTab === 'Emails') {
        return ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'].includes(item.type);
      }
      if (activeTab === 'Changes') {
        return ['added', 'imported', 'groups', 'unsubscribed', 'subscribed'].includes(item.type);
      }
      return true;
    });
  }, [activity, activeTab]);

  if (loading && !contact) {
    return <DashboardSkeleton />;
  }

  if (!contact) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-3">
        <p className="text-sm font-bold text-gray-900">Contact not found.</p>
        <button
          type="button"
          onClick={() => navigate('/contacts')}
          className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-zinc-800"
        >
          Back to contacts
        </button>
      </div>
    );
  }

  const displayName = `${firstName} ${lastName}`.trim() || contact.name || contact.email;
  const initials = contact.initials || (firstName[0] || contact.email?.[0] || 'U').toUpperCase();
  const isSubscribed = contact.status === 'Subscribed';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{displayName}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Added {formatDate(contact.createdAt)}
              {city ? ` · ${city}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {contact.status !== 'Complained' && (
            <button
              type="button"
              disabled={statusBusy}
              onClick={handleToggleSubscription}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 transition-colors shadow-2xs ${
                isSubscribed
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {statusBusy ? 'Updating...' : isSubscribed ? 'Unsubscribe' : 'Resubscribe'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
              isEditing ? 'bg-black text-white' : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Mode' : 'Edit Fields'}</span>
          </button>

          <button
            type="button"
            onClick={openComposer}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send an email</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Contact fields updated and saved successfully!</span>
        </div>
      )}

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-800 font-bold text-base flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-black"
                  />
                ) : (
                  <p className="font-bold text-sm text-gray-900 font-mono truncate">{email}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isSubscribed
                        ? 'bg-emerald-50 text-emerald-700'
                        : contact.status === 'Unsubscribed'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isSubscribed ? `✓ ${contact.status}` : contact.status}
                  </span>
                  {plan && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                      {plan} plan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Real stats counters */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Received</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.received ?? 0}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Opened</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.opened ?? 0}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Clicked</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.clicked ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Fields Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">Contact Fields</h2>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {isEditing ? 'Editing' : 'Click Edit to Change'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddField(!showAddField)}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add field</span>
              </button>
            </div>

            <form onSubmit={handleSaveFields} className="space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                  <span className="text-gray-500 font-medium w-28 shrink-0">First name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-900 flex-1 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-right">{firstName || '—'}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                  <span className="text-gray-500 font-medium w-28 shrink-0">Last name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-900 flex-1 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-right">{lastName || '—'}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                  <span className="text-gray-500 font-medium w-28 shrink-0">City</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-900 flex-1 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-right">{city || '—'}</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                  <span className="text-gray-500 font-medium w-28 shrink-0">Plan</span>
                  {isEditing ? (
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-900 flex-1 focus:outline-none focus:border-black"
                    >
                      <option value="Free">Free</option>
                      <option value="Pro">Pro</option>
                      <option value="Business">Business</option>
                    </select>
                  ) : (
                    <span className="font-bold text-gray-900 text-right">{plan || '—'}</span>
                  )}
                </div>

                {Object.entries(customFields).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                    <span className="text-gray-500 font-medium w-28 shrink-0">{k}</span>
                    <span className="font-bold text-purple-700 text-right">{String(v)}</span>
                  </div>
                ))}
              </div>

              {showAddField && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                  <p className="text-[11px] font-bold text-purple-900">Add Custom Field to this Contact</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Field Name (e.g. Company)"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Field Value"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg p-1.5 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddField(false)}
                      className="px-2.5 py-1 text-[11px] text-gray-600 hover:text-black font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="px-3 py-1 bg-black text-white rounded-lg text-[11px] font-bold"
                    >
                      Save Field
                    </button>
                  </div>
                </div>
              )}

              {isEditing && (
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Updated Fields</span>
                </button>
              )}
            </form>
          </div>

          {/* Groups & Segments Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-900">Groups and segments</h2>
              <button
                type="button"
                onClick={() => setShowAddGroup(!showAddGroup)}
                className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {assignedGroupIds.length === 0 && detailSegments.length === 0 && (
                <span className="text-xs text-gray-400">Not in any group or segment yet.</span>
              )}
              {assignedGroupIds.map((gid) => {
                const grpName = groups.find((g) => g.id === gid)?.name || gid;
                return (
                  <span
                    key={gid}
                    className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-800 font-semibold flex items-center gap-1"
                  >
                    <span>{grpName}</span>
                    {showAddGroup && (
                      <button type="button" onClick={() => toggleGroup(gid)} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
              {detailSegments.map((seg) => (
                <span
                  key={seg.id}
                  className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-semibold"
                >
                  Segment · {seg.name}
                </span>
              ))}
            </div>

            {showAddGroup && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 mt-2">
                <p className="text-[11px] font-bold text-gray-700">Toggle Group Membership:</p>
                {groups.length === 0 ? (
                  <p className="text-[11px] text-gray-400">No groups created yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {groups.map((g) => {
                      const isMember = assignedGroupIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGroup(g.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                            isMember
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-700 border-gray-200'
                          }`}
                        >
                          {isMember ? `✓ ${g.name}` : `+ ${g.name}`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Consent Record Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Contact record</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Origin and subscription history for {displayName}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {contact.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Source</span>
                <p className="font-bold text-gray-900 mt-1">
                  {(typeof contact.consent === 'string' ? contact.consent : contact.consent?.source) ||
                    'Added manually'}
                </p>
              </div>

              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Added date</span>
                <p className="font-bold text-gray-900 mt-1">
                  {contact.consent?.record?.signedUp || contact.consent?.date || formatDate(contact.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Real Activity Timeline Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Activity</h2>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
                {['All', 'Emails', 'Changes'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === tab ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredActivity.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No activity recorded yet.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {filteredActivity.map((act) => {
                  let dotColor = 'bg-emerald-500';
                  if (act.type === 'delivered' || act.type === 'sent') dotColor = 'bg-blue-500';
                  if (act.type === 'clicked') dotColor = 'bg-purple-600';
                  if (act.type === 'bounced' || act.type === 'complained' || act.type === 'unsubscribed') {
                    dotColor = 'bg-rose-500';
                  }

                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs">
                      <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 leading-snug">{act.title}</p>
                        {act.detail && <p className="text-[11px] text-gray-500 mt-0.5">{act.detail}</p>}
                        <p className="text-[11px] text-gray-400 mt-0.5">{formatDateTime(act.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Direct Send Email Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Send email</h2>
                  <p className="text-xs text-gray-500 font-mono">{contact.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendDirectEmail} className="space-y-4">
              {/* Mode selector */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() => setComposerMode('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    composerMode === 'custom' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Write message
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setComposerMode('template');
                    if (selectedTemplateId) handleTemplatePick(selectedTemplateId);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    composerMode === 'template' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Use template
                </button>
              </div>

              {/* Sender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">From email</label>
                  {senders.length > 0 ? (
                    <select
                      value={mailFromEmail}
                      onChange={(e) => setMailFromEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-mono text-gray-900 focus:outline-none focus:border-black"
                    >
                      {senders.map((s) => (
                        <option key={s.email} value={s.email}>
                          {s.email} {s.verified ? '(Verified)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="email"
                      required
                      value={mailFromEmail}
                      onChange={(e) => setMailFromEmail(e.target.value)}
                      placeholder="sender@yourdomain.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-mono text-gray-900 focus:outline-none focus:border-black"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">From name</label>
                  <input
                    type="text"
                    value={mailFromName}
                    onChange={(e) => setMailFromName(e.target.value)}
                    placeholder="Sender name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs text-gray-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {composerMode === 'template' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplatePick(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-semibold text-gray-900 focus:outline-none focus:border-black"
                  >
                    <option value="">Select a saved template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Hello {{firstName}}, quick update"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Preview text <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={mailPreviewText}
                  onChange={(e) => setMailPreviewText(e.target.value)}
                  placeholder="Short summary shown in inbox"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#fafafa] text-xs text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              {composerMode === 'custom' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Message <span className="text-gray-400 font-normal">(supports {'{{firstName}}'})</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={mailBody}
                    onChange={(e) => setMailBody(e.target.value)}
                    placeholder={`Hi {{firstName}},\n\nWrite your email message here...`}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#fafafa] text-xs text-gray-900 focus:outline-none focus:border-black resize-y"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400 text-xs font-bold flex items-center gap-1.5"
                >
                  {sendingEmail ? <Spinner className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{sendingEmail ? 'Sending...' : 'Send via Amazon SES'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
