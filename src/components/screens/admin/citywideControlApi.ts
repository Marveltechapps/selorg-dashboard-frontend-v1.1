import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export type ZoneStatus = "normal" | "surge" | "warning" | "critical" | "offline";
export type IncidentSeverity = "critical" | "warning" | "stable";
export type IncidentType = "store_outage" | "payment_gateway" | "maps_api" | "warehouse" | "rider_shortage";
export type ExceptionType = "rto_risk" | "pickup_delay" | "payment_failed" | "delivery_delay" | "customer_unreachable";

export interface Zone {
  id: string;
  zoneNumber: number;
  zoneName: string;
  status: ZoneStatus;
  capacityPercent: number;
  activeOrders: number;
  activeRiders: number;
  riderStatus: "normal" | "overload" | "shortage";
  avgDeliveryTime: string; // "14m 22s"
  slaStatus: "on_track" | "warning" | "breach";
  surgeMultiplier?: number;
  stores: ZoneStore[];
}

export interface ZoneStore {
  storeId: string;
  storeName: string;
  status: "active" | "offline" | "limited";
  capacityPercent: number;
  activeOrders: number;
}

export interface LiveMetrics {
  orderFlowPerHour: number;
  orderFlowTrend: number; // percentage
  avgDeliveryTime: string;
  avgDeliverySeconds: number;
  targetDeliverySeconds: number;
  activeRiders: number;
  riderUtilizationPercent: number;
  activeIncidentsCount: number;
  lastUpdated: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  startTime: string;
  duration?: string;
  impact?: string;
  affectedOrders?: number;
  affectedCustomers?: number;
  status: "ongoing" | "resolved";
  resolvedAt?: string;
  timeline?: IncidentTimelineEvent[];
  actions?: IncidentAction[];
}

export interface IncidentTimelineEvent {
  timestamp: string;
  event: string;
}

export interface IncidentAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
}

export interface Exception {
  id: string;
  type: ExceptionType;
  orderId: string;
  title: string;
  description: string;
  riderName?: string;
  storeName?: string;
  timestamp: string;
  timeAgo: string;
  priority: "high" | "medium" | "low";
}

export interface SurgeInfo {
  active: boolean;
  globalMultiplier?: number;
  zonesAffected: string[];
  zoneMultipliers: { [zoneId: string]: number };
  startTime?: string;
  estimatedEnd?: string;
  reason?: string;
}

export interface DispatchEngineStatus {
  status: "running" | "paused" | "error";
  lastRestart: string;
  uptime: string;
  uptimePercent: number;
  processingOrders: number;
  avgDispatchTime: number; // seconds
  successRate: number;
  configuration: {
    algorithm: string;
    riderSelection: string;
    batchingEnabled: boolean;
    surgePricingEnabled: boolean;
  };
}

export interface AnalyticsData {
  orderFlowHistory: { time: string; orders: number }[];
  slaPerformanceByZone: { zone: string; actual: number; target: number }[];
  riderUtilization: { status: string; count: number; percent: number }[];
  storeCapacityHeatmap: { store: string; hour: string; capacity: number }[];
}

// --- API Functions ---

const zoneNames = ["Indiranagar", "Whitefield", "Koramangala", "HSR Layout", "Marathahalli", "Jayanagar"];

