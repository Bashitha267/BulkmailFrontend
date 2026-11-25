import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getAuthToken, setAuthToken } from '../services/api';

const AppContext = createContext();

const INITIAL_CONTACTS = [
  {
    id: 'ravi-herath',
    name: 'Ravi Herath',
    initials: 'RH',
    email: 'ravi.herath88@demo.org',
    city: 'Colombo',
    plan: 'Pro',
    groups: ['Newsletter', 'Customers'],
    consent: 'Signup form',
    consentDate: '20 Nov',
    lastActivity: 'Opened 5:11 pm',
    status: 'Subscribed',
    stats: { received: 2, opened: 2, clicked: 1 },
    consentRecord: {
      source: 'Signup form',
      url: 'acme.example.com/newsletter',
      agreedTo: 'Newsletter and offers',
      signedUp: '20 Nov 2026, 9:14 am',
      ip: '203.0.113.24',
      confirmedByEmail: '20 Nov 2026, 9:16 am',
      doubleOptIn: true
    },
    activity: [
      { id: 1, type: 'opened', title: 'Opened November newsletter', time: 'Today, 5:11 pm · iPhone · Gmail app', category: 'Emails' },
      { id: 2, type: 'delivered', title: 'Delivered November newsletter', time: 'Today, 5:10 pm', category: 'Emails' },
      { id: 3, type: 'clicked', title: 'Clicked "Browse products" in Welcome email', time: 'Today, 9:31 am', category: 'Emails' },
      { id: 4, type: 'opened', title: 'Opened Welcome email (automation)', time: 'Today, 9:30 am', category: 'Emails' },
      { id: 5, type: 'group', title: 'Added to Newsletter and Customers', time: 'Today, 9:16 am · by the signup form', category: 'Changes' },
      { id: 6, type: 'confirmed', title: 'Confirmed subscription', time: 'Today, 9:16 am', category: 'Changes' }
    ]
  },
  {
    id: 'mia-jayasinghe',
    name: 'Mia Jayasinghe',
    initials: 'MJ',
    email: 'mia.jayasinghe173@mail.test',
    city: 'Kandy',
    plan: 'Free',
    groups: ['Newsletter'],
    consent: 'Signup form',
    consentDate: '20 Nov',
    lastActivity: 'No opens yet',
    status: 'Subscribed',
    stats: { received: 1, opened: 0, clicked: 0 }
  },
  {
    id: 'john-silva',
    name: 'John Silva',
    initials: 'JS',
    email: 'john.silva636@sample.net',
    city: 'Galle',
    plan: 'Pro',
    groups: ['Newsletter', 'Customers'],
    consent: 'Checkout',
    consentDate: '20 Nov',
    lastActivity: 'Opened today',
    status: 'Subscribed',
    stats: { received: 3, opened: 2, clicked: 1 }
  },
  {
    id: 'sophia-smith',
    name: 'Sophia Smith',
    initials: 'SS',
    email: 'sophia.smith991@example.com',
    city: 'Colombo',
    plan: 'Business',
    groups: ['Newsletter', 'VIP'],
    consent: 'Checkout',
    consentDate: '20 Nov',
    lastActivity: 'Clicked today',
    status: 'Subscribed',
    stats: { received: 4, opened: 4, clicked: 3 }
  },
  {
    id: 'dilan-silva',
    name: 'Dilan Silva',
    initials: 'DS',
    email: 'dilan.silva1010@example.com',
    city: 'Negombo',
    plan: 'Free',
    groups: ['Customers'],
    consent: 'CSV import',
    consentDate: '19 Nov',
    lastActivity: 'Marked as spam today',
    status: 'Complained',
    stats: { received: 1, opened: 1, clicked: 0 }
  },
  {
    id: 'chamara-walker',
    name: 'Chamara Walker',
    initials: 'CW',
    email: 'chamara.walker288@sample.net',
    city: 'Colombo',
    plan: 'Business',
    groups: ['Newsletter', 'VIP'],
    consent: 'Checkout',
    consentDate: '19 Nov',
    lastActivity: 'Opened yesterday',
    status: 'Subscribed',
    stats: { received: 3, opened: 3, clicked: 2 }
  },
  {
    id: 'nimal-dias',
    name: 'Nimal Dias',
    initials: 'ND',
    email: 'nimal.dias826@example.com',
    city: 'Kandy',
    plan: 'Free',
    groups: ['Newsletter'],
    consent: 'Signup form',
    consentDate: '19 Nov',
    lastActivity: 'Unsubscribed today',
    status: 'Unsubscribed',
    stats: { received: 2, opened: 1, clicked: 0 }
  },
  {
    id: 'ava-walker',
    name: 'Ava Walker',
    initials: 'AW',
    email: 'ava.walker21@demo.org',
    city: 'Galle',
    plan: 'Pro',
    groups: ['Newsletter', 'Customers'],
    consent: 'CSV import',
    consentDate: '18 Nov',
    lastActivity: 'Opened 3 days ago',
    status: 'Subscribed',
    stats: { received: 3, opened: 2, clicked: 1 }
  },
  {
    id: 'lucas-wickramasinghe',
    name: 'Lucas Wickramasinghe',
    initials: 'LW',
    email: 'lucas.wickramasinghe193@sample.net',
    city: 'Colombo',
    plan: 'Pro',
    groups: ['Newsletter', 'Beta testers'],
    consent: 'Beta form',
    consentDate: '18 Nov',
    lastActivity: 'Clicked 4 days ago',
    status: 'Subscribed',
    stats: { received: 2, opened: 2, clicked: 2 }
  },
  {
    id: 'olivia-rajapaksha',
    name: 'Olivia Rajapaksha',
    initials: 'OR',
    email: 'olivia.rajapaksha240@sample.net',
    city: 'Matara',
    plan: 'Free',
    groups: ['Newsletter'],
    consent: 'Signup form',
    consentDate: '18 Nov',
    lastActivity: "Mailbox doesn't exist",
    status: 'Bounced',
    stats: { received: 1, opened: 0, clicked: 0 }
  }
];

