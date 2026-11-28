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
    user,
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
          <span className="text-sm font-bold text-gray-900 flex items-center gap-2"><Mail className="w-4 h-4" /> Bulk Mailer</span>
        </header>

        <main className="flex-1 flex items-center justify-center p-3 sm:p-4">
          <Outlet />
        </main>

        <footer className="p-4 text-center text-xs text-gray-400">
          Bulk Mailer
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col antialiased text-gray-900 font-sans pb-16 md:pb-0">
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
            {user?.initials || ''}
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
