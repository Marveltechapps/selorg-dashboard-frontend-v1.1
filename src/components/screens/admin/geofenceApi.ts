// --- Type Definitions ---

export interface GeofenceZone {
  id: string;
  name: string;
  city: string;
  region: string;
  type: 'standard' | 'express' | 'no-service' | 'premium' | 'surge';
  status: 'active' | 'inactive' | 'testing';
  color: string;
  polygon: Coordinate[];
  center: Coordinate;
  settings: ZoneSettings;
  analytics: ZoneAnalytics;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface ZoneSettings {
  deliveryFee: number;
  minOrderValue: number;
  maxDeliveryRadius: number; // km
  estimatedDeliveryTime: number; // minutes
  surgeMultiplier: number;
  maxCapacity: number; // concurrent orders
  priority: number;
  availableSlots: string[]; // time slots
}

export interface ZoneAnalytics {
  areaSize: number; // sq km
  population: number;
  activeOrders: number;
  totalOrders: number;
  dailyOrders: number;
  revenue: number;
  avgDeliveryTime: number;
  riderCount: number;
  capacityUsage: number; // percentage
  customerSatisfaction: number;
}

export interface ZonePerformance {
  zoneId: string;
  zoneName: string;
  orders: number;
  revenue: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  cancellationRate: number;
  rating: number;
}

export interface CoverageStats {
  totalZones: number;
  activeZones: number;
  totalCoverage: number; // sq km
  totalPopulation: number;
  activeOrders: number;
  totalRiders: number;
  avgCapacityUsage: number;
}

export interface ZoneHistory {
  id: string;
  zoneId: string;
  zoneName: string;
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
  changes: string;
  timestamp: string;
  performedBy: string;
}

export interface OverlapWarning {
  zone1: string;
  zone2: string;
  overlapArea: number;
  severity: 'low' | 'medium' | 'high';
}

// --- Mock Data ---

const MOCK_ZONES: GeofenceZone[] = [
  {
    id: 'ZONE-001',
    name: 'Central Business District',
    city: 'Mumbai',
    region: 'West',
    type: 'premium',
    status: 'active',
    color: '#8b5cf6',
    polygon: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0760, lng: 72.8877 },
      { lat: 19.0660, lng: 72.8877 },
      { lat: 19.0660, lng: 72.8777 },
    ],
    center: { lat: 19.0710, lng: 72.8827 },
    settings: {
      deliveryFee: 49,
      minOrderValue: 199,
      maxDeliveryRadius: 3,
      estimatedDeliveryTime: 20,
      surgeMultiplier: 1.0,
      maxCapacity: 150,
      priority: 1,
      availableSlots: ['08:00-23:00'],
    },
    analytics: {
      areaSize: 12.5,
      population: 250000,
      activeOrders: 87,
      totalOrders: 15678,
      dailyOrders: 523,
      revenue: 3456789,
      avgDeliveryTime: 22,
      riderCount: 45,
      capacityUsage: 58,
      customerSatisfaction: 4.7,
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T08:30:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-002',
    name: 'Koramangala Tech Hub',
    city: 'Bangalore',
    region: 'South',
    type: 'express',
    status: 'active',
    color: '#10b981',
    polygon: [
      { lat: 12.9352, lng: 77.6245 },
      { lat: 12.9352, lng: 77.6345 },
      { lat: 12.9252, lng: 77.6345 },
      { lat: 12.9252, lng: 77.6245 },
    ],
    center: { lat: 12.9302, lng: 77.6295 },
    settings: {
      deliveryFee: 29,
      minOrderValue: 99,
      maxDeliveryRadius: 5,
      estimatedDeliveryTime: 15,
      surgeMultiplier: 1.0,
      maxCapacity: 200,
      priority: 2,
      availableSlots: ['07:00-23:00'],
    },
    analytics: {
      areaSize: 18.3,
      population: 180000,
      activeOrders: 124,
      totalOrders: 23456,
      dailyOrders: 678,
      revenue: 4567890,
      avgDeliveryTime: 18,
      riderCount: 62,
      capacityUsage: 62,
      customerSatisfaction: 4.8,
    },
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-12-20T09:15:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-003',
    name: 'Connaught Place',
    city: 'Delhi',
    region: 'North',
    type: 'standard',
    status: 'active',
    color: '#3b82f6',
    polygon: [
      { lat: 28.6304, lng: 77.2177 },
      { lat: 28.6304, lng: 77.2277 },
      { lat: 28.6204, lng: 77.2277 },
      { lat: 28.6204, lng: 77.2177 },
    ],
    center: { lat: 28.6254, lng: 77.2227 },
    settings: {
      deliveryFee: 39,
      minOrderValue: 149,
      maxDeliveryRadius: 4,
      estimatedDeliveryTime: 25,
      surgeMultiplier: 1.0,
      maxCapacity: 120,
      priority: 3,
      availableSlots: ['08:00-22:00'],
    },
    analytics: {
      areaSize: 15.7,
      population: 200000,
      activeOrders: 56,
      totalOrders: 18234,
      dailyOrders: 489,
      revenue: 2890456,
      avgDeliveryTime: 26,
      riderCount: 38,
      capacityUsage: 47,
      customerSatisfaction: 4.5,
    },
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-12-20T07:45:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-004',
    name: 'Airport Restricted Zone',
    city: 'Mumbai',
    region: 'West',
    type: 'no-service',
    status: 'active',
    color: '#ef4444',
    polygon: [
      { lat: 19.0896, lng: 72.8656 },
      { lat: 19.0896, lng: 72.8756 },
      { lat: 19.0796, lng: 72.8756 },
      { lat: 19.0796, lng: 72.8656 },
    ],
    center: { lat: 19.0846, lng: 72.8706 },
    settings: {
      deliveryFee: 0,
      minOrderValue: 0,
      maxDeliveryRadius: 0,
      estimatedDeliveryTime: 0,
      surgeMultiplier: 0,
      maxCapacity: 0,
      priority: 10,
      availableSlots: [],
    },
    analytics: {
      areaSize: 8.2,
      population: 0,
      activeOrders: 0,
      totalOrders: 0,
      dailyOrders: 0,
      revenue: 0,
      avgDeliveryTime: 0,
      riderCount: 0,
      capacityUsage: 0,
      customerSatisfaction: 0,
    },
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-005',
    name: 'Bandra Surge Zone',
    city: 'Mumbai',
    region: 'West',
    type: 'surge',
    status: 'active',
    color: '#f59e0b',
    polygon: [
      { lat: 19.0596, lng: 72.8295 },
      { lat: 19.0596, lng: 72.8395 },
      { lat: 19.0496, lng: 72.8395 },
      { lat: 19.0496, lng: 72.8295 },
    ],
    center: { lat: 19.0546, lng: 72.8345 },
    settings: {
      deliveryFee: 59,
      minOrderValue: 249,
      maxDeliveryRadius: 3,
      estimatedDeliveryTime: 25,
      surgeMultiplier: 1.5,
      maxCapacity: 100,
      priority: 1,
      availableSlots: ['18:00-23:00'],
    },
    analytics: {
      areaSize: 10.4,
      population: 150000,
      activeOrders: 45,
      totalOrders: 8934,
      dailyOrders: 298,
      revenue: 2345678,
      avgDeliveryTime: 28,
      riderCount: 28,
      capacityUsage: 45,
      customerSatisfaction: 4.4,
    },
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
    createdBy: 'operations@quickcommerce.com',
  },
  {
    id: 'ZONE-006',
    name: 'Indiranagar Residential',
    city: 'Bangalore',
    region: 'South',
    type: 'standard',
    status: 'active',
    color: '#3b82f6',
    polygon: [
      { lat: 12.9716, lng: 77.6412 },
      { lat: 12.9716, lng: 77.6512 },
      { lat: 12.9616, lng: 77.6512 },
      { lat: 12.9616, lng: 77.6412 },
    ],
    center: { lat: 12.9666, lng: 77.6462 },
    settings: {
      deliveryFee: 29,
      minOrderValue: 99,
      maxDeliveryRadius: 4,
      estimatedDeliveryTime: 30,
      surgeMultiplier: 1.0,
      maxCapacity: 80,
      priority: 4,
      availableSlots: ['08:00-22:00'],
    },
    analytics: {
      areaSize: 14.2,
      population: 120000,
      activeOrders: 34,
      totalOrders: 12456,
      dailyOrders: 412,
      revenue: 1890234,
      avgDeliveryTime: 32,
      riderCount: 25,
      capacityUsage: 43,
      customerSatisfaction: 4.6,
    },
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-007',
    name: 'Gurgaon Cyber City',
    city: 'Delhi',
    region: 'North',
    type: 'premium',
    status: 'testing',
    color: '#8b5cf6',
    polygon: [
      { lat: 28.4950, lng: 77.0890 },
      { lat: 28.4950, lng: 77.0990 },
      { lat: 28.4850, lng: 77.0990 },
      { lat: 28.4850, lng: 77.0890 },
    ],
    center: { lat: 28.4900, lng: 77.0940 },
    settings: {
      deliveryFee: 49,
      minOrderValue: 199,
      maxDeliveryRadius: 5,
      estimatedDeliveryTime: 20,
      surgeMultiplier: 1.2,
      maxCapacity: 150,
      priority: 1,
      availableSlots: ['08:00-23:00'],
    },
    analytics: {
      areaSize: 16.8,
      population: 180000,
      activeOrders: 12,
      totalOrders: 2345,
      dailyOrders: 78,
      revenue: 456789,
      avgDeliveryTime: 24,
      riderCount: 15,
      capacityUsage: 8,
      customerSatisfaction: 4.3,
    },
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-20T11:00:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'ZONE-008',
    name: 'Andheri Suburban',
    city: 'Mumbai',
    region: 'West',
    type: 'standard',
    status: 'inactive',
    color: '#3b82f6',
    polygon: [
      { lat: 19.1136, lng: 72.8697 },
      { lat: 19.1136, lng: 72.8797 },
      { lat: 19.1036, lng: 72.8797 },
      { lat: 19.1036, lng: 72.8697 },
    ],
    center: { lat: 19.1086, lng: 72.8747 },
    settings: {
      deliveryFee: 39,
      minOrderValue: 149,
      maxDeliveryRadius: 4,
      estimatedDeliveryTime: 30,
      surgeMultiplier: 1.0,
      maxCapacity: 100,
      priority: 5,
      availableSlots: ['08:00-22:00'],
    },
    analytics: {
      areaSize: 13.5,
      population: 160000,
      activeOrders: 0,
      totalOrders: 9876,
      dailyOrders: 0,
      revenue: 1234567,
      avgDeliveryTime: 0,
      riderCount: 0,
      capacityUsage: 0,
      customerSatisfaction: 4.2,
    },
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-12-10T15:00:00Z',
    createdBy: 'admin@quickcommerce.com',
  },
];

