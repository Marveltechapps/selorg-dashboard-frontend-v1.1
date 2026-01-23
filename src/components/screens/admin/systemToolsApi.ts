// --- Type Definitions ---

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  port?: number;
}

export interface CacheStats {
  totalKeys: number;
  memoryUsed: string;
  hitRate: number;
  missRate: number;
  evictions: number;
  connections: number;
}

export interface DatabaseInfo {
  size: string;
  tables: number;
  lastBackup: string;
  connections: number;
  queries: number;
  slowQueries: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  details?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'paused' | 'error';
  executions: number;
  avgDuration: string;
}

export interface EnvVariable {
  key: string;
  value: string;
  isSensitive: boolean;
  category: string;
}

export interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  status: 'healthy' | 'slow' | 'down';
  avgResponseTime: number;
  requestCount: number;
  errorRate: number;
}

export interface PerformanceMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  requests: number;
  responseTime: number;
}

export interface Migration {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'failed';
  executedAt?: string;
  duration?: string;
}

// --- Mock Data ---

const MOCK_SYSTEM_HEALTH: SystemHealth = {
  cpu: 42.5,
  memory: 68.3,
  disk: 54.7,
  uptime: '15 days, 7 hours',
  services: [
    { name: 'API Server', status: 'running', uptime: '15d 7h', port: 3000 },
    { name: 'Database', status: 'running', uptime: '15d 7h', port: 5432 },
    { name: 'Redis Cache', status: 'running', uptime: '15d 7h', port: 6379 },
    { name: 'Message Queue', status: 'running', uptime: '15d 7h', port: 5672 },
    { name: 'Search Engine', status: 'running', uptime: '15d 7h', port: 9200 },
    { name: 'Worker Process', status: 'running', uptime: '15d 7h' },
  ],
};

const MOCK_CACHE_STATS: CacheStats = {
  totalKeys: 15847,
  memoryUsed: '245 MB',
  hitRate: 94.6,
  missRate: 5.4,
  evictions: 1204,
  connections: 42,
};

const MOCK_DATABASE_INFO: DatabaseInfo = {
  size: '12.4 GB',
  tables: 87,
  lastBackup: '2024-12-20T02:00:00Z',
  connections: 25,
  queries: 1547893,
  slowQueries: 23,
};

const MOCK_LOGS: LogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-12-20T11:45:23Z',
    level: 'error',
    service: 'Payment Gateway',
    message: 'Razorpay webhook timeout',
    details: 'Connection timeout after 30 seconds. Retrying with exponential backoff.',
  },
  {
    id: 'LOG-002',
    timestamp: '2024-12-20T11:42:15Z',
    level: 'warn',
    service: 'Order Service',
    message: 'High order volume detected',
    details: 'Processing 547 orders in queue. Average wait time: 45 seconds.',
  },
  {
    id: 'LOG-003',
    timestamp: '2024-12-20T11:38:47Z',
    level: 'info',
    service: 'Database',
    message: 'Daily backup completed successfully',
    details: 'Backup size: 12.4 GB. Duration: 8 minutes 34 seconds.',
  },
  {
    id: 'LOG-004',
    timestamp: '2024-12-20T11:35:12Z',
    level: 'error',
    service: 'SMS Gateway',
    message: 'Failed to send OTP to +91-XXXXXXXXXX',
    details: 'Twilio API error: Insufficient account balance.',
  },
  {
    id: 'LOG-005',
    timestamp: '2024-12-20T11:30:00Z',
    level: 'info',
    service: 'Cache Manager',
    message: 'Cache cleanup completed',
    details: 'Cleared 1,204 expired keys. Memory freed: 15.7 MB.',
  },
  {
    id: 'LOG-006',
    timestamp: '2024-12-20T11:28:33Z',
    level: 'warn',
    service: 'API Server',
    message: 'Rate limit exceeded for IP 203.0.113.45',
    details: 'Client exceeded 1000 requests/hour limit. Blocked for 30 minutes.',
  },
  {
    id: 'LOG-007',
    timestamp: '2024-12-20T11:25:18Z',
    level: 'debug',
    service: 'Search Engine',
    message: 'Index optimization started',
    details: 'Optimizing product catalog index. Expected duration: 15 minutes.',
  },
  {
    id: 'LOG-008',
    timestamp: '2024-12-20T11:22:45Z',
    level: 'info',
    service: 'Worker Process',
    message: 'Invoice generation job completed',
    details: 'Generated 1,547 invoices. Success rate: 99.8%.',
  },
];

