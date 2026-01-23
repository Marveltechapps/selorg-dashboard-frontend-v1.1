import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface FraudAlert {
  id: string;
  alertNumber: string;
  type: 'promo_abuse' | 'fake_account' | 'payment_fraud' | 'velocity_breach' | 'device_fraud' | 'refund_abuse' | 'chargeback_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  customerId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  detectedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  assignedToName?: string;
  riskScore: number;
  evidence: FraudEvidence[];
  actions: string[];
  orderNumbers?: string[];
  amountInvolved?: number;
  deviceId?: string;
  ipAddress?: string;
  location?: string;
}

export interface FraudEvidence {
  id: string;
  type: 'transaction' | 'device' | 'behavior' | 'system' | 'manual';
  description: string;
  timestamp: string;
  data?: any;
}

export interface RiskProfile {
  id: string;
  entityType: 'customer' | 'device' | 'ip' | 'transaction';
  entityId: string;
  entityName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  totalOrders: number;
  totalSpent: number;
  refundRate: number;
  chargebackCount: number;
  accountAge: number; // in days
  lastActivity: string;
  flags: string[];
}

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface BlockedEntity {
  id: string;
  type: 'email' | 'phone' | 'ip' | 'device' | 'user';
  value: string;
  reason: string;
  blockedBy: string;
  blockedByName: string;
  blockedAt: string;
  expiresAt?: string;
  isPermanent: boolean;
  relatedAlerts: string[];
  notes?: string;
}

export interface FraudPattern {
  id: string;
  name: string;
  type: 'promo_abuse' | 'account_takeover' | 'payment_fraud' | 'refund_fraud' | 'velocity_abuse';
  description: string;
  occurrences: number;
  totalLoss: number;
  detectedCount: number;
  preventedCount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastDetected: string;
  affectedCustomers: number;
}

export interface Investigation {
  id: string;
  caseNumber: string;
  title: string;
  type: 'fraud' | 'abuse' | 'suspicious';
  status: 'open' | 'investigating' | 'pending_review' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  investigator?: string;
  investigatorName?: string;
  openedAt: string;
  closedAt?: string;
  customerId: string;
  customerName: string;
  totalLoss: number;
  evidence: FraudEvidence[];
  timeline: InvestigationTimeline[];
  outcome?: 'confirmed_fraud' | 'false_positive' | 'inconclusive';
}

export interface InvestigationTimeline {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details?: string;
}

export interface FraudRule {
  id: string;
  name: string;
  type: 'velocity' | 'amount' | 'device' | 'location' | 'behavior';
  condition: string;
  threshold: number;
  action: 'flag' | 'block' | 'review' | 'alert';
  isActive: boolean;
  priority: number;
  triggeredCount: number;
  falsePositiveRate: number;
  createdAt: string;
  lastTriggered?: string;
}

export interface Chargeback {
  id: string;
  chargebackId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  reason: string;
  status: 'received' | 'under_review' | 'accepted' | 'disputed' | 'won' | 'lost';
  receivedAt: string;
  dueDate: string;
  resolvedAt?: string;
  merchantNotes?: string;
  evidence?: string[];
}

export interface FraudMetrics {
  totalAlerts: number;
  openAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  totalLossPrevented: number;
  totalLossIncurred: number;
  averageRiskScore: number;
  blockedEntities: number;
  activeInvestigations: number;
  chargebackRate: number;
}

// --- Mock Data ---

