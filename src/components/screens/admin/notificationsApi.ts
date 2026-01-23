import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: 'transactional' | 'promotional' | 'system' | 'order' | 'welcome';
  channels: ('push' | 'sms' | 'email' | 'in-app')[];
  variables: string[];
  imageUrl?: string;
  deepLink?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed?: string;
  totalSent: number;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  segment: 'all' | 'vip' | 'new' | 'inactive' | 'custom';
  customSegmentQuery?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  channels: ('push' | 'sms' | 'email' | 'in-app')[];
  scheduledAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  targetUsers: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  createdBy: string;
}

export interface ScheduledNotification {
  id: string;
  campaignId: string;
  campaignName: string;
  templateName: string;
  scheduledAt: string;
  targetUsers: number;
  channels: ('push' | 'sms' | 'email' | 'in-app')[];
  recurring?: 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  createdBy: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'order_placed' | 'order_delivered' | 'cart_abandoned' | 'user_signup' | 'payment_failed';
  templateId: string;
  templateName: string;
  delay: number; // minutes
  channels: ('push' | 'sms' | 'email' | 'in-app')[];
  conditions?: string;
  status: 'active' | 'inactive';
  totalTriggered: number;
  successRate: number;
  createdAt: string;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  avgDeliveryTime: number;
  failedCount: number;
  bounceRate: number;
}

export interface NotificationHistory {
  id: string;
  userId: string;
  userName: string;
  templateName: string;
  title: string;
  body: string;
  channel: 'push' | 'sms' | 'email' | 'in-app';
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  failureReason?: string;
}

