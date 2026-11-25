/**
 * API client for the Bulk Mailer backend.
 *
 * The backend address comes from VITE_API_BASE_URL (see .env.example).
 * Vite bakes it into the build, so rebuild after changing it.
 * Left empty in development, requests go to /api and Vite proxies them.
 */

function resolveApiBase() {
  const raw = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '/api';
  // Accept "https://host" as well as "https://host/api".
  return /\/api$/.test(raw) ? raw : `${raw}/api`;
}

export const API_BASE_URL = resolveApiBase();

export function getAuthToken() {
  return localStorage.getItem('bm_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('bm_token', token);
  } else {
    localStorage.removeItem('bm_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || `Request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }

  return data;
}

export const authApi = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request('/auth/me', { method: 'GET' }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

export const workspaceApi = {
  bootstrap: () => request('/bootstrap', { method: 'GET' }),
  createGroup: (payload) =>
    request('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  toggleAutomation: (id) =>
    request(`/automations/${id}/toggle`, { method: 'PATCH' }),
};

export const contactsApi = {
  list: () => request('/contacts', { method: 'GET' }),
  create: (payload) =>
    request('/contacts', { method: 'POST', body: JSON.stringify(payload) }),
  importBulk: (contacts) =>
    request('/contacts/import', { method: 'POST', body: JSON.stringify({ contacts }) }),
  update: (id, payload) =>
    request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const templatesApi = {
  list: () => request('/templates', { method: 'GET' }),
  create: (payload) =>
    request('/templates', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
};

export const uploadsApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/uploads', { method: 'POST', body: formData });
  },
};

export const campaignsApi = {
  list: () => request('/campaigns', { method: 'GET' }),
  get: (id) => request(`/campaigns/${id}`, { method: 'GET' }),
  create: (payload) =>
    request('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  sendTest: (payload) =>
    request('/campaigns/send-test', { method: 'POST', body: JSON.stringify(payload) }),
  resume: (id) => request(`/campaigns/${id}/resume`, { method: 'POST' }),
  pause: (id) => request(`/campaigns/${id}/pause`, { method: 'POST' }),
  cancel: (id) => request(`/campaigns/${id}/cancel`, { method: 'POST' }),
};

export const settingsApi = {
  save: (payload) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  addField: (payload) =>
    request('/settings/fields', { method: 'POST', body: JSON.stringify(payload) }),
  deleteField: (id) =>
    request(`/settings/fields/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  addSender: (email) =>
    request('/settings/senders', { method: 'POST', body: JSON.stringify({ email }) }),
  addDomain: (name) =>
    request('/settings/domains', { method: 'POST', body: JSON.stringify({ name }) }),
  inviteTeam: (payload) =>
    request('/settings/team', { method: 'POST', body: JSON.stringify(payload) }),
};
