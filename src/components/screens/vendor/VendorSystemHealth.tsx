import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wifi,
  HardDrive,
  Cpu,
  Network,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Download,
  Settings,
  Eye,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { exportToCSV } from '../../../utils/csvExport';
import { exportToPDF } from '../../../utils/pdfExport';
import { toast } from 'sonner';

// Mock API for system metrics
const generateSystemMetrics = () => {
  const now = Date.now();
  return {
    uptime: 99.96,
    totalRequests: Math.floor(Math.random() * 50000) + 120000,
    avgLatency: Math.floor(Math.random() * 30) + 35,
    errorRate: (Math.random() * 0.5 + 0.1).toFixed(2),
    activeConnections: Math.floor(Math.random() * 100) + 450,
    cpuUsage: Math.floor(Math.random() * 20) + 45,
    memoryUsage: Math.floor(Math.random() * 15) + 62,
    diskUsage: Math.floor(Math.random() * 10) + 38,
    networkIn: (Math.random() * 50 + 150).toFixed(1),
    networkOut: (Math.random() * 30 + 80).toFixed(1)
  };
};

const generatePerformanceData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: `${23 - i}:00`,
      latency: Math.floor(Math.random() * 40) + 30,
      requests: Math.floor(Math.random() * 5000) + 3000,
      errors: Math.floor(Math.random() * 50) + 10,
      cpu: Math.floor(Math.random() * 30) + 40,
      memory: Math.floor(Math.random() * 20) + 55
    });
  }
  return data;
};

const generateServiceStatus = () => [
  {
    id: 1,
    name: 'Vendor Portal API',
    type: 'REST API',
    status: 'operational',
    uptime: 99.98,
    responseTime: 42,
    lastCheck: '30 seconds ago',
    endpoint: 'https://api.vendor.quickcommerce.io',
    requests24h: 145820
  },
  {
    id: 2,
    name: 'Purchase Order Service',
    type: 'Microservice',
    status: 'operational',
    uptime: 99.95,
    responseTime: 38,
    lastCheck: '1 minute ago',
    endpoint: 'https://po-service.internal',
    requests24h: 89430
  },
  {
    id: 3,
    name: 'Inventory Sync',
    type: 'Background Job',
    status: 'degraded',
    uptime: 98.2,
    responseTime: 125,
    lastCheck: '2 minutes ago',
    endpoint: 'https://inventory-sync.internal',
    requests24h: 45200
  },
  {
    id: 4,
    name: 'EDI Gateway',
    type: 'Integration',
    status: 'operational',
    uptime: 99.92,
    responseTime: 156,
    lastCheck: '45 seconds ago',
    endpoint: 'https://edi.gateway.io',
    requests24h: 12340
  },
  {
    id: 5,
    name: 'Email Service (SMTP)',
    type: 'Notification',
    status: 'degraded',
    uptime: 97.8,
    responseTime: 890,
    lastCheck: '3 minutes ago',
    endpoint: 'smtp://mail.quickcommerce.io',
    requests24h: 8920
  },
  {
    id: 6,
    name: 'Database Primary',
    type: 'PostgreSQL',
    status: 'operational',
    uptime: 99.99,
    responseTime: 8,
    lastCheck: '15 seconds ago',
    endpoint: 'postgres://db-primary.internal',
    requests24h: 234500
  },
  {
    id: 7,
    name: 'Cache Layer (in-memory)',
    type: 'Cache',
    status: 'operational',
    uptime: 99.97,
    responseTime: 2,
    lastCheck: '20 seconds ago',
    endpoint: 'in-memory',
    requests24h: 456780
  },
  {
    id: 8,
    name: 'File Storage (S3)',
    type: 'Object Storage',
    status: 'operational',
    uptime: 99.99,
    responseTime: 95,
    lastCheck: '1 minute ago',
    endpoint: 'https://s3.vendor-assets.io',
    requests24h: 34200
  },
  {
    id: 9,
    name: 'Authentication Service',
    type: 'OAuth2',
    status: 'operational',
    uptime: 99.94,
    responseTime: 67,
    lastCheck: '25 seconds ago',
    endpoint: 'https://auth.quickcommerce.io',
    requests24h: 67800
  },
  {
    id: 10,
    name: 'WebSocket Server',
    type: 'Real-time',
    status: 'warning',
    uptime: 99.1,
    responseTime: 45,
    lastCheck: '40 seconds ago',
    endpoint: 'wss://ws.vendor.io',
    requests24h: 23400
  }
];

