import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  Check, 
  Clock, 
  Mail, 
  Smartphone, 
  MousePointer, 
  CheckCircle2, 
  UserMinus,
  Edit2,
  Plus,
  Save,
  X
} from 'lucide-react';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contacts, updateContact } = useApp();

  const [activeTab, setActiveTab] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Find contact or fallback to Ravi Herath
  const contact = contacts.find(c => c.id === id) || contacts[0];

  // Editable state
  const [firstName, setFirstName] = useState(contact.name.split(' ')[0] || 'Ravi');
  const [lastName, setLastName] = useState(contact.name.split(' ').slice(1).join(' ') || 'Herath');
  const [city, setCity] = useState(contact.city || 'Colombo');
  const [plan, setPlan] = useState(contact.plan || 'Pro');
  const [lastPurchase, setLastPurchase] = useState('18 Nov 2026');
  const [email, setEmail] = useState(contact.email);

  // Custom fields
  const [customFields, setCustomFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [showAddField, setShowAddField] = useState(false);

  // Groups
  const [assignedGroups, setAssignedGroups] = useState(contact.groups || ['Newsletter', 'Customers']);
  const [showAddGroup, setShowAddGroup] = useState(false);

  const handleSaveFields = (e) => {
    e.preventDefault();
    const updatedName = `${firstName.trim()} ${lastName.trim()}`.trim();
    updateContact(contact.id, {
      name: updatedName,
      email: email.trim(),
      city: city.trim(),
      plan,
      groups: assignedGroups
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !newFieldValue.trim()) return;
    setCustomFields([...customFields, { name: newFieldName.trim(), value: newFieldValue.trim() }]);
    setNewFieldName('');
    setNewFieldValue('');
    setShowAddField(false);
  };

  const toggleGroup = (grp) => {
    if (assignedGroups.includes(grp)) {
      setAssignedGroups(assignedGroups.filter(g => g !== grp));
    } else {
      setAssignedGroups([...assignedGroups, grp]);
    }
  };

  const filteredActivity = (contact.activity || [
    { id: 1, type: 'opened', title: 'Opened November newsletter', time: 'Today, 5:11 pm · iPhone · Gmail app', category: 'Emails' },
    { id: 2, type: 'delivered', title: 'Delivered November newsletter', time: 'Today, 5:10 pm', category: 'Emails' },
    { id: 3, type: 'clicked', title: 'Clicked “Browse products” in Welcome email', time: 'Today, 9:31 am', category: 'Emails' },
    { id: 4, type: 'opened', title: 'Opened Welcome email (automation)', time: 'Today, 9:30 am', category: 'Emails' },
    { id: 5, type: 'group', title: 'Added to Newsletter and Customers', time: 'Today, 9:16 am · by the signup form', category: 'Changes' },
    { id: 6, type: 'confirmed', title: 'Confirmed subscription', time: 'Today, 9:16 am', category: 'Changes' }
  ]).filter(item => {
    if (activeTab === 'Emails') return item.category === 'Emails';
    if (activeTab === 'Changes') return item.category === 'Changes';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/contacts')}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">{firstName} {lastName}</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Contact since 20 Nov 2026 · {city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => alert(`Unsubscribing ${firstName}...`)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-gray-200 transition-colors shadow-2xs"
          >
            Unsubscribe
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
              isEditing ? 'bg-black text-white' : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Editing Mode' : 'Edit Fields'}</span>
          </button>

          <button
            onClick={() => alert(`Opening email composer for ${email}`)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send an email</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
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
                {(firstName[0] || 'U') + (lastName[0] || '')}
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    ✓ Subscribed
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                    {plan} plan
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats counters */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Received</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.received ?? 2}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Opened</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.opened ?? 2}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-gray-50">
                <span className="text-[11px] font-medium text-gray-500">Clicked</span>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{contact.stats?.clicked ?? 1}</p>
              </div>
            </div>
          </div>

          {/* Fields Card (Fully Interactive Inputs & Update) */}
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
                {/* First Name */}
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
                    <span className="font-bold text-gray-900 text-right">{firstName}</span>
                  )}
                </div>

                {/* Last Name */}
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
                    <span className="font-bold text-gray-900 text-right">{lastName}</span>
                  )}
                </div>

                {/* City */}
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
                    <span className="font-bold text-gray-900 text-right">{city}</span>
                  )}
                </div>

                {/* Plan */}
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
                    <span className="font-bold text-gray-900 text-right">{plan}</span>
                  )}
                </div>

                {/* Last purchase */}
                <div className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                  <span className="text-gray-500 font-medium w-28 shrink-0">Last purchase</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={lastPurchase}
                      onChange={(e) => setLastPurchase(e.target.value)}
                      className="bg-[#fafafa] border border-gray-200 rounded-lg p-1.5 text-xs font-bold text-gray-900 flex-1 focus:outline-none focus:border-black"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-right">{lastPurchase}</span>
                  )}
                </div>

                {/* User added Custom Fields */}
                {customFields.map((cf, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-50 gap-2">
                    <span className="text-gray-500 font-medium w-28 shrink-0">{cf.name}</span>
                    <span className="font-bold text-purple-700 text-right">{cf.value}</span>
                  </div>
                ))}
              </div>

              {/* Add custom field row */}
              {showAddField && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2 animate-in fade-in">
                  <p className="text-[11px] font-bold text-purple-900">Add Custom Field to this Contact</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Field Name (e.g. Phone, Company)"
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
              {assignedGroups.map(grp => (
                <span key={grp} className="px-2.5 py-1 rounded-xl bg-gray-100 text-gray-800 font-semibold flex items-center gap-1">
                  <span>{grp}</span>
                  {showAddGroup && (
                    <button onClick={() => toggleGroup(grp)} className="hover:text-rose-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                Segment · Engaged last 30 days
              </span>
            </div>

            {showAddGroup && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 mt-2">
                <p className="text-[11px] font-bold text-gray-700">Toggle Group Membership:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Newsletter', 'Customers', 'VIP', 'Beta testers'].map(g => {
                    const isMember = assignedGroups.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGroup(g)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                          isMember ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {isMember ? `✓ ${g}` : `+ ${g}`}
                      </button>
                    );
                  })}
                </div>
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
                  <h3 className="font-bold text-sm text-gray-900">Consent record</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Proof that {firstName} asked to hear from you</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                ✓ Double opt-in
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Source</span>
                <p className="font-bold text-gray-900 mt-1">Signup form</p>
                <p className="text-gray-500 font-mono text-[11px] mt-0.5">acme.example.com/newsletter</p>
              </div>

              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Agreed to</span>
                <p className="font-bold text-gray-900 mt-1">Newsletter and offers</p>
              </div>

              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Signed up</span>
                <p className="font-bold text-gray-900 mt-1">20 Nov 2026, 9:14 am</p>
                <p className="text-gray-500 font-mono text-[11px] mt-0.5">IP 203.0.113.24</p>
              </div>

              <div className="bg-[#fafafa] p-3 rounded-2xl border border-gray-100">
                <span className="text-gray-400 font-medium">Confirmed by email</span>
                <p className="font-bold text-gray-900 mt-1">20 Nov 2026, 9:16 am</p>
              </div>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Activity</h2>
              <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
                {['All', 'Emails', 'Changes'].map(tab => (
                  <button
                    key={tab}
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

            <div className="space-y-4 pt-2">
              {filteredActivity.map((act) => {
                let dotColor = 'bg-emerald-500';
                if (act.type === 'delivered') dotColor = 'bg-gray-400';
                if (act.type === 'clicked') dotColor = 'bg-purple-600';
                if (act.type === 'group') dotColor = 'bg-gray-400';

                return (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <span className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`} />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 leading-snug">{act.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
