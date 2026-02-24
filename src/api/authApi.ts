import { API_CONFIG, API_ENDPOINTS } from '../config/api';

export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Get login endpoint based on role
 */
function getLoginEndpoint(role?: string): string {
  if (!role) return API_ENDPOINTS.auth.login;
  
  const roleMap: Record<string, { login: string }> = {
    darkstore: API_ENDPOINTS.darkstore,
    production: API_ENDPOINTS.production,
    merch: API_ENDPOINTS.merch,
    rider: API_ENDPOINTS.rider,
    finance: API_ENDPOINTS.finance,
    warehouse: API_ENDPOINTS.warehouse,
    admin: API_ENDPOINTS.admin,
    vendor: API_ENDPOINTS.vendor,
  };
  
  return roleMap[role]?.auth?.login || API_ENDPOINTS.auth.login;
}

/**
 * Authenticate user with email and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const endpoint = getLoginEndpoint(credentials.role);
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      role: credentials.role,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  const data = await response.json();

  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (credentials.role) {
      localStorage.setItem('userRole', credentials.role);
    }
  }

  return data;
}

/**
 * Get logout endpoint for current role (revokes token on server)
 */
function getLogoutEndpoint(role?: string): string {
  const loginPath = getLoginEndpoint(role);
  return loginPath.replace(/\/login$/, '/logout');
}

/**
 * Logout user: revoke token on server (if possible) and clear local state
 */
export function logout(): void {
  const token = getAuthToken();
  const user = getCurrentUser();
  const role = user?.role;
  if (token && role) {
    const endpoint = getLogoutEndpoint(role);
    fetch(`${API_CONFIG.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isSuperAdmin');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): { id: string; email: string; name: string; role: string } | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
