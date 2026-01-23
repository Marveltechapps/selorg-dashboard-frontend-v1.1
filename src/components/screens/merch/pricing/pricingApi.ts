import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/pricing';

export const pricingApi = {
  getSkus: async () => {
    const response = await axios.get(`${API_URL}/skus`);
    return response.data;
  },
  updateSkuPrice: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/skus/${id}`, data);
    return response.data;
  },
  getSurgeRules: async () => {
    const response = await axios.get(`${API_URL}/surge-rules`);
    return response.data;
  },
  createSurgeRule: async (data: any) => {
    const response = await axios.post(`${API_URL}/surge-rules`, data);
    return response.data;
  },
  updateSurgeRule: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/surge-rules/${id}`, data);
    return response.data;
  },
  deleteSurgeRule: async (id: string) => {
    const response = await axios.delete(`${API_URL}/surge-rules/${id}`);
    return response.data;
  },
  getPendingUpdates: async () => {
    const response = await axios.get(`${API_URL}/pending-updates`);
    return response.data;
  },
  handlePendingUpdate: async (id: string, status: string) => {
    const response = await axios.put(`${API_URL}/pending-updates/${id}`, { status });
    return response.data;
  }
};

