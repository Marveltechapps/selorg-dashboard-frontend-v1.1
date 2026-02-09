// --- Type Definitions ---

export interface SalesOverview {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  avgOrderValue: number;
  avgOrderGrowth: number;
  totalProducts: number;
  productsGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
}

export interface OrderAnalytics {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CustomerInsight {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface RevenueByCategory {
  category: string;
  revenue: number;
  percentage: number;
  color: string;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  avgOrderValue: number;
}

export interface FinancialSummary {
  grossRevenue: number;
  platformFee: number;
  deliveryCharges: number;
  refunds: number;
  netRevenue: number;
  profitMargin: number;
}

export interface HourlySales {
  hour: string;
  orders: number;
  revenue: number;
}

import { apiRequest } from '@/api/apiClient';

// Helper function to convert date range string to actual dates
function getDateRange(dateRange: string): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  
  switch (dateRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setDate(end.getDate() - 30);
      break;
    case 'quarter':
      start.setDate(end.getDate() - 90);
      break;
    default:
      // If it's already in "start to end" format, parse it
      if (dateRange.includes(' to ')) {
        const [startStr, endStr] = dateRange.split(' to ');
        return { startDate: startStr, endDate: endStr };
      }
      // Default to week
      start.setDate(end.getDate() - 7);
  }
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

// --- API Functions ---

export async function fetchSalesOverview(dateRange?: string, vendorId?: string): Promise<SalesOverview> {
  const params = new URLSearchParams();
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }
  if (vendorId) params.append('vendorId', vendorId);

  try {
    const response = await apiRequest<{ success: boolean; data: SalesOverview }>(
      `/vendor/reports/sales/overview?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch sales overview from API, using mock data', error);
    // Return mock data on error
    return getMockSalesOverview(dateRange || 'week');
  }
}

export async function fetchSalesData(dateRange?: string, vendorId?: string, groupBy: string = 'day'): Promise<SalesData[]> {
  const params = new URLSearchParams();
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }
  if (vendorId) params.append('vendorId', vendorId);
  params.append('groupBy', groupBy);

  try {
    const response = await apiRequest<{ success: boolean; data: SalesData[] }>(
      `/vendor/reports/sales/data?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch sales data from API, using mock data', error);
    return getMockSalesData(dateRange || 'week');
  }
}

export async function fetchProductPerformance(sortBy?: string, vendorId?: string, dateRange?: string): Promise<ProductPerformance[]> {
  const params = new URLSearchParams();
  if (sortBy) params.append('sortBy', sortBy);
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: ProductPerformance[] }>(
      `/vendor/reports/products/performance?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch product performance from API, using mock data', error);
    return getMockProductPerformance();
  }
}

export async function fetchOrderAnalytics(vendorId?: string, dateRange?: string): Promise<OrderAnalytics[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: OrderAnalytics[] }>(
      `/vendor/reports/orders/analytics?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch order analytics from API, using mock data', error);
    return getMockOrderAnalytics();
  }
}

export async function fetchCustomerInsights(vendorId?: string, dateRange?: string): Promise<CustomerInsight[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: CustomerInsight[] }>(
      `/vendor/reports/customers/insights?${params.toString()}`
    );
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch customer insights from API, using mock data', error);
    return getMockCustomerInsights();
  }
}

export async function fetchRevenueByCategory(vendorId?: string, dateRange?: string): Promise<RevenueByCategory[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: RevenueByCategory[] }>(
      `/vendor/reports/revenue/category?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch revenue by category from API, using mock data', error);
    return getMockRevenueByCategory();
  }
}

export async function fetchTopCustomers(limit?: number, vendorId?: string, dateRange?: string): Promise<TopCustomer[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: TopCustomer[] }>(
      `/vendor/reports/customers/top?${params.toString()}`
    );
    return response.data || [];
  } catch (error) {
    console.warn('Failed to fetch top customers from API, using mock data', error);
    return getMockTopCustomers(limit || 5);
  }
}

export async function fetchFinancialSummary(vendorId?: string, dateRange?: string): Promise<FinancialSummary> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const { startDate, endDate } = getDateRange(dateRange);
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  try {
    const response = await apiRequest<{ success: boolean; data: FinancialSummary }>(
      `/vendor/reports/financial/summary?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch financial summary from API, using mock data', error);
    return getMockFinancialSummary();
  }
}

