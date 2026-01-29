import { API_CONFIG, API_ENDPOINTS } from '../../../../config/api';
import { Rider, Order, DashboardSummary, OrderStatus } from './types';

/**
 * API Response Types (from backend)
 */
interface ApiRider {
  id: string;
  name: string;
  avatarInitials: string;
  status: 'online' | 'offline' | 'busy' | 'idle';
  currentOrderId?: string | null;
  location?: { lat: number; lng: number } | null;
  capacity: { currentLoad: number; maxLoad: number };
  avgEtaMins: number;
  rating: number;
  zone?: string | null;
}

interface ApiOrder {
  id: string;
  status: OrderStatus;
  riderId?: string | null;
  etaMinutes?: number | null;
  slaDeadline: string;
  pickupLocation: string;
  dropLocation: string;
  customerName: string;
  items: string[];
  timeline?: { status: OrderStatus; time: string; note?: string }[];
}

interface ApiDashboardSummary {
  activeRiders: number;
  maxRiders: number;
  busyRiders?: number;
  idleRiders?: number;
  activeRiderUtilizationPercent: number;
  fleetUtilizationPercent?: number; // Overall fleet utilization (active/total)
  ordersInTransit: number;
  ordersInTransitChangePercent: number;
  avgDeliveryTimeSeconds: number;
  avgDeliveryTimeWithinSla: boolean;
  slaBreaches: number;
}

interface ApiListResponse<T> {
  riders?: T[];
  orders?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  logger.apiRequest('RiderAPI', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    logger.apiResponse('RiderAPI', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[RiderAPI] Error response (${response.status}):`, errorText);
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || 'Request failed' };
      }
      const errorMessage = error.message || error.error || `HTTP error! status: ${response.status}`;
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      (apiError as any).details = error.details || error;
      throw apiError;
    }

    const data = await response.json();
    logger.apiSuccess('RiderAPI', data);
    return data;
  } catch (error) {
    logger.apiError('RiderAPI', url, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend API. Please ensure the backend server is running.`);
    }
    throw error;
  }
}

/**
 * Transform backend rider to frontend rider
 */
function transformRider(apiRider: ApiRider): Rider {
  return {
    id: apiRider.id,
    name: apiRider.name,
    avatarInitials: apiRider.avatarInitials,
    status: apiRider.status,
    currentOrderId: apiRider.currentOrderId || undefined,
    location: apiRider.location || undefined,
    capacity: apiRider.capacity,
    avgEtaMins: apiRider.avgEtaMins,
    rating: apiRider.rating,
  };
}

/**
 * Transform backend order to frontend order
 */
function transformOrder(apiOrder: ApiOrder): Order {
  // Transform timeline dates to ISO strings if needed
  const timeline = (apiOrder.timeline || []).map(event => ({
    status: event.status,
    time: typeof event.time === 'string' ? event.time : new Date(event.time).toISOString(),
    note: event.note,
  }));

  return {
    id: apiOrder.id,
    status: apiOrder.status,
    riderId: apiOrder.riderId || undefined,
    etaMinutes: apiOrder.etaMinutes || undefined,
    slaDeadline: typeof apiOrder.slaDeadline === 'string' 
      ? apiOrder.slaDeadline 
      : new Date(apiOrder.slaDeadline).toISOString(),
    pickupLocation: apiOrder.pickupLocation,
    dropLocation: apiOrder.dropLocation,
    customerName: apiOrder.customerName,
    items: apiOrder.items || [],
    timeline,
  };
}

/**
 * Real API implementation
 */
export const api = {
  /**
   * Get dashboard summary
   */
  getSummary: async (): Promise<DashboardSummary> => {
    const data = await apiRequest<ApiDashboardSummary>(
      API_ENDPOINTS.dashboard.summary
    );
    
    return {
      activeRiders: data.activeRiders,
      maxRiders: data.maxRiders,
      busyRiders: data.busyRiders,
      idleRiders: data.idleRiders,
      activeRiderUtilizationPercent: data.activeRiderUtilizationPercent,
      fleetUtilizationPercent: data.fleetUtilizationPercent,
      ordersInTransit: data.ordersInTransit,
      ordersInTransitChangePercent: data.ordersInTransitChangePercent,
      avgDeliveryTimeSeconds: data.avgDeliveryTimeSeconds,
      avgDeliveryTimeWithinSla: data.avgDeliveryTimeWithinSla,
      slaBreaches: data.slaBreaches,
    };
  },

  /**
   * Get orders with optional filters
   */
  getOrders: async (filters?: { status?: string; search?: string }): Promise<Order[]> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'All') {
        params.append('status', filters.status.toLowerCase());
      }
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      // Increase limit to get more orders
      params.append('limit', '100');
      
      const queryString = params.toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.orders.list}?${queryString}`
        : API_ENDPOINTS.orders.list;
      
      const data = await apiRequest<any>(endpoint);
      
      // Handle standardized backend response format { success: true, data: [...], meta: { ... } }
      // Or fallback to direct list response { orders: [...], total: ... }
      let ordersArray: ApiOrder[] = [];
      
      if (data && data.success && Array.isArray(data.data)) {
        ordersArray = data.data;
      } else if (data && Array.isArray(data.orders)) {
        ordersArray = data.orders;
      } else {
        logger.warn('[RiderAPI] Invalid orders response format:', data);
        return [];
      }
      
      return ordersArray.map(transformOrder).sort((a, b) => 
        (a.etaMinutes || 999) - (b.etaMinutes || 999)
      );
    } catch (error) {
      console.error('[API] Error fetching orders:', error);
      // Return empty array on error to allow UI to continue functioning
      // The error is logged, and the UI will show empty state
      return [];
    }
  },

  /**
   * Get all riders
   */
  getRiders: async (): Promise<Rider[]> => {
    const data = await apiRequest<ApiListResponse<ApiRider>>(
      API_ENDPOINTS.riders.list
    );
    
    const riders = data.riders || [];
    return riders.map(transformRider);
  },

  /**
   * Create a new rider
   */
  createRider: async (riderData: {
    name: string;
    zone?: string;
    location?: { lat: number; lng: number };
    capacity?: { maxLoad: number };
    status?: 'online' | 'offline' | 'busy' | 'idle';
  }): Promise<Rider> => {
    const data = await apiRequest<ApiRider>(
      API_ENDPOINTS.riders.create,
      {
        method: 'POST',
        body: JSON.stringify(riderData),
      }
    );
    
    return transformRider(data);
  },

  /**
   * Assign order to rider
   */
  assignOrder: async (orderId: string, riderId: string): Promise<Order> => {
    const data = await apiRequest<ApiOrder>(
      API_ENDPOINTS.orders.assign(orderId),
      {
        method: 'POST',
        body: JSON.stringify({ riderId }),
      }
    );
    
    // Return the updated order
    return transformOrder(data);
  },

  /**
   * Alert order
   */
  alertOrder: async (orderId: string, reason: string): Promise<void> => {
    await apiRequest(
      API_ENDPOINTS.orders.alert(orderId),
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  /**
   * Auto assign orders (not implemented in backend yet)
   * For now, this is a placeholder that returns 0
   */
  autoAssign: async (): Promise<number> => {
    // Auto-assign endpoint - returns number of assignments made
    // If backend doesn't support this yet, it will return 0
    try {
      const response = await apiRequest<{ count: number }>('/rider/dispatch/auto-assign', {
        method: 'POST',
      });
      return response.count || 0;
    } catch (error: any) {
      // If endpoint doesn't exist, return 0 (no assignments made)
      if (error?.status === 404) {
        return 0;
      }
      throw error;
    }
  },
};

