// --- Type Definitions ---

export type UserStatus = "active" | "inactive" | "suspended";
export type RoleType = "system" | "custom";
export type ActionType = "login" | "update_user" | "assign_role" | "update_permissions" | "failed_login" | "suspend_user";
export type LogStatus = "success" | "failed";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  department: string;
  roleId: string;
  roleName?: string;
  accessLevel: string;
  status: UserStatus;
  lastLogin: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  reportingManagerId?: string;
  location?: string[];
  startDate: string;
  notes?: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  roleType: RoleType;
  userCount: number;
  permissions: string[];
  accessScope: "global" | "zone" | "store";
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  module: string;
  description: string;
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  details: string;
  status: LogStatus;
  ipAddress?: string;
  browser?: string;
}

export interface LoginSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  device: string;
  deviceType: "desktop" | "mobile" | "laptop";
  ipAddress: string;
  location: string;
  lastActivity: string;
  status: "active" | "inactive";
}

export interface CreateUserPayload {
  email: string;
  name: string;
  department: string;
  roleId: string;
  reportingManagerId?: string;
  location?: string[];
  twoFactorEnabled: boolean;
  sendInvite: boolean;
  startDate: string;
  notes?: string;
}

export interface UpdateUserPayload {
  name?: string;
  department?: string;
  roleId?: string;
  status?: UserStatus;
  location?: string[];
  notes?: string;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  roleType: RoleType;
  permissions: string[];
  accessScope: "global" | "zone" | "store";
}

// --- Mock Data ---

const MOCK_PERMISSIONS: Permission[] = [
  // Dashboard & Monitoring
  { id: "perm-1", name: "view_dashboard", displayName: "View Dashboard", module: "Dashboard & Monitoring", description: "Access to main dashboard" },
  { id: "perm-2", name: "view_live_ops", displayName: "View Live Operations", module: "Dashboard & Monitoring", description: "Real-time operations view" },
  { id: "perm-3", name: "view_analytics", displayName: "View Analytics", module: "Dashboard & Monitoring", description: "Access analytics reports" },
  { id: "perm-4", name: "export_reports", displayName: "Export Reports", module: "Dashboard & Monitoring", description: "Export reports to CSV/PDF" },
  { id: "perm-5", name: "view_system_health", displayName: "View System Health", module: "Dashboard & Monitoring", description: "Monitor system health" },
  
  // User Management
  { id: "perm-6", name: "create_users", displayName: "Create Users", module: "User Management", description: "Create new users" },
  { id: "perm-7", name: "edit_users", displayName: "Edit Users", module: "User Management", description: "Edit existing users" },
  { id: "perm-8", name: "delete_users", displayName: "Delete Users", module: "User Management", description: "Delete users" },
  { id: "perm-9", name: "manage_roles", displayName: "Manage Roles", module: "User Management", description: "Create/edit roles" },
  { id: "perm-10", name: "assign_roles", displayName: "Assign Roles", module: "User Management", description: "Assign roles to users" },
  { id: "perm-11", name: "view_access_logs", displayName: "View Access Logs", module: "User Management", description: "View audit logs" },
  
  // Configuration
  { id: "perm-12", name: "configure_system", displayName: "Configure System", module: "Configuration", description: "System configuration" },
  { id: "perm-13", name: "manage_master_data", displayName: "Manage Master Data", module: "Configuration", description: "Master data management" },
  { id: "perm-14", name: "configure_pricing", displayName: "Configure Pricing", module: "Configuration", description: "Pricing configuration" },
  { id: "perm-15", name: "configure_promotions", displayName: "Configure Promotions", module: "Configuration", description: "Promotion setup" },
  { id: "perm-16", name: "manage_integrations", displayName: "Manage Integrations", module: "Configuration", description: "External integrations" },
  
  // Operational
  { id: "perm-17", name: "create_orders", displayName: "Create Orders", module: "Operational", description: "Create new orders" },
  { id: "perm-18", name: "manage_orders", displayName: "Manage Orders", module: "Operational", description: "Edit/cancel orders" },
  { id: "perm-19", name: "manage_riders", displayName: "Manage Riders", module: "Operational", description: "Rider management" },
  { id: "perm-20", name: "view_finance", displayName: "View Finance", module: "Operational", description: "Financial data access" },
  
  // Compliance
  { id: "perm-21", name: "view_audit_logs", displayName: "View Audit Logs", module: "Compliance", description: "Compliance audit logs" },
  { id: "perm-22", name: "export_compliance_data", displayName: "Export Compliance Data", module: "Compliance", description: "Export compliance reports" },
  { id: "perm-23", name: "manage_compliance", displayName: "Manage Compliance", module: "Compliance", description: "Compliance management" },
];

