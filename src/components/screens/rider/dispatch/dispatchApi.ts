import { API_CONFIG, API_ENDPOINTS } from '../../../../config/api';
import { DispatchOrder, DispatchRider, AutoAssignRule, Priority, OrderStatus, RiderStatus } from "./types";
import { logger } from '../../../../utils/logger';

/**
 * API Response Types (from backend)
 */
interface ApiOrder {
  id: string;
  status: string;
  riderId?: string | null;
  etaMinutes?: number | null;
  slaDeadline: string;
  pickupLocation: string;
  dropLocation: string;
  customerName: string;
  items: string[];
  zone?: string;
  priority?: string;
  distance?: number;
  createdAt: string;
}

interface ApiRider {
  id: string;
  name: string;
  status: string;
  location?: { lat: number; lng: number } | null;
  zone?: string | null;
  capacity: {
    currentLoad: number;
    maxLoad: number;
  };
  currentOrderId?: string | null;
  avatarInitials?: string;
  rating?: number;
  avgEtaMins?: number;
}

interface ApiRecommendedRider {
  id: string;
  name: string;
  zone: string;
  status: string;
  load: {
    current: number;
    max: number;
  };
  estimatedPickupMinutes: number;
  distance: number | null;
  rating: number;
  score: number;
  isRecommended: boolean;
}

interface ApiMapData {
  riders: ApiRider[];
  orders: Array<{
    id: string;
    status: string;
    pickupLocation: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
    dropLocation: {
      address: string;
      coordinates: { lat: number; lng: number };
    };
    riderId?: string | null;
    priority: string;
    zone?: string;
  }>;
  pickupPoints?: Array<{
    id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    orderCount: number;
  }>;
  statusCounts?: {
    riders?: Record<string, number>;
    orders?: Record<string, number>;
  };
}

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  logger.apiRequest('DispatchAPI', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    logger.apiResponse('DispatchAPI', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Dispatch API] Error response:`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Request failed' };
      }
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.apiSuccess('DispatchAPI', data);
    return data;
  } catch (error) {
    logger.apiError('DispatchAPI', url, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend API. Please ensure the backend server is running.`);
    }
    throw error;
  }
}

/**
 * Transform backend order to frontend order
 */
function transformOrder(apiOrder: ApiOrder): DispatchOrder {
  // Extract coordinates from address (simplified - backend should provide coordinates)
  const extractCoords = (address: string) => {
    // Mock coordinates based on address hash
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lat = 40.7128 + (hash % 100) / 1000;
    const lng = -74.0060 + (hash % 200) / 1000;
    return { lat, lng };
  };

  const priority = (apiOrder.priority || 'low') as Priority;
  const status = apiOrder.status === 'pending' ? 'unassigned' : apiOrder.status as OrderStatus;
  
  return {
    id: apiOrder.id,
    priority,
    distanceKm: apiOrder.distance || 0,
    etaMinutes: apiOrder.etaMinutes || 15,
    zone: apiOrder.zone || 'Unknown',
    status,
    pickupLocation: {
      ...extractCoords(apiOrder.pickupLocation),
      address: apiOrder.pickupLocation,
    },
    dropLocation: {
      ...extractCoords(apiOrder.dropLocation),
      address: apiOrder.dropLocation,
    },
    riderId: apiOrder.riderId || undefined,
    slaDeadline: apiOrder.slaDeadline,
    createdAt: apiOrder.createdAt,
  };
}

/**
 * Transform backend rider to frontend rider
 */
function transformRider(apiRider: ApiRider): DispatchRider {
  const status = apiRider.status as RiderStatus;
  
  return {
    id: apiRider.id,
    name: apiRider.name,
    status,
    currentLocation: apiRider.location || { lat: 40.7128, lng: -74.0060 },
    activeOrdersCount: apiRider.capacity.currentLoad,
    maxCapacity: apiRider.capacity.maxLoad,
    zone: apiRider.zone || 'Unknown',
    avgEtaMinutes: apiRider.avgEtaMins || 12,
  };
}

/**
 * Real API implementation
 */