let MOCK_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'alert-1',
    alertNumber: 'FRD-10045',
    type: 'promo_abuse',
    severity: 'high',
    status: 'investigating',
    customerId: 'cust-5001',
    customerName: 'Suspicious User A',
    customerEmail: 'fake.email.123@temp.com',
    description: 'Multiple accounts created from same device using different promo codes',
    detectedAt: '2024-12-20T11:30:00Z',
    assignedTo: 'agent-1',
    assignedToName: 'Fraud Team Lead',
    riskScore: 87,
    evidence: [
      { id: 'ev-1', type: 'device', description: '5 accounts created from device ID: DEVICE_ABC123', timestamp: '2024-12-20T11:25:00Z' },
      { id: 'ev-2', type: 'behavior', description: 'All accounts used promo codes within 2 hours', timestamp: '2024-12-20T11:28:00Z' },
      { id: 'ev-3', type: 'transaction', description: 'Total discount claimed: ₹2,450', timestamp: '2024-12-20T11:30:00Z' },
    ],
    actions: ['Block device', 'Suspend accounts', 'Revoke discounts'],
    orderNumbers: ['ORD-78301', 'ORD-78302', 'ORD-78303', 'ORD-78304', 'ORD-78305'],
    amountInvolved: 2450,
    deviceId: 'DEVICE_ABC123',
    ipAddress: '192.168.1.100',
    location: 'Bangalore, India',
  },
  {
    id: 'alert-2',
    alertNumber: 'FRD-10044',
    type: 'payment_fraud',
    severity: 'critical',
    status: 'open',
    customerId: 'cust-5002',
    customerName: 'John Doe',
    customerEmail: 'john.doe@email.com',
    description: 'Multiple failed payment attempts followed by successful transaction',
    detectedAt: '2024-12-20T10:15:00Z',
    riskScore: 95,
    evidence: [
      { id: 'ev-4', type: 'transaction', description: '8 failed payment attempts in 5 minutes', timestamp: '2024-12-20T10:10:00Z' },
      { id: 'ev-5', type: 'transaction', description: 'Successful payment of ₹15,890 on 9th attempt', timestamp: '2024-12-20T10:15:00Z' },
      { id: 'ev-6', type: 'device', description: 'Device fingerprint mismatch with account history', timestamp: '2024-12-20T10:15:00Z' },
    ],
    actions: ['Hold order', 'Contact customer', 'Verify payment'],
    orderNumbers: ['ORD-78299'],
    amountInvolved: 15890,
    deviceId: 'DEVICE_XYZ789',
    ipAddress: '103.45.67.89',
    location: 'Mumbai, India',
  },
  {
    id: 'alert-3',
    alertNumber: 'FRD-10043',
    type: 'velocity_breach',
    severity: 'medium',
    status: 'resolved',
    customerId: 'cust-5003',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.w@email.com',
    description: '10 orders placed within 30 minutes exceeding velocity limit',
    detectedAt: '2024-12-20T09:00:00Z',
    resolvedAt: '2024-12-20T09:45:00Z',
    assignedTo: 'agent-2',
    assignedToName: 'Fraud Analyst',
    riskScore: 62,
    evidence: [
      { id: 'ev-7', type: 'behavior', description: '10 orders in 30 minutes (limit: 5)', timestamp: '2024-12-20T09:00:00Z' },
      { id: 'ev-8', type: 'manual', description: 'Customer contacted - confirmed legitimate bulk order for office', timestamp: '2024-12-20T09:30:00Z' },
    ],
    actions: ['Verified with customer', 'Increased velocity limit', 'Marked as false positive'],
    orderNumbers: ['ORD-78280', 'ORD-78281', 'ORD-78282', 'ORD-78283', 'ORD-78284', 'ORD-78285', 'ORD-78286', 'ORD-78287', 'ORD-78288', 'ORD-78289'],
    amountInvolved: 8750,
  },
  {
    id: 'alert-4',
    alertNumber: 'FRD-10042',
    type: 'refund_abuse',
    severity: 'high',
    status: 'investigating',
    customerId: 'cust-5004',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@email.com',
    description: 'High refund rate - 80% of orders cancelled within 1 hour',
    detectedAt: '2024-12-20T08:30:00Z',
    assignedTo: 'agent-1',
    assignedToName: 'Fraud Team Lead',
    riskScore: 78,
    evidence: [
      { id: 'ev-9', type: 'behavior', description: '16 out of 20 orders cancelled within 1 hour', timestamp: '2024-12-20T08:25:00Z' },
      { id: 'ev-10', type: 'transaction', description: 'Refund amount: ₹12,340', timestamp: '2024-12-20T08:28:00Z' },
      { id: 'ev-11', type: 'behavior', description: 'Pattern suggests testing payment methods', timestamp: '2024-12-20T08:30:00Z' },
    ],
    actions: ['Suspend refund processing', 'Review account history', 'Contact customer'],
    amountInvolved: 12340,
  },
  {
    id: 'alert-5',
    alertNumber: 'FRD-10041',
    type: 'fake_account',
    severity: 'medium',
    status: 'open',
    customerId: 'cust-5005',
    customerName: 'Test User 123',
    customerEmail: 'testuser123@tempmail.com',
    description: 'Account created with temporary email and suspicious patterns',
    detectedAt: '2024-12-20T07:45:00Z',
    riskScore: 71,
    evidence: [
      { id: 'ev-12', type: 'system', description: 'Email domain flagged as temporary/disposable', timestamp: '2024-12-20T07:45:00Z' },
      { id: 'ev-13', type: 'behavior', description: 'Account created and order placed within 2 minutes', timestamp: '2024-12-20T07:47:00Z' },
      { id: 'ev-14', type: 'device', description: 'VPN detected from IP address', timestamp: '2024-12-20T07:45:00Z' },
    ],
    actions: ['Flag account', 'Monitor activity', 'Verify phone number'],
    orderNumbers: ['ORD-78275'],
    amountInvolved: 890,
    ipAddress: '45.67.89.123',
    location: 'VPN - Location Hidden',
  },
];

