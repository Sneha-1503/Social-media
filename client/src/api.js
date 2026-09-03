const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const auth = {
  me: () => api('/auth/me'),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => api('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api('/auth/logout', { method: 'POST' })
};

export const posts = {
  list: () => api('/posts'),
  create: (body) => api('/posts', { method: 'POST', body: JSON.stringify(body) }),
  like: (id) => api(`/posts/${id}/like`, { method: 'POST' }),
  comment: (id, text) => api(`/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ text }) })
};

export const users = {
  profile: (username) => api(`/users/${encodeURIComponent(username)}`),
  follow: (id) => api(`/users/${id}/follow`, { method: 'POST' })
};
