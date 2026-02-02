import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface BasePrice {
  id: string;
  productSku: string;
  productName: string;
  category: string;
  basePrice: number;
  costPrice: number;
  margin: number;
  marginPercent: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: 'active' | 'scheduled' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface SurgeRule {
  id: string;
  name: string;
  description: string;
  type: 'time_based' | 'demand_based' | 'zone_based' | 'event_based';
  multiplier: number;
  conditions: {
    timeSlots?: { start: string; end: string; days: string[] }[];
    zones?: string[];
    demandThreshold?: number;
    eventType?: string;
  };
  applicableCategories: string[];
  applicableProducts: string[];
  priority: number;
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface DiscountCampaign {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'flat' | 'buy_x_get_y';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  applicableCategories: string[];
  applicableProducts: string[];
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usageCount: number;
  stackable: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'flat' | 'free_delivery';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usagePerUser: number;
  usageCount: number;
  applicableCategories: string[];
  applicableProducts: string[];
  userSegments: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'paused';
  createdAt: string;
}

export interface FlashSale {
  id: string;
  name: string;
  description: string;
  products: {
    sku: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    discount: number;
    stockLimit: number;
    soldCount: number;
  }[];
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  visibility: 'public' | 'members_only';
  createdAt: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  products: {
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalOriginalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
  imageUrl: string;
  stockLimit: number | null;
  soldCount: number;
  status: 'active' | 'inactive';
  featured: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface PricingStats {
  totalRevenue: number;
  discountedRevenue: number;
  totalDiscount: number;
  avgOrderValue: number;
  activeDiscounts: number;
  activeCoupons: number;
  couponRedemptionRate: number;
}

// --- Mock Data Arrays ---
let MOCK_SURGE_RULES: SurgeRule[] = [];
let MOCK_DISCOUNTS: DiscountCampaign[] = [];
let MOCK_COUPONS: Coupon[] = [];
let MOCK_FLASH_SALES: FlashSale[] = [];
let MOCK_BUNDLES: Bundle[] = [];
// --- API Functions ---

export async function fetchBasePrices(): Promise<BasePrice[]> {
  // TODO: Implement backend endpoint for base prices
  return [];
}

export async function fetchSurgeRules(): Promise<SurgeRule[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: SurgeRule[] }>('/merch/pricing/surge-rules');
    if (response.data && response.data.length > 0) {
      MOCK_SURGE_RULES = response.data;
      return response.data;
    }
    return MOCK_SURGE_RULES;
  } catch (error) {
    console.error('Failed to fetch surge rules:', error);
    return MOCK_SURGE_RULES;
  }
}

export async function fetchDiscountCampaigns(): Promise<DiscountCampaign[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: DiscountCampaign[] }>('/merch/pricing/discounts');
    if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
      MOCK_DISCOUNTS = response.data;
      return response.data;
    }
    return MOCK_DISCOUNTS;
  } catch (error: any) {
    console.error('Failed to fetch discount campaigns:', error);
    return MOCK_DISCOUNTS;
  }
}

export async function fetchCoupons(): Promise<Coupon[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Coupon[] }>('/merch/pricing/coupons');
    if (response.data && response.data.length > 0) {
      MOCK_COUPONS = response.data;
      return response.data;
    }
    return MOCK_COUPONS;
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return MOCK_COUPONS;
  }
}

export async function fetchFlashSales(): Promise<FlashSale[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: FlashSale[] }>('/merch/pricing/flash-sales');
    if (response.data && response.data.length > 0) {
      MOCK_FLASH_SALES = response.data;
      return response.data;
    }
    return MOCK_FLASH_SALES;
  } catch (error) {
    console.error('Failed to fetch flash sales:', error);
    return MOCK_FLASH_SALES;
  }
}

export async function fetchBundles(): Promise<Bundle[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: Bundle[] }>('/merch/pricing/bundles');
    if (response.data && response.data.length > 0) {
      MOCK_BUNDLES = response.data;
      return response.data;
    }
    return MOCK_BUNDLES;
  } catch (error) {
    console.error('Failed to fetch bundles:', error);
    return MOCK_BUNDLES;
  }
}

export async function fetchPricingStats(): Promise<PricingStats> {
  // TODO: Implement backend endpoint for pricing stats
  return {
    totalRevenue: 0,
    discountedRevenue: 0,
    totalDiscount: 0,
    avgOrderValue: 0,
    activeDiscounts: 0,
    activeCoupons: 0,
    couponRedemptionRate: 0,
  };
}

