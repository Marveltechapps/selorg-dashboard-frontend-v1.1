import { API_CONFIG, API_ENDPOINTS } from '../../../config/api';

export interface Vehicle {
  id: string;
  vehicleId: string;
  type: string;
  assignedRiderName?: string;
  status: 'active' | 'maintenance' | 'offline';
  conditionScore: number;
  fuelType: 'EV' | 'Gas';
}

export interface FleetSummary {
  totalFleet: number;
  inMaintenance: number;
  evUsagePercent: number;
  scheduledServicesNextWeek: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const fleetApi = {
  getSummary: () => apiRequest<FleetSummary>(API_ENDPOINTS.fleet.summary),
  getVehicles: (filters: any = {}) => {
    const params = new URLSearchParams(filters);
    return apiRequest<{ vehicles: Vehicle[], total: number }>(`${API_ENDPOINTS.fleet.vehicles}?${params.toString()}`);
  },
};

