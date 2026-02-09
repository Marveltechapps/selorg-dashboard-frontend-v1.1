import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/pricing';

// localStorage keys
const STORAGE_KEY_PENDING_UPDATES = 'pricing_pending_updates';
const STORAGE_KEY_PRICE_RULES = 'pricing_price_rules';
const STORAGE_KEY_SURGE_RULES = 'pricing_surge_rules';
const STORAGE_KEY_SURGE_ENABLED = 'pricing_surge_enabled';
const STORAGE_KEY_SKU_PRICES = 'pricing_sku_prices';
const STORAGE_KEY_MARGIN_RISKS = 'pricing_margin_risks';

// Default mock data for pending updates
const DEFAULT_PENDING_UPDATES = [
  { id: '1', sku: 'Cola Can 330ml', oldPrice: 1.50, newPrice: 1.65, date: '2024-07-20', reason: 'Supplier cost increase', user: 'jane', source: 'manual', marginImpact: '+2%', priority: 'high', status: 'pending' },
  { id: '2', sku: 'Chips Salted 150g', oldPrice: 2.20, newPrice: 2.00, date: '2024-07-21', reason: 'Competitor matching', user: 'system', source: 'rule', marginImpact: '-4%', priority: 'medium', status: 'pending' },
  { id: '3', sku: 'Water Bottle 500ml', oldPrice: 0.80, newPrice: 0.90, date: '2024-07-22', reason: 'Surge pricing rule', user: 'system', source: 'rule', marginImpact: '+8%', priority: 'low', status: 'pending' },
];

// Load pending updates from localStorage
const loadPendingUpdatesFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PENDING_UPDATES);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default data if empty
    savePendingUpdatesToStorage(DEFAULT_PENDING_UPDATES);
    return DEFAULT_PENDING_UPDATES;
  } catch (error) {
    console.error('Error loading pending updates from storage:', error);
    return DEFAULT_PENDING_UPDATES;
  }
};

// Save pending updates to localStorage
const savePendingUpdatesToStorage = (updates: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(updates));
  } catch (error) {
    console.error('Error saving pending updates to storage:', error);
  }
};

// Price Rules localStorage functions
const loadPriceRulesFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PRICE_RULES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading price rules from storage:', error);
    return [];
  }
};

const savePriceRulesToStorage = (rules: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_PRICE_RULES, JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving price rules to storage:', error);
  }
};

// Surge Rules localStorage functions
const loadSurgeRulesFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SURGE_RULES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading surge rules from storage:', error);
    return [];
  }
};

const saveSurgeRulesToStorage = (rules: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SURGE_RULES, JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving surge rules to storage:', error);
  }
};

const loadSurgeEnabledFromStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SURGE_ENABLED);
    return stored ? JSON.parse(stored) : true;
  } catch (error) {
    return true;
  }
};

const saveSurgeEnabledToStorage = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY_SURGE_ENABLED, JSON.stringify(enabled));
  } catch (error) {
    console.error('Error saving surge enabled to storage:', error);
  }
};

// SKU Prices localStorage functions
const loadSKUPricesFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SKU_PRICES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading SKU prices from storage:', error);
    return [];
  }
};

const saveSKUPricesToStorage = (skus: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SKU_PRICES, JSON.stringify(skus));
  } catch (error) {
    console.error('Error saving SKU prices to storage:', error);
  }
};

// Margin Risks localStorage functions
const loadMarginRisksFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MARGIN_RISKS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading margin risks from storage:', error);
    return [];
  }
};

const saveMarginRisksToStorage = (risks: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_MARGIN_RISKS, JSON.stringify(risks));
  } catch (error) {
    console.error('Error saving margin risks to storage:', error);
  }
};

