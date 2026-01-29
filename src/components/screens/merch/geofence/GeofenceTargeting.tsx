import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Filter, X, Loader2 } from 'lucide-react';
import { Button } from "../../../ui/button";
import { Zone, Store } from './types';
import { ZoneControls } from './ZoneControls';
import { MapArea } from './MapArea';
import { KPICards } from './KPICards';
import { ZoneDetailDrawer } from './ZoneDetailDrawer';
import { AddZoneWizard } from './AddZoneWizard';
import { ActiveZonesModal, StoreCoverageModal } from './GeofenceModals';
import { Switch } from "../../../ui/switch";
import { Label } from "../../../ui/label";
import { geofenceApi } from './geofenceApi';
import { toast } from 'sonner';

export function GeofenceTargeting({ searchQuery = "" }: { searchQuery?: string }) {
  const [zones, setZones] = useState<Zone[]>([
    { id: '1', name: 'Downtown Core', type: 'Serviceable', status: 'Active', isVisible: true, color: '#10B981', areaSqKm: 12.4, promoCount: 8, points: [{ x: 30, y: 30 }, { x: 50, y: 25 }, { x: 55, y: 45 }, { x: 35, y: 50 }] },
    { id: '2', name: 'West End Hub', type: 'Priority', status: 'Active', isVisible: true, color: '#3B82F6', areaSqKm: 8.2, promoCount: 5, points: [{ x: 10, y: 40 }, { x: 25, y: 35 }, { x: 30, y: 60 }, { x: 15, y: 65 }] },
    { id: '3', name: 'Exclusion Zone A', type: 'Exclusion', status: 'Active', isVisible: true, color: '#EF4444', areaSqKm: 4.1, promoCount: 0, points: [{ x: 60, y: 60 }, { x: 80, y: 55 }, { x: 85, y: 75 }, { x: 65, y: 80 }] }
  ]);
  const [stores, setStores] = useState<Store[]>([
    { id: '1', name: 'Main St. Express', address: '123 Main St, Downtown', x: 42, y: 38, zones: ['Downtown Core'], serviceStatus: 'Full' },
    { id: '2', name: 'Westside Market', address: '456 West Blvd, West End', x: 18, y: 52, zones: ['West End Hub'], serviceStatus: 'Full' },
    { id: '3', name: 'North Hills Outpost', address: '789 North Rd, North Hills', x: 72, y: 22, zones: [], serviceStatus: 'Partial' }
  ]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isZoneListOpen, setIsZoneListOpen] = useState(false);
  const [isStoreCoverageOpen, setIsStoreCoverageOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHeatmapPanel, setShowHeatmapPanel] = useState(false);

  // Filter zones and stores based on search query
  const filteredZones = useMemo(() => {
    if (!searchQuery) return zones;
    return zones.filter(z => z.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [zones, searchQuery]);

  const filteredStores = useMemo(() => {
    if (!searchQuery) return stores;
    return stores.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.address.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [stores, searchQuery]);

  // Handlers - Updated locally
  const handleToggleVisibility = (id: string) => {
    setZones(zones.map(z => z.id === id ? { ...z, isVisible: !z.isVisible } : z));
  };

  const handleZoneClick = (zone: Zone) => {
    setSelectedZone(zone);
    setIsDrawerOpen(true);
  };

  const handleStoreClick = (store: Store) => {
    console.log("Clicked store", store.name);
  };

  const handleAddZone = (newZone: Zone) => {
    const zoneWithId = { ...newZone, id: `zone-${Date.now()}` };
    setZones([zoneWithId, ...zones]);
    setSelectedZone(zoneWithId);
    setIsDrawerOpen(true);
    setIsWizardOpen(false); 
    toast.success("Zone Created Locally");
  };

  const handleEditZone = (zone: Zone) => {
      setSelectedZone(zone);
      setIsDrawerOpen(true);
  };

  const handleArchiveZone = (zone: any) => {
      if (confirm(`Are you sure you want to archive ${zone.name}?`)) {
          setZones(zones.filter(z => z.id !== zone.id));
          setIsDrawerOpen(false);
          toast.success("Zone Archived Locally");
      }
  };

  const handleHeatmapToggle = () => {
      const newState = !showHeatmap;
      setShowHeatmap(newState);
      setShowHeatmapPanel(newState);
  };

  const kpiStats = {
    activeZones: zones.filter(z => z.status === 'Active').length || 3,
    totalArea: zones.reduce((acc, z) => acc + (z.areaSqKm || 0), 0) || 24.7,
    storesFullyCovered: stores.filter(s => s.serviceStatus === 'Full').length || 2,
    storesTotal: stores.length || 3,
    topPromoZone: 'Downtown Core'
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-10 w-10 text-[#7C3AED] animate-spin" />
        <p className="text-gray-500 font-medium">Connecting to Geofence Services...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Geofence & Targeting</h1>
          <p className="text-[#757575] text-sm">Manage serviceable areas, exclusion zones, and location-based promotions</p>
        </div>
        <div className="flex items-center gap-4">
             {zones.length === 0 && (
                <Button variant="outline" onClick={() => {
                    geofenceApi.seedData().then(() => fetchData());
                }} className="text-xs h-9">
                    Seed Mock Data
                </Button>
             )}
             <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <Switch id="heatmap-mode" checked={showHeatmap} onCheckedChange={handleHeatmapToggle} />
                <Label htmlFor="heatmap-mode" className="text-sm font-medium">Promo Heatmap</Label>
             </div>
             <Button onClick={() => setIsWizardOpen(true)} className="bg-[#212121] hover:bg-black">
                <MapPin className="mr-2 h-4 w-4" /> Add Zone
            </Button>
        </div>
      </div>

      {/* Main Content: Map & Controls */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-[#E0E0E0] shadow-sm relative overflow-hidden flex flex-col">
          {/* Map */}
          <div className="flex-1 relative">
             <MapArea 
                zones={filteredZones} 
                stores={filteredStores} 
                onZoneClick={handleZoneClick}
                onStoreClick={handleStoreClick}
                showHeatmap={showHeatmap}
             />
             
             {/* Map Controls Overlay */}
             <ZoneControls 
                zones={filteredZones} 
                onToggleVisibility={handleToggleVisibility} 
                onZoneClick={handleZoneClick}
                onEditZone={handleEditZone}
                onArchiveZone={handleArchiveZone}
             />

             {/* Heatmap Panel Overlay */}
             {showHeatmapPanel && (
                 <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in slide-in-from-right-10 z-[30]">
                     <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="font-bold text-gray-900">Heatmap Details</h3>
                            <p className="text-xs text-gray-500">Last 30 Days • All Campaigns</p>
                         </div>
                         <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHeatmapPanel(false)}>
                             <X className="h-4 w-4" />
                         </Button>
                     </div>
                     
                     <div className="space-y-4">
                         <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span>Downtown Core</span>
                                 <span className="font-bold text-green-600">$12.4k</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-red-500 w-[85%]" />
                             </div>
                         </div>
                          <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span>West End</span>
                                 <span className="font-bold text-green-600">$8.2k</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-orange-400 w-[65%]" />
                             </div>
                         </div>
                          <div>
                             <div className="flex justify-between text-sm mb-1">
                                 <span>North Hills</span>
                                 <span className="font-bold text-green-600">$3.1k</span>
                             </div>
                             <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-yellow-400 w-[25%]" />
                             </div>
                         </div>

                         <div className="pt-4 border-t">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">METRIC</h4>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="h-7 text-xs">Revenue</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs">Redemptions</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs">Orders</Button>
                            </div>
                         </div>
                     </div>
                 </div>
             )}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="shrink-0">
          <KPICards 
            stats={kpiStats} 
            onViewActiveZones={() => setIsZoneListOpen(true)}
            onViewStoresCovered={() => setIsStoreCoverageOpen(true)}
            onViewHeatmap={() => { setShowHeatmap(true); setShowHeatmapPanel(true); }}
          />
      </div>

      {/* Modals & Drawers */}
      <ZoneDetailDrawer 
        zone={selectedZone} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onEdit={() => alert("Edit mode not implemented in this demo")}
        onArchive={handleArchiveZone}
      />

      <AddZoneWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
        onSave={handleAddZone}
        existingZones={zones}
      />

      <ActiveZonesModal 
        isOpen={isZoneListOpen} 
        onClose={() => setIsZoneListOpen(false)}
        zones={zones}
        onEditZone={handleEditZone}
        onViewOnMap={(zone) => { setIsZoneListOpen(false); handleZoneClick(zone); }}
      />

      <StoreCoverageModal 
        isOpen={isStoreCoverageOpen}
        onClose={() => setIsStoreCoverageOpen(false)}
        stores={stores}
      />
    </div>
  );
}
