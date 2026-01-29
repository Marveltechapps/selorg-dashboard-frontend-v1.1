import { API_CONFIG, API_ENDPOINTS } from '../../../config/api';

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
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.metrics}`);
  if (!response.ok) throw new Error('Failed to fetch warehouse metrics');
  const result = await response.json();
  return result.data;
}

export async function fetchOrderFlow(): Promise<PicklistFlow[]> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.orderFlow}`);
  if (!response.ok) throw new Error('Failed to fetch order flow');
  const result = await response.json();
  return result.data;
}

export async function fetchWarehouseAnalytics(): Promise<any> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.warehouse.analytics}`);
    if (!response.ok) throw new Error('Failed to fetch warehouse analytics');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching warehouse analytics:', error);
    return null;
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
    return result.data;
  } catch (error) {
    console.error('Error fetching GRNs:', error);
    return [];
  }
}

export async function createGRN(data: Partial<GRN>): Promise<GRN> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.createGrn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create GRN');
  const result = await response.json();
  return result.data;
}

export async function startGRN(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.startGrn(id)}`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to start GRN');
}

export async function completeGRN(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.completeGrn(id)}`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to complete GRN');
}

export async function fetchDocks(): Promise<DockSlot[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inbound.docks}`);
    if (!response.ok) throw new Error('Failed to fetch docks');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching docks:', error);
    return [];
  }
}

// --- Outbound Ops ---

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
    return result.data;
  } catch (error) {
    console.error('Error fetching picklists:', error);
    return [];
  }
}

export async function assignPickerToOrder(id: string, pickerName: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.assignPicker(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pickerName, pickerId: pickerName })
  });
  if (!response.ok) throw new Error('Failed to assign picker');
}

export async function fetchPickers(): Promise<PickerAssignment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.outbound.pickers}`);
    if (!response.ok) throw new Error('Failed to fetch pickers');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching pickers:', error);
    return [];
  }
}

export async function fetchBatches(): Promise<BatchOrder[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/outbound/batches`);
    if (!response.ok) throw new Error('Failed to fetch batches');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching batches:', error);
    return [];
  }
}

export async function createBatch(data: any): Promise<BatchOrder> {
  const response = await fetch(`${API_CONFIG.baseURL}/outbound/batches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create batch');
  const result = await response.json();
  return result.data;
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
    const response = await fetch(`${API_CONFIG.baseURL}/outbound/consolidated-picks`);
    if (!response.ok) throw new Error('Failed to fetch multi-order picks');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching multi-order picks:', error);
    return [];
  }
}

export async function fetchRoutes(): Promise<RouteOptimization[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/outbound/routes/active/map`);
    if (!response.ok) throw new Error('Failed to fetch routes');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
}

export async function optimizeRoute(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}/outbound/routes/${id}/map`);
  if (!response.ok) throw new Error('Failed to optimize route');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
}

export async function fetchStorageLocations(): Promise<StorageLocation[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.locations}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch storage locations');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching storage locations:', error);
    return [];
  }
}

export async function fetchAdjustments(): Promise<Adjustment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.adjustments}`);
    if (!response.ok) throw new Error('Failed to fetch adjustments');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return [];
  }
}

export async function createAdjustment(data: Partial<Adjustment>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.createAdjustment}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create adjustment');
  }
}

export async function fetchCycleCounts(): Promise<CycleCount[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.cycleCounts}`);
    if (!response.ok) throw new Error('Failed to fetch cycle counts');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching cycle counts:', error);
    return [];
  }
}

export async function startCycleCount(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.startCycleCount(id)}`, { method: 'PUT' });
  if (!response.ok) throw new Error('Failed to start cycle count');
}

export async function completeCycleCount(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.completeCycleCount(id)}`, { method: 'PUT' });
  if (!response.ok) throw new Error('Failed to complete cycle count');
}

export async function fetchInternalTransfers(): Promise<InternalTransfer[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.transfers}`);
    if (!response.ok) throw new Error('Failed to fetch internal transfers');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching internal transfers:', error);
    return [];
  }
}

export async function createInternalTransfer(data: Partial<InternalTransfer>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.createTransfer}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create internal transfer');
}

