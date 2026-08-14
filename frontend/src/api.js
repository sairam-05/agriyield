const API_BASE_URL = typeof window !== 'undefined' && (
  window.location.hostname.endsWith('vercel.app') || 
  window.location.protocol === 'https:'
)
  ? '/api'
  : `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:8000/api`;

export function getAuthToken() {
  return localStorage.getItem('agri_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('agri_auth_token', token);
  } else {
    localStorage.removeItem('agri_auth_token');
  }
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Registration failed');
  }
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      setAuthToken(null);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Fetch user error:', err);
    return null;
  }
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return await res.json();
  } catch (err) {
    console.error('Health API error:', err);
    return { status: 'offline', error: err.message };
  }
}

export async function fetchModelMetrics() {
  const res = await fetch(`${API_BASE_URL}/model-metrics`);
  if (!res.ok) throw new Error('Failed to fetch model metrics');
  return await res.json();
}

export async function predictYield(payload) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(errData.detail || 'Prediction failed');
  }
  return await res.json();
}

export async function recommendCrops(payload) {
  const res = await fetch(`${API_BASE_URL}/recommend-crops`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Crop recommendation failed');
  return await res.json();
}

export async function optimizeResources(payload) {
  const res = await fetch(`${API_BASE_URL}/optimize-resources`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Resource optimization failed');
  return await res.json();
}

export async function fetchSensitivityAnalysis(payload) {
  const res = await fetch(`${API_BASE_URL}/sensitivity-analysis`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Sensitivity analysis failed');
  return await res.json();
}

export async function fetchRiskAnalysis(payload) {
  const res = await fetch(`${API_BASE_URL}/risk-analysis`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Risk analysis failed');
  return await res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE_URL}/history`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return await res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete history record');
  return await res.json();
}

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/dashboard-summary`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return await res.json();
}

