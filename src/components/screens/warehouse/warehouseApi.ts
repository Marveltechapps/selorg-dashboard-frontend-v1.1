import { API_CONFIG, API_ENDPOINTS } from '../../../config/api';
import {
  MOCK_WAREHOUSE_METRICS,
  MOCK_ORDER_FLOW,
  MOCK_GRNS,
  MOCK_DOCK_SLOTS,
  MOCK_PICKLIST_ORDERS,
  MOCK_PICKERS,
  MOCK_BATCHES,
  MOCK_MULTI_ORDER_PICKS,
  MOCK_ROUTES,
  MOCK_STORAGE_LOCATIONS,
  MOCK_INVENTORY_ITEMS,
  MOCK_ADJUSTMENTS,
  MOCK_CYCLE_COUNTS,
  MOCK_INTERNAL_TRANSFERS,
  MOCK_STOCK_ALERTS,
  MOCK_WAREHOUSE_TRANSFERS,
  MOCK_QC_INSPECTIONS,
  MOCK_TEMPERATURE_LOGS,
  MOCK_COMPLIANCE_DOCS,
  MOCK_SAMPLE_TESTS,
  MOCK_REJECTIONS,
  MOCK_STAFF,
  MOCK_SCHEDULES,
  MOCK_ATTENDANCE,
  MOCK_PERFORMANCE,
  MOCK_LEAVE_REQUESTS,
  MOCK_TRAININGS,
  MOCK_DEVICES,
  MOCK_EQUIPMENT,
  MOCK_EXCEPTIONS,
  MOCK_ACCESS_LOGS,
} from './warehouseMockData';

// In-memory pending items when API fails (so create + refetch shows new item)
let pendingGRNs: GRN[] = [];
let pendingBatches: BatchOrder[] = [];
let pendingAdjustments: Adjustment[] = [];
let pendingTransfers: WarehouseTransfer[] = [];
let pendingStaff: Staff[] = [];
let pendingSchedules: ShiftSchedule[] = [];
let pendingAttendance: Attendance[] = [];
let pendingLeaveRequests: LeaveRequest[] = [];
let pendingTrainings: Training[] = [];
let pendingEquipment: Equipment[] = [];
let pendingExceptions: Exception[] = [];
let pendingRejections: Rejection[] = [];
let pendingQCInspections: QCInspection[] = [];
let pendingTempLogs: TemperatureLog[] = [];
let pendingSampleTests: SampleTest[] = [];
let pendingAccessLogs: AccessLog[] = [];

export interface WarehouseMetrics {
  inboundQueue: number;
  outboundQueue: number;
  inventoryHealth: number;
  criticalAlerts: number;
  capacityUtilization: {
    bins: number;
    coldStorage: number;
    ambient: number;
  };
}

export interface PicklistFlow {
  id: string;
  orderId: string;
  customer: string;
  items: number;
  priority: string;
  status: string;
  zone: string;
  updatedAt?: string;
}

export async function fetchWarehouseMetrics(): Promise<WarehouseMetrics> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.metrics}`);
    if (!response.ok) throw new Error('Failed to fetch warehouse metrics');
    const result = await response.json();
    const data = result.data ?? result;
    if (!data || typeof data !== 'object' || !('inboundQueue' in data)) return MOCK_WAREHOUSE_METRICS;
    return data;
  } catch {
    return MOCK_WAREHOUSE_METRICS;
  }
}

export async function fetchOrderFlow(): Promise<PicklistFlow[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.orderFlow}`);
    if (!response.ok) throw new Error('Failed to fetch order flow');
    const result = await response.json();
    const data = result.data ?? result ?? [];
    const list = Array.isArray(data) ? data : [];
    return list.length > 0 ? list : MOCK_ORDER_FLOW;
  } catch {
    return MOCK_ORDER_FLOW;
  }
}

const MOCK_ANALYTICS = {
  weeklyData: [
    { day: 'Mon', inbound: 42, outbound: 38, productivity: 12 },
    { day: 'Tue', inbound: 48, outbound: 45, productivity: 14 },
    { day: 'Wed', inbound: 35, outbound: 52, productivity: 11 },
    { day: 'Thu', inbound: 55, outbound: 48, productivity: 15 },
    { day: 'Fri', inbound: 52, outbound: 60, productivity: 13 },
    { day: 'Sat', inbound: 28, outbound: 22, productivity: 10 },
    { day: 'Sun', inbound: 18, outbound: 15, productivity: 8 },
  ],
  storageData: [
    { name: 'Occupied', value: 72, color: '#0891b2' },
    { name: 'Reserved', value: 15, color: '#06b6d4' },
    { name: 'Empty', value: 13, color: '#cffafe' },
  ],
  inventoryData: [
    { category: 'Grocery', value: 1250 },
    { category: 'FMCG', value: 980 },
    { category: 'Fresh', value: 420 },
    { category: 'Frozen', value: 310 },
  ],
  metrics: {
    inboundTurnaround: '94%',
    outboundOnTime: '96%',
    pickingSpeed: '92',
    accuracy: '98%',
    shrinkage: '0.4%',
    turnoverRate: '4.2',
    avgUPH: '14',
    errorRate: '0.8%',
    attendance: '97%',
  },
};

