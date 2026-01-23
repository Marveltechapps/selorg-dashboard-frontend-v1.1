import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/compliance';

export const complianceApi = {
  getApprovals: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/approvals`, { params: filters });
    return response.data;
  },

  updateApprovalStatus: async (id: string, status: string, user: string = 'Alice W.') => {
    const response = await axios.put(`${API_URL}/approvals/${id}`, { status, user });
    return response.data;
  },

  getAudits: async (filters: any = {}) => {
    const response = await axios.get(`${API_URL}/audits`, { params: filters });
    return response.data;
  },

  seedData: async () => {
    const response = await axios.post(`${API_URL}/seed`);
    return response.data;
  }
};

