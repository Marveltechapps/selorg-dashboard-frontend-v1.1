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

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
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
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  const data = await response.json();
  
  // Store token in localStorage
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
 * Register new user
 */
export async function register(userData: RegisterRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.auth.register}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
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