const MOCK_ROLES: Role[] = [
  {
    id: "role-1",
    name: "Super Admin",
    description: "Full system access",
    roleType: "system",
    userCount: 1,
    permissions: MOCK_PERMISSIONS.map(p => p.id), // All permissions
    accessScope: "global",
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "role-2",
    name: "City Manager",
    description: "City-level operations",
    roleType: "system",
    userCount: 3,
    permissions: ["perm-1", "perm-2", "perm-3", "perm-4", "perm-5", "perm-17", "perm-18", "perm-19"],
    accessScope: "global",
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "role-3",
    name: "Store Manager",
    description: "Zone/Store operations",
    roleType: "system",
    userCount: 12,
    permissions: ["perm-1", "perm-2", "perm-4", "perm-17", "perm-18"],
    accessScope: "zone",
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "role-4",
    name: "Finance Lead",
    description: "Financial operations",
    roleType: "system",
    userCount: 2,
    permissions: ["perm-1", "perm-3", "perm-4", "perm-14", "perm-20", "perm-21", "perm-22"],
    accessScope: "global",
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "role-5",
    name: "Support Agent",
    description: "Customer support",
    roleType: "system",
    userCount: 8,
    permissions: ["perm-1", "perm-2", "perm-17", "perm-18"],
    accessScope: "global",
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
];

const MOCK_USERS: User[] = [
  {
    id: "user-1",
    email: "admin@platform.com",
    name: "Admin User",
    avatar: "AD",
    department: "IT",
    roleId: "role-1",
    roleName: "Super Admin",
    accessLevel: "Full Access (Root)",
    status: "active",
    lastLogin: new Date().toISOString(),
    emailVerified: true,
    twoFactorEnabled: true,
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-2",
    email: "ops@indiranagar.com",
    name: "Darkstore Mgr",
    avatar: "DS",
    department: "Operations",
    roleId: "role-3",
    roleName: "Store Manager",
    accessLevel: "Zone 5 Only",
    status: "active",
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    emailVerified: true,
    twoFactorEnabled: false,
    location: ["Zone 5 - Indiranagar"],
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-3",
    email: "city@bangalore.com",
    name: "City Manager",
    avatar: "CM",
    department: "Operations",
    roleId: "role-2",
    roleName: "City Manager",
    accessLevel: "Bangalore (All Zones)",
    status: "active",
    lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    emailVerified: true,
    twoFactorEnabled: true,
    location: ["Bangalore"],
    startDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-4",
    email: "finance@platform.com",
    name: "Finance Lead",
    avatar: "FL",
    department: "Finance",
    roleId: "role-4",
    roleName: "Finance Lead",
    accessLevel: "Finance (Full)",
    status: "active",
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    emailVerified: true,
    twoFactorEnabled: true,
    startDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user-5",
    email: "support@platform.com",
    name: "Support Agent",
    avatar: "SA",
    department: "Support",
    roleId: "role-5",
    roleName: "Support Agent",
    accessLevel: "Support (Limited)",
    status: "inactive",
    lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    emailVerified: true,
    twoFactorEnabled: false,
    startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  },
];

// Generate more mock users
for (let i = 6; i <= 47; i++) {
  const roleId = MOCK_ROLES[Math.floor(Math.random() * MOCK_ROLES.length)].id;
  const role = MOCK_ROLES.find(r => r.id === roleId)!;
  MOCK_USERS.push({
    id: `user-${i}`,
    email: `user${i}@platform.com`,
    name: `User ${i}`,
    avatar: `U${i}`,
    department: ["Operations", "Finance", "Support", "IT"][Math.floor(Math.random() * 4)],
    roleId,
    roleName: role.name,
    accessLevel: role.accessScope === "global" ? "Full Access" : "Zone Limited",
    status: Math.random() > 0.2 ? "active" : Math.random() > 0.5 ? "inactive" : "suspended",
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    emailVerified: Math.random() > 0.1,
    twoFactorEnabled: Math.random() > 0.5,
    startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  });
}

let MOCK_ACCESS_LOGS: AccessLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    userId: "user-1",
    userName: "Admin User",
    userEmail: "admin@platform.com",
    action: "update_permissions",
    details: "Updated 'Store Manager' role permissions",
    status: "success",
    ipAddress: "203.0.113.45",
    browser: "Chrome"
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: "user-2",
    userName: "Darkstore Mgr",
    userEmail: "ops@indiranagar.com",
    action: "login",
    details: "IP: 192.168.1.100 | Browser: Chrome",
    status: "success",
    ipAddress: "192.168.1.100",
    browser: "Chrome"
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userId: "user-1",
    userName: "Admin User",
    userEmail: "admin@platform.com",
    action: "assign_role",
    details: "Assigned 'Finance Lead' to finance@platform.com",
    status: "success",
    ipAddress: "203.0.113.45"
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: "unknown",
    userName: "Unknown",
    userEmail: "hacker@example.com",
    action: "failed_login",
    details: "Incorrect password attempt (3/3)",
    status: "failed",
    ipAddress: "198.51.100.200"
  },
  {
    id: "log-5",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userId: "user-1",
    userName: "Admin User",
    userEmail: "admin@platform.com",
    action: "suspend_user",
    details: "Suspended user: user5@platform.com",
    status: "success",
    ipAddress: "203.0.113.45"
  },
];