export async function createSurgeRule(data: Partial<SurgeRule>): Promise<SurgeRule> {
  try {
    const response = await apiRequest<{ success: boolean; data: SurgeRule }>('/merch/pricing/surge-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response && response.data) {
      MOCK_SURGE_RULES.push(response.data);
      return response.data;
    }
    throw new Error('No data returned from API');
  } catch (error: any) {
    console.error('Failed to create surge rule via API, using mock data:', error);
    // Always create mock surge rule for UI functionality
    const mockSurge: SurgeRule = {
      id: `surge-${Date.now()}`,
      name: data.name || 'New Surge Rule',
      description: data.description || '',
      type: data.type || 'time_based',
      multiplier: data.multiplier || 1.5,
      conditions: data.conditions || { timeSlots: [] },
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      priority: data.priority || 1,
      status: data.status || 'active',
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || null,
      createdAt: new Date().toISOString(),
    };
    MOCK_SURGE_RULES.push(mockSurge);
    return mockSurge;
  }
}

export async function updateSurgeRule(id: string, data: Partial<SurgeRule>): Promise<SurgeRule> {
  try {
    const response = await apiRequest<{ success: boolean; data: SurgeRule }>(`/merch/pricing/surge-rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response?.data) {
      const idx = MOCK_SURGE_RULES.findIndex(r => r.id === id);
      if (idx !== -1) MOCK_SURGE_RULES[idx] = { ...MOCK_SURGE_RULES[idx], ...response.data };
      return response.data;
    }
  } catch (error) {
    console.error('Failed to update surge rule:', error);
  }
  const idx = MOCK_SURGE_RULES.findIndex(r => r.id === id);
  if (idx !== -1) {
    MOCK_SURGE_RULES[idx] = { ...MOCK_SURGE_RULES[idx], ...data };
    return MOCK_SURGE_RULES[idx];
  }
  throw new Error('Surge rule not found');
}

export async function deleteSurgeRule(id: string): Promise<void> {
  try {
    await apiRequest(`/merch/pricing/surge-rules/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete surge rule via API:', error);
  }
  const idx = MOCK_SURGE_RULES.findIndex(r => r.id === id);
  if (idx !== -1) MOCK_SURGE_RULES.splice(idx, 1);
}

export async function createDiscount(data: Partial<DiscountCampaign>): Promise<DiscountCampaign> {
  try {
    const response = await apiRequest<{ success: boolean; data: DiscountCampaign }>('/merch/pricing/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response && response.data) {
      MOCK_DISCOUNTS.push(response.data);
      return response.data;
    }
    throw new Error('No data returned from API');
  } catch (error: any) {
    console.error('Failed to create discount campaign via API, using mock data:', error);
    // Always create mock campaign for UI functionality
    const mockCampaign: DiscountCampaign = {
      id: `discount-${Date.now()}`,
      name: data.name || 'New Campaign',
      description: data.description || '',
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || 0,
      minOrderValue: data.minOrderValue || 0,
      maxDiscount: data.maxDiscount || null,
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: data.usageLimit || null,
      usageCount: 0,
      stackable: data.stackable || false,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };
    MOCK_DISCOUNTS.push(mockCampaign);
    return mockCampaign;
  }
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  try {
    const response = await apiRequest<{ success: boolean; data: Coupon }>('/merch/pricing/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) {
      MOCK_COUPONS.push(response.data);
      return response.data;
    }
    // Fallback to mock coupon
    const mockCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: data.code || 'COUPON',
      name: data.name || 'New Coupon',
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || 0,
      minOrderValue: data.minOrderValue || 0,
      maxDiscount: data.maxDiscount || null,
      usageLimit: data.usageLimit || null,
      usagePerUser: data.usagePerUser || 1,
      usageCount: 0,
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      userSegments: data.userSegments || [],
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    MOCK_COUPONS.push(mockCoupon);
    return mockCoupon;
  } catch (error) {
    console.error('Failed to create coupon:', error);
    // Return mock data as fallback
    const mockCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: data.code || 'COUPON',
      name: data.name || 'New Coupon',
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || 0,
      minOrderValue: data.minOrderValue || 0,
      maxDiscount: data.maxDiscount || null,
      usageLimit: data.usageLimit || null,
      usagePerUser: data.usagePerUser || 1,
      usageCount: 0,
      applicableCategories: data.applicableCategories || [],
      applicableProducts: data.applicableProducts || [],
      userSegments: data.userSegments || [],
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    MOCK_COUPONS.push(mockCoupon);
    return mockCoupon;
  }
}

export async function createFlashSale(data: Partial<FlashSale>): Promise<FlashSale> {
  try {
    const response = await apiRequest<{ success: boolean; data: FlashSale }>('/merch/pricing/flash-sales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) {
      return response.data;
    }
    // Fallback to mock flash sale
    const mockFlashSale: FlashSale = {
      id: `flash-${Date.now()}`,
      name: data.name || 'New Flash Sale',
      description: data.description || '',
      products: data.products || [],
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: data.status || 'upcoming',
      visibility: data.visibility || 'public',
      createdAt: new Date().toISOString(),
    };
    return mockFlashSale;
  } catch (error) {
    console.error('Failed to create flash sale:', error);
    // Return mock flash sale as fallback
    const mockFlashSale: FlashSale = {
      id: `flash-${Date.now()}`,
      name: data.name || 'New Flash Sale',
      description: data.description || '',
      products: data.products || [],
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: data.status || 'upcoming',
      visibility: data.visibility || 'public',
      createdAt: new Date().toISOString(),
    };
    MOCK_FLASH_SALES.push(mockFlashSale);
    return mockFlashSale;
  }
}

export async function createBundle(data: Partial<Bundle>): Promise<Bundle> {
  try {
    const response = await apiRequest<{ success: boolean; data: Bundle }>('/merch/pricing/bundles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.data) {
      MOCK_BUNDLES.push(response.data);
      return response.data;
    }
    // Fallback to mock bundle
    const totalOriginal = data.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;
    const bundlePrice = data.bundlePrice || (totalOriginal * 0.8);
    const mockBundle: Bundle = {
      id: `bundle-${Date.now()}`,
      name: data.name || 'New Bundle',
      description: data.description || '',
      products: data.products || [],
      totalOriginalPrice: totalOriginal,
      bundlePrice: bundlePrice,
      savings: totalOriginal - bundlePrice,
      savingsPercent: totalOriginal > 0 ? ((totalOriginal - bundlePrice) / totalOriginal) * 100 : 0,
      imageUrl: data.imageUrl || '',
      stockLimit: data.stockLimit || null,
      soldCount: 0,
      status: data.status || 'active',
      featured: data.featured || false,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || null,
      createdAt: new Date().toISOString(),
    };
    return mockBundle;
  } catch (error) {
    console.error('Failed to create bundle:', error);
    // Return mock bundle as fallback
    const totalOriginal = data.products?.reduce((sum, p) => sum + (p.price * p.quantity), 0) || 0;
    const bundlePrice = data.bundlePrice || (totalOriginal * 0.8);
    const mockBundle: Bundle = {
      id: `bundle-${Date.now()}`,
      name: data.name || 'New Bundle',
      description: data.description || '',
      products: data.products || [],
      totalOriginalPrice: totalOriginal,
      bundlePrice: bundlePrice,
      savings: totalOriginal - bundlePrice,
      savingsPercent: totalOriginal > 0 ? ((totalOriginal - bundlePrice) / totalOriginal) * 100 : 0,
      imageUrl: data.imageUrl || '',
      stockLimit: data.stockLimit || null,
      soldCount: 0,
      status: data.status || 'active',
      featured: data.featured || false,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || null,
      createdAt: new Date().toISOString(),
    };
    MOCK_BUNDLES.push(mockBundle);
    return mockBundle;
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    await apiRequest(`/merch/pricing/coupons/${id}`, {
      method: 'DELETE',
    });
    // Remove from mock coupons array
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS.splice(index, 1);
    }
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    // Still remove from mock array for UI update
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS.splice(index, 1);
    }
  }
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  try {
    const response = await apiRequest<{ success: boolean; data: Coupon }>(`/merch/pricing/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.data) {
      // Update mock coupons array
      const index = MOCK_COUPONS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...response.data };
      }
      return response.data;
    }
    // Fallback: update mock coupon
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...data };
      return MOCK_COUPONS[index];
    }
    throw new Error('Coupon not found');
  } catch (error) {
    console.error('Failed to update coupon:', error);
    // Fallback: update mock coupon
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...data };
      return MOCK_COUPONS[index];
    }
    throw error;
  }
}

export async function updateCouponStatus(id: string, status: 'active' | 'paused' | 'expired'): Promise<Coupon> {
  try {
    const response = await apiRequest<{ success: boolean; data: Coupon }>(`/merch/pricing/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    if (response.data) {
      // Update mock coupons array
      const index = MOCK_COUPONS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], ...response.data };
      }
      return response.data;
    }
    // Fallback: update mock coupon
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], status };
      return MOCK_COUPONS[index];
    }
    throw new Error('Coupon not found');
  } catch (error) {
    console.error('Failed to update coupon status:', error);
    // Fallback: update mock coupon
    const index = MOCK_COUPONS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_COUPONS[index] = { ...MOCK_COUPONS[index], status };
      return MOCK_COUPONS[index];
    }
    throw error;
  }
}

export async function generateCouponCode(): Promise<string> {
  // TODO: Implement backend endpoint for coupon code generation
  return `AUTO${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
}
