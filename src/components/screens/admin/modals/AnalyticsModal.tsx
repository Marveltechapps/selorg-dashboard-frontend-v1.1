import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  BarChart3,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  AnalyticsData,
  fetchAnalyticsData
} from '../citywideControlApi';
import { 
  LineChart, 
  Line, 
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
  ResponsiveContainer 
} from 'recharts';

interface AnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AnalyticsModal({ open, onClose }: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsData();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) return null;

  const PIE_COLORS = ['#10b981', '#f59e0b', '#6b7280'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={28} />
                Real-Time Analytics Dashboard
              </DialogTitle>
              <p className="text-sm text-[#71717a] mt-1">
                Comprehensive operations insights and performance metrics
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
              <div className="text-sm text-emerald-700">Avg Delivery Time</div>
              <div className="text-2xl font-bold text-emerald-900">14m 22s</div>
              <div className="text-xs text-emerald-600 mt-1">Target: 15m 00s</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700">SLA Compliance</div>
              <div className="text-2xl font-bold text-blue-900">94.2%</div>
              <div className="text-xs text-blue-600 mt-1">Last 24 hours</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-700">Order Completion</div>
              <div className="text-2xl font-bold text-purple-900">99.1%</div>
              <div className="text-xs text-purple-600 mt-1">Success rate</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-700">Customer Satisfaction</div>
              <div className="text-2xl font-bold text-amber-900">4.8/5.0</div>
              <div className="text-xs text-amber-600 mt-1">Average rating</div>
            </div>
          </div>

          {/* Order Flow Chart */}
          <div className="bg-white border border-[#e4e4e7] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">Order Flow (Last 2 Hours)</h4>
              <div className="text-sm text-[#71717a]">5-minute intervals</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.orderFlowHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  stroke="#71717a"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#71717a"
                  label={{ value: 'Orders/min', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SLA Performance by Zone */}
          <div className="bg-white border border-[#e4e4e7] p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">Delivery SLA Performance by Zone</h4>
              <div className="text-sm text-[#71717a]">
                <span className="inline-block w-3 h-3 bg-emerald-500 rounded mr-1"></span> Actual
                <span className="inline-block w-3 h-3 bg-rose-500 rounded ml-3 mr-1"></span> Target
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.slaPerformanceByZone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis 
                  dataKey="zone" 
                  tick={{ fontSize: 11 }}
                  stroke="#71717a"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#71717a"
                  label={{ value: 'Time (mins)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="actual" fill="#10b981" name="Actual Time" />
                <Bar dataKey="target" fill="#ef4444" name="Target" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rider Utilization */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#e4e4e7] p-4 rounded-lg">
              <h4 className="font-bold mb-4">Rider Utilization</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.riderUtilization}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status.split(' ')[0]}: ${percent}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percent"
                  >
                    {analytics.riderUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analytics.riderUtilization.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      ></div>
                      <span>{item.status}</span>
                    </div>
                    <span className="font-bold">{item.count} riders</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e4e4e7] p-4 rounded-lg">
              <h4 className="font-bold mb-4">Performance Summary</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#71717a]">Total Active Riders</span>
                    <span className="font-bold">1,204</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#71717a]">Orders in Transit</span>
                    <span className="font-bold">987</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#71717a]">Avg Orders per Rider</span>
                    <span className="font-bold">0.82</span>
                  </div>
                </div>

                <div className="border-t border-[#e4e4e7] pt-4">
                  <h5 className="font-bold mb-2">Efficiency Metrics</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Dispatch Time</span>
                      <span className="font-medium">45s avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Pickup Time</span>
                      <span className="font-medium">3m 22s avg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717a]">Delivery Time</span>
                      <span className="font-medium">14m 22s avg</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e4e4e7] pt-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <TrendingUp size={16} />
                      Overall Performance
                    </div>
                    <div className="text-2xl font-bold text-emerald-900 mt-2">Excellent</div>
                    <div className="text-xs text-emerald-700 mt-1">
                      All metrics within target range
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}