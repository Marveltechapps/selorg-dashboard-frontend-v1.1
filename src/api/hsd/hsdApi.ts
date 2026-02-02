/**
 * HSD Device Management API
 * Integrated with backend based on api-documentation.yaml
 * Base URL: http://localhost:5001/api/darkstore
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const HSD_ENDPOINT = `${API_BASE_URL}/api/darkstore/hsd`;

export interface HSDDevice {
  deviceId: string;
  assignedTo?: {
    userId: string;
    userName: string;
    userType: 'Picker' | 'Packer' | 'Rider' | 'Spare';
  } | null;
  status: 'online' | 'offline' | 'charging' | 'error';
  battery: number;
  signal: 'strong' | 'good' | 'weak' | 'no_signal';
  lastSync: string;
  deviceType?: string;
  firmwareVersion?: string;
}

export interface FleetOverviewResponse {
  success: boolean;
  summary: {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    chargingDevices: number;
    errorDevices: number;
    lowBatteryCount: number;
    avgSyncLatency: number;
  };
  devices: HSDDevice[];
}

export interface LiveSession {
  deviceId: string;
  userId: string;
  userName: string;
  taskType: 'picking' | 'packing' | 'qc' | 'cycle_count';
  taskId: string;
  currentStatus: string;
  zone?: string;
  startedAt: string;
  lastActivity: string;
  itemsCompleted?: number;
  itemsTotal?: number;
}

export interface LiveSessionsResponse {
  success: boolean;
  sessions: LiveSession[];
}

export interface DeviceAction {
  timestamp: string;
  actionType: 'scan_sku' | 'qc_check' | 'shelf_verification' | 'system' | 'error';
  details: string;
  result: 'success' | 'warning' | 'error' | 'blocked';
}

export interface DeviceActionsResponse {
  success: boolean;
  actions: DeviceAction[];
}

export interface DeviceIssue {
  ticketId: string;
  deviceId: string;
  issueType: 'hardware' | 'software' | 'connectivity';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  reportedAt: string;
  reportedBy?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface IssueTrackerResponse {
  success: boolean;
  issues: DeviceIssue[];
}

export interface HSDLog {
  timestamp: string;
  deviceId: string;
  userId?: string;
  userName?: string;
  eventType: 'scan_sku' | 'qc_check' | 'shelf_verification' | 'system' | 'error';
  details: string;
  result: 'success' | 'warning' | 'error' | 'blocked' | 'alert';
}

export interface HSDLogsResponse {
  success: boolean;
  logs: HSDLog[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
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

// Mock data when API unavailable
const MOCK_DEVICES: HSDDevice[] = [
  { deviceId: 'HSD-001', status: 'online', battery: 85, signal: 'strong', lastSync: new Date().toISOString(), assignedTo: { userId: 'U1', userName: 'Raj K', userType: 'Picker' }, deviceType: 'Scanner', firmwareVersion: '1.2.0' },
  { deviceId: 'HSD-002', status: 'online', battery: 72, signal: 'good', lastSync: new Date().toISOString(), assignedTo: { userId: 'U2', userName: 'Priya M', userType: 'Packer' }, deviceType: 'Scanner', firmwareVersion: '1.2.0' },
  { deviceId: 'HSD-003', status: 'charging', battery: 100, signal: 'strong', lastSync: new Date().toISOString(), assignedTo: null, deviceType: 'Tablet', firmwareVersion: '1.1.0' },
];
const MOCK_FLEET: FleetOverviewResponse = {
  success: true,
  summary: { totalDevices: 12, onlineDevices: 8, offlineDevices: 2, chargingDevices: 2, errorDevices: 0, lowBatteryCount: 1, avgSyncLatency: 120 },
  devices: MOCK_DEVICES,
};
const MOCK_LIVE_SESSIONS: LiveSession[] = [
  { deviceId: 'HSD-001', userId: 'U1', userName: 'Raj K', taskType: 'picking', taskId: 'PL-101', currentStatus: 'Scanning', zone: 'A-1', startedAt: new Date().toISOString(), lastActivity: new Date().toISOString(), itemsCompleted: 12, itemsTotal: 24 },
  { deviceId: 'HSD-002', userId: 'U2', userName: 'Priya M', taskType: 'packing', taskId: 'ORD-2001', currentStatus: 'Packing', startedAt: new Date().toISOString(), lastActivity: new Date().toISOString(), itemsCompleted: 2, itemsTotal: 5 },
];
const MOCK_ISSUES: DeviceIssue[] = [
  { ticketId: 'TKT-001', deviceId: 'HSD-005', issueType: 'hardware', description: 'Screen flickering', status: 'open', reportedAt: new Date().toISOString(), reportedBy: 'Store Staff', priority: 'medium' },
  { ticketId: 'TKT-002', deviceId: 'HSD-007', issueType: 'connectivity', description: 'WiFi drops frequently', status: 'in_progress', reportedAt: new Date().toISOString(), priority: 'high' },
];
const MOCK_HSD_LOGS: HSDLog[] = [
  { timestamp: new Date().toISOString(), deviceId: 'HSD-001', userId: 'U1', userName: 'Raj K', eventType: 'scan_sku', details: 'SKU SKU-MILK-001 scanned', result: 'success' },
  { timestamp: new Date(Date.now() - 60000).toISOString(), deviceId: 'HSD-002', userId: 'U2', userName: 'Priya M', eventType: 'qc_check', details: 'QC pass for order ORD-2001', result: 'success' },
  { timestamp: new Date(Date.now() - 120000).toISOString(), deviceId: 'HSD-001', eventType: 'system', details: 'App restarted', result: 'success' },
  { timestamp: new Date(Date.now() - 180000).toISOString(), deviceId: 'HSD-003', userId: 'U3', userName: 'Amit S', eventType: 'shelf_verification', details: 'Shelf A-01-02 verified', result: 'success' },
  { timestamp: new Date(Date.now() - 240000).toISOString(), deviceId: 'HSD-002', eventType: 'scan_sku', details: 'SKU SKU-BRD-002 scanned', result: 'success' },
  { timestamp: new Date(Date.now() - 300000).toISOString(), deviceId: 'HSD-001', eventType: 'error', details: 'Connection timeout – retried', result: 'warning' },
];

/**
 * Get Fleet Overview
 * GET /api/darkstore/hsd/fleet
 */
