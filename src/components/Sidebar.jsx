import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  LayoutTemplate, 
  Send, 
  Zap, 
  BarChart3, 
  Settings, 
  Search,
  Mail,
  ShieldAlert,
  LogOut,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ onClose }) {
  const { user, logout, contacts, templates, campaigns } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Contacts', path: '/contacts', icon: Users, badge: String(contacts.length) },
    { name: 'Templates', path: '/templates', icon: LayoutTemplate, badge: String(templates.length), subBadge: 'starters' },
    { name: 'Campaigns', path: '/campaigns', icon: Send, badge: String(campaigns.length) },
    { name: 'Automations', path: '/automations', icon: Zap, pill: 'New' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 h-full select-none overflow-y-auto">
      <div className="p-4">
        {/* Brand Header + Close button on mobile */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/" 
            onClick={handleNavClick}
            className="flex items-center gap-3 px-2 py-1 group"
          >
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] leading-tight text-gray-900 tracking-tight">Bulk Mailer</h1>
              <p className="text-xs text-gray-400 font-medium">Acme Team</p>
            </div>
          </Link>

          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative mb-5 px-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search contacts, cam..."
            className="w-full bg-[#f4f5f7] hover:bg-gray-200/60 focus:bg-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-transparent focus:border-gray-300 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
          />
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.subBadge && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          {item.subBadge}
                        </span>
                      )}
                      {item.pill && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md font-semibold tracking-wide">
                          {item.pill}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Go-live setup widget */}
        <div 
          onClick={() => {
            navigate('/domains');
            handleNavClick();
          }}
          className="mt-6 mx-1 p-3.5 bg-[#fef3c7]/60 hover:bg-[#fef3c7] border border-[#fde68a] rounded-2xl cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-900">Go-live setup</span>
            <span className="text-[11px] font-semibold bg-[#fde68a] text-gray-800 px-2 py-0.5 rounded-full">
              4 of 5
            </span>
          </div>
          <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-amber-600 h-full rounded-full w-4/5" />
          </div>
          <p className="text-[11.5px] text-amber-900 font-medium leading-tight">
            Next: add your DMARC record
          </p>
        </div>
      </div>

      {/* Bottom section: Settings & User Profile */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors ${
              isActive ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-xs tracking-wider">
              {user?.initials || 'AD'}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-gray-400">{user?.role || 'Owner'}</p>
            </div>
          </div>
          <button 
            title="Log out"
            onClick={async () => {
              await logout();
              if (onClose) onClose();
              navigate('/login');
            }}
            className="text-xs text-gray-400 hover:text-gray-700 font-medium underline"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