const generateErrorLogs = () => [
  {
    id: 1,
    timestamp: new Date(Date.now() - 180000).toISOString(),
    service: 'Inventory Sync',
    level: 'error',
    message: 'Connection timeout to external vendor API',
    code: 'TIMEOUT_ERROR',
    details: 'Failed to sync inventory after 30s timeout',
    count: 3
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 420000).toISOString(),
    service: 'Email Service (SMTP)',
    level: 'warning',
    message: 'High latency detected in email delivery',
    code: 'PERF_DEGRADED',
    details: 'Average response time > 800ms',
    count: 12
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    service: 'WebSocket Server',
    level: 'warning',
    message: 'Connection pool near capacity',
    code: 'POOL_WARNING',
    details: '85% of max connections in use',
    count: 1
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    service: 'Purchase Order Service',
    level: 'info',
    message: 'Deployment completed successfully',
    code: 'DEPLOY_SUCCESS',
    details: 'Version 2.4.1 deployed',
    count: 1
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    service: 'Database Primary',
    level: 'warning',
    message: 'Slow query detected',
    code: 'SLOW_QUERY',
    details: 'Query execution time > 5s',
    count: 2
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    service: 'EDI Gateway',
    level: 'error',
    message: 'Failed to parse incoming EDI message',
    code: 'PARSE_ERROR',
    details: 'Invalid format in X12 850 document',
    count: 1
  },
  {
    id: 7,
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    service: 'Vendor Portal API',
    level: 'info',
    message: 'Rate limit increased for vendor V-1234',
    code: 'RATE_LIMIT_UPDATE',
    details: 'New limit: 1000 req/min',
    count: 1
  },
  {
    id: 8,
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    service: 'Authentication Service',
    level: 'warning',
    message: 'Multiple failed login attempts detected',
    code: 'AUTH_FAILED',
    details: 'IP: 192.168.1.45 - 5 failed attempts',
    count: 5
  }
];

const generateAlerts = () => [
  {
    id: 1,
    title: 'Inventory Sync Latency Spike',
    severity: 'high',
    service: 'Inventory Sync',
    message: 'Response time exceeded threshold (125ms vs 50ms SLA)',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    status: 'active',
    acknowledgedBy: null
  },
  {
    id: 2,
    title: 'Email Service Performance Degradation',
    severity: 'medium',
    service: 'Email Service (SMTP)',
    message: 'Average latency increased by 300% in last 15 minutes',
    timestamp: new Date(Date.now() - 420000).toISOString(),
    status: 'active',
    acknowledgedBy: null
  },
  {
    id: 3,
    title: 'WebSocket Connection Pool Warning',
    severity: 'medium',
    service: 'WebSocket Server',
    message: 'Connection pool usage at 85% - consider scaling',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'acknowledged',
    acknowledgedBy: 'system.admin'
  },
  {
    id: 4,
    title: 'Database Slow Query Alert',
    severity: 'low',
    service: 'Database Primary',
    message: '2 queries exceeded 5s execution time',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    status: 'resolved',
    acknowledgedBy: 'db.admin'
  }
];

// Load data from localStorage
const loadAlertsFromStorage = () => {
  try {
    const saved = localStorage.getItem('vendorSystemHealth_alerts');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load alerts from localStorage', e);
  }
  return null;
};

const saveAlertsToStorage = (alerts: any[]) => {
  try {
    localStorage.setItem('vendorSystemHealth_alerts', JSON.stringify(alerts));
  } catch (e) {
    console.warn('Failed to save alerts to localStorage', e);
  }
};

const loadServiceConfigFromStorage = () => {
  try {
    const saved = localStorage.getItem('vendorSystemHealth_serviceConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load service config from localStorage', e);
  }
  return { checkInterval: 30, responseTimeThreshold: 100, uptimeThreshold: 99 };
};