const MOCK_COVERAGE_STATS: CoverageStats = {
  totalZones: 8,
  activeZones: 6,
  totalCoverage: 109.6,
  totalPopulation: 1240000,
  activeOrders: 358,
  totalRiders: 213,
  avgCapacityUsage: 45.3,
};

const MOCK_ZONE_PERFORMANCE: ZonePerformance[] = [
  {
    zoneId: 'ZONE-002',
    zoneName: 'Koramangala Tech Hub',
    orders: 678,
    revenue: 456789,
    avgDeliveryTime: 18,
    onTimeRate: 96.5,
    cancellationRate: 1.8,
    rating: 4.8,
  },
  {
    zoneId: 'ZONE-001',
    zoneName: 'Central Business District',
    orders: 523,
    revenue: 345678,
    avgDeliveryTime: 22,
    onTimeRate: 94.2,
    cancellationRate: 2.3,
    rating: 4.7,
  },
  {
    zoneId: 'ZONE-003',
    zoneName: 'Connaught Place',
    orders: 489,
    revenue: 289045,
    avgDeliveryTime: 26,
    onTimeRate: 91.8,
    cancellationRate: 3.1,
    rating: 4.5,
  },
  {
    zoneId: 'ZONE-006',
    zoneName: 'Indiranagar Residential',
    orders: 412,
    revenue: 189023,
    avgDeliveryTime: 32,
    onTimeRate: 89.3,
    cancellationRate: 3.8,
    rating: 4.6,
  },
  {
    zoneId: 'ZONE-005',
    zoneName: 'Bandra Surge Zone',
    orders: 298,
    revenue: 234567,
    avgDeliveryTime: 28,
    onTimeRate: 92.1,
    cancellationRate: 2.9,
    rating: 4.4,
  },
];

