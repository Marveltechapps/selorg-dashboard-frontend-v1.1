/**
 * GRN Operations API
 * Handles GRN-specific API calls
 */

import { get, post, put } from './apiClient';

const BASE_PATH = '/api/darkstore/inbound/grn';

/**
 * Get GRN list with filters
 */
export async function fetchGRNList(filters = {}) {
  const {
    storeId = 'DS-Brooklyn-04',
    status = 'all',
    truckId,
    page = 1,
    limit = 50,
  } = filters;
  
  const params = { storeId, status, page, limit };
  if (truckId) params.truckId = truckId;
  
  return get(BASE_PATH, params);
}

/**
 * Get GRN details by ID
 */
export async function fetchGRNDetails(grnId) {
  return get(`${BASE_PATH}/${grnId}`);
}

/**
 * Start GRN processing
 */
export async function startGRN(grnId, options = {}) {
  const { actual_arrival, notes } = options;
  return post(`${BASE_PATH}/${grnId}/start`, {
    actual_arrival: actual_arrival || new Date().toISOString(),
    notes: notes || '',
  });
}

/**
 * Update GRN item quantity
 */
export async function updateGRNItem(grnId, sku, quantityData) {
  const { received_quantity, damaged_quantity = 0, notes = '' } = quantityData;
  return put(`${BASE_PATH}/${grnId}/items/${sku}`, {
    received_quantity,
    damaged_quantity,
    notes,
  });
}

/**
 * Complete GRN processing
 */
export async function completeGRN(grnId, options = {}) {
  const { notes = '', auto_create_putaway = true } = options;
  return post(`${BASE_PATH}/${grnId}/complete`, {
    notes,
    auto_create_putaway,
  });
}

/**
 * Approve GRN
 */
export async function approveGRN(grnId, options = {}) {
  const { notes = '', qualityChecked = false, documentsComplete = false } = options;
  return post(`${BASE_PATH}/${grnId}/approve`, { notes, qualityChecked, documentsComplete });
}

/**
 * Reject GRN
 */
export async function rejectGRN(grnId, body = {}) {
  const { reason = 'other', description = '', notes = '' } = body;
  return post(`${BASE_PATH}/${grnId}/reject`, { reason, description, notes });
}

/**
 * Email GRN
 */
export async function emailGRN(grnId, recipients = []) {
  return post(`${BASE_PATH}/${grnId}/email`, { recipients });
}

/**
 * Archive GRN
 */
export async function archiveGRN(grnId) {
  return post(`${BASE_PATH}/${grnId}/archive`, {});
}
