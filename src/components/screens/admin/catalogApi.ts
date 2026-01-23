import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions ---

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  attributes: {
    weight?: string;
    dimensions?: string;
    color?: string;
    size?: string;
    material?: string;
    expiryDays?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  imageUrl: string;
  productCount: number;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  options?: string[];
  usageCount: number;
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

// --- Mock Data ---

const CATEGORIES: Category[] = [
  // Top Level Categories
  { id: 'cat-1', name: 'Fresh Produce', slug: 'fresh-produce', parentId: null, description: 'Fresh fruits and vegetables', imageUrl: '', productCount: 45, status: 'active', sortOrder: 1, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-2', name: 'Dairy & Eggs', slug: 'dairy-eggs', parentId: null, description: 'Milk, cheese, yogurt, and eggs', imageUrl: '', productCount: 32, status: 'active', sortOrder: 2, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-3', name: 'Beverages', slug: 'beverages', parentId: null, description: 'Drinks and refreshments', imageUrl: '', productCount: 28, status: 'active', sortOrder: 3, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-4', name: 'Snacks & Packaged Foods', slug: 'snacks', parentId: null, description: 'Chips, cookies, and packaged snacks', imageUrl: '', productCount: 56, status: 'active', sortOrder: 4, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-5', name: 'Personal Care', slug: 'personal-care', parentId: null, description: 'Hygiene and beauty products', imageUrl: '', productCount: 38, status: 'active', sortOrder: 5, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-6', name: 'Household', slug: 'household', parentId: null, description: 'Cleaning and household items', imageUrl: '', productCount: 24, status: 'active', sortOrder: 6, createdAt: '2024-01-15T08:00:00Z' },
  
  // Subcategories - Fresh Produce
  { id: 'cat-1-1', name: 'Fruits', slug: 'fruits', parentId: 'cat-1', description: 'Fresh seasonal fruits', imageUrl: '', productCount: 25, status: 'active', sortOrder: 1, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-1-2', name: 'Vegetables', slug: 'vegetables', parentId: 'cat-1', description: 'Fresh vegetables', imageUrl: '', productCount: 20, status: 'active', sortOrder: 2, createdAt: '2024-01-15T08:00:00Z' },
  
  // Subcategories - Dairy
  { id: 'cat-2-1', name: 'Milk', slug: 'milk', parentId: 'cat-2', description: 'Fresh and packaged milk', imageUrl: '', productCount: 12, status: 'active', sortOrder: 1, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-2-2', name: 'Cheese & Butter', slug: 'cheese-butter', parentId: 'cat-2', description: 'Cheese and butter products', imageUrl: '', productCount: 10, status: 'active', sortOrder: 2, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-2-3', name: 'Yogurt', slug: 'yogurt', parentId: 'cat-2', description: 'Yogurt and curd', imageUrl: '', productCount: 10, status: 'active', sortOrder: 3, createdAt: '2024-01-15T08:00:00Z' },
  
  // Subcategories - Beverages
  { id: 'cat-3-1', name: 'Soft Drinks', slug: 'soft-drinks', parentId: 'cat-3', description: 'Carbonated drinks', imageUrl: '', productCount: 15, status: 'active', sortOrder: 1, createdAt: '2024-01-15T08:00:00Z' },
  { id: 'cat-3-2', name: 'Juices', slug: 'juices', parentId: 'cat-3', description: 'Fruit juices', imageUrl: '', productCount: 13, status: 'active', sortOrder: 2, createdAt: '2024-01-15T08:00:00Z' },
];

const ATTRIBUTES: ProductAttribute[] = [
  { id: 'attr-1', name: 'Weight', type: 'text', usageCount: 156 },
  { id: 'attr-2', name: 'Color', type: 'select', options: ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Black'], usageCount: 89 },
  { id: 'attr-3', name: 'Size', type: 'select', options: ['Small', 'Medium', 'Large', 'XL'], usageCount: 134 },
  { id: 'attr-4', name: 'Brand', type: 'text', usageCount: 203 },
  { id: 'attr-5', name: 'Material', type: 'select', options: ['Plastic', 'Glass', 'Metal', 'Paper', 'Organic'], usageCount: 67 },
  { id: 'attr-6', name: 'Dimensions', type: 'text', usageCount: 45 },
  { id: 'attr-7', name: 'Expiry Days', type: 'number', usageCount: 112 },
  { id: 'attr-8', name: 'Organic', type: 'boolean', usageCount: 78 },
];

let MOCK_PRODUCTS: Product[] = [
  // Fresh Produce - Fruits
  { id: 'prod-1', sku: 'FRT-APL-001', name: 'Red Apples (Shimla)', description: 'Fresh crispy red apples from Shimla', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Fresh Farm', price: 180, costPrice: 120, stockQuantity: 450, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 kg', expiryDays: 7 }, tags: ['fresh', 'seasonal'], createdAt: '2024-11-15T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-2', sku: 'FRT-BAN-001', name: 'Bananas (Robusta)', description: 'Fresh yellow bananas', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Fresh Farm', price: 50, costPrice: 30, stockQuantity: 320, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 dozen', expiryDays: 5 }, tags: ['fresh', 'daily'], createdAt: '2024-11-15T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-3', sku: 'FRT-ORA-001', name: 'Oranges (Nagpur)', description: 'Juicy Nagpur oranges', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Citrus Fresh', price: 120, costPrice: 75, stockQuantity: 280, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=200', images: [], status: 'active', featured: false, attributes: { weight: '1 kg', expiryDays: 10 }, tags: ['fresh', 'vitamin-c'], createdAt: '2024-11-16T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-4', sku: 'FRT-GRP-001', name: 'Green Grapes', description: 'Sweet seedless green grapes', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Premium Fruits', price: 200, costPrice: 140, stockQuantity: 35, lowStockThreshold: 40, imageUrl: 'https://images.unsplash.com/photo-1599819177423-2c0ec0ee1a9f?w=200', images: [], status: 'active', featured: true, attributes: { weight: '500 g', expiryDays: 6 }, tags: ['fresh', 'seedless'], createdAt: '2024-11-17T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-5', sku: 'FRT-MAN-001', name: 'Alphonso Mangoes', description: 'Premium Alphonso mangoes', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Premium Fruits', price: 350, costPrice: 250, stockQuantity: 0, lowStockThreshold: 20, imageUrl: 'https://images.unsplash.com/photo-1605552070315-201f5501e842?w=200', images: [], status: 'inactive', featured: false, attributes: { weight: '1 kg', expiryDays: 4 }, tags: ['seasonal', 'premium'], createdAt: '2024-11-18T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-6', sku: 'FRT-STR-001', name: 'Strawberries', description: 'Fresh red strawberries', category: 'Fresh Produce', subcategory: 'Fruits', brand: 'Berry Fresh', price: 280, costPrice: 200, stockQuantity: 85, lowStockThreshold: 30, imageUrl: 'https://images.unsplash.com/photo-1543528176-61b239494933?w=200', images: [], status: 'active', featured: true, attributes: { weight: '250 g', expiryDays: 3 }, tags: ['fresh', 'premium'], createdAt: '2024-11-19T10:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Fresh Produce - Vegetables
  { id: 'prod-7', sku: 'VEG-TOM-001', name: 'Tomatoes (Hybrid)', description: 'Fresh red tomatoes', category: 'Fresh Produce', subcategory: 'Vegetables', brand: 'Farm Fresh', price: 40, costPrice: 25, stockQuantity: 520, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 kg', expiryDays: 6 }, tags: ['fresh', 'daily'], createdAt: '2024-11-15T11:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-8', sku: 'VEG-ONI-001', name: 'Onions (Bangalore)', description: 'Red onions', category: 'Fresh Produce', subcategory: 'Vegetables', brand: 'Farm Fresh', price: 30, costPrice: 18, stockQuantity: 680, lowStockThreshold: 150, imageUrl: 'https://images.unsplash.com/photo-1508313880080-c4bef43d8e66?w=200', images: [], status: 'active', featured: false, attributes: { weight: '1 kg', expiryDays: 14 }, tags: ['fresh', 'staple'], createdAt: '2024-11-15T11:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-9', sku: 'VEG-POT-001', name: 'Potatoes', description: 'Fresh potatoes', category: 'Fresh Produce', subcategory: 'Vegetables', brand: 'Farm Fresh', price: 25, costPrice: 15, stockQuantity: 890, lowStockThreshold: 200, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200', images: [], status: 'active', featured: false, attributes: { weight: '1 kg', expiryDays: 20 }, tags: ['fresh', 'staple'], createdAt: '2024-11-15T11:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-10', sku: 'VEG-CAR-001', name: 'Carrots (Orange)', description: 'Fresh orange carrots', category: 'Fresh Produce', subcategory: 'Vegetables', brand: 'Organic Valley', price: 60, costPrice: 40, stockQuantity: 245, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200', images: [], status: 'active', featured: false, attributes: { weight: '500 g', expiryDays: 10 }, tags: ['fresh', 'organic'], createdAt: '2024-11-16T11:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Dairy & Eggs
  { id: 'prod-11', sku: 'DRY-MLK-001', name: 'Amul Taaza Toned Milk', description: 'Toned homogenized milk', category: 'Dairy & Eggs', subcategory: 'Milk', brand: 'Amul', price: 56, costPrice: 48, stockQuantity: 420, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 L', expiryDays: 3 }, tags: ['dairy', 'daily'], createdAt: '2024-11-15T12:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-12', sku: 'DRY-MLK-002', name: 'Nandini Full Cream Milk', description: 'Full cream milk', category: 'Dairy & Eggs', subcategory: 'Milk', brand: 'Nandini', price: 62, costPrice: 52, stockQuantity: 380, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 L', expiryDays: 2 }, tags: ['dairy', 'daily'], createdAt: '2024-11-15T12:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-13', sku: 'DRY-CHE-001', name: 'Amul Processed Cheese', description: 'Cheese slices', category: 'Dairy & Eggs', subcategory: 'Cheese & Butter', brand: 'Amul', price: 130, costPrice: 100, stockQuantity: 28, lowStockThreshold: 30, imageUrl: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=200', images: [], status: 'active', featured: false, attributes: { weight: '200 g', expiryDays: 90 }, tags: ['dairy', 'cheese'], createdAt: '2024-11-16T12:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-14', sku: 'DRY-BUT-001', name: 'Amul Butter (Salted)', description: 'Salted table butter', category: 'Dairy & Eggs', subcategory: 'Cheese & Butter', brand: 'Amul', price: 56, costPrice: 45, stockQuantity: 165, lowStockThreshold: 40, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=200', images: [], status: 'active', featured: true, attributes: { weight: '100 g', expiryDays: 120 }, tags: ['dairy', 'butter'], createdAt: '2024-11-16T12:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-15', sku: 'DRY-YOG-001', name: 'Nestle A+ Dahi', description: 'Fresh yogurt/curd', category: 'Dairy & Eggs', subcategory: 'Yogurt', brand: 'Nestle', price: 35, costPrice: 28, stockQuantity: 210, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1571212515416-fca2ce42f18c?w=200', images: [], status: 'active', featured: false, attributes: { weight: '400 g', expiryDays: 4 }, tags: ['dairy', 'yogurt'], createdAt: '2024-11-17T12:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-16', sku: 'DRY-EGG-001', name: 'Country Eggs (Brown)', description: 'Farm fresh brown eggs', category: 'Dairy & Eggs', subcategory: 'Eggs', brand: 'Farm Fresh', price: 90, costPrice: 70, stockQuantity: 340, lowStockThreshold: 80, imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200', images: [], status: 'active', featured: true, attributes: { weight: '6 pcs', expiryDays: 14 }, tags: ['protein', 'daily'], createdAt: '2024-11-15T12:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Beverages
  { id: 'prod-17', sku: 'BEV-COK-001', name: 'Coca-Cola (Can)', description: 'Coca-Cola carbonated drink', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Coca-Cola', price: 40, costPrice: 32, stockQuantity: 450, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200', images: [], status: 'active', featured: true, attributes: { weight: '330 ml' }, tags: ['beverage', 'cold-drink'], createdAt: '2024-11-15T13:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-18', sku: 'BEV-PEP-001', name: 'Pepsi (Bottle)', description: 'Pepsi carbonated drink', category: 'Beverages', subcategory: 'Soft Drinks', brand: 'Pepsi', price: 90, costPrice: 75, stockQuantity: 380, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200', images: [], status: 'active', featured: true, attributes: { weight: '750 ml' }, tags: ['beverage', 'cold-drink'], createdAt: '2024-11-15T13:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-19', sku: 'BEV-JUI-001', name: 'Real Mango Juice', description: 'Mango fruit juice', category: 'Beverages', subcategory: 'Juices', brand: 'Dabur Real', price: 120, costPrice: 95, stockQuantity: 220, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200', images: [], status: 'active', featured: false, attributes: { weight: '1 L' }, tags: ['juice', 'fruit'], createdAt: '2024-11-16T13:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-20', sku: 'BEV-JUI-002', name: 'Tropicana Orange Juice', description: '100% orange juice', category: 'Beverages', subcategory: 'Juices', brand: 'Tropicana', price: 150, costPrice: 120, stockQuantity: 185, lowStockThreshold: 40, imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200', images: [], status: 'active', featured: true, attributes: { weight: '1 L' }, tags: ['juice', 'premium'], createdAt: '2024-11-16T13:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-21', sku: 'BEV-WAT-001', name: 'Bisleri Mineral Water', description: 'Packaged drinking water', category: 'Beverages', subcategory: 'Water', brand: 'Bisleri', price: 20, costPrice: 15, stockQuantity: 850, lowStockThreshold: 200, imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200', images: [], status: 'active', featured: false, attributes: { weight: '1 L' }, tags: ['water', 'daily'], createdAt: '2024-11-15T13:30:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Snacks
  { id: 'prod-22', sku: 'SNK-LAY-001', name: "Lay's Classic Salted", description: 'Potato chips', category: 'Snacks & Packaged Foods', subcategory: 'Chips', brand: "Lay's", price: 20, costPrice: 15, stockQuantity: 520, lowStockThreshold: 150, imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', images: [], status: 'active', featured: true, attributes: { weight: '52 g' }, tags: ['snack', 'chips'], createdAt: '2024-11-15T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-23', sku: 'SNK-KUR-001', name: 'Kurkure Masala Munch', description: 'Crunchy snack', category: 'Snacks & Packaged Foods', subcategory: 'Chips', brand: 'Kurkure', price: 20, costPrice: 15, stockQuantity: 18, lowStockThreshold: 150, imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200', images: [], status: 'active', featured: false, attributes: { weight: '55 g' }, tags: ['snack', 'spicy'], createdAt: '2024-11-15T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-24', sku: 'SNK-ORE-001', name: 'Oreo Original Cookies', description: 'Chocolate sandwich cookies', category: 'Snacks & Packaged Foods', subcategory: 'Biscuits', brand: 'Oreo', price: 35, costPrice: 28, stockQuantity: 320, lowStockThreshold: 100, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200', images: [], status: 'active', featured: true, attributes: { weight: '120 g' }, tags: ['snack', 'cookies'], createdAt: '2024-11-16T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-25', sku: 'SNK-PAR-001', name: 'Parle-G Glucose Biscuits', description: 'Classic glucose biscuits', category: 'Snacks & Packaged Foods', subcategory: 'Biscuits', brand: 'Parle', price: 15, costPrice: 12, stockQuantity: 680, lowStockThreshold: 200, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200', images: [], status: 'active', featured: false, attributes: { weight: '100 g' }, tags: ['snack', 'biscuit'], createdAt: '2024-11-16T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Personal Care
  { id: 'prod-26', sku: 'PER-CLG-001', name: 'Colgate Total Toothpaste', description: 'Advanced protection toothpaste', category: 'Personal Care', subcategory: 'Oral Care', brand: 'Colgate', price: 95, costPrice: 75, stockQuantity: 240, lowStockThreshold: 60, imageUrl: 'https://images.unsplash.com/photo-1622372738946-62e02505feb3?w=200', images: [], status: 'active', featured: false, attributes: { weight: '150 g' }, tags: ['personal-care', 'dental'], createdAt: '2024-11-17T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-27', sku: 'PER-DOV-001', name: 'Dove Moisturizing Soap', description: 'Moisturizing beauty bar', category: 'Personal Care', subcategory: 'Bath & Body', brand: 'Dove', price: 65, costPrice: 50, stockQuantity: 310, lowStockThreshold: 80, imageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200', images: [], status: 'active', featured: true, attributes: { weight: '125 g' }, tags: ['personal-care', 'soap'], createdAt: '2024-11-17T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-28', sku: 'PER-SUN-001', name: 'Sunsilk Shampoo', description: 'Hair shampoo', category: 'Personal Care', subcategory: 'Hair Care', brand: 'Sunsilk', price: 180, costPrice: 145, stockQuantity: 25, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200', images: [], status: 'active', featured: false, attributes: { weight: '340 ml' }, tags: ['personal-care', 'hair'], createdAt: '2024-11-18T14:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  
  // Household
  { id: 'prod-29', sku: 'HOU-VIM-001', name: 'Vim Dishwash Gel', description: 'Dishwashing gel', category: 'Household', subcategory: 'Cleaning', brand: 'Vim', price: 120, costPrice: 95, stockQuantity: 180, lowStockThreshold: 50, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200', images: [], status: 'active', featured: false, attributes: { weight: '750 ml' }, tags: ['cleaning', 'household'], createdAt: '2024-11-18T15:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
  { id: 'prod-30', sku: 'HOU-LIZ-001', name:'Lizol Floor Cleaner', description: 'Disinfectant floor cleaner', category: 'Household', subcategory: 'Cleaning', brand: 'Lizol', price: 195, costPrice: 160, stockQuantity: 145, lowStockThreshold: 40, imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=200', images: [], status: 'active', featured: false, attributes: { weight: '975 ml' }, tags: ['cleaning', 'disinfectant'], createdAt: '2024-11-18T15:00:00Z', updatedAt: '2024-12-19T14:20:00Z', createdBy: 'admin@platform.com' },
];

// --- Helper Functions ---

export function getStockStatus(product: Product): StockStatus {
  if (product.stockQuantity === 0) return 'out_of_stock';
  if (product.stockQuantity <= product.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

// --- API Functions ---

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Product[] }>('/merch/catalog/skus');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Category[] }>('/merch/catalog/collections');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function fetchAttributes(): Promise<ProductAttribute[]> {
  // TODO: Implement backend endpoint for product attributes
  return [];
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await apiRequest<{ success: boolean; data: Product }>('/merch/catalog/skus', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  const response = await apiRequest<{ success: boolean; data: Product }>(`/merch/catalog/skus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/merch/catalog/skus/${id}`, {
    method: 'DELETE',
  });
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await apiRequest<{ success: boolean; data: Category }>('/merch/catalog/collections', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function bulkUpdateProducts(ids: string[], updates: Partial<Product>): Promise<number> {
  // TODO: Implement backend endpoint for bulk update
  throw new Error('Not implemented');
}

export async function bulkImportProducts(csvData: string): Promise<BulkImportResult> {
  // TODO: Implement backend endpoint for bulk import
  throw new Error('Not implemented');
}

export async function exportProducts(format: 'csv' | 'excel'): Promise<string> {
  // TODO: Implement backend endpoint for export
  throw new Error('Not implemented');
}