const INITIAL_CAMPAIGNS = [
  {
    id: 'december-newsletter',
    month: 'Dec',
    day: '–',
    title: 'December newsletter',
    subtitle: 'Newsletter · 942 people · autosaved 5:09 pm',
    description: 'Subject, recipients and content set · not reviewed yet',
    status: 'Draft',
    subjectA: 'Our December update, {{firstName}}',
    abTest: true,
    subjectB: 'December at Acme: 3 things you’ll like',
    previewText: 'Our favourite updates from this year, plus what’s coming in 2027',
    recipientsCount: 942,
    scheduledDate: 'Tue 1 Dec 2026, 9:00 am',
    openedRate: null,
    clickedRate: null
  },
  {
    id: 'november-newsletter',
    month: 'Nov',
    day: '20',
    title: 'November newsletter',
    subtitle: 'Paused by Admin at 5:12 pm · 774 waiting',
    status: 'Paused',
    progress: { sent: 168, total: 942, waiting: 774, percentage: 17.8 },
    subject: 'Our monthly update, {{firstName}}',
    stats: { delivered: 149, opened: 3, bounced: 1, failed: 4, complaints: 1, waiting: 774 },
    linkClicks: [
      { title: 'Read the full update', url: 'example.com/blog', clicks: 0 },
      { title: 'Unsubscribe', url: 'Footer and one-click header', clicks: 0 }
    ],
    problems: [
      { recipient: 'Dilan Silva', email: 'dilan.silva1010@example.com', reason: '! Marked as spam · suppressed', action: 'Profile' },
      { recipient: 'Olivia Rajapaksha', email: 'olivia.rajapaksha240@sample.net', reason: 'Bounced · mailbox doesn’t exist', action: 'Profile' },
      { recipient: 'Nimal Gunawardena', email: 'nimal.gunawardena35@demo.org', reason: '! Failed · rejected after 3 tries', action: 'Retry' },
      { recipient: 'Tharindu Wilson', email: 'tharindu.wilson82@sample.net', reason: '! Failed · rejected after 3 tries', action: 'Retry' }
    ]
  },
  {
    id: 'vip-thank-you',
    month: 'Nov',
    day: '23',
    title: 'VIP thank you',
    subtitle: 'VIP · 63 people',
    description: 'Mon 23 Nov, 5:10 pm Colombo (UTC+5:30)',
    status: 'Scheduled',
    recipientsCount: 63
  },
  {
    id: 'dashboard-launch',
    month: 'Nov',
    day: '16',
    title: 'Dashboard launch',
    subtitle: 'Beta testers · 95 people',
    status: 'Completed',
    openedRate: '44.1%',
    clickedRate: '11.8%',
    sent: 94,
    delivered: 93,
    bounced: 1,
    complaints: 0,
    unsubscribed: 4
  },
  {
    id: 'black-friday-early-access',
    month: 'Nov',
    day: '8',
    title: 'Black Friday early access',
    subtitle: 'Customers · 519 people',
    status: 'Completed',
    openedRate: '40.8%',
    clickedRate: '10.3%',
    description: '298 didn’t open',
    sent: 517,
    delivered: 503,
    bounced: 14,
    complaints: 0,
    unsubscribed: 15
  },
  {
    id: 'october-newsletter',
    month: 'Oct',
    day: '23',
    title: 'October newsletter',
    subtitle: 'Newsletter · 1,000 people',
    status: 'Completed',
    openedRate: '43.7%',
    clickedRate: '10.9%',
    sent: 986,
    delivered: 962,
    bounced: 24,
    complaints: 0,
    unsubscribed: 22
  }
];

