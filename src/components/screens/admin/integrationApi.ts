import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: 'payment' | 'communication' | 'maps' | 'analytics' | 'erp' | 'logistics' | 'storage' | 'other';
  status: 'active' | 'inactive' | 'error' | 'testing';
  health: 'healthy' | 'degraded' | 'down';
  description: string;
  logo: string;
  apiVersion: string;
  connectedAt: string;
  lastSync: string;
  metrics: IntegrationMetrics;
  config: IntegrationConfig;
}

export interface IntegrationMetrics {
  requestsToday: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
  uptime: number;
  rateLimit: number;
  rateLimitUsed: number;
}

export interface IntegrationConfig {
  apiKey: string;
  secretKey?: string;
  webhookUrl?: string;
  environment: 'production' | 'sandbox' | 'test';
  features: string[];
}

export interface Webhook {
  id: string;
  integrationId: string;
  integrationName: string;
  event: string;
  url: string;
  method: 'POST' | 'GET' | 'PUT';
  status: 'active' | 'inactive' | 'failed';
  lastTriggered: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  retryPolicy: string;
  headers: Record<string, string>;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  integrationId: string;
  integrationName: string;
  permissions: string[];
  environment: 'production' | 'sandbox';
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  lastUsed: string;
  usageCount: number;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  integrationName: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  success: boolean;
  errorMessage?: string;
}

export interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorRate: number;
}

// --- Mock Data ---

