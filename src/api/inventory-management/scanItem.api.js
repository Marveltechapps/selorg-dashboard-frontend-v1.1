/**
 * Scan Item API
 * Handles item scanning API calls. Uses mock data when API fails.
 */

import { post } from './apiClient';
import { MOCK_SCAN_ITEM } from './mockData';

const BASE_PATH = '/api/darkstore/inventory/scan';

/**
 * Scan item by SKU and location
 */
export async function scanItem(scanData) {
  const { sku, location, barcode } = scanData;
  try {
    const body = {};
    if (sku) body.sku = sku;
    if (location) body.location = location;
    if (barcode) body.barcode = barcode;
    const result = await post(BASE_PATH, body);
    if (result && (result.item || result.product_name)) return result;
  } catch (_) {}
  return MOCK_SCAN_ITEM(sku);
}
