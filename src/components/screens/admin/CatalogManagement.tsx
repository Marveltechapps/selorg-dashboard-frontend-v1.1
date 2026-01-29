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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Product,
  Category,
  ProductAttribute,
  fetchProducts,
  fetchCategories,
  fetchAttributes,
  deleteProduct,
  updateProduct,
  createProduct,
  getStockStatus,
} from './catalogApi';
import { AddProductModal } from './modals/AddProductModal';
import { AddCategoryModal } from './modals/AddCategoryModal';
import { BulkProductOperationsModal } from './modals/BulkProductOperationsModal';
import { toast } from 'sonner@2.0.3';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  FolderTree,
  Tag,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Zap,
} from 'lucide-react';

export function CatalogManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('products');
  const [stockFilter, setStockFilter] = useState<string>('all');
  
  // Modals
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [bulkOpsOpen, setBulkOpsOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  // Selection
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, attributesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchAttributes(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setAttributes(attributesData);
    } catch (error) {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      await deleteProduct(id);
      toast.success(`Product "${name}" deleted successfully`);
      loadData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await updateProduct(product.id, { status: newStatus });
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    try {
      await updateProduct(product.id, { featured: !product.featured });
      toast.success(product.featured ? 'Removed from featured' : 'Added to featured');
      loadData();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setAddProductOpen(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const duplicateData: Partial<Product> = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY-${Date.now()}`,
        id: undefined, // Let backend generate new ID
      };
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      
      await createProduct(duplicateData);
      toast.success(`Product "${product.name}" duplicated successfully`);
      loadData();
    } catch (error) {
      console.error('Duplicate product error:', error);
      toast.error('Failed to duplicate product');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, id]);
    } else {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    }
  };

  const handleExport = () => {
    try {
      if (filteredProducts.length === 0) {
        toast.warning('No products to export');
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const csvData = [
        ['Catalog Export', `Generated: ${new Date().toLocaleString()}`],
        [''],
        ['Product Details'],
        ['Name', 'SKU', 'Category', 'Subcategory', 'Brand', 'Price', 'Stock', 'Status', 'Featured'],
        ...filteredProducts.map(product => [
          product.name || '',
          product.sku || '',
          product.category || '',
          product.subcategory || '',
          product.brand || '',
          product.price.toString() || '0',
          product.stockQuantity.toString() || '0',
          product.status || '',
          product.featured ? 'Yes' : 'No'
        ]),
      ];

      const csv = csvData.map(row => row.map(cell => {
        const cellStr = String(cell).replace(/"/g, '""');
        return `"${cellStr}"`;
      }).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `catalog-export-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${filteredProducts.length} product(s) successfully`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(`Failed to export products: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleImport = () => {
    console.log('Import clicked');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      console.log('File selected for import');
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        toast.info('Import feature - CSV parsing in progress');
        // TODO: Implement CSV parsing and product creation
        console.log('CSV content:', text);
      } catch (error: any) {
        console.error('Import failed:', error);
        toast.error(`Failed to import products: ${error.message || 'Unknown error'}`);
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    try {
      const template = [
        ['Product Name', 'SKU', 'Category', 'Subcategory', 'Brand', 'Price', 'Cost Price', 'Stock Quantity', 'Low Stock Threshold', 'Status', 'Featured', 'Description', 'Image URL', 'Tags'],
        ['Example Product', 'SKU-001', 'Fruits', 'Fresh Fruits', 'Brand Name', '100.00', '80.00', '50', '10', 'active', 'false', 'Product description', 'https://example.com/image.jpg', 'tag1,tag2'],
      ];

      const csv = template.map(row => row.map(cell => {
        const cellStr = String(cell).replace(/"/g, '""');
        return `"${cellStr}"`;
      }).join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'product-import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error: any) {
      console.error('Template download failed:', error);
      toast.error(`Failed to download template: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast.error('CSV file must have at least a header row and one data row');
          return;
        }

        // Parse CSV (simple parser - handles quoted fields)
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip next quote
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]);
        const dataRows = lines.slice(1).map(parseCSVLine);
        
        let successCount = 0;
        let errorCount = 0;

        for (const row of dataRows) {
          if (row.length < headers.length) continue;
          
          try {
            const productData: Partial<Product> = {
              name: row[0] || '',
              sku: row[1] || '',
              category: row[2] || '',
              subcategory: row[3] || '',
              brand: row[4] || '',
              price: parseFloat(row[5]) || 0,
              costPrice: parseFloat(row[6]) || 0,
              stockQuantity: parseInt(row[7]) || 0,
              lowStockThreshold: parseInt(row[8]) || 10,
              status: (row[9] || 'active') as 'active' | 'inactive' | 'draft',
              featured: row[10] === 'true',
              description: row[11] || '',
              imageUrl: row[12] || '',
              images: row[12] ? [row[12]] : [],
              tags: row[13] ? row[13].split(',').map(t => t.trim()) : [],
            };

            if (productData.name && productData.sku) {
              await createProduct(productData);
              successCount++;
            }
          } catch (error) {
            console.error('Error importing product:', error);
            errorCount++;
          }
        }

        toast.success(`Imported ${successCount} product(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
        loadData();
      } catch (error: any) {
        console.error('Import failed:', error);
        toast.error(`Failed to import products: ${error.message || 'Unknown error'}`);
      }
    };
    input.click();
  };

  // Filtering
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && product.status !== statusFilter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    
    // Stock filter
    if (stockFilter !== 'all') {
      const stockStatus = getStockStatus(product);
      if (stockFilter !== stockStatus) return false;
    }
    
    return true;
  });

  // Statistics
  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => getStockStatus(p) === 'low_stock').length,
    outOfStock: products.filter(p => getStockStatus(p) === 'out_of_stock').length,
    featured: products.filter(p => p.featured).length,
  };

  const topLevelCategories = categories.filter(c => c.parentId === null);

  const getStockBadge = (product: Product) => {
    const status = getStockStatus(product);
    if (status === 'out_of_stock') {
      return <Badge variant="destructive" className="gap-1"><AlertCircle size={12} />Out of Stock</Badge>;
    }
    if (status === 'low_stock') {
      return <Badge className="bg-amber-500 hover:bg-amber-600 gap-1"><AlertCircle size={12} />Low Stock</Badge>;
    }
    return <Badge className="bg-emerald-500 hover:bg-emerald-600">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Catalog Management</h1>
          <p className="text-[#71717a] text-sm">Manage products, categories, and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
          >
            <Download size={14} className="mr-1.5" /> Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImport}
          >
            <Upload size={14} className="mr-1.5" /> Import
          </Button>
          <Button size="sm" onClick={loadData} variant="outline">
            <RefreshCw size={14} className="mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-[#18181b] mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-rose-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#71717a] uppercase tracking-wider">Featured</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.featured}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Star className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" id="products-tab">
            <Package size={14} className="mr-1.5" /> Products
          </TabsTrigger>
          <TabsTrigger value="categories">
            <FolderTree size={14} className="mr-1.5" /> Categories
          </TabsTrigger>
          <TabsTrigger value="attributes">
            <Tag size={14} className="mr-1.5" /> Attributes
          </TabsTrigger>
          <TabsTrigger value="import">
            <FileSpreadsheet size={14} className="mr-1.5" /> Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            {/* Controls */}
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={14} />
                <Input
                  placeholder="Search by name, SKU, or brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {topLevelCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {selectedProducts.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBulkOpsOpen(true)}
                  className="ml-auto"
                >
                  <Zap size={14} className="mr-1.5" />
                  Bulk Actions ({selectedProducts.length})
                </Button>
              )}

              <Button size="sm" onClick={() => {
                setEditProduct(null);
                setAddProductOpen(true);
              }}>
                <Plus size={14} className="mr-1.5" /> Add Product
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[600px] overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-[#f9fafb] z-10">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-[#71717a]">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-[#71717a]">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-[#fcfcfc]">
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#f4f4f5] rounded-lg border border-[#e4e4e7] overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={16} className="text-[#a1a1aa]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-[#18181b] flex items-center gap-1.5">
                                {product.name}
                                {product.featured && <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />}
                              </div>
                              <div className="text-xs text-[#71717a] truncate">
                                {product.attributes.weight || 'No weight specified'}
                              </div>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1 max-w-[200px] overflow-x-auto">
                                  {product.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                      {tag}
                                    </span>
                                  ))}
                                  {product.tags.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded">
                                      +{product.tags.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-[#52525b]">{product.sku}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-[#52525b]">{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-[#a1a1aa]">{product.subcategory}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-[#52525b]">{product.brand || '-'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-[#18181b]">₹{product.price.toFixed(2)}</div>
                          {product.costPrice > 0 && (
                            <div className="text-xs text-[#a1a1aa]">Cost: ₹{product.costPrice.toFixed(2)}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium text-[#18181b]">{product.stockQuantity}</div>
                          {getStockBadge(product)}
                        </TableCell>
                        <TableCell>
                          {product.status === 'active' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>}
                          {product.status === 'inactive' && <Badge variant="secondary">Inactive</Badge>}
                          {product.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit size={14} className="mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                <Copy size={14} className="mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                                {product.featured ? (
                                  <><StarOff size={14} className="mr-2" /> Remove Featured</>
                                ) : (
                                  <><Star size={14} className="mr-2" /> Set Featured</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                                {product.status === 'active' ? (
                                  <><EyeOff size={14} className="mr-2" /> Deactivate</>
                                ) : (
                                  <><Eye size={14} className="mr-2" /> Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="text-rose-600"
                              >
                                <Trash2 size={14} className="mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <p className="text-sm text-[#71717a]">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <h3 className="font-bold text-[#18181b]">Category Hierarchy</h3>
              <Button size="sm" onClick={() => setAddCategoryOpen(true)}>
                <Plus size={14} className="mr-1.5" /> Add Category
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {topLevelCategories.map(category => {
                const subcats = categories.filter(c => c.parentId === category.id);
                return (
                  <div key={category.id} className="border border-[#e4e4e7] rounded-lg overflow-hidden">
                    <div className="p-4 bg-[#f9fafb] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FolderTree className="text-blue-600" size={20} />
                        <div>
                          <div className="font-bold text-[#18181b]">{category.name}</div>
                          <div className="text-xs text-[#71717a]">{category.productCount} products</div>
                        </div>
                      </div>
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                    </div>
                    {subcats.length > 0 && (
                      <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {subcats.map(subcat => (
                          <div 
                            key={subcat.id} 
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-[#f4f4f5] cursor-pointer transition-colors"
                            onClick={() => {
                              // Filter products by subcategory
                              setCategoryFilter(subcat.name);
                              // Switch to products tab
                              setActiveTab('products');
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-[#a1a1aa]"></div>
                              <span className="text-sm text-[#52525b]">{subcat.name}</span>
                            </div>
                            <span className="text-xs text-[#71717a]">{subcat.productCount} products</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Attributes Tab */}
        <TabsContent value="attributes">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Product Attributes</h3>
              <p className="text-xs text-[#71717a] mt-1">Reusable attributes for product variants</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attributes.map(attr => (
                  <div key={attr.id} className="border border-[#e4e4e7] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-[#18181b]">{attr.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{attr.type}</Badge>
                      </div>
                      <span className="text-xs text-[#71717a]">{attr.usageCount} uses</span>
                    </div>
                    {attr.options && attr.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {attr.options.map(opt => (
                          <Badge key={opt} variant="secondary" className="text-xs">{opt}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Bulk Import Tab */}
        <TabsContent value="import">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#f4f4f5] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet size={32} className="text-[#a1a1aa]" />
              </div>
              <h3 className="text-xl font-bold text-[#18181b] mb-2">Bulk Import Products</h3>
              <p className="text-[#71717a] mb-6 max-w-md mx-auto">
                Upload a CSV file to add multiple products at once. Download the template to get started.
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                >
                  <Download size={14} className="mr-1.5" /> Download Template
                </Button>
                <Button onClick={handleBulkImport}>
                  <Upload size={14} className="mr-1.5" /> Upload CSV
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddProductModal
        open={addProductOpen}
        onOpenChange={(open) => {
          setAddProductOpen(open);
          if (!open) setEditProduct(null);
        }}
        onSuccess={loadData}
        editProduct={editProduct}
      />

      <AddCategoryModal
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onSuccess={loadData}
      />

      <BulkProductOperationsModal
        open={bulkOpsOpen}
        onOpenChange={setBulkOpsOpen}
        selectedIds={selectedProducts}
        onSuccess={() => {
          loadData();
          setSelectedProducts([]);
        }}
      />
    </div>
  );
}