let MOCK_RISK_PROFILES: RiskProfile[] = [
  {
    id: 'risk-1',
    entityType: 'customer',
    entityId: 'cust-5001',
    entityName: 'Suspicious User A',
    riskScore: 87,
    riskLevel: 'high',
    factors: [
      { name: 'Promo Abuse', score: 95, weight: 0.3, description: 'Multiple promo codes used from same device' },
      { name: 'Account Age', score: 85, weight: 0.15, description: 'Account created recently' },
      { name: 'Device Fingerprint', score: 90, weight: 0.25, description: 'Multiple accounts from same device' },
      { name: 'Order Velocity', score: 75, weight: 0.3, description: 'High order frequency' },
    ],
    totalOrders: 5,
    totalSpent: 2450,
    refundRate: 0,
    chargebackCount: 0,
    accountAge: 2,
    lastActivity: '2024-12-20T11:30:00Z',
    flags: ['promo_abuse', 'multi_account', 'suspicious_device'],
  },
  {
    id: 'risk-2',
    entityType: 'customer',
    entityId: 'cust-5002',
    entityName: 'John Doe',
    riskScore: 95,
    riskLevel: 'critical',
    factors: [
      { name: 'Payment Failure Rate', score: 98, weight: 0.35, description: '8 failed attempts before success' },
      { name: 'Device Mismatch', score: 92, weight: 0.25, description: 'New device not matching history' },
      { name: 'Transaction Amount', score: 88, weight: 0.2, description: 'Amount significantly higher than average' },
      { name: 'Geolocation Anomaly', score: 94, weight: 0.2, description: 'Login from unusual location' },
    ],
    totalOrders: 1,
    totalSpent: 15890,
    refundRate: 0,
    chargebackCount: 0,
    accountAge: 45,
    lastActivity: '2024-12-20T10:15:00Z',
    flags: ['payment_fraud', 'device_fraud', 'high_value'],
  },
  {
    id: 'risk-3',
    entityType: 'customer',
    entityId: 'cust-5004',
    entityName: 'Michael Chen',
    riskScore: 78,
    riskLevel: 'high',
    factors: [
      { name: 'Refund Rate', score: 95, weight: 0.4, description: '80% refund rate' },
      { name: 'Cancellation Pattern', score: 88, weight: 0.3, description: 'Consistent early cancellations' },
      { name: 'Payment Testing', score: 70, weight: 0.3, description: 'Multiple payment method changes' },
    ],
    totalOrders: 20,
    totalSpent: 15425,
    refundRate: 80,
    chargebackCount: 0,
    accountAge: 15,
    lastActivity: '2024-12-20T08:30:00Z',
    flags: ['refund_abuse', 'suspicious_behavior'],
  },
];

