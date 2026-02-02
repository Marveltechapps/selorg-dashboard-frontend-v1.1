/**
 * Inbound Operations API
 * Handles all inbound-related API calls. Uses mock data when API fails.
 */

import { get, post, put } from './apiClient';
import { MOCK_INBOUND_SUMMARY, MOCK_GRN_LIST, MOCK_INTER_STORE_TRANSFERS } from './mockData';

const BASE_PATH = '/api/darkstore/inbound';

/**
 * Get inbound summary
 */
export async function getInboundSummary(storeId = 'DS-Brooklyn-04', date) {
  try {
    const params = { storeId };
    if (date) params.date = date;
    const data = await get(`${BASE_PATH}/summary`, params);
    if (data && data.summary) return data;
  } catch (_) {}
  return MOCK_INBOUND_SUMMARY;
}

/**
 * Get GRN list
 */
export async function getGRNList(params = {}) {
  try {
    const {
      storeId = 'DS-Brooklyn-04',
      status = 'all',
      truckId,
      search,
      page = 1,
      limit = 50,
    } = params;
    const queryParams = { storeId, status, page, limit };
    if (truckId) queryParams.truckId = truckId;
    if (search) queryParams.search = search;
    const data = await get(`${BASE_PATH}/grn`, queryParams);
    const list = data?.grn_list ?? data?.grns ?? data?.grn_orders;
    if (data && list && Array.isArray(list) && list.length > 0) return data;
  } catch (_) {}
  return MOCK_GRN_LIST;
}

const getMockGRNDetails = (grnId) => ({
  success: true,
  grn: {
    grn_id: grnId,
    truck_id: 'TRK-101',
    supplier: 'Fresh Farms Co.',
    status: 'pending',
    items: [
      { sku: 'SKU-101', product_name: 'Organic Milk 1L', expected_quantity: 50, received_quantity: 0, damaged_quantity: 0, status: 'pending' },
      { sku: 'SKU-102', product_name: 'Whole Wheat Bread', expected_quantity: 30, received_quantity: 0, damaged_quantity: 0, status: 'pending' },
      { sku: 'SKU-103', product_name: 'Greek Yogurt 500g', expected_quantity: 24, received_quantity: 0, damaged_quantity: 0, status: 'pending' },
    ],
    expected_arrival: new Date().toISOString(),
    actual_arrival: null,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
});

/**
 * Get GRN details. Always returns usable data (mock when API fails or has no grn).
 */
export async function getGRNDetails(grnId) {
  try {
    const data = await get(`${BASE_PATH}/grn/${grnId}`);
    if (data && data.grn && Array.isArray(data.grn.items)) return data;
    if (data && data.grn) return { ...data, grn: { ...data.grn, items: data.grn.items || [] } };
  } catch (_) {}
  return getMockGRNDetails(grnId);
}

/**
 * Start GRN processing
 */
export async function startGRNProcessing(grnId, data = {}) {
  return post(`${BASE_PATH}/grn/${grnId}/start`, data);
}

/**
 * Update GRN item quantity
 */
export async function updateGRNItemQuantity(grnId, sku, data) {
  return put(`${BASE_PATH}/grn/${grnId}/items/${sku}`, data);
}

/**
 * Complete GRN processing
 */
export async function completeGRNProcessing(grnId, data = {}) {
  return post(`${BASE_PATH}/grn/${grnId}/complete`, data);
}

// Putaway task functions moved to putaway.api.js to avoid duplicate exports

/**
 * Get inter-store transfers
 */
export async function getInterStoreTransfers(params = {}) {
  try {
    const {
      storeId = 'DS-Brooklyn-04',
      status = 'all',
      page = 1,
      limit = 50,
    } = params;
    const data = await get(`${BASE_PATH}/transfers`, { storeId, status, page, limit });
    if (data && (data.transfers?.length > 0 || Array.isArray(data))) return data;
  } catch (_) {}
  return MOCK_INTER_STORE_TRANSFERS;
}

/**
 * Receive inter-store transfer
 */
export async function receiveInterStoreTransfer(transferId, data = {}) {
  try {
    const result = await post(`${BASE_PATH}/transfers/${transferId}/receive`, data);
    if (result && result.success !== false) return result;
  } catch (_) {}
  return { success: true, message: 'Transfer received (mock)', transfer_id: transferId, status: 'received', putaway_tasks_created: 0 };
}

/**
 * Sync inter-store transfers with central ERP
 */
export async function syncInterStoreTransfers(storeId = 'DS-Brooklyn-04') {
  return post(`${BASE_PATH}/transfers/sync?storeId=${storeId}`);
}