const generateMockZones = (): Zone[] => {
  return zoneNames.map((name, index) => {
    const zoneNumber = index + 1;
    let status: ZoneStatus = "normal";
    let capacityPercent = Math.floor(Math.random() * 60) + 20; // 20-80%
    let riderStatus: "normal" | "overload" | "shortage" = "normal";
    let slaStatus: "on_track" | "warning" | "breach" = "on_track";
    let surgeMultiplier: number | undefined = undefined;
    
    // Make some zones stressed
    if (zoneNumber === 1) {
      status = "critical";
      capacityPercent = 98;
      riderStatus = "overload";
      slaStatus = "breach";
    } else if (zoneNumber === 5) {
      status = "warning";
      capacityPercent = 85;
      slaStatus = "warning";
    } else if (zoneNumber === 8) {
      status = "surge";
      capacityPercent = 72;
      surgeMultiplier = 1.2;
    }
    
    const activeOrders = Math.floor(capacityPercent * 5 + Math.random() * 50);
    const activeRiders = Math.floor(activeOrders / 50) + Math.floor(Math.random() * 5) + 5;
    
    const avgMinutes = slaStatus === "breach" ? 18 : slaStatus === "warning" ? 16 : 12 + Math.floor(Math.random() * 3);
    const avgSeconds = Math.floor(Math.random() * 60);
    const avgDeliveryTime = `${avgMinutes}m ${avgSeconds.toString().padStart(2, '0')}s`;
    
    // Generate stores for this zone
    const stores: ZoneStore[] = Array.from({ length: 3 }, (_, i) => ({
      storeId: `ST-${zoneNumber}${(i + 1).toString().padStart(2, '0')}`,
      storeName: `${name} ${i === 0 ? 'Main' : i === 1 ? 'Express' : 'Mini'}`,
      status: (zoneNumber === 1 && i === 1) ? "offline" : "active",
      capacityPercent: Math.floor(Math.random() * 40) + 50,
      activeOrders: Math.floor(Math.random() * 100) + 20
    }));
    
    return {
      id: `zone-${zoneNumber}`,
      zoneNumber,
      zoneName: name,
      status,
      capacityPercent,
      activeOrders,
      activeRiders,
      riderStatus,
      avgDeliveryTime,
      slaStatus,
      surgeMultiplier,
      stores
    };
  });
};

const generateMockIncidents = (): Incident[] => {
  return [
    {
      id: "INC-001",
      type: "store_outage",
      severity: "critical",
      title: "Store Outage",
      description: "ST-102 (Power Failure)",
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      duration: "15 mins",
      impact: "7 orders affected | 89 customers impacted",
      affectedOrders: 7,
      affectedCustomers: 89,
      status: "ongoing",
      timeline: [
        { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), event: "Incident detected" },
        { timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), event: "Alert sent to store manager" },
        { timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), event: "Escalation to ops team" },
        { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), event: "Customers notified" }
      ],
      actions: [
        { id: "action-1", label: "Call Store Manager", type: "primary" },
        { id: "action-2", label: "Send Alert", type: "secondary" },
        { id: "action-3", label: "Reassign Orders", type: "secondary" },
        { id: "action-4", label: "Mark Resolved", type: "primary" }
      ]
    },
    {
      id: "INC-002",
      type: "maps_api",
      severity: "warning",
      title: "Maps API",
      description: "Google Maps - Latency",
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      duration: "30 mins",
      impact: "Latency: 2.3s (threshold: 1s)",
      status: "ongoing"
    },
    {
      id: "INC-003",
      type: "payment_gateway",
      severity: "stable",
      title: "Payment Gateway",
      description: "Razorpay",
      startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      impact: "Status: Stable | 99.9% uptime",
      status: "ongoing"
    }
  ];
};

const generateMockExceptions = (): Exception[] => {
  const types: ExceptionType[] = ["rto_risk", "pickup_delay", "payment_failed", "delivery_delay", "customer_unreachable"];
  const riders = ["Amit K.", "Rajesh M.", "Priya S.", "Kumar R.", "Anita P."];
  const stores = ["Indiranagar", "Whitefield", "Koramangala", "HSR Layout"];
  
  return Array.from({ length: 12 }, (_, i) => {
    const type = types[i % types.length];
    const orderId = `88${219 - i}`;
    const timestamp = new Date(Date.now() - (i + 1) * 2 * 60 * 1000);
    const minutesAgo = i * 2 + 2;
    
    let title = "";
    let description = "";
    
    switch (type) {
      case "rto_risk":
        title = "Customer unreachable";
        description = "Multiple delivery attempts failed";
        break;
      case "pickup_delay":
        title = "Warehouse pickup delayed";
        description = "Order pending for >15 mins";
        break;
      case "payment_failed":
        title = "Payment retry failed";
        description = "3 consecutive failures";
        break;
      case "delivery_delay":
        title = "Delivery time exceeded";
        description = "SLA breach imminent";
        break;
      case "customer_unreachable":
        title = "Customer not responding";
        description = "Unable to confirm delivery location";
        break;
    }
    
    return {
      id: uuidv4(),
      type,
      orderId: `#${orderId}`,
      title,
      description,
      riderName: riders[i % riders.length],
      storeName: stores[i % stores.length],
      timestamp: timestamp.toISOString(),
      timeAgo: `${minutesAgo}m ago`,
      priority: type === "rto_risk" || type === "payment_failed" ? "high" : "medium"
    };
  });
};