export interface ChannelPerformance {
  channel: 'push' | 'sms' | 'email' | 'in-app';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export interface TimeSeriesMetrics {
  timestamp: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

// --- Mock Data ---

const MOCK_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Welcome New User',
    title: 'Welcome to QuickCommerce! 🎉',
    body: 'Hi {{user_name}}, thank you for joining us! Get 20% off your first order.',
    category: 'welcome',
    channels: ['push', 'email'],
    variables: ['user_name'],
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400',
    deepLink: 'app://home',
    priority: 'high',
    status: 'active',
    createdAt: '2024-11-15T10:30:00Z',
    lastUsed: '2024-12-20T08:15:00Z',
    totalSent: 3456,
  },
  {
    id: 'TPL-002',
    name: 'Order Confirmed',
    title: 'Order #{{order_id}} Confirmed! ✓',
    body: 'Your order of ₹{{amount}} has been confirmed. Estimated delivery: {{delivery_time}}',
    category: 'order',
    channels: ['push', 'sms', 'in-app'],
    variables: ['order_id', 'amount', 'delivery_time'],
    deepLink: 'app://orders/{{order_id}}',
    priority: 'high',
    status: 'active',
    createdAt: '2024-10-05T14:20:00Z',
    lastUsed: '2024-12-20T11:45:00Z',
    totalSent: 8934,
  },
  {
    id: 'TPL-003',
    name: 'Out for Delivery',
    title: 'Your order is on the way! 🚚',
    body: 'Your order #{{order_id}} is out for delivery. Track your rider in real-time.',
    category: 'order',
    channels: ['push', 'sms'],
    variables: ['order_id', 'rider_name'],
    imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400',
    deepLink: 'app://track/{{order_id}}',
    priority: 'critical',
    status: 'active',
    createdAt: '2024-10-05T14:25:00Z',
    lastUsed: '2024-12-20T11:30:00Z',
    totalSent: 7821,
  },
  {
    id: 'TPL-004',
    name: 'Flash Sale Alert',
    title: '⚡ Flash Sale - Up to 50% OFF!',
    body: 'Hurry! Mega discounts on {{category}}. Sale ends in {{time_left}}!',
    category: 'promotional',
    channels: ['push', 'email', 'in-app'],
    variables: ['category', 'time_left', 'discount_percent'],
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    deepLink: 'app://sales/flash',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-11-20T09:00:00Z',
    lastUsed: '2024-12-19T15:00:00Z',
    totalSent: 12456,
  },
  {
    id: 'TPL-005',
    name: 'Payment Failed',
    title: 'Payment Failed - Action Required',
    body: 'Your payment of ₹{{amount}} for order #{{order_id}} failed. Please retry.',
    category: 'transactional',
    channels: ['push', 'sms', 'email'],
    variables: ['order_id', 'amount'],
    deepLink: 'app://orders/{{order_id}}/retry-payment',
    priority: 'critical',
    status: 'active',
    createdAt: '2024-10-10T11:00:00Z',
    lastUsed: '2024-12-20T10:20:00Z',
    totalSent: 234,
  },
  {
    id: 'TPL-006',
    name: 'Abandoned Cart Reminder',
    title: 'You left items in your cart 🛒',
    body: 'Complete your purchase now! {{item_count}} items waiting for you.',
    category: 'promotional',
    channels: ['push', 'email'],
    variables: ['item_count', 'cart_value'],
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    deepLink: 'app://cart',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-11-01T16:00:00Z',
    lastUsed: '2024-12-20T09:30:00Z',
    totalSent: 5678,
  },
  {
    id: 'TPL-007',
    name: 'System Maintenance',
    title: 'Scheduled Maintenance Notice',
    body: 'Our app will be under maintenance on {{date}} from {{start_time}} to {{end_time}}.',
    category: 'system',
    channels: ['push', 'email', 'in-app'],
    variables: ['date', 'start_time', 'end_time'],
    priority: 'low',
    status: 'inactive',
    createdAt: '2024-09-15T12:00:00Z',
    totalSent: 45678,
  },
  {
    id: 'TPL-008',
    name: 'Delivery Completed',
    title: 'Order Delivered Successfully! ✓',
    body: 'Your order #{{order_id}} has been delivered. Rate your experience!',
    category: 'order',
    channels: ['push', 'sms', 'in-app'],
    variables: ['order_id'],
    deepLink: 'app://orders/{{order_id}}/rate',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-10-05T14:30:00Z',
    lastUsed: '2024-12-20T11:00:00Z',
    totalSent: 8234,
  },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-001',
    name: 'Weekend Flash Sale',
    templateId: 'TPL-004',
    templateName: 'Flash Sale Alert',
    segment: 'all',
    status: 'active',
    channels: ['push', 'email'],
    scheduledAt: '2024-12-21T09:00:00Z',
    createdAt: '2024-12-18T14:30:00Z',
    startedAt: '2024-12-21T09:00:00Z',
    targetUsers: 45678,
    sentCount: 45234,
    deliveredCount: 43892,
    openedCount: 18456,
    clickedCount: 7823,
    deliveryRate: 97.0,
    openRate: 42.1,
    clickRate: 17.8,
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'CMP-002',
    name: 'New User Onboarding',
    templateId: 'TPL-001',
    templateName: 'Welcome New User',
    segment: 'new',
    status: 'active',
    channels: ['push', 'email'],
    createdAt: '2024-12-01T10:00:00Z',
    startedAt: '2024-12-01T10:00:00Z',
    targetUsers: 5234,
    sentCount: 5234,
    deliveredCount: 5102,
    openedCount: 3567,
    clickedCount: 2134,
    deliveryRate: 97.5,
    openRate: 69.9,
    clickRate: 41.8,
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'CMP-003',
    name: 'Re-engage Inactive Users',
    templateId: 'TPL-004',
    templateName: 'Flash Sale Alert',
    segment: 'inactive',
    status: 'completed',
    channels: ['push', 'email', 'sms'],
    scheduledAt: '2024-12-15T11:00:00Z',
    createdAt: '2024-12-10T09:00:00Z',
    startedAt: '2024-12-15T11:00:00Z',
    completedAt: '2024-12-15T14:30:00Z',
    targetUsers: 12456,
    sentCount: 12456,
    deliveredCount: 11892,
    openedCount: 4234,
    clickedCount: 1567,
    deliveryRate: 95.5,
    openRate: 35.6,
    clickRate: 13.2,
    createdBy: 'marketing@quickcommerce.com',
  },
  {
    id: 'CMP-004',
    name: 'VIP Exclusive Offers',
    templateId: 'TPL-004',
    templateName: 'Flash Sale Alert',
    segment: 'vip',
    status: 'scheduled',
    channels: ['push', 'email'],
    scheduledAt: '2024-12-22T10:00:00Z',
    createdAt: '2024-12-20T11:00:00Z',
    targetUsers: 2345,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'CMP-005',
    name: 'Cart Recovery Campaign',
    templateId: 'TPL-006',
    templateName: 'Abandoned Cart Reminder',
    segment: 'custom',
    customSegmentQuery: 'cart_abandoned_last_24h',
    status: 'active',
    channels: ['push', 'email'],
    createdAt: '2024-12-19T08:00:00Z',
    startedAt: '2024-12-19T08:00:00Z',
    targetUsers: 3456,
    sentCount: 3234,
    deliveredCount: 3145,
    openedCount: 1567,
    clickedCount: 678,
    deliveryRate: 97.2,
    openRate: 49.8,
    clickRate: 21.6,
    createdBy: 'marketing@quickcommerce.com',
  },
];

