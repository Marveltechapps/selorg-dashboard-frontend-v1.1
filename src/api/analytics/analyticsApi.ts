/**
 * Reports & Analytics API
 * Integrated with backend based on api-documentation.yaml
 * Base URL: http://localhost:5001/api/darkstore
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const ANALYTICS_ENDPOINT = `${API_BASE_URL}/api/darkstore/analytics`;

export type Granularity = 'hour' | 'day' | 'week';

export interface RiderPerformancePoint {
  timestamp: string;
  deliveriesCompleted: number;
  averageRating: number;
  attendancePercent: number;
  activeRiders: number;
}

export interface SlaAdherencePoint {
  timestamp: string;
  onTimePercent: number;
  slaBreaches: number;
  avgDelayMinutes: number;
  breachReasonBreakdown?: {
    traffic: number;
    no_show: number;
    address_issue: number;
    other: number;
  };
}

export interface FleetUtilizationPoint {
  timestamp: string;
  activeVehicles: number;
  idleVehicles: number;
  maintenanceVehicles: number;
  evUtilizationPercent: number;
  avgKmPerVehicle: number;
}

export interface RiderPerformanceResponse {
  success: boolean;
  data: RiderPerformancePoint[];
  summary: {
    totalDeliveries: number;
    avgRating: number;
    avgAttendance: number;
    peakActiveRiders: number;
  };
}

export interface SlaAdherenceResponse {
  success: boolean;
  data: SlaAdherencePoint[];
  summary: {
    overallOnTimePercent: number;
    totalBreaches: number;
    avgDelayMinutes: number;
  };
}

export interface FleetUtilizationResponse {
  success: boolean;
  data: FleetUtilizationPoint[];
  summary: {
    avgUtilizationPercent: number;
    totalActiveHours: number;
    totalIdleHours: number;
    avgKmPerVehicle: number;
  };
}

export interface ExportReportRequest {
  metric: 'rider' | 'sla' | 'fleet';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    from: string;
    to: string;
  };
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export interface ExportReportResponse {
  success: boolean;
  reportUrl: string;
  reportId: string;
  expiresAt: string;
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
 * Fetch Rider Performance Metrics
 * GET /api/darkstore/analytics/rider-performance
 */
export async function fetchRiderPerformance(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<RiderPerformancePoint[]> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/rider-performance?${params.toString()}`) as RiderPerformanceResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch rider performance data');
  }
  
  return response.data;
}

/**
 * Fetch Rider Performance with Summary
 * GET /api/darkstore/analytics/rider-performance
 */
export async function fetchRiderPerformanceWithSummary(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<RiderPerformanceResponse> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/rider-performance?${params.toString()}`) as RiderPerformanceResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch rider performance data');
  }
  
  return response;
}

/**
 * Fetch SLA Adherence Metrics
 * GET /api/darkstore/analytics/sla-adherence
 */
export async function fetchSlaAdherence(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<SlaAdherencePoint[]> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/sla-adherence?${params.toString()}`) as SlaAdherenceResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch SLA adherence data');
  }
  
  return response.data;
}

/**
 * Fetch SLA Adherence with Summary
 * GET /api/darkstore/analytics/sla-adherence
 */
export async function fetchSlaAdherenceWithSummary(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<SlaAdherenceResponse> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/sla-adherence?${params.toString()}`) as SlaAdherenceResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch SLA adherence data');
  }
  
  return response;
}

/**
 * Fetch Fleet Utilization Metrics
 * GET /api/darkstore/analytics/fleet-utilization
 */
export async function fetchFleetUtilization(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<FleetUtilizationPoint[]> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/fleet-utilization?${params.toString()}`) as FleetUtilizationResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch fleet utilization data');
  }
  
  return response.data;
}

/**
 * Fetch Fleet Utilization with Summary
 * GET /api/darkstore/analytics/fleet-utilization
 */
export async function fetchFleetUtilizationWithSummary(
  granularity: Granularity = 'day',
  options?: {
    dateRange?: '7d' | '30d' | '90d';
    storeId?: string;
  }
): Promise<FleetUtilizationResponse> {
  const params = new URLSearchParams();
  params.append('granularity', granularity);
  params.append('dateRange', options?.dateRange || '7d');
  params.append('storeId', options?.storeId || 'DS-Brooklyn-04');

  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/fleet-utilization?${params.toString()}`) as FleetUtilizationResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch fleet utilization data');
  }
  
  return response;
}

/**
 * Export Report
 * POST /api/darkstore/analytics/export
 */
export async function exportReport(payload: ExportReportRequest): Promise<ExportReportResponse> {
  const response = await apiRequest(`${ANALYTICS_ENDPOINT}/export`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as ExportReportResponse;
  
  if (!response.success) {
    throw new Error('Failed to export report');
  }
  
  return response;
}

