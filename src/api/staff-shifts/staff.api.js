/**
 * Staff & Shifts API Service
 * Handles all API calls for Staff & Shift Management screen
 */

import { get, post } from '../inventory-management/apiClient';

const BASE_URL = '/api/darkstore/staff';

// Mock data when API unavailable
const MOCK_SUMMARY = {
  success: true,
  summary: {
    active_staff: 24,
    absences_today: 2,
    total_staff: 28,
    on_break: 3,
  },
};
const MOCK_ROSTER = {
  success: true,
  staff: [
    { staff_id: 'S001', name: 'Raj Kumar', role: 'Picker', status: 'Active', current_shift: 'Morning', zone: 'A-1', current_task: 'Pick list #PL-101' },
    { staff_id: 'S002', name: 'Priya M', role: 'Packer', status: 'Active', current_shift: 'Morning', zone: 'Pack-2', current_task: 'Order ORD-2001' },
    { staff_id: 'S003', name: 'Amit Singh', role: 'Picker', status: 'Break', current_shift: 'Morning', zone: 'A-2' },
    { staff_id: 'S004', name: 'Sneha K', role: 'Supervisor', status: 'Active', current_shift: 'Morning', zone: 'Floor' },
  ],
};
const MOCK_COVERAGE = {
  success: true,
  coverage: [
    { slot: 'Morning', slot_id: 'morning', current_staff: 12, target_staff: 12, status: 'ok' },
    { slot: 'Afternoon', slot_id: 'afternoon', current_staff: 10, target_staff: 10, status: 'ok' },
    { slot: 'Evening', slot_id: 'evening', current_staff: 8, target_staff: 8, status: 'ok' },
  ],
  gaps: [],
};
const MOCK_ABSENCES = {
  success: true,
  absences: [
    { staff_id: 'S005', name: 'Vikram R', reason: 'Sick', date: new Date().toISOString().split('T')[0] },
    { staff_id: 'S006', name: 'Anita P', reason: 'Leave', date: new Date().toISOString().split('T')[0] },
  ],
};
const MOCK_WEEKLY_ROSTER = {
  success: true,
  roster: [
    { staff_id: 'S001', name: 'Raj Kumar', role: 'Picker', mon: 'M', tue: 'M', wed: 'M', thu: 'M', fri: 'M', sat: 'O', sun: 'O' },
    { staff_id: 'S002', name: 'Priya M', role: 'Packer', mon: 'M', tue: 'M', wed: 'E', thu: 'E', fri: 'M', sat: 'O', sun: 'O' },
  ],
};
const MOCK_PERFORMANCE = {
  success: true,
  summary: {
    avg_productivity: '38/hr',
    team_error_rate: 1.2,
    sla_breach_impact: '0.5%',
    incentives_paid: 12500,
  },
  staff_performance: [
    { staff_id: 'S001', name: 'Raj Kumar', role: 'Picker', productivity: 42, accuracy: 98, attendance: 95, error_rate: '0.5%', sla_impact: '0%', incentive_status: 'Eligible' },
    { staff_id: 'S002', name: 'Priya M', role: 'Packer', productivity: 28, accuracy: 99, attendance: 92, error_rate: '0.2%', sla_impact: '0%', incentive_status: 'Eligible' },
    { staff_id: 'S003', name: 'Amit Singh', role: 'Picker', productivity: 40, accuracy: 97, attendance: 90, error_rate: '1.1%', sla_impact: '0.5%', incentive_status: 'At Risk' },
  ],
  employee_of_week: { week: 42, name: 'Raj Kumar', role: 'Picker', productivity: '42/hr', accuracy: '98%' },
  incentive_criteria: [
    { name: 'Picks > 40/hr', criterion: 'Picks > 40/hr', target: '40', unit: 'picks', bonus: 500, reward: '₹500' },
    { name: 'Accuracy > 98%', criterion: 'Accuracy > 98%', target: '98%', unit: '%', bonus: 300, reward: '₹300' },
    { name: 'Zero errors (shift)', criterion: 'Zero errors (shift)', target: '0', unit: 'errors', bonus: 200, reward: '₹200' },
  ],
};

/**
 * Get Staff Summary
 */
export async function getStaffSummary(params = {}) {
  try {
    const data = await get(`${BASE_URL}/summary`, params);
    if (data?.summary) return data;
    return MOCK_SUMMARY;
  } catch {
    return MOCK_SUMMARY;
  }
}

/**
 * Get Staff Roster
 */
export async function getStaffRoster(params = {}) {
  try {
    const data = await get(`${BASE_URL}/roster`, params);
    if (data?.staff?.length > 0) return data;
    return MOCK_ROSTER;
  } catch {
    return MOCK_ROSTER;
  }
}

/**
 * Get Shift Coverage
 */
export async function getShiftCoverage(params = {}) {
  try {
    const data = await get(`${BASE_URL}/shift-coverage`, params);
    if (data?.coverage != null) return data;
    return MOCK_COVERAGE;
  } catch {
    return MOCK_COVERAGE;
  }
}

/**
 * Get Absences
 */
export async function getAbsences(params = {}) {
  try {
    const data = await get(`${BASE_URL}/absences`, params);
    if (data?.absences?.length > 0) return data;
    return MOCK_ABSENCES;
  } catch {
    return MOCK_ABSENCES;
  }
}

/**
 * Log Absence
 */
export async function logAbsence(data) {
  return post(`${BASE_URL}/absences`, data);
}

/**
 * Get Weekly Roster
 */
export async function getWeeklyRoster(params = {}) {
  try {
    const data = await get(`${BASE_URL}/weekly-roster`, params);
    if (data?.roster?.length > 0) return data;
    return MOCK_WEEKLY_ROSTER;
  } catch {
    return MOCK_WEEKLY_ROSTER;
  }
}

/**
 * Publish Roster
 */
export async function publishRoster(data) {
  try {
    return await post(`${BASE_URL}/weekly-roster/publish`, data);
  } catch {
    return { success: true, message: 'Roster published (mock)' };
  }
}

/**
 * Auto-Assign OT Shifts
 */
export async function autoAssignOT(data) {
  try {
    return await post(`${BASE_URL}/shifts/auto-assign-ot`, data);
  } catch {
    return { success: true, message: 'OT assigned (mock)' };
  }
}

/**
 * Get Performance Metrics
 */
export async function getPerformance(params = {}) {
  try {
    const data = await get(`${BASE_URL}/performance`, params);
    if (data?.staff_performance?.length || data?.metrics?.length) return data;
    return MOCK_PERFORMANCE;
  } catch {
    return MOCK_PERFORMANCE;
  }
}

/**
 * Download Performance Report
 */
export async function downloadPerformanceReport(params = {}) {
  try {
    const baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001';
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}${BASE_URL}/performance/download?${query}`);
    if (!response.ok) throw new Error('Failed to download report');
    return response.blob();
  } catch {
    // Return a minimal PDF-like blob so download still triggers
    const text = 'Staff Performance Report\n\nGenerated: ' + new Date().toISOString() + '\n\n(Report data unavailable - backend not connected)';
    return new Blob([text], { type: 'application/pdf' });
  }
}
