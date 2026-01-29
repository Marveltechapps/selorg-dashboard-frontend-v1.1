import React, { useState, useEffect } from 'react';
import { Filter, MoreHorizontal, Clock, Package, Bike, User, AlertCircle, ArrowRight, Search, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { getLiveOrders, refreshDashboard } from '../../api/dashboard';
import { callCustomer, markRTO } from '../../api/dashboard/orders.api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { PageHeader } from '../ui/page-header';
import { EmptyState, LoadingState, SelectionSummaryBar, FilterChip, ResultCount } from '../ui/ux-components';
import { CancelOrderConfirmation, StatusChangeConfirmation } from '../ui/confirmation-dialog';
import { Button } from '../ui/button';
import { exportToCSV } from '../../utils/csvExport';

export function LiveOrders() {
  const [activeTab, setActiveTab] = useState('new');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation Dialogs
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: '' });
  const [statusDialog, setStatusDialog] = useState({ open: false, orderId: '', currentStatus: '', newStatus: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Bulk Selection State
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const storeId = 'DS-Brooklyn-04';

  const [orders, setOrders] = useState<any[]>([]);

  // Load orders on mount and when filters change
  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  // Real-time SLA timer update (runs every second)
  // Timer starts from 15:00 and counts down from createdAt + 15 minutes
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setOrders((prevOrders) => {
        return prevOrders.map((order: any) => {
          // Use sla_deadline if available, otherwise calculate from created_at + 15 minutes
          let deadline: Date;
          if (order.sla_deadline) {
            deadline = new Date(order.sla_deadline);
          } else if (order.created_at) {
            const createdAt = new Date(order.created_at);
            deadline = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15 minutes from creation
          } else {
            return order; // No timestamp available
          }
          
          const now = new Date();
          const diff = deadline.getTime() - now.getTime();
          
          if (diff <= 0) {
            // SLA breached
            return {
              ...order,
              sla: '00:00',
              urgency: 'critical',
            };
          }
          
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          
          // Update urgency based on time remaining
          let urgency = 'normal';
          if (minutes < 5) {
            urgency = 'critical';
          } else if (minutes < 15) {
            urgency = 'warning';
          }
          
          return {
            ...order,
            sla: formattedTimer,
            urgency,
            sla_deadline: deadline.toISOString(), // Ensure deadline is set for next iteration
          };
        });
      });
    }, 1000); // Update every second

    return () => clearInterval(timerInterval);
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const statusMap: { [key: string]: string } = {
        'new': 'new',
        'processing': 'processing',
        'ready': 'ready',
      };
      const status = statusMap[activeTab] || 'all';
      const response = await getLiveOrders(storeId, status, 100);
      
      if (response && response.orders) {
        // Transform backend orders to frontend format
        const transformedOrders = response.orders.map((order: any) => ({
          id: `#${order.order_id}`,
          order_id: order.order_id,
          customer: 'Customer', // Backend doesn't provide customer name in live orders
          items: order.item_count,
          zone: '', // Backend doesn't provide zone in live orders
          sla: order.sla_timer, // Initial value, will be updated by real-time timer
          sla_deadline: order.sla_deadline, // Include for real-time calculation
          status: order.status === 'new' ? 'Queued' : order.status === 'processing' ? 'Picking' : order.status === 'ready' ? 'Packing' : 'Queued',
          urgency: order.sla_status === 'critical' ? 'critical' : order.sla_status === 'warning' ? 'warning' : 'normal',
          assignee: order.assignee?.name || '-',
          assigneeId: order.assignee?.id || '',
          assigneeInitials: order.assignee?.initials || 'UA',
          order_type: order.order_type,
          created_at: order.created_at,
        }));
        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    const matchesUrgency = filterUrgency ? order.urgency === filterUrgency : true;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Bulk Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedOrders.map(o => o.id));
      setSelectedOrderIds(allIds);
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrderIds);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrderIds(newSelected);
  };

  const handleBulkAction = (action: string) => {
    toast.success(`${action} applied to ${selectedOrderIds.size} orders`);
    setSelectedOrderIds(new Set());
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      // Prepare CSV data
      const csvData: (string | number)[][] = [
        ['Live Order Board Report', `Date: ${today}`, `Time: ${timestamp}`],
        [''],
        ['Order ID', 'Customer', 'Items', 'Zone', 'SLA Timer', 'Status', 'Urgency', 'Assignee'],
        ...filteredOrders.map(order => [
          order.id,
          order.customer,
          order.items,
          order.zone,
          order.sla,
          order.status,
          order.urgency,
          order.assignee
        ]),
        [''],
        ['Summary'],
        ['Total Orders', filteredOrders.length],
        ['New Orders', filteredOrders.filter(o => o.status === 'Queued').length],
        ['In Progress', filteredOrders.filter(o => o.status === 'Picking' || o.status === 'Packing').length],
        ['Critical Urgency', filteredOrders.filter(o => o.urgency === 'critical').length],
        ['Warning Urgency', filteredOrders.filter(o => o.urgency === 'warning').length],
      ];

      exportToCSV(csvData, `live-orders-${today}-${timestamp.replace(/:/g, '-')}`);
      
      setIsExporting(false);
      toast.success('Report downloaded successfully');
    } catch (error) {
      setIsExporting(false);
      toast.error('Failed to generate report');
      console.error('Export error:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterStatus(null);
    setFilterUrgency(null);
    setCurrentPage(1);
    toast.info("All filters cleared");
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handlePrintLabel = (orderId: string) => {
    toast.success(`Label printed for order ${orderId}`);
  };

  const handleCancelOrder = (orderId: string) => {
    setCancelDialog({ open: true, orderId });
  };

  const confirmCancelOrder = () => {
    setOrders(prev => prev.filter(o => o.id !== cancelDialog.orderId));
    toast.success(`Order ${cancelDialog.orderId} has been cancelled`);
    setCancelDialog({ open: false, orderId: '' });
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setStatusDialog({
        open: true,
        orderId,
        currentStatus: order.status,
        newStatus
      });
    }
  };

  const confirmStatusUpdate = () => {
    setOrders(prev => prev.map(o => {
      if (o.id === statusDialog.orderId) {
        return { ...o, status: statusDialog.newStatus };
      }
      return o;
    }));
    
    if (selectedOrder && selectedOrder.id === statusDialog.orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: statusDialog.newStatus }));
    }
    
    toast.success(`Order ${statusDialog.orderId} status updated to ${statusDialog.newStatus}`);
    setStatusDialog({ open: false, orderId: '', currentStatus: '', newStatus: '' });
  };

  const handleUpdateUrgency = (orderId: string, newUrgency: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, urgency: newUrgency };
      }
      return o;
    }));
    
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, urgency: newUrgency }));
    }
    toast.success(`Order ${orderId} marked as ${newUrgency}`);
  };

  const tabs = [
    { id: 'new', label: 'New Orders', count: 12, color: 'text-[#1677FF]', border: 'border-[#1677FF]', bg: 'bg-[#E6F7FF]' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Order Board"
        subtitle="Real-time tracking of all active orders across the fulfillment lifecycle."
        actions={
          <div className="flex gap-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setCurrentPage(1); // Reset to page 1 on search
               }}
               placeholder="Search Order ID, Customer..." 
               className="h-10 pl-9 pr-4 rounded-lg bg-white border border-[#E0E0E0] text-sm focus:ring-2 focus:ring-[#1677FF] w-64 shadow-sm"
             />
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
               >
                 <XCircle size={14} />
               </button>
             )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-[#F5F5F5] shadow-sm transition-all",
                (filterStatus || filterUrgency) ? "border-[#1677FF] text-[#1677FF] bg-[#E6F7FF]" : "border-[#E0E0E0] text-[#616161]"
              )}>
                <Filter size={16} />
                Filters
                {(filterStatus || filterUrgency) && (
                  <span className="flex items-center justify-center w-5 h-5 bg-[#1677FF] text-white text-[10px] rounded-full">
                    {(filterStatus ? 1 : 0) + (filterUrgency ? 1 : 0)}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {['Queued', 'Picking', 'Packing'].map(status => (
                <DropdownMenuItem key={status} onClick={() => setFilterStatus(filterStatus === status ? null : status)}>
                  <div className="flex items-center justify-between w-full">
                    {status}
                    {filterStatus === status && <CheckCircle2 size={14} className="text-[#1677FF]" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Urgency</DropdownMenuLabel>
              {['normal', 'warning', 'critical'].map(urgency => (
                <DropdownMenuItem key={urgency} onClick={() => setFilterUrgency(filterUrgency === urgency ? null : urgency)}>
                  <div className="flex items-center justify-between w-full capitalize">
                    {urgency}
                    {filterUrgency === urgency && <CheckCircle2 size={14} className="text-[#1677FF]" />}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleClearFilters} className="text-red-600 justify-center">
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-[#1677FF] text-white rounded-lg text-sm font-medium hover:bg-[#409EFF] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              'Export CSV'
            )}
          </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-[#E0E0E0] shadow-sm inline-flex w-full gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border-b-2",
              activeTab === tab.id 
                ? `bg-[#FAFAFA] text-[#212121] ${tab.border}` 
                : "bg-white text-[#757575] border-transparent hover:bg-[#F5F5F5]"
            )}
          >
            {tab.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold",
              activeTab === tab.id ? `${tab.bg} ${tab.color}` : "bg-[#F5F5F5] text-[#9E9E9E]"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrderIds.size > 0 && (
        <div className="bg-[#E6F7FF] border border-[#91CAFF] rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1677FF] text-sm">{selectedOrderIds.size} orders selected</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkAction('Assign')}
              className="px-3 py-1.5 bg-white border border-[#91CAFF] text-[#1677FF] text-xs font-bold rounded hover:bg-[#F0F5FF]"
            >
              Bulk Assign
            </button>
            <button 
              onClick={() => handleBulkAction('Print Labels')}
              className="px-3 py-1.5 bg-white border border-[#91CAFF] text-[#1677FF] text-xs font-bold rounded hover:bg-[#F0F5FF]"
            >
              Print Labels
            </button>
            <button 
              onClick={() => setSelectedOrderIds(new Set())}
              className="px-3 py-1.5 text-[#1677FF] text-xs hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban / List View */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAFAFA] text-[#757575] border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-4 font-medium w-16">
                  <input 
                    type="checkbox" 
                    checked={paginatedOrders.length > 0 && selectedOrderIds.size === paginatedOrders.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]" 
                  />
                </th>
                <th className="px-6 py-4 font-medium">Order Details</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">SLA Timer</th>
                <th className="px-6 py-4 font-medium">Assignee</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0F0]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={24} className="opacity-20" />
                      <p>No orders found matching your filters.</p>
                      <button onClick={handleClearFilters} className="text-[#1677FF] text-xs hover:underline font-medium">
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className={cn("hover:bg-[#FAFAFA] transition-colors group", selectedOrderIds.has(order.id) && "bg-[#F0F7FF]")}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedOrderIds.has(order.id)}
                        onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                        className="rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                         <span className="font-bold text-[#212121] text-base">{order.id}</span>
                         <span className="text-[10px] text-[#9E9E9E] font-bold uppercase tracking-wider mt-0.5">
                           {order.order_type || order.zone || 'Normal'}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[#616161]">
                         <div className="bg-[#F5F5F5] p-2 rounded-lg">
                           <Package size={16} />
                         </div>
                         <span className="font-medium">{order.items}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center text-xs font-bold">
                           {order.customer.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-medium text-[#212121]">{order.customer}</span>
                            <span className="text-xs text-[#9E9E9E]">Premium Member</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "flex items-center gap-2 font-mono font-bold text-sm px-3 py-1.5 rounded-lg w-fit",
                        order.urgency === 'critical' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                        order.urgency === 'warning' ? 'bg-[#FFFBE6] text-[#D48806]' : 'bg-[#DCFCE7] text-[#16A34A]'
                      )}>
                        <Clock size={14} />
                        {order.sla}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.assignee && order.assignee !== '-' ? (
                        <div className="flex items-center gap-2 text-[#212121] font-medium">
                          {order.assigneeInitials && (
                            <div className="w-6 h-6 rounded-full bg-[#E0E7FF] text-[#4F46E5] flex items-center justify-center text-[10px] font-bold">
                              {order.assigneeInitials}
                            </div>
                          )}
                          <span>{order.assignee}</span>
                        </div>
                      ) : (
                        <button className="text-[#1677FF] text-xs font-bold hover:underline">
                          + Assign
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                        order.status === 'Packing' ? 'bg-[#F3E8FF] text-[#9333EA]' :
                        order.status === 'Picking' ? 'bg-[#E6F7FF] text-[#1677FF]' :
                        'bg-[#F5F5F5] text-[#616161]'
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 text-[#9E9E9E] hover:text-[#212121] hover:bg-[#E0E0E0] rounded-full transition-all">
                            <MoreHorizontal size={20} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintLabel(order.id)}>
                            Print Label
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-between">
           <span className="text-sm text-[#757575]">
             Showing <span className="font-bold text-[#212121]">{filteredOrders.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of <span className="font-bold text-[#212121]">{filteredOrders.length}</span> orders
           </span>
           <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-[#E0E0E0] bg-white rounded text-sm font-medium text-[#212121] disabled:text-[#C1C1C1] disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors",
                    currentPage === page ? "bg-[#1677FF] text-white" : "bg-white border border-[#E0E0E0] text-[#212121] hover:bg-[#F5F5F5]"
                  )}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 border border-[#E0E0E0] bg-white rounded text-sm font-medium text-[#212121] disabled:text-[#C1C1C1] disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors"
              >
                Next
              </button>
           </div>
        </div>
      </div>
      {/* Order Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              <SheetHeader className="border-b border-gray-100 pb-4 px-6">
                <SheetTitle className="flex items-center gap-2 text-xl">
                  {selectedOrder.id}
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                    selectedOrder.status === 'Packing' ? 'bg-[#F3E8FF] text-[#9333EA]' :
                    selectedOrder.status === 'Picking' ? 'bg-[#E6F7FF] text-[#1677FF]' :
                    'bg-[#F5F5F5] text-[#616161]'
                  )}>
                    {selectedOrder.status}
                  </span>
                </SheetTitle>
                <SheetDescription>
                  Full details and timeline for this order.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 p-6">
                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User size={18} /> Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{selectedOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Member Status</p>
                      <p className="font-medium text-[#4F46E5]">Premium</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">+1 (555) 012-3456</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium text-gray-900">123 Main St, Apt 4B</p>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Details */}
                <div className="space-y-3">
                   <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} /> Fulfillment Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">SLA Deadline</p>
                      <div className={cn(
                        "font-mono font-bold text-lg",
                        selectedOrder.urgency === 'critical' ? 'text-red-600' :
                        selectedOrder.urgency === 'warning' ? 'text-amber-600' : 'text-green-600'
                      )}>
                        {selectedOrder.sla} remaining
                      </div>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg">
                       <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                       <p className="font-medium text-gray-900">{selectedOrder.assignee !== '-' ? selectedOrder.assignee : 'Unassigned'}</p>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg">
                       <p className="text-xs text-gray-500 mb-1">Zone</p>
                       <p className="font-medium text-gray-900">{selectedOrder.zone}</p>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg">
                       <p className="text-xs text-gray-500 mb-1">Total Items</p>
                       <p className="font-medium text-gray-900">{selectedOrder.items} items</p>
                    </div>
                  </div>
                </div>

                {/* Items List (Mocked) */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Package size={18} /> Order Items
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Item</th>
                          <th className="px-4 py-2 font-medium text-right">Qty</th>
                          <th className="px-4 py-2 font-medium text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="px-4 py-3">Organic Whole Milk</td>
                          <td className="px-4 py-3 text-right">2</td>
                          <td className="px-4 py-3 text-right">₹8.50</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Sourdough Bread</td>
                          <td className="px-4 py-3 text-right">1</td>
                          <td className="px-4 py-3 text-right">₹5.25</td>
                        </tr>
                         <tr>
                          <td className="px-4 py-3">Free-Range Eggs (12ct)</td>
                          <td className="px-4 py-3 text-right">1</td>
                          <td className="px-4 py-3 text-right">₹6.99</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-gray-500 italic">...and {Math.max(0, selectedOrder.items - 4)} more items</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      handlePrintLabel(selectedOrder.id);
                      setIsDetailsOpen(false);
                    }}
                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Print Label
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="flex-1 py-2.5 bg-[#1677FF] text-white font-medium rounded-lg hover:bg-[#409EFF] transition-colors flex items-center justify-center gap-2"
                      >
                        Manage Order
                        <ChevronDown size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, 'Queued')}>
                        <Clock className="mr-2 h-4 w-4 text-gray-500" /> Queued
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, 'Picking')}>
                        <Package className="mr-2 h-4 w-4 text-blue-500" /> Picking
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedOrder.id, 'Packing')}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-purple-500" /> Packing
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuLabel>Urgency</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleUpdateUrgency(selectedOrder.id, 'normal')}>
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Normal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUrgency(selectedOrder.id, 'warning')}>
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" /> Warning
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateUrgency(selectedOrder.id, 'critical')}>
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2" /> Critical
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialogs */}
      <CancelOrderConfirmation
        open={cancelDialog.open}
        orderId={cancelDialog.orderId}
        onConfirm={confirmCancelOrder}
        onCancel={() => setCancelDialog({ open: false, orderId: '' })}
      />

      <StatusChangeConfirmation
        open={statusDialog.open}
        orderId={statusDialog.orderId}
        currentStatus={statusDialog.currentStatus}
        newStatus={statusDialog.newStatus}
        onConfirm={confirmStatusUpdate}
        onCancel={() => setStatusDialog({ open: false, orderId: '', currentStatus: '', newStatus: '' })}
      />
    </div>
  );
}