/**
 * Production Picklists API
 * Mirrors Darkstore picklists API but uses /production path
 */

import { apiRequest } from '../apiClient';

const BASE_PATH = '/production/picklists';

export async function getPicklists(params?: {
  status?: string;
  storeId?: string;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: any[]; pagination?: any }> {
  const queryString = params ? new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])).toString() : '';
  const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;
  return apiRequest(url);
}

export async function createPicklist(data: any): Promise<{ success: boolean; data: any }> {
  return apiRequest(BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPicklistDetails(picklistId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}`);
}

export async function startPicking(picklistId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}/start`, {
    method: 'POST',
  });
}

export async function pausePicking(picklistId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}/pause`, {
    method: 'POST',
  });
}

export async function completePicking(picklistId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}/complete`, {
    method: 'POST',
  });
}

export async function assignPicker(picklistId: string, pickerId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ pickerId }),
  });
}

export async function moveToPacking(picklistId: string): Promise<{ success: boolean; data: any }> {
  return apiRequest(`${BASE_PATH}/${picklistId}/move-to-packing`, {
    method: 'POST',
  });
}

// Export as object for convenience
export const picklistsApi = {
  getPicklists,
  createPicklist,
  getPicklistDetails,
  startPicking,
  pausePicking,
  completePicking,
  assignPicker,
  moveToPacking,
};
