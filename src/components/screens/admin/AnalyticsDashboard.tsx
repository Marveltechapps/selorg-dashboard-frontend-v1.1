import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchRealtimeMetrics,
  fetchTimeSeriesData,
  fetchProductPerformance,
  fetchCategoryAnalytics,
  fetchRegionalPerformance,
  fetchCustomerMetrics,
  fetchOperationalMetrics,
  fetchRevenueBreakdown,
  fetchGrowthTrends,
  fetchPeakHours,
  fetchConversionFunnel,
  fetchPaymentMethods,
  RealtimeMetrics,
  TimeSeriesData,
  ProductPerformance,
  CategoryAnalytics,
  RegionalPerformance,
  CustomerMetrics,
  OperationalMetrics,
  RevenueBreakdown,
  GrowthTrend,
  PeakHourData,
  ConversionFunnel,
  PaymentMethodAnalytics,
} from './analyticsApi';
import { toast } from 'sonner@2.0.3';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Package,
  MapPin,
  Clock,
  Star,
  Activity,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export function AnalyticsDashboard() {
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);
  const [regionalPerformance, setRegionalPerformance] = useState<RegionalPerformance[]>([]);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [operationalMetrics, setOperationalMetrics] = useState<OperationalMetrics | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [growthTrends, setGrowthTrends] = useState<GrowthTrend[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourData[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        metrics,
        timeSeries,
        products,
        categories,
        regions,
        customers,
        operations,
        revenue,
        growth,
        peaks,
        funnel,
        payments,
      ] = await Promise.all([
        fetchRealtimeMetrics(),
        fetchTimeSeriesData(timeRange),
        fetchProductPerformance(),
        fetchCategoryAnalytics(),
        fetchRegionalPerformance(),
        fetchCustomerMetrics(),
        fetchOperationalMetrics(),
        fetchRevenueBreakdown(),
        fetchGrowthTrends(),
        fetchPeakHours(),
        fetchConversionFunnel(),
        fetchPaymentMethods(),
      ]);

      setRealtimeMetrics(metrics);
      setTimeSeriesData(timeSeries);
      setProductPerformance(products);
      setCategoryAnalytics(categories);
      setRegionalPerformance(regions);
      setCustomerMetrics(customers);
      setOperationalMetrics(operations);
      setRevenueBreakdown(revenue);
      setGrowthTrends(growth);
      setPeakHours(peaks);
      setConversionFunnel(funnel);
      setPaymentMethods(payments);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${(value / 1000).toFixed(1)}K`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="text-emerald-500" size={16} />
    ) : (
      <ArrowDownRight className="text-rose-500" size={16} />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#71717a]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Analytics Dashboard</h1>
          <p className="text-[#71717a] text-sm">Real-time insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <Calendar size={14} className="mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={loadData} variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Revenue</p>
            <DollarSign className="text-emerald-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">
            ₹{(realtimeMetrics?.totalRevenue || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(realtimeMetrics?.revenueGrowth || 0)}
            <span className={`text-xs font-medium ${getGrowthColor(realtimeMetrics?.revenueGrowth || 0)}`}>
              {realtimeMetrics?.revenueGrowth}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Orders</p>
            <ShoppingCart className="text-blue-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">
            {(realtimeMetrics?.totalOrders || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(realtimeMetrics?.ordersGrowth || 0)}
            <span className={`text-xs font-medium ${getGrowthColor(realtimeMetrics?.ordersGrowth || 0)}`}>
              {realtimeMetrics?.ordersGrowth}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Active Users</p>
            <Users className="text-purple-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">
            {(realtimeMetrics?.activeUsers || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(realtimeMetrics?.usersGrowth || 0)}
            <span className={`text-xs font-medium ${getGrowthColor(realtimeMetrics?.usersGrowth || 0)}`}>
              {realtimeMetrics?.usersGrowth}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Avg Order Value</p>
            <Target className="text-amber-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">
            ₹{(realtimeMetrics?.averageOrderValue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-[#71717a] mt-2">
            Conversion: {realtimeMetrics?.conversionRate}%
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 size={14} className="mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign size={14} className="mr-1.5" /> Revenue
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package size={14} className="mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users size={14} className="mr-1.5" /> Customers
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Activity size={14} className="mr-1.5" /> Operations
          </TabsTrigger>
          <TabsTrigger value="regional">
            <MapPin size={14} className="mr-1.5" /> Regional
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp size={14} className="mr-1.5" /> Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4">
            {/* Revenue & Orders Timeline */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-2">
              <h3 className="font-bold text-[#18181b] mb-4">Revenue & Orders Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).getHours() + ':00'}
                    stroke="#71717a"
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value: any) => [typeof value === 'number' ? formatCurrency(value) : value]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="Revenue"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown Pie Chart */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#18181b] mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#18181b] mb-4">Peak Hours Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="hour" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                  />
                  <Bar dataKey="orders" fill="#f59e0b" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-2">
              <h3 className="font-bold text-[#18181b] mb-4">Conversion Funnel</h3>
              <div className="space-y-3">
                {conversionFunnel.map((stage, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#18181b]">{stage.stage}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#71717a]">{formatNumber(stage.users)} users</span>
                        <span className="text-sm font-bold text-[#18181b]">{stage.conversionRate}%</span>
                      </div>
                    </div>
                    <div className="w-full h-8 bg-[#e4e4e7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-end pr-3"
                        style={{ width: `${stage.conversionRate}%` }}
                      >
                        {idx < conversionFunnel.length - 1 && stage.dropoffRate > 0 && (
                          <span className="text-xs text-white font-medium">
                            -{stage.dropoffRate.toFixed(1)}% drop
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-2 gap-4">
            {/* Monthly Growth Trends */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-2">
              <h3 className="font-bold text-[#18181b] mb-4">Monthly Revenue & Growth Trends</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="period" stroke="#71717a" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenueGrowth"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Growth %"
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-2">
              <h3 className="font-bold text-[#18181b] mb-4">Category Performance</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>AOV</TableHead>
                    <TableHead>% of Total</TableHead>
                    <TableHead>Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryAnalytics.map((cat, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₹{cat.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{cat.orders.toLocaleString()}</TableCell>
                      <TableCell>₹{cat.averageOrderValue}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cat.percentageOfTotal}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(cat.growthRate)}
                          <span className={getGrowthColor(cat.growthRate)}>
                            {cat.growthRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Payment Methods */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-2">
              <h3 className="font-bold text-[#18181b] mb-4">Payment Method Distribution</h3>
              <div className="grid grid-cols-5 gap-4">
                {paymentMethods.map((method, idx) => (
                  <div key={idx} className="border border-[#e4e4e7] rounded-lg p-4">
                    <p className="text-xs text-[#71717a] mb-1">{method.method}</p>
                    <p className="text-xl font-bold text-[#18181b] mb-1">{method.percentage}%</p>
                    <p className="text-xs text-[#71717a]">₹{(method.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-[#71717a] mt-1">{method.transactions} txns</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Top Performing Products</h3>
              <p className="text-xs text-[#71717a] mt-1">Best sellers by revenue and units sold</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPerformance.map((product, idx) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge
                          className={
                            idx === 0
                              ? 'bg-amber-500'
                              : idx === 1
                              ? 'bg-gray-400'
                              : idx === 2
                              ? 'bg-orange-600'
                              : 'bg-gray-300'
                          }
                        >
                          #{idx + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₹{product.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{product.unitsSold}</TableCell>
                      <TableCell>₹{product.averagePrice}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(product.growthRate)}
                          <span className={getGrowthColor(product.growthRate)}>
                            {product.growthRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={product.stockLevel < 100 ? 'border-rose-500 text-rose-600' : ''}
                        >
                          {product.stockLevel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="grid grid-cols-3 gap-4">
            {/* Customer Metrics Cards */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Total Customers</p>
                <Users className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-[#18181b]">
                {customerMetrics?.totalCustomers.toLocaleString()}
              </p>
              <p className="text-xs text-[#71717a] mt-2">
                New: {customerMetrics?.newCustomers.toLocaleString()} | Returning:{' '}
                {customerMetrics?.returningCustomers.toLocaleString()}
              </p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Avg Lifetime Value</p>
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                ₹{customerMetrics?.averageLifetimeValue.toLocaleString()}
              </p>
              <p className="text-xs text-[#71717a] mt-2">
                CAC: ₹{customerMetrics?.customerAcquisitionCost}
              </p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Retention Rate</p>
                <Target className="text-purple-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {customerMetrics?.customerRetentionRate}%
              </p>
              <p className="text-xs text-[#71717a] mt-2">
                Churn: {customerMetrics?.churnRate}%
              </p>
            </div>

            {/* User Activity Chart */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm col-span-3">
              <h3 className="font-bold text-[#18181b] mb-4">User Activity Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).getHours() + ':00'}
                    stroke="#71717a"
                    fontSize={12}
                  />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Active Users"
                    dot={{ fill: '#8b5cf6', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="conversionRate"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Conversion Rate %"
                    dot={{ fill: '#f59e0b', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations">
          <div className="grid grid-cols-3 gap-4">
            {/* Operational Metrics Cards */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Avg Delivery Time</p>
                <Clock className="text-blue-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-[#18181b]">
                {operationalMetrics?.averageDeliveryTime} min
              </p>
              <p className="text-xs text-emerald-600 mt-2">
                On-time: {operationalMetrics?.onTimeDeliveryRate}%
              </p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Order Fulfillment</p>
                <Activity className="text-emerald-600" size={20} />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {operationalMetrics?.orderFulfillmentRate}%
              </p>
              <p className="text-xs text-[#71717a] mt-2">Target: 98%</p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#71717a]">Customer Rating</p>
                <Star className="text-amber-500" size={20} />
              </div>
              <p className="text-3xl font-bold text-amber-600">
                {operationalMetrics?.averageRating}
              </p>
              <p className="text-xs text-[#71717a] mt-2">Out of 5.0</p>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#18181b]">Cancellation Rate</p>
                <span className="text-2xl font-bold text-rose-600">
                  {operationalMetrics?.cancellationRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500"
                  style={{ width: `${operationalMetrics?.cancellationRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#18181b]">Refund Rate</p>
                <span className="text-2xl font-bold text-amber-600">
                  {operationalMetrics?.refundRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{ width: `${operationalMetrics?.refundRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-[#18181b]">On-Time Delivery</p>
                <span className="text-2xl font-bold text-emerald-600">
                  {operationalMetrics?.onTimeDeliveryRate}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${operationalMetrics?.onTimeDeliveryRate}%` }}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Regional Tab */}
        <TabsContent value="regional">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Regional Performance Analysis</h3>
              <p className="text-xs text-[#71717a] mt-1">Performance metrics by city and region</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>Avg Delivery</TableHead>
                    <TableHead>Satisfaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalPerformance.map((region, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant="outline">{region.region}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{region.city}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₹{region.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>{region.orders.toLocaleString()}</TableCell>
                      <TableCell>{region.activeUsers.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            region.averageDeliveryTime < 30
                              ? 'bg-emerald-500'
                              : region.averageDeliveryTime < 35
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }
                        >
                          {region.averageDeliveryTime} min
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-500" size={14} />
                          <span className="font-medium">{region.customerSatisfaction}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Regional Chart */}
            <div className="p-6 border-t border-[#e4e4e7]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionalPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="city" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} tickFormatter={formatCurrency} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-4">
            {/* Growth Trends */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#18181b] mb-4">12-Month Growth Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="period" stroke="#71717a" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#71717a" fontSize={12} tickFormatter={formatCurrency} />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Revenue"
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Orders"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenueGrowth"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Revenue Growth %"
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Summary Table */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
                <h3 className="font-bold text-[#18181b]">Monthly Performance Summary</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue Growth</TableHead>
                    <TableHead>Orders Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {growthTrends.slice(-6).map((trend, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{trend.period}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₹{(trend.revenue / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell>{trend.orders.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(trend.revenueGrowth)}
                          <span className={getGrowthColor(trend.revenueGrowth)}>
                            {trend.revenueGrowth}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getGrowthIcon(trend.ordersGrowth)}
                          <span className={getGrowthColor(trend.ordersGrowth)}>
                            {trend.ordersGrowth}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
