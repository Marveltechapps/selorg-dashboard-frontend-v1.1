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
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Request failed with status ${response.status}` };
    }

    // Handle authentication/authorization errors
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      const errorMsg = errorData.error?.message || errorData.message || 'Permission denied. You do not have access to perform this action.';
      const error: any = new Error(errorMsg);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    const error: any = new Error(errorData.error?.message || errorData.message || 'Request failed');
    error.response = { data: errorData, status: response.status };
    throw error;
  }

  return response.json();
}