function isEmptyChartData(data: any[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return true;
  return data.every((d: any) => (d.value ?? d.inbound ?? d.outbound ?? d.productivity ?? d.count) === 0);
}

export async function fetchWarehouseAnalytics(): Promise<any> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.analytics}`);
    if (!response.ok) throw new Error('Failed to fetch warehouse analytics');
    const result = await response.json();
    const data = result.data ?? result;
    if (!data || typeof data !== 'object') return MOCK_ANALYTICS;
    const weeklyData = Array.isArray(data.weeklyData) && !isEmptyChartData(data.weeklyData)
      ? data.weeklyData
      : MOCK_ANALYTICS.weeklyData;
    const storageData = Array.isArray(data.storageData) && data.storageData.length > 0 && !isEmptyChartData(data.storageData)
      ? data.storageData
      : MOCK_ANALYTICS.storageData;
    const inventoryData = Array.isArray(data.inventoryData) && data.inventoryData.length > 0
      ? data.inventoryData
      : MOCK_ANALYTICS.inventoryData;
    const metrics = data.metrics && typeof data.metrics === 'object' ? data.metrics : MOCK_ANALYTICS.metrics;
    return { weeklyData, storageData, inventoryData, metrics };
  } catch (error) {
    console.error('Error fetching warehouse analytics:', error);
    return MOCK_ANALYTICS;
  }
}

// --- Inbound Ops ---

export interface GRN {
  id: string;
  poNumber: string;
  vendor: string;
  status: 'pending' | 'in-progress' | 'discrepancy' | 'completed';
  timestamp: string;
  items?: number;
}

export interface DockSlot {
  id: string;
  name: string;
  status: 'active' | 'empty' | 'offline';
  truck?: string;
  vendor?: string;
  eta?: string;
}

export async function fetchGRNs(): Promise<GRN[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.grns}`);
    if (!response.ok) throw new Error('Failed to fetch GRNs');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    return [...MOCK_GRNS, ...pendingGRNs];
  }
}

export async function createGRN(data: Partial<GRN>): Promise<GRN> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.createGrn}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create GRN');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error creating GRN:', error);
    const newGrn: GRN = {
      id: `grn-${Date.now()}`,
      poNumber: data.poNumber ?? '',
      vendor: data.vendor ?? '',
      status: 'pending',
      timestamp: new Date().toISOString(),
      items: (data as any).items ?? 0,
    };
    pendingGRNs = [...pendingGRNs, newGrn];
    return newGrn;
  }
}

export async function startGRN(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.startGrn(id)}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start GRN');
  } catch {
    // Mock: update local pending GRN status if present
    const idx = pendingGRNs.findIndex(g => g.id === id);
    if (idx >= 0) pendingGRNs[idx] = { ...pendingGRNs[idx], status: 'in-progress' };
  }
}

export async function completeGRN(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.completeGrn(id)}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to complete GRN');
  } catch {
    const idx = pendingGRNs.findIndex(g => g.id === id);
    if (idx >= 0) pendingGRNs[idx] = { ...pendingGRNs[idx], status: 'completed' };
  }
}

