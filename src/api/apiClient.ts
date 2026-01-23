import { API_CONFIG } from '../config/api';

/**
 * API Client utility functions
 */

/**
 * Download CSV from API endpoint
 */
export async function apiDownloadCsv(endpoint: string, filename: string = 'export.csv'): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    // Error logging is handled by logger utility
    throw error;
  }
}

/**
 * Generic API request with authentication
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
