/**
 * API client for the Bulk Mailer backend, built on axios.
 *
 * The backend address comes from VITE_API_BASE_URL (see .env.example).
 * Vite bakes it into the build, so rebuild after changing it.
 * Left empty in development, requests go to /api and Vite proxies them.
 */
import axios from 'axios';

function resolveApiBase() {
  const raw = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '/api';
  // Accept "https://host" as well as "https://host/api".
  return /\/api$/.test(raw) ? raw : `${raw}/api`;
}

export const API_BASE_URL = resolveApiBase();
const TOKEN_KEY = 'bm_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* private mode: stay signed in for this tab only */
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { Accept: 'application/json' },
});

// Attach the token to every request.
http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Called when the server says the session is no longer valid (set by AppContext).
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// Turn axios errors into one shape: Error with .status and the server's message.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data || {};
    let message = data.message;
    if (!message) {
      if (error.code === 'ECONNABORTED') message = 'The server took too long to answer. Try again.';
      else if (!error.response) message = 'Can’t reach the server. Check your connection, or that the backend is running.';
      else message = `Request failed (${status})`;
    }
    const err = new Error(message);
    err.status = status;
    err.data = data;

    const isLogin = error.config?.url?.includes('/auth/login');
    if (status === 401 && !isLogin && onUnauthorized) onUnauthorized(err);
    return Promise.reject(err);
  }
);

const get = (url, params) => http.get(url, { params }).then((r) => r.data);
const post = (url, body) => http.post(url, body).then((r) => r.data);
const put = (url, body) => http.put(url, body).then((r) => r.data);
const patch = (url, body) => http.patch(url, body).then((r) => r.data);
const del = (url) => http.delete(url).then((r) => r.data);
const enc = encodeURIComponent;