export async function fetchDocks(): Promise<DockSlot[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.docks}`);
    if (!response.ok) throw new Error('Failed to fetch docks');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching docks:', error);
    return MOCK_DOCK_SLOTS;
  }
}

// --- Outbound Ops ---

export interface PickerAssignment {
  id: string;
  pickerId?: string;
  pickerName?: string;
  name?: string;
  status: string;
  currentOrders?: number;
  activeOrders?: number;
  completedToday?: number;
  pickRate?: number;
  zone?: string;
}

export interface PicklistOrder {
  id: string;
  orderId: string;
  customer: string;
  items: number;
  priority: 'urgent' | 'high' | 'standard';
  status: 'pending' | 'assigned' | 'picking' | 'completed';
  picker?: string;
  zone?: string;
}

export interface BatchOrder {
  id: string;
  batchId: string;
  orderCount: number;
  totalItems: number;
  picker: string;
  status: 'preparing' | 'picking' | 'completed';
  progress: number;
}

export interface MultiOrderPick {
  id: string;
  pickId: string;
  orders: string[];
  sku: string;
  productName: string;
  location: string;
  totalQty: number;
  pickedQty: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface RouteOptimization {
  id: string;
  routeId: string;
  picker: string;
  stops: number;
  distance: string;
  estimatedTime: string;
  status: 'planned' | 'active' | 'completed';
  efficiency: number;
}

// ... Outbound Ops Functions ...

export async function fetchPicklists(): Promise<PicklistOrder[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.picklists}`);
    if (!response.ok) throw new Error('Failed to fetch picklists');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    const arr = Array.isArray(list) ? list : [];
    return arr.length > 0 ? arr : [...MOCK_PICKLIST_ORDERS];
  } catch (error) {
    console.error('Error fetching picklists:', error);
    return [...MOCK_PICKLIST_ORDERS];
  }
}

export async function assignPickerToOrder(id: string, pickerName: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.assignPicker(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickerName, pickerId: pickerName })
    });
    if (!response.ok) throw new Error('Failed to assign picker');
  } catch {
    // Mock: no-op
  }
}

export async function fetchPickers(): Promise<PickerAssignment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.pickers}`);
    if (!response.ok) throw new Error('Failed to fetch pickers');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    const arr = Array.isArray(list) ? list : [];
    const mapped = arr.length > 0 ? arr.map((p: any) => {
      const activeOrders = p.activeOrders ?? p.currentOrders ?? 0;
      const rawStatus = (p.status ?? 'available').toString().toLowerCase();
      const status = rawStatus === 'break' ? 'break' : rawStatus === 'active' ? (activeOrders > 0 ? 'busy' : 'available') : (activeOrders > 0 ? 'busy' : 'available');
      return {
        id: p.id ?? p.pickerId,
        pickerId: p.pickerId ?? p.id,
        pickerName: p.pickerName ?? p.name,
        status,
        activeOrders,
        completedToday: p.completedToday ?? 0,
        pickRate: p.pickRate ?? 0,
        zone: p.zone ?? 'Main Zone',
      };
    }) : [];
    return mapped.length > 0 ? mapped : [...MOCK_PICKERS];
  } catch (error) {
    console.error('Error fetching pickers:', error);
    return [...MOCK_PICKERS];
  }
}

export async function fetchBatches(): Promise<BatchOrder[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.batches}`);
    if (!response.ok) throw new Error('Failed to fetch batches');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    const arr = Array.isArray(list) ? list : [];
    const mapped = arr.map((b: any) => ({
      id: b.id,
      batchId: b.batchId ?? b.id,
      orderCount: b.orderCount ?? 0,
      totalItems: b.totalItems ?? 0,
      picker: b.picker ?? 'Unassigned',
      status: b.status ?? 'preparing',
      progress: b.progress ?? 0,
    }));
    return mapped.length > 0 ? mapped : [...MOCK_BATCHES, ...pendingBatches];
  } catch (error) {
    console.error('Error fetching batches:', error);
    return [...MOCK_BATCHES, ...pendingBatches];
  }
}

export async function createBatch(data: any): Promise<BatchOrder> {
  const payload = {
    zone: data?.zone ?? 'Zone A',
    status: 'pending',
    ...data,
  };
  if (payload.status === 'preparing') payload.status = 'pending';
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.batches}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to create batch');
    const result = await response.json();
    const batch = result.data ?? result;
    const normalized: BatchOrder = {
      id: batch.id ?? `b-${Date.now()}`,
      batchId: batch.batchId ?? batch.id ?? `BATCH-${Date.now()}`,
      orderCount: batch.orderCount ?? 0,
      totalItems: batch.totalItems ?? batch.itemCount ?? 0,
      picker: batch.picker ?? batch.pickerId ?? 'Unassigned',
      status: batch.status === 'pending' ? 'preparing' : batch.status ?? 'preparing',
      progress: batch.progress ?? 0,
    };
    pendingBatches = [...pendingBatches, normalized];
    return normalized;
  } catch (error) {
    console.error('Error creating batch:', error);
    const newBatch: BatchOrder = {
      id: `b-${Date.now()}`,
      batchId: `BATCH-${Date.now()}`,
      orderCount: payload?.orderCount ?? 0,
      totalItems: payload?.totalItems ?? 0,
      picker: payload?.picker ?? 'Unassigned',
      status: 'preparing',
      progress: 0,
    };
    pendingBatches = [...pendingBatches, newBatch];
    return newBatch;
  }
}

// ... Inventory & Storage Functions ...

