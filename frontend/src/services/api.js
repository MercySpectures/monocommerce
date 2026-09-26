import axios from 'axios';

// Get or generate a persistent session ID for guest carts
function getSessionId() {
  let sessionId = localStorage.getItem('mono_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('mono_session_id', sessionId);
  }
  return sessionId;
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mono_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-session-id'] = getSessionId();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and has expired token, clean it up
      if (localStorage.getItem('mono_token')) {
        localStorage.removeItem('mono_token');
        localStorage.removeItem('mono_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
