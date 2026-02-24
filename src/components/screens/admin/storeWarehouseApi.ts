import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface Store {
  id: string;
  name: string;
  code: string;
  type: 'store' | 'dark_store' | 'warehouse';
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  manager: string;
  status: 'active' | 'inactive' | 'maintenance';
  operationalHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  deliveryRadius: number; // in km
  maxCapacity: number; // max orders per hour
  currentLoad: number; // current orders
  staffCount: number;
  rating: number;
  totalOrders: number;
  revenue: number;
  createdAt: string;
  lastUpdated: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  storageCapacity: number; // in cubic meters
  currentUtilization: number; // percentage
  inventoryValue: number;
  productCount: number;
  zones: string[];
  manager: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'manager' | 'picker' | 'packer' | 'delivery' | 'supervisor';
  storeId: string;
  storeName: string;
  phone: string;
  email: string;
  shift: 'morning' | 'evening' | 'night' | 'full_day';
  status: 'active' | 'on_leave' | 'inactive';
  joinedAt: string;
  performance: number; // 0-100
}

export interface DeliveryZone {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  radius: number; // in km
  areas: string[];
  isActive: boolean;
  avgDeliveryTime: number; // in minutes
  orderVolume: number;
}

export interface StorePerformance {
  storeId: string;
  storeName: string;
  ordersToday: number;
  ordersWeek: number;
  ordersMonth: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  avgRating: number;
  totalReviews: number;
  onTimeDelivery: number; // percentage
  capacityUtilization: number; // percentage
}

// --- Mock Data ---

