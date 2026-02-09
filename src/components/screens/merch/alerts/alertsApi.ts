import axios from 'axios';
import { Alert } from './types';
import { INITIAL_ALERTS } from './mockData';

const API_URL = 'http://localhost:5000/api/v1/alerts';
const STORAGE_KEY = 'merch_alerts';

// Load alerts from localStorage
const loadAlertsFromStorage = (): Alert[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load alerts from storage', e);
  }
  return [];
};

// Save alerts to localStorage
const saveAlertsToStorage = (alerts: Alert[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to storage', e);
  }
};

// Initialize alerts - ensure we always have data
const initializeAlerts = (): Alert[] => {
  const stored = loadAlertsFromStorage();
  if (stored.length > 0) {
    // Ensure at least some alerts are in active status
    const hasActiveAlerts = stored.some(a => ['New', 'In Progress'].includes(a.status));
    if (!hasActiveAlerts && stored.length > 0) {
      // Reset first 5 alerts to 'New' status
      stored.slice(0, Math.min(5, stored.length)).forEach(alert => {
        alert.status = 'New';
        alert.updatedAt = new Date().toISOString();
      });
      saveAlertsToStorage(stored);
    }
    return stored;
  }
  // Use mock data as fallback
  saveAlertsToStorage(INITIAL_ALERTS);
  return INITIAL_ALERTS;
};

// Initialize on module load
initializeAlerts();

export const alertsApi = {
  getAlerts: async (filters: any = {}): Promise<{ success: boolean; data: Alert[] }> => {
    try {
      const response = await axios.get(API_URL, { params: filters });
      if (response.data && response.data.success && response.data.data) {
        // Save to localStorage
        saveAlertsToStorage(response.data.data);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to fetch alerts from API', e);
    }
    // Fallback to localStorage or mock data
    const stored = loadAlertsFromStorage();
    if (stored.length > 0) {
      return { success: true, data: stored };
    }
    // Use mock data as final fallback
    const mockAlerts = initializeAlerts();
    return { success: true, data: mockAlerts };
  },

  updateAlert: async (id: string, update: any): Promise<{ success: boolean; data: Alert }> => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, update);
      if (response.data && response.data.success) {
        // Update localStorage
        const stored = loadAlertsFromStorage();
        const updated = stored.map(a => a.id === id ? { ...a, ...update } : a);
        saveAlertsToStorage(updated);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to update alert', e);
    }
    // Fallback: update localStorage
    const stored = loadAlertsFromStorage();
    const updated = stored.map(a => a.id === id ? { ...a, ...update } : a);
    saveAlertsToStorage(updated);
    const alert = updated.find(a => a.id === id);
    return { success: true, data: alert! };
  },

  bulkUpdate: async (ids: string[], update: any): Promise<{ success: boolean; data: Alert[] }> => {
    try {
      const response = await axios.post(`${API_URL}/bulk-update`, { ids, update });
      if (response.data && response.data.success) {
        // Update localStorage
        const stored = loadAlertsFromStorage();
        const updated = stored.map(a => ids.includes(a.id) ? { ...a, ...update } : a);
        saveAlertsToStorage(updated);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to bulk update alerts', e);
    }
    // Fallback: update localStorage
    const stored = loadAlertsFromStorage();
    const updated = stored.map(a => ids.includes(a.id) ? { ...a, ...update } : a);
    saveAlertsToStorage(updated);
    return { success: true, data: updated.filter(a => ids.includes(a.id)) };
  },

  seedData: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/seed`);
      if (response.data && response.data.success) {
        // Reload from API
        const alertsResp = await alertsApi.getAlerts({});
        return { success: true, message: 'Data seeded successfully' };
      }
    } catch (e) {
      console.error('Failed to seed data', e);
    }
    // Fallback: initialize with mock data
    const mockAlerts = initializeAlerts();
    return { success: true, message: 'Mock data initialized' };
  }
};
