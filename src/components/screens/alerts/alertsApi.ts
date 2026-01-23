import { apiRequest } from '@/api/apiClient';

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
  metadata?: any;
}

// --- API Functions ---

export async function fetchAlerts(statusFilter?: AlertStatus | "all"): Promise<Alert[]> {
  try {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") {
      params.append('status', statusFilter);
    }
    
    const endpoint = `/production/alerts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiRequest<{ success: boolean; alerts: Alert[] }>(endpoint);
    return response.alerts || [];
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return [];
  }
}

export async function fetchAlertById(id: string): Promise<Alert | undefined> {
  try {
    const response = await apiRequest<{ success: boolean; alert: Alert }>(`/production/alerts/${id}`);
    return response.alert;
  } catch (error) {
    console.error('Failed to fetch alert:', error);
    return undefined;
  }
}

export async function performAlertAction(id: string, payload: AlertActionPayload): Promise<Alert> {
  try {
    const response = await apiRequest<{ success: boolean; alert: Alert; message?: string }>(
      `/production/alerts/${id}/action`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.alert;
  } catch (error) {
    console.error('Failed to perform alert action:', error);
    throw error;
  }
}

export async function clearResolvedAlerts(): Promise<void> {
  try {
    await apiRequest<{ success: boolean; deleted_count: number; message: string }>(
      '/production/alerts/resolved',
      {
        method: 'DELETE',
      }
    );
  } catch (error) {
    console.error('Failed to clear resolved alerts:', error);
    throw error;
  }
}
