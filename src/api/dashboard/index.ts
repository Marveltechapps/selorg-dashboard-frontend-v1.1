/**
 * Dashboard API
 * Handles dashboard-related API calls. Uses mock data when API fails or returns empty.
 */

import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_STAFF_LOAD,
  MOCK_STOCK_ALERTS,
  MOCK_RTO_ALERTS,
  MOCK_LIVE_ORDERS,
} from './darkstoreMockData';

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
  try {
    const data = await get(`${BASE_PATH}/summary`, { storeId });
    if (data && (data.queue != null || data.sla_threat != null)) return data;
  } catch (_) {}
  return MOCK_DASHBOARD_SUMMARY;
}

/**
 * Get staff load metrics
 */
export async function getStaffLoad(storeId = 'DS-Brooklyn-04') {
  try {
    const data = await get(`${BASE_PATH}/staff-load`, { storeId });
    if (data && (data.pickers != null || data.packers != null)) return data;
  } catch (_) {}
  return MOCK_STAFF_LOAD;
}

/**
 * Get stock alerts
 */
export async function getStockAlerts(storeId = 'DS-Brooklyn-04', severity = 'all') {
  try {
    const data = await get(`${BASE_PATH}/stock-alerts`, { storeId, severity });
    if (data && Array.isArray(data.alerts)) return data;
  } catch (_) {}
  return MOCK_STOCK_ALERTS;
}

/**
 * Get RTO alerts
 */
export async function getRTOAlerts(storeId = 'DS-Brooklyn-04') {
  try {
    const data = await get(`${BASE_PATH}/rto-alerts`, { storeId });
    if (data && Array.isArray(data.alerts)) return data;
  } catch (_) {}
  return MOCK_RTO_ALERTS;
}

/**
 * Get live orders
 */
export async function getLiveOrders(storeId = 'DS-Brooklyn-04', status = 'all', limit = 50) {
  try {
    const data = await get(`${BASE_PATH}/live-orders`, { storeId, status, limit });
    if (data && Array.isArray(data.orders) && data.orders.length > 0) return data;
  } catch (_) {}
  return { orders: MOCK_LIVE_ORDERS };
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
