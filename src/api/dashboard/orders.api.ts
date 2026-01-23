/**
 * Order API functions
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

async function post(endpoint: string, data?: Record<string, any>) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Call customer for order
 */
export async function callCustomer(orderId: string, phoneNumber: string) {
  return post('/api/v1/darkstore/orders/call-customer', {
    orderId,
    phoneNumber,
  });
}

/**
 * Mark order as RTO
 */
export async function markRTO(orderId: string, reason?: string) {
  return post('/api/v1/darkstore/orders/mark-rto', {
    orderId,
    reason,
  });
}
