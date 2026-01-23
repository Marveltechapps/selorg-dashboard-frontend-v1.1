import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  fetchSalesOverview,
  fetchSalesData,
  fetchProductPerformance,
  fetchOrderAnalytics,
  fetchCustomerInsights,
  fetchRevenueByCategory,
  fetchTopCustomers,
  fetchFinancialSummary,
  fetchHourlySales,
  exportReport,
  SalesOverview,
  SalesData,
  ProductPerformance,
  OrderAnalytics,
  CustomerInsight,
  RevenueByCategory,
  TopCustomer,
  FinancialSummary,
  HourlySales,
} from './reportsApi';
import { toast } from 'sonner';
import { exportToCSV } from '../../../utils/csvExport';
import { exportToPDF } from '../../../utils/pdfExport';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Download,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  Star,
  Percent,
} from 'lucide-react';

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(false);

  // State management
  const [salesOverview, setSalesOverview] = useState<SalesOverview | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [hourlySales, setHourlySales] = useState<HourlySales[]>([]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        overview,
        sales,
        products,
        orders,
        customers,
        categories,
        topCust,
        financial,
        hourly,
      ] = await Promise.all([
        fetchSalesOverview(dateRange),
        fetchSalesData(dateRange),
        fetchProductPerformance('revenue'),
        fetchOrderAnalytics(),
        fetchCustomerInsights(),
        fetchRevenueByCategory(),
        fetchTopCustomers(5),
        fetchFinancialSummary(),
        fetchHourlySales(),
      ]);

      setSalesOverview(overview);
      setSalesData(sales);
      setProductPerformance(products);
      setOrderAnalytics(orders);
      setCustomerInsights(customers);
      setRevenueByCategory(categories);
      setTopCustomers(topCust);
      setFinancialSummary(financial);
      setHourlySales(hourly);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType: string, format: 'csv' | 'pdf') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      if (format === 'csv') {
        const csvData: (string | number)[][] = [
          ['Vendor Reports & Analytics', `Date: ${today}`, `Time: ${timestamp}`],
          [''],
          ['Report Type', reportType],
          [''],
          ['Note: This is a summary export. Detailed analytics data would be included in production.'],
        ];
        exportToCSV(csvData, `vendor-reports-${reportType}-${today}-${timestamp.replace(/:/g, '-')}`);
      } else {
        const htmlContent = `
          <h1>Vendor Reports & Analytics</h1>
          <h2>${reportType}</h2>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Report Type: ${reportType}</p>
        `;
        exportToPDF(htmlContent, `vendor-reports-${reportType}-${today}`);
      }
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <ArrowUpRight size={14} className="text-emerald-600" />;
    if (trend === 'down') return <ArrowDownRight size={14} className="text-rose-600" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading && !salesOverview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Track your sales performance and business metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 bg-white border-gray-200 text-gray-900">
              <Calendar size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={loadData} variant="outline" className="bg-white border-gray-200 text-gray-900 hover:bg-gray-50">
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => handleExport('sales', 'pdf')} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {salesOverview && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="text-emerald-600" size={18} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesOverview.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {salesOverview.revenueGrowth >= 0 ? (
                    <ArrowUpRight size={14} className="text-emerald-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-rose-600" />
                  )}
                  <span className={`text-xs font-medium ${salesOverview.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercentage(salesOverview.revenueGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Total Orders</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingCart className="text-blue-600" size={18} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{salesOverview.totalOrders.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  {salesOverview.ordersGrowth >= 0 ? (
                    <ArrowUpRight size={14} className="text-emerald-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-rose-600" />
                  )}
                  <span className={`text-xs font-medium ${salesOverview.ordersGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercentage(salesOverview.ordersGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="text-purple-600" size={18} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesOverview.avgOrderValue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {salesOverview.avgOrderGrowth >= 0 ? (
                    <ArrowUpRight size={14} className="text-emerald-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-rose-600" />
                  )}
                  <span className={`text-xs font-medium ${salesOverview.avgOrderGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercentage(salesOverview.avgOrderGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">Active Products</p>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Package className="text-amber-600" size={18} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{salesOverview.totalProducts}</p>
                <div className="flex items-center gap-1 mt-1">
                  {salesOverview.productsGrowth >= 0 ? (
                    <ArrowUpRight size={14} className="text-emerald-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-rose-600" />
                  )}
                  <span className={`text-xs font-medium ${salesOverview.productsGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatPercentage(salesOverview.productsGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent rounded-none h-auto p-0">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] rounded-none text-gray-500 data-[state=active]:text-[#4F46E5]">
            <BarChart3 size={14} className="mr-1.5" /> Sales Overview
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] rounded-none text-gray-500 data-[state=active]:text-[#4F46E5]">
            <Package size={14} className="mr-1.5" /> Product Performance
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] rounded-none text-gray-500 data-[state=active]:text-[#4F46E5]">
            <ShoppingCart size={14} className="mr-1.5" /> Order Analytics
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] rounded-none text-gray-500 data-[state=active]:text-[#4F46E5]">
            <Users size={14} className="mr-1.5" /> Customer Insights
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:border-b-2 data-[state=active]:border-[#4F46E5] rounded-none text-gray-500 data-[state=active]:text-[#4F46E5]">
            <DollarSign size={14} className="mr-1.5" /> Financial Report
          </TabsTrigger>
        </TabsList>

        {/* Sales Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900">Revenue Trend</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">Revenue</Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50">Orders</Badge>
              </div>
            </div>
            <div className="h-64 flex items-end gap-2">
              {salesData.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col gap-2">
                  <div className="relative flex-1 bg-gray-100 rounded-t">
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                      style={{ height: `${(day.revenue / 80000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="relative flex-1 bg-gray-100 rounded-t">
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${(day.orders / 350) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-gray-500 text-center mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Peak Day</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(salesData[salesData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-emerald-600">{formatCurrency(salesData[salesData.length - 1]?.revenue || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Avg Daily Revenue</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatCurrency(Math.round(salesData.reduce((sum, d) => sum + d.revenue, 0) / salesData.length))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Customers</p>
                <p className="text-sm font-bold text-gray-900">
                  {salesData.reduce((sum, d) => sum + d.customers, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue by Category & Hourly Sales */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue by Category */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Revenue by Category</h3>
              <div className="space-y-4">
                {revenueByCategory.map((category, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="text-sm text-gray-900">{category.category}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(category.revenue)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${category.percentage}%`, backgroundColor: category.color }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{category.percentage.toFixed(1)}% of total revenue</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Sales Pattern */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Hourly Sales Pattern</h3>
              <div className="h-64 flex items-end gap-1">
                {hourlySales.slice(6, 24).map((hour, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    <div className="flex-1 w-full bg-gray-100 rounded-t relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t group-hover:from-purple-400 group-hover:to-purple-300 transition-all"
                        style={{ height: `${(hour.orders / 160) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[8px] text-gray-500 mt-1">{hour.hour.split(':')[0]}</p>
                    <div className="absolute -top-8 bg-white border border-gray-200 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm z-10">
                      <p className="text-xs text-gray-900 font-bold">{hour.orders} orders</p>
                      <p className="text-[10px] text-gray-500">{formatCurrency(hour.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Peak Hour</p>
                    <p className="text-sm font-bold text-gray-900">19:00 - 20:00</p>
                    <p className="text-xs text-purple-600">156 orders</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Slowest Hour</p>
                    <p className="text-sm font-bold text-gray-900">06:00 - 07:00</p>
                    <p className="text-xs text-gray-500">12 orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Product Performance Tab */}
        <TabsContent value="products" className="mt-6 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Product Performance</h3>
              <Select defaultValue="revenue">
                <SelectTrigger className="w-40 bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">By Revenue</SelectItem>
                  <SelectItem value="units">By Units Sold</SelectItem>
                  <SelectItem value="growth">By Growth Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-500">Product</TableHead>
                  <TableHead className="text-gray-500">Category</TableHead>
                  <TableHead className="text-gray-500">Units Sold</TableHead>
                  <TableHead className="text-gray-500">Revenue</TableHead>
                  <TableHead className="text-gray-500">Stock</TableHead>
                  <TableHead className="text-gray-500">Trend</TableHead>
                  <TableHead className="text-gray-500">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPerformance.map((product) => (
                  <TableRow key={product.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-gray-600 border-gray-200">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">{product.unitsSold.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{formatCurrency(product.revenue)}</TableCell>
                    <TableCell>
                      <span className={product.stock < 100 ? 'text-amber-600' : 'text-gray-500'}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{getTrendIcon(product.trend)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${product.growthRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {product.growthRate >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span className="text-sm font-medium">{formatPercentage(product.growthRate)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Order Analytics Tab */}
        <TabsContent value="orders" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Order Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Order Status Distribution</h3>
              <div className="space-y-4">
                {orderAnalytics.map((status, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm text-gray-900">{status.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{status.count.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">{status.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${status.percentage}%`, backgroundColor: status.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">78.8%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Processed</p>
                  <p className="text-2xl font-bold text-gray-900">1,847</p>
                </div>
              </div>
            </div>

            {/* Top Performing Days */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-6">Daily Performance</h3>
              <div className="space-y-3">
                {salesData.slice().reverse().map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        idx === 0 ? 'bg-emerald-50 text-emerald-600' :
                        idx === 1 ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {idx === 0 ? <Star size={16} /> : <Calendar size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">{day.orders} orders • {day.customers} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(day.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="mt-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {customerInsights.map((insight, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-500 mb-2">{insight.metric}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">
                    {insight.metric.includes('Rate') || insight.metric.includes('Avg') 
                      ? insight.value.toFixed(1)
                      : insight.value.toLocaleString()}
                  </p>
                  <div className={`flex items-center gap-1 ${insight.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {insight.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="text-xs font-medium">{formatPercentage(insight.change)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Customers Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Top Customers</h3>
              <p className="text-xs text-gray-500 mt-1">Customers with highest lifetime value</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-500">Customer</TableHead>
                  <TableHead className="text-gray-500">Email</TableHead>
                  <TableHead className="text-gray-500">Orders</TableHead>
                  <TableHead className="text-gray-500">Total Spent</TableHead>
                  <TableHead className="text-gray-500">Avg Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, idx) => (
                  <TableRow key={customer.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{customer.email}</TableCell>
                    <TableCell className="text-gray-900 font-medium">{customer.orders}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell className="text-gray-900">{formatCurrency(customer.avgOrderValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Financial Report Tab */}
        <TabsContent value="financial" className="mt-6 space-y-6">
          {financialSummary && (
            <>
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Gross Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(financialSummary.grossRevenue)}</p>
                  <p className="text-xs text-gray-500">Total sales before deductions</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Net Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mb-1">{formatCurrency(financialSummary.netRevenue)}</p>
                  <p className="text-xs text-gray-500">After all deductions</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Profit Margin</p>
                  <p className="text-3xl font-bold text-purple-600 mb-1">{financialSummary.profitMargin.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Net / Gross revenue</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Gross Revenue</p>
                        <p className="text-xs text-gray-500">Total sales amount</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(financialSummary.grossRevenue)}</p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                        <Percent className="text-rose-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Platform Fee (10%)</p>
                        <p className="text-xs text-gray-500">Service charges</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-rose-600">-{formatCurrency(financialSummary.platformFee)}</p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Package className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery Charges</p>
                        <p className="text-xs text-gray-500">Logistics costs</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-blue-600">+{formatCurrency(financialSummary.deliveryCharges)}</p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <ArrowDownRight className="text-amber-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Refunds & Returns</p>
                        <p className="text-xs text-gray-500">Customer refunds</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-amber-600">-{formatCurrency(financialSummary.refunds)}</p>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-emerald-50 border-2 border-emerald-100 rounded-lg mt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Net Revenue</p>
                        <p className="text-xs text-emerald-600">Final amount after all adjustments</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(financialSummary.netRevenue)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
