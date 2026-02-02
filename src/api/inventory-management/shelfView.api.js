/**
 * Shelf View API
 * Handles live shelf view API calls. Uses mock data when API fails.
 */

import { get } from './apiClient';
import { MOCK_SHELF_VIEW } from './mockData';

const BASE_PATH = '/api/darkstore/inventory/shelf-view';

/**
 * Get shelf view data
 */
export async function fetchShelfView(params = {}) {
  try {
    const {
      storeId = 'DS-Brooklyn-04',
      zone = 'Zone 1 (Ambient)',
      aisle = 'all',
      shelf_location,
    } = params;
    const queryParams = { storeId, zone, aisle };
    if (shelf_location) queryParams.shelf_location = shelf_location;
    const data = await get(BASE_PATH, queryParams);
    if (data && (data.aisles?.length > 0 || data.shelves?.length > 0 || data.shelf_view)) return data;
  } catch (_) {}
  return MOCK_SHELF_VIEW;
}
