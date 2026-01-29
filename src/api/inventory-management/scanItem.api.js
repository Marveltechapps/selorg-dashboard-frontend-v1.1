<<<<<<< HEAD
/**
 * Scan Item API
 * Handles item scanning API calls
 */

import { post } from './apiClient';

const BASE_PATH = '/api/darkstore/inventory/scan';

/**
 * Scan item by SKU and location
 */
export async function scanItem(scanData) {
  const { sku, location, barcode } = scanData;
  
  const body = {};
  if (sku) body.sku = sku;
  if (location) body.location = location;
  if (barcode) body.barcode = barcode;
  
  return post(BASE_PATH, body);
}

=======
/**
 * Scan Item API
 * Handles item scanning API calls
 */

import { post } from './apiClient';

const BASE_PATH = '/api/darkstore/inventory/scan';

/**
 * Scan item by SKU and location
 */
export async function scanItem(scanData) {
  const { sku, location, barcode } = scanData;
  
  const body = {};
  if (sku) body.sku = sku;
  if (location) body.location = location;
  if (barcode) body.barcode = barcode;
  
  return post(BASE_PATH, body);
}

>>>>>>> 63b3bc210ee91a70915e036eecbe3c11bfc59f48