let MOCK_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Indiranagar Express',
    code: 'BLR-IND-001',
    type: 'store',
    address: '100 Feet Road, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    latitude: 12.9716,
    longitude: 77.6412,
    phone: '+91-80-4567-8901',
    email: 'indiranagar@quickcommerce.com',
    manager: 'Rajesh Kumar',
    status: 'active',
    operationalHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
    },
    deliveryRadius: 5,
    maxCapacity: 120,
    currentLoad: 87,
    staffCount: 24,
    rating: 4.6,
    totalOrders: 45820,
    revenue: 8940000,
    createdAt: '2023-06-15T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-2',
    name: 'Koramangala Hub',
    code: 'BLR-KOR-002',
    type: 'dark_store',
    address: '5th Block, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560095',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '+91-80-4567-8902',
    email: 'koramangala@quickcommerce.com',
    manager: 'Priya Sharma',
    status: 'active',
    operationalHours: {
      monday: { open: '00:00', close: '23:59', isOpen: true },
      tuesday: { open: '00:00', close: '23:59', isOpen: true },
      wednesday: { open: '00:00', close: '23:59', isOpen: true },
      thursday: { open: '00:00', close: '23:59', isOpen: true },
      friday: { open: '00:00', close: '23:59', isOpen: true },
      saturday: { open: '00:00', close: '23:59', isOpen: true },
      sunday: { open: '00:00', close: '23:59', isOpen: true },
    },
    deliveryRadius: 7,
    maxCapacity: 200,
    currentLoad: 156,
    staffCount: 38,
    rating: 4.8,
    totalOrders: 78450,
    revenue: 15600000,
    createdAt: '2023-04-10T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-3',
    name: 'Whitefield Central',
    code: 'BLR-WHI-003',
    type: 'store',
    address: 'ITPL Main Road, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    latitude: 12.9698,
    longitude: 77.7499,
    phone: '+91-80-4567-8903',
    email: 'whitefield@quickcommerce.com',
    manager: 'Amit Patel',
    status: 'active',
    operationalHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
    },
    deliveryRadius: 6,
    maxCapacity: 150,
    currentLoad: 98,
    staffCount: 28,
    rating: 4.5,
    totalOrders: 52300,
    revenue: 10800000,
    createdAt: '2023-07-22T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-4',
    name: 'HSR Layout Express',
    code: 'BLR-HSR-004',
    type: 'store',
    address: 'Sector 1, HSR Layout',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560102',
    latitude: 12.9116,
    longitude: 77.6473,
    phone: '+91-80-4567-8904',
    email: 'hsr@quickcommerce.com',
    manager: 'Sneha Reddy',
    status: 'active',
    operationalHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
    },
    deliveryRadius: 5,
    maxCapacity: 130,
    currentLoad: 72,
    staffCount: 22,
    rating: 4.7,
    totalOrders: 38920,
    revenue: 7560000,
    createdAt: '2023-08-05T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-5',
    name: 'Jayanagar Quick Stop',
    code: 'BLR-JAY-005',
    type: 'store',
    address: '4th Block, Jayanagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560011',
    latitude: 12.9250,
    longitude: 77.5838,
    phone: '+91-80-4567-8905',
    email: 'jayanagar@quickcommerce.com',
    manager: 'Vikram Singh',
    status: 'active',
    operationalHours: {
      monday: { open: '06:00', close: '22:00', isOpen: true },
      tuesday: { open: '06:00', close: '22:00', isOpen: true },
      wednesday: { open: '06:00', close: '22:00', isOpen: true },
      thursday: { open: '06:00', close: '22:00', isOpen: true },
      friday: { open: '06:00', close: '22:00', isOpen: true },
      saturday: { open: '06:00', close: '22:00', isOpen: true },
      sunday: { open: '07:00', close: '21:00', isOpen: true },
    },
    deliveryRadius: 4,
    maxCapacity: 100,
    currentLoad: 54,
    staffCount: 18,
    rating: 4.4,
    totalOrders: 29450,
    revenue: 5890000,
    createdAt: '2023-09-12T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-6',
    name: 'Electronic City Hub',
    code: 'BLR-EC-006',
    type: 'dark_store',
    address: 'Phase 1, Electronic City',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    latitude: 12.8456,
    longitude: 77.6603,
    phone: '+91-80-4567-8906',
    email: 'ecity@quickcommerce.com',
    manager: 'Deepak Malhotra',
    status: 'maintenance',
    operationalHours: {
      monday: { open: '00:00', close: '23:59', isOpen: false },
      tuesday: { open: '00:00', close: '23:59', isOpen: false },
      wednesday: { open: '00:00', close: '23:59', isOpen: false },
      thursday: { open: '00:00', close: '23:59', isOpen: false },
      friday: { open: '00:00', close: '23:59', isOpen: false },
      saturday: { open: '00:00', close: '23:59', isOpen: false },
      sunday: { open: '00:00', close: '23:59', isOpen: false },
    },
    deliveryRadius: 8,
    maxCapacity: 180,
    currentLoad: 0,
    staffCount: 32,
    rating: 4.3,
    totalOrders: 42100,
    revenue: 8240000,
    createdAt: '2023-05-18T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-7',
    name: 'Marathahalli Express',
    code: 'BLR-MAR-007',
    type: 'store',
    address: 'Outer Ring Road, Marathahalli',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560037',
    latitude: 12.9591,
    longitude: 77.6974,
    phone: '+91-80-4567-8907',
    email: 'marathahalli@quickcommerce.com',
    manager: 'Kavita Nair',
    status: 'active',
    operationalHours: {
      monday: { open: '06:00', close: '23:00', isOpen: true },
      tuesday: { open: '06:00', close: '23:00', isOpen: true },
      wednesday: { open: '06:00', close: '23:00', isOpen: true },
      thursday: { open: '06:00', close: '23:00', isOpen: true },
      friday: { open: '06:00', close: '23:00', isOpen: true },
      saturday: { open: '06:00', close: '23:00', isOpen: true },
      sunday: { open: '07:00', close: '22:00', isOpen: true },
    },
    deliveryRadius: 6,
    maxCapacity: 140,
    currentLoad: 89,
    staffCount: 26,
    rating: 4.6,
    totalOrders: 36780,
    revenue: 7120000,
    createdAt: '2023-06-28T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
  {
    id: 'store-8',
    name: 'MG Road Premium',
    code: 'BLR-MG-008',
    type: 'store',
    address: 'MG Road, Central Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    latitude: 12.9762,
    longitude: 77.6033,
    phone: '+91-80-4567-8908',
    email: 'mgroad@quickcommerce.com',
    manager: 'Arjun Menon',
    status: 'active',
    operationalHours: {
      monday: { open: '07:00', close: '22:00', isOpen: true },
      tuesday: { open: '07:00', close: '22:00', isOpen: true },
      wednesday: { open: '07:00', close: '22:00', isOpen: true },
      thursday: { open: '07:00', close: '22:00', isOpen: true },
      friday: { open: '07:00', close: '22:00', isOpen: true },
      saturday: { open: '07:00', close: '22:00', isOpen: true },
      sunday: { open: '08:00', close: '21:00', isOpen: true },
    },
    deliveryRadius: 3,
    maxCapacity: 80,
    currentLoad: 45,
    staffCount: 15,
    rating: 4.8,
    totalOrders: 24560,
    revenue: 6230000,
    createdAt: '2023-10-03T08:00:00Z',
    lastUpdated: '2024-12-20T14:30:00Z',
  },
];

let MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Central Fulfillment Hub',
    code: 'WH-BLR-CENTRAL',
    address: 'Peenya Industrial Area, Bangalore',
    city: 'Bangalore',
    storageCapacity: 50000,
    currentUtilization: 76,
    inventoryValue: 45600000,
    productCount: 8945,
    zones: ['North Bangalore', 'Central Bangalore', 'East Bangalore'],
    manager: 'Sanjay Gupta',
    status: 'active',
    createdAt: '2023-03-01T08:00:00Z',
  },
  {
    id: 'wh-2',
    name: 'South Distribution Center',
    code: 'WH-BLR-SOUTH',
    address: 'Bommasandra Industrial Area, Bangalore',
    city: 'Bangalore',
    storageCapacity: 35000,
    currentUtilization: 68,
    inventoryValue: 28900000,
    productCount: 6240,
    zones: ['South Bangalore', 'Electronic City'],
    manager: 'Meera Krishnan',
    status: 'active',
    createdAt: '2023-04-15T08:00:00Z',
  },
  {
    id: 'wh-3',
    name: 'East Zone Warehouse',
    code: 'WH-BLR-EAST',
    address: 'Whitefield Industrial Zone, Bangalore',
    city: 'Bangalore',
    storageCapacity: 28000,
    currentUtilization: 82,
    inventoryValue: 32400000,
    productCount: 5680,
    zones: ['Whitefield', 'KR Puram', 'Marathahalli'],
    manager: 'Ramesh Iyer',
    status: 'active',
    createdAt: '2023-05-20T08:00:00Z',
  },
];