export async function getFleetOverview(options?: {
  storeId?: string;
  status?: 'all' | 'online' | 'offline' | 'charging' | 'error';
}): Promise<FleetOverviewResponse> {
  try {
    const params = new URLSearchParams();
    params.append('storeId', options?.storeId || 'DS-Brooklyn-04');
    if (options?.status) params.append('status', options.status);
    const response = await apiRequest(`${HSD_ENDPOINT}/fleet?${params.toString()}`) as FleetOverviewResponse;
    if (response?.success && response?.devices?.length) return response;
    return MOCK_FLEET;
  } catch {
    return MOCK_FLEET;
  }
}

/**
 * Register Device
 * POST /api/darkstore/hsd/devices/register
 */
export async function registerDevice(payload: {
  deviceId: string;
  deviceType: string;
  serialNumber: string;
  storeId?: string;
  firmwareVersion?: string;
}): Promise<{ success: boolean; device: any; message: string }> {
  const response = await apiRequest(`${HSD_ENDPOINT}/devices/register`, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      storeId: payload.storeId || 'DS-Brooklyn-04',
    }),
  });
  
  if (!response.success) {
    throw new Error('Failed to register device');
  }
  
  return response;
}

/**
 * Assign Device
 * POST /api/darkstore/hsd/devices/:deviceId/assign
 */
