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

// localStorage persistence for campaigns
const CAMPAIGNS_STORAGE_KEY = 'promo_campaigns';

export const campaignsApi = {
  // Load campaigns from localStorage
  loadCampaignsFromStorage: (): any[] => {
    try {
      const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading campaigns from storage:', error);
    }
    return [];
  },

  // Save campaigns to localStorage
  saveCampaignsToStorage: (campaigns: any[]): void => {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch (error) {
      console.error('Error saving campaigns to storage:', error);
    }
  },

  // Get all campaigns (from localStorage, with API fallback)
  getCampaigns: async (): Promise<{ success: boolean; data: any[] }> => {
    try {
      // Try API first
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      if (response.ok) {
        const result = await response.json();
        // Merge with localStorage
        const stored = campaignsApi.loadCampaignsFromStorage();
        const merged = [...result.data || [], ...stored];
        // Remove duplicates by _id
        const unique = merged.filter((campaign, index, self) =>
          index === self.findIndex((c) => c._id === campaign._id)
        );
        campaignsApi.saveCampaignsToStorage(unique);
        return { success: true, data: unique };
      }
    } catch (error) {
      console.error('API error, using localStorage:', error);
    }
    
    // Fallback to localStorage
    const stored = campaignsApi.loadCampaignsFromStorage();
    return { success: true, data: stored };
  },

  // Create campaign
  createCampaign: async (campaignData: any): Promise<{ success: boolean; data: any }> => {
    const newCampaign = {
      ...campaignData,
      _id: campaignData._id || `camp-${Date.now()}`,
    };
    
    // Save to localStorage immediately
    const stored = campaignsApi.loadCampaignsFromStorage();
    stored.unshift(newCampaign); // Add to beginning
    campaignsApi.saveCampaignsToStorage(stored);
    
    // Try API
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });
      if (response.ok) {
        const result = await response.json();
        // Update localStorage with API response
        const updated = stored.map(c => c._id === newCampaign._id ? result.data : c);
        campaignsApi.saveCampaignsToStorage(updated);
        return { success: true, data: result.data || newCampaign };
      }
    } catch (error) {
      console.error('API error, using localStorage:', error);
    }
    
    return { success: true, data: newCampaign };
  },

  // Update campaign status
  updateCampaignStatus: (id: string | number, status: string): { success: boolean; data: any } => {
    const stored = campaignsApi.loadCampaignsFromStorage();
    const updated = stored.map(campaign =>
      campaign._id === id ? { ...campaign, status } : campaign
    );
    campaignsApi.saveCampaignsToStorage(updated);
    
    // Try API
    try {
      fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(err => console.error('API update error:', err));
    } catch (error) {
      console.error('API error:', error);
    }
    
    const updatedCampaign = updated.find(c => c._id === id);
    return { success: true, data: updatedCampaign };
  },

  // Update campaign (for edit)
  updateCampaign: async (id: string | number, updateData: any): Promise<{ success: boolean; data: any }> => {
    const stored = campaignsApi.loadCampaignsFromStorage();
    const updated = stored.map(campaign =>
      campaign._id === id ? { ...campaign, ...updateData } : campaign
    );
    campaignsApi.saveCampaignsToStorage(updated);
    
    // Try API
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        const result = await response.json();
        // Update localStorage with API response
        const finalUpdated = updated.map(c => c._id === id ? result.data : c);
        campaignsApi.saveCampaignsToStorage(finalUpdated);
        return { success: true, data: result.data || updated.find(c => c._id === id) };
      }
    } catch (error) {
      console.error('API error, using localStorage:', error);
    }
    
    const updatedCampaign = updated.find(c => c._id === id);
    return { success: true, data: updatedCampaign };
  }
};