const MOCK_SCHEDULED: ScheduledNotification[] = [
  {
    id: 'SCH-001',
    campaignId: 'CMP-004',
    campaignName: 'VIP Exclusive Offers',
    templateName: 'Flash Sale Alert',
    scheduledAt: '2024-12-22T10:00:00Z',
    targetUsers: 2345,
    channels: ['push', 'email'],
    status: 'pending',
    createdBy: 'admin@quickcommerce.com',
  },
  {
    id: 'SCH-002',
    campaignId: 'CMP-006',
    campaignName: 'Daily Deals Digest',
    templateName: 'Flash Sale Alert',
    scheduledAt: '2024-12-21T08:00:00Z',
    targetUsers: 15678,
    channels: ['push', 'email'],
    recurring: 'daily',
    status: 'pending',
    createdBy: 'marketing@quickcommerce.com',
  },
  {
    id: 'SCH-003',
    campaignId: 'CMP-007',
    campaignName: 'Weekend Special',
    templateName: 'Flash Sale Alert',
    scheduledAt: '2024-12-21T12:00:00Z',
    targetUsers: 23456,
    channels: ['push'],
    status: 'pending',
    createdBy: 'admin@quickcommerce.com',
  },
];

const MOCK_AUTOMATION: AutomationRule[] = [
  {
    id: 'AUTO-001',
    name: 'Order Confirmation',
    trigger: 'order_placed',
    templateId: 'TPL-002',
    templateName: 'Order Confirmed',
    delay: 0,
    channels: ['push', 'sms', 'in-app'],
    status: 'active',
    totalTriggered: 8934,
    successRate: 98.7,
    createdAt: '2024-10-05T14:20:00Z',
  },
  {
    id: 'AUTO-002',
    name: 'Delivery Notification',
    trigger: 'order_delivered',
    templateId: 'TPL-008',
    templateName: 'Delivery Completed',
    delay: 5,
    channels: ['push', 'sms'],
    status: 'active',
    totalTriggered: 8234,
    successRate: 99.2,
    createdAt: '2024-10-05T14:30:00Z',
  },
  {
    id: 'AUTO-003',
    name: 'Cart Abandonment Follow-up',
    trigger: 'cart_abandoned',
    templateId: 'TPL-006',
    templateName: 'Abandoned Cart Reminder',
    delay: 60,
    channels: ['push', 'email'],
    conditions: 'cart_value > 500',
    status: 'active',
    totalTriggered: 5678,
    successRate: 87.3,
    createdAt: '2024-11-01T16:00:00Z',
  },
  {
    id: 'AUTO-004',
    name: 'Welcome New User',
    trigger: 'user_signup',
    templateId: 'TPL-001',
    templateName: 'Welcome New User',
    delay: 5,
    channels: ['push', 'email'],
    status: 'active',
    totalTriggered: 3456,
    successRate: 96.8,
    createdAt: '2024-11-15T10:30:00Z',
  },
  {
    id: 'AUTO-005',
    name: 'Payment Failure Alert',
    trigger: 'payment_failed',
    templateId: 'TPL-005',
    templateName: 'Payment Failed',
    delay: 0,
    channels: ['push', 'sms', 'email'],
    status: 'active',
    totalTriggered: 234,
    successRate: 99.5,
    createdAt: '2024-10-10T11:00:00Z',
  },
];

const MOCK_ANALYTICS: NotificationAnalytics = {
  totalSent: 89345,
  totalDelivered: 86234,
  totalOpened: 37892,
  totalClicked: 15678,
  deliveryRate: 96.5,
  openRate: 43.9,
  clickRate: 18.3,
  avgDeliveryTime: 2.3,
  failedCount: 3111,
  bounceRate: 3.5,
};

