/**
 * Merch Catalog API
 */

import { apiRequest } from '../apiClient';

const BASE_PATH = '/merch/catalog';

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
  const queryString = params ? new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
  const url = queryString ? `${BASE_PATH}/skus?${queryString}` : `${BASE_PATH}/skus`;
  return apiRequest(url);
}

/**
 * Create SKU
 */
export async function createSKU(data: Omit<SKU, 'id'>): Promise<{ success: boolean; data: SKU }> {
  return apiRequest(`${BASE_PATH}/skus`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update SKU
 */
export async function updateSKU(id: string, data: Partial<SKU>): Promise<{ success: boolean; data: SKU }> {
  return apiRequest(`${BASE_PATH}/skus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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
  return apiRequest(`${BASE_PATH}/collections`);
}

/**
 * Create collection
 */
export async function createCollection(data: Omit<Collection, 'id'>): Promise<{ success: boolean; data: Collection }> {
  return apiRequest(`${BASE_PATH}/collections`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update collection
 */
export async function updateCollection(id: string, data: Partial<Collection>): Promise<{ success: boolean; data: Collection }> {
  return apiRequest(`${BASE_PATH}/collections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
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