export async function updateTransferStatus(id: string, status: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.updateTransferStatus(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update transfer status');
}

export async function fetchStockAlerts(): Promise<StockAlert[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.inventory.alerts}`);
    if (!response.ok) throw new Error('Failed to fetch stock alerts');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return [];
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
    return result.data;
  } catch (error) {
    console.error('Error fetching warehouse transfers:', error);
    return [];
  }
}

export async function createWarehouseTransfer(data: Partial<WarehouseTransfer>): Promise<any> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.transfers.create}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create transfer');
  return await response.json();
}

export async function updateWarehouseTransferStatus(id: string, status: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.transfers.updateStatus(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update transfer status');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching QC inspections:', error);
    return [];
  }
}

export async function createQCInspection(data: Partial<QCInspection>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createInspection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create inspection');
}

export async function fetchTemperatureLogs(): Promise<TemperatureLog[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.temperatureLogs}`);
    if (!response.ok) throw new Error('Failed to fetch temperature logs');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching temperature logs:', error);
    return [];
  }
}

export async function createTemperatureLog(data: Partial<TemperatureLog>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createTempLog}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create temperature log');
}

export async function fetchQCRejections(): Promise<Rejection[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.logRejection}`); // Note: Backend uses logRejection endpoint for GET too now
    if (!response.ok) throw new Error('Failed to fetch rejections');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching QC rejections:', error);
    return [];
  }
}

export async function logQCRejection(data: any): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.logRejection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to log rejection');
}

export async function fetchComplianceDocs(): Promise<ComplianceDoc[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.complianceDocs}`);
    if (!response.ok) throw new Error('Failed to fetch compliance docs');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching compliance docs:', error);
    return [];
  }
}

export async function fetchSampleTests(): Promise<SampleTest[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.samples}`);
    if (!response.ok) throw new Error('Failed to fetch samples');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching sample tests:', error);
    return [];
  }
}

export async function createSampleTest(data: Partial<SampleTest>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.createSample}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create sample test');
}

export async function updateSampleTestResult(id: string, result: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.qc.updateSample(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result })
  });
  if (!response.ok) throw new Error('Failed to update sample test');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

export async function fetchSchedules(): Promise<ShiftSchedule[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.schedule}`);
    if (!response.ok) throw new Error('Failed to fetch schedules');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
}

export async function fetchAttendance(): Promise<Attendance[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.attendance}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
}

export async function fetchPerformance(): Promise<Performance[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.performance}`);
    if (!response.ok) throw new Error('Failed to fetch performance');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching performance:', error);
    return [];
  }
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.leaveRequests}?limit=100`);
    if (!response.ok) throw new Error('Failed to fetch leave requests');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return [];
  }
}

export async function createLeaveRequest(data: Partial<LeaveRequest>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.createLeaveRequest}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create leave request');
}

export async function updateLeaveStatus(id: string, status: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.updateLeaveStatus(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update leave request status');
}

export async function createShiftSchedule(data: Partial<ShiftSchedule>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.createSchedule}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create shift schedule');
}

export async function assignStaffToShift(id: string, staffIds: string[]): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.assignStaff(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ staffIds })
  });
  if (!response.ok) throw new Error('Failed to assign staff');
}

export async function fetchTrainings(): Promise<Training[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.trainings}`);
    if (!response.ok) throw new Error('Failed to fetch trainings');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return [];
  }
}

export async function logStaffAttendance(data: any): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.workforce.logAttendance}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to log attendance');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
}

export async function fetchMachinery(): Promise<Equipment[]> {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.machinery}`);
    if (!response.ok) throw new Error('Failed to fetch machinery');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching machinery:', error);
    return [];
  }
}

export async function addMachinery(data: Partial<Equipment>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.addMachinery}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to add machinery');
}

export async function reportEquipmentIssue(id: string, data: any): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.reportIssue(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to report issue');
}

export async function resolveEquipmentIssue(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.equipment.resolveIssue(id)}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to resolve issue');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return [];
  }
}

export async function reportException(data: Partial<Exception>): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.report}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to report exception');
}

export async function updateExceptionStatus(id: string, status: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.updateStatus(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update status');
}

export async function rejectExceptionShipment(id: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.rejectShipment(id)}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to reject shipment');
}

export async function acceptExceptionPartial(id: string, acceptedQuantity: number): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.exceptions.acceptPartial(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptedQuantity })
  });
  if (!response.ok) throw new Error('Failed to accept partial shipment');
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
    return result.data;
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return [];
  }
}

export async function bulkUploadSKUs(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/upload-skus`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload SKUs');
  return await response.json();
}

export async function generateRackLabels(config: any): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/generate-labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) throw new Error('Failed to generate labels');
}

export async function processBinReassignment(config: any): Promise<void> {
  const response = await fetch(`${API_CONFIG.baseURL}/warehouse/utilities/reassign-bins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) throw new Error('Failed to process reassignment');
}

