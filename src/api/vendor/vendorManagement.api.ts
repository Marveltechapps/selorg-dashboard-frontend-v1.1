import { API_CONFIG, API_ENDPOINTS } from '../../config/api';

/**
 * Vendor Management API
 */
export const vendorManagementApi = {
  /**
   * Get all vendors (alias for getVendors)
   */
  async listVendors(filters?: any) {
    return this.getVendors(filters);
  },

  /**
   * Get all vendors
   */
  async getVendors(filters?: any) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.list}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }

    return response.json();
  },

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.byId(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor');
    }

    return response.json();
  },

  /**
   * Create vendor
   */
  async createVendor(vendorData: any) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.create}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create vendor' }));
      throw new Error(error.message || 'Failed to create vendor');
    }

    return response.json();
  },

  /**
   * Update vendor
   */
  async updateVendor(id: string, vendorData: any) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.update(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update vendor' }));
      throw new Error(error.message || 'Failed to update vendor');
    }

    return response.json();
  },

  /**
   * Delete vendor
   */
  async deleteVendor(id: string) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.byId(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete vendor');
    }

    return response.json();
  },

  /**
   * Get vendor summary
   */
  async getVendorSummary() {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.summary}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor summary');
    }

    return response.json();
  },

  /**
   * List vendor QC checks
   */
  async listVendorQCChecks(vendorId: string) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.vendors.qcChecks(vendorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor QC checks');
    }

    return response.json();
  },

  /**
   * List all QC checks
   */
  async listQCChecks(filters?: any) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.qc.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch QC checks');
    }

    return response.json();
  },

  /**
   * List vendor certificates
   */
  async listVendorCertificates(vendorId: string) {
    const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.vendor.certificates.listVendorCertificates(vendorId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor certificates');
    }

    return response.json();
  },

  /**
   * Get audits
   */
  async getAudits(filters?: { vendorId?: string; auditType?: string; result?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.auditType) params.append('auditType', filters.auditType);
    if (filters?.result) params.append('result', filters.result);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`${API_CONFIG.baseURL}/vendor/qc-compliance/audits?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch audits');
    }

    return response.json();
  },

  /**
   * Get temperature compliance
   */
  async getTemperatureCompliance(filters?: { vendorId?: string; shipmentId?: string; compliant?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.shipmentId) params.append('shipmentId', filters.shipmentId);
    if (filters?.compliant !== undefined) params.append('compliant', String(filters.compliant));

    const response = await fetch(`${API_CONFIG.baseURL}/vendor/qc-compliance/temperature?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch temperature compliance');
    }

    return response.json();
  },

  /**
   * Get vendor ratings
   */
  async getVendorRatings(vendorId?: string) {
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);

    const response = await fetch(`${API_CONFIG.baseURL}/vendor/qc-compliance/ratings?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vendor ratings');
    }

    return response.json();
  },
};

// Named exports for direct imports
export const listVendors = vendorManagementApi.listVendors.bind(vendorManagementApi);
export const getVendors = vendorManagementApi.getVendors.bind(vendorManagementApi);
export const getVendorById = vendorManagementApi.getVendorById.bind(vendorManagementApi);
export const createVendor = vendorManagementApi.createVendor.bind(vendorManagementApi);
export const updateVendor = vendorManagementApi.updateVendor.bind(vendorManagementApi);
export const deleteVendor = vendorManagementApi.deleteVendor.bind(vendorManagementApi);
export const getVendorSummary = vendorManagementApi.getVendorSummary.bind(vendorManagementApi);
export const listVendorQCChecks = vendorManagementApi.listVendorQCChecks.bind(vendorManagementApi);
export const listQCChecks = vendorManagementApi.listQCChecks.bind(vendorManagementApi);
export const listVendorCertificates = vendorManagementApi.listVendorCertificates.bind(vendorManagementApi);
export const getAudits = vendorManagementApi.getAudits.bind(vendorManagementApi);
export const getTemperatureCompliance = vendorManagementApi.getTemperatureCompliance.bind(vendorManagementApi);
export const getVendorRatings = vendorManagementApi.getVendorRatings.bind(vendorManagementApi);

export default vendorManagementApi;
