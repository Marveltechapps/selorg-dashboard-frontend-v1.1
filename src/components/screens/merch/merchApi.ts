const API_BASE_URL = 'http://localhost:5000/api/v1/merch';

export const merchApi = {
  // --- Overview Endpoints ---
  getMerchStats: async () => {
    const response = await fetch(`${API_BASE_URL}/overview/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getStockConflicts: async () => {
    const response = await fetch(`${API_BASE_URL}/overview/conflicts`);
    if (!response.ok) throw new Error('Failed to fetch conflicts');
    return response.json();
  },

  getPromoUplift: async () => {
    const response = await fetch(`${API_BASE_URL}/overview/uplift`);
    if (!response.ok) throw new Error('Failed to fetch uplift data');
    return response.json();
  },

  // --- Campaign Endpoints ---
  getCampaigns: async () => {
    const response = await fetch(`${API_BASE_URL}/campaigns`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  // Create a new campaign
  createCampaign: async (campaignData: any) => {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  // Update a campaign
  updateCampaign: async (id: string | number, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
  },

  // Delete a campaign
  deleteCampaign: async (id: string | number) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
    return response.json();
  }
};