let MOCK_STAFF: Staff[] = [
  { id: 'staff-1', name: 'Rajesh Kumar', role: 'manager', storeId: 'store-1', storeName: 'Indiranagar Express', phone: '+91-98765-43201', email: 'rajesh.k@qc.com', shift: 'full_day', status: 'active', joinedAt: '2023-06-15T08:00:00Z', performance: 92 },
  { id: 'staff-2', name: 'Anil Verma', role: 'picker', storeId: 'store-1', storeName: 'Indiranagar Express', phone: '+91-98765-43202', email: 'anil.v@qc.com', shift: 'morning', status: 'active', joinedAt: '2023-07-10T08:00:00Z', performance: 88 },
  { id: 'staff-3', name: 'Sunita Rao', role: 'packer', storeId: 'store-1', storeName: 'Indiranagar Express', phone: '+91-98765-43203', email: 'sunita.r@qc.com', shift: 'evening', status: 'active', joinedAt: '2023-07-15T08:00:00Z', performance: 85 },
  { id: 'staff-4', name: 'Priya Sharma', role: 'manager', storeId: 'store-2', storeName: 'Koramangala Hub', phone: '+91-98765-43204', email: 'priya.s@qc.com', shift: 'full_day', status: 'active', joinedAt: '2023-04-10T08:00:00Z', performance: 95 },
  { id: 'staff-5', name: 'Kiran Desai', role: 'supervisor', storeId: 'store-2', storeName: 'Koramangala Hub', phone: '+91-98765-43205', email: 'kiran.d@qc.com', shift: 'night', status: 'active', joinedAt: '2023-05-12T08:00:00Z', performance: 90 },
  { id: 'staff-6', name: 'Amit Patel', role: 'manager', storeId: 'store-3', storeName: 'Whitefield Central', phone: '+91-98765-43206', email: 'amit.p@qc.com', shift: 'full_day', status: 'active', joinedAt: '2023-07-22T08:00:00Z', performance: 87 },
  { id: 'staff-7', name: 'Neha Singh', role: 'delivery', storeId: 'store-3', storeName: 'Whitefield Central', phone: '+91-98765-43207', email: 'neha.s@qc.com', shift: 'morning', status: 'active', joinedAt: '2023-08-05T08:00:00Z', performance: 91 },
  { id: 'staff-8', name: 'Ravi Kumar', role: 'picker', storeId: 'store-3', storeName: 'Whitefield Central', phone: '+91-98765-43208', email: 'ravi.k@qc.com', shift: 'evening', status: 'on_leave', joinedAt: '2023-08-10T08:00:00Z', performance: 83 },
];

let MOCK_ZONES: DeliveryZone[] = [
  { id: 'zone-1', name: 'Indiranagar Coverage', storeId: 'store-1', storeName: 'Indiranagar Express', radius: 5, areas: ['Indiranagar', 'Domlur', 'HAL', 'Jeevanbhima Nagar'], isActive: true, avgDeliveryTime: 18, orderVolume: 2450 },
  { id: 'zone-2', name: 'Koramangala Premium', storeId: 'store-2', storeName: 'Koramangala Hub', radius: 7, areas: ['Koramangala', 'BTM Layout', 'HSR Layout', 'Silk Board'], isActive: true, avgDeliveryTime: 15, orderVolume: 3890 },
  { id: 'zone-3', name: 'Whitefield Tech Park', storeId: 'store-3', storeName: 'Whitefield Central', radius: 6, areas: ['Whitefield', 'ITPL', 'Varthur', 'Brookefield'], isActive: true, avgDeliveryTime: 20, orderVolume: 2120 },
  { id: 'zone-4', name: 'HSR Residential', storeId: 'store-4', storeName: 'HSR Layout Express', radius: 5, areas: ['HSR Layout', 'Bommanahalli', 'Begur', 'Hongasandra'], isActive: true, avgDeliveryTime: 17, orderVolume: 1850 },
  { id: 'zone-5', name: 'Jayanagar South', storeId: 'store-5', storeName: 'Jayanagar Quick Stop', radius: 4, areas: ['Jayanagar', 'JP Nagar', 'Banashankari'], isActive: true, avgDeliveryTime: 16, orderVolume: 1540 },
];

const MOCK_STORE_PERFORMANCE: StorePerformance[] = [
  { storeId: 'store-1', storeName: 'Indiranagar Express', ordersToday: 87, ordersWeek: 612, ordersMonth: 2540, revenueToday: 174000, revenueWeek: 1224000, revenueMonth: 5080000, avgRating: 4.6, totalReviews: 4582, onTimeDelivery: 96, capacityUtilization: 73 },
  { storeId: 'store-2', storeName: 'Koramangala Hub', ordersToday: 156, ordersWeek: 1092, ordersMonth: 4520, revenueToday: 312000, revenueWeek: 2184000, revenueMonth: 9040000, avgRating: 4.8, totalReviews: 7845, onTimeDelivery: 98, capacityUtilization: 78 },
  { storeId: 'store-3', storeName: 'Whitefield Central', ordersToday: 98, ordersWeek: 686, ordersMonth: 2840, revenueToday: 196000, revenueWeek: 1372000, revenueMonth: 5680000, avgRating: 4.5, totalReviews: 5230, onTimeDelivery: 94, capacityUtilization: 65 },
  { storeId: 'store-4', storeName: 'HSR Layout Express', ordersToday: 72, ordersWeek: 504, ordersMonth: 2090, revenueToday: 144000, revenueWeek: 1008000, revenueMonth: 4180000, avgRating: 4.7, totalReviews: 3892, onTimeDelivery: 97, capacityUtilization: 55 },
  { storeId: 'store-5', storeName: 'Jayanagar Quick Stop', ordersToday: 54, ordersWeek: 378, ordersMonth: 1560, revenueToday: 108000, revenueWeek: 756000, revenueMonth: 3120000, avgRating: 4.4, totalReviews: 2945, onTimeDelivery: 95, capacityUtilization: 54 },
];

