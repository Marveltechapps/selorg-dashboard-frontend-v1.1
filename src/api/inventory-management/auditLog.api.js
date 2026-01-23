/**
 * Audit Log API
 * Handles audit log retrieval
 */

import { get } from './apiClient';

const BASE_PATH = '/api/darkstore/inventory/audit-log';

/**
 * Get audit logs with filtering
 */
export async function fetchAuditLogs(params = {}) {
  return get(BASE_PATH, params);
}

/**
 * Get audit logs for a specific SKU
 */
export async function fetchItemHistory(sku, storeId = 'DS-Brooklyn-04') {
  return get(BASE_PATH, { sku, storeId });
}

