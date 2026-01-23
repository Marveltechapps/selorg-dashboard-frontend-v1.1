import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface GeneralSettings {
  platformName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  timezone: string;
  currency: string;
  currencySymbol: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  dateFormat: string;
  timeFormat: '12h' | '24h';
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  supportPhone: string;
}

export interface DeliverySlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  maxOrders: number;
  isActive: boolean;
  surgeMultiplier: number;
}

export interface DeliverySettings {
  minOrderValue: number;
  maxOrderValue: number;
  baseDeliveryFee: number;
  freeDeliveryAbove: number;
  deliveryFeePerKm: number;
  maxDeliveryRadius: number;
  avgDeliveryTime: number;
  expressDeliveryFee: number;
  slots: DeliverySlot[];
  partners: string[];
}

export interface PaymentGateway {
  id: string;
  name: string;
  provider: 'razorpay' | 'paytm' | 'stripe' | 'phonepe' | 'cod';
  isActive: boolean;
  apiKey: string;
  secretKey: string;
  merchantId?: string;
  transactionFee: number;
  transactionFeeType: 'percentage' | 'flat';
  minAmount: number;
  maxAmount: number;
  displayOrder: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  event: string;
  subject?: string;
  template: string;
  isActive: boolean;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailProvider: 'sendgrid' | 'ses' | 'smtp';
  smsProvider: 'twilio' | 'msg91' | 'gupshup';
  emailApiKey: string;
  smsApiKey: string;
  fcmServerKey: string;
  templates: NotificationTemplate[];
}

export interface TaxSettings {
  gstEnabled: boolean;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  tdsEnabled: boolean;
  tdsRate: number;
  taxDisplayType: 'inclusive' | 'exclusive';
  gstNumber: string;
  panNumber: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  isEnabled: boolean;
  category: 'core' | 'experimental' | 'beta' | 'premium';
  requiresRestart: boolean;
}

export interface Integration {
  id: string;
  name: string;
  service: string;
  apiKey: string;
  isActive: boolean;
  endpoint?: string;
  lastSync?: string;
}

export interface AdvancedSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  cacheEnabled: boolean;
  cacheDuration: number;
  rateLimitPerMinute: number;
  maxConcurrentUsers: number;
  sessionTimeout: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  apiVersion: string;
}

// --- Mock Data ---

let MOCK_GENERAL_SETTINGS: GeneralSettings = {
  platformName: 'QuickCommerce',
  tagline: 'Groceries delivered in 10 minutes',
  logoUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=200',
  faviconUrl: '/favicon.ico',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  currencySymbol: '₹',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'hi', 'kn', 'ta', 'te'],
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  primaryColor: '#e11d48',
  secondaryColor: '#0ea5e9',
  contactEmail: 'support@quickcommerce.com',
  supportPhone: '+91-80-4567-8900',
};

let MOCK_DELIVERY_SETTINGS: DeliverySettings = {
  minOrderValue: 99,
  maxOrderValue: 10000,
  baseDeliveryFee: 25,
  freeDeliveryAbove: 500,
  deliveryFeePerKm: 8,
  maxDeliveryRadius: 10,
  avgDeliveryTime: 15,
  expressDeliveryFee: 49,
  slots: [
    { id: 'slot-1', name: 'Morning', startTime: '06:00', endTime: '10:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], maxOrders: 100, isActive: true, surgeMultiplier: 1.0 },
    { id: 'slot-2', name: 'Afternoon', startTime: '12:00', endTime: '16:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], maxOrders: 150, isActive: true, surgeMultiplier: 1.0 },
    { id: 'slot-3', name: 'Evening', startTime: '18:00', endTime: '22:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], maxOrders: 200, isActive: true, surgeMultiplier: 1.2 },
    { id: 'slot-4', name: 'Late Night', startTime: '22:00', endTime: '02:00', days: ['Friday', 'Saturday'], maxOrders: 80, isActive: true, surgeMultiplier: 1.5 },
  ],
  partners: ['Dunzo', 'Shadowfax', 'Porter', 'In-house Fleet'],
};

let MOCK_PAYMENT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'pg-1',
    name: 'Razorpay',
    provider: 'razorpay',
    isActive: true,
    apiKey: 'rzp_live_XXXXXXXXXX',
    secretKey: '••••••••••••••••',
    transactionFee: 2,
    transactionFeeType: 'percentage',
    minAmount: 10,
    maxAmount: 100000,
    displayOrder: 1,
  },
  {
    id: 'pg-2',
    name: 'Paytm',
    provider: 'paytm',
    isActive: true,
    apiKey: 'paytm_XXXXXXXXXX',
    secretKey: '••••••••••••••••',
    merchantId: 'MERCHANT_001',
    transactionFee: 1.8,
    transactionFeeType: 'percentage',
    minAmount: 10,
    maxAmount: 100000,
    displayOrder: 2,
  },
  {
    id: 'pg-3',
    name: 'PhonePe',
    provider: 'phonepe',
    isActive: false,
    apiKey: 'phonepe_XXXXXXXXXX',
    secretKey: '••••••••••••••••',
    merchantId: 'MERCHANT_002',
    transactionFee: 1.5,
    transactionFeeType: 'percentage',
    minAmount: 10,
    maxAmount: 100000,
    displayOrder: 3,
  },
  {
    id: 'pg-4',
    name: 'Cash on Delivery',
    provider: 'cod',
    isActive: true,
    apiKey: 'N/A',
    secretKey: 'N/A',
    transactionFee: 15,
    transactionFeeType: 'flat',
    minAmount: 0,
    maxAmount: 2000,
    displayOrder: 4,
  },
];

let MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: true,
  emailProvider: 'sendgrid',
  smsProvider: 'msg91',
  emailApiKey: 'SG.XXXXXXXXXXXXXXXXXX',
  smsApiKey: 'MSG91_XXXXXXXXXX',
  fcmServerKey: 'FCM_XXXXXXXXXXXXXXXXXX',
  templates: [
    { id: 'tpl-1', name: 'Order Placed', type: 'email', event: 'order.placed', subject: 'Order Confirmed - #{orderNumber}', template: 'Your order #{orderNumber} has been placed successfully...', isActive: true },
    { id: 'tpl-2', name: 'Order Delivered', type: 'sms', event: 'order.delivered', template: 'Your order #{orderNumber} has been delivered. Enjoy!', isActive: true },
    { id: 'tpl-3', name: 'Payment Received', type: 'push', event: 'payment.success', template: 'Payment of ₹{amount} received for order #{orderNumber}', isActive: true },
    { id: 'tpl-4', name: 'Refund Processed', type: 'email', event: 'refund.processed', subject: 'Refund Processed - ₹{amount}', template: 'Your refund of ₹{amount} has been processed...', isActive: true },
  ],
};

