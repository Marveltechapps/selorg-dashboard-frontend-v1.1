import React, { useState, useEffect } from 'react';
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
import { 
  fetchUnassignedOrders, 
  fetchAllOrders, 
  fetchOnlineRiders, 
  fetchAutoAssignRules,
  assignOrder,
  batchCreateAssignment,
  autoAssignOrders
} from "./dispatch/dispatchApi";

export function DispatchOps() {
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
  
  // Selection State
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [batchOrders, setBatchOrders] = useState<DispatchOrder[]>([]);

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
      setUnassignedOrders(uOrders);
      setAllOrders(aOrders);
      setRiders(onlineRiders);
      setRules(rulesData);
    } catch (error) {
      console.error("Failed to load dispatch data", error);
      toast.error("Failed to refresh dispatch data", {
        description: error instanceof Error ? error.message : "Please check your connection and try again",
      });
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
    try {
      if (batchOrders.length > 0) {
        await batchCreateAssignment(batchOrders.map(o => o.id), riderId);
        toast.success(`Batch assigned ${batchOrders.length} orders to rider`, {
          description: "Orders have been successfully assigned",
        });
      } else if (selectedOrder) {
        await assignOrder(selectedOrder.id, riderId, overrideSla);
        toast.success(`Order ${selectedOrder.id} assigned successfully`, {
          description: "The order has been assigned to the rider",
        });
      }
      // Close modal and refresh data immediately after assignment
      setAssignModalOpen(false);
      setSelectedOrder(null);
      setBatchOrders([]);
      await loadData(); // Refresh to move orders out of queue and update rider status
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error("Assignment failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
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
              onClick={() => toast.info('Manual Order creation coming soon')}
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
            orders={unassignedOrders} 
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
        riders={riders}
        onConfirm={confirmAssignment}
      />

      <RulesConfigDrawer 
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        rules={rules}
        onRulesUpdate={loadData}
      />
    </div>
  );
}