// --- API Functions ---

export const fetchLiveMetrics = async (): Promise<LiveMetrics> => {
  // TODO: Implement backend endpoint for live metrics
  return {
    orderFlowPerHour: 0,
    orderFlowTrend: 0,
    avgDeliveryTime: '0m',
    avgDeliverySeconds: 0,
    targetDeliverySeconds: 0,
    activeRiders: 0,
    riderUtilizationPercent: 0,
    activeIncidentsCount: 0,
    lastUpdated: new Date().toISOString(),
  };
};

export const fetchZones = async (): Promise<Zone[]> => {
  try {
    const response = await apiRequest<{ success: boolean; data: Zone[] }>('/merch/geofence/zones');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return [];
  }
};

export const fetchZoneDetails = async (zoneId: string): Promise<Zone | null> => {
  try {
    const response = await apiRequest<{ success: boolean; data: Zone }>(`/merch/geofence/zones/${zoneId}`);
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch zone details:', error);
    return null;
  }
};

export const fetchIncidents = async (): Promise<Incident[]> => {
  // TODO: Implement backend endpoint for incidents
  return [];
};

export const fetchIncidentDetails = async (incidentId: string): Promise<Incident | null> => {
  // TODO: Implement backend endpoint for incident details
  return null;
};

export const fetchExceptions = async (): Promise<Exception[]> => {
  // TODO: Implement backend endpoint for exceptions
  return [];
};

export const resolveException = async (exceptionId: string): Promise<void> => {
  // TODO: Implement backend endpoint for resolving exceptions
  throw new Error('Not implemented');
};

export const fetchSurgeInfo = async (): Promise<SurgeInfo> => {
  // TODO: Implement backend endpoint for surge info
  return {
    active: false,
    globalMultiplier: 1.0,
    zoneMultipliers: {},
    startTime: null,
    endTime: null,
  };
};

export const updateSurgeMultiplier = async (zoneId: string, multiplier: number): Promise<SurgeInfo> => {
  // TODO: Implement backend endpoint for updating surge multiplier
  throw new Error('Not implemented');
};

export const updateGlobalSurge = async (multiplier: number): Promise<SurgeInfo> => {
  // TODO: Implement backend endpoint for updating global surge
  throw new Error('Not implemented');
};

export const endSurge = async (): Promise<SurgeInfo> => {
  // TODO: Implement backend endpoint for ending surge
  throw new Error('Not implemented');
};

export const fetchDispatchEngineStatus = async (): Promise<DispatchEngineStatus> => {
  // TODO: Implement backend endpoint for dispatch engine status
  return {
    status: 'running',
    uptime: '0 mins',
    lastRestart: new Date().toISOString(),
    configuration: {
      maxConcurrentOrders: 0,
      autoDispatch: true,
      priorityRules: [],
    },
  };
};

export const restartDispatchEngine = async (): Promise<DispatchEngineStatus> => {
  // TODO: Implement backend endpoint for restarting dispatch engine
  throw new Error('Not implemented');
};

export const pauseDispatchEngine = async (): Promise<DispatchEngineStatus> => {
  // TODO: Implement backend endpoint for pausing dispatch engine
  throw new Error('Not implemented');
};

export const resumeDispatchEngine = async (): Promise<DispatchEngineStatus> => {
  // TODO: Implement backend endpoint for resuming dispatch engine
  throw new Error('Not implemented');
};

export const updateDispatchConfig = async (config: Partial<DispatchEngineStatus['configuration']>): Promise<DispatchEngineStatus> => {
  // TODO: Implement backend endpoint for updating dispatch config
  throw new Error('Not implemented');
};

export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  // TODO: Implement backend endpoint for analytics data
  return {
    orderFlowHistory: [],
    slaPerformanceByZone: [],
    riderUtilization: [],
    storeCapacityHeatmap: [],
  };
};

export const resolveIncident = async (incidentId: string): Promise<Incident> => {
  // TODO: Implement backend endpoint for resolving incidents
  throw new Error('Not implemented');
};