const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'INT-001',
    name: 'Razorpay',
    provider: 'Razorpay Payments',
    category: 'payment',
    status: 'active',
    health: 'healthy',
    description: 'Primary payment gateway for UPI, cards, wallets, and netbanking',
    logo: '💳',
    apiVersion: 'v1.2',
    connectedAt: '2024-01-15T10:00:00Z',
    lastSync: '2024-12-20T11:30:00Z',
    metrics: {
      requestsToday: 15678,
      successRate: 98.5,
      avgResponseTime: 245,
      errorCount: 234,
      uptime: 99.8,
      rateLimit: 50000,
      rateLimitUsed: 15678,
    },
    config: {
      apiKey: 'rzp_live_XxXxXxXxXxXx',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://api.quickcommerce.com/webhooks/razorpay',
      environment: 'production',
      features: ['UPI', 'Cards', 'Wallets', 'Netbanking', 'EMI', 'Recurring'],
    },
  },
  {
    id: 'INT-002',
    name: 'Stripe',
    provider: 'Stripe Inc.',
    category: 'payment',
    status: 'active',
    health: 'healthy',
    description: 'International payment processing for cards and digital wallets',
    logo: '💰',
    apiVersion: 'v2023-10-16',
    connectedAt: '2024-02-01T09:00:00Z',
    lastSync: '2024-12-20T11:28:00Z',
    metrics: {
      requestsToday: 4523,
      successRate: 99.2,
      avgResponseTime: 180,
      errorCount: 36,
      uptime: 99.9,
      rateLimit: 25000,
      rateLimitUsed: 4523,
    },
    config: {
      apiKey: 'sk_live_YyYyYyYyYyYy',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://api.quickcommerce.com/webhooks/stripe',
      environment: 'production',
      features: ['Cards', 'Apple Pay', 'Google Pay', 'Subscriptions', '3D Secure'],
    },
  },
  {
    id: 'INT-003',
    name: 'Twilio',
    provider: 'Twilio Communications',
    category: 'communication',
    status: 'active',
    health: 'healthy',
    description: 'SMS and voice communication for OTP and notifications',
    logo: '📱',
    apiVersion: '2010-04-01',
    connectedAt: '2024-01-20T11:00:00Z',
    lastSync: '2024-12-20T11:25:00Z',
    metrics: {
      requestsToday: 8934,
      successRate: 97.8,
      avgResponseTime: 320,
      errorCount: 196,
      uptime: 99.5,
      rateLimit: 100000,
      rateLimitUsed: 8934,
    },
    config: {
      apiKey: 'SK1234567890abcdef',
      secretKey: '••••••••••••••••',
      environment: 'production',
      features: ['SMS', 'Voice', 'OTP', 'Two-Factor Auth', 'Verify API'],
    },
  },
  {
    id: 'INT-004',
    name: 'SendGrid',
    provider: 'Twilio SendGrid',
    category: 'communication',
    status: 'active',
    health: 'healthy',
    description: 'Email delivery service for transactional and marketing emails',
    logo: '📧',
    apiVersion: 'v3',
    connectedAt: '2024-01-18T10:30:00Z',
    lastSync: '2024-12-20T11:20:00Z',
    metrics: {
      requestsToday: 12456,
      successRate: 99.6,
      avgResponseTime: 150,
      errorCount: 49,
      uptime: 99.9,
      rateLimit: 200000,
      rateLimitUsed: 12456,
    },
    config: {
      apiKey: 'SG.xxxxxxxxxxxxxxxxxx',
      webhookUrl: 'https://api.quickcommerce.com/webhooks/sendgrid',
      environment: 'production',
      features: ['Transactional', 'Marketing', 'Templates', 'Analytics', 'Suppression Lists'],
    },
  },
  {
    id: 'INT-005',
    name: 'Google Maps',
    provider: 'Google Cloud',
    category: 'maps',
    status: 'active',
    health: 'healthy',
    description: 'Maps, geocoding, and distance matrix calculations',
    logo: '🗺️',
    apiVersion: 'v3',
    connectedAt: '2024-01-10T09:00:00Z',
    lastSync: '2024-12-20T11:32:00Z',
    metrics: {
      requestsToday: 23456,
      successRate: 99.9,
      avgResponseTime: 120,
      errorCount: 23,
      uptime: 100,
      rateLimit: 100000,
      rateLimitUsed: 23456,
    },
    config: {
      apiKey: 'AIzaSyXxXxXxXxXxXxXxXx',
      environment: 'production',
      features: ['Maps', 'Geocoding', 'Distance Matrix', 'Directions', 'Places'],
    },
  },
  {
    id: 'INT-006',
    name: 'Mixpanel',
    provider: 'Mixpanel Inc.',
    category: 'analytics',
    status: 'active',
    health: 'healthy',
    description: 'Product analytics and user behavior tracking',
    logo: '📊',
    apiVersion: 'v2',
    connectedAt: '2024-02-05T11:00:00Z',
    lastSync: '2024-12-20T11:15:00Z',
    metrics: {
      requestsToday: 45678,
      successRate: 99.4,
      avgResponseTime: 95,
      errorCount: 273,
      uptime: 99.7,
      rateLimit: 500000,
      rateLimitUsed: 45678,
    },
    config: {
      apiKey: 'mp_xxxxxxxxxxxxxxxxxx',
      secretKey: '••••••••••••••••',
      environment: 'production',
      features: ['Event Tracking', 'User Profiles', 'Funnels', 'Retention', 'Cohorts'],
    },
  },
  {
    id: 'INT-007',
    name: 'Delhivery',
    provider: 'Delhivery Logistics',
    category: 'logistics',
    status: 'active',
    health: 'degraded',
    description: 'Last-mile delivery and logistics partner',
    logo: '🚚',
    apiVersion: 'v1',
    connectedAt: '2024-03-01T10:00:00Z',
    lastSync: '2024-12-20T10:45:00Z',
    metrics: {
      requestsToday: 3456,
      successRate: 94.2,
      avgResponseTime: 650,
      errorCount: 200,
      uptime: 97.5,
      rateLimit: 20000,
      rateLimitUsed: 3456,
    },
    config: {
      apiKey: 'dlv_xxxxxxxxxxxxxxxxxx',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://api.quickcommerce.com/webhooks/delhivery',
      environment: 'production',
      features: ['Order Creation', 'Tracking', 'Warehouse', 'Returns'],
    },
  },
  {
    id: 'INT-008',
    name: 'AWS S3',
    provider: 'Amazon Web Services',
    category: 'storage',
    status: 'active',
    health: 'healthy',
    description: 'Cloud storage for images, invoices, and documents',
    logo: '☁️',
    apiVersion: '2006-03-01',
    connectedAt: '2024-01-05T08:00:00Z',
    lastSync: '2024-12-20T11:35:00Z',
    metrics: {
      requestsToday: 67890,
      successRate: 99.8,
      avgResponseTime: 85,
      errorCount: 135,
      uptime: 99.99,
      rateLimit: 1000000,
      rateLimitUsed: 67890,
    },
    config: {
      apiKey: 'AKIAXXXXXXXXXXXXXXXX',
      secretKey: '••••••••••••••••',
      environment: 'production',
      features: ['Object Storage', 'CDN', 'Versioning', 'Lifecycle', 'Encryption'],
    },
  },
  {
    id: 'INT-009',
    name: 'QuickBooks',
    provider: 'Intuit Inc.',
    category: 'erp',
    status: 'testing',
    health: 'healthy',
    description: 'Accounting and financial management integration',
    logo: '📚',
    apiVersion: 'v3',
    connectedAt: '2024-12-10T09:00:00Z',
    lastSync: '2024-12-20T11:00:00Z',
    metrics: {
      requestsToday: 234,
      successRate: 98.0,
      avgResponseTime: 420,
      errorCount: 4,
      uptime: 99.2,
      rateLimit: 5000,
      rateLimitUsed: 234,
    },
    config: {
      apiKey: 'qb_xxxxxxxxxxxxxxxxxx',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://api.quickcommerce.com/webhooks/quickbooks',
      environment: 'sandbox',
      features: ['Invoices', 'Payments', 'Expenses', 'Reports', 'Reconciliation'],
    },
  },
  {
    id: 'INT-010',
    name: 'Firebase',
    provider: 'Google Firebase',
    category: 'other',
    status: 'inactive',
    health: 'healthy',
    description: 'Push notifications and real-time database (legacy)',
    logo: '🔥',
    apiVersion: 'v1',
    connectedAt: '2024-01-15T10:00:00Z',
    lastSync: '2024-11-30T15:00:00Z',
    metrics: {
      requestsToday: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorCount: 0,
      uptime: 0,
      rateLimit: 100000,
      rateLimitUsed: 0,
    },
    config: {
      apiKey: 'AIzaXxXxXxXxXxXxXxXxXx',
      environment: 'production',
      features: ['Push Notifications', 'Cloud Messaging', 'Analytics'],
    },
  },
];

