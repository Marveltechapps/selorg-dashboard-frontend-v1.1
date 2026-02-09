// localStorage persistence for allocation & stock operations

const STORAGE_KEYS = {
  skuAllocations: 'allocation_sku_allocations',
  transferOrders: 'allocation_transfer_orders',
  rebalances: 'allocation_rebalances',
  stockAllocations: 'allocation_stock_allocations',
  alerts: 'allocation_replenishment_alerts'
};

export const allocationApi = {
  // SKU Allocations (stored as object with keys like "skuId_locationId")
  loadSKUAllocations: (): Record<string, any> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.skuAllocations);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading SKU allocations:', error);
      return {};
    }
  },

  saveSKUAllocations: (allocations: Record<string, any>): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.skuAllocations, JSON.stringify(allocations));
    } catch (error) {
      console.error('Error saving SKU allocations:', error);
    }
  },

  updateSKUAllocation: (skuId: string, locationId: string, updates: any): void => {
    const allocations = allocationApi.loadSKUAllocations();
    const key = `${skuId}_${locationId}`;
    // Merge with existing data to preserve all fields
    const existing = allocations[key] || {};
    allocations[key] = { 
      ...existing, 
      ...updates, 
      skuId, 
      locationId, 
      updatedAt: new Date().toISOString() 
    };
    allocationApi.saveSKUAllocations(allocations);
  },

  // Transfer Orders
  loadTransferOrders: (): any[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.transferOrders);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading transfer orders:', error);
      return [];
    }
  },

  saveTransferOrders: (orders: any[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.transferOrders, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving transfer orders:', error);
    }
  },

  createTransferOrder: (order: any): any => {
    const orders = allocationApi.loadTransferOrders();
    const newOrder = {
      ...order,
      id: `transfer-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    allocationApi.saveTransferOrders(orders);
    return newOrder;
  },

  // Rebalances
  loadRebalances: (): any[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.rebalances);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading rebalances:', error);
      return [];
    }
  },

  saveRebalances: (rebalances: any[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.rebalances, JSON.stringify(rebalances));
    } catch (error) {
      console.error('Error saving rebalances:', error);
    }
  },

  createRebalance: (rebalance: any): any => {
    const rebalances = allocationApi.loadRebalances();
    const newRebalance = {
      ...rebalance,
      id: `rebalance-${Date.now()}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    rebalances.unshift(newRebalance);
    allocationApi.saveRebalances(rebalances);
    return newRebalance;
  },

  // Stock Allocations
  loadStockAllocations: (): any[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.stockAllocations);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading stock allocations:', error);
      return [];
    }
  },

  saveStockAllocations: (allocations: any[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.stockAllocations, JSON.stringify(allocations));
    } catch (error) {
      console.error('Error saving stock allocations:', error);
    }
  },

  createStockAllocation: (allocation: any): any => {
    const allocations = allocationApi.loadStockAllocations();
    const newAllocation = {
      ...allocation,
      id: `allocation-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    allocations.unshift(newAllocation);
    allocationApi.saveStockAllocations(allocations);
    return newAllocation;
  },

  // Alerts (for dismissing)
  loadDismissedAlerts: (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.alerts);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading dismissed alerts:', error);
      return [];
    }
  },

  dismissAlert: (alertId: string): void => {
    const dismissed = allocationApi.loadDismissedAlerts();
    if (!dismissed.includes(alertId)) {
      dismissed.push(alertId);
      try {
        localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(dismissed));
      } catch (error) {
        console.error('Error saving dismissed alerts:', error);
      }
    }
  }
};
