// --- Type Definitions ---

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  position: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'new' | 'premium' | 'inactive';
  impressions: number;
  clicks: number;
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
  publishedBy: string;
  isPublished: boolean;
  version: number;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: 'promotional' | 'transactional' | 'reminder' | 'update';
  deepLink?: string;
  imageUrl?: string;
  isActive: boolean;
  sentCount: number;
  openRate: number;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  position: number;
  isActive: boolean;
  productCount: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  deepLink: string;
  position: number;
  isActive: boolean;
  color: string;
}

export interface PromoCard {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  imageUrl: string;
  validUntil: string;
  code?: string;
  isActive: boolean;
  redemptions: number;
}

export interface AppSettings {
  appVersion: string;
  minAppVersion: string;
  forceUpdate: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  enableReferral: boolean;
  enableWallet: boolean;
  enableChat: boolean;
  maxCartItems: number;
}

export interface DeepLink {
  id: string;
  name: string;
  scheme: string;
  path: string;
  params: Record<string, string>;
  isActive: boolean;
  usageCount: number;
}

export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  position: number;
  isActive: boolean;
}

export interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  position: number;
  isActive: boolean;
  badge?: string;
}

// --- Mock Data ---

const MOCK_BANNERS: Banner[] = [
  {
    id: 'BAN-001',
    title: 'Flash Sale: Up to 50% Off',
    description: 'Get amazing discounts on groceries and essentials',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    ctaText: 'Shop Now',
    ctaLink: '/deals',
    position: 1,
    isActive: true,
    startDate: '2024-12-20T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    targetAudience: 'all',
    impressions: 45678,
    clicks: 3421,
  },
  {
    id: 'BAN-002',
    title: 'Free Delivery on First Order',
    description: 'New users get free delivery with no minimum order',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800',
    ctaText: 'Order Now',
    ctaLink: '/products',
    position: 2,
    isActive: true,
    startDate: '2024-12-15T00:00:00Z',
    endDate: '2025-01-15T23:59:59Z',
    targetAudience: 'new',
    impressions: 12345,
    clicks: 2134,
  },
  {
    id: 'BAN-003',
    title: 'Premium Membership - Save More',
    description: 'Join Premium and get exclusive discounts',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800',
    ctaText: 'Learn More',
    ctaLink: '/premium',
    position: 3,
    isActive: false,
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-20T23:59:59Z',
    targetAudience: 'inactive',
    impressions: 8901,
    clicks: 567,
  },
];

const MOCK_CONTENT_PAGES: ContentPage[] = [
  {
    id: 'PAGE-001',
    slug: 'about-us',
    title: 'About Us',
    content: '# About QuickCommerce\n\nWe are India\'s fastest grocery delivery service...',
    lastUpdated: '2024-12-15T10:30:00Z',
    publishedBy: 'Admin User',
    isPublished: true,
    version: 3,
  },
  {
    id: 'PAGE-002',
    slug: 'terms-of-service',
    title: 'Terms of Service',
    content: '# Terms and Conditions\n\n1. Acceptance of Terms...',
    lastUpdated: '2024-12-10T14:20:00Z',
    publishedBy: 'Legal Team',
    isPublished: true,
    version: 5,
  },
  {
    id: 'PAGE-003',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: '# Privacy Policy\n\nYour privacy is important to us...',
    lastUpdated: '2024-12-05T09:15:00Z',
    publishedBy: 'Legal Team',
    isPublished: true,
    version: 4,
  },
  {
    id: 'PAGE-004',
    slug: 'faq',
    title: 'Frequently Asked Questions',
    content: '# FAQ\n\n## How fast is delivery?\nWe deliver in 10-15 minutes...',
    lastUpdated: '2024-12-18T16:45:00Z',
    publishedBy: 'Support Team',
    isPublished: true,
    version: 8,
  },
];

const MOCK_NOTIFICATIONS: NotificationTemplate[] = [
  {
    id: 'NOT-001',
    name: 'Order Delivered',
    title: 'Your order has been delivered! 🎉',
    body: 'Thank you for ordering with us. Enjoy your items!',
    category: 'transactional',
    deepLink: 'app://orders/[orderId]',
    isActive: true,
    sentCount: 15847,
    openRate: 78.5,
  },
  {
    id: 'NOT-002',
    name: 'Flash Sale Alert',
    title: 'Flash Sale Live Now! ⚡',
    body: 'Get up to 50% off on groceries. Limited time only!',
    category: 'promotional',
    deepLink: 'app://deals',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    isActive: true,
    sentCount: 45678,
    openRate: 45.2,
  },
  {
    id: 'NOT-003',
    name: 'Cart Reminder',
    title: 'Complete your order 🛒',
    body: 'You have items in your cart. Order now before they run out!',
    category: 'reminder',
    deepLink: 'app://cart',
    isActive: true,
    sentCount: 8901,
    openRate: 32.1,
  },
  {
    id: 'NOT-004',
    name: 'App Update Available',
    title: 'New version available 🚀',
    body: 'Update now to enjoy new features and improvements',
    category: 'update',
    deepLink: 'app://update',
    isActive: false,
    sentCount: 12345,
    openRate: 65.8,
  },
];

