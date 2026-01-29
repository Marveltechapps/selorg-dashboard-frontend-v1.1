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

  // Refs
  const maintenanceSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // In a real app, you might fetch these in parallel but independently to avoid blocking
      const [sumData, vehData, maintData] = await Promise.all([
        fetchFleetSummary(),
        fetchVehicles(), // We fetch all and filter client-side for this mockup
        fetchMaintenanceTasks()
      ]);
      setSummary(sumData);
      setVehicles(vehData);
      setMaintenanceTasks(maintData);
    } catch (error) {
      console.error("Failed to load fleet data", error);
      toast.error("Failed to load fleet data");
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
    await updateVehicle(id, updates);
    await loadData(); // Refresh data
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
        onSuccess={loadData}
      />
    </div>
  );
}