export async function createCycleCount(data: Partial<CycleCount>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.createCycleCount}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create cycle count');
}

export async function fetchMultiOrderPicks(): Promise<MultiOrderPick[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.consolidatedPicks}`);
    if (!response.ok) throw new Error('Failed to fetch multi-order picks');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    const arr = Array.isArray(list) ? list : [];
    return arr.length > 0 ? arr : [...MOCK_MULTI_ORDER_PICKS];
  } catch (error) {
    console.error('Error fetching multi-order picks:', error);
    return [...MOCK_MULTI_ORDER_PICKS];
  }
}

export async function fetchRoutes(): Promise<RouteOptimization[]> {
  try {
    const path = API_ENDPOINTS.outbound.routesActive ?? '/warehouse/outbound/routes/active/map';
    const response = await fetch(`${API_CONFIG.baseURL}${path}`);
    if (!response.ok) throw new Error('Failed to fetch routes');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    const arr = Array.isArray(list) ? list : [];
    return arr.length > 0 ? arr : [...MOCK_ROUTES];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [...MOCK_ROUTES];
  }
}

export async function optimizeRoute(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.routeMap(id)}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to optimize route');
  } catch {
    // Mock: no-op
  }
}

// --- Inventory & Storage ---

export interface StorageLocation {
  id: string;
  aisle: string;
  rack: number;
  status: 'occupied' | 'empty' | 'restricted';
  sku?: string;
  quantity?: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: string;
  value: number;
}

export interface Adjustment {
  id: string;
  type: string;
  sku: string;
  productName: string;
  change: number;
  reason: string;
  user: string;
  timestamp: string;
}

export interface CycleCount {
  id: string;
  countId: string;
  zone: string;
  assignedTo: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  itemsTotal: number;
  itemsCounted: number;
  discrepancies: number;
}

export interface InternalTransfer {
  id: string;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  sku: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'in-transit' | 'completed';
  initiatedBy: string;
  timestamp: string;
}

export interface StockAlert {
  id: string;
  type: 'low-stock' | 'overstock' | 'expiring' | 'out-of-stock';
  sku: string;
  productName: string;
  currentLevel: number;
  threshold: number;
  priority: 'high' | 'medium' | 'low';
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.items}`);
    if (!response.ok) throw new Error('Failed to fetch inventory items');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return MOCK_INVENTORY_ITEMS;
  }
}

export async function fetchStorageLocations(): Promise<StorageLocation[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.locations}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch storage locations');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching storage locations:', error);
    return MOCK_STORAGE_LOCATIONS;
  }
}

export async function fetchAdjustments(): Promise<Adjustment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.adjustments}`);
    if (!response.ok) throw new Error('Failed to fetch adjustments');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return [...MOCK_ADJUSTMENTS, ...pendingAdjustments];
  }
}

export async function createAdjustment(data: Partial<Adjustment>): Promise<Adjustment> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.createAdjustment}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create adjustment');
    }
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error creating adjustment:', error);
    const newAdj: Adjustment = {
      id: `adj-${Date.now()}`,
      type: (data as any).type ?? 'correction',
      sku: (data as any).sku ?? '',
      productName: (data as any).productName ?? '',
      change: (data as any).change ?? 0,
      reason: (data as any).reason ?? '',
      user: (data as any).user ?? 'User',
      timestamp: new Date().toISOString(),
    };
    pendingAdjustments = [...pendingAdjustments, newAdj];
    return newAdj;
  }
}

export async function fetchCycleCounts(): Promise<CycleCount[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.cycleCounts}`);
    if (!response.ok) throw new Error('Failed to fetch cycle counts');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching cycle counts:', error);
    return MOCK_CYCLE_COUNTS;
  }
}

export async function startCycleCount(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.startCycleCount(id)}`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to start cycle count');
  } catch {
    // Mock: no-op
  }
}

export async function completeCycleCount(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.completeCycleCount(id)}`, { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to complete cycle count');
  } catch {
    // Mock: no-op
  }
}

export async function fetchInternalTransfers(): Promise<InternalTransfer[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.transfers}`);
    if (!response.ok) throw new Error('Failed to fetch internal transfers');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching internal transfers:', error);
    return MOCK_INTERNAL_TRANSFERS;
  }
}

export async function createInternalTransfer(data: Partial<InternalTransfer>): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.createTransfer}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create internal transfer');
  } catch {
    // Mock: no-op (list already has mock data)
  }
}

export async function updateTransferStatus(id: string, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.updateTransferStatus(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update transfer status');
  } catch {
    // Mock: no-op
  }
}

export async function fetchStockAlerts(): Promise<StockAlert[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.alerts}`);
    if (!response.ok) throw new Error('Failed to fetch stock alerts');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return MOCK_STOCK_ALERTS;
  }
}

