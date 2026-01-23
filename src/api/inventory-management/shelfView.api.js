/**
 * Shelf View API
 * Handles live shelf view API calls
 */

import { get } from './apiClient';

const BASE_PATH = '/api/darkstore/inventory/shelf-view';

/**
 * Get shelf view data
 */
export async function fetchShelfView(params = {}) {
  const {
    storeId = 'DS-Brooklyn-04',
    zone = 'Zone 1 (Ambient)',
    aisle = 'all',
    shelf_location,
  } = params;
  
  const queryParams = { storeId, zone, aisle };
  if (shelf_location) queryParams.shelf_location = shelf_location;
  
  return get(BASE_PATH, queryParams);
}

