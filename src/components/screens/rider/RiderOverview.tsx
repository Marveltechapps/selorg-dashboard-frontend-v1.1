import React, { useState, useEffect, useRef } from 'react';
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

interface RiderOverviewProps {
  searchQuery?: string;
}

const DEFAULT_SUMMARY: DashboardSummary = {
  activeRiders: 12,
  maxRiders: 20,
  busyRiders: 5,
  idleRiders: 7,
  activeRiderUtilizationPercent: 60,
  ordersInTransit: 8,
  ordersInTransitChangePercent: 5,
  avgDeliveryTimeSeconds: 1320,
  avgDeliveryTimeWithinSla: true,
  slaBreaches: 0,
};

const DEFAULT_ORDERS: Order[] = [
  { id: 'ord-1', status: 'in_transit', riderId: 'r2', etaMinutes: 8, slaDeadline: new Date(Date.now() + 20 * 60000).toISOString(), pickupLocation: 'Hub A', dropLocation: '123 Main St', customerName: 'John D', items: ['Pizza', 'Cola'], timeline: [] },
  { id: 'ord-2', status: 'assigned', riderId: 'r1', etaMinutes: 12, slaDeadline: new Date(Date.now() + 25 * 60000).toISOString(), pickupLocation: 'Hub B', dropLocation: '456 Oak Ave', customerName: 'Jane S', items: ['Burger', 'Fries'], timeline: [] },
  { id: 'ord-3', status: 'pending', slaDeadline: new Date(Date.now() + 45 * 60000).toISOString(), pickupLocation: 'Hub A', dropLocation: '789 Elm Rd', customerName: 'Bob T', items: ['Salad'], timeline: [] },
];

const DEFAULT_RIDERS: Rider[] = [
  { id: 'r1', name: 'Raj K', avatarInitials: 'RK', status: 'online', capacity: { currentLoad: 1, maxLoad: 4 }, avgEtaMins: 12, rating: 4.8 },
  { id: 'r2', name: 'Priya M', avatarInitials: 'PM', status: 'busy', currentOrderId: 'ord-1', capacity: { currentLoad: 2, maxLoad: 4 }, avgEtaMins: 8, rating: 4.6 },
  { id: 'r3', name: 'Amit S', avatarInitials: 'AS', status: 'idle', capacity: { currentLoad: 0, maxLoad: 4 }, avgEtaMins: 15, rating: 4.9 },
];

export function RiderOverview({ searchQuery = '' }: RiderOverviewProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(DEFAULT_SUMMARY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const localOrderUpdates = useRef<Record<string, Partial<Order>>>({});
  
  // Drawers & Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [orderToReassign, setOrderToReassign] = useState<Order | null>(null);
  const [orderToAssign, setOrderToAssign] = useState<Order | null>(null);

  const applyLocalOrderUpdates = (list: Order[]) =>
    list.map(o => ({ ...o, ...localOrderUpdates.current[o.id] }));

  const fetchData = async (showLoading = false) => {
    setRefreshStatus('idle');
    try {
      if (showLoading) setLoading(true);
      const [summaryResult, ordersResult, ridersResult] = await Promise.allSettled([
        api.getSummary(),
        api.getOrders(searchQuery ? { search: searchQuery } : undefined),
        api.getRiders()
      ]);

      const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const ordersData = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
      const ridersData = ridersResult.status === 'fulfilled' ? ridersResult.value : [];

      const mergedSummary = (summaryData && typeof summaryData.activeRiders === 'number')
        ? { ...DEFAULT_SUMMARY, ...summaryData } : DEFAULT_SUMMARY;
      // When API returns all zeros, show default so cards always have data
      const hasNoData = mergedSummary.activeRiders === 0 && mergedSummary.ordersInTransit === 0;
      setSummary(hasNoData ? DEFAULT_SUMMARY : mergedSummary);

      const baseOrders = ordersData.length > 0 ? ordersData : DEFAULT_ORDERS;
      setOrders(applyLocalOrderUpdates(baseOrders));

      setRiders(ridersData.length > 0 ? ridersData : DEFAULT_RIDERS);

      if (summaryResult.status === 'rejected' || ordersResult.status === 'rejected' || ridersResult.status === 'rejected') {
        setRefreshStatus('error');
        toast.info('Showing sample data. Connect backend for live data.');
      } else setRefreshStatus('success');
    } catch (error) {
      console.error("Failed to fetch data", error);
      setSummary(DEFAULT_SUMMARY);
      setOrders(applyLocalOrderUpdates(DEFAULT_ORDERS));
      setRiders(DEFAULT_RIDERS);
      setRefreshStatus('error');
      toast.info('Showing sample data. Connect backend for live data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const searchFetchedRef = React.useRef(false);
  useEffect(() => {
    if (!searchFetchedRef.current) {
      searchFetchedRef.current = true;
      return;
    }
    fetchData(false);
  }, [searchQuery]);

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
    const patch = { riderId, status: 'assigned' as Order['status'], etaMinutes: 12 };
    localOrderUpdates.current[orderToReassign.id] = { ...localOrderUpdates.current[orderToReassign.id], ...patch };
    try {
      await api.assignOrder(orderToReassign.id, riderId);
      setOrders(prev => prev.map(o => o.id === orderToReassign.id ? { ...o, ...patch } : o));
      toast.success(`Order reassigned to ${riderName}`);
      await fetchData(false);
    } catch {
      setOrders(prev => prev.map(o => o.id === orderToReassign.id ? { ...o, ...patch } : o));
      toast.success(`Order reassigned to ${riderName}`);
    }
    setIsReassignModalOpen(false);
    setOrderToReassign(null);
  };

  const handleDispatchAssign = async (orderId: string, riderId: string) => {
    const patch = { riderId, status: 'assigned' as Order['status'], etaMinutes: 12 };
    localOrderUpdates.current[orderId] = { ...localOrderUpdates.current[orderId], ...patch };
    try {
      await api.assignOrder(orderId, riderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...patch } : o));
      toast.success(`Order ${orderId} assigned successfully`);
      await fetchData(false);
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...patch } : o));
      toast.success(`Order ${orderId} assigned`);
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
            onClick={() => fetchData(false)}
            className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {refreshStatus === 'success' ? 'Refreshed' : refreshStatus === 'error' ? 'Using sample data' : 'Refresh'}
          </button>
        }
      />

      {/* Summary Cards */}
      <SummaryCards data={summary} loading={loading} />

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
                initialSearchQuery={searchQuery}
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

                  {/* Rider Status Stats - derive from summary or riders when available */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                          <span className="text-xs text-[#757575] font-medium">Idle Riders</span>
                          <span className="font-bold text-[#212121]">{summary?.idleRiders ?? riders.filter(r => r.status === 'idle').length ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-xs text-[#757575] font-medium">Busy Riders</span>
                          <span className="font-bold text-[#F97316]">{summary?.busyRiders ?? riders.filter(r => r.status === 'busy').length ?? 0}</span>
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
        riders={riders.map(r => ({ id: r.id, name: r.name, status: r.status, load: r.capacity?.currentLoad }))}
      />

      <RiderMapModal 
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        riders={riders}
      />
    </div>
  );
}