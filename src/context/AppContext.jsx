import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  getAuthToken,
  setAuthToken,
  workspaceApi,
  contactsApi,
  templatesApi,
  campaignsApi,
  settingsApi,
} from '../services/api';
import ToastContainer from '../components/ToastContainer';

const AppContext = createContext();

const EMPTY_SETTINGS = {
  ses: {
    region: 'Asia Pacific (Mumbai)',
    status: 'Connected',
    sendRate: 10,
    sesLimit: 14,
    retries: 3,
    dailyLimit: '1,000 (warm-up)',
  },
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

  const [isSimulationMode, setIsSimulationMode] = useState(true);
  const [dashboardMode, setDashboardMode] = useState('live');

  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [segments, setSegments] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);

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
      const data = await workspaceApi.bootstrap();
      setContacts(data.contacts || []);
      setCampaigns(data.campaigns || []);
      setTemplates(data.templates || []);
      setGroups(data.groups || []);
      setSegments(data.segments || []);
      setAutomations(data.automations || []);
      setSettings(data.settings || EMPTY_SETTINGS);
      setIsSimulationMode(data.sesMode !== 'live');
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
          setCampaigns(res.campaigns);
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
    notify({ type: 'info', message: 'You have been logged out.' });
  };

  // Contacts mutations
  const createContact = async (payload) => {
    const res = await contactsApi.create(payload);
    setContacts((prev) => [res.contact, ...prev]);
    notify({ type: 'success', title: 'Contact added', message: `${res.contact.name} was added.` });
    return res.contact;
  };

  const addImportedContacts = async (newContactsList) => {
    const res = await contactsApi.importBulk(newContactsList);
    setContacts((prev) => [...res.contacts, ...prev]);
    notify({
      type: 'success',
      title: 'CSV Imported',
      message: `${res.importedCount} contacts imported successfully.`,
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
    setCampaigns((prev) => [res.campaign, ...prev]);
    notify({
      type: 'success',
      title: res.campaign.status === 'Sending' ? 'Campaign queued' : 'Campaign scheduled',
      message:
        res.campaign.status === 'Sending'
          ? `Dispatching to ${res.campaign.recipientsCount} recipients via Amazon SES cron.`
          : `Scheduled for ${res.campaign.scheduledDate}.`,
    });
    return res.campaign;
  };

  const resumeCampaign = async (id) => {
    const res = await campaignsApi.resume(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
    notify({ type: 'success', title: 'Campaign resumed', message: 'Cron worker is sending remaining emails.' });
    return res.campaign;
  };

  const pauseCampaign = async (id) => {
    const res = await campaignsApi.pause(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
    notify({ type: 'warning', title: 'Campaign paused', message: 'Remaining recipients are held safely.' });
    return res.campaign;
  };

  const cancelCampaign = async (id) => {
    const res = await campaignsApi.cancel(id);
    setCampaigns((prev) => prev.map((c) => (c.id === id ? res.campaign : c)));
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
    setSettings(res.settings);
    notify({ type: 'success', message: 'Settings saved to server.' });
    return res.settings;
  };

  const addField = async (field) => {
    const res = await settingsApi.addField(field);
    setSettings((prev) => ({ ...prev, fields: [...prev.fields, res.field] }));
    notify({ type: 'success', message: `Field "${res.field.name}" added.` });
  };

  const deleteField = async (id) => {
    const res = await settingsApi.deleteField(id);
    setSettings((prev) => ({ ...prev, fields: res.fields }));
    notify({ type: 'info', message: 'Custom field removed.' });
  };

  const addSenderEmail = async (email) => {
    const res = await settingsApi.addSender(email);
    setSettings((prev) => ({ ...prev, senders: [...prev.senders, res.sender] }));
    notify({ type: 'success', message: `Sender ${res.sender.email} added.` });
  };

  const addDomain = async (domainName) => {
    const res = await settingsApi.addDomain(domainName);
    setSettings((prev) => ({ ...prev, domains: [...prev.domains, res.domain] }));
    notify({ type: 'success', message: `Domain ${res.domain.name} added.` });
  };

  const inviteTeamMember = async (member) => {
    const res = await settingsApi.inviteTeam(member);
    setSettings((prev) => ({ ...prev, team: [...prev.team, res.member] }));
    notify({ type: 'success', message: `Invitation sent to ${res.member.email}.` });
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