/** Downloads a file from an authenticated endpoint (e.g. the contacts CSV export). */
export async function downloadFile(url, params, fallbackName = 'download') {
  const res = await http.get(url, { params, responseType: 'blob' });
  const disposition = res.headers['content-disposition'] || '';
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] || fallbackName;
  const href = URL.createObjectURL(res.data);
  const a = Object.assign(document.createElement('a'), { href, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------
export const authApi = {
  login: (username, password) => post('/auth/login', { username, password }),
  me: () => get('/auth/me'),
  logout: () => post('/auth/logout'),
  changePassword: (currentPassword, newPassword) => post('/auth/change-password', { currentPassword, newPassword }),
};

export const dashboardApi = {
  summary: () => get('/summary'),
  dashboard: () => get('/dashboard'),
  analytics: (days = 30) => get('/analytics', { days }),
};

export const contactsApi = {
  list: (params = {}) => get('/contacts', params),
  counts: () => get('/contacts/counts'),
  get: (id) => get(`/contacts/${enc(id)}`),
  create: (payload) => post('/contacts', payload),
  importBulk: (payload) => post('/contacts/import', payload),
  update: (id, payload) => patch(`/contacts/${enc(id)}`, payload),
  unsubscribe: (id) => post(`/contacts/${enc(id)}/unsubscribe`),
  resubscribe: (id) => post(`/contacts/${enc(id)}/resubscribe`, { confirmed: true }),
  remove: (id) => del(`/contacts/${enc(id)}`),
  exportCsv: (params = {}) => downloadFile('/contacts/export.csv', params, 'contacts.csv'),
};

export const groupsApi = {
  list: () => get('/groups'),
  create: (payload) => post('/groups', payload),
  update: (id, payload) => patch(`/groups/${enc(id)}`, payload),
  addMembers: (id, contactIds) => post(`/groups/${enc(id)}/members`, { contactIds }),
  remove: (id) => del(`/groups/${enc(id)}`),
};

export const segmentsApi = {
  list: () => get('/segments'),
  preview: (definition) => post('/segments/preview', definition),
  create: (payload) => post('/segments', payload),
  update: (id, payload) => put(`/segments/${enc(id)}`, payload),
  remove: (id) => del(`/segments/${enc(id)}`),
};

export const templatesApi = {
  list: () => get('/templates'),
  get: (id) => get(`/templates/${enc(id)}`),
  create: (payload) => post('/templates', payload),
  update: (id, payload) => put(`/templates/${enc(id)}`, payload),
  remove: (id) => del(`/templates/${enc(id)}`),
  render: (payload) => post('/templates/render', payload),
};

export const campaignsApi = {
  list: () => get('/campaigns'),
  get: (id) => get(`/campaigns/${enc(id)}`),
  create: (payload) => post('/campaigns', payload),
  update: (id, payload) => put(`/campaigns/${enc(id)}`, payload),
  remove: (id) => del(`/campaigns/${enc(id)}`),
  estimate: (payload) => post('/campaigns/estimate', payload),
  checks: (id) => get(`/campaigns/${enc(id)}/checks`),
  send: (id) => post(`/campaigns/${enc(id)}/send`, { confirmed: true }),
  unschedule: (id) => post(`/campaigns/${enc(id)}/unschedule`),
  pause: (id) => post(`/campaigns/${enc(id)}/pause`),
  resume: (id) => post(`/campaigns/${enc(id)}/resume`),
  cancel: (id) => post(`/campaigns/${enc(id)}/cancel`),
  duplicate: (id) => post(`/campaigns/${enc(id)}/duplicate`),
  resendNonOpeners: (id) => post(`/campaigns/${enc(id)}/resend-non-openers`),
  report: (id) => get(`/campaigns/${enc(id)}/report`),
  recipients: (id, params = {}) => get(`/campaigns/${enc(id)}/recipients`, params),
  retryRecipient: (id, rid) => post(`/campaigns/${enc(id)}/recipients/${enc(rid)}/retry`),
  preview: (id, params = {}) => get(`/campaigns/${enc(id)}/preview`, params),
  sendTest: (id, emails, asContactId) => post(`/campaigns/${enc(id)}/send-test`, { emails, asContactId }),
};

export const automationsApi = {
  list: () => get('/automations'),
  create: (payload) => post('/automations', payload),
  update: (id, payload) => put(`/automations/${enc(id)}`, payload),
  toggle: (id) => patch(`/automations/${enc(id)}/toggle`),
  remove: (id) => del(`/automations/${enc(id)}`),
};

export const settingsApi = {
  get: () => get('/settings'),
  save: (payload) => put('/settings', payload),
  addField: (payload) => post('/settings/fields', payload),
  deleteField: (key) => del(`/settings/fields/${enc(key)}`),
  fieldUsage: () => get('/settings/fields/usage'),
  senders: () => get('/settings/senders'),
  addSender: (email) => post('/settings/senders', { email }),
  setDefaultSender: (email) => patch('/settings/senders/default', { email }),
  removeSender: (email) => del(`/settings/senders/${enc(email)}`),
  inviteTeam: (payload) => post('/settings/team', payload),
  setTeamRole: (id, role) => patch(`/settings/team/${enc(id)}`, { role }),
  removeTeam: (id) => del(`/settings/team/${enc(id)}`),
};

export const domainsApi = {
  list: () => get('/domains'),
  get: (name) => get(`/domains/${enc(name)}`),
  add: (name) => post('/domains', { name }),
  check: (name) => post(`/domains/${enc(name)}/check`),
  remove: (name) => del(`/domains/${enc(name)}`),
};

export const uploadsApi = {
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return http.post('/uploads', form).then((r) => r.data);
  },
};

/** Subscriber pages reached from email links. No login; the token is in the link. */
export const publicApi = {
  preferences: (token) => get(`/public/preferences/${enc(token)}`),
  savePreferences: (token, payload) => post(`/public/preferences/${enc(token)}`, payload),
  unsubscribe: (token) => post(`/public/unsubscribe/${enc(token)}`),
  resubscribe: (token) => post(`/public/resubscribe/${enc(token)}`),
  feedback: (token, reason) => post(`/public/feedback/${enc(token)}`, { reason }),
};

// Old names still used by some pages until they are rebuilt.
export const workspaceApi = {
  createGroup: groupsApi.create,
  toggleAutomation: automationsApi.toggle,
};