let MOCK_BLOCKED_ENTITIES: BlockedEntity[] = [
  { id: 'block-1', type: 'device', value: 'DEVICE_FRAUD_001', reason: 'Multiple fake accounts created', blockedBy: 'agent-1', blockedByName: 'Fraud Team Lead', blockedAt: '2024-12-19T14:00:00Z', isPermanent: true, relatedAlerts: ['FRD-10020', 'FRD-10021'], notes: 'Blocked after confirmed promo abuse pattern' },
  { id: 'block-2', type: 'email', value: 'scammer@fake.com', reason: 'Confirmed fraud activity', blockedBy: 'agent-1', blockedByName: 'Fraud Team Lead', blockedAt: '2024-12-18T10:30:00Z', isPermanent: true, relatedAlerts: ['FRD-10015'], notes: 'Payment fraud - multiple chargebacks' },
  { id: 'block-3', type: 'phone', value: '+91-99999-00000', reason: 'Used in multiple fake accounts', blockedBy: 'agent-2', blockedByName: 'Fraud Analyst', blockedAt: '2024-12-17T16:45:00Z', isPermanent: false, expiresAt: '2025-01-17T16:45:00Z', relatedAlerts: ['FRD-10010', 'FRD-10011'], notes: 'Temporary block - 30 days' },
  { id: 'block-4', type: 'ip', value: '45.67.89.100', reason: 'VPN used for suspicious activity', blockedBy: 'agent-2', blockedByName: 'Fraud Analyst', blockedAt: '2024-12-20T09:00:00Z', isPermanent: false, expiresAt: '2024-12-27T09:00:00Z', relatedAlerts: ['FRD-10041'], notes: 'VPN IP - 7 day block' },
  { id: 'block-5', type: 'user', value: 'cust-4999', reason: 'Repeated refund abuse', blockedBy: 'agent-1', blockedByName: 'Fraud Team Lead', blockedAt: '2024-12-16T12:00:00Z', isPermanent: true, relatedAlerts: ['FRD-10005'], notes: 'Permanent account suspension' },
];

let MOCK_FRAUD_PATTERNS: FraudPattern[] = [
  { id: 'pattern-1', name: 'Promo Code Farming', type: 'promo_abuse', description: 'Multiple accounts created from same device to abuse welcome offers', occurrences: 23, totalLoss: 34560, detectedCount: 23, preventedCount: 18, trend: 'decreasing', lastDetected: '2024-12-20T11:30:00Z', affectedCustomers: 23 },
  { id: 'pattern-2', name: 'Payment Card Testing', type: 'payment_fraud', description: 'Multiple failed payment attempts testing stolen cards', occurrences: 12, totalLoss: 89340, detectedCount: 12, preventedCount: 10, trend: 'stable', lastDetected: '2024-12-20T10:15:00Z', affectedCustomers: 12 },
  { id: 'pattern-3', name: 'Refund Manipulation', type: 'refund_fraud', description: 'Users claiming wrong items delivered to get refunds', occurrences: 8, totalLoss: 12450, detectedCount: 8, preventedCount: 5, trend: 'increasing', lastDetected: '2024-12-20T08:30:00Z', affectedCustomers: 8 },
  { id: 'pattern-4', name: 'Account Takeover', type: 'account_takeover', description: 'Compromised accounts used for unauthorized purchases', occurrences: 5, totalLoss: 45600, detectedCount: 5, preventedCount: 4, trend: 'stable', lastDetected: '2024-12-19T18:00:00Z', affectedCustomers: 5 },
];