const MOCK_HISTORY: NotificationHistory[] = [
  {
    id: 'HIST-001',
    userId: 'USR-12345',
    userName: 'Rahul Sharma',
    templateName: 'Order Confirmed',
    title: 'Order #ORD-8934 Confirmed! ✓',
    body: 'Your order of ₹1,245 has been confirmed. Estimated delivery: 25 mins',
    channel: 'push',
    status: 'clicked',
    sentAt: '2024-12-20T11:45:32Z',
    deliveredAt: '2024-12-20T11:45:34Z',
    openedAt: '2024-12-20T11:47:12Z',
    clickedAt: '2024-12-20T11:47:18Z',
  },
  {
    id: 'HIST-002',
    userId: 'USR-23456',
    userName: 'Priya Singh',
    templateName: 'Flash Sale Alert',
    title: '⚡ Flash Sale - Up to 50% OFF!',
    body: 'Hurry! Mega discounts on Electronics. Sale ends in 2 hours!',
    channel: 'push',
    status: 'opened',
    sentAt: '2024-12-20T11:30:15Z',
    deliveredAt: '2024-12-20T11:30:17Z',
    openedAt: '2024-12-20T11:32:45Z',
  },
  {
    id: 'HIST-003',
    userId: 'USR-34567',
    userName: 'Amit Patel',
    templateName: 'Out for Delivery',
    title: 'Your order is on the way! 🚚',
    body: 'Your order #ORD-8923 is out for delivery. Track your rider in real-time.',
    channel: 'sms',
    status: 'delivered',
    sentAt: '2024-12-20T11:30:00Z',
    deliveredAt: '2024-12-20T11:30:03Z',
  },
  {
    id: 'HIST-004',
    userId: 'USR-45678',
    userName: 'Sneha Gupta',
    templateName: 'Welcome New User',
    title: 'Welcome to QuickCommerce! 🎉',
    body: 'Hi Sneha, thank you for joining us! Get 20% off your first order.',
    channel: 'email',
    status: 'opened',
    sentAt: '2024-12-20T11:15:00Z',
    deliveredAt: '2024-12-20T11:15:12Z',
    openedAt: '2024-12-20T11:20:34Z',
  },
  {
    id: 'HIST-005',
    userId: 'USR-56789',
    userName: 'Vikram Reddy',
    templateName: 'Payment Failed',
    title: 'Payment Failed - Action Required',
    body: 'Your payment of ₹2,450 for order #ORD-8901 failed. Please retry.',
    channel: 'push',
    status: 'failed',
    sentAt: '2024-12-20T11:10:00Z',
    failureReason: 'Device token invalid',
  },
  {
    id: 'HIST-006',
    userId: 'USR-67890',
    userName: 'Ananya Das',
    templateName: 'Abandoned Cart Reminder',
    title: 'You left items in your cart 🛒',
    body: 'Complete your purchase now! 3 items waiting for you.',
    channel: 'push',
    status: 'delivered',
    sentAt: '2024-12-20T11:00:00Z',
    deliveredAt: '2024-12-20T11:00:02Z',
  },
];

const MOCK_CHANNEL_PERFORMANCE: ChannelPerformance[] = [
  {
    channel: 'push',
    sent: 45678,
    delivered: 44234,
    opened: 19823,
    clicked: 8234,
    deliveryRate: 96.8,
    openRate: 44.8,
    clickRate: 18.6,
  },
  {
    channel: 'sms',
    sent: 23456,
    delivered: 22891,
    opened: 15234,
    clicked: 5678,
    deliveryRate: 97.6,
    openRate: 66.5,
    clickRate: 24.8,
  },
  {
    channel: 'email',
    sent: 18234,
    delivered: 17123,
    opened: 8456,
    clicked: 3234,
    deliveryRate: 93.9,
    openRate: 49.4,
    clickRate: 18.9,
  },
  {
    channel: 'in-app',
    sent: 1977,
    delivered: 1986,
    opened: 1456,
    clicked: 532,
    deliveryRate: 100.0,
    openRate: 73.3,
    clickRate: 26.8,
  },
];