let MOCK_TAX_SETTINGS: TaxSettings = {
  gstEnabled: true,
  cgstRate: 2.5,
  sgstRate: 2.5,
  igstRate: 5.0,
  tdsEnabled: false,
  tdsRate: 1.0,
  taxDisplayType: 'inclusive',
  gstNumber: '29ABCDE1234F1Z5',
  panNumber: 'ABCDE1234F',
};

let MOCK_FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff-1', name: 'Dark Mode', key: 'dark_mode', description: 'Enable dark mode theme across the platform', isEnabled: true, category: 'core', requiresRestart: false },
  { id: 'ff-2', name: 'Loyalty Program', key: 'loyalty_program', description: 'Reward points and cashback system', isEnabled: true, category: 'premium', requiresRestart: false },
  { id: 'ff-3', name: 'Live Chat Support', key: 'live_chat', description: 'Real-time customer support chat', isEnabled: false, category: 'beta', requiresRestart: false },
  { id: 'ff-4', name: 'Voice Search', key: 'voice_search', description: 'Voice-based product search', isEnabled: false, category: 'experimental', requiresRestart: true },
  { id: 'ff-5', name: 'Subscription Plans', key: 'subscriptions', description: 'Recurring delivery subscriptions', isEnabled: true, category: 'premium', requiresRestart: false },
  { id: 'ff-6', name: 'Social Login', key: 'social_login', description: 'Login with Google, Facebook, etc.', isEnabled: true, category: 'core', requiresRestart: false },
  { id: 'ff-7', name: 'AR Product Preview', key: 'ar_preview', description: 'Augmented reality product visualization', isEnabled: false, category: 'experimental', requiresRestart: true },
  { id: 'ff-8', name: 'Group Ordering', key: 'group_orders', description: 'Order with friends/family feature', isEnabled: false, category: 'beta', requiresRestart: false },
];

let MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'Google Maps API', service: 'google_maps', apiKey: 'AIzaSyXXXXXXXXXXXXXXXXX', isActive: true, endpoint: 'https://maps.googleapis.com/maps/api/', lastSync: '2024-12-20T14:30:00Z' },
  { id: 'int-2', name: 'SendGrid Email', service: 'sendgrid', apiKey: 'SG.XXXXXXXXXXXXXXXXXX', isActive: true, endpoint: 'https://api.sendgrid.com/v3/', lastSync: '2024-12-20T14:25:00Z' },
  { id: 'int-3', name: 'MSG91 SMS', service: 'msg91', apiKey: 'MSG91_XXXXXXXXXX', isActive: true, endpoint: 'https://api.msg91.com/api/', lastSync: '2024-12-20T14:20:00Z' },
  { id: 'int-4', name: 'Firebase FCM', service: 'fcm', apiKey: 'FCM_XXXXXXXXXXXXXXXXXX', isActive: true, endpoint: 'https://fcm.googleapis.com/fcm/', lastSync: '2024-12-20T14:15:00Z' },
  { id: 'int-5', name: 'AWS S3', service: 's3', apiKey: 'AKIA_XXXXXXXXXXXXXXXXXX', isActive: true, endpoint: 'https://s3.amazonaws.com/', lastSync: '2024-12-20T14:10:00Z' },
];

