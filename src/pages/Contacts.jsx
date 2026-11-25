import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  CheckCircle2, 
  UserX, 
  RotateCcw, 
  Flag, 
  Upload, 
  Download, 
  Plus, 
  Filter, 
  SlidersHorizontal,
  Search,
  ExternalLink
} from 'lucide-react';

export default function Contacts() {
  const { contacts, setIsImportModalOpen, setIsAddContactModalOpen } = useApp();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { label: 'All', count: '1,200' },
    { label: 'Can receive', count: '1,129' },
    { label: 'Unsubscribed', count: '41' },
    { label: 'Bounced', count: '29' },
    { label: 'Complained', count: '1' },
    { label: 'Groups & segments', count: '7', isSpecial: true },
  ];

  const filteredContacts = contacts.filter(contact => {
    if (activeFilter === 'Can receive') {
      if (contact.status === 'Unsubscribed' || contact.status === 'Bounced' || contact.status === 'Complained') return false;
    } else if (activeFilter === 'Unsubscribed') {
      if (contact.status !== 'Unsubscribed') return false;
    } else if (activeFilter === 'Bounced') {
      if (contact.status !== 'Bounced') return false;
    } else if (activeFilter === 'Complained') {
      if (contact.status !== 'Complained') return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Contacts</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Everyone here agreed to hear from you · consent is recorded for each person
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Exporting contacts to CSV...')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-black text-white hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add contact</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">All contacts</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,200</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Can receive</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,129</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Unsubscribed</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">41</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Bounced</span>
            <div className="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">29</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Spam complaints</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flag className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">1</p>
        </div>
      </div>

      {/* Filter Pills Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0">
          {filterTabs.map((tab) => {
            if (tab.isSpecial) {
              return (
                <button
                  key={tab.label}
                  onClick={() => navigate('/segments')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 flex items-center gap-1 shrink-0 transition-colors whitespace-nowrap"
                >
                  <Filter className="w-3 h-3 text-gray-400" />
                  <span>{tab.label} · {tab.count}</span>
                </button>
              );
            }

            const isSelected = activeFilter === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveFilter(tab.label)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100/70 border border-gray-200'
                }`}
              >
                {tab.label} · {tab.count}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-200 text-xs pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <button className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="w-3 h-3 text-gray-500" />
            <span>Columns</span>
          </button>
        </div>
      </div>

      {/* Contacts Table Card */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] text-gray-400 font-semibold border-b border-gray-100 uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Groups</th>
                <th className="py-3 px-3">Consent</th>
                <th className="py-3 px-3">Last activity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
              {filteredContacts.map((contact) => {
                // Status badge styling
                let statusBadge = (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1">
                    ✓ Subscribed
                  </span>
                );
                if (contact.status === 'Complained') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold text-[11px] inline-flex items-center gap-1">
                      ! Complained
                    </span>
                  );
                } else if (contact.status === 'Unsubscribed') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[11px]">
                      Unsubscribed
                    </span>
                  );
                } else if (contact.status === 'Bounced') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-semibold text-[11px]">
                      Bounced
                    </span>
                  );
                }

                // Plan badge
                let planBadge = (
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10.5px]">
                    {contact.plan}
                  </span>
                );
                if (contact.plan === 'Pro') {
                  planBadge = (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold text-[10.5px]">
                      Pro
                    </span>
                  );
                } else if (contact.plan === 'Business') {
                  planBadge = (
                    <span className="px-2 py-0.5 rounded bg-black text-white font-semibold text-[10.5px]">
                      Business
                    </span>
                  );
                }

                return (
                  <tr key={contact.id} className="hover:bg-gray-50/70 transition-colors group">
                    {/* Contact avatar & info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {contact.initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{contact.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">{contact.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-gray-600 font-medium">{contact.city}</td>

                    <td className="py-3 px-3">{planBadge}</td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.groups.map((grp, i) => (
                          <span key={i} className="text-[11px] text-gray-600 bg-gray-100/80 px-1.5 py-0.5 rounded">
                            {grp}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-gray-900 font-medium">{contact.consent}</p>
                      <p className="text-[10.5px] text-gray-400">{contact.consentDate}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-gray-700 font-medium">{contact.lastActivity}</p>
                    </td>

                    <td className="py-3 px-3">{statusBadge}</td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        className="px-3 py-1 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs transition-colors"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-[#fafafa]">
          <span>Showing 1–10 of 1,200 contacts</span>
          <div className="flex items-center gap-2">
            <button 
              disabled 
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-400 cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => alert('Next page')}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
