const API_BASE = '/api';

export const api = {
  // Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // B2B
  getB2B: async (search = '', status = 'All') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    const res = await fetch(`${API_BASE}/b2b?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch B2B inventory');
    return res.json();
  },

  createB2B: async (data) => {
    const res = await fetch(`${API_BASE}/b2b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to add B2B item');
    return json;
  },

  updateB2B: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2b/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update B2B item');
    return json;
  },

  deleteB2B: async (id) => {
    const res = await fetch(`${API_BASE}/b2b/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete B2B item');
    return json;
  },

  transferToB2C: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2b/${id}/transfer-to-b2c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to transfer item to B2C');
    return json;
  },

  // B2C
  getB2C: async (search = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/b2c?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch B2C sales');
    return res.json();
  },

  createB2C: async (data) => {
    const res = await fetch(`${API_BASE}/b2c`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to record B2C sale');
    return json;
  },

  updateB2C: async (id, data) => {
    const res = await fetch(`${API_BASE}/b2c/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update B2C sale');
    return json;
  },

  deleteB2C: async (id) => {
    const res = await fetch(`${API_BASE}/b2c/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete B2C record');
    return json;
  },

  // IMEI Tracker
  lookupImei: async (imei) => {
    const res = await fetch(`${API_BASE}/imei/lookup/${encodeURIComponent(imei.trim())}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || json.error || 'IMEI not found');
    return json;
  },
};