export async function assignDevice(
  deviceId: string,
  payload: {
    userId: string;
    userName: string;
    userType: 'Picker' | 'Packer' | 'Rider';
  }
): Promise<{ success: boolean; device: any; message: string }> {
  const response = await apiRequest(`${HSD_ENDPOINT}/devices/${deviceId}/assign`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  if (!response.success) {
    throw new Error('Failed to assign device');
  }
  
  return response;
}

/**
 * Unassign Device
 * POST /api/darkstore/hsd/devices/:deviceId/unassign
 */
export async function unassignDevice(
  deviceId: string
): Promise<{ success: boolean; device: any; message: string }> {
  const response = await apiRequest(`${HSD_ENDPOINT}/devices/${deviceId}/unassign`, {
    method: 'POST',
  });
  
  if (!response.success) {
    throw new Error('Failed to unassign device');
  }
  
  return response;
}

/**
 * Bulk Reset Devices
 * POST /api/darkstore/hsd/devices/bulk-reset
 */
export async function bulkResetDevices(payload: {
  deviceIds: string[];
  storeId?: string;
  reason?: string;
}): Promise<{ success: boolean; results: any[]; errors?: any[]; message: string }> {
  const response = await apiRequest(`${HSD_ENDPOINT}/devices/bulk-reset`, {
    method: 'POST',
    body: JSON.stringify({
      deviceIds: payload.deviceIds,
      storeId: payload.storeId || 'DS-Brooklyn-04',
      reason: payload.reason || 'Bulk reset',
    }),
  });
  
  if (!response.success) {
    throw new Error('Failed to reset devices');
  }
  
  return response;
}

/**
 * Get Device History
 * GET /api/darkstore/hsd/devices/:deviceId/history
 */
export interface DeviceHistoryEntry {
  id: string;
  action: 'ASSIGN' | 'UNASSIGN' | 'RESET' | 'LOCK' | 'REBOOT' | 'CLEAR_CACHE';
  performed_by: string;
  performed_at: string;
  metadata: any;
  previous_state: any;
  new_state: any;
}

export async function getDeviceHistory(
  deviceId: string,
  options?: { limit?: number }
): Promise<{ success: boolean; history: DeviceHistoryEntry[] }> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await apiRequest(`${HSD_ENDPOINT}/devices/${deviceId}/history?${params.toString()}`);
  
  if (!response.success) {
    throw new Error('Failed to fetch device history');
  }
  
  return response;
}

/**
 * Get Live Sessions
 * GET /api/darkstore/hsd/sessions/live
 */
export async function getLiveSessions(options?: {
  deviceId?: string;
  storeId?: string;
}): Promise<LiveSession[]> {
  try {
    const params = new URLSearchParams();
    if (options?.deviceId) params.append('deviceId', options.deviceId);
    params.append('storeId', options?.storeId || 'DS-Brooklyn-04');
    const response = await apiRequest(`${HSD_ENDPOINT}/sessions/live?${params.toString()}`) as LiveSessionsResponse;
    if (response?.success && response?.sessions?.length > 0) return response.sessions;
    return MOCK_LIVE_SESSIONS;
  } catch {
    return MOCK_LIVE_SESSIONS;
  }
}

/**
 * Get Device Actions
 * GET /api/darkstore/hsd/devices/:deviceId/actions
 */
export async function getDeviceActions(
  deviceId: string,
  options?: { limit?: number }
): Promise<DeviceAction[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());

  const response = await apiRequest(`${HSD_ENDPOINT}/devices/${deviceId}/actions?${params.toString()}`) as DeviceActionsResponse;
  
  if (!response.success) {
    throw new Error('Failed to fetch device actions');
  }
  
  return response.actions;
}

/**
 * Device Control
 * POST /api/darkstore/hsd/devices/:deviceId/control
 */