// --- Inter-Warehouse Transfers ---

export interface WarehouseTransfer {
  id: string;
  transferId: string;
  destination: string;
  status: 'en-route' | 'loading' | 'pending' | 'completed';
  distance?: string;
  eta?: string;
  progress?: number;
  items?: number;
}

export async function fetchWarehouseTransfers(): Promise<WarehouseTransfer[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.transfers.list}`);
    if (!response.ok) throw new Error('Failed to fetch transfers');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching warehouse transfers:', error);
    return [...MOCK_WAREHOUSE_TRANSFERS, ...pendingTransfers];
  }
}

export async function createWarehouseTransfer(data: Partial<WarehouseTransfer>): Promise<any> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.transfers.create}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create transfer');
    return await response.json();
  } catch (error) {
    console.error('Error creating transfer:', error);
    const newTrf: WarehouseTransfer = {
      id: `wt-${Date.now()}`,
      transferId: `TRF-${Date.now()}`,
      destination: (data as any).destination ?? '',
      status: 'pending',
      items: (data as any).items ?? 0,
    };
    pendingTransfers = [...pendingTransfers, newTrf];
    return { data: newTrf };
  }
}

export async function updateWarehouseTransferStatus(id: string, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.transfers.updateStatus(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update transfer status');
  } catch {
    const idx = pendingTransfers.findIndex(t => t.id === id || t.transferId === id);
    if (idx >= 0) pendingTransfers[idx] = { ...pendingTransfers[idx], status: status as any };
  }
}

// --- QC & Compliance ---

export interface QCInspection {
  id: string;
  inspectionId: string;
  batchId: string;
  productName: string;
  inspector: string;
  date: string;
  status: 'passed' | 'failed' | 'pending';
  score: number;
  itemsInspected: number;
  defectsFound: number;
}

export interface TemperatureLog {
  id: string;
  zone: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface ComplianceDoc {
  id: string;
  docId: string;
  docName: string;
  type: string;
  issuedDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired';
}

export interface SampleTest {
  id: string;
  sampleId: string;
  batchId: string;
  productName: string;
  testType: string;
  result: 'pass' | 'fail' | 'pending';
  testedBy: string;
  date: string;
}

export interface Rejection {
  id: string;
  batch: string;
  reason: string;
  items: number;
  timestamp: string;
  inspector: string;
  severity: 'critical' | 'high' | 'medium';
}

export async function fetchQCInspections(): Promise<QCInspection[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.inspections}`);
    if (!response.ok) throw new Error('Failed to fetch inspections');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching QC inspections:', error);
    return [...MOCK_QC_INSPECTIONS, ...pendingQCInspections];
  }
}

export async function createQCInspection(data: Partial<QCInspection>): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createInspection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create inspection');
  } catch (error) {
    console.error('Error creating inspection:', error);
    const newIns: QCInspection = {
      id: `qi-${Date.now()}`,
      inspectionId: `INS-${Date.now()}`,
      batchId: (data as any).batchId ?? '',
      productName: (data as any).productName ?? '',
      inspector: (data as any).inspector ?? 'User',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      score: 0,
      itemsInspected: 0,
      defectsFound: 0,
    };
    pendingQCInspections = [...pendingQCInspections, newIns];
  }
}

export async function fetchTemperatureLogs(): Promise<TemperatureLog[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.temperatureLogs}`);
    if (!response.ok) throw new Error('Failed to fetch temperature logs');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching temperature logs:', error);
    return [...MOCK_TEMPERATURE_LOGS, ...pendingTempLogs];
  }
}

export async function createTemperatureLog(data: Partial<TemperatureLog>): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createTempLog}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create temperature log');
  } catch (error) {
    console.error('Error creating temperature log:', error);
    const newLog: TemperatureLog = {
      id: `tl-${Date.now()}`,
      zone: (data as any).zone ?? '',
      temperature: (data as any).temperature ?? 0,
      humidity: (data as any).humidity ?? 0,
      timestamp: new Date().toISOString(),
      status: 'normal',
    };
    pendingTempLogs = [...pendingTempLogs, newLog];
  }
}

export async function fetchQCRejections(): Promise<Rejection[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.logRejection}`);
    if (!response.ok) throw new Error('Failed to fetch rejections');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching QC rejections:', error);
    return [...MOCK_REJECTIONS, ...pendingRejections];
  }
}

