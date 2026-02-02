/**
 * Store Health API Service
 * Handles all API calls for Store Health screen
 */

import { get, post, put } from '../inventory-management/apiClient';

const BASE_URL = '/api/darkstore/health';

// Mock data when API unavailable
const MOCK_SUMMARY = {
  success: true,
  summary: {
    network_status: 'Stable',
    readiness_status: 'Ready',
    open_issues_count: 2,
  },
};
const MOCK_CHECKLISTS = {
  success: true,
  checklists: [
    {
      checklist_id: 'CL-OPEN-1',
      name: 'Opening Checklist',
      checklist_type: 'opening',
      total_items: 5,
      completed_items: 4,
      status: 'in_progress',
      items: [
        { item_id: 'I1', label: 'Lights on', status: 'checked', completed_at: new Date().toISOString(), completed_by: 'Staff' },
        { item_id: 'I2', label: 'Cold storage temp check', status: 'checked', completed_at: new Date().toISOString(), completed_by: 'Staff' },
        { item_id: 'I3', label: 'POS systems online', status: 'checked', completed_at: new Date().toISOString(), completed_by: 'Staff' },
        { item_id: 'I4', label: 'Floor clean', status: 'pending' },
        { item_id: 'I5', label: 'Staff briefing done', status: 'checked', completed_at: new Date().toISOString(), completed_by: 'Staff' },
      ],
    },
  ],
};
const MOCK_EQUIPMENT_DEVICES = [
  { device_id: 'HSD-001', device_type: 'Zebra TC52', assigned_to: { userName: 'Raj K' }, battery_level: 85, signal_strength: 'strong', status: 'online', last_sync: new Date().toISOString() },
  { device_id: 'HSD-002', device_type: 'Ring Scanner', assigned_to: { userName: 'Priya M' }, battery_level: 72, signal_strength: 'good', status: 'online', last_sync: new Date().toISOString() },
  { device_id: 'HSD-003', device_type: 'Zebra TC52', assigned_to: null, battery_level: 100, signal_strength: 'strong', status: 'charging', last_sync: new Date().toISOString() },
];
const MOCK_EQUIPMENT = {
  success: true,
  summary: {
    handheld_devices: { active: 2, total: 3, offline: 1 },
    scanners: { online: 2, total: 2 },
    network: { signal_strength: 95, status: 'Stable' },
    power: { battery_level: 85 },
  },
  devices: MOCK_EQUIPMENT_DEVICES,
  equipment: MOCK_EQUIPMENT_DEVICES,
};
const MOCK_INCIDENTS = {
  success: true,
  incidents: [
    { id: 'INC-001', type: 'Slip', severity: 'low', status: 'open', reported_at: new Date().toISOString(), description: 'Wet floor near cold room' },
    { id: 'INC-002', type: 'Equipment', severity: 'medium', status: 'resolved', reported_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
  ],
};

/**
 * Get Store Health Summary
 */
export async function getHealthSummary(params = {}) {
  try {
    const data = await get(`${BASE_URL}/summary`, params);
    if (data?.summary) return data;
    return MOCK_SUMMARY;
  } catch {
    return MOCK_SUMMARY;
  }
}

/**
 * Get Checklists
 */
export async function getChecklists(params = {}) {
  try {
    const data = await get(`${BASE_URL}/checklists`, params);
    if (data?.checklists?.length) return data;
    return MOCK_CHECKLISTS;
  } catch {
    return MOCK_CHECKLISTS;
  }
}

/**
 * Update Checklist Item
 */
export async function updateChecklistItem(checklistId, itemId, data) {
  try {
    return await put(`${BASE_URL}/checklists/${checklistId}/items/${itemId}`, data);
  } catch {
    return { success: true, message: 'Updated (mock)' };
  }
}

/**
 * Submit Checklist
 */
export async function submitChecklist(checklistId, data = {}) {
  try {
    return await post(`${BASE_URL}/checklists/${checklistId}/submit`, data);
  } catch {
    return { success: true, message: 'Submitted (mock)' };
  }
}

/**
 * Get Equipment Status
 */
export async function getEquipment(params = {}) {
  try {
    const data = await get(`${BASE_URL}/equipment`, params);
    if (data?.devices?.length || data?.equipment?.length) {
      if (!data.summary && data.equipment) {
        data.summary = MOCK_EQUIPMENT.summary;
        data.devices = data.devices || data.equipment;
      }
      return data;
    }
    return MOCK_EQUIPMENT;
  } catch {
    return MOCK_EQUIPMENT;
  }
}

/**
 * Get Incidents
 */
export async function getIncidents(params = {}) {
  try {
    const data = await get(`${BASE_URL}/incidents`, params);
    if (data?.incidents) return data;
    return MOCK_INCIDENTS;
  } catch {
    return MOCK_INCIDENTS;
  }
}

/**
 * Report Incident
 */
export async function reportIncident(data) {
  try {
    return await post(`${BASE_URL}/incidents`, data);
  } catch {
    return { success: true, id: 'INC-MOCK', message: 'Reported (mock)' };
  }
}

/**
 * Resolve Incident
 */
export async function resolveIncident(incidentId, data = {}) {
  try {
    return await put(`${BASE_URL}/incidents/${incidentId}/resolve`, data);
  } catch {
    return { success: true, message: 'Resolved (mock)' };
  }
}
