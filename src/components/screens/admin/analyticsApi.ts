import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface RealtimeMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
  conversionRate: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

export interface TimeSeriesData {
  timestamp: string;
  revenue: number;
  orders: number;
  users: number;
  conversionRate: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalRevenue: number;
  unitsSold: number;
  averagePrice: number;
  growthRate: number;
  stockLevel: number;
  imageUrl?: string;
}

export interface CategoryAnalytics {
  category: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  percentageOfTotal: number;
  growthRate: number;
}

export interface RegionalPerformance {
  region: string;
  city: string;
  revenue: number;
  orders: number;
  activeUsers: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  averageLifetimeValue: number;
  customerAcquisitionCost: number;
  churnRate: number;
}

export interface OperationalMetrics {
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  cancellationRate: number;
  refundRate: number;
  averageRating: number;
  orderFulfillmentRate: number;
}

export interface RevenueBreakdown {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface GrowthTrend {
  period: string;
  revenue: number;
  orders: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface PeakHourData {
  hour: string;
  orders: number;
  revenue: number;
}

export interface ConversionFunnel {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface PaymentMethodAnalytics {
  method: string;
  transactions: number;
  revenue: number;
  percentage: number;
}

// --- Mock Data ---

const MOCK_REALTIME_METRICS: RealtimeMetrics = {
  totalRevenue: 2458900,
  totalOrders: 3847,
  activeUsers: 12459,
  conversionRate: 3.8,
  averageOrderValue: 639,
  revenueGrowth: 18.5,
  ordersGrowth: 12.3,
  usersGrowth: 24.7,
};

const MOCK_TIME_SERIES_DATA: TimeSeriesData[] = [
  { timestamp: '2024-12-20T00:00:00Z', revenue: 45600, orders: 89, users: 342, conversionRate: 3.2 },
  { timestamp: '2024-12-20T01:00:00Z', revenue: 38200, orders: 67, users: 298, conversionRate: 2.9 },
  { timestamp: '2024-12-20T02:00:00Z', revenue: 29800, orders: 52, users: 245, conversionRate: 2.7 },
  { timestamp: '2024-12-20T03:00:00Z', revenue: 24500, orders: 41, users: 198, conversionRate: 2.5 },
  { timestamp: '2024-12-20T04:00:00Z', revenue: 21300, orders: 38, users: 176, conversionRate: 2.6 },
  { timestamp: '2024-12-20T05:00:00Z', revenue: 26700, orders: 45, users: 201, conversionRate: 2.8 },
  { timestamp: '2024-12-20T06:00:00Z', revenue: 42100, orders: 73, users: 312, conversionRate: 3.1 },
  { timestamp: '2024-12-20T07:00:00Z', revenue: 68900, orders: 118, users: 456, conversionRate: 3.5 },
  { timestamp: '2024-12-20T08:00:00Z', revenue: 94200, orders: 167, users: 589, conversionRate: 3.7 },
  { timestamp: '2024-12-20T09:00:00Z', revenue: 128500, orders: 223, users: 734, conversionRate: 3.9 },
  { timestamp: '2024-12-20T10:00:00Z', revenue: 156800, orders: 278, users: 867, conversionRate: 4.1 },
  { timestamp: '2024-12-20T11:00:00Z', revenue: 189300, orders: 324, users: 945, conversionRate: 4.3 },
  { timestamp: '2024-12-20T12:00:00Z', revenue: 213700, orders: 367, users: 1023, conversionRate: 4.5 },
  { timestamp: '2024-12-20T13:00:00Z', revenue: 198400, orders: 341, users: 978, conversionRate: 4.3 },
  { timestamp: '2024-12-20T14:00:00Z', revenue: 176200, orders: 298, users: 892, conversionRate: 4.1 },
  { timestamp: '2024-12-20T15:00:00Z', revenue: 165900, orders: 276, users: 834, conversionRate: 3.9 },
  { timestamp: '2024-12-20T16:00:00Z', revenue: 184300, orders: 312, users: 901, conversionRate: 4.0 },
  { timestamp: '2024-12-20T17:00:00Z', revenue: 203800, orders: 348, users: 967, conversionRate: 4.2 },
  { timestamp: '2024-12-20T18:00:00Z', revenue: 234600, orders: 389, users: 1056, conversionRate: 4.4 },
  { timestamp: '2024-12-20T19:00:00Z', revenue: 267400, orders: 423, users: 1134, conversionRate: 4.6 },
  { timestamp: '2024-12-20T20:00:00Z', revenue: 289100, orders: 456, users: 1198, conversionRate: 4.7 },
  { timestamp: '2024-12-20T21:00:00Z', revenue: 245700, orders: 398, users: 1067, conversionRate: 4.5 },
  { timestamp: '2024-12-20T22:00:00Z', revenue: 198300, orders: 321, users: 934, conversionRate: 4.2 },
  { timestamp: '2024-12-20T23:00:00Z', revenue: 156800, orders: 267, users: 812, conversionRate: 3.9 },
];

const MOCK_PRODUCT_PERFORMANCE: ProductPerformance[] = [
  { id: '1', name: 'Premium Coffee Beans 1kg', sku: 'SKU-10001', category: 'Groceries', totalRevenue: 124500, unitsSold: 498, averagePrice: 250, growthRate: 23.4, stockLevel: 234 },
  { id: '2', name: 'Organic Green Tea 100g', sku: 'SKU-10002', category: 'Groceries', totalRevenue: 89300, unitsSold: 893, averagePrice: 100, growthRate: 18.7, stockLevel: 456 },
  { id: '3', name: 'Wireless Earbuds Pro', sku: 'SKU-20001', category: 'Electronics', totalRevenue: 234900, unitsSold: 78, averagePrice: 3012, growthRate: 45.2, stockLevel: 89 },
  { id: '4', name: 'Yoga Mat Premium', sku: 'SKU-30001', category: 'Sports', totalRevenue: 67800, unitsSold: 226, averagePrice: 300, growthRate: 12.3, stockLevel: 178 },
  { id: '5', name: 'Protein Powder 2kg', sku: 'SKU-30002', category: 'Sports', totalRevenue: 198400, unitsSold: 248, averagePrice: 800, growthRate: 34.5, stockLevel: 134 },
  { id: '6', name: 'Smart Watch Series 5', sku: 'SKU-20002', category: 'Electronics', totalRevenue: 456700, unitsSold: 76, averagePrice: 6009, growthRate: 56.8, stockLevel: 45 },
  { id: '7', name: 'Olive Oil 1L', sku: 'SKU-10003', category: 'Groceries', totalRevenue: 78900, unitsSold: 526, averagePrice: 150, growthRate: 8.9, stockLevel: 312 },
  { id: '8', name: 'Running Shoes Pro', sku: 'SKU-30003', category: 'Sports', totalRevenue: 345600, unitsSold: 96, averagePrice: 3600, growthRate: 28.4, stockLevel: 67 },
  { id: '9', name: 'Laptop Stand Aluminum', sku: 'SKU-20003', category: 'Electronics', totalRevenue: 89200, unitsSold: 223, averagePrice: 400, growthRate: 19.2, stockLevel: 156 },
  { id: '10', name: 'Multivitamin 60 Tablets', sku: 'SKU-40001', category: 'Health', totalRevenue: 67300, unitsSold: 673, averagePrice: 100, growthRate: 15.6, stockLevel: 289 },
];

const MOCK_CATEGORY_ANALYTICS: CategoryAnalytics[] = [
  { category: 'Electronics', revenue: 892400, orders: 1234, averageOrderValue: 723, percentageOfTotal: 36.3, growthRate: 42.1 },
  { category: 'Groceries', revenue: 645800, orders: 2456, averageOrderValue: 263, percentageOfTotal: 26.3, growthRate: 18.5 },
  { category: 'Sports', revenue: 523900, orders: 876, averageOrderValue: 598, percentageOfTotal: 21.3, growthRate: 25.7 },
  { category: 'Health', revenue: 234600, orders: 1123, averageOrderValue: 209, percentageOfTotal: 9.5, growthRate: 14.2 },
  { category: 'Home & Kitchen', revenue: 162200, orders: 358, averageOrderValue: 453, percentageOfTotal: 6.6, growthRate: 8.9 },
];

const MOCK_REGIONAL_PERFORMANCE: RegionalPerformance[] = [
  { region: 'North', city: 'Delhi', revenue: 678900, orders: 1245, activeUsers: 4567, averageDeliveryTime: 28, customerSatisfaction: 4.6 },
  { region: 'South', city: 'Bangalore', revenue: 892300, orders: 1567, activeUsers: 5234, averageDeliveryTime: 25, customerSatisfaction: 4.8 },
  { region: 'West', city: 'Mumbai', revenue: 534200, orders: 923, activeUsers: 3456, averageDeliveryTime: 32, customerSatisfaction: 4.5 },
  { region: 'East', city: 'Kolkata', revenue: 353500, orders: 612, activeUsers: 2302, averageDeliveryTime: 35, customerSatisfaction: 4.3 },
];

const MOCK_CUSTOMER_METRICS: CustomerMetrics = {
  totalCustomers: 45678,
  newCustomers: 3456,
  returningCustomers: 2234,
  customerRetentionRate: 68.5,
  averageLifetimeValue: 12450,
  customerAcquisitionCost: 245,
  churnRate: 4.2,
};

const MOCK_OPERATIONAL_METRICS: OperationalMetrics = {
  averageDeliveryTime: 28.5,
  onTimeDeliveryRate: 94.3,
  cancellationRate: 2.8,
  refundRate: 1.5,
  averageRating: 4.6,
  orderFulfillmentRate: 97.2,
};

const MOCK_REVENUE_BREAKDOWN: RevenueBreakdown[] = [
  { category: 'Electronics', value: 892400, percentage: 36.3, color: '#3b82f6' },
  { category: 'Groceries', value: 645800, percentage: 26.3, color: '#10b981' },
  { category: 'Sports', value: 523900, percentage: 21.3, color: '#f59e0b' },
  { category: 'Health', value: 234600, percentage: 9.5, color: '#8b5cf6' },
  { category: 'Home & Kitchen', value: 162200, percentage: 6.6, color: '#ec4899' },
];

const MOCK_GROWTH_TRENDS: GrowthTrend[] = [
  { period: 'Jan 2024', revenue: 1245000, orders: 2345, revenueGrowth: 12.3, ordersGrowth: 8.9 },
  { period: 'Feb 2024', revenue: 1389000, orders: 2567, revenueGrowth: 11.6, ordersGrowth: 9.5 },
  { period: 'Mar 2024', revenue: 1567000, orders: 2834, revenueGrowth: 12.8, ordersGrowth: 10.4 },
  { period: 'Apr 2024', revenue: 1723000, orders: 3012, revenueGrowth: 10.0, ordersGrowth: 6.3 },
  { period: 'May 2024', revenue: 1892000, orders: 3289, revenueGrowth: 9.8, ordersGrowth: 9.2 },
  { period: 'Jun 2024', revenue: 2134000, orders: 3567, revenueGrowth: 12.8, ordersGrowth: 8.5 },
  { period: 'Jul 2024', revenue: 2345000, orders: 3834, revenueGrowth: 9.9, ordersGrowth: 7.5 },
  { period: 'Aug 2024', revenue: 2567000, orders: 4123, revenueGrowth: 9.5, ordersGrowth: 7.5 },
  { period: 'Sep 2024', revenue: 2789000, orders: 4456, revenueGrowth: 8.6, ordersGrowth: 8.1 },
  { period: 'Oct 2024', revenue: 3012000, orders: 4789, revenueGrowth: 8.0, ordersGrowth: 7.5 },
  { period: 'Nov 2024', revenue: 3234000, orders: 5123, revenueGrowth: 7.4, ordersGrowth: 7.0 },
  { period: 'Dec 2024', revenue: 3456000, orders: 5456, revenueGrowth: 6.9, ordersGrowth: 6.5 },
];

const MOCK_PEAK_HOURS: PeakHourData[] = [
  { hour: '12 AM', orders: 89, revenue: 45600 },
  { hour: '1 AM', orders: 67, revenue: 38200 },
  { hour: '2 AM', orders: 52, revenue: 29800 },
  { hour: '3 AM', orders: 41, revenue: 24500 },
  { hour: '4 AM', orders: 38, revenue: 21300 },
  { hour: '5 AM', orders: 45, revenue: 26700 },
  { hour: '6 AM', orders: 73, revenue: 42100 },
  { hour: '7 AM', orders: 118, revenue: 68900 },
  { hour: '8 AM', orders: 167, revenue: 94200 },
  { hour: '9 AM', orders: 223, revenue: 128500 },
  { hour: '10 AM', orders: 278, revenue: 156800 },
  { hour: '11 AM', orders: 324, revenue: 189300 },
  { hour: '12 PM', orders: 367, revenue: 213700 },
  { hour: '1 PM', orders: 341, revenue: 198400 },
  { hour: '2 PM', orders: 298, revenue: 176200 },
  { hour: '3 PM', orders: 276, revenue: 165900 },
  { hour: '4 PM', orders: 312, revenue: 184300 },
  { hour: '5 PM', orders: 348, revenue: 203800 },
  { hour: '6 PM', orders: 389, revenue: 234600 },
  { hour: '7 PM', orders: 423, revenue: 267400 },
  { hour: '8 PM', orders: 456, revenue: 289100 },
  { hour: '9 PM', orders: 398, revenue: 245700 },
  { hour: '10 PM', orders: 321, revenue: 198300 },
  { hour: '11 PM', orders: 267, revenue: 156800 },
];

const MOCK_CONVERSION_FUNNEL: ConversionFunnel[] = [
  { stage: 'Visitors', users: 100000, conversionRate: 100, dropoffRate: 0 },
  { stage: 'Product Views', users: 45600, conversionRate: 45.6, dropoffRate: 54.4 },
  { stage: 'Add to Cart', users: 12340, conversionRate: 27.1, dropoffRate: 72.9 },
  { stage: 'Checkout Started', users: 6780, conversionRate: 54.9, dropoffRate: 45.1 },
  { stage: 'Payment Initiated', users: 4890, conversionRate: 72.1, dropoffRate: 27.9 },
  { stage: 'Order Completed', users: 3847, conversionRate: 78.7, dropoffRate: 21.3 },
];

const MOCK_PAYMENT_METHODS: PaymentMethodAnalytics[] = [
  { method: 'UPI', transactions: 1823, revenue: 1167800, percentage: 47.5 },
  { method: 'Credit Card', transactions: 892, revenue: 789300, percentage: 32.1 },
  { method: 'Debit Card', transactions: 567, revenue: 312400, percentage: 12.7 },
  { method: 'Wallet', transactions: 398, revenue: 134600, percentage: 5.5 },
  { method: 'Cash on Delivery', transactions: 167, revenue: 54800, percentage: 2.2 },
];

// --- API Functions ---

export async function fetchRealtimeMetrics(): Promise<RealtimeMetrics> {
  // TODO: Implement backend endpoint for realtime metrics
  return {
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
  };
}

export async function fetchTimeSeriesData(range: string = '24h'): Promise<TimeSeriesData[]> {
  // TODO: Implement backend endpoint for time series data
  return [];
}

export async function fetchProductPerformance(): Promise<ProductPerformance[]> {
  // TODO: Implement backend endpoint for product performance
  return [];
}

export async function fetchCategoryAnalytics(): Promise<CategoryAnalytics[]> {
  // TODO: Implement backend endpoint for category analytics
  return [];
}

export async function fetchRegionalPerformance(): Promise<RegionalPerformance[]> {
  // TODO: Implement backend endpoint for regional performance
  return [];
}

export async function fetchCustomerMetrics(): Promise<CustomerMetrics> {
  // TODO: Implement backend endpoint for customer metrics
  return {
    totalCustomers: 0,
    newCustomers: 0,
    activeCustomers: 0,
    churnRate: 0,
    avgLifetimeValue: 0,
    avgOrderFrequency: 0,
  };
}

export async function fetchOperationalMetrics(): Promise<OperationalMetrics> {
  // TODO: Implement backend endpoint for operational metrics
  return {
    avgDeliveryTime: 0,
    onTimeDeliveryRate: 0,
    orderAccuracy: 0,
    customerSatisfaction: 0,
    riderUtilization: 0,
    storeUtilization: 0,
  };
}

export async function fetchRevenueBreakdown(): Promise<RevenueBreakdown[]> {
  // TODO: Implement backend endpoint for revenue breakdown
  return [];
}

export async function fetchGrowthTrends(): Promise<GrowthTrend[]> {
  // TODO: Implement backend endpoint for growth trends
  return [];
}

export async function fetchPeakHours(): Promise<PeakHourData[]> {
  // TODO: Implement backend endpoint for peak hours
  return [];
}

export async function fetchConversionFunnel(): Promise<ConversionFunnel[]> {
  // TODO: Implement backend endpoint for conversion funnel
  return [];
}

export async function fetchPaymentMethods(): Promise<PaymentMethodAnalytics[]> {
  // TODO: Implement backend endpoint for payment methods analytics
  return [];
}
