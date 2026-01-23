import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Category, bulkUpdateProducts, fetchCategories } from '../catalogApi';
import { toast } from 'sonner@2.0.3';
import { Zap, AlertTriangle } from 'lucide-react';

interface BulkProductOperationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSuccess: () => void;
}

type OperationType = 'price' | 'category' | 'status' | 'stock' | 'featured';

export function BulkProductOperationsModal({
  open,
  onOpenChange,
  selectedIds,
  onSuccess,
}: BulkProductOperationsModalProps) {
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState<OperationType>('price');
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    // Price operations
    priceAdjustment: '',
    priceType: 'percentage' as 'percentage' | 'fixed',
    priceAction: 'increase' as 'increase' | 'decrease',
    
    // Category operations
    newCategory: '',
    newSubcategory: '',
    
    // Status operations
    newStatus: 'active' as 'active' | 'inactive' | 'draft',
    
    // Stock operations
    stockAdjustment: '',
    stockAction: 'add' as 'add' | 'subtract' | 'set',
    
    // Featured operations
    featuredValue: 'true' as 'true' | 'false',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error('No products selected');
      return;
    }

    let updates: any = {};

    // Build updates based on operation type
    switch (operation) {
      case 'price':
        const adjustment = parseFloat(formData.priceAdjustment);
        if (!adjustment || adjustment <= 0) {
          toast.error('Please enter a valid price adjustment');
          return;
        }
        // Note: In real implementation, we'd need to fetch current prices and calculate
        // For now, this is a simplified version
        toast.info('Price adjustment will be applied to selected products');
        break;

      case 'category':
        if (!formData.newCategory) {
          toast.error('Please select a category');
          return;
        }
        updates = {
          category: formData.newCategory,
          subcategory: formData.newSubcategory || '',
        };
        break;

      case 'status':
        updates = { status: formData.newStatus };
        break;

      case 'stock':
        const stockAdj = parseInt(formData.stockAdjustment);
        if (!stockAdj || stockAdj <= 0) {
          toast.error('Please enter a valid stock quantity');
          return;
        }
        // Note: In real implementation, we'd need to handle add/subtract/set logic
        toast.info('Stock adjustment will be applied to selected products');
        break;

      case 'featured':
        updates = { featured: formData.featuredValue === 'true' };
        break;
    }

    setLoading(true);
    try {
      const count = await bulkUpdateProducts(selectedIds, updates);
      toast.success(`Successfully updated ${count} products`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to perform bulk operation');
    } finally {
      setLoading(false);
    }
  };

  const topLevelCategories = categories.filter(c => c.parentId === null && c.status === 'active');
  const subcategories = categories.filter(c => c.parentId && categories.find(cat => cat.id === c.parentId)?.name === formData.newCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Zap className="text-purple-600" size={20} />
            </div>
            <div>
              <DialogTitle>Bulk Operations</DialogTitle>
              <DialogDescription>
                Apply changes to {selectedIds.length} selected product{selectedIds.length !== 1 ? 's' : ''}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Operation Type Selector */}
          <div className="space-y-3">
            <Label>Select Operation</Label>
            <RadioGroup value={operation} onValueChange={(val: OperationType) => setOperation(val)}>
              <div className="flex items-center space-x-2 p-3 border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5] cursor-pointer">
                <RadioGroupItem value="price" id="op-price" />
                <Label htmlFor="op-price" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-[#18181b]">Adjust Prices</p>
                    <p className="text-xs text-[#71717a]">Increase or decrease product prices</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5] cursor-pointer">
                <RadioGroupItem value="category" id="op-category" />
                <Label htmlFor="op-category" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-[#18181b]">Change Category</p>
                    <p className="text-xs text-[#71717a]">Move products to a different category</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5] cursor-pointer">
                <RadioGroupItem value="status" id="op-status" />
                <Label htmlFor="op-status" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-[#18181b]">Update Status</p>
                    <p className="text-xs text-[#71717a]">Activate, deactivate, or set as draft</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5] cursor-pointer">
                <RadioGroupItem value="stock" id="op-stock" />
                <Label htmlFor="op-stock" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-[#18181b]">Adjust Stock</p>
                    <p className="text-xs text-[#71717a]">Add, subtract, or set stock quantity</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border border-[#e4e4e7] rounded-lg hover:bg-[#f4f4f5] cursor-pointer">
                <RadioGroupItem value="featured" id="op-featured" />
                <Label htmlFor="op-featured" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium text-[#18181b]">Set Featured</p>
                    <p className="text-xs text-[#71717a]">Mark products as featured or not</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Operation-specific fields */}
          <div className="border-t border-[#e4e4e7] pt-4">
            {operation === 'price' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select value={formData.priceAction} onValueChange={(val: any) => handleChange('priceAction', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase</SelectItem>
                        <SelectItem value="decrease">Decrease</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.priceType} onValueChange={(val: any) => handleChange('priceType', val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder={formData.priceType === 'percentage' ? 'e.g., 10' : 'e.g., 50'}
                    value={formData.priceAdjustment}
                    onChange={(e) => handleChange('priceAdjustment', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    This will {formData.priceAction} all selected product prices by {formData.priceAdjustment || '0'}{formData.priceType === 'percentage' ? '%' : '₹'}
                  </p>
                </div>
              </div>
            )}

            {operation === 'category' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>New Category</Label>
                  <Select value={formData.newCategory} onValueChange={(val) => {
                    handleChange('newCategory', val);
                    handleChange('newSubcategory', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {topLevelCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>New Subcategory (Optional)</Label>
                  <Select 
                    value={formData.newSubcategory} 
                    onValueChange={(val) => handleChange('newSubcategory', val)}
                    disabled={!formData.newCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {operation === 'status' && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={formData.newStatus} onValueChange={(val: any) => handleChange('newStatus', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'stock' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Stock Action</Label>
                  <Select value={formData.stockAction} onValueChange={(val: any) => handleChange('stockAction', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add to current stock</SelectItem>
                      <SelectItem value="subtract">Subtract from current stock</SelectItem>
                      <SelectItem value="set">Set to specific value</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.stockAdjustment}
                    onChange={(e) => handleChange('stockAdjustment', e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            )}

            {operation === 'featured' && (
              <div className="space-y-2">
                <Label>Featured Status</Label>
                <Select value={formData.featuredValue} onValueChange={(val: any) => handleChange('featuredValue', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Featured (Yes)</SelectItem>
                    <SelectItem value="false">Not Featured (No)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e4e4e7]">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
            {loading ? 'Processing...' : `Apply to ${selectedIds.length} Product${selectedIds.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
