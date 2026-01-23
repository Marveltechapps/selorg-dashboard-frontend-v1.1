/**
 * Staff & Shifts API Service
 * Handles all API calls for Staff & Shift Management screen
 */

import { get, post } from '../inventory-management/apiClient';

const BASE_URL = '/api/darkstore/staff';

/**
 * Get Staff Summary
 */
export async function getStaffSummary(params = {}) {
  return get(`${BASE_URL}/summary`, params);
}

/**
 * Get Staff Roster
 */
export async function getStaffRoster(params = {}) {
  return get(`${BASE_URL}/roster`, params);
}

/**
 * Get Shift Coverage
 */
export async function getShiftCoverage(params = {}) {
  return get(`${BASE_URL}/shift-coverage`, params);
}

/**
 * Get Absences
 */
export async function getAbsences(params = {}) {
  return get(`${BASE_URL}/absences`, params);
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
  return get(`${BASE_URL}/weekly-roster`, params);
}

/**
 * Publish Roster
 */
export async function publishRoster(data) {
  return post(`${BASE_URL}/weekly-roster/publish`, data);
}

/**
 * Auto-Assign OT Shifts
 */
export async function autoAssignOT(data) {
  return post(`${BASE_URL}/shifts/auto-assign-ot`, data);
}

/**
 * Get Performance Metrics
 */
export async function getPerformance(params = {}) {
  return get(`${BASE_URL}/performance`, params);
}

/**
 * Download Performance Report
 */
export async function downloadPerformanceReport(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}/performance/download?${query}`);
  if (!response.ok) {
    throw new Error('Failed to download report');
  }
  return response.blob();
}