const MOCK_CRON_JOBS: CronJob[] = [
  {
    id: 'CRON-001',
    name: 'Daily Database Backup',
    schedule: '0 2 * * *',
    lastRun: '2024-12-20T02:00:00Z',
    nextRun: '2024-12-21T02:00:00Z',
    status: 'active',
    executions: 456,
    avgDuration: '8m 34s',
  },
  {
    id: 'CRON-002',
    name: 'Hourly Cache Cleanup',
    schedule: '0 * * * *',
    lastRun: '2024-12-20T11:00:00Z',
    nextRun: '2024-12-20T12:00:00Z',
    status: 'active',
    executions: 10944,
    avgDuration: '2m 15s',
  },
  {
    id: 'CRON-003',
    name: 'Order Auto-Cancel (24h)',
    schedule: '*/15 * * * *',
    lastRun: '2024-12-20T11:45:00Z',
    nextRun: '2024-12-20T12:00:00Z',
    status: 'active',
    executions: 43776,
    avgDuration: '45s',
  },
  {
    id: 'CRON-004',
    name: 'Weekly Analytics Report',
    schedule: '0 0 * * 0',
    lastRun: '2024-12-15T00:00:00Z',
    nextRun: '2024-12-22T00:00:00Z',
    status: 'active',
    executions: 65,
    avgDuration: '12m 8s',
  },
  {
    id: 'CRON-005',
    name: 'Inventory Sync',
    schedule: '*/30 * * * *',
    lastRun: '2024-12-20T11:30:00Z',
    nextRun: '2024-12-20T12:00:00Z',
    status: 'active',
    executions: 21888,
    avgDuration: '1m 23s',
  },
  {
    id: 'CRON-006',
    name: 'Failed Payment Retry',
    schedule: '*/5 * * * *',
    lastRun: '2024-12-20T11:45:00Z',
    nextRun: '2024-12-20T11:50:00Z',
    status: 'error',
    executions: 131472,
    avgDuration: '15s',
  },
];

const MOCK_ENV_VARIABLES: EnvVariable[] = [
  { key: 'NODE_ENV', value: 'production', isSensitive: false, category: 'General' },
  { key: 'PORT', value: '3000', isSensitive: false, category: 'General' },
  { key: 'DATABASE_URL', value: 'postgresql://user:••••••••@localhost:5432/quickcommerce', isSensitive: true, category: 'Database' },
  { key: 'REDIS_URL', value: 'redis://localhost:6379', isSensitive: false, category: 'Cache' },
  { key: 'RAZORPAY_KEY_ID', value: 'rzp_live_••••••••••••', isSensitive: true, category: 'Payment' },
  { key: 'RAZORPAY_KEY_SECRET', value: '••••••••••••••••', isSensitive: true, category: 'Payment' },
  { key: 'STRIPE_SECRET_KEY', value: 'sk_live_••••••••••••••••', isSensitive: true, category: 'Payment' },
  { key: 'TWILIO_ACCOUNT_SID', value: 'AC••••••••••••••••••••••••••••••', isSensitive: true, category: 'SMS' },
  { key: 'TWILIO_AUTH_TOKEN', value: '••••••••••••••••••••••••••••••••', isSensitive: true, category: 'SMS' },
  { key: 'AWS_ACCESS_KEY_ID', value: 'AKIA••••••••••••••••', isSensitive: true, category: 'Storage' },
  { key: 'AWS_SECRET_ACCESS_KEY', value: '••••••••••••••••••••••••••••••••••••••••', isSensitive: true, category: 'Storage' },
  { key: 'JWT_SECRET', value: '••••••••••••••••••••••••••••••••', isSensitive: true, category: 'Auth' },
  { key: 'SESSION_SECRET', value: '••••••••••••••••••••••••••••••••', isSensitive: true, category: 'Auth' },
  { key: 'GOOGLE_MAPS_API_KEY', value: 'AIza••••••••••••••••••••••••••••••••', isSensitive: true, category: 'Maps' },
  { key: 'SENTRY_DSN', value: 'https://••••••••@sentry.io/1234567', isSensitive: true, category: 'Monitoring' },
];

const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
  { name: 'Create Order', method: 'POST', path: '/api/orders', status: 'healthy', avgResponseTime: 245, requestCount: 15847, errorRate: 0.2 },
  { name: 'Get Products', method: 'GET', path: '/api/products', status: 'healthy', avgResponseTime: 87, requestCount: 45231, errorRate: 0.1 },
  { name: 'User Login', method: 'POST', path: '/api/auth/login', status: 'healthy', avgResponseTime: 156, requestCount: 8901, errorRate: 0.5 },
  { name: 'Payment Webhook', method: 'POST', path: '/api/webhooks/razorpay', status: 'slow', avgResponseTime: 1245, requestCount: 3421, errorRate: 2.3 },
  { name: 'Search Products', method: 'GET', path: '/api/search', status: 'healthy', avgResponseTime: 198, requestCount: 12456, errorRate: 0.3 },
  { name: 'Update Inventory', method: 'PATCH', path: '/api/inventory', status: 'healthy', avgResponseTime: 312, requestCount: 6789, errorRate: 0.4 },
  { name: 'Refund Request', method: 'POST', path: '/api/refunds', status: 'healthy', avgResponseTime: 456, requestCount: 1234, errorRate: 0.8 },
  { name: 'Send OTP', method: 'POST', path: '/api/otp/send', status: 'down', avgResponseTime: 0, requestCount: 5678, errorRate: 15.4 },
];

