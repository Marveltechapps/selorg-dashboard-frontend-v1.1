import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Map, 
  Zap, 
  Clock, 
  Users, 
  ShoppingBag,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Settings,
  BarChart3,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zone,
  Incident,
  Exception,
  LiveMetrics,
  fetchLiveMetrics,
  fetchZones,
  fetchIncidents,
  fetchExceptions,
  resolveException
} from './citywideControlApi';
import { ZoneDetailModal } from './modals/ZoneDetailModal';
import { IncidentDetailModal } from './modals/IncidentDetailModal';
import { SurgeControlModal } from './modals/SurgeControlModal';
import { DispatchEngineModal } from './modals/DispatchEngineModal';
import { AnalyticsModal } from './modals/AnalyticsModal';
import { toast } from 'sonner@2.0.3';

export function CitywideControl() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherMode, setWeatherMode] = useState(false);
  
  // Modal states
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [showSurgeControl, setShowSurgeControl] = useState(false);
  const [showDispatchEngine, setShowDispatchEngine] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadAllData();
    
    // Set up real-time updates every 2 seconds
    const interval = setInterval(() => {
      loadAllData();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      const [metricsData, zonesData, incidentsData, exceptionsData] = await Promise.all([
        fetchLiveMetrics(),
        fetchZones(),
        fetchIncidents(),
        fetchExceptions()
      ]);
      
      setMetrics(metricsData);
      setZones(zonesData);
      setIncidents(incidentsData);
      setExceptions(exceptionsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    try {
      await resolveException(exceptionId);
      toast.success('Exception resolved');
      loadAllData();
    } catch (error) {
      toast.error('Failed to resolve exception');
    }
  };

  const getZoneStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'surge': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-emerald-500';
    }
  };

  const getZoneStatusGradient = (status: string) => {
    switch (status) {
      case 'critical': return 'from-rose-100 to-rose-200';
      case 'warning': return 'from-amber-100 to-amber-200';
      case 'surge': return 'from-orange-100 to-orange-200';
      case 'offline': return 'from-gray-100 to-gray-200';
      default: return 'from-emerald-100 to-emerald-200';
    }
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-rose-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-emerald-600';
    }
  };

  const getExceptionTypeColor = (type: string) => {
    switch (type) {
      case 'rto_risk':
      case 'payment_failed':
        return 'text-rose-600';
      case 'pickup_delay':
      case 'delivery_delay':
        return 'text-amber-600';
      default:
        return 'text-orange-600';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const past = new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - past) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#18181b] tracking-tight">Citywide Control Room</h1>
          <p className="text-[#71717a] mt-1">Real-time monitoring of Bangalore operations across all zones.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-md shadow-lg shadow-zinc-500/20">
            <div className="w-2 h-2 bg-[#e11d48] rounded-full animate-pulse"></div>
            LIVE MODE
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeatherMode(!weatherMode)}
          >
            Weather Mode: {weatherMode ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 size={16} className="mr-2" />
            Analytics
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Metrics - Dark Style for "Control Room" feel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] p-5 rounded-xl shadow-lg border border-[#27272a] relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-white" />
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Live Order Flow</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">{metrics?.orderFlowPerHour.toLocaleString() || '4,821'}</h3>
            <span className="text-emerald-400 text-xs font-bold mb-1.5 flex items-center">
              <TrendingUp size={12} className="mr-1" /> +{metrics?.orderFlowTrend || 12}%
            </span>
          </div>
          <p className="text-[#52525b] text-xs mt-2">Orders / Hour</p>
        </div>
        
        <div className="bg-[#18181b] p-5 rounded-xl shadow-lg border border-[#27272a] relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} className="text-white" />
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Avg Delivery Time</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">
              {metrics?.avgDeliveryTime || '14m 22s'}
            </h3>
          </div>
          <p className="text-[#52525b] text-xs mt-2">Target: 15m 00s</p>
        </div>

        <div className="bg-[#18181b] p-5 rounded-xl shadow-lg border border-[#27272a] relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-white" />
          </div>
          <p className="text-[#a1a1aa] text-xs font-bold uppercase tracking-wider mb-1">Active Riders</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">{metrics?.activeRiders.toLocaleString() || '1,204'}</h3>
            <span className="text-rose-400 text-xs font-bold mb-1.5">{metrics?.riderUtilizationPercent || 98}% Utilized</span>
          </div>
          <p className="text-[#52525b] text-xs mt-2">Capacity: High Stress</p>
        </div>

        <div className="bg-[#e11d48] p-5 rounded-xl shadow-lg shadow-rose-900/20 border border-rose-600 relative overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <AlertTriangle size={64} className="text-white" />
          </div>
          <p className="text-rose-200 text-xs font-bold uppercase tracking-wider mb-1">Active Incidents</p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-white">{metrics?.activeIncidentsCount || 3}</h3>
            <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs font-bold mb-1.5">Critical</span>
          </div>
          <p className="text-rose-100 text-xs mt-2">
            {incidents.filter(i => i.severity === 'critical').length} Critical, {incidents.filter(i => i.severity === 'warning').length} Warning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Heatmap & Map */}
        <div className="lg:col-span-2 bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-[#e4e4e7] flex justify-between items-center bg-[#fcfcfc]">
            <div className="flex items-center gap-2">
              <Map size={18} className="text-[#18181b]" />
              <h3 className="font-bold text-[#18181b]">Operational Heatmap</h3>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#71717a] px-2 py-1 bg-[#f4f4f5] rounded border border-[#e4e4e7]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#71717a] px-2 py-1 bg-[#f4f4f5] rounded border border-[#e4e4e7]">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Surge
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#71717a] px-2 py-1 bg-[#f4f4f5] rounded border border-[#e4e4e7]">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical
              </span>
            </div>
          </div>
          <div className="flex-1 bg-[#f4f4f5] p-3 overflow-auto">
            {/* Interactive Zone Grid */}
            <div className="grid grid-cols-4 gap-3 h-full">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`bg-gradient-to-br ${getZoneStatusGradient(zone.status)} rounded-lg border-2 ${
                    zone.status === 'critical' ? 'border-rose-400' :
                    zone.status === 'warning' ? 'border-amber-400' :
                    zone.status === 'surge' ? 'border-orange-400' :
                    'border-emerald-400'
                  } p-3 cursor-pointer hover:scale-105 transition-all hover:shadow-lg relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#18181b]">Zone {zone.zoneNumber}</span>
                      <div className={`w-2 h-2 rounded-full ${getZoneStatusColor(zone.status)} ${zone.status !== 'normal' ? 'animate-pulse' : ''}`}></div>
                    </div>
                    <div className="text-sm font-bold text-[#18181b] mb-1">{zone.zoneName}</div>
                    <div className="text-xs text-[#52525b] mb-2">{zone.capacityPercent}% Capacity</div>
                    <div className="w-full bg-white/50 rounded-full h-1.5 mb-2">
                      <div 
                        className={`h-1.5 rounded-full ${getZoneStatusColor(zone.status)}`}
                        style={{ width: `${zone.capacityPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-[#52525b] space-y-0.5">
                      <div>{zone.activeOrders} Orders</div>
                      <div>{zone.activeRiders} Riders {zone.riderStatus === 'overload' && <span className="text-rose-600 font-bold">OVERLOAD</span>}</div>
                    </div>
                    {zone.surgeMultiplier && (
                      <Badge className="mt-1 text-[9px] bg-orange-500 text-white">
                        {zone.surgeMultiplier}x Surge
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exception Queue & Outages */}
        <div className="space-y-4">
             {/* Outage Manager */}
             <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
                 <div className="p-4 border-b border-[#e4e4e7] flex items-center justify-between bg-rose-50">
                     <h3 className="font-bold text-rose-900 flex items-center gap-2">
                         <AlertTriangle size={16} /> Outage Management
                     </h3>
                 </div>
                 <div className="divide-y divide-[#e4e4e7]">
                     <div className="p-4 flex items-center justify-between hover:bg-[#fcfcfc]">
                         <div>
                             <p className="text-sm font-bold text-[#18181b]">Payment Gateway</p>
                             <p className="text-xs text-[#71717a]">Razorpay</p>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span className="text-xs font-medium text-[#18181b]">Stable</span>
                         </div>
                     </div>
                     <div className="p-4 flex items-center justify-between hover:bg-[#fcfcfc]">
                         <div>
                             <p className="text-sm font-bold text-[#18181b]">Maps API</p>
                             <p className="text-xs text-[#71717a]">Google Maps</p>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                             <span className="text-xs font-medium text-[#18181b]">Latency</span>
                         </div>
                     </div>
                     <div className="p-4 flex items-center justify-between bg-rose-50/50">
                         <div>
                             <p className="text-sm font-bold text-[#18181b]">Store Outage</p>
                             <p className="text-xs text-rose-700 font-bold">ST-102 (Power Failure)</p>
                         </div>
                         <button className="px-2 py-1 text-xs font-bold bg-white border border-rose-200 text-rose-600 rounded shadow-sm hover:bg-rose-50">
                             Manage
                         </button>
                     </div>
                 </div>
             </div>

             {/* Live Exceptions */}
             <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm flex-1">
                 <div className="p-4 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fcfcfc]">
                     <h3 className="font-bold text-[#18181b]">Exception Queue</h3>
                     <span className="text-xs font-bold bg-[#18181b] text-white px-1.5 py-0.5 rounded">{exceptions.length}</span>
                 </div>
                 <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                     {exceptions.slice(0, 5).map((exception) => (
                         <div key={exception.id} className="p-3 border-b border-[#e4e4e7] last:border-0 hover:bg-[#f4f4f5] group">
                             <div className="flex justify-between mb-1">
                                 <span className={`text-xs font-bold ${getExceptionTypeColor(exception.type)}`}>
                                   {exception.type.replace('_', ' ').toUpperCase()}
                                 </span>
                                 <span className="text-[10px] text-[#71717a]">{formatTimeAgo(exception.timestamp)}</span>
                             </div>
                             <p className="text-sm font-medium text-[#18181b] mb-2">Order {exception.orderId} - {exception.description}</p>
                             <div className="flex gap-2 mb-2">
                                 <span className="text-[10px] px-1.5 py-0.5 bg-[#f4f4f5] text-[#52525b] rounded border border-[#e4e4e7]">Rider: {exception.riderName}</span>
                                 <span className="text-[10px] px-1.5 py-0.5 bg-[#f4f4f5] text-[#52525b] rounded border border-[#e4e4e7]">Store: {exception.storeName}</span>
                             </div>
                             <Button
                               variant="outline"
                               size="sm"
                               className="w-full"
                               onClick={() => handleResolveException(exception.id)}
                             >
                               Resolve
                             </Button>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Quick Controls */}
             <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
                 <div className="p-4 border-b border-[#e4e4e7] flex items-center gap-2 bg-[#fcfcfc]">
                     <Settings size={16} className="text-[#18181b]" />
                     <h3 className="font-bold text-[#18181b]">Quick Controls</h3>
                 </div>
                 <div className="p-4 space-y-3">
                     <Button 
                       variant="outline" 
                       className="w-full justify-start"
                       onClick={() => setShowDispatchEngine(true)}
                     >
                       <Activity size={16} className="mr-2 text-emerald-600" />
                       <div className="flex-1 text-left">
                         <div className="text-sm font-medium">Auto-Dispatch</div>
                         <div className="text-xs text-[#71717a]">🟢 Running</div>
                       </div>
                     </Button>

                     <Button 
                       variant="outline" 
                       className="w-full justify-start"
                       onClick={() => setShowSurgeControl(true)}
                     >
                       <Zap size={16} className="mr-2 text-orange-600" />
                       <div className="flex-1 text-left">
                         <div className="text-sm font-medium">Surge Control</div>
                         <div className="text-xs text-[#71717a]">1.5x Active</div>
                       </div>
                     </Button>

                     <Button 
                       variant="outline" 
                       className="w-full justify-start"
                     >
                       <Clock size={16} className="mr-2 text-blue-600" />
                       <div className="flex-1 text-left">
                         <div className="text-sm font-medium">SLA Rules</div>
                         <div className="text-xs text-[#71717a]">15 mins target</div>
                       </div>
                     </Button>
                 </div>
             </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="text-sm text-[#a1a1aa]">
              Last updated: {metrics ? formatTimeAgo(metrics.lastUpdated) : '2s ago'}
            </div>
            <div className="text-sm text-[#a1a1aa]">
              Total orders: 8,543 | Total riders: 3,421
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <Bell size={16} className="mr-2" />
              Alerts
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ZoneDetailModal
        open={selectedZoneId !== null}
        onClose={() => setSelectedZoneId(null)}
        zoneId={selectedZoneId}
      />
      <IncidentDetailModal
        open={selectedIncidentId !== null}
        onClose={() => setSelectedIncidentId(null)}
        incidentId={selectedIncidentId}
      />
      <SurgeControlModal
        open={showSurgeControl}
        onClose={() => setShowSurgeControl(false)}
      />
      <DispatchEngineModal
        open={showDispatchEngine}
        onClose={() => setShowDispatchEngine(false)}
      />
      <AnalyticsModal
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  );
}