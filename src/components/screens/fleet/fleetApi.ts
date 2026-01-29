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

const API_BASE = 'http://localhost:5001/api/v1/rider/fleet';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

export async function fetchFleetSummary(): Promise<FleetSummary> {
  const data = await apiRequest('/summary');
  if (!data.success) throw new Error(data.message || 'Failed to fetch fleet summary');
  return data.data;
}

export async function fetchVehicles(filters?: { status?: string; type?: string; fuelType?: string }): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.append('status', filters.status);
  if (filters?.type && filters.type !== "all") params.append('type', filters.type);
  if (filters?.fuelType && filters.fuelType !== "all") params.append('fuelType', filters.fuelType);
  const data = await apiRequest(`/vehicles?${params.toString()}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch vehicles');
  return data.data || [];
}

export async function fetchVehicleById(id: string): Promise<Vehicle | undefined> {
  const data = await apiRequest(`/vehicles/${id}`);
  if (!data.success) throw new Error(data.message || 'Failed to fetch vehicle');
  return data.data;
}

export async function createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
  try {
    const response = await apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.success ? response.data : response;
  } catch (err) {
    console.error('Failed to create vehicle', err);
    throw err;
  }
}

export async function updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
  try {
    const response = await apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success ? response.data : response;
  } catch (err) {
    console.error('Failed to update vehicle', err);
    throw err;
  }
}

export async function fetchMaintenanceTasks(): Promise<MaintenanceTask[]> {
  const data = await apiRequest('/maintenance');
  if (!data.success) throw new Error(data.message || 'Failed to fetch maintenance tasks');
  const tasks = data.data || [];
  return Array.isArray(tasks) ? tasks.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) : [];
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
    await apiRequest(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.error('Failed to update maintenance task', err);
    throw err;
  }
}
