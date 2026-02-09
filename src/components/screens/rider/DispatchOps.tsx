import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';
import { Send, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { UnassignedOrdersPanel } from "./dispatch/UnassignedOrdersPanel";
import { DispatchMapPanel } from "./dispatch/DispatchMapPanel";
import { AssignRiderModal } from "./dispatch/AssignRiderModal";
import { RulesConfigDrawer } from "./dispatch/RulesConfigDrawer";
import { 
  DispatchOrder, 
  DispatchRider, 
  AutoAssignRule 
} from "./dispatch/types";
import { ManualDispatchModal, ManualOrderPayload } from "./dispatch/ManualDispatchModal";
import { 
  fetchUnassignedOrders, 
  fetchAllOrders, 
  fetchOnlineRiders, 
  fetchAutoAssignRules,
  assignOrder,
  batchCreateAssignment,
  autoAssignOrders
} from "./dispatch/dispatchApi";

interface DispatchOpsProps {
  searchQuery?: string;
}

export function DispatchOps({ searchQuery = '' }: DispatchOpsProps) {
  // Data State
  const [unassignedOrders, setUnassignedOrders] = useState<DispatchOrder[]>([]);
  const [allOrders, setAllOrders] = useState<DispatchOrder[]>([]); // For map
  const [riders, setRiders] = useState<DispatchRider[]>([]);
  const [rules, setRules] = useState<AutoAssignRule[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isManualDispatchOpen, setIsManualDispatchOpen] = useState(false);
  
  // Selection State
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [batchOrders, setBatchOrders] = useState<DispatchOrder[]>([]);

  const localNewOrdersRef = useRef<DispatchOrder[]>([]);
  const localOrderAssignmentsRef = useRef<Record<string, { riderId: string; status: 'assigned' }>>({});

  // Filter orders and riders based on search query
  const filteredUnassignedOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return unassignedOrders;
    const query = searchQuery.toLowerCase();
    return unassignedOrders.filter(o => 
      o.id.toLowerCase().includes(query) ||
      o.pickupLocation.address.toLowerCase().includes(query) ||
      o.dropLocation.address.toLowerCase().includes(query) ||
      o.zone?.toLowerCase().includes(query)
    );
  }, [unassignedOrders, searchQuery]);

  const filteredRiders = React.useMemo(() => {
    if (!searchQuery.trim()) return riders;
    const query = searchQuery.toLowerCase();
    return riders.filter(r => 
      r.id.toLowerCase().includes(query) ||
      r.name.toLowerCase().includes(query) ||
      r.zone?.toLowerCase().includes(query)
    );
  }, [riders, searchQuery]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  // Refresh only when tab becomes visible (user action) - no auto-polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh when user returns to tab
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto-Assign Simulation - disabled automatic polling
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (autoAssignEnabled) {
  //     interval = setInterval(async () => {
  //       const unassignedIds = unassignedOrders.map(o => o.id);
  //       if (unassignedIds.length > 0) {
  //         try {
  //           const result = await autoAssignOrders(unassignedIds);
  //           if (result.assigned > 0) {
  //              toast.success(`Auto-assigned ${result.assigned} orders`);
  //              loadData();
  //           }
  //         } catch (e) {
  //           console.error("Auto-assign error:", e);
  //           toast.error("Auto-assign failed", {
  //             description: e instanceof Error ? e.message : "Please try again",
  //           });
  //         }
  //       }
  //     }, 10000); // Check every 10s if on
  //   }
  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [autoAssignEnabled, unassignedOrders]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uOrders, aOrders, onlineRiders, rulesData] = await Promise.all([
        fetchUnassignedOrders(),
        fetchAllOrders(),
        fetchOnlineRiders(),
        fetchAutoAssignRules()
      ]);
      const allFromApi = Array.isArray(aOrders) ? aOrders : [];
      const mergedAll = allFromApi.map(o => ({ ...o, ...localOrderAssignmentsRef.current[o.id] }));
      localNewOrdersRef.current.forEach(o => {
        const patch = localOrderAssignmentsRef.current[o.id];
        const entry = patch ? { ...o, ...patch } : o;
        if (!mergedAll.find(m => m.id === o.id)) mergedAll.push(entry);
      });
      const mergedUnassigned = mergedAll.filter(o => o.status === 'unassigned');
      setUnassignedOrders(mergedUnassigned);
      setAllOrders(mergedAll);
      setRiders(Array.isArray(onlineRiders) ? onlineRiders : []);
      setRules(Array.isArray(rulesData) ? rulesData : []);
    } catch (error) {
      console.error("Failed to load dispatch data", error);
      const fallbackOrders: DispatchOrder[] = [
        { id: 'ORD-1', priority: 'high', distanceKm: 2.5, etaMinutes: 12, zone: 'Central', status: 'unassigned', pickupLocation: { lat: 13.0827, lng: 80.2707, address: 'Hub A, Chennai' }, dropLocation: { lat: 13.09, lng: 80.28, address: '123 Main St' }, slaDeadline: new Date(Date.now() + 45 * 60000).toISOString(), createdAt: new Date().toISOString() },
        { id: 'ORD-2', priority: 'medium', distanceKm: 4, etaMinutes: 18, zone: 'North', status: 'unassigned', pickupLocation: { lat: 13.09, lng: 80.28, address: 'Hub B' }, dropLocation: { lat: 13.07, lng: 80.26, address: '456 Oak Ave' }, slaDeadline: new Date(Date.now() + 60 * 60000).toISOString(), createdAt: new Date().toISOString() },
      ];
      const mergedAll = localNewOrdersRef.current.length > 0 ? [...localNewOrdersRef.current] : fallbackOrders;
      Object.keys(localOrderAssignmentsRef.current).forEach(id => {
        const existing = mergedAll.find(m => m.id === id);
        if (existing) Object.assign(existing, localOrderAssignmentsRef.current[id]);
      });
      setUnassignedOrders(mergedAll.filter(o => o.status === 'unassigned'));
      setAllOrders(mergedAll);
      setRiders([
        { id: 'r1', name: 'Raj K', status: 'online', currentLocation: { lat: 13.08, lng: 80.27 }, activeOrdersCount: 1, maxCapacity: 4, zone: 'Central', avgEtaMinutes: 12 },
        { id: 'r2', name: 'Priya M', status: 'idle', currentLocation: { lat: 13.09, lng: 80.28 }, activeOrdersCount: 0, maxCapacity: 4, zone: 'North', avgEtaMinutes: 10 },
      ]);
      setRules([]);
      toast.info("Using sample data. Connect backend for live data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (order: DispatchOrder) => {
    setSelectedOrder(order);
    setBatchOrders([]);
    setAssignModalOpen(true);
  };

  const handleBatchAssignClick = (orderIds: string[]) => {
    const orders = unassignedOrders.filter(o => orderIds.includes(o.id));
    setBatchOrders(orders);
    setSelectedOrder(null);
    setAssignModalOpen(true);
  };

  const confirmAssignment = async (riderId: string, overrideSla: boolean) => {
    const toAssign = batchOrders.length > 0 ? batchOrders : (selectedOrder ? [selectedOrder] : []);
    try {
      if (batchOrders.length > 0) {
        await batchCreateAssignment(batchOrders.map(o => o.id), riderId);
        toAssign.forEach(o => { localOrderAssignmentsRef.current[o.id] = { riderId, status: 'assigned' }; });
        setUnassignedOrders(prev => prev.filter(o => !batchOrders.some(b => b.id === o.id)));
        setAllOrders(prev => prev.map(o => batchOrders.some(b => b.id === o.id) ? { ...o, riderId, status: 'assigned' as const } : o));
        toast.success(`Batch assigned ${batchOrders.length} orders to rider`);
      } else if (selectedOrder) {
        await assignOrder(selectedOrder.id, riderId, overrideSla);
        localOrderAssignmentsRef.current[selectedOrder.id] = { riderId, status: 'assigned' };
        setUnassignedOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
        setAllOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, riderId, status: 'assigned' as const } : o));
        toast.success(`Order ${selectedOrder.id} assigned successfully`);
      }
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assignment failed");
      await loadData();
    } finally {
      setAssignModalOpen(false);
      setSelectedOrder(null);
      setBatchOrders([]);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch Operations"
        subtitle="Real-time delivery coordination"
        actions={
          <div className="flex gap-2">
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button 
              onClick={() => setIsManualDispatchOpen(true)}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
            >
              <Send size={16} />
              Manual Dispatch
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Queue */}
        <div className="lg:col-span-1">
          <UnassignedOrdersPanel 
            orders={filteredUnassignedOrders} 
            loading={loading} 
            onAssign={handleAssignClick}
            onBatchAssign={handleBatchAssignClick}
          />
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2">
          <DispatchMapPanel 
            orders={allOrders}
            riders={riders}
            loading={loading}
          />
        </div>
      </div>

      {/* Modals & Drawers */}
      <AssignRiderModal 
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        order={selectedOrder}
        batchOrders={batchOrders}
        riders={filteredRiders.length > 0 ? filteredRiders : riders}
        onConfirm={confirmAssignment}
      />

      <RulesConfigDrawer 
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={rules}
        onRulesUpdate={loadData}
      />

      <ManualDispatchModal 
        isOpen={isManualDispatchOpen}
        onClose={() => setIsManualDispatchOpen(false)}
        onSuccess={(order) => {
          const newOrder: DispatchOrder = {
            id: order.id,
            priority: 'medium',
            distanceKm: 0,
            etaMinutes: 15,
            zone: 'General',
            status: 'unassigned',
            pickupLocation: { lat: 40.71, lng: -74, address: order.pickup },
            dropLocation: { lat: 40.72, lng: -74.01, address: order.drop },
            slaDeadline: new Date(Date.now() + 60 * 60000).toISOString(),
            createdAt: new Date().toISOString(),
          };
          localNewOrdersRef.current = [newOrder, ...localNewOrdersRef.current];
          setUnassignedOrders(prev => [newOrder, ...prev]);
          setAllOrders(prev => [newOrder, ...prev]);
          setIsManualDispatchOpen(false);
          loadData();
        }}
      />
    </div>
  );
}