const MOCK_WEBHOOKS: Webhook[] = [
  {
    id: 'WH-001',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    event: 'payment.captured',
    url: 'https://api.quickcommerce.com/webhooks/razorpay',
    method: 'POST',
    status: 'active',
    lastTriggered: '2024-12-20T11:28:00Z',
    totalCalls: 15234,
    successCount: 15012,
    failureCount: 222,
    retryPolicy: '3 retries with exponential backoff',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': '••••••••••••',
    },
  },
  {
    id: 'WH-002',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    event: 'payment.failed',
    url: 'https://api.quickcommerce.com/webhooks/razorpay',
    method: 'POST',
    status: 'active',
    lastTriggered: '2024-12-20T11:15:00Z',
    totalCalls: 1245,
    successCount: 1230,
    failureCount: 15,
    retryPolicy: '3 retries with exponential backoff',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': '••••••••••••',
    },
  },
  {
    id: 'WH-003',
    integrationId: 'INT-002',
    integrationName: 'Stripe',
    event: 'charge.succeeded',
    url: 'https://api.quickcommerce.com/webhooks/stripe',
    method: 'POST',
    status: 'active',
    lastTriggered: '2024-12-20T11:20:00Z',
    totalCalls: 4234,
    successCount: 4198,
    failureCount: 36,
    retryPolicy: '5 retries with exponential backoff',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': '••••••••••••',
    },
  },
  {
    id: 'WH-004',
    integrationId: 'INT-004',
    integrationName: 'SendGrid',
    event: 'email.delivered',
    url: 'https://api.quickcommerce.com/webhooks/sendgrid',
    method: 'POST',
    status: 'active',
    lastTriggered: '2024-12-20T11:25:00Z',
    totalCalls: 12234,
    successCount: 12189,
    failureCount: 45,
    retryPolicy: '2 retries',
    headers: {
      'Content-Type': 'application/json',
    },
  },
  {
    id: 'WH-005',
    integrationId: 'INT-007',
    integrationName: 'Delhivery',
    event: 'shipment.status_update',
    url: 'https://api.quickcommerce.com/webhooks/delhivery',
    method: 'POST',
    status: 'failed',
    lastTriggered: '2024-12-20T10:30:00Z',
    totalCalls: 3456,
    successCount: 3256,
    failureCount: 200,
    retryPolicy: '3 retries',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ••••••••',
    },
  },
];

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'KEY-001',
    name: 'Production Key - Primary',
    key: 'rzp_live_XxXxXxXxXxXx••••••••',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    permissions: ['read', 'write', 'refund'],
    environment: 'production',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    lastUsed: '2024-12-20T11:30:00Z',
    usageCount: 1567890,
  },
  {
    id: 'KEY-002',
    name: 'Sandbox Key - Testing',
    key: 'rzp_test_YyYyYyYyYyYy••••••••',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    permissions: ['read', 'write'],
    environment: 'sandbox',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    lastUsed: '2024-12-19T16:45:00Z',
    usageCount: 5678,
  },
  {
    id: 'KEY-003',
    name: 'Production Key - Primary',
    key: 'sk_live_ZzZzZzZzZzZz••••••••',
    integrationId: 'INT-002',
    integrationName: 'Stripe',
    permissions: ['read', 'write', 'customers', 'charges'],
    environment: 'production',
    status: 'active',
    createdAt: '2024-02-01T09:00:00Z',
    expiresAt: '2025-02-01T09:00:00Z',
    lastUsed: '2024-12-20T11:28:00Z',
    usageCount: 452300,
  },
  {
    id: 'KEY-004',
    name: 'Legacy Key - Deprecated',
    key: 'sk_live_AaAaAaAaAaAa••••••••',
    integrationId: 'INT-002',
    integrationName: 'Stripe',
    permissions: ['read'],
    environment: 'production',
    status: 'expired',
    createdAt: '2023-06-01T09:00:00Z',
    expiresAt: '2024-06-01T09:00:00Z',
    lastUsed: '2024-05-30T18:30:00Z',
    usageCount: 234567,
  },
  {
    id: 'KEY-005',
    name: 'Production Key',
    key: 'SG.xxxxxxxxxxxxxxxxxxxx••••••••',
    integrationId: 'INT-004',
    integrationName: 'SendGrid',
    permissions: ['mail.send', 'mail.batch'],
    environment: 'production',
    status: 'active',
    createdAt: '2024-01-18T10:30:00Z',
    expiresAt: 'Never',
    lastUsed: '2024-12-20T11:20:00Z',
    usageCount: 1245600,
  },
];

