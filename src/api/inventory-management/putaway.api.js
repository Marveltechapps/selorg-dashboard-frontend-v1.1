/**
 * Putaway Tasks API
 * Handles putaway task-related API calls. Uses mock data when API fails.
 */

import { get, post } from './apiClient';
import { MOCK_PUTAWAY_TASKS } from './mockData';

const BASE_PATH = '/api/darkstore/inbound/putaway';

/**
 * Get putaway tasks list
 */
export async function fetchPutawayTasks(filters = {}) {
  try {
    const {
      storeId = 'DS-Brooklyn-04',
      status = 'all',
      grnId,
      page = 1,
      limit = 50,
    } = filters;
    const params = { storeId, status, page, limit };
    if (grnId) params.grnId = grnId;
    const data = await get(BASE_PATH, params);
    if (data && (data.tasks?.length > 0 || data.putaway_tasks?.length > 0)) return data;
  } catch (_) {}
  return MOCK_PUTAWAY_TASKS;
}

/**
 * Assign putaway task to staff
 */
export async function assignPutawayTask(taskId, staffData) {
  try {
    const { staff_id, staff_name } = staffData;
    return await post(`${BASE_PATH}/${taskId}/assign`, { staff_id, staff_name });
  } catch (_) {
    return { success: true, message: 'Task assigned (mock)', task_id: taskId };
  }
}

/**
 * Complete putaway task
 */
export async function completePutawayTask(taskId, completionData = {}) {
  try {
    const { actual_location, notes = '' } = completionData;
    return await post(`${BASE_PATH}/${taskId}/complete`, { actual_location: actual_location || null, notes });
  } catch (_) {
    return { success: true, message: 'Task completed (mock)', task_id: taskId };
  }
}
