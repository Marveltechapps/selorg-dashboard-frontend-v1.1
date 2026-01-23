const API_BASE_URL = 'http://localhost:5000/api/v1/geofence';

export const geofenceApi = {
  getZones: async () => {
    const response = await fetch(`${API_BASE_URL}/zones`);
    if (!response.ok) throw new Error('Failed to fetch zones');
    return response.json();
  },

  createZone: async (zoneData: any) => {
    const response = await fetch(`${API_BASE_URL}/zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zoneData),
    });
    if (!response.ok) throw new Error('Failed to create zone');
    return response.json();
  },

  updateZone: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) throw new Error('Failed to update zone');
    return response.json();
  },

  deleteZone: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/zones/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete zone');
    return response.json();
  },

  getStores: async () => {
    const response = await fetch(`${API_BASE_URL}/stores`);
    if (!response.ok) throw new Error('Failed to fetch stores');
    return response.json();
  },

  seedData: async () => {
    const response = await fetch(`${API_BASE_URL}/seed`, {
        method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to seed data');
    return response.json();
  }
};

