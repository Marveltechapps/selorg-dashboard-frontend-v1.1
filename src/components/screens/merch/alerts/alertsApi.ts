import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/alerts';

export const alertsApi = {
  getAlerts: async (filters: any = {}) => {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  },

  updateAlert: async (id: string, update: any) => {
    const response = await axios.put(`${API_URL}/${id}`, update);
    return response.data;
  },

  bulkUpdate: async (ids: string[], update: any) => {
    const response = await axios.post(`${API_URL}/bulk-update`, { ids, update });
    return response.data;
  },

  seedData: async () => {
    const response = await axios.post(`${API_URL}/seed`);
    return response.data;
  }
};

