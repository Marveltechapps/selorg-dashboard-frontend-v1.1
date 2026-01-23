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
import { Textarea } from '@/components/ui/textarea';
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
  fetchZones,
  fetchCoverageStats,
  fetchZonePerformance,
  fetchZoneHistory,
  fetchOverlapWarnings,
  createZone,
  updateZone,
  deleteZone,
  toggleZoneStatus,
  cloneZone,
  GeofenceZone,
  CoverageStats,
  ZonePerformance,
  ZoneHistory,
  OverlapWarning,
} from './geofenceApi';
import { toast } from 'sonner@2.0.3';
import {
  Map,
  Plus,
  RefreshCw,
  MapPin,
  Edit,
  Trash2,
  Copy,
  Eye,
  Power,
  AlertTriangle,
  TrendingUp,
  Users,
  Package,
  Clock,
  Star,
  Download,
  Upload,
  Search,
  Filter,
  Layers,
  Maximize2,
  Settings,
} from 'lucide-react';

export function GeofenceManager() {
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [coverageStats, setCoverageStats] = useState<CoverageStats | null>(null);
  const [zonePerformance, setZonePerformance] = useState<ZonePerformance[]>([]);
  const [history, setHistory] = useState<ZoneHistory[]>([]);
  const [overlaps, setOverlaps] = useState<OverlapWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<GeofenceZone | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form states
  const [zoneForm, setZoneForm] = useState({
    name: '',
    city: 'Mumbai',
    region: 'West',
    type: 'standard' as GeofenceZone['type'],
  });

  const [settingsForm, setSettingsForm] = useState({
    deliveryFee: 39,
    minOrderValue: 149,
    maxDeliveryRadius: 4,
    estimatedDeliveryTime: 30,
    surgeMultiplier: 1.0,
    maxCapacity: 100,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zonesData, statsData, performanceData, historyData, overlapsData] = await Promise.all([
        fetchZones(),
        fetchCoverageStats(),
        fetchZonePerformance(),
        fetchZoneHistory(),
        fetchOverlapWarnings(),
      ]);

      setZones(zonesData);
      setCoverageStats(statsData);
      setZonePerformance(performanceData);
      setHistory(historyData);
      setOverlaps(overlapsData);
    } catch (error) {
      toast.error('Failed to load geofence data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async () => {
    try {
      await createZone({
        ...zoneForm,
        polygon: [
          { lat: 19.0760, lng: 72.8777 },
          { lat: 19.0760, lng: 72.8877 },
          { lat: 19.0660, lng: 72.8877 },
          { lat: 19.0660, lng: 72.8777 },
        ],
        center: { lat: 19.0710, lng: 72.8827 },
      });
      toast.success('Zone created successfully');
      setShowCreateModal(false);
      setZoneForm({ name: '', city: 'Mumbai', region: 'West', type: 'standard' });
      loadData();
    } catch (error) {
      toast.error('Failed to create zone');
    }
  };

  const handleToggleStatus = async (zoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await toggleZoneStatus(zoneId, newStatus);
      toast.success(`Zone ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update zone status');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    try {
      await deleteZone(zoneId);
      toast.success('Zone deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete zone');
    }
  };

  const handleCloneZone = async (zoneId: string, zoneName: string) => {
    try {
      await cloneZone(zoneId, `${zoneName} (Copy)`);
      toast.success('Zone cloned successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to clone zone');
    }
  };

  const getZoneTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      standard: 'bg-blue-500',
      express: 'bg-emerald-500',
      'no-service': 'bg-rose-500',
      premium: 'bg-purple-500',
      surge: 'bg-amber-500',
    };
    return typeMap[type] || 'bg-gray-500';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; className: string }> = {
      active: { variant: 'default', className: 'bg-emerald-500' },
      inactive: { variant: 'secondary', className: 'bg-gray-400' },
      testing: { variant: 'default', className: 'bg-amber-500' },
    };
    const config = statusMap[status] || { variant: 'outline', className: '' };
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#71717a]">Loading geofence data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Geofence Manager</h1>
          <p className="text-[#71717a] text-sm">Manage delivery zones and coverage areas</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={loadData} variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Upload size={14} className="mr-1.5" /> Import
          </Button>
          <Button size="sm" variant="outline">
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} className="mr-1.5" /> New Zone
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Zones</p>
            <Layers className="text-blue-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{coverageStats?.totalZones}</p>
          <p className="text-xs text-emerald-600 mt-2">{coverageStats?.activeZones} active</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Coverage Area</p>
            <Maximize2 className="text-emerald-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {coverageStats?.totalCoverage.toFixed(1)} km²
          </p>
          <p className="text-xs text-[#71717a] mt-2">Total service area</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Population</p>
            <Users className="text-purple-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {(coverageStats?.totalPopulation || 0) >= 1000000
              ? `${((coverageStats?.totalPopulation || 0) / 1000000).toFixed(1)}M`
              : `${((coverageStats?.totalPopulation || 0) / 1000).toFixed(0)}K`}
          </p>
          <p className="text-xs text-[#71717a] mt-2">Covered population</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Active Orders</p>
            <Package className="text-amber-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-amber-600">{coverageStats?.activeOrders}</p>
          <p className="text-xs text-[#71717a] mt-2">Currently processing</p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Total Riders</p>
            <MapPin className="text-rose-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-rose-600">{coverageStats?.totalRiders}</p>
          <p className="text-xs text-[#71717a] mt-2">Active across zones</p>
        </div>
      </div>

      {/* Overlap Warnings */}
      {overlaps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 mb-1">Zone Overlap Detected</h3>
              <p className="text-sm text-amber-800">
                {overlaps.length} zone overlap{overlaps.length > 1 ? 's' : ''} detected. Review zones to prevent
                conflicts.
              </p>
              <div className="mt-2 space-y-1">
                {overlaps.map((overlap, idx) => (
                  <div key={idx} className="text-xs text-amber-700">
                    • {overlap.zone1} and {overlap.zone2} overlap by {overlap.overlapArea} km² (
                    {overlap.severity} severity)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="zones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="zones">
            <Layers size={14} className="mr-1.5" /> All Zones
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map size={14} className="mr-1.5" /> Map View
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp size={14} className="mr-1.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings size={14} className="mr-1.5" /> Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock size={14} className="mr-1.5" /> History
          </TabsTrigger>
        </TabsList>

        {/* All Zones Tab */}
        <TabsContent value="zones">
          <div className="grid grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Zone Header */}
                <div
                  className="h-24 relative"
                  style={{
                    background: `linear-gradient(135deg, ${zone.color}88 0%, ${zone.color}44 100%)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Map size={48} style={{ color: zone.color }} className="opacity-40" />
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {getStatusBadge(zone.status)}
                    <Badge className={getZoneTypeColor(zone.type)}>{zone.type}</Badge>
                  </div>
                </div>

                {/* Zone Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#18181b] mb-1">{zone.name}</h3>
                      <p className="text-xs text-[#71717a]">
                        {zone.city}, {zone.region} • {zone.id}
                      </p>
                    </div>
                  </div>

                  {/* Zone Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Area</p>
                      <p className="text-sm font-bold text-[#18181b]">{zone.analytics.areaSize} km²</p>
                    </div>
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Orders</p>
                      <p className="text-sm font-bold text-[#18181b]">{zone.analytics.activeOrders}</p>
                    </div>
                    <div className="bg-[#f4f4f5] rounded-lg p-2">
                      <p className="text-xs text-[#71717a] mb-0.5">Riders</p>
                      <p className="text-sm font-bold text-[#18181b]">{zone.analytics.riderCount}</p>
                    </div>
                  </div>

                  {/* Zone Settings */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div>
                      <span className="text-[#71717a]">Delivery Fee:</span>{' '}
                      <span className="font-medium text-[#18181b]">₹{zone.settings.deliveryFee}</span>
                    </div>
                    <div>
                      <span className="text-[#71717a]">Min Order:</span>{' '}
                      <span className="font-medium text-[#18181b]">₹{zone.settings.minOrderValue}</span>
                    </div>
                    <div>
                      <span className="text-[#71717a]">Est Time:</span>{' '}
                      <span className="font-medium text-[#18181b]">{zone.settings.estimatedDeliveryTime}m</span>
                    </div>
                    <div>
                      <span className="text-[#71717a]">Capacity:</span>{' '}
                      <span className="font-medium text-[#18181b]">{zone.settings.maxCapacity}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  {zone.type !== 'no-service' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#71717a]">Capacity Usage</span>
                        <span className="font-medium text-[#18181b]">{zone.analytics.capacityUsage}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            zone.analytics.capacityUsage > 80
                              ? 'bg-rose-500'
                              : zone.analytics.capacityUsage > 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${zone.analytics.capacityUsage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowMapModal(true);
                      }}
                    >
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowEditModal(true);
                      }}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        zone.status !== 'inactive' &&
                        handleToggleStatus(zone.id, zone.status)
                      }
                    >
                      <Power size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCloneZone(zone.id, zone.name)}>
                      <Copy size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteZone(zone.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Map View Tab */}
        <TabsContent value="map">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Interactive Map View</h3>
                <p className="text-xs text-[#71717a] mt-1">Visualize all zones on the map</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Filter size={14} className="mr-1.5" /> Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Layers size={14} className="mr-1.5" /> Layers
                </Button>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-[600px] overflow-hidden">
              {/* Map Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `repeating-linear-gradient(0deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 20px),
                                      repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 20px)`,
                  }}
                />
              </div>

              {/* Zone Overlays */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Active Zones Visualization */}
                {zones
                  .filter((z) => z.status === 'active')
                  .map((zone, idx) => (
                    <div
                      key={zone.id}
                      className="absolute rounded-2xl border-4 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: zone.color,
                        backgroundColor: `${zone.color}20`,
                        width: `${120 + idx * 30}px`,
                        height: `${120 + idx * 30}px`,
                        left: `${15 + idx * 12}%`,
                        top: `${20 + (idx % 3) * 15}%`,
                      }}
                      onClick={() => {
                        setSelectedZone(zone);
                        setShowMapModal(true);
                      }}
                    >
                      <div className="text-center p-2">
                        <div className="font-bold text-xs mb-1" style={{ color: zone.color }}>
                          {zone.name}
                        </div>
                        <Badge className={getZoneTypeColor(zone.type)} style={{ fontSize: '9px' }}>
                          {zone.type}
                        </Badge>
                        <div className="text-xs mt-1 font-medium" style={{ color: zone.color }}>
                          {zone.analytics.activeOrders} orders
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-[#e4e4e7]">
                <h4 className="text-xs font-bold text-[#18181b] mb-2">Zone Types</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[#52525b]">Standard</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[#52525b]">Express</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-[#52525b]">Premium</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[#52525b]">Surge</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-[#52525b]">No Service</span>
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-[#e4e4e7] overflow-hidden">
                <button className="w-10 h-10 flex items-center justify-center hover:bg-[#f4f4f5] border-b border-[#e4e4e7]">
                  <Plus size={16} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center hover:bg-[#f4f4f5]">
                  <span className="text-xl">−</span>
                </button>
              </div>

              {/* Active Orders Markers */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-[#e4e4e7]">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="text-amber-600" size={16} />
                  <span className="text-sm font-bold text-[#18181b]">Live Orders</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{coverageStats?.activeOrders}</p>
                <p className="text-xs text-[#71717a]">Across {coverageStats?.activeZones} zones</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-4">
            {/* Zone Performance Table */}
            <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
                <h3 className="font-bold text-[#18181b]">Zone Performance Ranking</h3>
                <p className="text-xs text-[#71717a] mt-1">Top performing zones by daily metrics</p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Daily Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg Delivery</TableHead>
                    <TableHead>On-Time %</TableHead>
                    <TableHead>Cancellation</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zonePerformance.map((perf, idx) => (
                    <TableRow key={perf.zoneId}>
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
                      <TableCell className="font-medium">{perf.zoneName}</TableCell>
                      <TableCell className="font-bold">{perf.orders}</TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        ₹{(perf.revenue / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            perf.avgDeliveryTime < 20
                              ? 'border-emerald-500 text-emerald-600'
                              : perf.avgDeliveryTime < 30
                              ? 'border-amber-500 text-amber-600'
                              : 'border-rose-500 text-rose-600'
                          }
                        >
                          {perf.avgDeliveryTime}m
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500">{perf.onTimeRate}%</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            perf.cancellationRate < 2
                              ? 'bg-emerald-500'
                              : perf.cancellationRate < 3
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }
                        >
                          {perf.cancellationRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-500" size={14} fill="#f59e0b" />
                          <span className="font-medium">{perf.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Zone Metrics Grid */}
            <div className="grid grid-cols-3 gap-4">
              {zones
                .filter((z) => z.status === 'active')
                .slice(0, 6)
                .map((zone) => (
                  <div key={zone.id} className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-[#18181b] text-sm">{zone.name}</h4>
                      <Badge className={getZoneTypeColor(zone.type)} style={{ fontSize: '10px' }}>
                        {zone.type}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#71717a]">Daily Orders:</span>
                        <span className="font-bold text-[#18181b]">{zone.analytics.dailyOrders}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#71717a]">Revenue:</span>
                        <span className="font-bold text-emerald-600">
                          ₹{(zone.analytics.revenue / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#71717a]">Avg Delivery:</span>
                        <span className="font-bold text-[#18181b]">{zone.analytics.avgDeliveryTime}m</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-[#71717a]">Satisfaction:</span>
                        <div className="flex items-center gap-1">
                          <Star className="text-amber-500" size={12} fill="#f59e0b" />
                          <span className="font-bold text-[#18181b]">{zone.analytics.customerSatisfaction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-2 gap-4">
            {zones
              .filter((z) => z.type !== 'no-service')
              .map((zone) => (
                <div key={zone.id} className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-[#18181b]">{zone.name}</h4>
                      <p className="text-xs text-[#71717a]">{zone.id}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit size={14} className="mr-1" /> Edit
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Delivery Fee</label>
                        <Input
                          type="number"
                          value={zone.settings.deliveryFee}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Min Order Value</label>
                        <Input
                          type="number"
                          value={zone.settings.minOrderValue}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Max Radius (km)</label>
                        <Input
                          type="number"
                          value={zone.settings.maxDeliveryRadius}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Est. Time (min)</label>
                        <Input
                          type="number"
                          value={zone.settings.estimatedDeliveryTime}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Surge Multiplier</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={zone.settings.surgeMultiplier}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#71717a] block mb-1">Max Capacity</label>
                        <Input
                          type="number"
                          value={zone.settings.maxCapacity}
                          className="h-8 text-sm"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Zone Modification History</h3>
              <p className="text-xs text-[#71717a] mt-1">Complete audit trail of zone changes</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs">{new Date(item.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{item.zoneName}</div>
                        <div className="text-xs text-[#71717a]">{item.zoneId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.action === 'created'
                            ? 'border-emerald-500 text-emerald-600'
                            : item.action === 'updated'
                            ? 'border-blue-500 text-blue-600'
                            : item.action === 'activated'
                            ? 'border-purple-500 text-purple-600'
                            : item.action === 'deactivated'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-rose-500 text-rose-600'
                        }
                      >
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-md">{item.changes}</TableCell>
                    <TableCell className="text-xs text-[#71717a]">{item.performedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Zone Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Zone</DialogTitle>
            <DialogDescription>Define a new delivery zone with custom boundaries</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Zone Name</label>
              <Input
                placeholder="e.g., Whitefield Tech Park"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#18181b] mb-1 block">City</label>
                <Select value={zoneForm.city} onValueChange={(value) => setZoneForm({ ...zoneForm, city: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#18181b] mb-1 block">Region</label>
                <Select
                  value={zoneForm.region}
                  onValueChange={(value) => setZoneForm({ ...zoneForm, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#18181b] mb-1 block">Zone Type</label>
              <Select value={zoneForm.type} onValueChange={(value: any) => setZoneForm({ ...zoneForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Delivery</SelectItem>
                  <SelectItem value="express">Express Zone</SelectItem>
                  <SelectItem value="premium">Premium Zone</SelectItem>
                  <SelectItem value="surge">Surge Zone</SelectItem>
                  <SelectItem value="no-service">No Service Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-[#f4f4f5] rounded-lg p-4">
              <p className="text-sm font-medium text-[#18181b] mb-2">Draw Zone Boundaries</p>
              <p className="text-xs text-[#71717a] mb-3">Use the map tools to define the zone polygon</p>
              <div className="bg-gray-200 rounded h-48 flex items-center justify-center text-sm text-[#71717a]">
                Interactive Map Drawing Tool (Simulated)
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateZone}>Create Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zone Details Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedZone?.name}</DialogTitle>
            <DialogDescription>
              {selectedZone?.city}, {selectedZone?.region} • {selectedZone?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedZone && (
            <div className="space-y-4">
              {/* Zone Map */}
              <div
                className="h-64 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${selectedZone.color}22 0%, ${selectedZone.color}11 100%)`,
                }}
              >
                <div
                  className="w-48 h-48 rounded-2xl border-4 flex items-center justify-center"
                  style={{
                    borderColor: selectedZone.color,
                    backgroundColor: `${selectedZone.color}30`,
                  }}
                >
                  <div className="text-center">
                    <Map size={48} style={{ color: selectedZone.color }} className="mx-auto mb-2" />
                    <p className="font-bold text-sm" style={{ color: selectedZone.color }}>
                      {selectedZone.name}
                    </p>
                    <Badge className={`mt-2 ${getZoneTypeColor(selectedZone.type)}`}>{selectedZone.type}</Badge>
                  </div>
                </div>
              </div>

              {/* Zone Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Area</p>
                  <p className="text-lg font-bold text-[#18181b]">{selectedZone.analytics.areaSize} km²</p>
                </div>
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Active Orders</p>
                  <p className="text-lg font-bold text-amber-600">{selectedZone.analytics.activeOrders}</p>
                </div>
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Riders</p>
                  <p className="text-lg font-bold text-blue-600">{selectedZone.analytics.riderCount}</p>
                </div>
                <div className="bg-[#f4f4f5] rounded-lg p-3">
                  <p className="text-xs text-[#71717a] mb-1">Capacity</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedZone.analytics.capacityUsage}%</p>
                </div>
              </div>

              {/* Polygon Coordinates */}
              <div>
                <h4 className="text-sm font-bold text-[#18181b] mb-2">Zone Coordinates</h4>
                <div className="bg-[#f4f4f5] rounded-lg p-3 font-mono text-xs text-[#52525b] max-h-32 overflow-auto">
                  {selectedZone.polygon.map((coord, idx) => (
                    <div key={idx}>
                      Point {idx + 1}: {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowMapModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
