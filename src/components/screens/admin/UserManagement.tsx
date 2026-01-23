import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Role,
  Permission,
  AccessLog,
  LoginSession,
  fetchUsers,
  fetchRoles,
  fetchPermissions,
  fetchAccessLogs,
  fetchLoginSessions,
  updateUser,
  deleteUser,
  revokeSession
} from './userManagementApi';
import { AddUserModal } from './modals/AddUserModal';
import { CreateRoleModal } from './modals/CreateRoleModal';
import { BulkOperationsModal } from './modals/BulkOperationsModal';
import { toast } from 'sonner@2.0.3';
import {
  UserPlus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  AlertTriangle,
  Laptop,
  Smartphone,
  Monitor
} from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showBulkOps, setShowBulkOps] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, permsData, logsData, sessionsData] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchPermissions(),
        fetchAccessLogs(),
        fetchLoginSessions()
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
      setPermissions(permsData);
      setAccessLogs(logsData);
      setSessions(sessionsData);
      
      if (rolesData.length > 0) {
        setSelectedRoleId(rolesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await updateUser(userId, { status: 'suspended' });
      toast.success('User suspended');
      loadAllData();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('User deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast.success('Session revoked');
      loadAllData();
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin': return 'bg-[#4F46E5]';
      case 'City Manager': return 'bg-[#3B82F6]';
      case 'Store Manager': return 'bg-[#06B6D4]';
      case 'Finance Lead': return 'bg-[#8B5CF6]';
      case 'Support Agent': return 'bg-[#EC4899]';
      default: return 'bg-[#6B7280]';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const past = new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - past) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const rolePermissions = selectedRole ? permissions.filter(p => selectedRole.permissions.includes(p.id)) : [];

  // Group permissions by module for display
  const permissionsByModule = rolePermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight">User & Role Management</h1>
          <p className="text-[#6B7280] mt-1">RBAC configuration and access logs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button onClick={() => setShowAddUser(true)}>
            <UserPlus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-blue-900">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedUsers([])}>
              Clear Selection
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkOps(true)}>
              Bulk Operations
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            System Users
            <Badge variant="secondary" className="ml-2">{users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="roles">
            Roles & Permissions
            <Badge variant="secondary" className="ml-2">{roles.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="matrix">Permissions Matrix</TabsTrigger>
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="sessions">
            Login Sessions
            <Badge variant="secondary" className="ml-2">{sessions.filter(s => s.status === 'active').length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: System Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#F9FAFB]">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {user.avatar}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></div>
                            <span className="text-xs text-[#6B7280] capitalize">{user.status}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{user.email}</span>
                        {user.emailVerified && (
                          <CheckCircle size={14} className="text-emerald-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.roleName || '')} text-white`}>
                        {user.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[#6B7280]">{user.accessLevel}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatTimeAgo(user.lastLogin)}</div>
                      <div className="text-xs text-[#6B7280]">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit User</DropdownMenuItem>
                          <DropdownMenuItem>View Permissions</DropdownMenuItem>
                          <DropdownMenuItem>View Activity Log</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-rose-600"
                          >
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-[#6B7280]">
            <div>Showing {filteredUsers.length} of {users.length} users</div>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Roles & Permissions */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={() => setShowCreateRole(true)}>
              <Shield size={16} className="mr-2" />
              Create New Role
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Role List */}
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
              <h3 className="font-bold mb-4">Roles</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedRoleId === role.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs text-[#6B7280]">{role.userCount} user{role.userCount !== 1 ? 's' : ''}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{role.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permission Details */}
            <div className="col-span-2 border border-[#E5E7EB] rounded-lg p-6">
              {selectedRole ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold">{selectedRole.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">Active</Badge>
                        <span className="text-sm text-[#6B7280]">{selectedRole.userCount} user{selectedRole.userCount !== 1 ? 's' : ''} assigned</span>
                      </div>
                    </div>
                    <Button variant="outline">Edit Role</Button>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(permissionsByModule).map(([module, perms]) => (
                      <div key={module}>
                        <h4 className="font-bold text-sm mb-2">{module}</h4>
                        <div className="space-y-2 ml-4">
                          {perms.map((perm) => (
                            <div key={perm.id} className="flex items-center gap-2">
                              <CheckCircle size={14} className="text-emerald-500" />
                              <span className="text-sm">{perm.displayName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[#6B7280]">
                  Select a role to view permissions
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Permissions Matrix */}
        <TabsContent value="matrix" className="space-y-4">
          <div className="border border-[#E5E7EB] rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead>Module</TableHead>
                  {roles.slice(0, 5).map(role => (
                    <TableHead key={role.id} className="text-center">{role.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissionsByModule).map(([module]) => (
                  <TableRow key={module}>
                    <TableCell className="font-medium">{module}</TableCell>
                    {roles.slice(0, 5).map(role => {
                      const hasPermissions = permissions
                        .filter(p => p.module === module)
                        .some(p => role.permissions.includes(p.id));
                      return (
                        <TableCell key={role.id} className="text-center">
                          {hasPermissions ? (
                            <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle size={16} className="text-gray-300 mx-auto" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 4: Access Logs */}
        <TabsContent value="logs" className="space-y-4">
          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="text-sm">{formatTimeAgo(log.timestamp)}</div>
                      <div className="text-xs text-[#6B7280]">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-xs text-[#6B7280]">{log.userEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.details}</TableCell>
                    <TableCell>
                      {log.status === 'success' ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 5: Login Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F9FAFB]">
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const Icon = session.deviceType === 'mobile' ? Smartphone :
                              session.deviceType === 'laptop' ? Laptop : Monitor;
                  
                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">{session.userName}</div>
                        <div className="text-xs text-[#6B7280]">{session.userEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#6B7280]" />
                          <span className="text-sm">{session.device}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{session.ipAddress}</TableCell>
                      <TableCell className="text-sm">{session.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm">{formatTimeAgo(session.lastActivity)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onUserAdded={loadAllData}
      />
      
      <CreateRoleModal
        open={showCreateRole}
        onClose={() => setShowCreateRole(false)}
        onRoleCreated={loadAllData}
      />
      
      <BulkOperationsModal
        open={showBulkOps}
        onClose={() => setShowBulkOps(false)}
        selectedUserIds={selectedUsers}
        onOperationComplete={() => {
          setSelectedUsers([]);
          loadAllData();
        }}
      />
    </div>
  );
}