const MOCK_TIME_SERIES: TimeSeriesMetrics[] = [
  { timestamp: '2024-12-20T00:00:00Z', sent: 1234, delivered: 1198, opened: 523, clicked: 234 },
  { timestamp: '2024-12-20T01:00:00Z', sent: 892, delivered: 867, opened: 378, clicked: 167 },
  { timestamp: '2024-12-20T02:00:00Z', sent: 567, delivered: 545, opened: 234, clicked: 98 },
  { timestamp: '2024-12-20T03:00:00Z', sent: 423, delivered: 412, opened: 178, clicked: 67 },
  { timestamp: '2024-12-20T04:00:00Z', sent: 389, delivered: 378, opened: 156, clicked: 56 },
  { timestamp: '2024-12-20T05:00:00Z', sent: 467, delivered: 456, opened: 198, clicked: 78 },
  { timestamp: '2024-12-20T06:00:00Z', sent: 789, delivered: 767, opened: 334, clicked: 145 },
  { timestamp: '2024-12-20T07:00:00Z', sent: 1456, delivered: 1423, opened: 623, clicked: 278 },
  { timestamp: '2024-12-20T08:00:00Z', sent: 2234, delivered: 2167, opened: 945, clicked: 423 },
  { timestamp: '2024-12-20T09:00:00Z', sent: 3456, delivered: 3345, opened: 1456, clicked: 645 },
  { timestamp: '2024-12-20T10:00:00Z', sent: 4567, delivered: 4423, opened: 1923, clicked: 856 },
  { timestamp: '2024-12-20T11:00:00Z', sent: 5678, delivered: 5501, opened: 2398, clicked: 1067 },
  { timestamp: '2024-12-20T12:00:00Z', sent: 6234, delivered: 6045, opened: 2634, clicked: 1178 },
  { timestamp: '2024-12-20T13:00:00Z', sent: 5892, delivered: 5712, opened: 2489, clicked: 1098 },
  { timestamp: '2024-12-20T14:00:00Z', sent: 5234, delivered: 5078, opened: 2212, clicked: 978 },
  { timestamp: '2024-12-20T15:00:00Z', sent: 4891, delivered: 4745, opened: 2067, clicked: 923 },
  { timestamp: '2024-12-20T16:00:00Z', sent: 5123, delivered: 4967, opened: 2167, clicked: 967 },
  { timestamp: '2024-12-20T17:00:00Z', sent: 5678, delivered: 5501, opened: 2401, clicked: 1067 },
  { timestamp: '2024-12-20T18:00:00Z', sent: 6456, delivered: 6256, opened: 2734, clicked: 1223 },
  { timestamp: '2024-12-20T19:00:00Z', sent: 7234, delivered: 7012, opened: 3056, clicked: 1367 },
  { timestamp: '2024-12-20T20:00:00Z', sent: 7891, delivered: 7645, opened: 3334, clicked: 1489 },
  { timestamp: '2024-12-20T21:00:00Z', sent: 6789, delivered: 6578, opened: 2867, clicked: 1278 },
  { timestamp: '2024-12-20T22:00:00Z', sent: 5456, delivered: 5289, opened: 2301, clicked: 1023 },
  { timestamp: '2024-12-20T23:00:00Z', sent: 4234, delivered: 4101, opened: 1789, clicked: 789 },
];

// --- API Functions ---

export async function fetchTemplates(): Promise<NotificationTemplate[]> {
  // TODO: Implement backend endpoint for notification templates
  return [];
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  // TODO: Implement backend endpoint for notification campaigns
  return [];
}

export async function fetchScheduled(): Promise<ScheduledNotification[]> {
  // TODO: Implement backend endpoint for scheduled notifications
  return [];
}

export async function fetchAutomation(): Promise<AutomationRule[]> {
  // TODO: Implement backend endpoint for automation rules
  return [];
}

export async function fetchAnalytics(): Promise<NotificationAnalytics> {
  // TODO: Implement backend endpoint for notification analytics
  return {
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    avgDeliveryTime: 0,
  };
}

export async function fetchHistory(): Promise<NotificationHistory[]> {
  // TODO: Implement backend endpoint for notification history
  return [];
}

export async function fetchChannelPerformance(): Promise<ChannelPerformance[]> {
  // TODO: Implement backend endpoint for channel performance
  return [];
}

export async function fetchTimeSeriesMetrics(): Promise<TimeSeriesMetrics[]> {
  // TODO: Implement backend endpoint for time series metrics
  return [];
}

export async function createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
  // TODO: Implement backend endpoint for creating templates
  throw new Error('Not implemented');
}

export async function createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
  // TODO: Implement backend endpoint for creating campaigns
  throw new Error('Not implemented');
}

export async function updateCampaignStatus(campaignId: string, status: Campaign['status']): Promise<void> {
  // TODO: Implement backend endpoint for updating campaign status
  throw new Error('Not implemented');
}

export async function deleteTemplate(templateId: string): Promise<void> {
  // TODO: Implement backend endpoint for deleting templates
  throw new Error('Not implemented');
}

export async function toggleAutomation(ruleId: string, status: 'active' | 'inactive'): Promise<void> {
  // TODO: Implement backend endpoint for toggling automation
  throw new Error('Not implemented');
}