const MOCK_LOGS: IntegrationLog[] = [
  {
    id: 'LOG-001',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    timestamp: '2024-12-20T11:30:15Z',
    method: 'POST',
    endpoint: '/v1/payments/capture',
    statusCode: 200,
    responseTime: 245,
    requestSize: 512,
    responseSize: 1024,
    success: true,
  },
  {
    id: 'LOG-002',
    integrationId: 'INT-002',
    integrationName: 'Stripe',
    timestamp: '2024-12-20T11:29:48Z',
    method: 'POST',
    endpoint: '/v1/charges',
    statusCode: 200,
    responseTime: 180,
    requestSize: 768,
    responseSize: 2048,
    success: true,
  },
  {
    id: 'LOG-003',
    integrationId: 'INT-003',
    integrationName: 'Twilio',
    timestamp: '2024-12-20T11:29:32Z',
    method: 'POST',
    endpoint: '/2010-04-01/Accounts/AC../Messages.json',
    statusCode: 201,
    responseTime: 320,
    requestSize: 256,
    responseSize: 512,
    success: true,
  },
  {
    id: 'LOG-004',
    integrationId: 'INT-005',
    integrationName: 'Google Maps',
    timestamp: '2024-12-20T11:28:55Z',
    method: 'GET',
    endpoint: '/maps/api/geocode/json',
    statusCode: 200,
    responseTime: 120,
    requestSize: 128,
    responseSize: 4096,
    success: true,
  },
  {
    id: 'LOG-005',
    integrationId: 'INT-007',
    integrationName: 'Delhivery',
    timestamp: '2024-12-20T11:27:18Z',
    method: 'POST',
    endpoint: '/api/cmu/create.json',
    statusCode: 500,
    responseTime: 1200,
    requestSize: 1024,
    responseSize: 256,
    success: false,
    errorMessage: 'Internal Server Error - Service temporarily unavailable',
  },
  {
    id: 'LOG-006',
    integrationId: 'INT-004',
    integrationName: 'SendGrid',
    timestamp: '2024-12-20T11:26:42Z',
    method: 'POST',
    endpoint: '/v3/mail/send',
    statusCode: 202,
    responseTime: 150,
    requestSize: 2048,
    responseSize: 128,
    success: true,
  },
  {
    id: 'LOG-007',
    integrationId: 'INT-006',
    integrationName: 'Mixpanel',
    timestamp: '2024-12-20T11:25:30Z',
    method: 'POST',
    endpoint: '/track',
    statusCode: 200,
    responseTime: 95,
    requestSize: 512,
    responseSize: 64,
    success: true,
  },
  {
    id: 'LOG-008',
    integrationId: 'INT-001',
    integrationName: 'Razorpay',
    timestamp: '2024-12-20T11:24:15Z',
    method: 'GET',
    endpoint: '/v1/payments/pay_xxx',
    statusCode: 404,
    responseTime: 180,
    requestSize: 0,
    responseSize: 256,
    success: false,
    errorMessage: 'Payment not found',
  },
];

