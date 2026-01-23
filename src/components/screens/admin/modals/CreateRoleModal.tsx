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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Permission, 
  CreateRolePayload, 
  createRole, 
  updateRole,
  fetchPermissions 
} from '../userManagementApi';
import { toast } from 'sonner@2.0.3';

interface CreateRoleModalProps {
  open: boolean;
  onClose: () => void;
  onRoleCreated?: () => void;
  editingRoleId?: string | null;
}

export function CreateRoleModal({ 
  open, 
  onClose, 
  onRoleCreated,
  editingRoleId 
}: CreateRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [formData, setFormData] = useState<CreateRolePayload>({
    name: '',
    description: '',
    roleType: 'custom',
    permissions: [],
    accessScope: 'global',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      loadPermissions();
    }
  }, [open]);

  const loadPermissions = async () => {
    try {
      const data = await fetchPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setLoading(true);
    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, formData);
        toast.success('Role updated successfully');
      } else {
        await createRole(formData);
        toast.success('Role created successfully');
      }
      onRoleCreated?.();
      handleClose();
    } catch (error) {
      toast.error(editingRoleId ? 'Failed to update role' : 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      roleType: 'custom',
      permissions: [],
      accessScope: 'global',
    });
    setSearchTerm('');
    onClose();
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleModulePermissions = (module: string, select: boolean) => {
    const modulePermissions = permissions
      .filter(p => p.module === module)
      .map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: select
        ? [...new Set([...prev.permissions, ...modulePermissions])]
        : prev.permissions.filter(id => !modulePermissions.includes(id))
    }));
  };

  const selectAll = () => {
    setFormData(prev => ({
      ...prev,
      permissions: permissions.map(p => p.id)
    }));
  };

  const deselectAll = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter permissions by search term
  const filteredModules = Object.entries(permissionsByModule).filter(([module, perms]) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      module.toLowerCase().includes(search) ||
      perms.some(p => 
        p.displayName.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      )
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingRoleId ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogDescription>
            Define role permissions and access scope
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Section 1: Role Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#1F2937]">Role Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleName">Role Name *</Label>
                  <Input
                    id="roleName"
                    type="text"
                    placeholder="e.g., Zone Manager"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roleType">Role Type *</Label>
                  <RadioGroup 
                    value={formData.roleType} 
                    onValueChange={(value: 'system' | 'custom') => setFormData({ ...formData, roleType: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="font-normal">System Role (built-in)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom" className="font-normal">Custom Role (user-defined)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Manages operations for assigned zone"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* Section 2: Permissions Selection */}
            <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#1F2937]">Permissions Selection</h3>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Search Permissions</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-lg">
                <div className="text-sm font-medium">
                  Permissions selected: {formData.permissions.length} of {permissions.length}
                </div>
                <div className="w-full bg-[#E5E7EB] h-2 rounded-full mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${(formData.permissions.length / permissions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <ScrollArea className="h-80 border border-[#E5E7EB] rounded-lg p-4">
                <div className="space-y-4">
                  {filteredModules.map(([module, modulePermissions]) => {
                    const allSelected = modulePermissions.every(p => formData.permissions.includes(p.id));
                    const someSelected = modulePermissions.some(p => formData.permissions.includes(p.id));

                    return (
                      <div key={module} className="space-y-2">
                        <div className="flex items-center justify-between bg-[#F9FAFB] p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) => toggleModulePermissions(module, !!checked)}
                            />
                            <span className="font-bold text-[#1F2937]">{module}</span>
                          </div>
                          <span className="text-xs text-[#6B7280]">
                            {modulePermissions.filter(p => formData.permissions.includes(p.id)).length} / {modulePermissions.length}
                          </span>
                        </div>
                        <div className="ml-6 space-y-2">
                          {modulePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-start gap-2">
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={permission.id} 
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.displayName}
                                </Label>
                                <p className="text-xs text-[#6B7280]">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Section 3: Scope Configuration */}
            <div className="space-y-4 border-t border-[#E5E7EB] pt-4">
              <h3 className="text-lg font-bold text-[#1F2937]">Scope Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="accessScope">Access Scope</Label>
                <Select 
                  value={formData.accessScope} 
                  onValueChange={(value: 'global' | 'zone' | 'store') => setFormData({ ...formData, accessScope: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (access to all locations/zones)</SelectItem>
                    <SelectItem value="zone">Specific Zones</SelectItem>
                    <SelectItem value="store">Specific Stores</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-4 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setFormData({
                name: '',
                description: '',
                roleType: 'custom',
                permissions: [],
                accessScope: 'global',
              });
            }}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingRoleId ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