const MOCK_SESSIONS: LoginSession[] = [
  {
    id: "session-1",
    userId: "user-1",
    userName: "Admin User",
    userEmail: "admin@platform.com",
    device: "Desktop - Chrome, Windows",
    deviceType: "desktop",
    ipAddress: "203.0.113.45",
    location: "Bangalore, IN",
    lastActivity: new Date(Date.now() - 2 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "session-2",
    userId: "user-2",
    userName: "Darkstore Mgr",
    userEmail: "ops@indiranagar.com",
    device: "Mobile - Safari, iOS",
    deviceType: "mobile",
    ipAddress: "192.0.2.150",
    location: "Indiranagar, Bangalore",
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "session-3",
    userId: "user-4",
    userName: "Finance Lead",
    userEmail: "finance@platform.com",
    device: "Laptop - Firefox, macOS",
    deviceType: "laptop",
    ipAddress: "198.51.100.200",
    location: "MG Road, Bangalore",
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: "inactive"
  },
];

import { apiRequest } from '@/api/apiClient';

// --- API Functions ---

export const fetchUsers = async (filters?: {
  status?: UserStatus;
  roleId?: string;
  department?: string;
  search?: string;
}): Promise<User[]> => {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.roleId) queryParams.append('roleId', filters.roleId);
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.search) queryParams.append('search', filters.search);

  const queryString = queryParams.toString();
  const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest<{ success: boolean; data: User[] }>(endpoint);
  return response.data;
};

export const fetchUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await apiRequest<{ success: boolean; data: User }>(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await apiRequest<{ success: boolean; data: User }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<User> => {
  const response = await apiRequest<{ success: boolean; data: User }>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiRequest<{ success: boolean; message: string }>(`/admin/users/${id}`, {
    method: 'DELETE',
  });
};

export const fetchRoles = async (): Promise<Role[]> => {
  const response = await apiRequest<{ success: boolean; data: Role[] }>('/admin/roles');
  return response.data;
};

export const fetchRoleById = async (id: string): Promise<Role | null> => {
  try {
    const response = await apiRequest<{ success: boolean; data: Role }>(`/admin/roles/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const response = await apiRequest<{ success: boolean; data: Role }>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const updateRole = async (id: string, payload: Partial<CreateRolePayload>): Promise<Role> => {
  const response = await apiRequest<{ success: boolean; data: Role }>(`/admin/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
};

export const deleteRole = async (id: string): Promise<void> => {
  await apiRequest<{ success: boolean; message: string }>(`/admin/roles/${id}`, {
    method: 'DELETE',
  });
};

export const fetchPermissions = async (): Promise<Permission[]> => {
  const response = await apiRequest<{ success: boolean; data: Permission[] }>('/admin/permissions');
  return response.data;
};

export const fetchAccessLogs = async (filters?: {
  userId?: string;
  action?: ActionType;
  status?: LogStatus;
  startDate?: string;
  endDate?: string;
}): Promise<AccessLog[]> => {
  // TODO: Implement backend endpoint for access logs
  // For now, return empty array as backend endpoint doesn't exist yet
  try {
    const queryParams = new URLSearchParams();
    if (filters?.userId) queryParams.append('userId', filters.userId);
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await apiRequest<{ success: boolean; data: AccessLog[] }>(`/admin/access-logs?${queryParams.toString()}`);
    return response.data || [];
  } catch (error) {
    console.warn('Access logs endpoint not available, returning empty array');
    return [];
  }
};

export const fetchLoginSessions = async (): Promise<LoginSession[]> => {
  // TODO: Implement backend endpoint for login sessions
  try {
    const response = await apiRequest<{ success: boolean; data: LoginSession[] }>('/admin/sessions');
    return response.data || [];
  } catch (error) {
    console.warn('Login sessions endpoint not available, returning empty array');
    return [];
  }
};

export const revokeSession = async (sessionId: string): Promise<void> => {
  // TODO: Implement backend endpoint for revoking sessions
  try {
    await apiRequest<{ success: boolean; message: string }>(`/admin/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Revoke session endpoint not available');
    throw error;
  }
};

export const bulkUpdateUsers = async (userIds: string[], updates: Partial<UpdateUserPayload>): Promise<void> => {
  // Update each user individually via API
  await Promise.all(
    userIds.map(id =>
      apiRequest<{ success: boolean; data: User }>(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    )
  );
};

export const bulkAssignRole = async (userIds: string[], roleId: string): Promise<void> => {
  // Assign role to each user individually
  await Promise.all(
    userIds.map(id =>
      apiRequest<{ success: boolean; data: User }>(`/admin/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ roleId }),
      })
    )
  );
};
