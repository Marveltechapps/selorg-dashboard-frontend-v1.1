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

// --- API Functions ---

export async function fetchBasePrices(): Promise<BasePrice[]> {
  // TODO: Implement backend endpoint for base prices
  return [];
}

export async function fetchSurgeRules(): Promise<SurgeRule[]> {
  try {
    const response = await apiRequest<{ success: boolean; data: SurgeRule[] }>('/merch/pricing/surge-rules');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch surge rules:', error);
    return [];
  }
}

export async function fetchDiscountCampaigns(): Promise<DiscountCampaign[]> {
  // TODO: Implement backend endpoint for discount campaigns
  return [];
}

export async function fetchCoupons(): Promise<Coupon[]> {
  // TODO: Implement backend endpoint for coupons
  return [];
}

export async function fetchFlashSales(): Promise<FlashSale[]> {
  // TODO: Implement backend endpoint for flash sales
  return [];
}

export async function fetchBundles(): Promise<Bundle[]> {
  // TODO: Implement backend endpoint for bundles
  return [];
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
  const response = await apiRequest<{ success: boolean; data: SurgeRule }>('/merch/pricing/surge-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateSurgeRule(id: string, data: Partial<SurgeRule>): Promise<SurgeRule> {
  const response = await apiRequest<{ success: boolean; data: SurgeRule }>(`/merch/pricing/surge-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteSurgeRule(id: string): Promise<void> {
  await apiRequest(`/merch/pricing/surge-rules/${id}`, {
    method: 'DELETE',
  });
}

export async function createDiscount(data: Partial<DiscountCampaign>): Promise<DiscountCampaign> {
  // TODO: Implement backend endpoint for discount campaigns
  throw new Error('Not implemented');
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  // TODO: Implement backend endpoint for coupons
  throw new Error('Not implemented');
}

export async function createFlashSale(data: Partial<FlashSale>): Promise<FlashSale> {
  // TODO: Implement backend endpoint for flash sales
  throw new Error('Not implemented');
}

export async function createBundle(data: Partial<Bundle>): Promise<Bundle> {
  // TODO: Implement backend endpoint for bundles
  throw new Error('Not implemented');
}

export async function deleteCoupon(id: string): Promise<void> {
  // TODO: Implement backend endpoint for coupons
  throw new Error('Not implemented');
}

export async function updateCouponStatus(id: string, status: 'active' | 'paused' | 'expired'): Promise<Coupon> {
  // TODO: Implement backend endpoint for coupons
  throw new Error('Not implemented');
}

export async function generateCouponCode(): Promise<string> {
  // TODO: Implement backend endpoint for coupon code generation
  return `AUTO${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
}
