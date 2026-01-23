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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product, Category, createProduct, updateProduct, fetchCategories } from '../catalogApi';
import { toast } from 'sonner@2.0.3';
import { X, Upload, Plus, Package } from 'lucide-react';

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editProduct?: Product | null;
}

export function AddProductModal({ open, onOpenChange, onSuccess, editProduct }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<string[]>(editProduct?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    price: '',
    costPrice: '',
    stockQuantity: '',
    lowStockThreshold: '',
    imageUrl: '',
    status: 'active' as 'active' | 'inactive' | 'draft',
    featured: false,
    weight: '',
    dimensions: '',
    color: '',
    size: '',
    material: '',
    expiryDays: '',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      if (editProduct) {
        setFormData({
          name: editProduct.name,
          sku: editProduct.sku,
          description: editProduct.description,
          category: editProduct.category,
          subcategory: editProduct.subcategory,
          brand: editProduct.brand,
          price: editProduct.price.toString(),
          costPrice: editProduct.costPrice.toString(),
          stockQuantity: editProduct.stockQuantity.toString(),
          lowStockThreshold: editProduct.lowStockThreshold.toString(),
          imageUrl: editProduct.imageUrl,
          status: editProduct.status,
          featured: editProduct.featured,
          weight: editProduct.attributes.weight || '',
          dimensions: editProduct.attributes.dimensions || '',
          color: editProduct.attributes.color || '',
          size: editProduct.attributes.size || '',
          material: editProduct.attributes.material || '',
          expiryDays: editProduct.attributes.expiryDays?.toString() || '',
        });
        setTags(editProduct.tags);
      } else {
        resetForm();
      }
    }
  }, [open, editProduct]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      price: '',
      costPrice: '',
      stockQuantity: '',
      lowStockThreshold: '10',
      imageUrl: '',
      status: 'active',
      featured: false,
      weight: '',
      dimensions: '',
      color: '',
      size: '',
      material: '',
      expiryDays: '',
    });
    setTags([]);
    setTagInput('');
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('SKU is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    setLoading(true);
    try {
      const productData: Partial<Product> = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand.trim(),
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
        imageUrl: formData.imageUrl.trim(),
        images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
        status: formData.status,
        featured: formData.featured,
        attributes: {
          weight: formData.weight.trim() || undefined,
          dimensions: formData.dimensions.trim() || undefined,
          color: formData.color.trim() || undefined,
          size: formData.size.trim() || undefined,
          material: formData.material.trim() || undefined,
          expiryDays: formData.expiryDays ? parseInt(formData.expiryDays) : undefined,
        },
        tags,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, productData);
        toast.success(`Product "${formData.name}" updated successfully`);
      } else {
        await createProduct(productData);
        toast.success(`Product "${formData.name}" created successfully`);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(editProduct ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const topLevelCategories = categories.filter(c => c.parentId === null && c.status === 'active');
  const subcategories = categories.filter(c => c.parentId && categories.find(cat => cat.id === c.parentId)?.name === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#e4e4e7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#e11d48]/10 flex items-center justify-center">
              <Package className="text-[#e11d48]" size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editProduct ? 'Update product information and inventory' : 'Create a new product in the catalog'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[400px] px-6">
            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Red Apples (Shimla)"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="e.g., FRT-APL-001"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  disabled={!!editProduct}
                />
                {editProduct && (
                  <p className="text-xs text-[#71717a]">SKU cannot be changed after creation</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product description..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(val) => {
                    handleChange('category', val);
                    handleChange('subcategory', '');
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
                  <Label>Subcategory</Label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(val) => handleChange('subcategory', val)}
                    disabled={!formData.category}
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

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Fresh Farm"
                  value={formData.brand}
                  onChange={(e) => handleChange('brand', e.target.value)}
                />
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Upload size={16} />
                  </Button>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 w-20 h-20 border border-[#e4e4e7] rounded-lg overflow-hidden">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button variant="outline" size="icon" onClick={addTag}>
                    <Plus size={16} />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPrice">Cost Price (₹)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Margin Calculation */}
              {formData.price && formData.costPrice && (
                <div className="p-3 bg-[#f4f4f5] rounded-lg">
                  <p className="text-sm text-[#52525b]">
                    Profit Margin: <span className="font-bold text-[#18181b]">
                      ₹{(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)}
                    </span>
                    {' '}({((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price) * 100).toFixed(1)}%)
                  </p>
                </div>
              )}

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleChange('stockQuantity', e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    placeholder="10"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val: any) => handleChange('status', val)}>
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

              {/* Featured */}
              <div className="flex items-center justify-between p-4 bg-[#f4f4f5] rounded-lg">
                <div>
                  <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
                  <p className="text-xs text-[#71717a] mt-1">Show in featured section</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleChange('featured', checked)}
                />
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-4 mt-4">
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight / Pack Size</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 1 kg, 500 g, 1 L"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                />
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  placeholder="e.g., 10x5x3 cm"
                  value={formData.dimensions}
                  onChange={(e) => handleChange('dimensions', e.target.value)}
                />
              </div>

              {/* Color & Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Red, Blue"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    placeholder="e.g., Small, Large"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                  />
                </div>
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="e.g., Plastic, Glass"
                  value={formData.material}
                  onChange={(e) => handleChange('material', e.target.value)}
                />
              </div>

              {/* Expiry Days */}
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Shelf Life (Days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  placeholder="e.g., 7, 30"
                  value={formData.expiryDays}
                  onChange={(e) => handleChange('expiryDays', e.target.value)}
                  min="0"
                />
                <p className="text-xs text-[#71717a]">Number of days before product expires</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e4e4e7] flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#e11d48] hover:bg-[#be123c]">
            {loading ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
