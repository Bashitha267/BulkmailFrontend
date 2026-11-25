import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DashboardSkeleton, Spinner } from '../components/Skeleton';
import { 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  Clock, 
  Radio, 
  Server,
  ChevronDown,
  Trash2,
  X,
  Mail,
  Globe,
  UserPlus
} from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    settings, 
    dataLoading,
    saveSettings,
    isSimulationMode, 
    setIsSimulationMode,
    addField,
    deleteField,
    addSenderEmail,
    addDomain,
    inviteTeamMember,
    notify
  } = useApp();

  const [saving, setSaving] = useState(false);

  // Controlled SES settings
  const [sendRate, setSendRate] = useState(settings.ses?.sendRate || 10);
  const [retries, setRetries] = useState(settings.ses?.retries || 3);
  const [dailyLimit, setDailyLimit] = useState(settings.ses?.dailyLimit || '1,000 (warm-up)');
  
  // Controlled Compliance settings
  const [businessAddress, setBusinessAddress] = useState(settings.compliance?.address || '');
  const [oneClickUnsub, setOneClickUnsub] = useState(settings.compliance?.oneClickUnsubscribe ?? true);
  const [doubleOptIn, setDoubleOptIn] = useState(settings.compliance?.doubleOptIn ?? true);
  const [preferencePage, setPreferencePage] = useState(settings.compliance?.preferencePage ?? true);

  useEffect(() => {
    setSendRate(settings.ses?.sendRate || 10);
    setRetries(settings.ses?.retries || 3);
    setDailyLimit(settings.ses?.dailyLimit || '1,000 (warm-up)');
    setBusinessAddress(settings.compliance?.address || '');
    setOneClickUnsub(settings.compliance?.oneClickUnsubscribe ?? true);
    setDoubleOptIn(settings.compliance?.doubleOptIn ?? true);
    setPreferencePage(settings.compliance?.preferencePage ?? true);
  }, [settings]);

  // Add Field State
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('Text');

  // Add Sender State
  const [showAddSenderModal, setShowAddSenderModal] = useState(false);
  const [newSenderEmail, setNewSenderEmail] = useState('');

  // Add Domain State
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');

  // Invite Team State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Editor');

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (dataLoading && settings.senders.length === 0) {
    return <DashboardSkeleton />;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        ses: {
          sendRate: Number(sendRate),
          retries: Number(retries),
          dailyLimit
        },
        compliance: {
          address: businessAddress,
          oneClickUnsubscribe: oneClickUnsub,
          doubleOptIn: doubleOptIn,
          preferencePage: preferencePage
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      notify({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    const tag = `{{${newFieldName.toLowerCase().replace(/\s+/g, '')}}}`;
    addField({
      id: newFieldName.toLowerCase().replace(/\s+/g, '-'),
      name: newFieldName.trim(),
      type: newFieldType,
      tag,
      filled: 0
    });
    setNewFieldName('');
    setShowAddFieldModal(false);
  };

  const handleDeleteField = (fieldNameOrId) => {
    deleteField(fieldNameOrId);
  };

  const handleCreateSender = (e) => {
    e.preventDefault();
    if (!newSenderEmail.trim()) return;
    addSenderEmail(newSenderEmail.trim());
    setNewSenderEmail('');
    setShowAddSenderModal(false);
  };

  const handleCreateDomain = (e) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;
    addDomain(newDomainName.trim());
    setNewDomainName('');
    setShowAddDomainModal(false);
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const initials = (newMemberName[0] || 'U') + (newMemberName.split(' ')[1]?.[0] || '');
    inviteTeamMember({
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      avatar: initials.toUpperCase()
    });
    setNewMemberName('');
    setNewMemberEmail('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Sending, compliance and your team
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 disabled:bg-gray-400 transition-colors shadow-sm self-start sm:self-auto flex items-center gap-1.5"
        >
          {saving ? <Spinner className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{saving ? 'Saving...' : 'Save changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Amazon SES Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                  ☁️
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Amazon SES</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Region Asia Pacific (Mumbai) · production access
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✓ Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Send rate (emails a second)
                </label>
                <input
                  type="number"
                  value={sendRate}
                  onChange={(e) => setSendRate(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Your SES limit is 14</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Retries for temporary errors
                </label>
                <input
                  type="number"
                  value={retries}
                  onChange={(e) => setRetries(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Daily limit
                </label>
                <input
                  type="text"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-black"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Rises automatically</span>
              </div>
            </div>

            {/* Events coming back from SES */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 block mb-2">Events coming back from SES</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900">Deliveries</p>
                    <p className="text-[10px] text-emerald-700 truncate">last 5:10 pm</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900">Bounces</p>
                    <p className="text-[10px] text-emerald-700 truncate">last 5:10 pm</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-900">Complaints</p>
                    <p className="text-[10px] text-emerald-700 truncate">last 5:11 pm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation mode switch */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs font-medium text-gray-700">Switch to simulation mode for testing</span>
              <button
                type="button"
                onClick={() => setIsSimulationMode(!isSimulationMode)}
                className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                  isSimulationMode ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isSimulationMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Compliance Card (Editable textarea & switches) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Compliance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Added to every email automatically</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Business address in the footer (Editable)
              </label>
              <textarea
                rows={2}
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              />
              <span className="text-[10.5px] text-gray-400 mt-1 block">Anti-spam laws require a real postal address</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">One-click unsubscribe header</p>
                  <p className="text-[11px] text-gray-500">Gmail and Yahoo require this for bulk senders</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOneClickUnsub(!oneClickUnsub)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${oneClickUnsub ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${oneClickUnsub ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Double opt-in for signup forms</p>
                  <p className="text-[11px] text-gray-500">New people confirm by email before they’re added</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDoubleOptIn(!doubleOptIn)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${doubleOptIn ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${doubleOptIn ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">Let people choose what they get</p>
                  <p className="text-[11px] text-gray-500">Unsubscribe links open a preference page, not a dead end</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferencePage(!preferencePage)}
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${preferencePage ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${preferencePage ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Contact fields Card (Add Field, Edit, Delete) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Contact fields</h2>
                <p className="text-xs text-gray-400">Use them in segments and as merge tags</p>
              </div>
              <button
                onClick={() => setShowAddFieldModal(true)}
                className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add field</span>
              </button>
            </div>

            {/* Modal: Add Custom Field */}
            {showAddFieldModal && (
              <form onSubmit={handleCreateField} className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-900">Create New Contact Field</h3>
                  <button type="button" onClick={() => setShowAddFieldModal(false)} className="text-gray-400 hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Field Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Company, Phone, Country"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Field Type</label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 font-medium"
                    >
                      <option value="Text">Text</option>
                      <option value="Number">Number</option>
                      <option value="Date">Date</option>
                      <option value="Choice: Free, Pro, Business">Choice</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFieldModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 font-bold hover:bg-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-black text-white rounded-xl shadow-xs"
                  >
                    Save Field
                  </button>
                </div>
              </form>
            )}

            <div className="bg-[#fafafa] rounded-2xl border border-gray-100 overflow-x-auto text-xs">
              <table className="w-full text-left min-w-[340px]">
                <thead className="text-gray-400 font-semibold border-b border-gray-200/60 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Merge tag</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                  {settings.fields.map((fld) => (
                    <tr key={fld.name} className="hover:bg-white transition-colors">
                      <td className="py-2.5 px-3 font-bold">{fld.name}</td>
                      <td className="py-2.5 px-3 text-gray-500">{fld.type}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-700">{fld.tag}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteField(fld.name)}
                          className="p-1 hover:text-rose-600 rounded text-gray-400 transition-colors"
                          title="Delete field"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Domains Card (Add Domain & Manage) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Domains</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddDomainModal(true)}
                  className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add domain</span>
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => navigate('/domains')}
                  className="text-xs font-semibold text-gray-600 hover:text-black"
                >
                  Manage
                </button>
              </div>
            </div>

            {/* Modal: Add Domain */}
            {showAddDomainModal && (
              <form onSubmit={handleCreateDomain} className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">Add Sending Domain</span>
                  <button type="button" onClick={() => setShowAddDomainModal(false)}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. mail.yourcompany.com"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono font-bold"
                  required
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg"
                  >
                    Save Domain
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {settings.domains.map((dom) => (
                <div 
                  key={dom.name}
                  onClick={() => navigate('/domains')}
                  className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-gray-900 font-mono">{dom.name}</span>
                  <span className="text-[11px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                    {dom.verifiedRecords} of {dom.totalRecords} records
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sender emails Card (Add Sender Email) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Sender emails</h2>
              <button
                onClick={() => setShowAddSenderModal(true)}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add sender</span>
              </button>
            </div>

            {/* Modal: Add Sender Email */}
            {showAddSenderModal && (
              <form onSubmit={handleCreateSender} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">Add Verified Sender Email</span>
                  <button type="button" onClick={() => setShowAddSenderModal(false)}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="e.g. newsletter@yourcompany.com"
                  value={newSenderEmail}
                  onChange={(e) => setNewSenderEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono font-bold"
                  required
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg"
                  >
                    Verify &amp; Add
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 text-xs">
              {settings.senders.map((sender) => (
                <div key={sender.email} className="p-3 rounded-2xl bg-[#fafafa] flex items-center justify-between border border-gray-100">
                  <div>
                    <p className="font-mono text-gray-900 font-bold">{sender.email}</p>
                    {sender.isDefault && <span className="text-[10px] text-gray-400">Default</span>}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Team Card (Invite Member with inputs) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Team</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite</span>
              </button>
            </div>

            {/* Modal: Invite Team Member */}
            {showInviteModal && (
              <form onSubmit={handleInviteMember} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Invite New Team Member</span>
                  <button type="button" onClick={() => setShowInviteModal(false)}>
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 font-medium"
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 font-mono font-medium"
                  required
                />
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 font-bold"
                >
                  <option value="Editor">Editor (Can build &amp; send)</option>
                  <option value="Viewer">Viewer (Reports only)</option>
                </select>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-black text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 text-xs">
              {settings.team.map((mem) => (
                <div key={mem.email} className="p-2.5 rounded-2xl bg-[#fafafa] flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center">
                      {mem.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{mem.name}</p>
                      <p className="text-[10.5px] text-gray-400 font-mono truncate max-w-[140px] sm:max-w-none">{mem.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                    {mem.role}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400">
              Editors can build and send. Viewers can only see reports.
            </p>
          </div>

          {/* Audit log Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Audit log</h2>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Admin paused November newsletter</p>
                  <p className="text-[11px] text-gray-400">Today 5:12 pm</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Sanduni sent a test of December newsletter</p>
                  <p className="text-[11px] text-gray-400">Today 4:58 pm</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-gray-900">Admin turned on the Welcome series</p>
                  <p className="text-[11px] text-gray-400">14 Nov</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
