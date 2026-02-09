import axios from 'axios';
import { ApprovalRequest } from './types';
import { MOCK_APPROVALS } from './mockData';

const API_URL = 'http://localhost:5000/api/v1/compliance';

const STORAGE_KEY = 'compliance_approval_requests';

const loadApprovalsFromStorage = (): ApprovalRequest[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load approvals from storage', e);
  }
  return [];
};

const saveApprovalsToStorage = (approvals: ApprovalRequest[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(approvals));
  } catch (e) {
    console.error('Failed to save approvals to storage', e);
  }
};

// Initialize with mock data if storage is empty
if (loadApprovalsFromStorage().length === 0) {
  saveApprovalsToStorage(MOCK_APPROVALS);
}

export const complianceApi = {
  getApprovalRequests: async (filters: any = {}): Promise<{ success: boolean; data: ApprovalRequest[] }> => {
    try {
      const response = await axios.get(`${API_URL}/approvals`, { params: filters });
      if (response.data && response.data.success && response.data.data) {
        // Save to localStorage
        saveApprovalsToStorage(response.data.data);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to fetch approvals from API', e);
    }
    // Fallback to localStorage or mock data
    const stored = loadApprovalsFromStorage();
    if (stored.length > 0) {
      return { success: true, data: stored };
    }
    // Use mock data as final fallback
    saveApprovalsToStorage(MOCK_APPROVALS);
    return { success: true, data: MOCK_APPROVALS };
  },

  getApprovals: async (filters: any = {}) => {
    try {
      const response = await axios.get(`${API_URL}/approvals`, { params: filters });
      return response.data;
    } catch (e) {
      // Fallback to localStorage
      const stored = loadApprovalsFromStorage();
      return { success: true, data: stored };
    }
  },

  updateApprovalStatus: async (id: string, status: string, user: string = 'Alice W.') => {
    try {
      const response = await axios.put(`${API_URL}/approvals/${id}`, { status, user });
      if (response.data && response.data.success) {
        // Update localStorage
        const stored = loadApprovalsFromStorage();
        const updated = stored.map(r => r.id === id ? { ...r, status: status as any } : r);
        saveApprovalsToStorage(updated);
        return response.data;
      }
    } catch (e) {
      console.error('Failed to update approval status', e);
    }
    // Fallback: update localStorage
    const stored = loadApprovalsFromStorage();
    const updated = stored.map(r => r.id === id ? { ...r, status: status as any } : r);
    saveApprovalsToStorage(updated);
    return { success: true, data: updated.find(r => r.id === id) };
  },

  getAudits: async (filters: any = {}) => {
    try {
      const response = await axios.get(`${API_URL}/audits`, { params: filters });
      return response.data;
    } catch (e) {
      return { success: true, data: [] };
    }
  },

  seedData: async () => {
    try {
      const response = await axios.post(`${API_URL}/seed`);
      return response.data;
    } catch (e) {
      // Initialize with mock data
      saveApprovalsToStorage(MOCK_APPROVALS);
      return { success: true, message: 'Mock data initialized' };
    }
  }
};