const MOCK_HISTORY: ZoneHistory[] = [
  {
    id: 'HIST-001',
    zoneId: 'ZONE-007',
    zoneName: 'Gurgaon Cyber City',
    action: 'created',
    changes: 'New premium zone created for testing',
    timestamp: '2024-12-15T09:00:00Z',
    performedBy: 'admin@quickcommerce.com',
  },
  {
    id: 'HIST-002',
    zoneId: 'ZONE-005',
    zoneName: 'Bandra Surge Zone',
    action: 'updated',
    changes: 'Updated surge multiplier from 1.3 to 1.5',
    timestamp: '2024-12-20T10:00:00Z',
    performedBy: 'operations@quickcommerce.com',
  },
  {
    id: 'HIST-003',
    zoneId: 'ZONE-008',
    zoneName: 'Andheri Suburban',
    action: 'deactivated',
    changes: 'Zone temporarily deactivated for rider shortage',
    timestamp: '2024-12-10T15:00:00Z',
    performedBy: 'admin@quickcommerce.com',
  },
  {
    id: 'HIST-004',
    zoneId: 'ZONE-002',
    zoneName: 'Koramangala Tech Hub',
    action: 'updated',
    changes: 'Increased max capacity from 150 to 200',
    timestamp: '2024-12-20T09:15:00Z',
    performedBy: 'admin@quickcommerce.com',
  },
  {
    id: 'HIST-005',
    zoneId: 'ZONE-001',
    zoneName: 'Central Business District',
    action: 'updated',
    changes: 'Updated delivery fee from 39 to 49',
    timestamp: '2024-12-20T08:30:00Z',
    performedBy: 'admin@quickcommerce.com',
  },
];