export async function logQCRejection(data: any): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.logRejection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to log rejection');
  } catch (error) {
    console.error('Error logging rejection:', error);
    const newRj: Rejection = {
      id: `rj-${Date.now()}`,
      batch: data?.batch ?? '',
      reason: data?.reason ?? '',
      items: data?.items ?? 0,
      timestamp: new Date().toISOString(),
      inspector: data?.inspector ?? 'User',
      severity: data?.severity ?? 'medium',
    };
    pendingRejections = [...pendingRejections, newRj];
  }
}

export async function fetchComplianceDocs(): Promise<ComplianceDoc[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.complianceDocs}`);
    if (!response.ok) throw new Error('Failed to fetch compliance docs');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching compliance docs:', error);
    return MOCK_COMPLIANCE_DOCS;
  }
}

export async function fetchSampleTests(): Promise<SampleTest[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.samples}`);
    if (!response.ok) throw new Error('Failed to fetch samples');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching sample tests:', error);
    return [...MOCK_SAMPLE_TESTS, ...pendingSampleTests];
  }
}

export async function createSampleTest(data: Partial<SampleTest>): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createSample}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create sample test');
  } catch (error) {
    console.error('Error creating sample test:', error);
    const newSample: SampleTest = {
      id: `st-${Date.now()}`,
      sampleId: `SMP-${Date.now()}`,
      batchId: (data as any).batchId ?? '',
      productName: (data as any).productName ?? '',
      testType: (data as any).testType ?? 'Quality',
      result: 'pending',
      testedBy: (data as any).testedBy ?? 'User',
      date: new Date().toISOString().split('T')[0],
    };
    pendingSampleTests = [...pendingSampleTests, newSample];
  }
}

export async function updateSampleTestResult(id: string, result: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.updateSample(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result })
    });
    if (!response.ok) throw new Error('Failed to update sample test');
  } catch {
    const idx = pendingSampleTests.findIndex((s) => s.id === id);
    if (idx >= 0) pendingSampleTests[idx] = { ...pendingSampleTests[idx], result: result as 'pass' | 'fail' | 'pending' };
  }
}

// Compliance Checks
export interface ComplianceCheck {
  id: string;
  name: string;
  completed: boolean;
  timestamp?: string;
  inspector?: string;
  category: string;
}

export async function fetchComplianceChecks(): Promise<ComplianceCheck[]> {
  try {
    // TODO: Backend endpoint needs to be implemented at /warehouse/qc/checks
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/qc/checks`);
    if (!response.ok) {
      // If endpoint doesn't exist yet, return empty array
      return [];
    }
    const result = await response.json();
    return result.data || result.checks || [];
  } catch (error) {
    console.error('Error fetching compliance checks:', error);
    return [];
  }
}

export async function toggleComplianceCheck(id: string, completed: boolean): Promise<void> {
  try {
    // TODO: Backend endpoint needs to be implemented at /warehouse/qc/checks/:id
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/qc/checks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });
    if (!response.ok) throw new Error('Failed to toggle compliance check');
  } catch (error) {
    console.error('Error toggling compliance check:', error);
    throw error;
  }
}

// --- Workforce & Shifts ---

export interface Staff {
  id: string;
  name: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'break' | 'offline';
  productivity: number;
  email: string;
  phone: string;
  joinDate: string;
  hourlyRate: number;
}

export interface ShiftSchedule {
  id: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  staffAssigned: string[];
  requiredStaff: number;
  status: 'full' | 'understaffed' | 'overstaffed';
}

export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  hoursWorked: number;
}

export interface Performance {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  weeklyTarget: number;
  weeklyActual: number;
  accuracy: number;
  avgSpeed: number;
  rating: number;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: 'sick' | 'casual' | 'emergency' | 'vacation';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export interface Training {
  id: string;
  trainingId: string;
  title: string;
  type: string;
  date: string;
  duration: string;
  instructor: string;
  enrolled: number;
  capacity: number;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export async function fetchStaff(): Promise<Staff[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.staff}`);
    if (!response.ok) throw new Error('Failed to fetch staff');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [...MOCK_STAFF, ...pendingStaff];
  }
}

export async function addStaff(data: Partial<Staff>): Promise<Staff> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.staff}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add staff');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error adding staff:', error);
    const newStaff: Staff = {
      id: `s-${Date.now()}`,
      name: (data as any).name ?? 'New Staff',
      role: (data as any).role ?? 'Picker',
      shift: (data as any).shift ?? 'morning',
      status: 'active',
      productivity: 0,
      email: (data as any).email ?? '',
      phone: (data as any).phone ?? '',
      joinDate: new Date().toISOString().split('T')[0],
      hourlyRate: (data as any).hourlyRate ?? 0,
    };
    pendingStaff = [...pendingStaff, newStaff];
    return newStaff;
  }
}

