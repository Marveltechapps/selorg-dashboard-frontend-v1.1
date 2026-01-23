import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { api } from './overview/riderApi';
import { DashboardSummary, Order, Rider } from './overview/types';
import { SummaryCards } from './overview/SummaryCards';
import { LiveOrderBoard } from './overview/LiveOrderBoard';
import { OrderDetailsDrawer } from './overview/OrderDetailsDrawer';
import { DispatchDrawer } from './overview/DispatchDrawer';
import { RiderMapModal } from './overview/RiderMapModal';
import { ReassignRiderModal } from '../alerts/modals/ReassignRiderModal';
import { MapPin } from 'lucide-react';

export function RiderOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  
  // Drawers & Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [orderToReassign, setOrderToReassign] = useState<Order | null>(null);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);

  // Initial Fetch
  const fetchData = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      // Use Promise.allSettled to handle partial failures gracefully
      const [summaryResult, ordersResult, ridersResult] = await Promise.allSettled([
        api.getSummary(),
        api.getOrders(),
        api.getRiders()
      ]);
      
      // Handle summary
      if (summaryResult.status === 'fulfilled') {
        setSummary(summaryResult.value);
      } else {
        console.error("Failed to fetch summary:", summaryResult.reason);
        setSummary(null);
      }
      
      // Handle orders
      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value);
      } else {
        console.error("Failed to fetch orders:", ordersResult.reason);
        setOrders([]);
        toast.error(`Failed to load orders: ${ordersResult.reason instanceof Error ? ordersResult.reason.message : 'Unknown error'}`);
      }
      
      // Handle riders
      if (ridersResult.status === 'fulfilled') {
        setRiders(ridersResult.value);
      } else {
        console.error("Failed to fetch riders:", ridersResult.reason);
        setRiders([]);
        toast.error(`Failed to load riders: ${ridersResult.reason instanceof Error ? ridersResult.reason.message : 'Unknown error'}`);
      }
      
      // Data loaded successfully
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error(`Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Set empty defaults on error
      setSummary(null);
      setOrders([]);
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch only - no auto-refresh
    // Show loading only on initial load
    fetchData(true);
  }, []);

  // Debug logging removed - useEffect was only for development

  // Auto Assign Logic simulation - disabled automatic polling
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (autoAssignEnabled) {
  //      interval = setInterval(async () => {
  //          const count = await api.autoAssign();
  //          if (count > 0) {
  //              toast.success(`Auto-assigned ${count} orders`);
  //              fetchData();
  //          }
  //      }, 5000);
  //   }
  //   return () => clearInterval(interval);
  // }, [autoAssignEnabled]);

  // Handlers
  const handleTrackOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleAssignOrder = (order: Order) => {
    // For pending orders, open Dispatch Drawer with this order pre-selected
    if (order.status === 'pending') {
      setOrderToAssign(order);
      setIsDispatchOpen(true);
    } else {
      // For assigned orders, open reassign modal
      setOrderToReassign(order);
      setIsReassignModalOpen(true);
    }
  };

  const handleAlertOrder = async (order: Order) => {
    try {
      // Step 1: Call API to send alert
      await api.alertOrder(order.id, "Delayed Order Alert");
      
      // Step 2: Show success message
      toast.success(`Alert sent for Order #${order.id}`);
      
      // Step 3: Refresh data from server
      // Background refresh - don't show loading state
      await fetchData(false);
    } catch (error) {
      console.error("Failed to send alert:", error);
      toast.error(`Failed to send alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReassign = async (order: Order) => {
    // Open reassign modal from OrderDetailsDrawer
    setOrderToReassign(order);
    setIsDetailsOpen(false);
    setIsReassignModalOpen(true);
  };

  const handleReassignConfirm = async (riderId: string, riderName: string) => {
    if (!orderToReassign) return;
    
    try {
      // Step 1: Call API to reassign order
      await api.assignOrder(orderToReassign.id, riderId);
      
      // Step 2: Show success message
      toast.success(`Order ${orderToReassign.id} reassigned to ${riderName}`);
      
      // Step 3: Refresh data from server to get accurate state (including previous rider updates)
      // Background refresh - don't show loading state
      await fetchData(false);
      
      // Step 4: Close modal after data is refreshed
      setIsReassignModalOpen(false);
      setOrderToReassign(null);
    } catch (error) {
      console.error("Failed to reassign order:", error);
      toast.error(`Failed to reassign order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleDispatchAssign = async (orderId: string, riderId: string) => {
      try {
          // Step 1: Call API to assign order
          await api.assignOrder(orderId, riderId);
          
          // Step 2: Show success message
          toast.success(`Order ${orderId} assigned successfully`);
          
          // Step 3: Refresh data from server to get accurate state
          // Background refresh - don't show loading state
          await fetchData(false);
          
          // Step 4: Close drawer if it's open (will be handled by DispatchDrawer's onClose)
      } catch (error) {
          console.error("Failed to assign order:", error);
          toast.error(`Failed to assign order: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Don't close drawer on error - let user retry
      }
  };

  const handleAlertFromDrawer = async (orderId: string, reason: string) => {
      try {
          // Step 1: Call API to send alert
          await api.alertOrder(orderId, reason);
          
          // Step 2: Show success message
          toast.success(`Alert sent for Order #${orderId}`);
          
          // Step 3: Refresh data from server
          // Background refresh - don't show loading state
          await fetchData(false);
      } catch (error) {
          console.error("Failed to send alert:", error);
          toast.error(`Failed to send alert: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error; // Re-throw so drawer can handle it
      }
  };

  const unassignedOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rider Operations"
        subtitle="Fleet management and delivery oversight"
        actions={
          <button 
            onClick={() => {
              // Background refresh - don't show loading state
              fetchData(false);
            }}
            className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      {/* Summary Cards */}
      <SummaryCards data={summary} riders={riders} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Order Board */}
          <div className="lg:col-span-2 h-full">
            <LiveOrderBoard 
                orders={orders}
                riders={riders}
                loading={loading}
                onTrackOrder={handleTrackOrder}
                onAlertOrder={handleAlertOrder}
                onAssignOrder={handleAssignOrder}
                autoAssignEnabled={autoAssignEnabled}
                onToggleAutoAssign={setAutoAssignEnabled}
                refreshData={fetchData}
            />
          </div>

          {/* Rider Distribution / Map Teaser */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm flex flex-col h-[400px] lg:h-auto">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
                  <h3 className="font-bold text-[#212121]">Rider Distribution</h3>
                  <button onClick={() => setIsMapOpen(true)} className="text-xs text-[#F97316] hover:underline font-medium">Expand</button>
              </div>
              <div className="flex-1 bg-gray-100 flex items-center justify-center relative min-h-[300px] group cursor-pointer" onClick={() => setIsMapOpen(true)}>
                  {/* Mini Map Placeholder */}
                   <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center"></div>
                  
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm mb-3 shadow-lg group-hover:scale-110 transition-transform">
                        <MapPin size={32} className="text-[#F97316]" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">Click to view live map</span>
                  </div>

                  {/* Rider Status Stats */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                          <span className="text-xs text-[#757575] font-medium">Idle Riders</span>
                          <span className="font-bold text-[#212121]">{summary?.idleRiders ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-[#757575] font-medium">Busy Riders</span>
                          <span className="font-bold text-[#F97316]">{summary?.busyRiders ?? 0}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Drawers & Modals */}
      <OrderDetailsDrawer 
        order={selectedOrder}
        rider={selectedOrder?.riderId ? riders.find(r => r.id === selectedOrder.riderId) : undefined}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onReassign={handleReassign}
        onAlert={handleAlertFromDrawer}
      />

      <DispatchDrawer 
        isOpen={isDispatchOpen}
        onClose={() => {
          setIsDispatchOpen(false);
          setOrderToAssign(null);
        }}
        unassignedOrders={unassignedOrders}
        riders={riders}
        onAssign={handleDispatchAssign}
        preselectedOrder={orderToAssign}
      />

      <ReassignRiderModal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setOrderToReassign(null);
        }}
        onConfirm={handleReassignConfirm}
      />

      <RiderMapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        riders={riders}
      />
    </div>
  );
}