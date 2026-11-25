import React, { useState } from 'react';
import { Outlet, Link, useLocation, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import ImportContactsModal from './ImportContactsModal';
import NewGroupModal from './NewGroupModal';
import AddContactModal from './AddContactModal';
import HostingerNoticeModal from './HostingerNoticeModal';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Server, 
  Eye, 
  ExternalLink, 
  HelpCircle, 
  Menu, 
  X, 
  Plus, 
  LayoutDashboard, 
  Users, 
  Send, 
  Zap, 
  Mail,
  MoreHorizontal
} from 'lucide-react';

export default function Layout() {
  const { 
    dashboardMode, 
    setDashboardMode, 
    isImportModalOpen, 
    setIsImportModalOpen,
    isNewGroupModalOpen,
    setIsNewGroupModalOpen,
    isAddContactModalOpen,
    setIsAddContactModalOpen,
    isSimulationMode,
    setIsSimulationMode 
  } = useApp();
  
  const [isHostingerModalOpen, setIsHostingerModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // If on subscriber portal pages, render full screen without admin sidebar
  const isPublicPage = location.pathname.startsWith('/preferences') || location.pathname.startsWith('/unsubscribed');

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col justify-between">
        <header className="p-4 flex items-center justify-between max-w-4xl mx-auto w-full">
          <Link to="/" className="text-xs text-gray-500 hover:text-black font-semibold flex items-center gap-1.5">
            ← Back to Admin App
          </Link>
          <span className="text-[11px] bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-600 font-medium shadow-2xs">
            Public Subscriber View
          </span>
        </header>

        <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <Outlet />
        </main>

        <footer className="p-4 text-center text-xs text-gray-400">
          Bulk Mailer &copy; 2026 Acme Team
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col antialiased text-gray-900 font-sans pb-16 md:pb-0">
      {/* Top Demo & Helper Banner (Responsive wrapping) */}
      <div className="bg-black text-white px-3 py-1.5 text-xs flex items-center justify-between flex-wrap gap-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-bold flex items-center gap-1.5 text-amber-300 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Bulk Mailer</span> Preview
          </span>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          
          {/* Quick toggle between Page 1 (Empty Onboarding) & Page 2 (Live Dashboard) */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={() => setDashboardMode('live')}
              className={`px-2 py-0.5 rounded text-[10.5px] sm:text-[11px] font-semibold transition-colors ${
                dashboardMode === 'live' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setDashboardMode('empty')}
              className={`px-2 py-0.5 rounded text-[10.5px] sm:text-[11px] font-semibold transition-colors ${
                dashboardMode === 'empty' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Onboarding
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[10.5px] sm:text-[11px]">
          <Link
            to="/preferences"
            className="text-zinc-300 hover:text-white hidden sm:flex items-center gap-1 font-medium"
          >
            <span>Preference Center</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Link>
          <button
            onClick={() => setIsHostingerModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 transition-colors"
          >
            <Server className="w-3 h-3" />
            <span>Hostinger Info</span>
          </button>
        </div>
      </div>

      {/* Mobile Top App Bar (visible on md:hidden) */}
      <div className="md:hidden bg-white border-b border-gray-200/80 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">Bulk Mailer</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/campaigns/new"
            className="p-1.5 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 px-2.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">New</span>
          </Link>
          <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-xs">
            AD
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            />
            {/* Drawer */}
            <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Scrollable Workspace Canvas with Responsive Padding */}
        <main className="flex-1 min-w-0 p-3.5 sm:p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb ergonomic quick switcher) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-1.5 flex items-center justify-around z-30 shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-700'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/contacts"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-700'
            }`
          }
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Contacts</span>
        </NavLink>

        <NavLink
          to="/campaigns"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-700'
            }`
          }
        >
          <Send className="w-4 h-4" />
          <span className="text-[10px]">Campaigns</span>
        </NavLink>

        <NavLink
          to="/automations"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
              isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-700'
            }`
          }
        >
          <Zap className="w-4 h-4" />
          <span className="text-[10px]">Automate</span>
        </NavLink>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Global Modals */}
      <ImportContactsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
      <NewGroupModal 
        isOpen={isNewGroupModalOpen} 
        onClose={() => setIsNewGroupModalOpen(false)} 
      />
      <AddContactModal 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)} 
      />
      <HostingerNoticeModal 
        isOpen={isHostingerModalOpen} 
        onClose={() => setIsHostingerModalOpen(false)} 
      />
    </div>
  );
}
