/**
 * Merch geofence API - mock/seed and fetch helpers for GeofenceTargeting.
 * Uses local state in GeofenceTargeting; this provides seedData for "Seed Mock Data" button.
 */

export const geofenceApi = {
  seedData(): Promise<void> {
    return Promise.resolve();
  },
};