export async function fetchUnassignedOrders(params?: {
  priority?: string;
  zone?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}): Promise<DispatchOrder[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.priority && params.priority !== 'all') {
    queryParams.append('priority', params.priority);
  }
  if (params?.zone) {
    queryParams.append('zone', params.zone);
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${API_ENDPOINTS.dispatch.unassignedOrders}?${queryString}`
    : API_ENDPOINTS.dispatch.unassignedOrders;
  
  const response = await apiRequest<{ orders: ApiOrder[]; total: number; page: number; limit: number; totalPages: number }>(endpoint);
  
  return response.orders.map(transformOrder);
}

export async function fetchAllOrders(): Promise<DispatchOrder[]> {
  // Get map data which includes all orders
  const mapData = await apiRequest<ApiMapData>(API_ENDPOINTS.dispatch.mapData);
  
  return mapData.orders.map(order => ({
    id: order.id,
    priority: order.priority as Priority,
    distanceKm: 0, // Will be calculated
    etaMinutes: 15,
    zone: order.zone || 'Unknown',
    status: order.status === 'pending' ? 'unassigned' : order.status as OrderStatus,
    pickupLocation: {
      ...order.pickupLocation.coordinates,
      address: order.pickupLocation.address,
    },
    dropLocation: {
      ...order.dropLocation.coordinates,
      address: order.dropLocation.address,
    },
    riderId: order.riderId || undefined,
    slaDeadline: new Date().toISOString(), // Will be provided by backend
    createdAt: new Date().toISOString(),
  }));
}

export async function fetchOnlineRiders(): Promise<DispatchRider[]> {
  const mapData = await apiRequest<ApiMapData>(API_ENDPOINTS.dispatch.mapData);
  
  return mapData.riders.map(transformRider);
}

export async function assignOrder(orderId: string, riderId: string, overrideSla?: boolean): Promise<void> {
  await apiRequest(
    API_ENDPOINTS.dispatch.assignOrder,
    {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        riderId,
        overrideSla: overrideSla || false,
      }),
    }
  );
}

export async function autoAssignOrders(orderIds: string[]): Promise<{ assigned: number; failed: number }> {
  const result = await apiRequest<{ assigned: number; failed: number }>(
    API_ENDPOINTS.dispatch.autoAssign,
    {
      method: 'POST',
      body: JSON.stringify({
        orderIds,
      }),
    }
  );
  
  return result;
}

export async function fetchAutoAssignRules(): Promise<AutoAssignRule[]> {
  // Mock for now - backend doesn't have rules endpoint yet
  return [
    {
      id: "rule-1",
      name: "Standard Optimization",
      isActive: true,
      criteria: {
        maxRadiusKm: 5,
        maxOrdersPerRider: 3,
        preferSameZone: true,
        priorityWeight: 8,
        distanceWeight: 6,
        etaWeight: 7,
      },
      createdBy: "Admin",
      updatedAt: new Date().toISOString(),
    }
  ];
}

export async function updateAutoAssignRule(rule: AutoAssignRule): Promise<void> {
  // Mock for now - backend doesn't have rules endpoint yet
  console.log('Update rule:', rule);
}

export async function batchCreateAssignment(orderIds: string[], riderId: string): Promise<void> {
  // For batch assignment, we need to assign each order individually
  // The backend batch-assign endpoint assigns to best available riders automatically
  // So we'll use individual assignments for manual batch assignment to a specific rider
  const results = await Promise.allSettled(
    orderIds.map(orderId => assignOrder(orderId, riderId, false))
  );
  
  const failed = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    throw new Error(`${failed} of ${orderIds.length} assignments failed`);
  }
}

/**
 * Get recommended riders for an order
 */
export async function fetchRecommendedRiders(orderId: string, search?: string): Promise<ApiRecommendedRider[]> {
  const queryParams = new URLSearchParams();
  if (search) {
    queryParams.append('search', search);
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${API_ENDPOINTS.dispatch.recommendedRiders(orderId)}?${queryString}`
    : API_ENDPOINTS.dispatch.recommendedRiders(orderId);
  
  const response = await apiRequest<{ riders: ApiRecommendedRider[]; orderDetails: any }>(endpoint);
  
  return response.riders;
}

/**
 * Get order assignment details
 */
export async function fetchOrderAssignmentDetails(orderId: string): Promise<any> {
  return await apiRequest(API_ENDPOINTS.dispatch.orderAssignmentDetails(orderId));
}
