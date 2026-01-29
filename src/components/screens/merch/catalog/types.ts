
export type Region = 'North America' | 'Europe (West)' | 'APAC';
export type CollectionStatus = 'Live' | 'Draft' | 'Scheduled' | 'Archived';
export type CollectionType = 'Seasonal' | 'Thematic' | 'Bundle/Combo' | 'Brand';
export type SKUVisibilityStatus = 'Visible' | 'Hidden';

export interface SKU {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  promoPrice?: number;
  stock: number;
  visibility: Record<Region, SKUVisibilityStatus>; // Simplified for now
  imageUrl?: string;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  type: CollectionType;
  status: CollectionStatus;
  tags: string[];
  skus: string[]; // SKU IDs
  imageUrl?: string;
  region: Region | 'Global';
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  owner: string;
}

export const MOCK_SKUS: SKU[] = [
  {
    id: 'sku-1',
    code: 'FRT-AVO-002',
    name: 'Organic Avocados (2pk)',
    category: 'Fresh Produce',
    brand: 'GreenValley',
    price: 5.99,
    stock: 120,
    visibility: {
      'North America': 'Visible',
      'Europe (West)': 'Hidden',
      'APAC': 'Hidden'
    },
    tags: ['Organic', 'Fresh'],
    imageUrl: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdm9jYWRvc3xlbnwxfHx8fDE3NjYwNTQ4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 'sku-2',
    code: 'SPI-PUM-001',
    name: 'Seasonal Pumpkin Spice',
    category: 'Pantry',
    brand: 'SpicyLife',
    price: 8.49,
    stock: 45,
    visibility: {
      'North America': 'Hidden',
      'Europe (West)': 'Hidden',
      'APAC': 'Hidden'
    },
    tags: ['Seasonal', 'Spice'],
    imageUrl: 'https://images.unsplash.com/photo-1569383893830-b73dc4a03af0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdW1wa2luJTIwc3BpY2V8ZW58MXx8fHwxNzY2MDU0ODcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 'sku-3',
    code: 'BEV-COF-009',
    name: 'Cold Brew Coffee (1L)',
    category: 'Beverages',
    brand: 'BrewMaster',
    price: 4.99,
    stock: 200,
    visibility: {
      'North America': 'Visible',
      'Europe (West)': 'Visible',
      'APAC': 'Visible'
    },
    tags: ['Beverage', 'Caffeine'],
    imageUrl: 'https://images.unsplash.com/photo-1601991056543-44a74b3731b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xkJTIwYnJldyUyMGNvZmZlZSUyMGJvdHRsZXxlbnwxfHx8fDE3NjYwNTQ4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: 'sku-4',
    code: 'SNK-CHP-012',
    name: 'Sea Salt Potato Chips',
    category: 'Snacks',
    brand: 'CrunchyTime',
    price: 2.99,
    stock: 500,
    visibility: {
      'North America': 'Visible',
      'Europe (West)': 'Visible',
      'APAC': 'Hidden'
    },
    tags: ['Snack', 'Salty'],
    imageUrl: 'https://images.unsplash.com/photo-1694101493190-acc6c4418ad7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG8lMjBjaGlwcyUyMGJhZ3xlbnwxfHx8fDE3NjYwNTM5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Summer BBQ Essentials',
    description: 'Everything you need for a perfect backyard BBQ.',
    type: 'Seasonal',
    status: 'Live',
    tags: ['BBQ', 'Summer', 'Outdoor'],
    skus: ['sku-1', 'sku-3', 'sku-4'],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjBmb29kfGVufDF8fHx8MTc2NjA1NDg3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    region: 'North America',
    updatedAt: '2023-06-15',
    owner: 'Sarah J.'
  },
  {
    id: 'col-2',
    name: 'Work From Home Snacks',
    description: 'Boost your productivity with these snacks.',
    type: 'Thematic',
    status: 'Live',
    tags: ['Snacks', 'WFH', 'Focus'],
    skus: ['sku-3', 'sku-4'],
    imageUrl: 'https://images.unsplash.com/photo-1558021984-73f968567797?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc25hY2tzJTIwZGVza3xlbnwxfHx8fDE3NjYwNTQ4NzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    region: 'Global',
    updatedAt: '2023-06-10',
    owner: 'Mike T.'
  },
  {
    id: 'col-3',
    name: 'Autumn Flavors',
    description: 'Get ready for fall with these warming treats.',
    type: 'Seasonal',
    status: 'Draft',
    tags: ['Autumn', 'Pumpkin'],
    skus: ['sku-2'],
    imageUrl: 'https://images.unsplash.com/photo-1634729609419-86f23a4079aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBsZWF2ZXMlMjBwdW1wa2lufGVufDF8fHx8MTc2NjA1NDg3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    region: 'North America',
    updatedAt: '2023-06-18',
    owner: 'Sarah J.'
  }
];
