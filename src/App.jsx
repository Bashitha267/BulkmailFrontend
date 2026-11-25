import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import Contacts from './pages/Contacts';
import ContactDetail from './pages/ContactDetail';
import Segments from './pages/Segments';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import CampaignEdit from './pages/CampaignEdit';
import CampaignReview from './pages/CampaignReview';
import CampaignReport from './pages/CampaignReport';
import Analytics from './pages/Analytics';
import Automations from './pages/Automations';
import Settings from './pages/Settings';
import Preferences from './pages/Preferences';
import Unsubscribed from './pages/Unsubscribed';

function ProtectedLayout() {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="text-xs font-semibold text-gray-500">Loading workspace...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Public Subscriber Portal */}
          <Route path="/" element={<Layout />}>
            <Route path="preferences" element={<Preferences />} />
            <Route path="unsubscribed" element={<Unsubscribed />} />
          </Route>

          {/* Protected Admin App */}
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="domains" element={<Domains />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="contacts/:id" element={<ContactDetail />} />
            <Route path="segments" element={<Segments />} />
            <Route path="templates" element={<Templates />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/new" element={<CampaignEdit />} />
            <Route path="campaigns/:id/edit" element={<CampaignEdit />} />
            <Route path="campaigns/:id/review" element={<CampaignReview />} />
            <Route path="campaigns/:id/report" element={<CampaignReport />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="automations" element={<Automations />} />
            <Route path="settings" element={<Settings />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
