/**
 * API Configuration
 * Base URL for backend API
 */
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
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
  // Riders
  riders: {
    list: '/riders',
    create: '/riders',
    byId: (id: string) => `/riders/${id}`,
    location: (id: string) => `/riders/${id}/location`,
    distribution: '/riders/distribution',
  },
  // Orders
  orders: {
    list: '/orders',
    assign: (id: string) => `/orders/${id}/assign`,
    alert: (id: string) => `/orders/${id}/alert`,
  },
  // HR
  hr: {
    summary: '/hr/dashboard/summary',
    documents: '/hr/documents',
    document: (id: string) => `/hr/documents/${id}`,
    documentRejectionReason: (id: string) => `/hr/documents/${id}/rejection-reason`,
    documentHistory: (id: string) => `/hr/documents/${id}/history`,
    riders: '/hr/riders',
    rider: (id: string) => `/hr/riders/${id}`,
    remindRider: (id: string) => `/hr/riders/${id}/remind`,
    training: '/hr/training',
    contracts: '/hr/contracts',
    contract: (id: string) => `/hr/contracts/${id}`,
    renewContract: (id: string) => `/hr/contracts/${id}/renew`,
    terminateContract: (id: string) => `/hr/contracts/${id}/terminate`,
  },
  // Dispatch
  dispatch: {
    unassignedOrders: '/dispatch/unassigned-orders',
    unassignedOrdersCount: '/dispatch/unassigned-orders/count',
    mapData: '/dispatch/map-data',
    mapRiders: '/dispatch/map-data/riders',
    mapOrders: '/dispatch/map-data/orders',
    recommendedRiders: (orderId: string) => `/dispatch/recommended-riders/${orderId}`,
    orderAssignmentDetails: (orderId: string) => `/dispatch/order/${orderId}/assignment-details`,
    assignOrder: '/dispatch/assign',
    batchAssign: '/dispatch/batch-assign',
    autoAssign: '/dispatch/auto-assign',
  },
  // Fleet
  fleet: {
    summary: '/fleet/summary',
    vehicles: '/fleet/vehicles',
    vehicle: (id: string) => `/fleet/vehicles/${id}`,
    maintenance: '/fleet/maintenance',
    maintenanceTask: (id: string) => `/fleet/maintenance/${id}`,
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
  // Communication Hub
  communication: {
    chats: '/communication/chats',
    chat: (id: string) => `/communication/chats/${id}`,
    chatMessages: (id: string) => `/communication/chats/${id}/messages`,
    markRead: (id: string) => `/communication/chats/${id}/read`,
    broadcasts: '/communication/broadcasts',
    flagIssue: (id: string) => `/communication/chats/${id}/flag`,
  },
  // System Health
  systemHealth: {
    summary: '/system-health/summary',
    devices: '/system-health/devices',
    device: (id: string) => `/system-health/devices/${id}`,
    runDiagnostics: '/system-health/diagnostics/run',
    diagnosticsReport: (reportId: string) => `/system-health/diagnostics/reports/${reportId}`,
  },
  // Task Approvals
  approvals: {
    summary: '/approvals/summary',
    queue: '/approvals/queue',
    queueItem: (id: string) => `/approvals/queue/${id}`,
    approve: (id: string) => `/approvals/queue/${id}/approve`,
    reject: (id: string) => `/approvals/queue/${id}/reject`,
    batchApprove: '/approvals/batch-approve',
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
  // Inbound
  inbound: {
    grns: '/inbound/grns',
    createGrn: '/inbound/grns',
    exportGrns: '/inbound/grns/export',
    grnById: (id: string) => `/inbound/grns/${id}`,
    startGrn: (id: string) => `/inbound/grns/${id}/start`,
    completeGrn: (id: string) => `/inbound/grns/${id}/complete`,
    logDiscrepancy: (id: string) => `/inbound/grns/${id}/discrepancy`,
    docks: '/inbound/docks',
    updateDock: (id: string) => `/inbound/docks/${id}`,
  },
  // Outbound
  outbound: {
    picklists: '/outbound/picklists',
    picklistById: (id: string) => `/outbound/picklists/${id}`,
    assignPicker: (id: string) => `/outbound/picklists/${id}/assign`,
    batches: '/outbound/batches',
    batchById: (id: string) => `/outbound/batches/${id}`,
    pickers: '/outbound/pickers',
    pickerOrders: (id: string) => `/outbound/pickers/${id}/orders`,
    routeMap: (id: string) => `/outbound/routes/${id}/map`,
  },
  // Inventory
  inventory: {
    summary: '/inventory/summary',
    items: '/inventory/items',
    itemById: (id: string) => `/inventory/items/${id}`,
    locations: '/inventory/locations',
    locationById: (id: string) => `/inventory/locations/${id}`,
    adjustments: '/inventory/adjustments',
    createAdjustment: '/inventory/adjustments',
    cycleCounts: '/inventory/cycle-counts',
    cycleCountById: (id: string) => `/inventory/cycle-counts/${id}`,
    createCycleCount: '/inventory/cycle-counts',
    startCycleCount: (id: string) => `/inventory/cycle-counts/${id}/start`,
    completeCycleCount: (id: string) => `/inventory/cycle-counts/${id}/complete`,
    transfers: '/inventory/transfers',
    createTransfer: '/inventory/transfers',
    updateTransferStatus: (id: string) => `/inventory/transfers/${id}/status`,
    alerts: '/inventory/alerts',
    createReorder: '/inventory/reorder',
    export: '/inventory/export',
  },
  // Inter-warehouse Transfers
  transfers: {
    list: '/transfers',
    create: '/transfers',
    details: (id: string) => `/transfers/${id}`,
    updateStatus: (id: string) => `/transfers/${id}/status`,
    track: (id: string) => `/transfers/${id}/track`,
    export: '/transfers/export',
  },
  // QC & Compliance
  qc: {
    inspections: '/qc/inspections',
    createInspection: '/qc/inspections',
    inspectionDetails: (id: string) => `/qc/inspections/${id}`,
    inspectionReport: (id: string) => `/qc/inspections/${id}/report`,
    temperatureLogs: '/qc/temperature-logs',
    createTempLog: '/qc/temperature-logs',
    tempChart: (id: string) => `/qc/temperature-logs/${id}/chart`,
    logRejection: '/qc/rejections',
    complianceDocs: '/qc/compliance-docs',
    complianceDoc: (id: string) => `/qc/compliance-docs/${id}`,
    samples: '/qc/samples',
    createSample: '/qc/samples',
    sampleReport: (id: string) => `/qc/samples/${id}/report`,
    updateSample: (id: string) => `/qc/samples/${id}/update`,
  },
  // Workforce & Shifts
  workforce: {
    staff: '/workforce/staff',
    staffDetails: (id: string) => `/workforce/staff/${id}`,
    schedule: '/workforce/schedule',
    createSchedule: '/workforce/schedule',
    assignStaff: (id: string) => `/workforce/schedule/${id}/assign`,
    trainings: '/workforce/training',
    trainingDetails: (id: string) => `/workforce/training/${id}`,
    enrollStaff: (id: string) => `/workforce/training/${id}/enroll`,
    attendance: '/workforce/attendance',
    performance: '/workforce/performance',
    leaveRequests: '/workforce/leave-requests',
    createLeaveRequest: '/workforce/leave-requests',
    updateLeaveStatus: (id: string) => `/workforce/leave-requests/${id}/status`,
    logAttendance: '/workforce/attendance',
  },
  // Equipment & Assets
  equipment: {
    devices: '/equipment/devices',
    deviceById: (id: string) => `/equipment/devices/${id}`,
    machinery: '/equipment/machinery',
    addMachinery: '/equipment/machinery',
    machineryById: (id: string) => `/equipment/machinery/${id}`,
    reportIssue: (id: string) => `/equipment/machinery/${id}/issue`,
    resolveIssue: (id: string) => `/equipment/machinery/${id}/resolve`,
    export: '/equipment/export',
  },
  // Exceptions
  exceptions: {
    list: '/exceptions',
    report: '/exceptions',
    byId: (id: string) => `/exceptions/${id}`,
    updateStatus: (id: string) => `/exceptions/${id}/status`,
    rejectShipment: (id: string) => `/exceptions/${id}/reject-shipment`,
    acceptPartial: (id: string) => `/exceptions/${id}/accept-partial`,
    export: '/exceptions/export',
  },
};
