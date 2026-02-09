/**
 * API Configuration
 * Base URL for backend API.
 * For server/hosted run: set VITE_API_BASE_URL in .env (e.g. http://65.2.153.16:5000/api/v1).
 * For local dev with proxy: leave unset to use /api/v1 (proxied by Vite).
 */
export const API_CONFIG = {
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? '').trim() || '/api/v1',
  timeout: 30000, // 30 seconds
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth - Generic auth endpoints (role-based routing handled by backend)
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  // Dashboard-specific auth endpoints
  darkstore: {
    auth: {
      login: '/darkstore/auth/login',
      register: '/darkstore/auth/register',
    },
  },
  production: {
    auth: {
      login: '/production/auth/login',
      register: '/production/auth/register',
    },
  },
  merch: {
    auth: {
      login: '/merch/auth/login',
      register: '/merch/auth/register',
    },
  },
  rider: {
    auth: {
      login: '/rider/auth/login',
      register: '/rider/auth/register',
    },
  },
  finance: {
    auth: {
      login: '/finance/auth/login',
      register: '/finance/auth/register',
    },
  },
  warehouse: {
    auth: {
      login: '/warehouse/auth/login',
      register: '/warehouse/auth/register',
    },
    metrics: '/warehouse/metrics',
    orderFlow: '/warehouse/order-flow',
    dailyReport: '/warehouse/reports/daily',
    operationsView: '/warehouse/reports/operations-view',
    analytics: '/warehouse/analytics',
  },
  admin: {
    auth: {
      login: '/admin/auth/login',
      register: '/admin/auth/register',
    },
  },
  // Dashboard
  dashboard: {
    summary: '/shared/dashboard/summary',
  },
  // Riders (mounted at /api/v1/rider)
  riders: {
    list: '/rider',
    create: '/rider',
    byId: (id: string) => `/rider/${id}`,
    location: (id: string) => `/rider/${id}/location`,
    distribution: '/rider/distribution',
    summary: '/rider/summary',
  },
  // Orders (mounted at /api/v1/rider/orders)
  orders: {
    list: '/rider/orders',
    assign: (id: string) => `/rider/orders/${id}/assign`,
    alert: (id: string) => `/rider/orders/${id}/alert`,
  },
  // HR (mounted at /api/v1/rider/hr)
  hr: {
    summary: '/rider/hr/dashboard/summary',
    documents: '/rider/hr/documents',
    document: (id: string) => `/rider/hr/documents/${id}`,
    documentRejectionReason: (id: string) => `/rider/hr/documents/${id}/rejection-reason`,
    documentHistory: (id: string) => `/rider/hr/documents/${id}/history`,
    riders: '/rider/hr/riders',
    rider: (id: string) => `/rider/hr/riders/${id}`,
    access: (id: string) => `/rider/hr/access/${id}`,
    remindRider: (id: string) => `/rider/hr/riders/${id}/remind`,
    training: '/rider/hr/training',
    contracts: '/rider/hr/contracts',
    contract: (id: string) => `/rider/hr/contracts/${id}`,
    renewContract: (id: string) => `/rider/hr/contracts/${id}/renew`,
    terminateContract: (id: string) => `/rider/hr/contracts/${id}/terminate`,
  },
  // Dispatch (mounted at /api/v1/rider/dispatch)
  dispatch: {
    unassignedOrders: '/rider/dispatch/unassigned-orders',
    unassignedOrdersCount: '/rider/dispatch/unassigned-orders/count',
    mapData: '/rider/dispatch/map-data',
    mapRiders: '/rider/dispatch/map-data/riders',
    mapOrders: '/rider/dispatch/map-data/orders',
    recommendedRiders: (orderId: string) => `/rider/dispatch/recommended-riders/${orderId}`,
    orderAssignmentDetails: (orderId: string) => `/rider/dispatch/order/${orderId}/assignment-details`,
    createOrder: '/rider/dispatch/orders',
    assignOrder: '/rider/dispatch/assign',
    batchAssign: '/rider/dispatch/batch-assign',
    autoAssign: '/rider/dispatch/auto-assign',
  },
  // Fleet (mounted at /api/v1/rider/fleet)
  fleet: {
    summary: '/rider/fleet/summary',
    vehicles: '/rider/fleet/vehicles',
    vehicle: (id: string) => `/rider/fleet/vehicles/${id}`,
    maintenance: '/rider/fleet/maintenance',
    maintenanceTask: (id: string) => `/rider/fleet/maintenance/${id}`,
  },
  // Alerts & Exceptions
  alerts: {
    list: '/alerts',
    byId: (id: string) => `/alerts/${id}`,
    action: (id: string) => `/alerts/${id}/action`,
    clearResolved: '/alerts',
  },
  // Analytics & Reports
  analytics: {
    riderPerformance: '/analytics/rider-performance',
    slaAdherence: '/analytics/sla-adherence',
    fleetUtilization: '/analytics/fleet-utilization',
    exportReport: '/analytics/reports/export',
  },
  // Staff & Shift Management
  staff: {
    summary: '/staff/summary',
    list: '/staff',
    shifts: '/staff/shifts',
    shift: (id: string) => `/staff/shifts/${id}`,
    shiftCoverage: '/staff/shifts/coverage',
    weeklyRoster: '/staff/roster/weekly',
    publishRoster: '/staff/roster/weekly/publish',
    absences: '/staff/absences',
    autoAssign: '/staff/shifts/auto-assign',
    performance: '/staff/performance',
    incentiveCriteria: '/staff/incentive-criteria',
  },
  // Communication Hub (shared routes: /api/v1/shared/communication/...)
  communication: {
    chats: '/shared/communication/chats',
    chat: (id: string) => `/shared/communication/chats/${id}`,
    chatMessages: (id: string) => `/shared/communication/chats/${id}/messages`,
    markRead: (id: string) => `/shared/communication/chats/${id}/read`,
    broadcasts: '/shared/communication/broadcasts',
    flagIssue: (id: string) => `/shared/communication/chats/${id}/flag`,
  },
  // System Health
  systemHealth: {
    summary: '/system-health/summary',
    devices: '/system-health/devices',
    device: (id: string) => `/system-health/devices/${id}`,
    runDiagnostics: '/system-health/diagnostics/run',
    diagnosticsReport: (reportId: string) => `/system-health/diagnostics/reports/${reportId}`,
  },
  // Task Approvals (shared routes under /api/v1/shared)
  approvals: {
    summary: '/shared/approvals/summary',
    queue: '/shared/approvals/queue',
    queueItem: (id: string) => `/shared/approvals/queue/${id}`,
    approve: (id: string) => `/shared/approvals/queue/${id}/approve`,
    reject: (id: string) => `/shared/approvals/queue/${id}/reject`,
    batchApprove: '/shared/approvals/batch-approve',
  },
  // Vendor
  vendor: {
    // Auth
    auth: {
      register: '/vendor/auth/register',
      login: '/vendor/auth/login',
    },
    // Vendors
    vendors: {
      list: '/vendor/vendors',
      create: '/vendor/vendors',
      summary: '/vendor/vendors/summary',
      byId: (id: string) => `/vendor/vendors/${id}`,
      update: (id: string) => `/vendor/vendors/${id}`,
      patch: (id: string) => `/vendor/vendors/${id}`,
      action: (id: string) => `/vendor/vendors/${id}/actions`,
      purchaseOrders: (id: string) => `/vendor/vendors/${id}/purchase-orders`,
      qcChecks: (id: string) => `/vendor/vendors/${id}/qc-checks`,
      createQCCheck: (id: string) => `/vendor/vendors/${id}/qc-checks`,
      alerts: (id: string) => `/vendor/vendors/${id}/alerts`,
      createAlert: (id: string) => `/vendor/vendors/${id}/alerts`,
      performance: (id: string) => `/vendor/vendors/${id}/performance`,
      health: (id: string) => `/vendor/vendors/${id}/health`,
    },
    // Inbound
    inbound: {
      overview: '/vendor/inbound/overview',
      grns: '/vendor/inbound/grns',
      createGrn: '/vendor/inbound/grns',
      grnById: (id: string) => `/vendor/inbound/grns/${id}`,
      updateGrn: (id: string) => `/vendor/inbound/grns/${id}`,
      patchGrnStatus: (id: string) => `/vendor/inbound/grns/${id}/status`,
      approveGrn: (id: string) => `/vendor/inbound/grns/${id}/approve`,
      rejectGrn: (id: string) => `/vendor/inbound/grns/${id}/reject`,
      shipments: '/vendor/inbound/shipments',
      createShipment: '/vendor/inbound/shipments',
      patchShipmentStatus: (id: string) => `/vendor/inbound/shipments/${id}/status`,
      exceptions: '/vendor/inbound/exceptions',
      createException: '/vendor/inbound/exceptions',
      resolveException: (id: string) => `/vendor/inbound/exceptions/${id}/resolve`,
      bulkImport: '/vendor/inbound/bulk-import',
      bulkImportStatus: (id: string) => `/vendor/inbound/bulk-import/${id}`,
      report: '/vendor/inbound/report',
    },
    // Inventory
    inventory: {
      summary: (vendorId: string) => `/vendor/inventory/${vendorId}`,
      stock: (vendorId: string) => `/vendor/inventory/${vendorId}/stock`,
      sync: (vendorId: string) => `/vendor/inventory/${vendorId}/sync`,
      reconcile: (vendorId: string) => `/vendor/inventory/${vendorId}/reconcile`,
      agingAlerts: (vendorId: string) => `/vendor/inventory/${vendorId}/aging-alerts`,
      ackAlert: (vendorId: string, alertId: string) => `/vendor/inventory/${vendorId}/aging-alerts/${alertId}/ack`,
    },
    // Purchase Orders
    purchaseOrders: {
      list: '/vendor/purchase-orders',
      create: '/vendor/purchase-orders',
      byId: (id: string) => `/vendor/purchase-orders/${id}`,
      update: (id: string) => `/vendor/purchase-orders/${id}`,
      patch: (id: string) => `/vendor/purchase-orders/${id}`,
      approve: (id: string) => `/vendor/purchase-orders/${id}/approve`,
      reject: (id: string) => `/vendor/purchase-orders/${id}/reject`,
      cancel: (id: string) => `/vendor/purchase-orders/${id}/cancel`,
      receive: (id: string) => `/vendor/purchase-orders/${id}/receive`,
      export: '/vendor/purchase-orders/export',
    },
    // QC
    qc: {
      list: '/vendor/qc',
      create: '/vendor/qc',
      overview: '/vendor/qc/overview',
      byId: (id: string) => `/vendor/qc/${id}`,
      update: (id: string) => `/vendor/qc/${id}`,
    },
    // Certificates
    certificates: {
      listVendorCertificates: (vendorId: string) => `/vendor/vendors/${vendorId}/certificates`,
      createVendorCertificate: (vendorId: string) => `/vendor/vendors/${vendorId}/certificates`,
      getCertificate: (id: string) => `/vendor/certificates/${id}`,
      deleteCertificate: (id: string) => `/vendor/certificates/${id}`,
    },
    // Webhooks
    webhooks: {
      vendorSigned: '/vendor/webhooks/vendor-signed',
      carrier: '/vendor/webhooks/carrier',
    },
  },
  // Inbound (warehouse dashboard - mounted at /api/v1/warehouse)
  inbound: {
    grns: '/warehouse/inbound/grns',
    createGrn: '/warehouse/inbound/grns',
    exportGrns: '/warehouse/inbound/grns/export',
    grnById: (id: string) => `/warehouse/inbound/grns/${id}`,
    startGrn: (id: string) => `/warehouse/inbound/grns/${id}/start`,
    completeGrn: (id: string) => `/warehouse/inbound/grns/${id}/complete`,
    logDiscrepancy: (id: string) => `/warehouse/inbound/grns/${id}/discrepancy`,
    docks: '/warehouse/inbound/docks',
    updateDock: (id: string) => `/warehouse/inbound/docks/${id}`,
  },
  // Outbound (warehouse dashboard - mounted at /api/v1/warehouse)
  outbound: {
    picklists: '/warehouse/outbound/picklists',
    picklistById: (id: string) => `/warehouse/outbound/picklists/${id}`,
    assignPicker: (id: string) => `/warehouse/outbound/picklists/${id}/assign`,
    batches: '/warehouse/outbound/batches',
    batchById: (id: string) => `/warehouse/outbound/batches/${id}`,
    pickers: '/warehouse/outbound/pickers',
    pickerOrders: (id: string) => `/warehouse/outbound/pickers/${id}/orders`,
    routeMap: (id: string) => `/warehouse/outbound/routes/${id}/map`,
    routesActive: '/warehouse/outbound/routes/active/map',
    consolidatedPicks: '/warehouse/outbound/consolidated-picks',
  },
  // Inventory (warehouse dashboard)
  inventory: {
    summary: '/warehouse/inventory/summary',
    items: '/warehouse/inventory/items',
    itemById: (id: string) => `/warehouse/inventory/items/${id}`,
    locations: '/warehouse/inventory/locations',
    locationById: (id: string) => `/warehouse/inventory/locations/${id}`,
    adjustments: '/warehouse/inventory/adjustments',
    createAdjustment: '/warehouse/inventory/adjustments',
    cycleCounts: '/warehouse/inventory/cycle-counts',
    cycleCountById: (id: string) => `/warehouse/inventory/cycle-counts/${id}`,
    createCycleCount: '/warehouse/inventory/cycle-counts',
    startCycleCount: (id: string) => `/warehouse/inventory/cycle-counts/${id}/start`,
    completeCycleCount: (id: string) => `/warehouse/inventory/cycle-counts/${id}/complete`,
    transfers: '/warehouse/inventory/transfers',
    createTransfer: '/warehouse/inventory/transfers',
    updateTransferStatus: (id: string) => `/warehouse/inventory/transfers/${id}/status`,
    alerts: '/warehouse/inventory/alerts',
    createReorder: '/warehouse/inventory/reorder',
    export: '/warehouse/inventory/export',
  },
  // Inter-warehouse Transfers
  transfers: {
    list: '/warehouse/transfers',
    create: '/warehouse/transfers',
    details: (id: string) => `/warehouse/transfers/${id}`,
    updateStatus: (id: string) => `/warehouse/transfers/${id}/status`,
    track: (id: string) => `/warehouse/transfers/${id}/track`,
    export: '/warehouse/transfers/export',
  },
  // QC & Compliance (warehouse)
  qc: {
    inspections: '/warehouse/qc/inspections',
    createInspection: '/warehouse/qc/inspections',
    inspectionDetails: (id: string) => `/warehouse/qc/inspections/${id}`,
    inspectionReport: (id: string) => `/warehouse/qc/inspections/${id}/report`,
    temperatureLogs: '/warehouse/qc/temperature-logs',
    createTempLog: '/warehouse/qc/temperature-logs',
    tempChart: (id: string) => `/warehouse/qc/temperature-logs/${id}/chart`,
    logRejection: '/warehouse/qc/rejections',
    complianceDocs: '/warehouse/qc/compliance-docs',
    complianceDoc: (id: string) => `/warehouse/qc/compliance-docs/${id}`,
    samples: '/warehouse/qc/samples',
    createSample: '/warehouse/qc/samples',
    sampleReport: (id: string) => `/warehouse/qc/samples/${id}/report`,
    updateSample: (id: string) => `/warehouse/qc/samples/${id}/update`,
  },
  // Workforce & Shifts (warehouse)
  workforce: {
    staff: '/warehouse/workforce/staff',
    staffDetails: (id: string) => `/warehouse/workforce/staff/${id}`,
    schedule: '/warehouse/workforce/schedule',
    createSchedule: '/warehouse/workforce/schedule',
    assignStaff: (id: string) => `/warehouse/workforce/schedule/${id}/assign`,
    trainings: '/warehouse/workforce/training',
    trainingDetails: (id: string) => `/warehouse/workforce/training/${id}`,
    enrollStaff: (id: string) => `/warehouse/workforce/training/${id}/enroll`,
    attendance: '/warehouse/workforce/attendance',
    performance: '/warehouse/workforce/performance',
    leaveRequests: '/warehouse/workforce/leave-requests',
    createLeaveRequest: '/warehouse/workforce/leave-requests',
    updateLeaveStatus: (id: string) => `/warehouse/workforce/leave-requests/${id}/status`,
    logAttendance: '/warehouse/workforce/attendance',
  },
  // Equipment & Assets (warehouse)
  equipment: {
    devices: '/warehouse/equipment/devices',
    deviceById: (id: string) => `/warehouse/equipment/devices/${id}`,
    machinery: '/warehouse/equipment/machinery',
    addMachinery: '/warehouse/equipment/machinery',
    machineryById: (id: string) => `/warehouse/equipment/machinery/${id}`,
    reportIssue: (id: string) => `/warehouse/equipment/machinery/${id}/issue`,
    resolveIssue: (id: string) => `/warehouse/equipment/machinery/${id}/resolve`,
    export: '/warehouse/equipment/export',
  },
  // Exceptions (warehouse)
  exceptions: {
    list: '/warehouse/exceptions',
    report: '/warehouse/exceptions',
    byId: (id: string) => `/warehouse/exceptions/${id}`,
    updateStatus: (id: string) => `/warehouse/exceptions/${id}/status`,
    rejectShipment: (id: string) => `/warehouse/exceptions/${id}/reject-shipment`,
    acceptPartial: (id: string) => `/warehouse/exceptions/${id}/accept-partial`,
    export: '/warehouse/exceptions/export',
  },
};