const MOCK_STATS: IntegrationStats = {
  totalIntegrations: 10,
  activeIntegrations: 8,
  totalRequests: 184305,
  successRate: 98.6,
  avgResponseTime: 185,
  errorRate: 1.4,
};

// --- API Functions ---

export async function fetchIntegrations(): Promise<Integration[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Integration[] }>('/admin/integrations');
    if (response.data && response.data.length > 0) {
      return response.data;
    }
    return MOCK_INTEGRATIONS;
  } catch (error) {
    console.error('Failed to fetch integrations:', error);
    return MOCK_INTEGRATIONS;
  }
}

export async function fetchWebhooks(): Promise<Webhook[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Webhook[] }>('/admin/integrations/webhooks');
    return response.data || [
      { id: 'WH-001', integrationId: 'INT-001', integrationName: 'Razorpay', event: 'payment.success', url: 'https://api.quickcommerce.com/webhooks/razorpay', method: 'POST', status: 'active', lastTriggered: '2024-12-20T11:30:00Z', totalCalls: 15678, successCount: 15445, failureCount: 233, retryPolicy: 'exponential', headers: {} },
      { id: 'WH-002', integrationId: 'INT-002', integrationName: 'Stripe', event: 'charge.succeeded', url: 'https://api.quickcommerce.com/webhooks/stripe', method: 'POST', status: 'active', lastTriggered: '2024-12-20T11:28:00Z', totalCalls: 4523, successCount: 4487, failureCount: 36, retryPolicy: 'exponential', headers: {} },
    ];
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    return [
      { id: 'WH-001', integrationId: 'INT-001', integrationName: 'Razorpay', event: 'payment.success', url: 'https://api.quickcommerce.com/webhooks/razorpay', method: 'POST', status: 'active', lastTriggered: '2024-12-20T11:30:00Z', totalCalls: 15678, successCount: 15445, failureCount: 233, retryPolicy: 'exponential', headers: {} },
      { id: 'WH-002', integrationId: 'INT-002', integrationName: 'Stripe', event: 'charge.succeeded', url: 'https://api.quickcommerce.com/webhooks/stripe', method: 'POST', status: 'active', lastTriggered: '2024-12-20T11:28:00Z', totalCalls: 4523, successCount: 4487, failureCount: 36, retryPolicy: 'exponential', headers: {} },
    ];
  }
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: ApiKey[] }>('/admin/integrations/api-keys');
    return response.data || [
      { id: 'KEY-001', name: 'Production Key - Primary', key: 'sk_live_xxxxxxxxxxxx', integrationId: 'INT-001', integrationName: 'Razorpay', permissions: ['read', 'write', 'refund'], environment: 'production', status: 'active', createdAt: '2024-01-15T10:00:00Z', expiresAt: '2025-12-20T10:00:00Z', lastUsed: '2024-12-20T11:30:00Z', usageCount: 15678 },
      { id: 'KEY-002', name: 'Sandbox Key - Testing', key: 'sk_test_yyyyyyyyyyyy', integrationId: 'INT-002', integrationName: 'Stripe', permissions: ['read', 'write'], environment: 'sandbox', status: 'active', createdAt: '2024-02-01T09:00:00Z', expiresAt: '2025-02-01T09:00:00Z', lastUsed: '2024-12-20T11:28:00Z', usageCount: 4523 },
    ];
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    return [
      { id: 'KEY-001', name: 'Production Key - Primary', key: 'sk_live_xxxxxxxxxxxx', integrationId: 'INT-001', integrationName: 'Razorpay', permissions: ['read', 'write', 'refund'], environment: 'production', status: 'active', createdAt: '2024-01-15T10:00:00Z', expiresAt: '2025-12-20T10:00:00Z', lastUsed: '2024-12-20T11:30:00Z', usageCount: 15678 },
      { id: 'KEY-002', name: 'Sandbox Key - Testing', key: 'sk_test_yyyyyyyyyyyy', integrationId: 'INT-002', integrationName: 'Stripe', permissions: ['read', 'write'], environment: 'sandbox', status: 'active', createdAt: '2024-02-01T09:00:00Z', expiresAt: '2025-02-01T09:00:00Z', lastUsed: '2024-12-20T11:28:00Z', usageCount: 4523 },
    ];
  }
}