export async function fetchHourlySales(vendorId?: string, date?: string): Promise<HourlySales[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (date) params.append('date', date);

  try {
    const response = await apiRequest<{ success: boolean; data: HourlySales[] }>(
      `/vendor/reports/sales/hourly?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch hourly sales from API, using mock data', error);
    return getMockHourlySales();
  }
}

export async function exportReport(reportType: string, format: 'csv' | 'pdf'): Promise<{ url: string }> {
  // TODO: Implement backend endpoint for report export
  // For now, return mock response
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { url: `https://example.com/reports/${reportType}-export.${format}` };
}

// --- Mock Data Functions ---

function getMockSalesOverview(dateRange: string): SalesOverview {
  const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
  const baseRevenue = days * 12000;
  return {
    totalRevenue: baseRevenue,
    revenueGrowth: 12.5,
    totalOrders: days * 45,
    ordersGrowth: 8.3,
    avgOrderValue: 2650,
    avgOrderGrowth: 4.2,
    totalProducts: 156,
    productsGrowth: 5.7,
  };
}

function getMockSalesData(dateRange: string): SalesData[] {
  const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
  const data: SalesData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: 8000 + Math.random() * 8000,
      orders: 30 + Math.floor(Math.random() * 40),
      customers: 25 + Math.floor(Math.random() * 30),
    });
  }
  return data;
}

function getMockProductPerformance(): ProductPerformance[] {
  return [
    { id: 'PROD-001', name: 'Organic Tomatoes', category: 'Vegetables', unitsSold: 1250, revenue: 87500, stock: 450, trend: 'up', growthRate: 15.2 },
    { id: 'PROD-002', name: 'Fresh Milk 1L', category: 'Dairy', unitsSold: 980, revenue: 78400, stock: 320, trend: 'up', growthRate: 12.5 },
    { id: 'PROD-003', name: 'Basmati Rice 5kg', category: 'Grains', unitsSold: 750, revenue: 112500, stock: 180, trend: 'stable', growthRate: 2.3 },
    { id: 'PROD-004', name: 'Chicken Breast 500g', category: 'Meat', unitsSold: 650, revenue: 97500, stock: 95, trend: 'up', growthRate: 18.7 },
    { id: 'PROD-005', name: 'Bananas 1kg', category: 'Fruits', unitsSold: 1100, revenue: 33000, stock: 520, trend: 'down', growthRate: -3.2 },
    { id: 'PROD-006', name: 'Olive Oil 500ml', category: 'Oils', unitsSold: 420, revenue: 84000, stock: 150, trend: 'up', growthRate: 9.8 },
    { id: 'PROD-007', name: 'Wheat Flour 2kg', category: 'Grains', unitsSold: 580, revenue: 34800, stock: 280, trend: 'stable', growthRate: 1.5 },
    { id: 'PROD-008', name: 'Yogurt 500g', category: 'Dairy', unitsSold: 720, revenue: 43200, stock: 240, trend: 'up', growthRate: 7.3 },
  ];
}

function getMockOrderAnalytics(): OrderAnalytics[] {
  return [
    { status: 'Completed', count: 1456, percentage: 78.8, color: '#10B981' },
    { status: 'Pending', count: 234, percentage: 12.7, color: '#F59E0B' },
    { status: 'Processing', count: 98, percentage: 5.3, color: '#3B82F6' },
    { status: 'Cancelled', count: 59, percentage: 3.2, color: '#EF4444' },
  ];
}

