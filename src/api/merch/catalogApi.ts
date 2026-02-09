/**
 * Merch Catalog API
 */

import { apiRequest } from '../apiClient';

const BASE_PATH = '/merch/catalog';

// localStorage keys
const STORAGE_KEY_COLLECTIONS = 'catalog_collections';
const STORAGE_KEY_SKUS = 'catalog_skus';

// Load collections from localStorage
const loadCollectionsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading collections from storage:', error);
    return [];
  }
};

// Save collections to localStorage
const saveCollectionsToStorage = (collections: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections));
  } catch (error) {
    console.error('Error saving collections to storage:', error);
  }
};

// Load SKUs from localStorage
const loadSKUsFromStorage = (): any[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SKUS);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading SKUs from storage:', error);
    return [];
  }
};

// Save SKUs to localStorage
const saveSKUsToStorage = (skus: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_SKUS, JSON.stringify(skus));
  } catch (error) {
    console.error('Error saving SKUs to storage:', error);
  }
};

export interface SKU {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  skus: string[];
  status: 'active' | 'inactive';
}

/**
 * Get SKUs
 */
export async function getSKUs(params?: {
  category?: string;
  status?: string;
}): Promise<{ success: boolean; data: SKU[] }> {
  try {
    const queryString = params ? new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
    const url = queryString ? `${BASE_PATH}/skus?${queryString}` : `${BASE_PATH}/skus`;
    const response = await apiRequest(url);
    
    // Merge with localStorage data
    const storedSKUs = loadSKUsFromStorage();
    if (storedSKUs.length > 0) {
      // Merge: stored SKUs take precedence (they're newer)
      const apiSKUs = response.success && response.data ? response.data : [];
      const merged = [...storedSKUs, ...apiSKUs.filter(api => !storedSKUs.find(stored => stored.id === api.id))];
      return { success: true, data: merged };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    // Fallback to localStorage
    const storedSKUs = loadSKUsFromStorage();
    return { success: true, data: storedSKUs };
  }
}

/**
 * Create SKU
 */
export async function createSKU(data: Omit<SKU, 'id'>): Promise<{ success: boolean; data: SKU }> {
  try {
    // Create SKU with ID
    const newSKU: SKU = {
      ...data,
      id: `sku-${Date.now()}`,
    };
    
    // Save to localStorage immediately (optimistic update)
    // Save in both formats: API format and component format
    const storedSKUs = loadSKUsFromStorage();
    // Check if SKU already exists (by id or sku code)
    const existingIndex = storedSKUs.findIndex(s => s.id === newSKU.id || (s.sku || s.code) === (newSKU.sku || newSKU.code));
    if (existingIndex !== -1) {
      storedSKUs[existingIndex] = newSKU;
    } else {
      storedSKUs.unshift(newSKU); // Add to beginning
    }
    saveSKUsToStorage(storedSKUs);
    
    // Try API call
    try {
      const response = await apiRequest(`${BASE_PATH}/skus`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      // Update localStorage with API response if different
      if (response.success && response.data) {
        const apiIndex = storedSKUs.findIndex(s => s.id === newSKU.id);
        if (apiIndex !== -1) {
          storedSKUs[apiIndex] = response.data;
          saveSKUsToStorage(storedSKUs);
        }
      }
      return response;
    } catch (apiError) {
      // API failed but localStorage is updated
      return { success: true, data: newSKU };
    }
  } catch (error) {
    console.error('Error creating SKU:', error);
    throw error;
  }
}

/**
 * Update SKU
 */
export async function updateSKU(id: string, data: Partial<SKU>): Promise<{ success: boolean; data: SKU }> {
  try {
    // Update localStorage immediately (optimistic update)
    const storedSKUs = loadSKUsFromStorage();
    const index = storedSKUs.findIndex(sku => sku.id === id);
    if (index !== -1) {
      storedSKUs[index] = { ...storedSKUs[index], ...data };
      saveSKUsToStorage(storedSKUs);
    }
    
    // Try API call
    try {
      const response = await apiRequest(`${BASE_PATH}/skus/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (apiError) {
      // API failed but localStorage is updated
      const updatedSKU = storedSKUs.find(sku => sku.id === id);
      return { success: true, data: updatedSKU as SKU };
    }
  } catch (error) {
    console.error('Error updating SKU:', error);
    throw error;
  }
}

/**
 * Delete SKU
 */
export async function deleteSKU(id: string): Promise<{ success: boolean }> {
  return apiRequest(`${BASE_PATH}/skus/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get collections
 */
export async function getCollections(): Promise<{ success: boolean; data: Collection[] }> {
  try {
    const response = await apiRequest(`${BASE_PATH}/collections`);
    
    // Merge with localStorage data
    const storedCollections = loadCollectionsFromStorage();
    if (storedCollections.length > 0) {
      // Merge: stored collections take precedence (they're newer)
      const apiCollections = response.success && response.data ? response.data : [];
      const merged = [...storedCollections, ...apiCollections.filter(api => !storedCollections.find(stored => stored.id === api.id))];
      return { success: true, data: merged };
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching collections:', error);
    // Fallback to localStorage
    const storedCollections = loadCollectionsFromStorage();
    return { success: true, data: storedCollections };
  }
}

/**
 * Create collection
 */
export async function createCollection(data: Omit<Collection, 'id'>): Promise<{ success: boolean; data: Collection }> {
  try {
    // Create collection with ID
    const newCollection: Collection = {
      ...data,
      id: `col-${Date.now()}`,
    };
    
    // Save to localStorage immediately (optimistic update)
    const storedCollections = loadCollectionsFromStorage();
    storedCollections.unshift(newCollection); // Add to beginning
    saveCollectionsToStorage(storedCollections);
    
    // Try API call
    try {
      const response = await apiRequest(`${BASE_PATH}/collections`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (apiError) {
      // API failed but localStorage is updated
      return { success: true, data: newCollection };
    }
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}

/**
 * Update collection
 */
export async function updateCollection(id: string, data: Partial<Collection>): Promise<{ success: boolean; data: Collection }> {
  try {
    // Update localStorage immediately (optimistic update)
    const storedCollections = loadCollectionsFromStorage();
    const index = storedCollections.findIndex(col => col.id === id);
    if (index !== -1) {
      storedCollections[index] = { ...storedCollections[index], ...data };
      saveCollectionsToStorage(storedCollections);
    }
    
    // Try API call
    try {
      const response = await apiRequest(`${BASE_PATH}/collections/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (apiError) {
      // API failed but localStorage is updated
      const updatedCollection = storedCollections.find(col => col.id === id);
      return { success: true, data: updatedCollection as Collection };
    }
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
}

/**
 * Delete collection
 */
export async function deleteCollection(id: string): Promise<{ success: boolean }> {
  return apiRequest(`${BASE_PATH}/collections/${id}`, {
    method: 'DELETE',
  });
}

// Export as object for convenience
export const catalogApi = {
  getSKUs,
  createSKU,
  updateSKU,
  deleteSKU,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
};
