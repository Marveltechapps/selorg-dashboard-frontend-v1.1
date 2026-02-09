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
import { HeatmapDetailsDrawer } from './HeatmapDetailsDrawer';

export function GeofenceTargeting({ searchQuery = "" }: { searchQuery?: string }) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  
  // UI State
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isZoneListOpen, setIsZoneListOpen] = useState(false);
  const [isStoreCoverageOpen, setIsStoreCoverageOpen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isHeatmapDrawerOpen, setIsHeatmapDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load data from localStorage on mount
  const loadData = () => {
    const loadedZones = geofenceApi.loadZones();
    const loadedStores = geofenceApi.loadStores();
    setZones(loadedZones);
    setStores(loadedStores);
  };

  useEffect(() => {
    loadData();
  }, []);

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
    const updated = geofenceApi.updateZone(id, { isVisible: !zones.find(z => z.id === id)?.isVisible });
    if (updated) {
      const updatedZones = geofenceApi.loadZones();
      setZones(updatedZones);
    }
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
    const createdZone = geofenceApi.createZone(zoneWithId);
    const updatedZones = geofenceApi.loadZones();
    setZones(updatedZones);
    setSelectedZone(createdZone);
    setIsDrawerOpen(true);
    setIsWizardOpen(false); 
    toast.success("Zone Created", {
      description: 'Zone has been saved and will persist after refresh'
    });
  };

  const handleEditZone = (zone: Zone) => {
      setSelectedZone(zone);
      setIsEditMode(true);
      setIsDrawerOpen(true);
  };

  const handleUpdateZone = (zoneId: string, updates: Partial<Zone>) => {
    const updated = geofenceApi.updateZone(zoneId, updates);
    if (updated) {
      const updatedZones = geofenceApi.loadZones();
      setZones(updatedZones);
      setSelectedZone(updated);
      toast.success("Zone Updated", {
        description: 'Changes have been saved and will persist after refresh'
      });
    }
  };

  const handleArchiveZone = (zone: any) => {
      if (confirm(`Are you sure you want to archive ${zone.name}?`)) {
          geofenceApi.deleteZone(zone.id);
          const updatedZones = geofenceApi.loadZones();
          setZones(updatedZones);
          setIsDrawerOpen(false);
          setSelectedZone(null);
          toast.success("Zone Archived", {
            description: 'Zone has been archived and will persist after refresh'
          });
      }
  };

  const handleHeatmapToggle = () => {
      const newState = !showHeatmap;
      setShowHeatmap(newState);
      if (newState) {
        setIsHeatmapDrawerOpen(true);
      }
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
                    geofenceApi.seedData().then(() => {
                        const loadedZones = geofenceApi.loadZones();
                        const loadedStores = geofenceApi.loadStores();
                        setZones(loadedZones);
                        setStores(loadedStores);
                    });
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

          </div>
      </div>

      {/* KPI Cards */}
      <div className="shrink-0">
          <KPICards 
            stats={kpiStats} 
            onViewActiveZones={() => setIsZoneListOpen(true)}
            onViewStoresCovered={() => setIsStoreCoverageOpen(true)}
            onViewHeatmap={() => { setShowHeatmap(true); setIsHeatmapDrawerOpen(true); }}
          />
      </div>

      {/* Modals & Drawers */}
      <ZoneDetailDrawer 
        zone={selectedZone} 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setIsEditMode(false);
        }} 
        onEdit={handleEditZone}
        onUpdate={handleUpdateZone}
        onArchive={handleArchiveZone}
        isEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
      />

      {/* Heatmap Details Drawer */}
      <HeatmapDetailsDrawer
        isOpen={isHeatmapDrawerOpen}
        onClose={() => {
          setIsHeatmapDrawerOpen(false);
          setShowHeatmap(false);
        }}
        zones={zones}
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
        onArchiveZone={handleArchiveZone}
      />

      <StoreCoverageModal 
        isOpen={isStoreCoverageOpen}
        onClose={() => setIsStoreCoverageOpen(false)}
        stores={stores}
        zones={zones}
        onViewTargeting={(store) => {
          toast.info(`Viewing targeting for ${store.name}`, {
            description: `Zones: ${store.zones.join(', ') || 'None assigned'}`
          });
        }}
        onStoresUpdated={loadData}
      />
    </div>
  );
}
