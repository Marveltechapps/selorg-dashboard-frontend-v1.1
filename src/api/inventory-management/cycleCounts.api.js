/**
 * Cycle Counts API
 * Handles cycle count-related API calls. Uses mock data when API fails.
 */

import { get } from './apiClient';
import { MOCK_CYCLE_COUNT } from './mockData';

export { MOCK_CYCLE_COUNT };

const BASE_PATH = '/api/darkstore/inventory/cycle-count';

/**
 * Get cycle count data. Always returns full mock when API fails or returns incomplete data.
 */
export async function fetchCycleCount(storeId = 'DS-Brooklyn-04', date) {
  try {
    const params = { storeId };
    if (date) params.date = date;
    const data = await get(BASE_PATH, params);
    const hasMetrics = data?.metrics && (data.metrics.daily_count_progress ?? data.metrics.daily_progress != null);
    const hasHeatmap = data?.heatmap?.zones && Array.isArray(data.heatmap.zones) && data.heatmap.zones.length > 0;
    const hasVariance = data?.variance_report && Array.isArray(data.variance_report) && data.variance_report.length > 0;
    if (data && (hasMetrics || hasHeatmap || hasVariance)) return data;
  } catch (_) {}
  return MOCK_CYCLE_COUNT;
}

/**
 * Download cycle count report.
 * Uses blob-only download; never follows redirects so the app never leaves the page.
 */
export async function downloadCycleCountReport(storeId = 'DS-Brooklyn-04', date, format = 'pdf') {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const queryString = new URLSearchParams({ storeId, format, ...(date && { date }) }).toString();
  const url = `${API_BASE_URL}${BASE_PATH}/report?${queryString}`;

  try {
    const response = await fetch(url, { redirect: 'manual' });
    if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 301) {
      throw new Error('Redirect');
    }
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    if (blob && blob.size > 0 && blob.type && blob.type.includes('pdf')) return blob;
    throw new Error('Invalid response');
  } catch (error) {
    // Always return mock blob so UI never navigates or opens external URL
    const text = '%PDF-1.4 Cycle Count Report (mock)\n';
    return new Blob([text], { type: 'application/pdf' });
  }
}