export async function deviceControl(
  deviceId: string,
  payload: {
    action: 'lock' | 'reboot' | 'reset' | 'clear_cache' | 'restart_app';
    reason?: string;
    storeId?: string;
  }
): Promise<{ success: boolean; action: string; status: string; message: string }> {
  const params = new URLSearchParams();
  if (payload.storeId) params.append('storeId', payload.storeId);

  const response = await apiRequest(`${HSD_ENDPOINT}/devices/${deviceId}/control?${params.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      action: payload.action,
      reason: payload.reason,
    }),
  });
  
  if (!response.success) {
    throw new Error('Failed to perform device control action');
  }
  
  return response;
}

/**
 * Get Issues
 * GET /api/darkstore/hsd/issues
 */
export async function getIssues(options?: {
  status?: 'all' | 'open' | 'in_progress' | 'resolved';
  deviceId?: string;
  storeId?: string;
}): Promise<DeviceIssue[]> {
  try {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.deviceId) params.append('deviceId', options.deviceId);
    params.append('storeId', options?.storeId || 'DS-Brooklyn-04');
    const response = await apiRequest(`${HSD_ENDPOINT}/issues?${params.toString()}`) as IssueTrackerResponse;
    if (response?.success && response?.issues) return response.issues;
    return MOCK_ISSUES;
  } catch {
    return MOCK_ISSUES;
  }
}

/**
 * Report Issue
 * POST /api/darkstore/hsd/issues/report
 */
export async function reportIssue(payload: {
  deviceId: string;
  issueType: 'hardware' | 'software' | 'connectivity';
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reportedBy?: string;
}): Promise<{ success: boolean; ticketId: string; message: string }> {
  const response = await apiRequest(`${HSD_ENDPOINT}/issues/report`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  if (!response.success) {
    throw new Error('Failed to report issue');
  }
  
  return response;
}

/**
 * Get HSD Logs
 * GET /api/darkstore/hsd/logs
 */
export async function getHSDLogs(options?: {
  deviceId?: string;
  eventType?: 'scan_sku' | 'qc_check' | 'shelf_verification' | 'system' | 'error' | 'all';
  search?: string;
  page?: number;
  limit?: number;
  storeId?: string;
}): Promise<{ logs: HSDLog[]; pagination: any }> {
  try {
    const params = new URLSearchParams();
    if (options?.deviceId) params.append('deviceId', options.deviceId);
    if (options?.eventType) params.append('eventType', options.eventType);
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', (options?.page || 1).toString());
    params.append('storeId', options?.storeId || 'DS-Brooklyn-04');
    params.append('limit', (options?.limit || 50).toString());
    const response = await apiRequest(`${HSD_ENDPOINT}/logs?${params.toString()}`) as HSDLogsResponse;
    if (response?.success && response?.logs) {
      return { logs: response.logs, pagination: response.pagination || { current_page: 1, total_pages: 1, total_items: response.logs.length, items_per_page: 50 } };
    }
    return { logs: MOCK_HSD_LOGS, pagination: { current_page: 1, total_pages: 1, total_items: MOCK_HSD_LOGS.length, items_per_page: 50 } };
  } catch {
    return { logs: MOCK_HSD_LOGS, pagination: { current_page: 1, total_pages: 1, total_items: MOCK_HSD_LOGS.length, items_per_page: 50 } };
  }
}

/**
 * Session Action
 * POST /api/darkstore/hsd/sessions/:deviceId/action
 */
export async function sessionAction(
  deviceId: string,
  payload: {
    action: 'confirm_quantity' | 'report_issue';
    payload?: any;
  }
): Promise<{ success: boolean; session: any; message: string }> {
  try {
    const response = await apiRequest(`${HSD_ENDPOINT}/sessions/${deviceId}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response?.success) return response;
  } catch (_) {}
  return { success: true, session: { deviceId }, message: payload.action === 'confirm_quantity' ? 'Quantity confirmed (mock)' : 'Issue reported (mock)' };
}

/**
 * Create Requisition
 * POST /api/darkstore/hsd/requisitions
 */
export async function createRequisition(payload: {
  deviceIds: string[];
  reason: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  storeId?: string;
}): Promise<{ success: boolean; requestId: string; message: string }> {
  const params = new URLSearchParams();
  if (payload.storeId) params.append('storeId', payload.storeId);

  const response = await apiRequest(`${HSD_ENDPOINT}/requisitions?${params.toString()}`, {
    method: 'POST',
    body: JSON.stringify({
      deviceIds: payload.deviceIds,
      reason: payload.reason,
      priority: payload.priority,
    }),
  });
  
  if (!response.success) {
    throw new Error('Failed to create requisition order');
  }
  
  return response;
}