function getMockCustomerInsights(): CustomerInsight[] {
  return [
    { metric: 'Total Customers', value: 2847, change: 12.5, trend: 'up' },
    { metric: 'New Customers', value: 342, change: 8.3, trend: 'up' },
    { metric: 'Repeat Rate', value: 68.5, change: 5.2, trend: 'up' },
    { metric: 'Avg Order Value', value: 2650, change: 4.2, trend: 'up' },
  ];
}

function getMockRevenueByCategory(): RevenueByCategory[] {
  return [
    { category: 'Vegetables', revenue: 245000, percentage: 28.5, color: '#10B981' },
    { category: 'Dairy', revenue: 198000, percentage: 23.0, color: '#3B82F6' },
    { category: 'Meat', revenue: 156000, percentage: 18.1, color: '#EF4444' },
    { category: 'Grains', revenue: 142000, percentage: 16.5, color: '#F59E0B' },
    { category: 'Fruits', revenue: 120000, percentage: 14.0, color: '#8B5CF6' },
  ];
}

function getMockTopCustomers(limit: number): TopCustomer[] {
  const customers: TopCustomer[] = [
    { id: 'CUST-001', name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', orders: 45, totalSpent: 125000, avgOrderValue: 2778 },
    { id: 'CUST-002', name: 'Priya Sharma', email: 'priya.sharma@email.com', orders: 38, totalSpent: 98000, avgOrderValue: 2579 },
    { id: 'CUST-003', name: 'Amit Patel', email: 'amit.patel@email.com', orders: 32, totalSpent: 87500, avgOrderValue: 2734 },
    { id: 'CUST-004', name: 'Sneha Reddy', email: 'sneha.reddy@email.com', orders: 28, totalSpent: 72000, avgOrderValue: 2571 },
    { id: 'CUST-005', name: 'Vikram Singh', email: 'vikram.singh@email.com', orders: 25, totalSpent: 65000, avgOrderValue: 2600 },
  ];
  return customers.slice(0, limit);
}

function getMockFinancialSummary(): FinancialSummary {
  const grossRevenue = 861000;
  const platformFee = grossRevenue * 0.1;
  const deliveryCharges = 45000;
  const refunds = 12000;
  const netRevenue = grossRevenue - platformFee - refunds + deliveryCharges;
  const profitMargin = (netRevenue / grossRevenue) * 100;
  
  return {
    grossRevenue,
    platformFee,
    deliveryCharges,
    refunds,
    netRevenue,
    profitMargin,
  };
}

function getMockHourlySales(): HourlySales[] {
  const hours: HourlySales[] = [];
  for (let h = 0; h < 24; h++) {
    const hourStr = `${h.toString().padStart(2, '0')}:00`;
    const baseOrders = h >= 6 && h <= 22 ? 30 + Math.random() * 130 : Math.random() * 20;
    hours.push({
      hour: hourStr,
      orders: Math.floor(baseOrders),
      revenue: baseOrders * 85,
    });
  }
  return hours;
}

// --- LocalStorage Functions ---

const STORAGE_KEYS = {
  salesOverview: 'vendorReports_salesOverview',
  salesData: 'vendorReports_salesData',
  productPerformance: 'vendorReports_productPerformance',
  orderAnalytics: 'vendorReports_orderAnalytics',
  customerInsights: 'vendorReports_customerInsights',
  revenueByCategory: 'vendorReports_revenueByCategory',
  topCustomers: 'vendorReports_topCustomers',
  financialSummary: 'vendorReports_financialSummary',
  hourlySales: 'vendorReports_hourlySales',
  dateRange: 'vendorReports_dateRange',
};

export function saveReportsDataToStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save reports data to localStorage', e);
  }
}

export function loadReportsDataFromStorage<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (e) {
    console.warn('Failed to load reports data from localStorage', e);
  }
  return null;
}

export { STORAGE_KEYS };