const MOCK_FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 'CAT-001',
    name: 'Fresh Vegetables',
    slug: 'vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
    position: 1,
    isActive: true,
    productCount: 245,
  },
  {
    id: 'CAT-002',
    name: 'Dairy & Eggs',
    slug: 'dairy',
    imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
    position: 2,
    isActive: true,
    productCount: 156,
  },
  {
    id: 'CAT-003',
    name: 'Snacks',
    slug: 'snacks',
    imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
    position: 3,
    isActive: true,
    productCount: 389,
  },
  {
    id: 'CAT-004',
    name: 'Beverages',
    slug: 'beverages',
    imageUrl: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400',
    position: 4,
    isActive: true,
    productCount: 178,
  },
];

const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { id: 'QA-001', label: 'Reorder', icon: 'RefreshCw', action: 'reorder', deepLink: 'app://reorder', position: 1, isActive: true, color: '#10b981' },
  { id: 'QA-002', label: 'Offers', icon: 'Tag', action: 'offers', deepLink: 'app://offers', position: 2, isActive: true, color: '#f59e0b' },
  { id: 'QA-003', label: 'Wallet', icon: 'Wallet', action: 'wallet', deepLink: 'app://wallet', position: 3, isActive: true, color: '#8b5cf6' },
  { id: 'QA-004', label: 'Refer', icon: 'Gift', action: 'refer', deepLink: 'app://refer', position: 4, isActive: true, color: '#ec4899' },
];

const MOCK_PROMO_CARDS: PromoCard[] = [
  {
    id: 'PROMO-001',
    title: 'First Order Free',
    subtitle: 'No delivery charges',
    discount: '₹50 OFF',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    validUntil: '2025-01-31T23:59:59Z',
    code: 'FIRST50',
    isActive: true,
    redemptions: 1234,
  },
  {
    id: 'PROMO-002',
    title: 'Weekend Special',
    subtitle: 'Saturday & Sunday',
    discount: '30% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
    validUntil: '2024-12-31T23:59:59Z',
    code: 'WEEKEND30',
    isActive: true,
    redemptions: 567,
  },
];

const MOCK_APP_SETTINGS: AppSettings = {
  appVersion: '2.5.0',
  minAppVersion: '2.0.0',
  forceUpdate: false,
  maintenanceMode: false,
  maintenanceMessage: 'We are upgrading our systems. Please check back in 2 hours.',
  enableReferral: true,
  enableWallet: true,
  enableChat: true,
  maxCartItems: 50,
};

const MOCK_DEEP_LINKS: DeepLink[] = [
  {
    id: 'DL-001',
    name: 'Product Details',
    scheme: 'quickcommerce://',
    path: '/product/:productId',
    params: { productId: 'PRD-123' },
    isActive: true,
    usageCount: 5678,
  },
  {
    id: 'DL-002',
    name: 'Category View',
    scheme: 'quickcommerce://',
    path: '/category/:categorySlug',
    params: { categorySlug: 'vegetables' },
    isActive: true,
    usageCount: 3421,
  },
  {
    id: 'DL-003',
    name: 'Offer Details',
    scheme: 'quickcommerce://',
    path: '/offer/:offerId',
    params: { offerId: 'OFF-456' },
    isActive: true,
    usageCount: 2134,
  },
];

const MOCK_ONBOARDING: OnboardingScreen[] = [
  {
    id: 'ONB-001',
    title: 'Welcome to QuickCommerce',
    description: 'Get groceries delivered in 10 minutes',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    position: 1,
    isActive: true,
  },
  {
    id: 'ONB-002',
    title: 'Browse 10,000+ Products',
    description: 'From fresh produce to household essentials',
    imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400',
    position: 2,
    isActive: true,
  },
  {
    id: 'ONB-003',
    title: 'Track in Real-Time',
    description: 'Know exactly when your order will arrive',
    imageUrl: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400',
    position: 3,
    isActive: true,
  },
];