const saveServiceConfigToStorage = (config: any) => {
  try {
    localStorage.setItem('vendorSystemHealth_serviceConfig', JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save service config to localStorage', e);
  }
};

export function VendorSystemHealth() {
  const [metrics, setMetrics] = useState(generateSystemMetrics());
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());
  const [services, setServices] = useState(generateServiceStatus());
  const [errorLogs, setErrorLogs] = useState(generateErrorLogs());
  
  // Load alerts from localStorage or use default
  const [alerts, setAlerts] = useState(() => {
    const saved = loadAlertsFromStorage();
    return saved || generateAlerts();
  });
  
  const [selectedView, setSelectedView] = useState<'overview' | 'services' | 'logs' | 'alerts'>('overview');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [logLevelFilter, setLogLevelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false); // Default to false - only refresh when checked
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Service configuration state - load from localStorage
  const [serviceConfig, setServiceConfig] = useState(loadServiceConfigFromStorage);
  
  // Modal states
  const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
  const [showConfigureServicesModal, setShowConfigureServicesModal] = useState(false);
  const [showServiceUsageModal, setShowServiceUsageModal] = useState(false);
  const [showErrorLogDetailsModal, setShowErrorLogDetailsModal] = useState(false);
  const [showAlertDetailsModal, setShowAlertDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedErrorLog, setSelectedErrorLog] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Manual refresh function - preserve alerts and service config from localStorage
  const handleManualRefresh = () => {
    setMetrics(generateSystemMetrics());
    setPerformanceData(generatePerformanceData());
    setServices(generateServiceStatus());
    setErrorLogs(generateErrorLogs());
    // Don't regenerate alerts - keep the persisted ones
    // setAlerts(generateAlerts());
    setLastUpdated(new Date());
  };

  // Auto-refresh every 5 seconds - only when autoRefresh is true
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleManualRefresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', icon: CheckCircle2 };
      case 'degraded':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', icon: AlertTriangle };
      case 'warning':
        return { bg: 'bg-[#FED7AA]', text: 'text-[#9A3412]', icon: AlertTriangle };
      case 'down':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', icon: XCircle };
      default:
        return { bg: 'bg-[#E5E7EB]', text: 'text-[#374151]', icon: Activity };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' };
      case 'medium':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' };
      case 'low':
        return { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' };
      default:
        return { bg: 'bg-[#E5E7EB]', text: 'text-[#374151]' };
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' };
      case 'warning':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' };
      case 'info':
        return { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' };
      default:
        return { bg: 'bg-[#E5E7EB]', text: 'text-[#374151]' };
    }
  };

  const filteredServices = services.filter(service => {
    if (serviceFilter === 'all') return true;
    return service.status === serviceFilter;
  });

  const filteredLogs = errorLogs.filter(log => {
    const matchesLevel = logLevelFilter === 'all' || log.level === logLevelFilter;
    const matchesSearch = searchTerm === '' || 
      log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');

  // Export report function
  const handleExportReport = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      const csvData: (string | number)[][] = [
        ['System Monitoring Report', `Date: ${today}`, `Time: ${timestamp}`],
        [''],
        
        // System Metrics
        ['=== SYSTEM METRICS ==='],
        ['Uptime', `${metrics.uptime}%`],
        ['Total Requests', metrics.totalRequests],
        ['Avg Latency', `${metrics.avgLatency}ms`],
        ['Error Rate', `${metrics.errorRate}%`],
        ['Active Connections', metrics.activeConnections],
        ['CPU Usage', `${metrics.cpuUsage}%`],
        ['Memory Usage', `${metrics.memoryUsage}%`],
        ['Disk Usage', `${metrics.diskUsage}%`],
        ['Network In', `${metrics.networkIn} MB/s`],
        ['Network Out', `${metrics.networkOut} MB/s`],
        [''],
        
        // Services
        ['=== SERVICES STATUS ==='],
        ['Service Name', 'Type', 'Status', 'Uptime', 'Response Time (ms)', '24h Requests', 'Endpoint'],
        ...services.map(s => [
          s.name,
          s.type,
          s.status,
          `${s.uptime}%`,
          s.responseTime,
          s.requests24h,
          s.endpoint,
        ]),
        [''],
        
        // Error Logs
        ['=== ERROR LOGS ==='],
        ['Timestamp', 'Service', 'Level', 'Message', 'Code', 'Details', 'Count'],
        ...errorLogs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.service,
          log.level,
          log.message,
          log.code,
          log.details,
          log.count,
        ]),
        [''],
        
        // Alerts
        ['=== ALERTS ==='],
        ['Title', 'Severity', 'Service', 'Status', 'Message', 'Timestamp', 'Acknowledged By'],
        ...alerts.map(a => [
          a.title,
          a.severity,
          a.service,
          a.status,
          a.message,
          new Date(a.timestamp).toLocaleString(),
          a.acknowledgedBy || 'N/A',
        ]),
      ];
      
      exportToCSV(csvData, `system-monitoring-report-${today}-${timestamp.replace(/:/g, '-')}`);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // Handle alert actions - save to localStorage
  const handleAcknowledgeAlert = (alertId: number) => {
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId 
          ? { ...a, status: 'acknowledged' as const, acknowledgedBy: 'current.user' }
          : a
      );
      saveAlertsToStorage(updated);
      return updated;
    });
    toast.success('Alert acknowledged');
  };

  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => {
      const updated = prev.map(a => 
        a.id === alertId 
          ? { ...a, status: 'resolved' as const }
          : a
      );
      saveAlertsToStorage(updated);
      return updated;
    });
    toast.success('Alert resolved');
  };
  
  // Handle service configuration save
  const handleSaveServiceConfig = () => {
    saveServiceConfigToStorage(serviceConfig);
    toast.success('Service configuration saved');
    setShowConfigureServicesModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Monitoring"
        subtitle="Real-time health, performance metrics, and service status monitoring"
        actions={
          <>
            <div className="text-xs text-[#757575] flex items-center gap-2">
              <Clock size={14} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={() => {
                const newValue = !autoRefresh;
                setAutoRefresh(newValue);
                if (newValue) {
                  handleManualRefresh(); // Refresh immediately when enabled
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-[#4F46E5] text-white' 
                  : 'bg-white text-[#616161] border border-[#E0E0E0]'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </button>
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA] transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
          </>
        }
      />

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-[#FEF3C7] border border-[#FDE047] rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-[#92400E] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-[#92400E] mb-1">
              {activeAlerts.length} Active Alert{activeAlerts.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm text-[#92400E]">
              {activeAlerts[0].title} - {activeAlerts[0].message}
            </p>
          </div>
          <button
            onClick={() => setSelectedView('alerts')}
            className="px-3 py-1.5 bg-[#92400E] text-white rounded-lg text-xs font-medium hover:bg-[#78350F] transition-colors"
          >
            View All
          </button>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-[#E0E0E0]">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'services', label: 'Services', icon: Server },
          { id: 'logs', label: 'Error Logs', icon: AlertTriangle },
          { id: 'alerts', label: 'Alerts', icon: Zap }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                selectedView === view.id
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-[#757575] hover:text-[#212121]'
              }`}
            >
              <Icon size={16} />
              {view.label}
              {view.id === 'alerts' && activeAlerts.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded text-xs font-bold">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#DCFCE7] text-[#166534] rounded-lg">
                  <Activity size={20} />
                </div>
                <TrendingUp size={16} className="text-[#22C55E]" />
              </div>
              <p className="text-xs text-[#757575] font-medium mb-1">System Uptime</p>
              <h3 className="text-2xl font-bold text-[#212121]">{metrics.uptime}%</h3>
              <p className="text-xs text-[#22C55E] mt-1">+0.02% vs last week</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#DBEAFE] text-[#1E40AF] rounded-lg">
                  <Zap size={20} />
                </div>
                <TrendingDown size={16} className="text-[#22C55E]" />
              </div>
              <p className="text-xs text-[#757575] font-medium mb-1">Avg Latency</p>
              <h3 className="text-2xl font-bold text-[#212121]">{metrics.avgLatency}ms</h3>
              <p className="text-xs text-[#22C55E] mt-1">-5ms vs last hour</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#E0E7FF] text-[#4F46E5] rounded-lg">
                  <Globe size={20} />
                </div>
                <TrendingUp size={16} className="text-[#3B82F6]" />
              </div>
              <p className="text-xs text-[#757575] font-medium mb-1">Total Requests</p>
              <h3 className="text-2xl font-bold text-[#212121]">{(metrics.totalRequests / 1000).toFixed(0)}k</h3>
              <p className="text-xs text-[#3B82F6] mt-1">+12% vs yesterday</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#FEF3C7] text-[#92400E] rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <span className="text-xs text-[#757575]">24h</span>
              </div>
              <p className="text-xs text-[#757575] font-medium mb-1">Error Rate</p>
              <h3 className="text-2xl font-bold text-[#212121]">{metrics.errorRate}%</h3>
              <p className="text-xs text-[#757575] mt-1">Within SLA threshold</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-[#F3E8FF] text-[#7C3AED] rounded-lg">
                  <Wifi size={20} />
                </div>
                <span className="text-xs text-[#22C55E] font-medium">Live</span>
              </div>
              <p className="text-xs text-[#757575] font-medium mb-1">Active Connections</p>
              <h3 className="text-2xl font-bold text-[#212121]">{metrics.activeConnections}</h3>
              <p className="text-xs text-[#757575] mt-1">Real-time sessions</p>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Chart */}
            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-[#212121]">Response Time Trend</h3>
                  <p className="text-xs text-[#757575] mt-0.5">Average latency over 24 hours</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#757575]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#4F46E5] rounded-sm" />
                    Latency (ms)
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="time" stroke="#757575" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#757575" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    fill="url(#latencyGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Request Volume Chart */}
            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-[#212121]">Request Volume</h3>
                  <p className="text-xs text-[#757575] mt-0.5">API requests per hour</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#757575]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#10B981] rounded-sm" />
                    Requests
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="time" stroke="#757575" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#757575" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="requests" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="font-bold text-[#212121] mb-4">Resource Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-[#4F46E5]" />
                    <span className="text-sm font-medium text-[#212121]">CPU Usage</span>
                  </div>
                  <span className="text-sm font-bold text-[#212121]">{metrics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div 
                    className="bg-[#4F46E5] h-2 rounded-full transition-all"
                    style={{ width: `${metrics.cpuUsage}%` }}
                  />
                </div>
                <p className="text-xs text-[#757575] mt-1">Optimal range</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-[#10B981]" />
                    <span className="text-sm font-medium text-[#212121]">Memory</span>
                  </div>
                  <span className="text-sm font-bold text-[#212121]">{metrics.memoryUsage}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div 
                    className="bg-[#10B981] h-2 rounded-full transition-all"
                    style={{ width: `${metrics.memoryUsage}%` }}
                  />
                </div>
                <p className="text-xs text-[#757575] mt-1">12.4 GB / 20 GB</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive size={16} className="text-[#F59E0B]" />
                    <span className="text-sm font-medium text-[#212121]">Disk I/O</span>
                  </div>
                  <span className="text-sm font-bold text-[#212121]">{metrics.diskUsage}%</span>
                </div>
                <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                  <div 
                    className="bg-[#F59E0B] h-2 rounded-full transition-all"
                    style={{ width: `${metrics.diskUsage}%` }}
                  />
                </div>
                <p className="text-xs text-[#757575] mt-1">190 GB / 500 GB</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-[#8B5CF6]" />
                    <span className="text-sm font-medium text-[#212121]">Network</span>
                  </div>
                  <span className="text-sm font-bold text-[#212121]">{metrics.networkIn} MB/s</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <div className="text-xs text-[#757575] mb-1">In</div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-1.5">
                      <div className="bg-[#8B5CF6] h-1.5 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[#757575] mb-1">Out</div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-1.5">
                      <div className="bg-[#EC4899] h-1.5 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#757575] mt-1">↓ {metrics.networkIn} / ↑ {metrics.networkOut}</p>
              </div>
            </div>
          </div>

          {/* System Performance Metrics */}
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="font-bold text-[#212121] mb-4">CPU & Memory Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="time" stroke="#757575" style={{ fontSize: '12px' }} />
                <YAxis stroke="#757575" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="CPU Usage (%)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Memory Usage (%)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Services Tab */}
      {selectedView === 'services' && (
        <>
          {/* Service Filters */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Services', count: services.length },
                { value: 'operational', label: 'Operational', count: services.filter(s => s.status === 'operational').length },
                { value: 'degraded', label: 'Degraded', count: services.filter(s => s.status === 'degraded').length },
                { value: 'warning', label: 'Warning', count: services.filter(s => s.status === 'warning').length }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setServiceFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    serviceFilter === filter.value
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA]'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                // Load saved config when opening modal
                setServiceConfig(loadServiceConfigFromStorage());
                setShowConfigureServicesModal(true);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA] transition-colors flex items-center gap-2"
            >
              <Settings size={16} />
              Configure Services
            </button>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(service => {
              const statusConfig = getStatusColor(service.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div key={service.id} className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[#212121]">{service.name}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon size={12} />
                          {service.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#757575]">{service.type}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedService(service);
                        setShowServiceUsageModal(true);
                      }}
                      className="p-2 hover:bg-[#F5F7FA] rounded-lg transition-colors"
                      title="View Usage"
                    >
                      <Eye size={16} className="text-[#757575]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#757575] mb-0.5">Uptime</p>
                      <p className="text-sm font-bold text-[#212121]">{service.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#757575] mb-0.5">Response</p>
                      <p className="text-sm font-bold text-[#212121]">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#757575] mb-0.5">24h Requests</p>
                      <p className="text-sm font-bold text-[#212121]">{(service.requests24h / 1000).toFixed(1)}k</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E0E0E0]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#757575]">Last checked: {service.lastCheck}</span>
                      <button 
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceDetailsModal(true);
                        }}
                        className="text-[#4F46E5] hover:underline font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Logs Tab */}
      {selectedView === 'logs' && (
        <>
          {/* Log Filters */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                type="text"
                placeholder="Search logs by service, message, or error code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Levels' },
                { value: 'error', label: 'Errors' },
                { value: 'warning', label: 'Warnings' },
                { value: 'info', label: 'Info' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setLogLevelFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    logLevelFilter === filter.value
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3 text-left">Timestamp</th>
                    <th className="px-6 py-3 text-left">Service</th>
                    <th className="px-6 py-3 text-left">Level</th>
                    <th className="px-6 py-3 text-left">Message</th>
                    <th className="px-6 py-3 text-left">Code</th>
                    <th className="px-6 py-3 text-left">Count</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {filteredLogs.map(log => {
                    const levelConfig = getLogLevelColor(log.level);
                    
                    return (
                      <tr key={log.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-6 py-4 text-[#616161] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-[#212121]">
                          {log.service}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelConfig.bg} ${levelConfig.text}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#616161] max-w-md">
                          <div className="truncate">{log.message}</div>
                          <div className="text-xs text-[#757575] mt-0.5 truncate">{log.details}</div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-[#F5F7FA] text-[#4F46E5] rounded text-xs font-mono">
                            {log.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-[#616161]">
                          {log.count > 1 && (
                            <span className="px-2 py-1 bg-[#FEE2E2] text-[#991B1B] rounded-full text-xs font-medium">
                              ×{log.count}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedErrorLog(log);
                              setShowErrorLogDetailsModal(true);
                            }}
                            className="text-[#4F46E5] hover:underline text-xs font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Alerts Tab */}
      {selectedView === 'alerts' && (
        <>
          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#FEE2E2] text-[#991B1B] rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                <span className="text-xs text-[#757575]">Active</span>
              </div>
              <h3 className="text-3xl font-bold text-[#212121] mb-1">
                {alerts.filter(a => a.status === 'active').length}
              </h3>
              <p className="text-xs text-[#757575]">Require attention</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#FEF3C7] text-[#92400E] rounded-lg">
                  <Shield size={20} />
                </div>
                <span className="text-xs text-[#757575]">Acknowledged</span>
              </div>
              <h3 className="text-3xl font-bold text-[#212121] mb-1">
                {alerts.filter(a => a.status === 'acknowledged').length}
              </h3>
              <p className="text-xs text-[#757575]">Under investigation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#DCFCE7] text-[#166534] rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <span className="text-xs text-[#757575]">Resolved</span>
              </div>
              <h3 className="text-3xl font-bold text-[#212121] mb-1">
                {alerts.filter(a => a.status === 'resolved').length}
              </h3>
              <p className="text-xs text-[#757575]">Last 24 hours</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-[#E0E7FF] text-[#4F46E5] rounded-lg">
                  <Clock size={20} />
                </div>
                <span className="text-xs text-[#757575]">Avg Time</span>
              </div>
              <h3 className="text-3xl font-bold text-[#212121] mb-1">18m</h3>
              <p className="text-xs text-[#757575]">To acknowledge</p>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.map(alert => {
              const severityConfig = getSeverityColor(alert.severity);
              
              return (
                <div key={alert.id} className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${severityConfig.bg} ${severityConfig.text}`}>
                          {alert.severity}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          alert.status === 'active' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          alert.status === 'acknowledged' ? 'bg-[#FEF3C7] text-[#92400E]' :
                          'bg-[#DCFCE7] text-[#166534]'
                        }`}>
                          {alert.status}
                        </span>
                        <span className="text-xs text-[#757575]">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#212121] mb-1">{alert.title}</h3>
                      <p className="text-sm text-[#616161] mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-[#757575]">
                        <span className="flex items-center gap-1">
                          <Server size={12} />
                          {alert.service}
                        </span>
                        {alert.acknowledgedBy && (
                          <span className="flex items-center gap-1">
                            Acknowledged by: <span className="font-medium text-[#212121]">{alert.acknowledgedBy}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <button 
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-xs font-medium hover:bg-[#4338CA] transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <button 
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1.5 bg-[#10B981] text-white rounded-lg text-xs font-medium hover:bg-[#059669] transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowAlertDetailsModal(true);
                        }}
                        className="px-3 py-1.5 bg-white text-[#616161] border border-[#E0E0E0] rounded-lg text-xs font-medium hover:bg-[#F5F7FA] transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Service Details Modal */}
      <Dialog open={showServiceDetailsModal} onOpenChange={setShowServiceDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedService?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#757575] mb-1">Service Name</p>
                  <p className="font-medium text-[#212121]">{selectedService.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Type</p>
                  <p className="font-medium text-[#212121]">{selectedService.type}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedService.status).bg} ${getStatusColor(selectedService.status).text}`}>
                    {selectedService.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Uptime</p>
                  <p className="font-medium text-[#212121]">{selectedService.uptime}%</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Response Time</p>
                  <p className="font-medium text-[#212121]">{selectedService.responseTime}ms</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">24h Requests</p>
                  <p className="font-medium text-[#212121]">{selectedService.requests24h.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#757575] mb-1">Endpoint</p>
                  <p className="font-medium text-[#212121] break-all">{selectedService.endpoint}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Last Checked</p>
                  <p className="font-medium text-[#212121]">{selectedService.lastCheck}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Configure Services Modal */}
      <Dialog open={showConfigureServicesModal} onOpenChange={setShowConfigureServicesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Services</DialogTitle>
            <DialogDescription>
              Configure service monitoring settings and thresholds
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Check Interval (seconds)</label>
              <input 
                type="number" 
                value={serviceConfig.checkInterval}
                onChange={(e) => setServiceConfig(prev => ({ ...prev, checkInterval: parseInt(e.target.value) || 30 }))}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Response Time Threshold (ms)</label>
              <input 
                type="number" 
                value={serviceConfig.responseTimeThreshold}
                onChange={(e) => setServiceConfig(prev => ({ ...prev, responseTimeThreshold: parseInt(e.target.value) || 100 }))}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Uptime Alert Threshold (%)</label>
              <input 
                type="number" 
                value={serviceConfig.uptimeThreshold}
                onChange={(e) => setServiceConfig(prev => ({ ...prev, uptimeThreshold: parseInt(e.target.value) || 99 }))}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => {
                  // Reset to saved values
                  setServiceConfig(loadServiceConfigFromStorage());
                  setShowConfigureServicesModal(false);
                }}
                className="px-4 py-2 bg-white text-[#616161] border border-[#E0E0E0] rounded-lg hover:bg-[#F5F7FA] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveServiceConfig}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Usage Modal */}
      <Dialog open={showServiceUsageModal} onOpenChange={setShowServiceUsageModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Usage Statistics</DialogTitle>
            <DialogDescription>
              Usage metrics for {selectedService?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F7FA] p-4 rounded-lg">
                  <p className="text-sm text-[#757575] mb-1">24h Requests</p>
                  <p className="text-2xl font-bold text-[#212121]">{selectedService.requests24h.toLocaleString()}</p>
                </div>
                <div className="bg-[#F5F7FA] p-4 rounded-lg">
                  <p className="text-sm text-[#757575] mb-1">Avg Response Time</p>
                  <p className="text-2xl font-bold text-[#212121]">{selectedService.responseTime}ms</p>
                </div>
                <div className="bg-[#F5F7FA] p-4 rounded-lg">
                  <p className="text-sm text-[#757575] mb-1">Uptime</p>
                  <p className="text-2xl font-bold text-[#212121]">{selectedService.uptime}%</p>
                </div>
                <div className="bg-[#F5F7FA] p-4 rounded-lg">
                  <p className="text-sm text-[#757575] mb-1">Last Checked</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedService.lastCheck}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#212121] mb-2">Request Distribution (Last 24h)</p>
                <div className="bg-[#E5E7EB] h-4 rounded-full overflow-hidden">
                  <div className="bg-[#4F46E5] h-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-[#757575] mt-1">Peak: 12:00 PM - 2:00 PM</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Log Details Modal */}
      <Dialog open={showErrorLogDetailsModal} onOpenChange={setShowErrorLogDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about the error log entry
            </DialogDescription>
          </DialogHeader>
          {selectedErrorLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#757575] mb-1">Timestamp</p>
                  <p className="font-medium text-[#212121]">{new Date(selectedErrorLog.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Service</p>
                  <p className="font-medium text-[#212121]">{selectedErrorLog.service}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Level</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLogLevelColor(selectedErrorLog.level).bg} ${getLogLevelColor(selectedErrorLog.level).text}`}>
                    {selectedErrorLog.level}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Error Code</p>
                  <code className="px-2 py-1 bg-[#F5F7FA] text-[#4F46E5] rounded text-xs font-mono">
                    {selectedErrorLog.code}
                  </code>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#757575] mb-1">Message</p>
                  <p className="font-medium text-[#212121]">{selectedErrorLog.message}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-[#757575] mb-1">Details</p>
                  <p className="font-medium text-[#212121] bg-[#F5F7FA] p-3 rounded-lg">{selectedErrorLog.details}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Occurrence Count</p>
                  <p className="font-medium text-[#212121]">{selectedErrorLog.count}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Details Modal */}
      <Dialog open={showAlertDetailsModal} onOpenChange={setShowAlertDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              Detailed information about the alert
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#757575] mb-1">Title</p>
                  <p className="font-medium text-[#212121]">{selectedAlert.title}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Severity</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(selectedAlert.severity).bg} ${getSeverityColor(selectedAlert.severity).text}`}>
                    {selectedAlert.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Service</p>
                  <p className="font-medium text-[#212121]">{selectedAlert.service}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedAlert.status === 'active' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                    selectedAlert.status === 'acknowledged' ? 'bg-[#FEF3C7] text-[#92400E]' :
                    'bg-[#DCFCE7] text-[#166534]'
                  }`}>
                    {selectedAlert.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Timestamp</p>
                  <p className="font-medium text-[#212121]">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
                {selectedAlert.acknowledgedBy && (
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Acknowledged By</p>
                    <p className="font-medium text-[#212121]">{selectedAlert.acknowledgedBy}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-[#757575] mb-1">Message</p>
                  <p className="font-medium text-[#212121] bg-[#F5F7FA] p-3 rounded-lg">{selectedAlert.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}