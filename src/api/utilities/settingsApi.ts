/**
 * Settings API
 * Manages application settings with real-time updates
 * Base URL: http://localhost:5001/api/darkstore
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const SETTINGS_ENDPOINT = `${API_BASE_URL}/api/darkstore/settings`;

export interface AppSettings {
  refreshIntervals: {
    dashboard: number;
    alerts: number;
    orders: number;
    inventory: number;
    analytics: number;
  };
  storeMode: 'online' | 'pause' | 'maintenance';
  notifications: {
    enabled: boolean;
    sound: boolean;
    criticalOnly: boolean;
    email: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    timeFormat: '12h' | '24h';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  };
  performance: {
    enableRealTimeUpdates: boolean;
    enableOptimisticUpdates: boolean;
    cacheTimeout: number;
  };
  outbound?: {
    autoDispatchEnabled: boolean;
    autoDispatchThreshold: number;
    maxOrdersPerRider: number;
    enableRiderAutoAssignment: boolean;
  };
}

export interface SettingsResponse {
  success: boolean;
  settings: AppSettings;
  lastUpdated?: string;
  message?: string;
}

/**
 * API Request Helper
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(endpoint, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to backend. Please ensure the server is running on port 5000.');
    }
    throw error;
  }
}

/**
 * Get Application Settings
 * GET /api/darkstore/settings
 */
export async function getSettings(): Promise<AppSettings> {
  const response = await apiRequest(`${SETTINGS_ENDPOINT}`) as SettingsResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch settings');
  }
  
  return response.settings;
}

/**
 * Update Application Settings
 * PUT /api/darkstore/settings
 */
export async function updateSettings(settings: AppSettings): Promise<SettingsResponse> {
  const response = await apiRequest(`${SETTINGS_ENDPOINT}`, {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  }) as SettingsResponse;
  
  if (!response.success) {
    throw new Error('Failed to update settings');
  }
  
  return response;
}