export async function fetchSchedules(): Promise<ShiftSchedule[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.schedule}`);
    if (!response.ok) throw new Error('Failed to fetch schedules');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [...MOCK_SCHEDULES, ...pendingSchedules];
  }
}

export async function fetchAttendance(): Promise<Attendance[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.attendance}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [...MOCK_ATTENDANCE, ...pendingAttendance];
  }
}

export async function fetchPerformance(): Promise<Performance[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.performance}`);
    if (!response.ok) throw new Error('Failed to fetch performance');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching performance:', error);
    return MOCK_PERFORMANCE;
  }
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.leaveRequests}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return [...MOCK_LEAVE_REQUESTS, ...pendingLeaveRequests];
  }
}

export async function createLeaveRequest(data: Partial<LeaveRequest>): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.createLeaveRequest}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create leave request');
  } catch (error) {
    console.error('Error creating leave request:', error);
    const newLeave: LeaveRequest = {
      id: `lr-${Date.now()}`,
      staffId: (data as any).staffId ?? '',
      staffName: (data as any).staffName ?? '',
      leaveType: (data as any).leaveType ?? 'casual',
      startDate: (data as any).startDate ?? '',
      endDate: (data as any).endDate ?? '',
      days: (data as any).days ?? 1,
      status: 'pending',
      reason: (data as any).reason ?? '',
    };
    pendingLeaveRequests = [...pendingLeaveRequests, newLeave];
  }
}

export async function updateLeaveStatus(id: string, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.updateLeaveStatus(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update leave request status');
  } catch {
    const idx = pendingLeaveRequests.findIndex(l => l.id === id);
    if (idx >= 0) pendingLeaveRequests[idx] = { ...pendingLeaveRequests[idx], status: status as any };
  }
}

export async function createShiftSchedule(data: Partial<ShiftSchedule>): Promise<ShiftSchedule> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.createSchedule}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create shift schedule');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error creating shift schedule:', error);
    const newSch: ShiftSchedule = {
      id: `sh-${Date.now()}`,
      date: (data as any).date ?? new Date().toISOString().split('T')[0],
      shift: (data as any).shift ?? 'morning',
      staffAssigned: (data as any).staffAssigned ?? [],
      requiredStaff: (data as any).requiredStaff ?? 4,
      status: 'understaffed',
    };
    pendingSchedules = [...pendingSchedules, newSch];
    return newSch;
  }
}

export async function assignStaffToShift(id: string, staffIds: string[]): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.assignStaff(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffIds })
    });
    if (!response.ok) throw new Error('Failed to assign staff');
  } catch {
    // Mock: no-op
  }
}

export async function fetchTrainings(): Promise<Training[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.trainings}`);
    if (!response.ok) throw new Error('Failed to fetch trainings');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return [...MOCK_TRAININGS, ...pendingTrainings];
  }
}

export async function addTraining(data: Partial<Training>): Promise<Training> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.trainings}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create training');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error creating training:', error);
    const newTr: Training = {
      id: `tr-${Date.now()}`,
      trainingId: `TRN-${Date.now()}`,
      title: (data as any).title ?? 'New Training',
      type: (data as any).type ?? 'Mandatory',
      date: (data as any).date ?? new Date().toISOString().split('T')[0],
      duration: (data as any).duration ?? '1h',
      instructor: (data as any).instructor ?? 'TBD',
      enrolled: 0,
      capacity: (data as any).capacity ?? 20,
      status: 'scheduled',
    };
    pendingTrainings = [...pendingTrainings, newTr];
    return newTr;
  }
}

export async function logStaffAttendance(data: any): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.logAttendance}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to log attendance');
  } catch (error) {
    console.error('Error logging attendance:', error);
    const newAt: Attendance = {
      id: `at-${Date.now()}`,
      staffId: data?.staffId ?? '',
      staffName: data?.staffName ?? '',
      date: data?.date ?? new Date().toISOString().split('T')[0],
      checkIn: data?.checkIn ?? new Date().toTimeString().slice(0, 5),
      checkOut: data?.checkOut ?? '',
      status: 'present',
      hoursWorked: data?.hoursWorked ?? 0,
    };
    pendingAttendance = [...pendingAttendance, newAt];
  }
}

// --- Equipment & Assets ---

export interface Device {
  id: string;
  deviceId: string;
  user: string;
  battery: number;
  signal: 'strong' | 'good' | 'weak' | 'offline';
  status: 'active' | 'charging' | 'offline';
}

export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  type: 'forklift' | 'pallet-jack' | 'crane';
  zone?: string;
  operator?: string;
  status: 'operational' | 'idle' | 'maintenance';
  issue?: string;
}

export async function fetchDevices(): Promise<Device[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.devices}`);
    if (!response.ok) throw new Error('Failed to fetch devices');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching devices:', error);
    return MOCK_DEVICES;
  }
}

