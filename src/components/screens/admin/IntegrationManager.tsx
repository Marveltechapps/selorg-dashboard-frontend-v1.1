import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  fetchIntegrations,
  fetchWebhooks,
  fetchApiKeys,
  fetchIntegrationLogs,
  fetchIntegrationStats,
  toggleIntegration,
  testConnection,
  createWebhook,
  generateApiKey,
  revokeApiKey,
  retryWebhook,
  Integration,
  Webhook,
  ApiKey,
  IntegrationLog,
  IntegrationStats,
} from './integrationApi';
import { toast } from 'sonner@2.0.3';
import {
  Link,
  RefreshCw,
  Plus,
  Power,
  TestTube,
  Zap,
  Key,
  Webhook as WebhookIcon,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Globe,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Download,
  Filter,
  Search,
} from 'lucide-react';

export function IntegrationManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Form states
  const [webhookForm, setWebhookForm] = useState({
    integrationId: '',
    integrationName: '',
    event: '',
    url: '',
  });

  const [keyForm, setKeyForm] = useState({
    integrationId: '',
    integrationName: '',
    name: '',
    environment: 'production' as 'production' | 'sandbox',
  });

  // Visibility states
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [integrationsData, webhooksData, keysData, logsData, statsData] = await Promise.all([
        fetchIntegrations(),
        fetchWebhooks(),
        fetchApiKeys(),
        fetchIntegrationLogs(),
        fetchIntegrationStats(),
      ]);

      setIntegrations(integrationsData);
      setWebhooks(webhooksData);
      setApiKeys(keysData);
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load integration data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleIntegration(integrationId, newStatus);
      toast.success(`Integration ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update integration status');
    }
  };

  const handleTestConnection = async (integrationId: string, integrationName: string) => {
    setTestingConnection(integrationId);
    try {
      const result = await testConnection(integrationId);
      if (result.success) {
        toast.success(`${integrationName}: ${result.message}`);
      } else {
        toast.error(`${integrationName}: ${result.message}`);
      }
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      await createWebhook(webhookForm);
      toast.success('Webhook created successfully');
      setShowWebhookModal(false);
      setWebhookForm({ integrationId: '', integrationName: '', event: '', url: '' });
      loadData();
    } catch (error) {
      toast.error('Failed to create webhook');
    }
  };

  const handleGenerateKey = async () => {
    try {
      const newKey = await generateApiKey(keyForm);
      toast.success('API key generated successfully');
      setShowKeyModal(false);
      setKeyForm({ integrationId: '', integrationName: '', name: '', environment: 'production' });
      loadData();
      
      // Show the new key briefly
      setTimeout(() => {
        toast.info(`New key: ${newKey.key}`, { duration: 10000 });
      }, 500);
    } catch (error) {
      toast.error('Failed to generate API key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeApiKey(keyId);
      toast.success('API key revoked');
      loadData();
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  };

  const handleRetryWebhook = async (webhookId: string) => {
    try {
      await retryWebhook(webhookId);
      toast.success('Webhook retry initiated');
      loadData();
    } catch (error) {
      toast.error('Failed to retry webhook');
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { color: string; label: string }> = {
      payment: { color: 'bg-emerald-500', label: 'Payment' },
      communication: { color: 'bg-blue-500', label: 'Communication' },
      maps: { color: 'bg-purple-500', label: 'Maps' },
      analytics: { color: 'bg-amber-500', label: 'Analytics' },
      erp: { color: 'bg-indigo-500', label: 'ERP' },
      logistics: { color: 'bg-orange-500', label: 'Logistics' },
      storage: { color: 'bg-cyan-500', label: 'Storage' },
      other: { color: 'bg-gray-500', label: 'Other' },
    };
    const config = categoryMap[category] || categoryMap.other;
    return (
      <Badge className={config.color} style={{ fontSize: '10px' }}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string }> = {
      active: { icon: CheckCircle, color: 'bg-emerald-500' },
      inactive: { icon: XCircle, color: 'bg-gray-400' },
      error: { icon: AlertCircle, color: 'bg-rose-500' },
      testing: { icon: TestTube, color: 'bg-amber-500' },
    };
    const config = statusMap[status] || statusMap.inactive;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getHealthBadge = (health: string) => {
    const healthMap: Record<string, { color: string; bg: string }> = {
      healthy: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
      degraded: { color: 'text-amber-600', bg: 'bg-amber-50' },
      down: { color: 'text-rose-600', bg: 'bg-rose-50' },
    };
    const config = healthMap[health] || healthMap.healthy;
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${config.bg} ${config.color}`}>
        {health.charAt(0).toUpperCase() + health.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#71717a]">Loading integration data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Integration Manager</h1>
          <p className="text-[#71717a] text-sm">Manage third-party APIs and service connections</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={loadData} variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Download size={14} className="mr-1.5" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Integrations</p>
            <Link className="text-blue-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{stats?.totalIntegrations}</p>
          <p className="text-xs text-emerald-600 mt-2">{stats?.activeIntegrations} active</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Requests</p>
            <Activity className="text-purple-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats?.totalRequests.toLocaleString()}
          </p>
          <p className="text-xs text-[#71717a] mt-2">Today</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Success Rate</p>
            <TrendingUp className="text-emerald-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats?.successRate}%</p>
          <p className="text-xs text-[#71717a] mt-2">Reliability</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Avg Response</p>
            <Clock className="text-amber-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats?.avgResponseTime}ms</p>
          <p className="text-xs text-[#71717a] mt-2">Performance</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Error Rate</p>
            <AlertCircle className="text-rose-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-rose-600">{stats?.errorRate}%</p>
          <p className="text-xs text-[#71717a] mt-2">Failed requests</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">
            <Link size={14} className="mr-1.5" /> All Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <WebhookIcon size={14} className="mr-1.5" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="keys">
            <Key size={14} className="mr-1.5" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity size={14} className="mr-1.5" /> Request Logs
          </TabsTrigger>
        </TabsList>

        {/* All Integrations Tab */}
        <TabsContent value="integrations">
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Integration Header */}
                <div className="bg-gradient-to-r from-[#f4f4f5] to-[#fafafa] p-4 border-b border-[#e4e4e7]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{integration.logo}</div>
                      <div>
                        <h3 className="font-bold text-[#18181b]">{integration.name}</h3>
                        <p className="text-xs text-[#71717a]">{integration.provider}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(integration.status)}
                      {getCategoryBadge(integration.category)}
                    </div>
                  </div>
                  <p className="text-sm text-[#52525b]">{integration.description}</p>
                </div>

                {/* Integration Body */}
                <div className="p-4">
                  {/* Health & Metrics */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#71717a]">Health:</span>
                      {getHealthBadge(integration.health)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#71717a]">API v{integration.apiVersion}</span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Requests</p>
                      <p className="text-sm font-bold text-[#18181b]">
                        {integration.metrics.requestsToday.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Success</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {integration.metrics.successRate}%
                      </p>
                    </div>
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Latency</p>
                      <p className="text-sm font-bold text-[#18181b]">
                        {integration.metrics.avgResponseTime}ms
                      </p>
                    </div>
                  </div>

                  {/* Rate Limit */}
                  {integration.status !== 'inactive' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#71717a]">Rate Limit Usage</span>
                        <span className="font-medium text-[#18181b]">
                          {integration.metrics.rateLimitUsed.toLocaleString()} /{' '}
                          {integration.metrics.rateLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            (integration.metrics.rateLimitUsed / integration.metrics.rateLimit) * 100 > 80
                              ? 'bg-rose-500'
                              : (integration.metrics.rateLimitUsed / integration.metrics.rateLimit) * 100 > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${(integration.metrics.rateLimitUsed / integration.metrics.rateLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-[#71717a] mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.config.features.slice(0, 4).map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.config.features.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.config.features.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedIntegration(integration);
                        setShowDetailsModal(true);
                      }}
                    >
                      <Globe size={14} className="mr-1" /> Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(integration.id, integration.name)}
                      disabled={testingConnection === integration.id}
                    >
                      {testingConnection === integration.id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <TestTube size={14} />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        integration.status !== 'error' && handleToggleIntegration(integration.id, integration.status)
                      }
                    >
                      <Power size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Webhook Endpoints</h3>
                <p className="text-xs text-[#71717a] mt-1">Configure event-driven notifications</p>
              </div>
              <Button size="sm" onClick={() => setShowWebhookModal(true)}>
                <Plus size={14} className="mr-1.5" /> New Webhook
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Integration</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{webhook.integrationName}</div>
                      <div className="text-xs text-[#71717a]">{webhook.integrationId}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {webhook.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#52525b] max-w-xs truncate">
                      {webhook.url}
                    </TableCell>
                    <TableCell>
                      {webhook.status === 'active' ? (
                        <Badge className="bg-emerald-500">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </Badge>
                      ) : webhook.status === 'failed' ? (
                        <Badge className="bg-rose-500">
                          <AlertCircle size={12} className="mr-1" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-400">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {((webhook.successCount / webhook.totalCalls) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-[#71717a]">
                        {webhook.successCount}/{webhook.totalCalls}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#71717a]">
                      {new Date(webhook.lastTriggered).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryWebhook(webhook.id)}
                          disabled={webhook.status !== 'failed'}
                        >
                          <RotateCcw size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">API Key Management</h3>
                <p className="text-xs text-[#71717a] mt-1">Generate and manage authentication keys</p>
              </div>
              <Button size="sm" onClick={() => setShowKeyModal(true)}>
                <Plus size={14} className="mr-1.5" /> Generate Key
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium text-sm">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{apiKey.integrationName}</div>
                      <div className="text-xs text-[#71717a]">{apiKey.integrationId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono bg-[#f4f4f5] px-2 py-1 rounded">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.key.replace(/./g, '•')}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="h-6 w-6 p-0"
                        >
                          {visibleKeys.has(apiKey.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={apiKey.environment === 'production' ? 'default' : 'outline'}>
                        {apiKey.environment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {apiKey.status === 'active' ? (
                        <Badge className="bg-emerald-500">Active</Badge>
                      ) : apiKey.status === 'expired' ? (
                        <Badge className="bg-amber-500">Expired</Badge>
                      ) : (
                        <Badge className="bg-gray-400">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{apiKey.usageCount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-[#71717a]">
                      {apiKey.lastUsed === 'Never' ? 'Never' : new Date(apiKey.lastUsed).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevokeKey(apiKey.id)}
                        disabled={apiKey.status !== 'active'}
                      >
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Request Logs Tab */}
        <TabsContent value="logs">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Request & Response Logs</h3>
                <p className="text-xs text-[#71717a] mt-1">Real-time API activity monitoring</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Filter size={14} className="mr-1.5" /> Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Search size={14} className="mr-1.5" /> Search
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-[#71717a]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.integrationName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {log.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#52525b] max-w-xs truncate">
                      {log.endpoint}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge className="bg-emerald-500">{log.statusCode}</Badge>
                      ) : (
                        <Badge className="bg-rose-500">{log.statusCode}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          log.responseTime < 200
                            ? 'text-emerald-600'
                            : log.responseTime < 500
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {log.responseTime}ms
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-[#71717a]">
                      {((log.requestSize + log.responseSize) / 1024).toFixed(1)} KB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {logs.length > 0 && (
              <div className="p-3 border-t border-[#e4e4e7] bg-[#fafafa] flex justify-between items-center">
                <p className="text-xs text-[#71717a]">Showing latest {logs.length} requests</p>
                <Button size="sm" variant="outline">
                  Load More
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Webhook Modal */}
      <Dialog open={showWebhookModal} onOpenChange={setShowWebhookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>Configure a new webhook endpoint for event notifications</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Integration</label>
              <Select
                value={webhookForm.integrationId}
                onValueChange={(value) => {
                  const integration = integrations.find((i) => i.id === value);
                  setWebhookForm({
                    ...webhookForm,
                    integrationId: value,
                    integrationName: integration?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrations
                    .filter((i) => i.status === 'active')
                    .map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.logo} {integration.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Event Type</label>
              <Input
                placeholder="e.g., payment.captured, order.created"
                value={webhookForm.event}
                onChange={(e) => setWebhookForm({ ...webhookForm, event: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Webhook URL</label>
              <Input
                placeholder="https://api.quickcommerce.com/webhooks/..."
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook}>Create Webhook</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate API Key Modal */}
      <Dialog open={showKeyModal} onOpenChange={setShowKeyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>Create a new authentication key for integration access</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Integration</label>
              <Select
                value={keyForm.integrationId}
                onValueChange={(value) => {
                  const integration = integrations.find((i) => i.id === value);
                  setKeyForm({
                    ...keyForm,
                    integrationId: value,
                    integrationName: integration?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select integration" />
                </SelectTrigger>
                <SelectContent>
                  {integrations
                    .filter((i) => i.status === 'active')
                    .map((integration) => (
                      <SelectItem key={integration.id} value={integration.id}>
                        {integration.logo} {integration.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Key Name</label>
              <Input
                placeholder="e.g., Production Key - Primary"
                value={keyForm.name}
                onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Environment</label>
              <Select
                value={keyForm.environment}
                onValueChange={(value: any) => setKeyForm({ ...keyForm, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sandbox">Sandbox / Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKeyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateKey}>Generate Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedIntegration?.logo}</span>
              {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>{selectedIntegration?.provider}</DialogDescription>
          </DialogHeader>

          {selectedIntegration && (
            <div className="space-y-4">
              {/* Status Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Status</p>
                  {getStatusBadge(selectedIntegration.status)}
                </div>
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Health</p>
                  {getHealthBadge(selectedIntegration.health)}
                </div>
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Uptime</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedIntegration.metrics.uptime}%</p>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="text-sm font-bold text-[#18181b] mb-2">Configuration</h4>
                <div className="bg-[#f4f4f5] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">Environment:</span>
                    <Badge>{selectedIntegration.config.environment}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">API Version:</span>
                    <span className="font-medium text-[#18181b]">{selectedIntegration.apiVersion}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">Connected:</span>
                    <span className="font-medium text-[#18181b]">
                      {new Date(selectedIntegration.connectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedIntegration.config.webhookUrl && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#71717a]">Webhook:</span>
                      <code className="font-mono text-xs">{selectedIntegration.config.webhookUrl}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-bold text-[#18181b] mb-2">Available Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.config.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h4 className="text-sm font-bold text-[#18181b] mb-2">Today's Metrics</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#f4f4f5] rounded-lg p-3">
                    <p className="text-xs text-[#71717a] mb-1">Total Requests</p>
                    <p className="text-xl font-bold text-[#18181b]">
                      {selectedIntegration.metrics.requestsToday.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-[#f4f4f5] rounded-lg p-3">
                    <p className="text-xs text-[#71717a] mb-1">Success Rate</p>
                    <p className="text-xl font-bold text-emerald-600">{selectedIntegration.metrics.successRate}%</p>
                  </div>
                  <div className="bg-[#f4f4f5] rounded-lg p-3">
                    <p className="text-xs text-[#71717a] mb-1">Avg Response Time</p>
                    <p className="text-xl font-bold text-[#18181b]">{selectedIntegration.metrics.avgResponseTime}ms</p>
                  </div>
                  <div className="bg-[#f4f4f5] rounded-lg p-3">
                    <p className="text-xs text-[#71717a] mb-1">Error Count</p>
                    <p className="text-xl font-bold text-rose-600">{selectedIntegration.metrics.errorCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
