/**
 * Merch geofence API - localStorage persistence for zones and stores.
 */

import { Zone, Store } from './types';

const STORAGE_KEYS = {
  zones: 'geofence_zones',
  stores: 'geofence_stores'
};

const DEFAULT_ZONES: Zone[] = [
  { id: '1', name: 'Downtown Core', type: 'Serviceable', status: 'Active', isVisible: true, color: '#10B981', areaSqKm: 12.4, promoCount: 8, points: [{ x: 30, y: 30 }, { x: 50, y: 25 }, { x: 55, y: 45 }, { x: 35, y: 50 }] },
  { id: '2', name: 'West End Hub', type: 'Priority', status: 'Active', isVisible: true, color: '#3B82F6', areaSqKm: 8.2, promoCount: 5, points: [{ x: 10, y: 40 }, { x: 25, y: 35 }, { x: 30, y: 60 }, { x: 15, y: 65 }] },
  { id: '3', name: 'Exclusion Zone A', type: 'Exclusion', status: 'Active', isVisible: true, color: '#EF4444', areaSqKm: 4.1, promoCount: 0, points: [{ x: 60, y: 60 }, { x: 80, y: 55 }, { x: 85, y: 75 }, { x: 65, y: 80 }] }
];

const DEFAULT_STORES: Store[] = [
  { id: '1', name: 'Main St. Express', address: '123 Main St, Downtown', x: 42, y: 38, zones: ['Downtown Core'], serviceStatus: 'Full' },
  { id: '2', name: 'Westside Market', address: '456 West Blvd, West End', x: 18, y: 52, zones: ['West End Hub'], serviceStatus: 'Full' },
  { id: '3', name: 'North Hills Outpost', address: '789 North Rd, North Hills', x: 72, y: 22, zones: [], serviceStatus: 'Partial' }
];

export const geofenceApi = {
  // Zones
  loadZones(): Zone[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.zones);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default zones if empty
      geofenceApi.saveZones(DEFAULT_ZONES);
      return DEFAULT_ZONES;
    } catch (error) {
      console.error('Error loading zones:', error);
      return DEFAULT_ZONES;
    }
  },

  saveZones(zones: Zone[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(zones));
    } catch (error) {
      console.error('Error saving zones:', error);
    }
  },

  createZone(zone: Zone): Zone {
    const zones = geofenceApi.loadZones();
    const newZone = { ...zone, id: zone.id || `zone-${Date.now()}` };
    zones.unshift(newZone);
    geofenceApi.saveZones(zones);
    return newZone;
  },

  updateZone(zoneId: string, updates: Partial<Zone>): Zone | null {
    const zones = geofenceApi.loadZones();
    const index = zones.findIndex(z => z.id === zoneId);
    if (index === -1) return null;
    zones[index] = { ...zones[index], ...updates };
    geofenceApi.saveZones(zones);
    return zones[index];
  },

  deleteZone(zoneId: string): void {
    const zones = geofenceApi.loadZones();
    const filtered = zones.filter(z => z.id !== zoneId);
    geofenceApi.saveZones(filtered);
  },

  // Stores
  loadStores(): Store[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.stores);
      if (stored) {
        return JSON.parse(stored);
      }
      geofenceApi.saveStores(DEFAULT_STORES);
      return DEFAULT_STORES;
    } catch (error) {
      console.error('Error loading stores:', error);
      return DEFAULT_STORES;
    }
  },

  saveStores(stores: Store[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.stores, JSON.stringify(stores));
    } catch (error) {
      console.error('Error saving stores:', error);
    }
  },

  updateStore(storeId: string, updates: Partial<Store>): Store | null {
    const stores = geofenceApi.loadStores();
    const index = stores.findIndex(s => s.id === storeId);
    if (index === -1) return null;
    stores[index] = { ...stores[index], ...updates };
    geofenceApi.saveStores(stores);
    return stores[index];
  },

  seedData(): Promise<void> {
    geofenceApi.saveZones(DEFAULT_ZONES);
    geofenceApi.saveStores(DEFAULT_STORES);
    return Promise.resolve();
  },
};
