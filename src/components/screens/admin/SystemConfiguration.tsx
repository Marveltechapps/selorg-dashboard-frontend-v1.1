import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  fetchGeneralSettings,
  fetchDeliverySettings,
  fetchPaymentGateways,
  fetchNotificationSettings,
  fetchTaxSettings,
  fetchFeatureFlags,
  fetchIntegrations,
  fetchAdvancedSettings,
  updateGeneralSettings,
  updateDeliverySettings,
  updatePaymentGateway,
  updateTaxSettings,
  toggleFeatureFlag,
  updateIntegration,
  updateAdvancedSettings,
  testIntegration,
  GeneralSettings,
  DeliverySettings,
  PaymentGateway,
  NotificationSettings,
  TaxSettings,
  FeatureFlag,
  Integration,
  AdvancedSettings,
} from './systemConfigApi';
import { toast } from 'sonner@2.0.3';
import {
  Settings,
  Globe,
  Truck,
  CreditCard,
  Bell,
  Receipt,
  Zap,
  Link as LinkIcon,
  Code,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  TestTube,
} from 'lucide-react';

export function SystemConfiguration() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [editingTax, setEditingTax] = useState(false);

  // Show API keys
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [general, delivery, payment, notification, tax, features, integs, advanced] = await Promise.all([
        fetchGeneralSettings(),
        fetchDeliverySettings(),
        fetchPaymentGateways(),
        fetchNotificationSettings(),
        fetchTaxSettings(),
        fetchFeatureFlags(),
        fetchIntegrations(),
        fetchAdvancedSettings(),
      ]);
      setGeneralSettings(general);
      setDeliverySettings(delivery);
      setPaymentGateways(payment);
      setNotificationSettings(notification);
      setTaxSettings(tax);
      setFeatureFlags(features);
      setIntegrations(integs);
      setAdvancedSettings(advanced);
    } catch (error) {
      toast.error('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!generalSettings) return;
    try {
      await updateGeneralSettings(generalSettings);
      toast.success('General settings saved successfully');
      setEditingGeneral(false);
    } catch (error) {
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveDelivery = async () => {
    if (!deliverySettings) return;
    try {
      await updateDeliverySettings(deliverySettings);
      toast.success('Delivery settings saved successfully');
      setEditingDelivery(false);
    } catch (error) {
      toast.error('Failed to save delivery settings');
    }
  };

  const handleSaveTax = async () => {
    if (!taxSettings) return;
    try {
      await updateTaxSettings(taxSettings);
      toast.success('Tax settings saved successfully');
      setEditingTax(false);
    } catch (error) {
      toast.error('Failed to save tax settings');
    }
  };

  const handleTogglePaymentGateway = async (id: string, currentStatus: boolean) => {
    try {
      await updatePaymentGateway(id, { isActive: !currentStatus });
      toast.success(`Payment gateway ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update payment gateway');
    }
  };

  const handleToggleFeature = async (id: string, name: string) => {
    try {
      await toggleFeatureFlag(id);
      toast.success(`${name} ${featureFlags.find(f => f.id === id)?.isEnabled ? 'disabled' : 'enabled'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to toggle feature');
    }
  };

  const handleToggleIntegration = async (id: string, currentStatus: boolean) => {
    try {
      await updateIntegration(id, { isActive: !currentStatus });
      toast.success(`Integration ${!currentStatus ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update integration');
    }
  };

  const handleTestIntegration = async (id: string, name: string) => {
    toast.info(`Testing ${name}...`);
    try {
      const result = await testIntegration(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Test failed');
    }
  };

  const handleToggleMaintenance = async () => {
    if (!advancedSettings) return;
    try {
      await updateAdvancedSettings({ maintenanceMode: !advancedSettings.maintenanceMode });
      toast.success(`Maintenance mode ${!advancedSettings.maintenanceMode ? 'enabled' : 'disabled'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to toggle maintenance mode');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#71717a]">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">System Configuration</h1>
          <p className="text-[#71717a] text-sm">Platform-wide settings and integrations</p>
        </div>
        <Button size="sm" onClick={loadData} variant="outline">
          <RefreshCw size={14} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Maintenance Mode Alert */}
      {advancedSettings?.maintenanceMode && (
        <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600" size={24} />
            <div>
              <h3 className="font-bold text-amber-900">Maintenance Mode Active</h3>
              <p className="text-sm text-amber-700">Platform is in maintenance mode. Users cannot access the app.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleToggleMaintenance}>
            Disable Maintenance Mode
          </Button>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Globe size={14} className="mr-1.5" /> General
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck size={14} className="mr-1.5" /> Delivery
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard size={14} className="mr-1.5" /> Payment
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell size={14} className="mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="tax">
            <Receipt size={14} className="mr-1.5" /> Tax & Compliance
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap size={14} className="mr-1.5" /> Features
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <LinkIcon size={14} className="mr-1.5" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Code size={14} className="mr-1.5" /> Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <h3 className="font-bold text-[#18181b]">General Platform Settings</h3>
              {editingGeneral ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingGeneral(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveGeneral}>
                    <Save size={14} className="mr-1.5" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditingGeneral(true)}>
                  Edit Settings
                </Button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {generalSettings && (
                <>
                  {/* Platform Identity */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Platform Name</Label>
                      <Input
                        value={generalSettings.platformName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                        disabled={!editingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={generalSettings.tagline}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                        disabled={!editingGeneral}
                      />
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={(val) => setGeneralSettings({ ...generalSettings, timezone: val })}
                        disabled={!editingGeneral}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select
                        value={generalSettings.currency}
                        onValueChange={(val) => setGeneralSettings({ ...generalSettings, currency: val })}
                        disabled={!editingGeneral}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={generalSettings.timeFormat}
                        onValueChange={(val: any) => setGeneralSettings({ ...generalSettings, timeFormat: val })}
                        disabled={!editingGeneral}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Support Email</Label>
                      <Input
                        type="email"
                        value={generalSettings.contactEmail}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                        disabled={!editingGeneral}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Support Phone</Label>
                      <Input
                        value={generalSettings.supportPhone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                        disabled={!editingGeneral}
                      />
                    </div>
                  </div>

                  {/* Brand Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={generalSettings.primaryColor}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primaryColor: e.target.value })}
                          disabled={!editingGeneral}
                          className="w-20"
                        />
                        <Input
                          value={generalSettings.primaryColor}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, primaryColor: e.target.value })}
                          disabled={!editingGeneral}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={generalSettings.secondaryColor}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, secondaryColor: e.target.value })}
                          disabled={!editingGeneral}
                          className="w-20"
                        />
                        <Input
                          value={generalSettings.secondaryColor}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, secondaryColor: e.target.value })}
                          disabled={!editingGeneral}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Delivery Settings Tab */}
        <TabsContent value="delivery">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <h3 className="font-bold text-[#18181b]">Delivery Configuration</h3>
              {editingDelivery ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingDelivery(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveDelivery}>
                    <Save size={14} className="mr-1.5" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditingDelivery(true)}>
                  Edit Settings
                </Button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {deliverySettings && (
                <>
                  {/* Order Limits */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Order Value Limits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Minimum Order Value (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.minOrderValue}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, minOrderValue: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Maximum Order Value (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.maxOrderValue}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, maxOrderValue: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Fees */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Delivery Fees</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Base Fee (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.baseDeliveryFee}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, baseDeliveryFee: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Per KM (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.deliveryFeePerKm}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, deliveryFeePerKm: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Free Above (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.freeDeliveryAbove}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, freeDeliveryAbove: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Parameters */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Service Parameters</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Max Radius (km)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.maxDeliveryRadius}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, maxDeliveryRadius: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Avg Time (min)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.avgDeliveryTime}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, avgDeliveryTime: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Express Fee (₹)</Label>
                        <Input
                          type="number"
                          value={deliverySettings.expressDeliveryFee}
                          onChange={(e) => setDeliverySettings({ ...deliverySettings, expressDeliveryFee: parseFloat(e.target.value) })}
                          disabled={!editingDelivery}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Slots */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Delivery Time Slots</h4>
                    <div className="space-y-2">
                      {deliverySettings.slots.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-4 p-3 bg-[#f4f4f5] rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-[#18181b]">{slot.name}</div>
                            <div className="text-xs text-[#71717a]">
                              {slot.startTime} - {slot.endTime} • Max {slot.maxOrders} orders
                              {slot.surgeMultiplier > 1 && ` • ${slot.surgeMultiplier}× surge`}
                            </div>
                          </div>
                          <Badge className={slot.isActive ? 'bg-emerald-500' : 'bg-gray-500'}>
                            {slot.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payment">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Payment Gateway Configuration</h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {paymentGateways.map((gateway) => (
                  <div key={gateway.id} className="border border-[#e4e4e7] rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-[#18181b]">{gateway.name}</h4>
                          <Badge variant="outline" className="capitalize">{gateway.provider}</Badge>
                          {gateway.isActive && <Badge className="bg-emerald-500">Active</Badge>}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-[#71717a]">Transaction Fee</p>
                            <p className="font-medium text-[#18181b]">
                              {gateway.transactionFeeType === 'percentage' ? `${gateway.transactionFee}%` : `₹${gateway.transactionFee}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#71717a]">Min Amount</p>
                            <p className="font-medium text-[#18181b]">₹{gateway.minAmount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#71717a]">Max Amount</p>
                            <p className="font-medium text-[#18181b]">₹{gateway.maxAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#71717a]">API Key</p>
                            <p className="font-mono text-xs text-[#52525b]">{gateway.apiKey}</p>
                          </div>
                        </div>
                      </div>

                      <Switch
                        checked={gateway.isActive}
                        onCheckedChange={() => handleTogglePaymentGateway(gateway.id, gateway.isActive)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Notification Settings</h3>
            </div>

            <div className="p-6 space-y-6">
              {notificationSettings && (
                <>
                  {/* Channel Status */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Notification Channels</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                        <div>
                          <p className="font-medium text-[#18181b]">Email Notifications</p>
                          <p className="text-xs text-[#71717a]">{notificationSettings.emailProvider}</p>
                        </div>
                        <Switch checked={notificationSettings.emailEnabled} disabled />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                        <div>
                          <p className="font-medium text-[#18181b]">SMS Notifications</p>
                          <p className="text-xs text-[#71717a]">{notificationSettings.smsProvider}</p>
                        </div>
                        <Switch checked={notificationSettings.smsEnabled} disabled />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                        <div>
                          <p className="font-medium text-[#18181b]">Push Notifications</p>
                          <p className="text-xs text-[#71717a]">FCM</p>
                        </div>
                        <Switch checked={notificationSettings.pushEnabled} disabled />
                      </div>
                    </div>
                  </div>

                  {/* Templates */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Notification Templates</h4>
                    <div className="space-y-2">
                      {notificationSettings.templates.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 border border-[#e4e4e7] rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#18181b]">{template.name}</p>
                              <Badge variant="outline" className="text-xs">{template.type}</Badge>
                            </div>
                            <p className="text-xs text-[#71717a] mt-1">Event: {template.event}</p>
                          </div>
                          <Badge className={template.isActive ? 'bg-emerald-500' : 'bg-gray-500'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tax & Compliance Tab */}
        <TabsContent value="tax">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <h3 className="font-bold text-[#18181b]">Tax & Compliance Settings</h3>
              {editingTax ? (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingTax(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveTax}>
                    <Save size={14} className="mr-1.5" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditingTax(true)}>
                  Edit Settings
                </Button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {taxSettings && (
                <>
                  {/* GST Configuration */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-[#18181b]">GST Configuration</h4>
                      <Switch
                        checked={taxSettings.gstEnabled}
                        onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, gstEnabled: checked })}
                        disabled={!editingTax}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>CGST Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={taxSettings.cgstRate}
                          onChange={(e) => setTaxSettings({ ...taxSettings, cgstRate: parseFloat(e.target.value) })}
                          disabled={!editingTax || !taxSettings.gstEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SGST Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={taxSettings.sgstRate}
                          onChange={(e) => setTaxSettings({ ...taxSettings, sgstRate: parseFloat(e.target.value) })}
                          disabled={!editingTax || !taxSettings.gstEnabled}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>IGST Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={taxSettings.igstRate}
                          onChange={(e) => setTaxSettings({ ...taxSettings, igstRate: parseFloat(e.target.value) })}
                          disabled={!editingTax || !taxSettings.gstEnabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax Display */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tax Display Type</Label>
                      <Select
                        value={taxSettings.taxDisplayType}
                        onValueChange={(val: any) => setTaxSettings({ ...taxSettings, taxDisplayType: val })}
                        disabled={!editingTax}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusive">Inclusive (Price includes tax)</SelectItem>
                          <SelectItem value="exclusive">Exclusive (Tax added separately)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Business Numbers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GST Number</Label>
                      <Input
                        value={taxSettings.gstNumber}
                        onChange={(e) => setTaxSettings({ ...taxSettings, gstNumber: e.target.value })}
                        disabled={!editingTax}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>PAN Number</Label>
                      <Input
                        value={taxSettings.panNumber}
                        onChange={(e) => setTaxSettings({ ...taxSettings, panNumber: e.target.value })}
                        disabled={!editingTax}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Feature Flags</h3>
              <p className="text-xs text-[#71717a] mt-1">Enable or disable platform features</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {featureFlags.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-4 border border-[#e4e4e7] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[#18181b]">{feature.name}</h4>
                        <Badge
                          variant="outline"
                          className={
                            feature.category === 'core' ? 'border-blue-500 text-blue-700' :
                            feature.category === 'premium' ? 'border-purple-500 text-purple-700' :
                            feature.category === 'beta' ? 'border-amber-500 text-amber-700' :
                            'border-pink-500 text-pink-700'
                          }
                        >
                          {feature.category}
                        </Badge>
                        {feature.requiresRestart && (
                          <Badge variant="outline" className="text-xs border-rose-500 text-rose-700">
                            Requires Restart
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#71717a]">{feature.description}</p>
                      <p className="text-xs text-[#a1a1aa] mt-1 font-mono">{feature.key}</p>
                    </div>
                    <Switch
                      checked={feature.isEnabled}
                      onCheckedChange={() => handleToggleFeature(feature.id, feature.name)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Third-Party Integrations</h3>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border border-[#e4e4e7] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-[#18181b]">{integration.name}</h4>
                          {integration.isActive && <Badge className="bg-emerald-500">Active</Badge>}
                        </div>
                        <p className="text-xs text-[#71717a]">{integration.service}</p>
                      </div>
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={() => handleToggleIntegration(integration.id, integration.isActive)}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-[#71717a] mb-1">API Key</p>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showApiKeys[integration.id] ? 'text' : 'password'}
                            value={integration.apiKey}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowApiKeys({ ...showApiKeys, [integration.id]: !showApiKeys[integration.id] })}
                          >
                            {showApiKeys[integration.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#71717a] mb-1">Endpoint</p>
                        <Input value={integration.endpoint || 'N/A'} readOnly className="text-xs" />
                      </div>
                      <div>
                        <p className="text-xs text-[#71717a] mb-1">Last Sync</p>
                        <div className="flex items-center gap-2">
                          <Input
                            value={integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestIntegration(integration.id, integration.name)}
                          >
                            <TestTube size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Advanced System Settings</h3>
              <p className="text-xs text-rose-600 mt-1">⚠️ Caution: Changes to these settings may affect platform stability</p>
            </div>

            <div className="p-6 space-y-6">
              {advancedSettings && (
                <>
                  {/* System Modes */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">System Modes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                        <div>
                          <p className="font-medium text-[#18181b]">Maintenance Mode</p>
                          <p className="text-xs text-[#71717a]">Disable user access</p>
                        </div>
                        <Switch
                          checked={advancedSettings.maintenanceMode}
                          onCheckedChange={handleToggleMaintenance}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                        <div>
                          <p className="font-medium text-[#18181b]">Debug Mode</p>
                          <p className="text-xs text-[#71717a]">Enable detailed logging</p>
                        </div>
                        <Switch checked={advancedSettings.debugMode} disabled />
                      </div>
                    </div>
                  </div>

                  {/* Performance Settings */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">Performance Settings</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Cache Duration (sec)</Label>
                        <Input type="number" value={advancedSettings.cacheDuration} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Rate Limit (/min)</Label>
                        <Input type="number" value={advancedSettings.rateLimitPerMinute} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Session Timeout (sec)</Label>
                        <Input type="number" value={advancedSettings.sessionTimeout} disabled />
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div>
                    <h4 className="font-bold text-sm text-[#18181b] mb-3">System Information</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-[#f4f4f5] rounded-lg">
                        <p className="text-xs text-[#71717a]">API Version</p>
                        <p className="font-mono text-lg font-bold text-[#18181b]">{advancedSettings.apiVersion}</p>
                      </div>
                      <div className="p-4 bg-[#f4f4f5] rounded-lg">
                        <p className="text-xs text-[#71717a]">Log Level</p>
                        <p className="font-mono text-lg font-bold text-[#18181b] capitalize">{advancedSettings.logLevel}</p>
                      </div>
                      <div className="p-4 bg-[#f4f4f5] rounded-lg">
                        <p className="text-xs text-[#71717a]">Max Concurrent Users</p>
                        <p className="font-mono text-lg font-bold text-[#18181b]">{advancedSettings.maxConcurrentUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
