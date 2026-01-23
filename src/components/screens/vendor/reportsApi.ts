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

// --- API Functions ---

export async function fetchSalesOverview(dateRange?: string, vendorId?: string): Promise<SalesOverview> {
  const params = new URLSearchParams();
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }
  if (vendorId) params.append('vendorId', vendorId);

  const response = await apiRequest<{ success: boolean; data: SalesOverview }>(
    `/vendor/reports/sales/overview?${params.toString()}`
  );
  return response.data;
}

export async function fetchSalesData(dateRange?: string, vendorId?: string, groupBy: string = 'day'): Promise<SalesData[]> {
  const params = new URLSearchParams();
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }
  if (vendorId) params.append('vendorId', vendorId);
  params.append('groupBy', groupBy);

  const response = await apiRequest<{ success: boolean; data: SalesData[] }>(
    `/vendor/reports/sales/data?${params.toString()}`
  );
  return response.data;
}

export async function fetchProductPerformance(sortBy?: string, vendorId?: string, dateRange?: string): Promise<ProductPerformance[]> {
  const params = new URLSearchParams();
  if (sortBy) params.append('sortBy', sortBy);
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: ProductPerformance[] }>(
    `/vendor/reports/products/performance?${params.toString()}`
  );
  return response.data;
}

export async function fetchOrderAnalytics(vendorId?: string, dateRange?: string): Promise<OrderAnalytics[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: OrderAnalytics[] }>(
    `/vendor/reports/orders/analytics?${params.toString()}`
  );
  return response.data;
}

export async function fetchCustomerInsights(vendorId?: string, dateRange?: string): Promise<CustomerInsight[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: CustomerInsight[] }>(
    `/vendor/reports/customers/insights?${params.toString()}`
  );
  return response.data || [];
}

export async function fetchRevenueByCategory(vendorId?: string, dateRange?: string): Promise<RevenueByCategory[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: RevenueByCategory[] }>(
    `/vendor/reports/revenue/category?${params.toString()}`
  );
  return response.data;
}

export async function fetchTopCustomers(limit?: number, vendorId?: string, dateRange?: string): Promise<TopCustomer[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: TopCustomer[] }>(
    `/vendor/reports/customers/top?${params.toString()}`
  );
  return response.data || [];
}

export async function fetchFinancialSummary(vendorId?: string, dateRange?: string): Promise<FinancialSummary> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (dateRange) {
    const [start, end] = dateRange.split(' to ');
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
  }

  const response = await apiRequest<{ success: boolean; data: FinancialSummary }>(
    `/vendor/reports/financial/summary?${params.toString()}`
  );
  return response.data;
}

export async function fetchHourlySales(vendorId?: string, date?: string): Promise<HourlySales[]> {
  const params = new URLSearchParams();
  if (vendorId) params.append('vendorId', vendorId);
  if (date) params.append('date', date);

  const response = await apiRequest<{ success: boolean; data: HourlySales[] }>(
    `/vendor/reports/sales/hourly?${params.toString()}`
  );
  return response.data;
}

export async function exportReport(reportType: string, format: 'csv' | 'pdf'): Promise<{ url: string }> {
  // TODO: Implement backend endpoint for report export
  // For now, return mock response
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { url: `https://example.com/reports/${reportType}-export.${format}` };
}
