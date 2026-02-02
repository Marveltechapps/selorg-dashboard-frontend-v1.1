/**
 * Production dashboard session persistence.
 * Saves/loads state from sessionStorage so data survives page refresh within the same tab.
 */
const PREFIX = 'production_';

function getKey(key: string): string {
  return PREFIX + key;
}

export function getProductionSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(getKey(key));
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setProductionSession<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(getKey(key), JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const PRODUCTION_KEYS = {
  overviewLines: 'overview_lines',
  rawMaterials: 'raw_materials',
  rawReceipts: 'raw_receipts',
  rawRequisitions: 'raw_requisitions',
  workOrders: 'work_orders',
  qcLabTests: 'qc_lab_tests',
  qcInspections: 'qc_inspections',
  maintenanceTasks: 'maintenance_tasks',
  maintenanceEquipment: 'maintenance_equipment',
  maintenanceIot: 'maintenance_iot',
  workforceStaff: 'workforce_staff',
  workforceShifts: 'workforce_shifts',
  workforceAttendance: 'workforce_attendance',
  alerts: 'alerts',
  alertHistory: 'alert_history',
  incidents: 'incidents',
  utilitiesSettings: 'utilities_settings',
  auditLogs: 'audit_logs',
  reportsDateRange: 'reports_date_range',
} as const;