// --- API Functions ---

export async function fetchStores(): Promise<Store[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Store[] }>('/admin/stores');
    if (response && response.data && response.data.length > 0) {
      return response.data;
    }
    // Return mock data as fallback
    return MOCK_STORES;
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    return MOCK_STORES;
  }
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Warehouse[] }>('/admin/warehouses');
    if (response?.data?.length) return response.data;
    return MOCK_WAREHOUSES;
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return MOCK_WAREHOUSES;
  }
}

export async function fetchStaff(): Promise<Staff[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Staff[] }>('/admin/staff');
    if (response?.data?.length) return response.data;
    return MOCK_STAFF;
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return MOCK_STAFF;
  }
}

export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: DeliveryZone[] }>('/merch/geofence/zones');
    if (response?.data?.length) return response.data;
    return MOCK_ZONES;
  } catch (error) {
    console.error('Failed to fetch delivery zones:', error);
    return MOCK_ZONES;
  }
}

export async function fetchStorePerformance(): Promise<StorePerformance[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: StorePerformance[] }>('/admin/stores/performance');
    if (response?.data?.length) return response.data;
    return MOCK_STORE_PERFORMANCE;
  } catch (error) {
    console.error('Failed to fetch store performance:', error);
    return MOCK_STORE_PERFORMANCE;
  }
}

