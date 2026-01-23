import { Alert, AlertAuditLog } from './types';

const now = new Date();

export const INITIAL_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'Pricing',
    title: 'Pricing Conflict Detected',
    description: "SKU 'Organic Milk' has overlapping discounts in Campaign A and Campaign B, resulting in -5% margin.",
    severity: 'critical',
    status: 'New',
    createdAt: new Date(now.getTime() - 10 * 60000).toISOString(), // 10 mins ago
    updatedAt: new Date(now.getTime() - 10 * 60000).toISOString(),
    region: 'Global',
    linkedEntities: {
      skus: ['Organic Milk'],
      campaigns: [{ id: 'A', name: 'Summer Sale' }, { id: 'B', name: 'Dairy Promo' }]
    }
  },
  {
    id: '2',
    type: 'Stock',
    title: 'Stock Shortage Warning',
    description: "Promo item 'Chocolate Bar' is below safety stock in West End Hub. Campaign may stall.",
    severity: 'warning',
    status: 'New',
    createdAt: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
    updatedAt: new Date(now.getTime() - 60 * 60000).toISOString(),
    region: 'West End',
    linkedEntities: {
      skus: ['Chocolate Bar'],
      store: 'West End Hub'
    }
  },
  {
    id: '3',
    type: 'Campaign',
    title: 'Campaign Ending Soon',
    description: "'Summer Essentials' campaign ends in 24 hours. Review performance?",
    severity: 'info',
    status: 'New',
    createdAt: new Date(now.getTime() - 120 * 60000).toISOString(), // 2 hours ago
    updatedAt: new Date(now.getTime() - 120 * 60000).toISOString(),
    region: 'Global',
    linkedEntities: {
      campaigns: [{ id: 'C', name: 'Summer Essentials' }]
    }
  },
  {
    id: '4',
    type: 'System',
    title: 'Data Sync Delayed',
    description: "Inventory sync with SAP is delayed by 15 minutes.",
    severity: 'info',
    status: 'Resolved',
    createdAt: new Date(now.getTime() - 300 * 60000).toISOString(), // 5 hours ago
    updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
    region: 'Global',
    linkedEntities: {}
  }
];

export const MOCK_AUDIT_LOGS: AlertAuditLog[] = [
  {
    id: '1',
    alertId: '4',
    user: 'System',
    action: 'Alert Created',
    timestamp: new Date(now.getTime() - 300 * 60000).toISOString()
  },
  {
    id: '2',
    alertId: '4',
    user: 'Jane Doe',
    action: 'Marked as Resolved',
    timestamp: new Date(now.getTime() - 30 * 60000).toISOString()
  }
];