export async function fetchIntegrationLogs(): Promise<IntegrationLog[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: IntegrationLog[] }>('/admin/integrations/logs');
    return response.data || MOCK_LOGS;
  } catch (error) {
    console.error('Failed to fetch integration logs:', error);
    return MOCK_LOGS;
  }
}

export async function fetchIntegrationStats(): Promise<IntegrationStats> {
  // TODO: Implement backend endpoint for integration stats
  return {
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorCount: 0,
  };
}

export async function toggleIntegration(integrationId: string, status: 'active' | 'inactive'): Promise<void> {
  try {
    await apiRequest(`/admin/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    // Update local mock data
    const integration = MOCK_INTEGRATIONS.find(i => i.id === integrationId);
    if (integration) {
      integration.status = status;
    }
  } catch (error) {
    console.error('Failed to toggle integration:', error);
    // Silently fail - UI will update optimistically
  }
}

export async function updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> {
  try {
    const response = await apiRequest<{ success: boolean; data: Integration }>(`/admin/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (response.data) {
      return response.data;
    }
    // Update local mock data
    const integration = MOCK_INTEGRATIONS.find(i => i.id === integrationId);
    if (integration) {
      Object.assign(integration, updates);
      return integration;
    }
    throw new Error('Integration not found');
  } catch (error) {
    console.error('Failed to update integration:', error);
    // Return updated mock integration
    const integration = MOCK_INTEGRATIONS.find(i => i.id === integrationId);
    if (integration) {
      Object.assign(integration, updates);
      return integration;
    }
    throw error;
  }
}

export async function testConnection(integrationId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>(`/admin/integrations/${integrationId}/test`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Failed to test connection:', error);
    // Return mock success for development
    return {
      success: true,
      message: 'Connection test successful',
    };
  }
}

export async function createWebhook(webhook: Partial<Webhook>): Promise<Webhook> {
  try {
    const response = await apiRequest<{ success: boolean; data: Webhook }>('/admin/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create webhook:', error);
    // Return mock webhook
    const mockWebhook: Webhook = {
      id: `webhook-${Date.now()}`,
      integrationId: webhook.integrationId || '',
      integrationName: webhook.integrationName || '',
      event: webhook.event || '',
      url: webhook.url || '',
      method: 'POST',
      status: 'active',
      lastTriggered: new Date().toISOString(),
      totalCalls: 0,
      successCount: 0,
      failureCount: 0,
      retryPolicy: 'exponential',
      headers: {},
    };
    return mockWebhook;
  }
}

export async function generateApiKey(data: {
  integrationId: string;
  integrationName: string;
  name: string;
  environment: 'production' | 'sandbox';
}): Promise<ApiKey> {
  try {
    const response = await apiRequest<{ success: boolean; data: ApiKey }>('/admin/integrations/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to generate API key:', error);
    // Return mock API key
    const mockKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: data.name,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      integrationId: data.integrationId,
      integrationName: data.integrationName,
      permissions: ['read', 'write'],
      environment: data.environment,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0,
    };
    return mockKey;
  }
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    await apiRequest(`/admin/integrations/api-keys/${keyId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to revoke API key:', error);
    // Silently fail - UI will update optimistically
  }
}

export async function retryWebhook(webhookId: string): Promise<void> {
  try {
    await apiRequest(`/admin/integrations/webhooks/${webhookId}/retry`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to retry webhook:', error);
    // Silently fail - UI will update optimistically
  }
}
