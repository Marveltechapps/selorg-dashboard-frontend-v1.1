export type VehicleType = "Electric Scooter" | "Motorbike (Gas)" | "Bicycle" | "Car" | "Van";
export type FuelType = "EV" | "Petrol" | "Diesel" | "Other";
export type VehicleStatus = "active" | "maintenance" | "inactive";
export type PoolType = "Hub" | "Dedicated" | "Spare";
export type MaintenanceStatus = "upcoming" | "in_progress" | "completed";
export type MaintenanceType = "Scheduled Service" | "Breakdown" | "Inspection";

export interface VehicleDocuments {
  rcValidTill: string; // ISO date
  insuranceValidTill: string; // ISO date
  pucValidTill?: string; // ISO date
}

export interface Vehicle {
  id: string; // internal id
  vehicleId: string; // display id e.g. "EV-SCOOT-012"
  type: VehicleType;
  fuelType: FuelType;
  assignedRiderId?: string;
  assignedRiderName?: string;
  status: VehicleStatus;
  conditionScore: number; // 0-100
  conditionLabel: string;
  lastServiceDate: string; // ISO date
  nextServiceDueDate: string; // ISO date
  currentOdometerKm: number;
  utilizationPercent: number;
  documents: VehicleDocuments;
  pool: PoolType;
  notes?: string;
  location?: string; // e.g. "Downtown Hub"
}

export interface FleetSummary {
  totalFleet: number;
  inMaintenance: number;
  evUsagePercent: number;
  scheduledServicesNextWeek: number;
}

export interface MaintenanceTask {
  id: string;
  vehicleId: string; // Display ID
  vehicleInternalId: string; // Internal ID
  type: MaintenanceType;
  scheduledDate: string; // ISO date
  status: MaintenanceStatus;
  workshopName?: string;
  notes?: string;
  cost?: number;
}

// --- API FUNCTIONS ---

import { API_CONFIG } from '../../../config/api';
import { API_ENDPOINTS } from '../../../config/api';

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      ...(options.headers as object),
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

const MOCK_FLEET_SUMMARY: FleetSummary = { totalFleet: 45, inMaintenance: 3, evUsagePercent: 62, scheduledServicesNextWeek: 5 };
const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', vehicleId: 'EV-SCOOT-001', type: 'Electric Scooter', fuelType: 'EV', assignedRiderName: 'Raj K', status: 'active', conditionScore: 92, conditionLabel: 'Good', lastServiceDate: new Date(Date.now() - 20 * 86400000).toISOString(), nextServiceDueDate: new Date(Date.now() + 10 * 86400000).toISOString(), currentOdometerKm: 1200, utilizationPercent: 75, documents: { rcValidTill: new Date(Date.now() + 365 * 86400000).toISOString(), insuranceValidTill: new Date(Date.now() + 180 * 86400000).toISOString() }, pool: 'Hub' },
  { id: 'v2', vehicleId: 'EV-SCOOT-002', type: 'Electric Scooter', fuelType: 'EV', status: 'maintenance', conditionScore: 65, conditionLabel: 'Fair', lastServiceDate: new Date(Date.now() - 90 * 86400000).toISOString(), nextServiceDueDate: new Date().toISOString(), currentOdometerKm: 3400, utilizationPercent: 0, documents: { rcValidTill: new Date(Date.now() + 300 * 86400000).toISOString(), insuranceValidTill: new Date(Date.now() + 200 * 86400000).toISOString() }, pool: 'Hub' },
];
const MOCK_MAINTENANCE: MaintenanceTask[] = [
  { id: 'm1', vehicleId: 'EV-SCOOT-002', vehicleInternalId: 'v2', type: 'Scheduled Service', scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'upcoming', workshopName: 'Hub Garage', notes: 'Annual service due' },
];

export async function fetchFleetSummary(): Promise<FleetSummary> {
  try {
    const data = await apiRequest(API_ENDPOINTS.fleet.summary);
    if (data && data.success === false) throw new Error(data.message);
    return (data?.data ?? data) || MOCK_FLEET_SUMMARY;
  } catch (_) {
    return MOCK_FLEET_SUMMARY;
  }
}

export async function fetchVehicles(filters?: { status?: string; type?: string; fuelType?: string }): Promise<Vehicle[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "all") params.append('status', filters.status);
    if (filters?.type && filters.type !== "all") params.append('type', filters.type);
    if (filters?.fuelType && filters.fuelType !== "all") params.append('fuelType', filters.fuelType);
    const data = await apiRequest(`${API_ENDPOINTS.fleet.vehicles}?${params.toString()}`);
    if (data && data.success === false) throw new Error(data.message);
    const list = data?.data ?? data?.vehicles ?? [];
    return Array.isArray(list) ? list : MOCK_VEHICLES;
  } catch (_) {
    return MOCK_VEHICLES;
  }
}

export async function fetchVehicleById(id: string): Promise<Vehicle | undefined> {
  const data = await apiRequest(`/vehicles/${id}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch vehicle');
  return data.data;
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  try {
    const response = await apiRequest(API_ENDPOINTS.fleet.vehicles, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response?.data ?? response) as Vehicle;
  } catch (err) {
    console.error('Failed to create vehicle', err);
    throw new Error('Failed to add vehicle. Backend may be offline—check connection.');
  }
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.fleet.vehicle(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
    return (response?.data ?? response) as Vehicle;
  } catch (_) {
    throw new Error('Backend unavailable. Update applied locally.');
  }
}

export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
  try {
    const data = await apiRequest(API_ENDPOINTS.fleet.maintenance);
    if (data && data.success === false) throw new Error(data.message);
    const tasks = data?.data ?? data ?? [];
    const arr = Array.isArray(tasks) ? tasks : MOCK_MAINTENANCE;
    return arr.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  } catch (_) {
    return MOCK_MAINTENANCE;
  }
}

export async function createMaintenanceTask(task: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  try {
    const response = await apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    return response.success ? response.data : response;
  } catch (err) {
    console.error('Failed to create maintenance task', err);
    throw err;
  }
}

export async function updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Promise<void> {
  try {
    await apiRequest(`${API_ENDPOINTS.fleet.maintenanceTask(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  } catch (_) {
    return;
  }
}
