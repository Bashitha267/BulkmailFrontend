import React, { useState } from 'react';
import { X, Users, Check, Sparkles, FolderPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NewGroupModal({ isOpen, onClose }) {
  const { contacts, setGroups } = useApp();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultTemplate, setDefaultTemplate] = useState('Monthly newsletter');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const toggleSelectContact = (id) => {
    setSelectedContacts(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    const newGroup = {
      id: groupName.toLowerCase().replace(/\s+/g, '-'),
      name: groupName.trim(),
      description: description.trim(),
      defaultTemplate,
      total: selectedContacts.length || 0,
      canReceive: selectedContacts.length || 0,
    };

    setGroups(prev => [newGroup, ...prev]);
    alert(`Group "${groupName}" created with ${selectedContacts.length} contacts!`);
    setGroupName('');
    setDescription('');
    setSelectedContacts([]);
    onClose();
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create New Subscriber Group</h2>
              <p className="text-xs text-gray-500">Group your subscribers for targeted Amazon SES blasts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Group Name</label>
            <input
              type="text"
              placeholder="e.g. VIP Customers, Weekend Readers, Region Alpha..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="e.g. High-engagement subscribers receiving personalized weekly updates"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Default Template for this Group</label>
            <select
              value={defaultTemplate}
              onChange={(e) => setDefaultTemplate(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-black"
            >
              <option>Monthly newsletter</option>
              <option>Welcome series</option>
              <option>Black Friday promotion</option>
              <option>Product update announcement</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              You can override this template whenever dispatching campaigns.
            </p>
          </div>

          {/* Add Contacts to this Group */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700">
                Add Contacts to this Group ({selectedContacts.length} selected)
              </label>
              <button
                type="button"
                onClick={selectAllContacts}
                className="text-xs font-bold text-black hover:underline"
              >
                {selectedContacts.length === contacts.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            <input
              type="text"
              placeholder="Filter contacts..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#fafafa] border border-gray-200 rounded-xl p-2 text-xs mb-2 focus:outline-none focus:border-black"
            />

            <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-50 bg-[#fafafa] p-1">
              {filteredContacts.map(c => {
                const isSelected = selectedContacts.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelectContact(c.id)}
                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-amber-50 text-amber-950 font-bold' : 'hover:bg-white text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        isSelected ? 'bg-black border-black text-white' : 'border-gray-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{c.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono truncate max-w-[160px]">{c.email}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Amazon SES will deliver to each member automatically.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 transition-all shadow-sm"
              >
                Create Group
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