const MOCK_OVERLAPS: OverlapWarning[] = [
  {
    zone1: 'ZONE-001',
    zone2: 'ZONE-005',
    overlapArea: 0.8,
    severity: 'low',
  },
  {
    zone1: 'ZONE-002',
    zone2: 'ZONE-006',
    overlapArea: 2.3,
    severity: 'medium',
  },
];

import { apiRequest } from '@/api/apiClient';

// --- API Functions ---

export async function fetchZones(): Promise<GeofenceZone[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: GeofenceZone[] }>('/merch/geofence/zones');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return [];
  }
}

export async function fetchCoverageStats(): Promise<CoverageStats> {
  try {
    const zones = await fetchZones();
    return {
      totalZones: zones.length,
      activeZones: zones.filter(z => z.status === 'active').length,
      totalCoverage: zones.reduce((sum, z) => sum + (z.analytics?.areaSize || 0), 0),
      totalPopulation: zones.reduce((sum, z) => sum + (z.analytics?.population || 0), 0),
      activeOrders: zones.reduce((sum, z) => sum + (z.analytics?.activeOrders || 0), 0),
      totalRiders: zones.reduce((sum, z) => sum + (z.analytics?.riderCount || 0), 0),
      avgCapacityUsage: zones.length > 0 ? zones.reduce((sum, z) => sum + (z.analytics?.capacityUsage || 0), 0) / zones.length : 0,
    };
  } catch (error) {
    console.error('Failed to fetch coverage stats:', error);
    return {
      totalZones: 0,
      activeZones: 0,
      totalCoverage: 0,
      totalPopulation: 0,
      activeOrders: 0,
      totalRiders: 0,
      avgCapacityUsage: 0,
    };
  }
}

export async function fetchZonePerformance(): Promise<ZonePerformance[]> {
  try {
    const zones = await fetchZones();
    return zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      orders: zone.analytics?.totalOrders || 0,
      revenue: zone.analytics?.revenue || 0,
      avgDeliveryTime: zone.analytics?.avgDeliveryTime || 0,
      onTimeRate: 0,
      cancellationRate: 0,
      rating: zone.analytics?.customerSatisfaction || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch zone performance:', error);
    return [];
  }
}

export async function fetchZoneHistory(): Promise<ZoneHistory[]> {
  // TODO: Implement backend endpoint for zone history
  return [];
}

export async function fetchOverlapWarnings(): Promise<OverlapWarning[]> {
  // TODO: Implement backend endpoint for overlap warnings
  return [];
}

export async function createZone(zone: Partial<GeofenceZone>): Promise<GeofenceZone> {
  const response = await apiRequest<{ success: boolean; data: GeofenceZone }>('/merch/geofence/zones', {
    method: 'POST',
    body: JSON.stringify(zone),
  });
  return response.data;
}

export async function updateZone(zoneId: string, updates: Partial<GeofenceZone>): Promise<void> {
  await apiRequest(`/merch/geofence/zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteZone(zoneId: string): Promise<void> {
  await apiRequest(`/merch/geofence/zones/${zoneId}`, {
    method: 'DELETE',
  });
}

export async function toggleZoneStatus(zoneId: string, status: 'active' | 'inactive'): Promise<void> {
  await apiRequest(`/merch/geofence/zones/${zoneId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function cloneZone(zoneId: string, newName: string): Promise<GeofenceZone> {
  const originalZone = await apiRequest<{ success: boolean; data: GeofenceZone }>(`/merch/geofence/zones/${zoneId}`);
  const cloned = { ...originalZone.data, name: newName, status: 'testing' as const };
  return await createZone(cloned);
}
