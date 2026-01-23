/**
 * Alerts & Exceptions API
 * Integrated with backend based on api-documentation.yaml
 * Base URL: http://localhost:5001/api/darkstore
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const ALERTS_ENDPOINT = `${API_BASE_URL}/api/darkstore/alerts`;

export type AlertType = 
  | "sla_breach" 
  | "delayed_delivery" 
  | "rider_no_show" 
  | "zone_deviation" 
  | "vehicle_breakdown" 
  | "rto_return" 
  | "other";

export type AlertPriority = "critical" | "high" | "medium" | "low";

export type AlertStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

export interface AlertTimelineEntry {
  at: string;
  status: string;
  note?: string;
  actor?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  priority: AlertPriority;
  createdAt: string;
  lastUpdatedAt: string;
  source: {
    orderId?: string;
    riderId?: string;
    riderName?: string;
    vehicleId?: string;
    zone?: string;
    lat?: number;
    lng?: number;
    [key: string]: any;
  };
  status: AlertStatus;
  actionsSuggested: string[];
  timeline: AlertTimelineEntry[];
}

export interface AlertActionPayload {
  actionType: "notify_customer" | "reassign_rider" | "call_rider" | "mark_offline" | "view_location" | "add_note" | "resolve" | "acknowledge";
  metadata?: {
    riderId?: string;
    riderName?: string;
    message?: string;
    note?: string;
    actor?: string;
    [key: string]: any;
  };
}

export interface AlertListResponse {
  success: boolean;
  alerts: Alert[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  summary: {
    critical_count: number;
    open_count: number;
    resolved_count: number;
  };
}

export interface AlertDetailResponse {
  success: boolean;
  alert: Alert;
}

export interface AlertActionResponse {
  success: boolean;
  alert: {
    id: string;
    status: string;
    lastUpdatedAt: string;
    timeline: AlertTimelineEntry[];
  };
  message: string;
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
      console.error(`Network error: Backend may not be running at ${API_BASE_URL}`);
      throw new Error('Unable to connect to backend. Please ensure the server is running on port 5000.');
    }
    throw error;
  }
}

/**
 * Fetch Alerts List
 * GET /api/darkstore/alerts
 */
export async function fetchAlerts(
  statusFilter?: AlertStatus | "all",
  options?: {
    priority?: AlertPriority | "all";
    type?: AlertType | "all";
    search?: string;
    page?: number;
    limit?: number;
    storeId?: string;
  }
): Promise<Alert[]> {
  const params = new URLSearchParams();
  
  params.append('status', statusFilter || 'all');
  if (options?.priority) params.append('priority', options.priority);
  if (options?.type) params.append('type', options.type);
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.storeId) params.append('storeId', options.storeId);
  else params.append('storeId', 'DS-Brooklyn-04'); // Default store ID

  const response = await apiRequest(`${ALERTS_ENDPOINT}?${params.toString()}`) as AlertListResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch alerts');
  }
  
  return response.alerts;
}

/**
 * Fetch Alert by ID
 * GET /api/darkstore/alerts/:alertId
 */
export async function fetchAlertById(id: string): Promise<Alert | undefined> {
  const response = await apiRequest(`${ALERTS_ENDPOINT}/${id}`) as AlertDetailResponse;
  
  if (!response.success || !response.alert) {
    return undefined;
  }
  
  return response.alert;
}

/**
 * Perform Alert Action
 * POST /api/darkstore/alerts/:alertId/action
 */
export async function performAlertAction(
  id: string, 
  payload: AlertActionPayload
): Promise<Alert> {
  const response = await apiRequest(`${ALERTS_ENDPOINT}/${id}/action`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as AlertActionResponse;
  
  if (!response.success) {
    throw new Error('Failed to perform alert action');
  }
  
  // Fetch updated alert to get full details
  const updatedAlert = await fetchAlertById(id);
  if (!updatedAlert) {
    throw new Error('Alert not found after action');
  }
  
  return updatedAlert;
}

/**
 * Clear Resolved Alerts
 * DELETE /api/darkstore/alerts/resolved
 */
export async function clearResolvedAlerts(options?: {
  archive?: boolean;
  storeId?: string;
}): Promise<{ deleted_count: number; message: string }> {
  const params = new URLSearchParams();
  if (options?.archive !== undefined) params.append('archive', options.archive.toString());
  if (options?.storeId) params.append('storeId', options.storeId);
  else params.append('storeId', 'DS-Brooklyn-04');

  const response = await apiRequest(`${ALERTS_ENDPOINT}/resolved?${params.toString()}`, {
    method: 'DELETE',
  });
  
  if (!response.success) {
    throw new Error('Failed to clear resolved alerts');
  }
  
  return {
    deleted_count: response.deleted_count || 0,
    message: response.message || 'Resolved alerts cleared successfully',
  };
}