const MOCK_BOTTOM_NAV: BottomNavItem[] = [
  { id: 'NAV-001', label: 'Home', icon: 'Home', route: '/home', position: 1, isActive: true },
  { id: 'NAV-002', label: 'Categories', icon: 'Grid', route: '/categories', position: 2, isActive: true },
  { id: 'NAV-003', label: 'Cart', icon: 'ShoppingCart', route: '/cart', position: 3, isActive: true, badge: '3' },
  { id: 'NAV-004', label: 'Orders', icon: 'Package', route: '/orders', position: 4, isActive: true },
  { id: 'NAV-005', label: 'Profile', icon: 'User', route: '/profile', position: 5, isActive: true },
];

// --- API Functions ---

export async function fetchBanners(): Promise<Banner[]> {
  // TODO: Implement backend endpoint for banners
  return [];
}

export async function createBanner(banner: Partial<Banner>): Promise<Banner> {
  // TODO: Implement backend endpoint for banners
  throw new Error('Not implemented');
}

export async function updateBanner(id: string, banner: Partial<Banner>): Promise<Banner> {
  // TODO: Implement backend endpoint for banners
  throw new Error('Not implemented');
}

export async function deleteBanner(id: string): Promise<{ success: boolean }> {
  // TODO: Implement backend endpoint for banners
  throw new Error('Not implemented');
}

export async function fetchContentPages(): Promise<ContentPage[]> {
  // TODO: Implement backend endpoint for content pages
  return [];
}

export async function updateContentPage(id: string, page: Partial<ContentPage>): Promise<ContentPage> {
  // TODO: Implement backend endpoint for content pages
  throw new Error('Not implemented');
}

export async function fetchNotificationTemplates(): Promise<NotificationTemplate[]> {
  // TODO: Implement backend endpoint for notification templates
  return [];
}

export async function createNotificationTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
  // TODO: Implement backend endpoint for notification templates
  throw new Error('Not implemented');
}

export async function sendNotification(templateId: string, audience: string): Promise<{ sent: number }> {
  // TODO: Implement backend endpoint for sending notifications
  throw new Error('Not implemented');
}

export async function fetchFeaturedCategories(): Promise<FeaturedCategory[]> {
  // TODO: Implement backend endpoint for featured categories
  return [];
}

export async function updateFeaturedCategory(id: string, category: Partial<FeaturedCategory>): Promise<FeaturedCategory> {
  // TODO: Implement backend endpoint for featured categories
  throw new Error('Not implemented');
}

export async function fetchQuickActions(): Promise<QuickAction[]> {
  // TODO: Implement backend endpoint for quick actions
  return [];
}

export async function updateQuickAction(id: string, action: Partial<QuickAction>): Promise<QuickAction> {
  // TODO: Implement backend endpoint for quick actions
  throw new Error('Not implemented');
}

export async function fetchPromoCards(): Promise<PromoCard[]> {
  // TODO: Implement backend endpoint for promo cards
  return [];
}

export async function createPromoCard(card: Partial<PromoCard>): Promise<PromoCard> {
  // TODO: Implement backend endpoint for promo cards
  throw new Error('Not implemented');
}

import { apiRequest } from '@/api/apiClient';

export async function fetchAppSettings(): Promise<AppSettings> {
  // TODO: Implement backend endpoint for app settings
  return {
    appVersion: '1.0.0',
    minAppVersion: '1.0.0',
    forceUpdate: false,
    maintenanceMode: false,
    maintenanceMessage: '',
    enableReferral: true,
    enableWallet: true,
    enableChat: true,
    maxCartItems: 50,
  };
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  // TODO: Implement backend endpoint for app settings
  return await fetchAppSettings();
}

export async function fetchDeepLinks(): Promise<DeepLink[]> {
  // TODO: Implement backend endpoint for deep links
  return [];
}

export async function createDeepLink(link: Partial<DeepLink>): Promise<DeepLink> {
  // TODO: Implement backend endpoint for deep links
  throw new Error('Not implemented');
}

export async function fetchOnboardingScreens(): Promise<OnboardingScreen[]> {
  // TODO: Implement backend endpoint for onboarding screens
  return [];
}

export async function updateOnboardingScreen(id: string, screen: Partial<OnboardingScreen>): Promise<OnboardingScreen> {
  // TODO: Implement backend endpoint for onboarding screens
  throw new Error('Not implemented');
}

export async function fetchBottomNavItems(): Promise<BottomNavItem[]> {
  // TODO: Implement backend endpoint for bottom nav items
  return [];
}

export async function updateBottomNavItem(id: string, item: Partial<BottomNavItem>): Promise<BottomNavItem> {
  // TODO: Implement backend endpoint for bottom nav items
  throw new Error('Not implemented');
}