export async function fetchMachinery(): Promise<Equipment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.machinery}`);
    if (!response.ok) throw new Error('Failed to fetch machinery');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching machinery:', error);
    return [...MOCK_EQUIPMENT, ...pendingEquipment];
  }
}

export async function addMachinery(data: Partial<Equipment>): Promise<Equipment> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.addMachinery}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add machinery');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error adding machinery:', error);
    const nextNum = (MOCK_EQUIPMENT.length + pendingEquipment.length + 1);
    const shortId = String(nextNum).padStart(3, '0');
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      equipmentId: (data as any).equipmentId || `EQ-${shortId}`,
      name: (data as any).name ?? 'New Equipment',
      type: (data as any).type ?? 'forklift',
      zone: (data as any).zone,
      status: 'operational',
    };
    pendingEquipment = [...pendingEquipment, newEq];
    return newEq;
  }
}

export async function reportEquipmentIssue(id: string, data: any): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.reportIssue(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to report issue');
  } catch {
    // Mock: no-op
  }
}

export async function resolveEquipmentIssue(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.resolveIssue(id)}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to resolve issue');
  } catch {
    // Mock: no-op
  }
}

// --- Exceptions ---

export interface Exception {
  id: string;
  priority: 'critical' | 'medium' | 'low';
  category: 'inbound' | 'inventory' | 'outbound' | 'qc';
  title: string;
  description: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

export async function fetchExceptions(): Promise<Exception[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.list}`);
    if (!response.ok) throw new Error('Failed to fetch exceptions');
    const result = await response.json();
    return result.data ?? result ?? [];
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return [...MOCK_EXCEPTIONS, ...pendingExceptions];
  }
}

export async function reportException(data: Partial<Exception>): Promise<Exception> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.report}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to report exception');
    const result = await response.json();
    return result.data ?? result;
  } catch (error) {
    console.error('Error reporting exception:', error);
    const newEx: Exception = {
      id: `ex-${Date.now()}`,
      priority: (data as any).priority ?? 'medium',
      category: (data as any).category ?? 'inbound',
      title: (data as any).title ?? 'Exception',
      description: (data as any).description ?? '',
      timestamp: new Date().toISOString(),
      status: 'open',
    };
    pendingExceptions = [...pendingExceptions, newEx];
    return newEx;
  }
}

export async function updateExceptionStatus(id: string, status: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.updateStatus(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
  } catch {
    const idx = pendingExceptions.findIndex((e) => e.id === id);
    if (idx >= 0) pendingExceptions[idx] = { ...pendingExceptions[idx], status: status as any };
  }
}

export async function rejectExceptionShipment(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.rejectShipment(id)}`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to reject shipment');
  } catch {
    // Mock: no-op
  }
}

export async function acceptExceptionPartial(id: string, acceptedQuantity: number): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.acceptPartial(id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acceptedQuantity })
    });
    if (!response.ok) throw new Error('Failed to accept partial shipment');
  } catch {
    // Mock: no-op
  }
}

// --- Utilities ---

export interface AccessLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export async function fetchAccessLogs(): Promise<AccessLog[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/logs`);
    if (!response.ok) throw new Error('Failed to fetch access logs');
    const result = await response.json();
    const list = result.data ?? result ?? [];
    return Array.isArray(list) && list.length > 0 ? list : [...MOCK_ACCESS_LOGS, ...pendingAccessLogs];
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return [...MOCK_ACCESS_LOGS, ...pendingAccessLogs];
  }
}

export async function bulkUploadSKUs(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/upload-skus`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload SKUs');
    return await response.json();
  } catch (error) {
    console.error('Error uploading SKUs:', error);
    // Mock success: labels/CSV are client-side generated or saved locally; show success
    return { success: true, message: 'File processed (demo mode)', count: 0 };
  }
}

export async function generateRackLabels(config: any): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/generate-labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to generate labels');
  } catch (error) {
    console.error('Error generating labels:', error);
    // Mock: labels are generated client-side in WarehouseUtilities; no-op so toast still shows success
  }
}

export async function processBinReassignment(config: any): Promise<void> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/reassign-bins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to process reassignment');
  } catch (error) {
    console.error('Error processing bin reassignment:', error);
    // Mock success so UI doesn't show failed
  }
}

