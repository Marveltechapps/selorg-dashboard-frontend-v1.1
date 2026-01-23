// --- Type Definitions ---

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'approve' | 'reject';
  module: 'users' | 'orders' | 'products' | 'payments' | 'config' | 'auth' | 'compliance' | 'integrations' | 'support';
  resource: string;
  resourceId?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  description: string;
  ipAddress: string;
  userAgent: string;
  changes?: ChangeDetail[];
  metadata?: Record<string, any>;
}

export interface ChangeDetail {
  field: string;
  oldValue: string | number | boolean;
  newValue: string | number | boolean;
}

export interface AuditStats {
  totalEvents: number;
  todayEvents: number;
  criticalEvents: number;
  uniqueUsers: number;
  topAction: string;
  topModule: string;
}

// --- Mock Data ---

const MOCK_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-12-20T11:45:23Z',
    user: 'Sarah Chen',
    userEmail: 'sarah.chen@quickcommerce.com',
    action: 'update',
    module: 'config',
    resource: 'Delivery Fee Configuration',
    resourceId: 'CFG-DEL-001',
    severity: 'warning',
    description: 'Updated base delivery fee for Central Mumbai zone',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    changes: [
      { field: 'baseFee', oldValue: 39, newValue: 49 },
      { field: 'surgeMultiplier', oldValue: 1.2, newValue: 1.5 },
    ],
    metadata: {
      zoneId: 'ZONE-001',
      zoneName: 'Central Mumbai',
    },
  },
  {
    id: 'LOG-002',
    timestamp: '2024-12-20T11:42:15Z',
    user: 'Admin User',
    userEmail: 'admin@quickcommerce.com',
    action: 'create',
    module: 'users',
    resource: 'User Account',
    resourceId: 'USR-456',
    severity: 'success',
    description: 'Created new admin user account for Michael Roberts',
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    changes: [
      { field: 'email', oldValue: '', newValue: 'michael.roberts@quickcommerce.com' },
      { field: 'role', oldValue: '', newValue: 'Admin' },
      { field: 'permissions', oldValue: '', newValue: 'Full Access' },
    ],
    metadata: {
      userId: 'USR-456',
      department: 'Operations',
    },
  },
  {
    id: 'LOG-003',
    timestamp: '2024-12-20T11:38:47Z',
    user: 'Emma Williams',
    userEmail: 'emma.williams@quickcommerce.com',
    action: 'delete',
    module: 'products',
    resource: 'Product SKU',
    resourceId: 'PRD-789',
    severity: 'critical',
    description: 'Permanently deleted discontinued product SKU from catalog',
    ipAddress: '192.168.1.78',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    changes: [
      { field: 'status', oldValue: 'inactive', newValue: 'deleted' },
      { field: 'inventoryCount', oldValue: 0, newValue: 0 },
    ],
    metadata: {
      productName: 'Organic Tomatoes 500g',
      category: 'Vegetables',
      reason: 'Discontinued by supplier',
    },
  },
  {
    id: 'LOG-004',
    timestamp: '2024-12-20T11:35:12Z',
    user: 'System',
    userEmail: 'system@quickcommerce.com',
    action: 'update',
    module: 'orders',
    resource: 'Order Status',
    resourceId: 'ORD-12345',
    severity: 'info',
    description: 'Automated order status update: Processing → Delivered',
    ipAddress: '127.0.0.1',
    userAgent: 'Internal System Process',
    changes: [
      { field: 'status', oldValue: 'processing', newValue: 'delivered' },
      { field: 'deliveredAt', oldValue: '', newValue: '2024-12-20T11:35:12Z' },
    ],
    metadata: {
      customerId: 'CUST-789',
      riderId: 'RIDER-45',
      deliveryTime: '18 minutes',
    },
  },
  {
    id: 'LOG-005',
    timestamp: '2024-12-20T11:30:00Z',
    user: 'David Kumar',
    userEmail: 'david.kumar@quickcommerce.com',
    action: 'login',
    module: 'auth',
    resource: 'Authentication',
    severity: 'success',
    description: 'Successful login via SSO',
    ipAddress: '192.168.1.92',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
    metadata: {
      loginMethod: 'SSO',
      sessionId: 'sess_abc123def456',
      deviceType: 'Desktop',
    },
  },
  {
    id: 'LOG-006',
    timestamp: '2024-12-20T11:28:33Z',
    user: 'Priya Sharma',
    userEmail: 'priya.sharma@quickcommerce.com',
    action: 'approve',
    module: 'payments',
    resource: 'Refund Request',
    resourceId: 'REF-567',
    severity: 'warning',
    description: 'Approved refund request for order ORD-98765',
    ipAddress: '192.168.1.56',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    changes: [
      { field: 'status', oldValue: 'pending', newValue: 'approved' },
      { field: 'approvedAmount', oldValue: 0, newValue: 1299 },
    ],
    metadata: {
      orderId: 'ORD-98765',
      refundAmount: 1299,
      reason: 'Damaged product',
    },
  },
  {
    id: 'LOG-007',
    timestamp: '2024-12-20T11:25:18Z',
    user: 'System',
    userEmail: 'system@quickcommerce.com',
    action: 'update',
    module: 'integrations',
    resource: 'Webhook Status',
    resourceId: 'WH-003',
    severity: 'critical',
    description: 'Webhook delivery failed after 3 retry attempts',
    ipAddress: '127.0.0.1',
    userAgent: 'Webhook Processor v2.1',
    changes: [
      { field: 'status', oldValue: 'active', newValue: 'failed' },
      { field: 'retryCount', oldValue: 2, newValue: 3 },
    ],
    metadata: {
      webhookUrl: 'https://api.partner.com/webhooks/orders',
      errorCode: 'CONNECTION_TIMEOUT',
      lastError: 'Remote server did not respond within 30 seconds',
    },
  },
  {
    id: 'LOG-008',
    timestamp: '2024-12-20T11:22:45Z',
    user: 'Rajesh Patel',
    userEmail: 'rajesh.patel@quickcommerce.com',
    action: 'export',
    module: 'orders',
    resource: 'Order Report',
    severity: 'info',
    description: 'Exported daily order report (CSV)',
    ipAddress: '192.168.1.33',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    metadata: {
      reportType: 'daily_orders',
      dateRange: '2024-12-19 to 2024-12-20',
      recordCount: 1547,
      fileSize: '2.4 MB',
    },
  },
  {
    id: 'LOG-009',
    timestamp: '2024-12-20T11:20:12Z',
    user: 'Security Team',
    userEmail: 'security@quickcommerce.com',
    action: 'update',
    module: 'compliance',
    resource: 'Security Policy',
    resourceId: 'POL-002',
    severity: 'warning',
    description: 'Updated Information Security Policy to version 2.9',
    ipAddress: '192.168.1.88',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    changes: [
      { field: 'version', oldValue: '2.8', newValue: '2.9' },
      { field: 'status', oldValue: 'under-review', newValue: 'active' },
      { field: 'requiresAcknowledgment', oldValue: false, newValue: true },
    ],
    metadata: {
      policyName: 'Information Security Policy',
      approvedBy: 'CTO',
      totalEmployees: 450,
    },
  },
  {
    id: 'LOG-010',
    timestamp: '2024-12-20T11:18:00Z',
    user: 'Support Agent',
    userEmail: 'support.agent@quickcommerce.com',
    action: 'update',
    module: 'support',
    resource: 'Support Ticket',
    resourceId: 'TKT-8901',
    severity: 'info',
    description: 'Updated ticket status and assigned to specialist',
    ipAddress: '192.168.1.67',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    changes: [
      { field: 'status', oldValue: 'open', newValue: 'in-progress' },
      { field: 'assignedTo', oldValue: 'unassigned', newValue: 'David Kumar' },
      { field: 'priority', oldValue: 'medium', newValue: 'high' },
    ],
    metadata: {
      ticketType: 'Payment Issue',
      customerId: 'CUST-456',
      estimatedResolution: '2 hours',
    },
  },
  {
    id: 'LOG-011',
    timestamp: '2024-12-20T11:15:33Z',
    user: 'Admin User',
    userEmail: 'admin@quickcommerce.com',
    action: 'create',
    module: 'integrations',
    resource: 'API Key',
    resourceId: 'KEY-789',
    severity: 'warning',
    description: 'Generated new production API key for Razorpay integration',
    ipAddress: '10.0.0.12',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    changes: [
      { field: 'environment', oldValue: '', newValue: 'production' },
      { field: 'permissions', oldValue: '', newValue: 'read,write,refund' },
    ],
    metadata: {
      integrationName: 'Razorpay',
      keyName: 'Production Key - Primary',
      expiresAt: '2025-12-20',
    },
  },
  {
    id: 'LOG-012',
    timestamp: '2024-12-20T11:12:08Z',
    user: 'Lisa Anderson',
    userEmail: 'lisa.anderson@quickcommerce.com',
    action: 'view',
    module: 'compliance',
    resource: 'Compliance Document',
    resourceId: 'DOC-001',
    severity: 'info',
    description: 'Viewed GDPR Data Processing Agreement',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    metadata: {
      documentName: 'GDPR Data Processing Agreement',
      documentType: 'agreement',
      viewDuration: '5 minutes',
    },
  },
  {
    id: 'LOG-013',
    timestamp: '2024-12-20T11:10:00Z',
    user: 'System',
    userEmail: 'system@quickcommerce.com',
    action: 'update',
    module: 'config',
    resource: 'System Configuration',
    resourceId: 'SYS-001',
    severity: 'critical',
    description: 'Automated failover to backup payment gateway',
    ipAddress: '127.0.0.1',
    userAgent: 'System Monitor v3.2',
    changes: [
      { field: 'primaryGateway', oldValue: 'Razorpay', newValue: 'Stripe' },
      { field: 'failoverStatus', oldValue: 'inactive', newValue: 'active' },
    ],
    metadata: {
      reason: 'Primary gateway timeout detected',
      affectedOrders: 0,
      failoverTime: '2.3 seconds',
    },
  },
  {
    id: 'LOG-014',
    timestamp: '2024-12-20T11:05:27Z',
    user: 'Security Team',
    userEmail: 'security@quickcommerce.com',
    action: 'reject',
    module: 'auth',
    resource: 'Login Attempt',
    severity: 'critical',
    description: 'Blocked suspicious login attempt (5th failed attempt)',
    ipAddress: '203.0.113.45',
    userAgent: 'Unknown',
    metadata: {
      targetAccount: 'admin@quickcommerce.com',
      failedAttempts: 5,
      blockDuration: '1 hour',
      reason: 'Brute force protection triggered',
    },
  },
  {
    id: 'LOG-015',
    timestamp: '2024-12-20T11:00:00Z',
    user: 'Scheduled Job',
    userEmail: 'system@quickcommerce.com',
    action: 'export',
    module: 'orders',
    resource: 'Daily Summary Report',
    severity: 'success',
    description: 'Generated and emailed daily operations summary',
    ipAddress: '127.0.0.1',
    userAgent: 'Cron Job Scheduler v1.0',
    metadata: {
      totalOrders: 1547,
      totalRevenue: 3456789,
      successRate: 98.6,
      recipients: ['ops@quickcommerce.com', 'ceo@quickcommerce.com'],
    },
  },
  {
    id: 'LOG-016',
    timestamp: '2024-12-20T10:58:15Z',
    user: 'Emma Williams',
    userEmail: 'emma.williams@quickcommerce.com',
    action: 'logout',
    module: 'auth',
    resource: 'Authentication',
    severity: 'info',
    description: 'User logged out',
    ipAddress: '192.168.1.78',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    metadata: {
      sessionDuration: '2 hours 15 minutes',
      sessionId: 'sess_xyz789abc123',
    },
  },
  {
    id: 'LOG-017',
    timestamp: '2024-12-20T10:55:42Z',
    user: 'Operations Team',
    userEmail: 'ops@quickcommerce.com',
    action: 'create',
    module: 'config',
    resource: 'Geofence Zone',
    resourceId: 'ZONE-009',
    severity: 'success',
    description: 'Created new delivery zone: Whitefield Tech Park',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
    changes: [
      { field: 'zoneName', oldValue: '', newValue: 'Whitefield Tech Park' },
      { field: 'zoneType', oldValue: '', newValue: 'premium' },
      { field: 'deliveryFee', oldValue: 0, newValue: 49 },
    ],
    metadata: {
      city: 'Bangalore',
      area: '14.5 sq km',
      estimatedPopulation: 120000,
    },
  },
  {
    id: 'LOG-018',
    timestamp: '2024-12-20T10:50:00Z',
    user: 'Payment Team',
    userEmail: 'payments@quickcommerce.com',
    action: 'update',
    module: 'payments',
    resource: 'Payment Gateway Config',
    resourceId: 'PG-001',
    severity: 'warning',
    description: 'Updated Razorpay webhook secret key',
    ipAddress: '192.168.1.88',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    changes: [
      { field: 'webhookSecret', oldValue: '••••••••••••', newValue: '••••••••••••' },
      { field: 'lastRotated', oldValue: '2024-11-20', newValue: '2024-12-20' },
    ],
    metadata: {
      gateway: 'Razorpay',
      rotationReason: 'Scheduled monthly rotation',
    },
  },
  {
    id: 'LOG-019',
    timestamp: '2024-12-20T10:45:18Z',
    user: 'Compliance Team',
    userEmail: 'compliance@quickcommerce.com',
    action: 'create',
    module: 'compliance',
    resource: 'Audit Schedule',
    resourceId: 'AUD-006',
    severity: 'info',
    description: 'Scheduled Q1 2025 Internal Security Audit',
    ipAddress: '192.168.1.92',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    changes: [
      { field: 'auditDate', oldValue: '', newValue: '2025-03-15' },
      { field: 'auditor', oldValue: '', newValue: 'Sarah Chen' },
      { field: 'auditType', oldValue: '', newValue: 'internal' },
    ],
    metadata: {
      scope: ['Access Controls', 'Data Encryption', 'Network Security'],
      estimatedDuration: '2 weeks',
    },
  },
  {
    id: 'LOG-020',
    timestamp: '2024-12-20T10:40:00Z',
    user: 'System',
    userEmail: 'system@quickcommerce.com',
    action: 'update',
    module: 'products',
    resource: 'Inventory Sync',
    severity: 'success',
    description: 'Completed automated inventory synchronization',
    ipAddress: '127.0.0.1',
    userAgent: 'Inventory Sync Service v2.0',
    metadata: {
      productsUpdated: 2847,
      warehousesSync: 12,
      syncDuration: '45 seconds',
      lastSync: '2024-12-20T10:40:00Z',
    },
  },
];

