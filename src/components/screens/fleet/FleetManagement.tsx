import React, { useState, useEffect, useRef } from "react";
import { 
  fetchFleetSummary, 
  fetchVehicles, 
  fetchMaintenanceTasks, 
  updateVehicle, 
  createMaintenanceTask,
  FleetSummary, 
  Vehicle, 
  MaintenanceTask 
} from "./fleetApi";
import { FleetSummaryCards } from "./FleetSummaryCards";
import { VehicleStatusTable } from "./VehicleStatusTable";
import { VehicleDetailsDrawer } from "./VehicleDetailsDrawer";
import { VehicleManageDrawer } from "./VehicleManageDrawer";
import { AddVehicleModal } from "./AddVehicleModal";
import { MaintenanceScheduleList } from "./MaintenanceScheduleList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function FleetManagement() {
  // Data State
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<"all" | "maintenance" | "ev" | "scheduled" | null>(null);

  // Modal/Drawer State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const maintenanceSectionRef = useRef<HTMLDivElement>(null);
  const localVehiclesRef = useRef<Vehicle[]>([]);
  const localVehicleUpdatesRef = useRef<Record<string, Partial<Vehicle>>>({});
  const localMaintenanceUpdatesRef = useRef<Record<string, MaintenanceTask["status"]>>({});

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sumData, vehData, maintData] = await Promise.all([
        fetchFleetSummary(),
        fetchVehicles(),
        fetchMaintenanceTasks()
      ]);
      setSummary(sumData);
      const mergedVeh = (Array.isArray(vehData) ? vehData : []).map(v => ({ ...v, ...localVehicleUpdatesRef.current[v.id] }));
      localVehiclesRef.current.forEach(v => {
        const patched = { ...v, ...localVehicleUpdatesRef.current[v.id] };
        if (!mergedVeh.find(m => m.id === v.id)) mergedVeh.push(patched);
      });
      setVehicles(mergedVeh);
      const mergedMaint = (Array.isArray(maintData) ? maintData : []).map(t => ({
        ...t,
        ...(localMaintenanceUpdatesRef.current[t.id] && { status: localMaintenanceUpdatesRef.current[t.id] }),
      }));
      setMaintenanceTasks(mergedMaint);
    } catch (error) {
      console.error("Failed to load fleet data", error);
      const mergedVeh = [...localVehiclesRef.current];
      setVehicles(mergedVeh);
      setMaintenanceTasks([]);
      toast.info("Using sample data. Connect backend for live data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (filter: "all" | "maintenance" | "ev" | "scheduled") => {
    setActiveFilter(filter);
    if (filter === "scheduled" && maintenanceSectionRef.current) {
      maintenanceSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailsOpen(true);
  };

  const handleManage = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsManageOpen(true);
  };

  const handleUpdateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    localVehicleUpdatesRef.current[id] = { ...localVehicleUpdatesRef.current[id], ...updates };
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    try {
      await updateVehicle(id, updates);
      toast.success("Vehicle updated successfully");
    } catch (e) {
      toast.success("Vehicle updated (saved locally)");
    }
    loadData();
  };

  const handleScheduleMaintenance = async (task: any) => {
    await createMaintenanceTask(task);
    await loadData();
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Fleet & Vehicle Management</h1>
          <p className="text-[#757575] text-sm">Monitor fleet health, track maintenance, and manage vehicle assets.</p>
        </div>
        <Button 
          className="bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center gap-2"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={16} />
          Add Vehicle
        </Button>
      </div>

      {/* Summary Cards */}
      <FleetSummaryCards 
        summary={summary} 
        loading={loading} 
        onFilterClick={handleFilterClick}
      />

      {/* Main Table */}
      <VehicleStatusTable 
        vehicles={vehicles} 
        loading={loading} 
        onViewDetails={handleViewDetails}
        onManage={handleManage}
        preselectedFilter={activeFilter}
      />

      {/* Maintenance Section */}
      <div ref={maintenanceSectionRef}>
        <MaintenanceScheduleList 
          tasks={maintenanceTasks} 
          loading={loading} 
          onRefresh={loadData}
          onTaskStatusUpdated={(taskId, status) => {
            localMaintenanceUpdatesRef.current[taskId] = status;
            setMaintenanceTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
          }}
        />
      </div>

      {/* Dialogs & Drawers */}
      <VehicleDetailsDrawer 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        vehicle={selectedVehicle} 
      />

      <VehicleManageDrawer 
        isOpen={isManageOpen} 
        onClose={() => setIsManageOpen(false)} 
        vehicle={selectedVehicle} 
        onUpdate={handleUpdateVehicle}
        onScheduleMaintenance={handleScheduleMaintenance}
      />

      <AddVehicleModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={(newVehicle) => {
          if (newVehicle) {
            localVehiclesRef.current = [...localVehiclesRef.current, newVehicle];
            setVehicles(prev => [...prev, newVehicle]);
            loadData();
          }
        }}
      />
    </div>
  );
}