let MOCK_INVESTIGATIONS: Investigation[] = [
  {
    id: 'inv-1',
    caseNumber: 'INV-2024-045',
    title: 'Organized Promo Abuse Ring',
    type: 'fraud',
    status: 'investigating',
    priority: 'high',
    investigator: 'agent-1',
    investigatorName: 'Fraud Team Lead',
    openedAt: '2024-12-20T11:30:00Z',
    customerId: 'cust-5001',
    customerName: 'Suspicious User A',
    totalLoss: 2450,
    evidence: [
      { id: 'inv-ev-1', type: 'device', description: '5 linked accounts from same device', timestamp: '2024-12-20T11:25:00Z' },
      { id: 'inv-ev-2', type: 'behavior', description: 'Coordinated promo code usage', timestamp: '2024-12-20T11:28:00Z' },
    ],
    timeline: [
      { id: 'inv-time-1', action: 'Case opened', performedBy: 'system', performedByName: 'Automated System', timestamp: '2024-12-20T11:30:00Z' },
      { id: 'inv-time-2', action: 'Assigned to investigator', performedBy: 'agent-1', performedByName: 'Fraud Team Lead', timestamp: '2024-12-20T11:35:00Z' },
      { id: 'inv-time-3', action: 'Device blocked', performedBy: 'agent-1', performedByName: 'Fraud Team Lead', timestamp: '2024-12-20T11:40:00Z', details: 'Blocked DEVICE_ABC123' },
    ],
  },
  {
    id: 'inv-2',
    caseNumber: 'INV-2024-044',
    title: 'Payment Fraud Investigation',
    type: 'fraud',
    status: 'pending_review',
    priority: 'critical',
    investigator: 'agent-2',
    investigatorName: 'Fraud Analyst',
    openedAt: '2024-12-20T10:15:00Z',
    customerId: 'cust-5002',
    customerName: 'John Doe',
    totalLoss: 15890,
    evidence: [
      { id: 'inv-ev-3', type: 'transaction', description: 'Multiple payment failures before success', timestamp: '2024-12-20T10:10:00Z' },
      { id: 'inv-ev-4', type: 'device', description: 'Device fingerprint anomaly', timestamp: '2024-12-20T10:15:00Z' },
    ],
    timeline: [
      { id: 'inv-time-4', action: 'Alert triggered', performedBy: 'system', performedByName: 'Automated System', timestamp: '2024-12-20T10:15:00Z' },
      { id: 'inv-time-5', action: 'Order held for review', performedBy: 'agent-2', performedByName: 'Fraud Analyst', timestamp: '2024-12-20T10:20:00Z' },
    ],
  },
];

let MOCK_FRAUD_RULES: FraudRule[] = [
  { id: 'rule-1', name: 'Velocity Limit - Orders', type: 'velocity', condition: 'Orders per hour > threshold', threshold: 5, action: 'flag', isActive: true, priority: 1, triggeredCount: 145, falsePositiveRate: 12, createdAt: '2024-01-01T00:00:00Z', lastTriggered: '2024-12-20T09:00:00Z' },
  { id: 'rule-2', name: 'High Value Transaction', type: 'amount', condition: 'Order amount > threshold', threshold: 10000, action: 'review', isActive: true, priority: 2, triggeredCount: 89, falsePositiveRate: 8, createdAt: '2024-01-01T00:00:00Z', lastTriggered: '2024-12-20T10:15:00Z' },
  { id: 'rule-3', name: 'Multiple Device Accounts', type: 'device', condition: 'Accounts per device > threshold', threshold: 3, action: 'block', isActive: true, priority: 1, triggeredCount: 56, falsePositiveRate: 5, createdAt: '2024-01-01T00:00:00Z', lastTriggered: '2024-12-20T11:30:00Z' },
  { id: 'rule-4', name: 'Payment Failure Rate', type: 'behavior', condition: 'Failed payments > threshold', threshold: 5, action: 'alert', isActive: true, priority: 1, triggeredCount: 234, falsePositiveRate: 15, createdAt: '2024-01-01T00:00:00Z', lastTriggered: '2024-12-20T10:15:00Z' },
  { id: 'rule-5', name: 'Geolocation Change', type: 'location', condition: 'Location change > threshold km', threshold: 500, action: 'flag', isActive: false, priority: 3, triggeredCount: 67, falsePositiveRate: 45, createdAt: '2024-01-01T00:00:00Z', lastTriggered: '2024-12-19T14:00:00Z' },
];