export const pricingApi = {
  getSkus: async () => {
    try {
      const response = await axios.get(`${API_URL}/skus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      return { success: false, data: [] };
    }
  },
  getPricingSKUs: async () => {
    try {
      const response = await axios.get(`${API_URL}/skus`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing SKUs:', error);
      return { success: false, data: [] };
    }
  },
  updateSkuPrice: async (id: string, data: any) => {
    try {
      const response = await axios.put(`${API_URL}/skus/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating SKU price:', error);
      return { success: false, data: null };
    }
  },
  getSurgeRules: async () => {
    try {
      const response = await axios.get(`${API_URL}/surge-rules`, { timeout: 5000 });
      if (response.data && response.data.success && response.data.data) {
        saveSurgeRulesToStorage(response.data.data);
        return response.data;
      }
    } catch (error: any) {
      if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK') {
        console.error('Error fetching surge rules:', error);
      }
    }
    // Fallback to localStorage
    const storedRules = loadSurgeRulesFromStorage();
    return { success: true, data: storedRules };
  },
  createSurgeRule: async (data: any) => {
    try {
      const newRule = { ...data, id: data.id || Date.now() };
      // Save to localStorage immediately
      const storedRules = loadSurgeRulesFromStorage();
      storedRules.unshift(newRule);
      saveSurgeRulesToStorage(storedRules);
      
      try {
        const response = await axios.post(`${API_URL}/surge-rules`, data);
        return response.data;
      } catch (apiError) {
        return { success: true, data: newRule };
      }
    } catch (error) {
      console.error('Error creating surge rule:', error);
      return { success: false, data: null };
    }
  },
  updateSurgeRule: async (id: string, data: any) => {
    try {
      // Update localStorage immediately
      const storedRules = loadSurgeRulesFromStorage();
      const index = storedRules.findIndex((r: any) => r.id === id || r.id === Number(id));
      if (index !== -1) {
        storedRules[index] = { ...storedRules[index], ...data };
        saveSurgeRulesToStorage(storedRules);
      }
      
      try {
        const response = await axios.put(`${API_URL}/surge-rules/${id}`, data);
        return response.data;
      } catch (apiError) {
        const updatedRule = storedRules.find((r: any) => r.id === id || r.id === Number(id));
        return { success: true, data: updatedRule };
      }
    } catch (error) {
      console.error('Error updating surge rule:', error);
      return { success: false, data: null };
    }
  },
  deleteSurgeRule: async (id: string) => {
    try {
      // Delete from localStorage immediately
      const storedRules = loadSurgeRulesFromStorage();
      const filtered = storedRules.filter((r: any) => r.id !== id && r.id !== Number(id));
      saveSurgeRulesToStorage(filtered);
      
      try {
        const response = await axios.delete(`${API_URL}/surge-rules/${id}`);
        return response.data;
      } catch (apiError) {
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting surge rule:', error);
      return { success: false };
    }
  },
  // Surge enabled state
  getSurgeEnabled: () => loadSurgeEnabledFromStorage(),
  setSurgeEnabled: (enabled: boolean) => {
    saveSurgeEnabledToStorage(enabled);
    return { success: true };
  },
  // Price Rules
  createPriceRule: async (rule: any) => {
    try {
      const newRule = { ...rule, id: `rule-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' };
      const storedRules = loadPriceRulesFromStorage();
      storedRules.unshift(newRule);
      savePriceRulesToStorage(storedRules);
      return { success: true, data: newRule };
    } catch (error) {
      console.error('Error creating price rule:', error);
      return { success: false, data: null };
    }
  },
  getPriceRules: () => {
    const rules = loadPriceRulesFromStorage();
    return { success: true, data: rules };
  },
  // SKU Prices
  updateSKUPriceInStorage: (skuId: string, updates: any) => {
    try {
      const storedSKUs = loadSKUPricesFromStorage();
      const index = storedSKUs.findIndex((s: any) => s.id === skuId);
      if (index !== -1) {
        storedSKUs[index] = { ...storedSKUs[index], ...updates };
      } else {
        storedSKUs.push({ id: skuId, ...updates });
      }
      saveSKUPricesToStorage(storedSKUs);
      return { success: true };
    } catch (error) {
      console.error('Error updating SKU price in storage:', error);
      return { success: false };
    }
  },
  getSKUPrices: () => {
    const skus = loadSKUPricesFromStorage();
    return { success: true, data: skus };
  },
  // Margin Risks
  getMarginRisks: () => {
    const risks = loadMarginRisksFromStorage();
    return { success: true, data: risks };
  },
  updateMarginRisks: (risks: any[]) => {
    saveMarginRisksToStorage(risks);
    return { success: true };
  },
  getPendingUpdates: async () => {
    try {
      // Try API first
      const response = await axios.get(`${API_URL}/pending-updates`, { timeout: 5000 });
      if (response.data && response.data.success && response.data.data) {
        // Save API data to localStorage
        savePendingUpdatesToStorage(response.data.data);
        return response.data;
      }
    } catch (error: any) {
      // Silently fallback to localStorage - don't log network errors
      if (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK') {
        console.error('Error fetching pending updates from API:', error);
      }
    }
    // Fallback to localStorage
    const storedUpdates = loadPendingUpdatesFromStorage();
    return { success: true, data: storedUpdates.filter((u: any) => u.status === 'pending') };
  },
  handlePendingUpdate: async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      // Update localStorage first (optimistic update)
      const updates = loadPendingUpdatesFromStorage();
      const updatedUpdates = updates.map((update: any) => 
        update.id === id 
          ? { ...update, status, rejectedReason: reason || undefined }
          : update
      );
      savePendingUpdatesToStorage(updatedUpdates);
      
      // Try API call
      try {
        const response = await axios.put(`${API_URL}/pending-updates/${id}`, { status, reason });
        return response.data;
      } catch (apiError) {
        console.error('Error updating pending update via API:', apiError);
        // Return success anyway since we updated localStorage
        return { success: true, data: { id, status } };
      }
    } catch (error) {
      console.error('Error handling pending update:', error);
      return { success: false, error: 'Failed to update pending update' };
    }
  }
};
