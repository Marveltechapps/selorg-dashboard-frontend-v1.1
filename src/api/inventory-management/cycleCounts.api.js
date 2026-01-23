/**
 * Cycle Counts API
 * Handles cycle count-related API calls
 */

import { get } from './apiClient';

const BASE_PATH = '/api/darkstore/inventory/cycle-count';

/**
 * Get cycle count data
 */
export async function fetchCycleCount(storeId = 'DS-Brooklyn-04', date) {
  const params = { storeId };
  if (date) params.date = date;
  return get(BASE_PATH, params);
}

/**
 * Download cycle count report
 */
export async function downloadCycleCountReport(storeId = 'DS-Brooklyn-04', date, format = 'pdf') {
  const params = { storeId, format };
  if (date) params.date = date;
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${BASE_PATH}/report?${queryString}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
  } catch (error) {
    console.error('Error downloading cycle count report:', error);
    throw error;
  }
}

