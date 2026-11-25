import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AddContactModal({ isOpen, onClose }) {
  const { setContacts, groups } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [plan, setPlan] = useState('Free');
  const [selectedGroups, setSelectedGroups] = useState(['Newsletter']);

  if (!isOpen) return null;

  const toggleGroup = (name) => {
    setSelectedGroups(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!email.trim() || !firstName.trim()) {
      alert('First name and email are required.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const initials = (firstName[0] || 'U') + (lastName[0] || '');

    const newContact = {
      id: email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: fullName,
      initials: initials.toUpperCase(),
      email: email.trim(),
      city: city.trim() || 'Colombo',
      plan,
      groups: selectedGroups,
      consent: 'Manual entry',
      consentDate: 'Today',
      lastActivity: 'Added just now',
      status: 'Subscribed',
      stats: { received: 0, opened: 0, clicked: 0 },
      activity: [
        { id: Date.now(), type: 'group', title: `Added to ${selectedGroups.join(', ')}`, time: 'Just now', category: 'Changes' }
      ]
    };

    setContacts(prev => [newContact, ...prev]);
    alert(`Contact ${fullName} (${email}) added successfully!`);
    
    // Reset form
    setFirstName('');
    setLastName('');
    setEmail('');
    setCity('');
    setPlan('Free');
    setSelectedGroups(['Newsletter']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Add New Contact</h2>
              <p className="text-xs text-gray-400">Add subscriber details to your list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAddContact} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                placeholder="e.g. John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Colombo, Kandy"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 font-medium text-gray-900 focus:outline-none focus:border-black"
              >
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          {/* Groups Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Assign to Groups</label>
            <div className="grid grid-cols-2 gap-2">
              {['Newsletter', 'Customers', 'VIP', 'Beta testers'].map(grp => {
                const isChecked = selectedGroups.includes(grp);
                return (
                  <div
                    key={grp}
                    onClick={() => toggleGroup(grp)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked ? 'bg-black text-white border-black font-bold' : 'bg-[#fafafa] border-gray-200 text-gray-700 font-medium'
                    }`}
                  >
                    <span>{grp}</span>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isChecked ? 'bg-white text-black' : 'border-gray-400'}`}>
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-bold bg-black text-white hover:bg-zinc-800 transition-all shadow-sm"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
