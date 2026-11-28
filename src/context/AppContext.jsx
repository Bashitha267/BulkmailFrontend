import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  getAuthToken,
  setAuthToken,
  setUnauthorizedHandler,
  workspaceApi,
  contactsApi,
  templatesApi,
  campaignsApi,
  settingsApi,
  domainsApi,
  groupsApi,
  segmentsApi,
  automationsApi,
  dashboardApi,
} from '../services/api';
import ToastContainer from '../components/ToastContainer';
import { decorateCampaign, decorateCampaigns } from '../lib/campaignView';

const AppContext = createContext();

const EMPTY_SETTINGS = {
  ses: { sendRate: 10, retries: 3, dailyLimit: 0 },
  compliance: {
    address: '',
    oneClickUnsubscribe: true,
    doubleOptIn: true,
    preferencePage: true,
  },
  fields: [],
  domains: [],
  senders: [],
  team: [],
  auditLog: [],
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [dashboardMode, setDashboardMode] = useState('live');

  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [segments, setSegments] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [summary, setSummary] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = 'info', title, message, duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast]
  );

  const loadWorkspace = useCallback(async () => {
    setDataLoading(true);
    try {
      // The backend has no single bootstrap call any more; load each list in parallel.
      const [contactsRes, campaignsRes, templatesRes, groupsRes, segmentsRes, automationsRes, settingsRes, summaryRes] =
        await Promise.all([
          contactsApi.list({ pageSize: 100 }),
          campaignsApi.list(),
          templatesApi.list(),
          groupsApi.list(),
          segmentsApi.list(),
          automationsApi.list(),
          settingsApi.get(),
          dashboardApi.summary(),
        ]);
      setContacts(contactsRes.contacts || []);
      setCampaigns(decorateCampaigns(campaignsRes.campaigns));
      setTemplates(templatesRes.templates || []);
      setGroups(groupsRes.groups || []);
      setSegments(segmentsRes.segments || []);
      setAutomations(automationsRes.automations || []);
      setSettings({
        ...EMPTY_SETTINGS,
        ...(settingsRes.settings || {}),
        team: settingsRes.team || [],
        auditLog: settingsRes.auditLog || [],
        sesInfo: settingsRes.ses || null,
        allowance: settingsRes.allowance || null,
      });
      setSummary(summaryRes);
      setIsSimulationMode(summaryRes.sesMode !== 'live');
    } catch (err) {
      notify({
        type: 'error',
        title: 'Failed to load workspace',
        message: err.message,
      });
    } finally {
      setDataLoading(false);
    }
  }, [notify]);

  // Sign out automatically when the server says the session has expired.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken(null);
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Restore JWT session on app mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        if (res?.user) setUser(res.user);
      })
      .catch(() => {
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // Load real backend data whenever authenticated user is present
  useEffect(() => {
    if (user) {
      loadWorkspace();
    }
  }, [user, loadWorkspace]);

  // Poll campaigns while any campaign is actively Sending via cron queue
  const hasSendingCampaign = campaigns.some((c) => c.status === 'Sending');
  useEffect(() => {
    if (!user || !hasSendingCampaign) return undefined;

    const timer = setInterval(async () => {
      try {
        const res = await campaignsApi.list();
        if (res?.campaigns) {
          setCampaigns(decorateCampaigns(res.campaigns));
        }
      } catch {
        // Ignore transient poll errors
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [user, hasSendingCampaign]);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    setAuthToken(res.token);
    setUser(res.user);
    notify({ type: 'success', title: 'Welcome back', message: `Signed in as ${res.user.name}` });
    return res.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on stateless logout
    }
    setAuthToken(null);
    setUser(null);
    setContacts([]);
    setCampaigns([]);
    setTemplates([]);
    setGroups([]);
    setSegments([]);
    setAutomations([]);
    setSettings(EMPTY_SETTINGS);
    setSummary(null);
    notify({ type: 'info', message: 'You have been logged out.' });
  };

  // Reload what depends on contacts: group counts, contact list, sidebar summary.
  const refreshAudience = useCallback(async () => {
    try {
      const [contactsRes, groupsRes, summaryRes] = await Promise.all([
        contactsApi.list({ pageSize: 100 }),
        groupsApi.list(),
        dashboardApi.summary(),
      ]);
      setContacts(contactsRes.contacts || []);
      setGroups(groupsRes.groups || []);
      setSummary(summaryRes);
    } catch {
      // keep what we have
    }
  }, []);

  // Contacts mutations
  const createContact = async (payload) => {
    const res = await contactsApi.create(payload);
    setContacts((prev) => [res.contact, ...prev]);
    refreshAudience();
    notify({ type: 'success', title: 'Contact added', message: `${res.contact.name} was added.` });
    return res.contact;
  };

  const addImportedContacts = async (payload) => {
    const res = await contactsApi.importBulk(payload);
    await refreshAudience();
    const skipped = (res.duplicates || 0) + (res.invalid || 0);
    notify({
      type: res.imported > 0 ? 'success' : 'warning',
      title: 'CSV import finished',
      message: `${res.imported} imported${res.duplicates ? `, ${res.duplicates} already existed` : ''}${res.invalid ? `, ${res.invalid} invalid` : ''}.${skipped && !res.imported ? ' Nothing new was added.' : ''}`,
    });
    return res;
  };

  const updateContact = async (id, updates) => {
    const res = await contactsApi.update(id, updates);
    setContacts((prev) => prev.map((c) => (c.id === id ? res.contact : c)));
    notify({ type: 'success', message: 'Contact details updated.' });
    return res.contact;
  };

  // Groups mutations
  const createGroup = async (payload) => {
    const res = await workspaceApi.createGroup(payload);
    setGroups((prev) => [res.group, ...prev]);
    await loadWorkspace();
    notify({ type: 'success', title: 'Group created', message: `"${res.group.name}" is ready.` });
    return res.group;
  };

  // Templates mutations
  const createTemplate = async (payload) => {
    const res = await templatesApi.create(payload);
    setTemplates((prev) => [...prev, res.template]);
    notify({ type: 'success', title: 'Template created', message: `"${res.template.name}" saved.` });
    return res.template;
  };

  const updateTemplate = async (id, payload) => {
    const res = await templatesApi.update(id, payload);
    setTemplates((prev) => prev.map((t) => (t.id === id ? res.template : t)));
    notify({ type: 'success', message: 'Template changes saved to server.' });
    return res.template;
  };

  // Campaigns mutations
  const createCampaign = async (payload) => {
    const res = await campaignsApi.create(payload);
    setCampaigns((prev) => [decorateCampaign(res.campaign), ...prev]);
    notify({
      type: 'success',
      title: res.campaign.status === 'Sending' ? 'Campaign queued' : 'Campaign scheduled',
      message:
        res.campaign.status === 'Sending'
          ? `Sending to ${res.campaign.stats?.total ?? 0} recipients.`
          : `Scheduled for ${res.campaign.sendAt ? new Date(res.campaign.sendAt).toLocaleString() : 'later'}.`,
    });
    return res.campaign;
  };

  const resumeCampaign = async (id) => {
    const res = await campaignsApi.resume(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? decorateCampaign(res.campaign) : c)));
    notify({ type: 'success', title: 'Campaign resumed', message: 'Sending the remaining emails.' });
    return res.campaign;
  };

  const pauseCampaign = async (id) => {
    const res = await campaignsApi.pause(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? decorateCampaign(res.campaign) : c)));
    notify({ type: 'warning', title: 'Campaign paused', message: 'Remaining recipients are held safely.' });
    return res.campaign;
  };

  const cancelCampaign = async (id) => {
    const res = await campaignsApi.cancel(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? decorateCampaign(res.campaign) : c)));
    notify({ type: 'info', message: 'Remaining sends cancelled.' });
    return res.campaign;
  };

  // Automations
  const toggleAutomation = async (id) => {
    const res = await workspaceApi.toggleAutomation(id);
    setAutomations((prev) => prev.map((a) => (a.id === id ? res.automation : a)));
    notify({
      type: 'success',
      message: `${res.automation.name} turned ${res.automation.active ? 'ON' : 'OFF'}.`,
    });
  };

  // Settings
  const saveSettings = async (payload) => {
    const res = await settingsApi.save(payload);
    const fresh = await settingsApi.get().catch(() => null);
    if (fresh?.settings) {
      setSettings({
        ...EMPTY_SETTINGS,
        ...fresh.settings,
        team: fresh.team || [],
        auditLog: fresh.auditLog || [],
        sesInfo: fresh.ses || null,
        allowance: fresh.allowance || null,
      });
      if (fresh.ses?.mode) {
        setIsSimulationMode(fresh.ses.mode !== 'live');
      }
      notify({ type: 'success', message: 'Settings saved to server.' });
      return fresh.settings;
    }
    setSettings((prev) => ({ ...prev, ...(res.settings || {}) }));
    notify({ type: 'success', message: 'Settings saved to server.' });
    return res.settings;
  };

  const addField = async (field) => {
    try {
      const res = await settingsApi.addField(field);
      const nextFields = Array.isArray(res?.fields) ? res.fields : [];
      setSettings((prev) => ({ ...prev, fields: nextFields }));
      notify({ type: 'success', message: `Field "${field.name}" added.` });
    } catch (err) {
      notify({ type: 'error', title: 'Could not add field', message: err.message });
    }
  };

  const deleteField = async (key) => {
    try {
      const res = await settingsApi.deleteField(key);
      setSettings((prev) => ({ ...prev, fields: res.fields || prev.fields }));
      notify({ type: 'info', message: 'Custom field removed.' });
    } catch (err) {
      notify({ type: 'error', title: 'Could not remove field', message: err.message });
    }
  };

  const addSenderEmail = async (email) => {
    try {
      const res = await settingsApi.addSender(email);
      const nextSenders = Array.isArray(res?.senders) ? res.senders.filter(Boolean) : [];
      setSettings((prev) => ({ ...prev, senders: nextSenders }));
      notify({
        type: 'success',
        title: 'Sender added',
        message: res?.message || `Sender ${email} added.`,
      });
    } catch (err) {
      notify({ type: 'error', title: 'Could not add sender', message: err.message });
    }
  };

  const setDefaultSenderEmail = async (email) => {
    try {
      const res = await settingsApi.setDefaultSender(email);
      const nextSenders = Array.isArray(res?.senders) ? res.senders.filter(Boolean) : [];
      setSettings((prev) => ({ ...prev, senders: nextSenders }));
      notify({ type: 'success', message: `${email} set as default sender.` });
    } catch (err) {
      notify({ type: 'error', title: 'Could not update default sender', message: err.message });
    }
  };

  const removeSenderEmail = async (email) => {
    try {
      const res = await settingsApi.removeSender(email);
      const nextSenders = Array.isArray(res?.senders) ? res.senders.filter(Boolean) : [];
      setSettings((prev) => ({ ...prev, senders: nextSenders }));
      notify({ type: 'info', message: `Removed sender ${email}.` });
    } catch (err) {
      notify({ type: 'error', title: 'Could not remove sender', message: err.message });
    }
  };

  const addDomain = async (domainName) => {
    try {
      const res = await domainsApi.add(domainName);
      if (res?.domain) {
        setSettings((prev) => ({ ...prev, domains: [...(prev.domains || []), res.domain] }));
        notify({ type: 'success', message: `Domain ${res.domain.name} added.` });
      }
    } catch (err) {
      notify({ type: 'error', title: 'Could not add domain', message: err.message });
    }
  };

  const inviteTeamMember = async (member) => {
    try {
      const res = await settingsApi.inviteTeam(member);
      if (Array.isArray(res?.team)) {
        setSettings((prev) => ({ ...prev, team: res.team }));
      }
      notify({
        type: 'success',
        title: res?.emailed ? 'Invitation emailed' : 'Team member added',
        message: res?.emailed
          ? `Invitation sent to ${member.email}.`
          : res?.tempPassword
          ? `Temporary password for ${member.email}: ${res.tempPassword}`
          : `${member.email} added to team.`,
        duration: res?.tempPassword ? 10000 : 3500,
      });
      return res;
    } catch (err) {
      notify({ type: 'error', title: 'Could not invite member', message: err.message });
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        dataLoading,
        login,
        logout,
        notify,
        loadWorkspace,
        summary,
        refreshAudience,
        isSimulationMode,
        setIsSimulationMode,
        dashboardMode,
        setDashboardMode,
        contacts,
        setContacts,
        campaigns,
        setCampaigns,
        templates,
        setTemplates,
        groups,
        setGroups,
        segments,
        setSegments,
        automations,
        setAutomations,
        settings,
        setSettings,
        isImportModalOpen,
        setIsImportModalOpen,
        isNewGroupModalOpen,
        setIsNewGroupModalOpen,
        isAddContactModalOpen,
        setIsAddContactModalOpen,
        createContact,
        addImportedContacts,
        updateContact,
        createGroup,
        createTemplate,
        updateTemplate,
        createCampaign,
        resumeCampaign,
        pauseCampaign,
        cancelCampaign,
        toggleAutomation,
        saveSettings,
        addField,
        deleteField,
        addSenderEmail,
        setDefaultSenderEmail,
        removeSenderEmail,
        addDomain,
        inviteTeamMember,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