let MOCK_ADVANCED_SETTINGS: AdvancedSettings = {
  maintenanceMode: false,
  debugMode: false,
  cacheEnabled: true,
  cacheDuration: 300,
  rateLimitPerMinute: 60,
  maxConcurrentUsers: 10000,
  sessionTimeout: 1800,
  logLevel: 'info',
  apiVersion: 'v2.4.1',
};

// --- API Functions ---

export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  try {
    const response = await apiRequest<{ success: boolean; settings: any }>('/darkstore/settings');
    return {
      platformName: 'QuickCommerce',
      tagline: 'Fast Delivery Platform',
      logoUrl: '',
      faviconUrl: '',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      currencySymbol: '₹',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'hi'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      primaryColor: '#0891b2',
      secondaryColor: '#06b6d4',
      contactEmail: 'support@quickcommerce.com',
      supportPhone: '+91-1800-123-4567',
    };
  } catch (error) {
    console.error('Failed to fetch general settings:', error);
    return {
      platformName: 'QuickCommerce',
      tagline: 'Fast Delivery Platform',
      logoUrl: '',
      faviconUrl: '',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      currencySymbol: '₹',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'hi'],
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      primaryColor: '#0891b2',
      secondaryColor: '#06b6d4',
      contactEmail: 'support@quickcommerce.com',
      supportPhone: '+91-1800-123-4567',
    };
  }
}

export async function updateGeneralSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
  // TODO: Implement backend endpoint for general settings
  return await fetchGeneralSettings();
}

export async function fetchDeliverySettings(): Promise<DeliverySettings> {
  // TODO: Implement backend endpoint for delivery settings
  return {
    minOrderValue: 149,
    maxOrderValue: 50000,
    baseDeliveryFee: 39,
    freeDeliveryAbove: 499,
    deliveryFeePerKm: 5,
    maxDeliveryRadius: 10,
    avgDeliveryTime: 30,
    expressDeliveryFee: 59,
    slots: [],
    partners: [],
  };
}

export async function updateDeliverySettings(data: Partial<DeliverySettings>): Promise<DeliverySettings> {
  // TODO: Implement backend endpoint for delivery settings
  return await fetchDeliverySettings();
}

export async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  // TODO: Implement backend endpoint for payment gateways
  return [];
}

export async function updatePaymentGateway(id: string, data: Partial<PaymentGateway>): Promise<PaymentGateway> {
  // TODO: Implement backend endpoint for payment gateways
  throw new Error('Not implemented');
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  // TODO: Implement backend endpoint for notification settings
  return {
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: true,
    emailProvider: 'sendgrid',
    smsProvider: 'twilio',
    emailApiKey: '',
    smsApiKey: '',
    fcmServerKey: '',
    templates: [],
  };
}

export async function updateNotificationSettings(data: Partial<NotificationSettings>): Promise<NotificationSettings> {
  // TODO: Implement backend endpoint for notification settings
  return await fetchNotificationSettings();
}

export async function fetchTaxSettings(): Promise<TaxSettings> {
  // TODO: Implement backend endpoint for tax settings
  return {
    gstEnabled: true,
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    tdsEnabled: false,
    tdsRate: 0,
    taxDisplayType: 'inclusive',
    gstNumber: '',
    panNumber: '',
  };
}

export async function updateTaxSettings(data: Partial<TaxSettings>): Promise<TaxSettings> {
  // TODO: Implement backend endpoint for tax settings
  return await fetchTaxSettings();
}

export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  // TODO: Implement backend endpoint for feature flags
  return [];
}

export async function toggleFeatureFlag(id: string): Promise<FeatureFlag> {
  // TODO: Implement backend endpoint for feature flags
  throw new Error('Not implemented');
}

export async function fetchIntegrations(): Promise<Integration[]> {
  // TODO: Implement backend endpoint for integrations
  return [];
}

export async function updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
  // TODO: Implement backend endpoint for integrations
  throw new Error('Not implemented');
}

export async function fetchAdvancedSettings(): Promise<AdvancedSettings> {
  // TODO: Implement backend endpoint for advanced settings
  return {
    apiRateLimit: 1000,
    sessionTimeout: 3600,
    maxUploadSize: 10,
    enableCaching: true,
    cacheTTL: 300,
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: true,
    enableAnalytics: true,
  };
}

export async function updateAdvancedSettings(data: Partial<AdvancedSettings>): Promise<AdvancedSettings> {
  // TODO: Implement backend endpoint for advanced settings
  return await fetchAdvancedSettings();
}

export async function testIntegration(id: string): Promise<{ success: boolean; message: string }> {
  // TODO: Implement backend endpoint for testing integrations
  return {
    success: false,
    message: 'Integration testing not implemented',
  };
}
