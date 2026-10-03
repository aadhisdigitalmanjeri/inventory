const API_BASE = '/api';

async function handleResponse(res, defaultError = 'Request failed') {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || json.message || defaultError);
    }
    return json;
  }
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server returned error (${res.status}): ${text.slice(0, 100)}`);
  }
  
  return await res.json();
}

export const api = {
  // Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse(res, 'Failed to fetch stats');
  },

  // B2B
  getB2B: async (search = '', status = 'All') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    const res = await fetch(`${API_BASE}/b2b?${params.toString()}`);
    return handleResponse(res, 'Failed to fetch B2B inventory');
  },

  createB2B: async (data) => {
    const res = await fetch(`${API_BASE}/b2b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to add B2B item');
  },

  updateB2B: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2b/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update B2B item');
  },

  deleteB2B: async (id) => {
    const res = await fetch(`${API_BASE}/b2b/${id}`, { method: 'DELETE' });
    return handleResponse(res, 'Failed to delete B2B item');
  },

  transferToB2C: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2b/${id}/transfer-to-b2c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to transfer item to B2C');
  },

  // B2C
  getB2C: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/b2c?${params.toString()}`);
    return handleResponse(res, 'Failed to fetch B2C sales');
  },

  createB2C: async (data) => {
    const res = await fetch(`${API_BASE}/b2c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to record B2C sale');
  },

  updateB2C: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2c/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update B2C sale');
  },

  deleteB2C: async (id) => {
    const res = await fetch(`${API_BASE}/b2c/${id}`, { method: 'DELETE' });
    return handleResponse(res, 'Failed to delete B2C record');
  },

  // IMEI Tracker
  lookupImei: async (imei) => {
    const res = await fetch(`${API_BASE}/imei/lookup/${encodeURIComponent(imei.trim())}`);
    return handleResponse(res, 'IMEI not found in inventory');
  },
};