const MOCK_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { timestamp: '11:00', cpu: 35, memory: 62, requests: 1245, responseTime: 145 },
  { timestamp: '11:10', cpu: 42, memory: 65, requests: 1567, responseTime: 178 },
  { timestamp: '11:20', cpu: 38, memory: 64, requests: 1423, responseTime: 156 },
  { timestamp: '11:30', cpu: 45, memory: 68, requests: 1789, responseTime: 198 },
  { timestamp: '11:40', cpu: 43, memory: 69, requests: 1654, responseTime: 187 },
  { timestamp: '11:50', cpu: 41, memory: 67, requests: 1512, responseTime: 165 },
];

const MOCK_MIGRATIONS: Migration[] = [
  { id: 'M-001', name: '001_create_users_table', status: 'completed', executedAt: '2024-01-15T10:00:00Z', duration: '2.3s' },
  { id: 'M-002', name: '002_create_orders_table', status: 'completed', executedAt: '2024-01-15T10:00:05Z', duration: '1.8s' },
  { id: 'M-003', name: '003_add_payment_columns', status: 'completed', executedAt: '2024-02-20T14:30:00Z', duration: '3.1s' },
  { id: 'M-004', name: '004_create_notifications_table', status: 'completed', executedAt: '2024-03-10T09:15:00Z', duration: '2.5s' },
  { id: 'M-005', name: '005_add_geofence_support', status: 'completed', executedAt: '2024-04-05T16:45:00Z', duration: '4.2s' },
  { id: 'M-006', name: '006_optimize_indexes', status: 'completed', executedAt: '2024-05-12T11:20:00Z', duration: '8.7s' },
  { id: 'M-007', name: '007_add_audit_log_table', status: 'completed', executedAt: '2024-06-18T13:00:00Z', duration: '3.4s' },
  { id: 'M-008', name: '008_add_rbac_permissions', status: 'pending', executedAt: undefined, duration: undefined },
];

import { apiRequest } from '@/api/apiClient';

// --- API Functions ---

export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiRequest<{ success?: boolean; data?: SystemHealth; status?: string }>('/shared/system-health/summary');
    // Map response to SystemHealth format
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: '0 days',
      services: [],
    };
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: '0 days',
      services: [],
    };
  }
}

export async function fetchCacheStats(): Promise<CacheStats> {
  // TODO: Implement backend endpoint for cache stats
  return {
    totalKeys: 0,
    memoryUsed: '0 MB',
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    connections: 0,
  };
}

export async function clearCache(pattern?: string): Promise<{ cleared: number }> {
  // TODO: Implement backend endpoint for clearing cache
  throw new Error('Not implemented');
}

export async function fetchDatabaseInfo(): Promise<DatabaseInfo> {
  // TODO: Implement backend endpoint for database info
  return {
    size: '0 MB',
    tables: 0,
    lastBackup: '',
    connections: 0,
    queries: 0,
    slowQueries: 0,
  };
}

export async function createDatabaseBackup(): Promise<{ filename: string; size: string }> {
  // TODO: Implement backend endpoint for database backup
  throw new Error('Not implemented');
}

export async function optimizeDatabase(): Promise<{ optimized: number }> {
  // TODO: Implement backend endpoint for database optimization
  throw new Error('Not implemented');
}

export async function fetchLogs(filter?: string): Promise<LogEntry[]> {
  // TODO: Implement backend endpoint for logs
  return [];
}

export async function fetchCronJobs(): Promise<CronJob[]> {
  // TODO: Implement backend endpoint for cron jobs
  return [];
}

export async function triggerCronJob(jobId: string): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for triggering cron jobs
  throw new Error('Not implemented');
}

export async function toggleCronJob(jobId: string, enabled: boolean): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for toggling cron jobs
  throw new Error('Not implemented');
}

export async function fetchEnvVariables(): Promise<EnvVariable[]> {
  // TODO: Implement backend endpoint for env variables (security sensitive)
  return [];
}

export async function updateEnvVariable(key: string, value: string): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for updating env variables (security sensitive)
  throw new Error('Not implemented');
}

export async function fetchMaintenanceMode(): Promise<{ enabled: boolean; message: string }> {
  // TODO: Implement backend endpoint for maintenance mode
  return { enabled: false, message: '' };
}

export async function toggleMaintenanceMode(enabled: boolean, message?: string): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for maintenance mode
  throw new Error('Not implemented');
}

export async function fetchApiEndpoints(): Promise<ApiEndpoint[]> {
  // TODO: Implement backend endpoint for API endpoint listing
  return [];
}

export async function testApiEndpoint(path: string): Promise<{ status: number; responseTime: number; body: any }> {
  // TODO: Implement backend endpoint for testing API endpoints
  throw new Error('Not implemented');
}

export async function fetchPerformanceMetrics(): Promise<PerformanceMetric[]> {
  // TODO: Implement backend endpoint for performance metrics
  return [];
}

export async function fetchMigrations(): Promise<Migration[]> {
  // TODO: Implement backend endpoint for migrations
  return [];
}

export async function runMigrations(): Promise<{ executed: number }> {
  // TODO: Implement backend endpoint for running migrations
  throw new Error('Not implemented');
}

export async function rollbackMigration(): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for rolling back migrations
  throw new Error('Not implemented');
}
