/**
 * Dashboard API
 * Handles dashboard-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

async function get(endpoint: string, params?: Record<string, any>) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

async function post(endpoint: string, data?: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

const BASE_PATH = '/api/v1/darkstore/dashboard';

/**
 * Get dashboard summary metrics
 */
export async function getDashboardSummary(storeId = 'DS-Brooklyn-04') {
  return get(`${BASE_PATH}/summary`, { storeId });
}

/**
 * Get staff load metrics
 */
export async function getStaffLoad(storeId = 'DS-Brooklyn-04') {
  return get(`${BASE_PATH}/staff-load`, { storeId });
}

/**
 * Get stock alerts
 */
export async function getStockAlerts(storeId = 'DS-Brooklyn-04', severity = 'all') {
  return get(`${BASE_PATH}/stock-alerts`, { storeId, severity });
}

/**
 * Get RTO alerts
 */
export async function getRTOAlerts(storeId = 'DS-Brooklyn-04') {
  return get(`${BASE_PATH}/rto-alerts`, { storeId });
}

/**
 * Get live orders
 */
export async function getLiveOrders(storeId = 'DS-Brooklyn-04', status = 'all', limit = 50) {
  return get(`${BASE_PATH}/live-orders`, { storeId, status, limit });
}

/**
 * Refresh dashboard
 */
export async function refreshDashboard(storeId = 'DS-Brooklyn-04') {
  return post(`${BASE_PATH}/refresh`, { storeId });
}

/**
 * Restock inventory item
 */
export async function restockItem(sku: string, storeId = 'DS-Brooklyn-04', quantity = 50, priority = 'high') {
  return post('/api/v1/darkstore/inventory/restock', {
    sku,
    store_id: storeId,
    quantity,
    priority,
  });
}

/**
 * Get alert history
 */
export async function getAlertHistory(entityType: string, entityId: string, alertType: string | null = null) {
  const params: Record<string, string> = { entityType, entityId };
  if (alertType) params.alertType = alertType;
  return get(`${BASE_PATH}/alert-history`, params);
}
