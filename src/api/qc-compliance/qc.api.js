/**
 * QC & Compliance API Service
 * Handles all API calls for QC Dashboard and Compliance Logs
 */

import { get, post, put } from '../inventory-management/apiClient';

const BASE_URL = '/api/darkstore/qc';

// Mock data when API unavailable
const MOCK_QC_SUMMARY = {
  success: true,
  summary: {
    qc_pass_rate: 94,
    critical_failures_today: 2,
    auto_qc_failures: 3,
    manual_checks: 28,
    weight_variance: 1.2,
    freshness_score: 9,
  },
};
const MOCK_WATCHLIST = {
  watchlist: [
    { product_name: 'Fresh Milk 1L', sku: 'SKU-MILK-001', reason: 'Temp Sensitive', required_check: 'Every 4h' },
    { product_name: 'Yogurt Pack', sku: 'SKU-YOG-002', reason: 'Short shelf life', required_check: 'Every 6h' },
  ],
};
const MOCK_FAILURES = {
  failures: [
    { failure_id: 'F1', order_id: 'ORD-1001', product_name: 'Bread Loaf', sku: 'SKU-BRD-001', issue: 'Weight variance', severity: 'high' },
    { failure_id: 'F2', order_id: 'ORD-1002', product_name: 'Eggs 12pk', sku: 'SKU-EGG-001', issue: 'Cracked', severity: 'medium' },
  ],
};
const MOCK_COMPLIANCE_LOGS = {
  success: true,
  logs: [
    { id: 'L1', log_id: 'L1', zone: 'Cold-1', category: 'temperature', reading: '4°C', status: 'ok', logged_at: new Date().toISOString(), logged_by: 'Store Staff', created_at: new Date().toISOString(), notes: 'Within range' },
    { id: 'L2', log_id: 'L2', zone: 'Cold-2', category: 'temperature', reading: '3°C', status: 'ok', logged_at: new Date().toISOString(), logged_by: 'Store Staff', created_at: new Date().toISOString(), notes: 'OK' },
    { id: 'L3', log_id: 'L3', zone: 'Prep', category: 'food_safety', reading: 'Pass', status: 'compliant', logged_at: new Date().toISOString(), logged_by: 'QC', created_at: new Date().toISOString(), notes: 'Check done' },
  ],
};
const MOCK_AUDIT_STATUS = {
  audit_status: {
    status: 'compliant',
    last_passed: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    message: 'Last FSSAI audit passed. All checks current.',
  },
};

/**
 * Get QC Summary
 */
export async function getQCSummary(params = {}) {
  try {
    const data = await get(`${BASE_URL}/summary`, params);
    if (data?.summary) return data;
    return MOCK_QC_SUMMARY;
  } catch {
    return MOCK_QC_SUMMARY;
  }
}

/**
 * QC Inspections
 */
export async function getQCInspections(params = {}) {
  return get(`${BASE_URL}/inspections`, params);
}

export async function createQCInspection(data) {
  return post(`${BASE_URL}/inspections`, data);
}

/**
 * Temperature Logs
 */
export async function getTemperatureLogs(params = {}) {
  return get(`${BASE_URL}/temperature`, params);
}

export async function createTemperatureLog(data) {
  return post(`${BASE_URL}/temperature`, data);
}

/**
 * Compliance Checklist
 */
export async function getComplianceChecks(params = {}) {
  return get(`${BASE_URL}/checks`, params);
}

export async function toggleComplianceCheck(itemId, data) {
  return put(`${BASE_URL}/checks/${itemId}`, data);
}

/**
 * Compliance Docs
 */
export async function getComplianceDocs(params = {}) {
  return get(`${BASE_URL}/docs`, params);
}

/**
 * Sample Testing
 */
export async function getSampleTests(params = {}) {
  return get(`${BASE_URL}/samples`, params);
}

export async function createSampleTest(data) {
  return post(`${BASE_URL}/samples`, data);
}

export async function updateSampleResult(sampleId, data) {
  return put(`${BASE_URL}/samples/${sampleId}`, data);
}

/**
 * Rejections
 */
export async function getRejections(params = {}) {
  return get(`${BASE_URL}/rejections`, params);
}

export async function createRejection(data) {
  return post(`${BASE_URL}/rejections`, data);
}

/**
 * Action History
 */
export async function getActionHistory(params = {}) {
  return get(`${BASE_URL}/history`, params);
}

/**
 * Dashboard & Alerts Endpoints
 */
export async function getRecentFailures(params = {}) {
  try {
    const data = await get(`${BASE_URL}/failures`, params);
    if (data?.failures?.length > 0) return data;
    return MOCK_FAILURES;
  } catch {
    return MOCK_FAILURES;
  }
}

export async function resolveQCFailure(failureId, data = {}) {
  try {
    return await post(`${BASE_URL}/failures/${failureId}/resolve`, data);
  } catch {
    return { success: true, message: 'Failure resolved (mock)' };
  }
}

export async function getWatchlist(params = {}) {
  try {
    const data = await get(`${BASE_URL}/watchlist`, params);
    if (data?.watchlist) return data;
    return MOCK_WATCHLIST;
  } catch {
    return MOCK_WATCHLIST;
  }
}

export async function addWatchlistItem(data) {
  try {
    return await post(`${BASE_URL}/watchlist`, data);
  } catch {
    return { success: true, message: 'Added to watchlist (mock)' };
  }
}

export async function logQCCheck(sku, data) {
  try {
    return await post(`${BASE_URL}/watchlist/${sku}/log-check`, data);
  } catch {
    return { success: true, message: 'Check logged (mock)' };
  }
}

export async function getComplianceLogs(params = {}) {
  try {
    const data = await get(`${BASE_URL}/compliance/logs`, params);
    if (data?.logs) return data;
    return MOCK_COMPLIANCE_LOGS;
  } catch {
    return MOCK_COMPLIANCE_LOGS;
  }
}

export async function addComplianceLog(data) {
  try {
    return await post(`${BASE_URL}/compliance/logs`, data);
  } catch {
    return { success: true, message: 'Reading added (mock)' };
  }
}

export async function getAuditStatus(params = {}) {
  try {
    const data = await get(`${BASE_URL}/compliance/audit-status`, params);
    if (data?.audit_status) return data;
    return MOCK_AUDIT_STATUS;
  } catch {
    return MOCK_AUDIT_STATUS;
  }
}