let MOCK_CHARGEBACKS: Chargeback[] = [
  { id: 'cb-1', chargebackId: 'CB-2024-089', orderId: 'ORD-78150', customerId: 'cust-4500', customerName: 'Dispute Customer 1', amount: 2890, reason: 'Product not received', status: 'under_review', receivedAt: '2024-12-18T10:00:00Z', dueDate: '2024-12-25T10:00:00Z', merchantNotes: 'Delivery confirmed with signature - gathering evidence' },
  { id: 'cb-2', chargebackId: 'CB-2024-088', orderId: 'ORD-78120', customerId: 'cust-4501', customerName: 'Dispute Customer 2', amount: 5670, reason: 'Unauthorized transaction', status: 'disputed', receivedAt: '2024-12-15T14:30:00Z', dueDate: '2024-12-22T14:30:00Z', merchantNotes: 'Customer confirmed order via app - submitted proof', evidence: ['Order screenshot', 'OTP verification log', 'Delivery photo'] },
  { id: 'cb-3', chargebackId: 'CB-2024-087', orderId: 'ORD-78090', customerId: 'cust-4502', customerName: 'Dispute Customer 3', amount: 1240, reason: 'Item not as described', status: 'won', receivedAt: '2024-12-10T09:00:00Z', dueDate: '2024-12-17T09:00:00Z', resolvedAt: '2024-12-16T15:00:00Z', merchantNotes: 'Customer withdrew dispute after reviewing product details' },
];

const MOCK_FRAUD_METRICS: FraudMetrics = {
  totalAlerts: 145,
  openAlerts: 12,
  resolvedAlerts: 98,
  falsePositives: 35,
  totalLossPrevented: 234560,
  totalLossIncurred: 45890,
  averageRiskScore: 64,
  blockedEntities: 128,
  activeInvestigations: 8,
  chargebackRate: 0.8,
};

// --- API Functions ---

export async function fetchFraudAlerts(filters?: { status?: string; severity?: string; type?: string }): Promise<FraudAlert[]> {
  // TODO: Implement backend endpoint for fraud alerts
  return [];
}

export async function updateFraudAlert(id: string, data: Partial<FraudAlert>): Promise<FraudAlert> {
  // TODO: Implement backend endpoint for fraud alerts
  throw new Error('Not implemented');
}

export async function fetchRiskProfiles(): Promise<RiskProfile[]> {
  // TODO: Implement backend endpoint for risk profiles
  return [];
}

export async function fetchBlockedEntities(): Promise<BlockedEntity[]> {
  // TODO: Implement backend endpoint for blocked entities
  return [];
}

export async function blockEntity(data: Omit<BlockedEntity, 'id' | 'blockedAt'>): Promise<BlockedEntity> {
  // TODO: Implement backend endpoint for blocking entities
  throw new Error('Not implemented');
}

export async function unblockEntity(id: string): Promise<void> {
  // TODO: Implement backend endpoint for unblocking entities
  throw new Error('Not implemented');
}

export async function fetchFraudPatterns(): Promise<FraudPattern[]> {
  // TODO: Implement backend endpoint for fraud patterns
  return [];
}

export async function fetchInvestigations(): Promise<Investigation[]> {
  // TODO: Implement backend endpoint for investigations
  return [];
}

export async function fetchFraudRules(): Promise<FraudRule[]> {
  // TODO: Implement backend endpoint for fraud rules
  return [];
}

export async function toggleFraudRule(id: string): Promise<FraudRule> {
  // TODO: Implement backend endpoint for toggling fraud rules
  throw new Error('Not implemented');
}

export async function fetchChargebacks(): Promise<Chargeback[]> {
  // TODO: Implement backend endpoint for chargebacks
  return [];
}

export async function updateChargeback(id: string, data: Partial<Chargeback>): Promise<Chargeback> {
  // TODO: Implement backend endpoint for chargebacks
  throw new Error('Not implemented');
}

export async function fetchFraudMetrics(): Promise<FraudMetrics> {
  // TODO: Implement backend endpoint for fraud metrics
  return {
    totalAlerts: 0,
    highRiskAlerts: 0,
    blockedEntities: 0,
    totalLoss: 0,
    preventedLoss: 0,
    falsePositiveRate: 0,
    avgResolutionTime: 0,
  };
}
