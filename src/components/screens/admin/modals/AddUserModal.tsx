import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role, CreateUserPayload, createUser, fetchRoles } from '../userManagementApi';
import { toast } from 'sonner@2.0.3';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
}

export function AddUserModal({ open, onClose, onUserAdded }: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '',
    name: '',
    department: '',
    roleId: '',
    twoFactorEnabled: false,
    sendInvite: true,
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.name || !formData.department || !formData.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await createUser(formData);
      toast.success('User created successfully');
      onUserAdded?.();
      handleClose();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      department: '',
      roleId: '',
      twoFactorEnabled: false,
      sendInvite: true,
      startDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const handleClear = () => {
    setFormData({
      email: '',
      name: '',
      department: '',
      roleId: '',
      twoFactorEnabled: false,
      sendInvite: true,
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const selectedRole = roles.find(r => r.id === formData.roleId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign roles and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Section 1: Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1F2937]">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <p className="text-xs text-[#6B7280]">User will receive invite at this email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Access Configuration */}
          <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
            <h3 className="text-lg font-bold text-[#1F2937]">Access Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role *</Label>
              <Select 
                value={formData.roleId} 
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[#6B7280]">User will have permissions of selected role</p>
            </div>

            {selectedRole && (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-4 rounded-lg">
                <div className="text-sm font-medium text-[#1F2937] mb-2">Access Level (Auto-populated)</div>
                <div className="text-sm text-[#6B7280]">
                  <strong>Role:</strong> {selectedRole.name}
                </div>
                <div className="text-sm text-[#6B7280]">
                  <strong>Scope:</strong> {selectedRole.accessScope === 'global' ? 'Full Access' : 'Zone Limited'}
                </div>
                <div className="text-sm text-[#6B7280]">
                  <strong>Permissions:</strong> {selectedRole.permissions.length} permissions assigned
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Security Settings */}
          <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
            <h3 className="text-lg font-bold text-[#1F2937]">Security Settings</h3>
            
            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
              <div>
                <Label htmlFor="twoFactor" className="text-sm font-medium">Two-Factor Authentication</Label>
                <p className="text-xs text-[#6B7280]">Require authenticator app or SMS for login</p>
              </div>
              <Switch
                id="twoFactor"
                checked={formData.twoFactorEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
              <div>
                <Label htmlFor="sendInvite" className="text-sm font-medium">Send Invite Email</Label>
                <p className="text-xs text-[#6B7280]">User will receive email with setup link</p>
              </div>
              <Switch
                id="sendInvite"
                checked={formData.sendInvite}
                onCheckedChange={(checked) => setFormData({ ...formData, sendInvite: checked })}
              />
            </div>
          </div>

          {/* Section 4: Meta Information */}
          <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
            <h3 className="text-lg font-bold text-[#1F2937]">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any internal notes about this user..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
