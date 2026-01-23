/**
 * QC & Compliance API Service
 * Handles all API calls for QC Dashboard and Compliance Logs
 */

import { get, post, put } from '../inventory-management/apiClient';

const BASE_URL = '/api/darkstore/qc';

/**
 * Get QC Summary
 */
export async function getQCSummary(params = {}) {
  return get(`${BASE_URL}/summary`, params);
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
  return get(`${BASE_URL}/failures`, params);
}

export async function resolveQCFailure(failureId, data = {}) {
  return post(`${BASE_URL}/failures/${failureId}/resolve`, data);
}

export async function getWatchlist(params = {}) {
  return get(`${BASE_URL}/watchlist`, params);
}

export async function addWatchlistItem(data) {
  return post(`${BASE_URL}/watchlist`, data);
}

export async function logQCCheck(sku, data) {
  return post(`${BASE_URL}/watchlist/${sku}/log-check`, data);
}

export async function getComplianceLogs(params = {}) {
  return get(`${BASE_URL}/compliance/logs`, params);
}

export async function addComplianceLog(data) {
  return post(`${BASE_URL}/compliance/logs`, data);
}

export async function getAuditStatus(params = {}) {
  return get(`${BASE_URL}/compliance/audit-status`, params);
}