const MOCK_STATS: AuditStats = {
  totalEvents: 20,
  todayEvents: 20,
  criticalEvents: 4,
  uniqueUsers: 12,
  topAction: 'update',
  topModule: 'config',
};

// --- API Functions ---

import { apiRequest } from '@/api/apiClient';

export async function fetchAuditLogs(filters?: {
  module?: string;
  action?: string;
  severity?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AuditLog[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.module) queryParams.append('module', filters.module);
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.severity) queryParams.append('severity', filters.severity);
    if (filters?.dateFrom) queryParams.append('startDate', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('endDate', filters.dateTo);
    
    const response = await apiRequest<{ success: boolean; data: AuditLog[] }>(`/admin/audit/logs?${queryParams.toString()}`);
    let logs = response.data || [];
    
    if (filters?.user) {
      logs = logs.filter(log => log.userEmail?.toLowerCase().includes(filters.user!.toLowerCase()));
    }
    
    return logs;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

export async function fetchAuditStats(): Promise<AuditStats> {
  try {
    const response = await apiRequest<{ success: boolean; data: AuditStats }>('/admin/audit/logs/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch audit stats:', error);
    return {
      totalEvents: 0,
      todayEvents: 0,
      criticalEvents: 0,
      uniqueUsers: 0,
      topAction: 'N/A',
      topModule: 'N/A',
    };
  }
}

export async function exportAuditLogs(format: 'csv' | 'json'): Promise<{ url: string }> {
  // TODO: Implement backend endpoint for export
  return { url: `https://example.com/audit-logs-export.${format}` };
}

export async function fetchLogDetails(logId: string): Promise<AuditLog | null> {
  try {
    const response = await apiRequest<{ success: boolean; data: AuditLog }>(`/admin/audit/logs/${logId}`);
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch log details:', error);
    return null;
  }
}