const INITIAL_TEMPLATES = [
  {
    id: 'monthly-newsletter',
    name: 'Monthly newsletter',
    category: 'Newsletter',
    icon: '📰',
    subject: 'Our monthly update, {{firstName}}',
    previewText: 'New features, bug fixes and what’s next',
    heading: 'Hello {{firstName}}',
    body: 'Here is what happened this month. We shipped new features, fixed bugs and planned what comes next.',
    ctaLabel: 'Read the full update',
    ctaUrl: 'https://example.com/blog',
    ctaColor: '#111111'
  },
  {
    id: 'customer-vip-promo',
    name: 'Customer VIP promotion',
    category: 'Promotion',
    icon: '🎁',
    subject: 'A special 25% thank-you for you, {{firstName}}',
    previewText: 'Early access to our seasonal offer before anyone else',
    heading: 'Exclusive VIP Offer for {{firstName}}',
    body: 'Because you are one of our valued customers, enjoy 25% off your next renewal or upgrade with code VIP25.',
    ctaLabel: 'Claim 25% off',
    ctaUrl: 'https://example.com/vip-offer',
    ctaColor: '#7c3aed'
  },
  {
    id: 'product-announcement',
    name: 'Product launch announcement',
    category: 'Announcement',
    icon: '🚀',
    subject: 'Introducing our fastest dashboard yet, {{firstName}}',
    previewText: 'See what is new in our latest release',
    heading: 'Big news, {{firstName}}!',
    body: 'We just launched real-time analytics, multi-group Amazon SES sending, and instant CSV imports.',
    ctaLabel: 'Explore what’s new',
    ctaUrl: 'https://example.com/launch',
    ctaColor: '#059669'
  },
  {
    id: 'welcome-series',
    name: 'Welcome series',
    category: 'Automation',
    icon: '👋',
    subject: 'Welcome to Acme Team, {{firstName}}!',
    previewText: '3 quick ways to get started today',
    heading: 'Welcome aboard, {{firstName}}',
    body: 'Thanks for subscribing! Here are a few quick tips to help you get the most out of your account.',
    ctaLabel: 'Get started',
    ctaUrl: 'https://example.com/start',
    ctaColor: '#111111'
  }
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [dashboardMode, setDashboardMode] = useState('live'); // 'empty' (Page 1) or 'live' (Page 2)
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  // Groups and Segments
  const [groups, setGroups] = useState([
    { id: 'newsletter', name: 'Newsletter', total: 1000, canReceive: 942 },
    { id: 'customers', name: 'Customers', total: 519, canReceive: 487 },
    { id: 'vip', name: 'VIP', total: 64, canReceive: 63 },
    { id: 'beta-testers', name: 'Beta testers', total: 95, canReceive: 87 }
  ]);

  const [segments, setSegments] = useState([
    { id: 'engaged-30', name: 'Engaged last 30 days', count: 538, isEditing: true },
    { id: 'no-open-bf', name: 'Didn’t open Black Friday', count: 298, isEditing: false },
    { id: 'pro-colombo', name: 'Pro plan in Colombo', count: 86, isEditing: false }
  ]);

  // Automations
  const [automations, setAutomations] = useState([
    { id: 'welcome', name: 'Welcome series', trigger: 'When someone joins Newsletter', active: true, started: 38, opened: '71%', inProgress: 9 },
    { id: 'winback', name: 'Win back quiet readers', trigger: 'No opens in 90 days · draft', active: false, started: 0, opened: '0%', inProgress: 0 },
    { id: 'thanks', name: 'Thanks for your order', trigger: 'When someone joins Customers · draft', active: false, started: 0, opened: '0%', inProgress: 0 }
  ]);

  // Settings
  const [settings, setSettings] = useState({
    ses: {
      region: 'Asia Pacific (Mumbai)',
      status: 'Connected',
      sendRate: 10,
      sesLimit: 14,
      retries: 3,
      dailyLimit: '1,000 (warm-up)'
    },
    compliance: {
      address: 'Acme Team, 45 Example Street, Colombo 03, Sri Lanka',
      oneClickUnsubscribe: true,
      doubleOptIn: true,
      preferencePage: true
    },
    fields: [
      { id: 'city', name: 'City', type: 'Text', tag: '{{city}}', filled: 1034 },
      { id: 'plan', name: 'Plan', type: 'Choice: Free, Pro, Business', tag: '{{plan}}', filled: 519 },
      { id: 'lastPurchase', name: 'Last purchase', type: 'Date', tag: '{{lastPurchase}}', filled: 519 }
    ],
    domains: [
      { name: 'acme.example.com', verifiedRecords: 2, totalRecords: 3 }
    ],
    senders: [
      { email: 'news@acme.example.com', isDefault: true, verified: true },
      { email: 'hello@acme.example.com', isDefault: false, verified: true }
    ],
    team: [
      { name: 'Admin', email: 'admin@example.com', role: 'Owner', avatar: 'AD' },
      { name: 'Sanduni', email: 'sanduni@acme.example.com', role: 'Editor', avatar: 'SA' },
      { name: 'Reports', email: 'reports@acme.example.com', role: 'Viewer', avatar: 'RP' }
    ],
    auditLog: [
      { action: 'Admin paused November newsletter', time: 'Today 5:12 pm' },
      { action: 'Sanduni sent a test of December newsletter', time: 'Today 4:58 pm' },
      { action: 'Admin turned on the Welcome series', time: '14 Nov' }
    ]
  });

  const updateContact = (id, updates) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addField = (field) => {
    setSettings(prev => ({
      ...prev,
      fields: [...prev.fields, field]
    }));
  };

  const addSenderEmail = (email) => {
    setSettings(prev => ({
      ...prev,
      senders: [...prev.senders, { email, isDefault: false, verified: true }]
    }));
  };

  const addDomain = (domainName) => {
    setSettings(prev => ({
      ...prev,
      domains: [...prev.domains, { name: domainName, verifiedRecords: 1, totalRecords: 3 }]
    }));
  };

  const inviteTeamMember = (member) => {
    setSettings(prev => ({
      ...prev,
      team: [...prev.team, member]
    }));
  };

  const resumeCampaign = (id) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'Sending...' } : c));
  };

  const toggleAutomation = (id) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const addImportedContacts = (newContactsList) => {
    setContacts(prev => [...newContactsList, ...prev]);
  };

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

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    setAuthToken(res.token);
    setUser(res.user);
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
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        logout,
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
        resumeCampaign,
        toggleAutomation,
        isImportModalOpen,
        setIsImportModalOpen,
        isNewGroupModalOpen,
        setIsNewGroupModalOpen,
        isAddContactModalOpen,
        setIsAddContactModalOpen,
        addImportedContacts,
        updateContact,
        addField,
        addSenderEmail,
        addDomain,
        inviteTeamMember
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