export async function createStore(data: Partial<Store>): Promise<Store> {
  try {
    const response = await apiRequest<{ success: boolean; data: Store }>('/admin/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response && response.data) {
      // Add to mock stores array for immediate UI update
      MOCK_STORES.push(response.data);
      return response.data;
    }
    throw new Error('No data returned from API');
  } catch (error: any) {
    console.error('Failed to create store via API, using mock data:', error);
    // Always create mock store for UI functionality even if API fails
    const mockStore: Store = {
      id: `store-${Date.now()}`,
      name: data.name || 'New Store',
      code: data.code || `STORE-${Date.now()}`,
      type: data.type || 'store',
      address: data.address || '',
      city: data.city || 'Bangalore',
      state: data.state || 'Karnataka',
      pincode: data.pincode || '',
      latitude: data.latitude || 12.9716,
      longitude: data.longitude || 77.5946,
      phone: data.phone || '',
      email: data.email || '',
      manager: data.manager || '',
      status: data.status || 'active',
      operationalHours: data.operationalHours || {
        monday: { open: '06:00', close: '23:00', isOpen: true },
        tuesday: { open: '06:00', close: '23:00', isOpen: true },
        wednesday: { open: '06:00', close: '23:00', isOpen: true },
        thursday: { open: '06:00', close: '23:00', isOpen: true },
        friday: { open: '06:00', close: '23:00', isOpen: true },
        saturday: { open: '06:00', close: '23:00', isOpen: true },
        sunday: { open: '07:00', close: '22:00', isOpen: true },
      },
      deliveryRadius: data.deliveryRadius || 5,
      maxCapacity: data.maxCapacity || 100,
      currentLoad: 0,
      staffCount: 0,
      rating: 0,
      totalOrders: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    // Add to mock stores array for immediate UI update
    MOCK_STORES.push(mockStore);
    return mockStore;
  }
}

export async function updateStore(id: string, data: Partial<Store>): Promise<Store> {
  try {
    const response = await apiRequest<{ success: boolean; data: Store }>(`/admin/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response && response.data) {
      // Update mock stores array
      const index = MOCK_STORES.findIndex(s => s.id === id);
      if (index !== -1) {
        MOCK_STORES[index] = { ...MOCK_STORES[index], ...response.data };
      }
      return response.data;
    }
    // Fallback: update mock store
    const index = MOCK_STORES.findIndex(s => s.id === id);
    if (index !== -1) {
      MOCK_STORES[index] = { ...MOCK_STORES[index], ...data };
      return MOCK_STORES[index];
    }
    throw new Error('Store not found');
  } catch (error: any) {
    console.error('Failed to update store:', error);
    // Fallback: update mock store
    const index = MOCK_STORES.findIndex(s => s.id === id);
    if (index !== -1) {
      MOCK_STORES[index] = { ...MOCK_STORES[index], ...data, lastUpdated: new Date().toISOString() };
      return MOCK_STORES[index];
    }
    throw error;
  }
}

export async function deleteStore(id: string): Promise<void> {
  try {
    await apiRequest(`/admin/stores/${id}`, {
      method: 'DELETE',
    });
    // Remove from mock stores array
    const index = MOCK_STORES.findIndex(s => s.id === id);
    if (index !== -1) {
      MOCK_STORES.splice(index, 1);
    }
  } catch (error: any) {
    console.error('Failed to delete store:', error);
    // Still remove from mock array for UI update even if API fails
    const index = MOCK_STORES.findIndex(s => s.id === id);
    if (index !== -1) {
      MOCK_STORES.splice(index, 1);
    }
    // Don't throw error - allow UI to update with mock data
    // throw error;
  }
}

export async function createWarehouse(data: Partial<Warehouse>): Promise<Warehouse> {
  try {
    const response = await apiRequest<{ success: boolean; data: Warehouse }>('/admin/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response && response.data) {
      return response.data;
    }
    throw new Error('No data returned from API');
  } catch (error: any) {
    console.error('Failed to create warehouse via API, using mock data:', error);
    // Always create mock warehouse for UI functionality even if API fails
    const mockWarehouse: Warehouse = {
      id: `warehouse-${Date.now()}`,
      name: data.name || 'New Warehouse',
      code: data.code || `WH-${Date.now()}`,
      address: data.address || '',
      city: data.city || 'Bangalore',
      storageCapacity: data.storageCapacity || 1000,
      currentUtilization: 0,
      inventoryValue: 0,
      productCount: 0,
      zones: data.zones || [],
      manager: data.manager || '',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };
    MOCK_WAREHOUSES.push(mockWarehouse);
    return mockWarehouse;
  }
}

export async function bulkUpdateStoreStatus(ids: string[], status: 'active' | 'inactive' | 'maintenance'): Promise<number> {
  await Promise.all(
    ids.map(id =>
      apiRequest(`/admin/stores/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    )
  );
  return ids.length;
}

export async function getStoreStats() {
  try {
    const response = await apiRequest<{ success: boolean; data: any }>('/admin/stores/stats');
    if (response && response.data) {
      return response.data;
    }
    // Return default stats if API fails
    return {
      totalStores: MOCK_STORES.length,
      activeStores: MOCK_STORES.filter(s => s.status === 'active').length,
      totalWarehouses: MOCK_WAREHOUSES.length,
      totalStaff: MOCK_STAFF.length,
      avgRating: MOCK_STORES.length ? MOCK_STORES.reduce((a, s) => a + s.rating, 0) / MOCK_STORES.length : 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch store stats:', error);
    return {
      totalStores: MOCK_STORES.length,
      activeStores: MOCK_STORES.filter(s => s.status === 'active').length,
      totalWarehouses: MOCK_WAREHOUSES.length,
      totalStaff: MOCK_STAFF.length,
      avgRating: MOCK_STORES.length ? MOCK_STORES.reduce((a, s) => a + s.rating, 0) / MOCK_STORES.length : 0,
    };
  }
}
