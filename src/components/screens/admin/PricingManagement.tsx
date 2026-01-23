import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SurgeRule,
  DiscountCampaign,
  Coupon,
  FlashSale,
  Bundle,
  PricingStats,
  fetchSurgeRules,
  fetchDiscountCampaigns,
  fetchCoupons,
  fetchFlashSales,
  fetchBundles,
  fetchPricingStats,
  deleteSurgeRule,
  deleteCoupon,
  updateCouponStatus,
} from './pricingApi';
import { AddSurgeRuleModal } from './modals/AddSurgeRuleModal';
import { AddCouponModal } from './modals/AddCouponModal';
import { toast } from 'sonner@2.0.3';
import {
  Tag,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Ticket,
  Zap,
  Package,
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  Pause,
  Play,
  DollarSign,
  Percent,
  Clock,
  MapPin,
  Calendar,
  Users,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Target,
  Gift,
  Sparkles,
} from 'lucide-react';

export function PricingManagement() {
  const [surgeRules, setSurgeRules] = useState<SurgeRule[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCampaign[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [stats, setStats] = useState<PricingStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addSurgeOpen, setAddSurgeOpen] = useState(false);
  const [addCouponOpen, setAddCouponOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [surgeData, discountData, couponData, flashSaleData, bundleData, statsData] = await Promise.all([
        fetchSurgeRules(),
        fetchDiscountCampaigns(),
        fetchCoupons(),
        fetchFlashSales(),
        fetchBundles(),
        fetchPricingStats(),
      ]);
      setSurgeRules(surgeData);
      setDiscounts(discountData);
      setCoupons(couponData);
      setFlashSales(flashSaleData);
      setBundles(bundleData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurgeRule = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteSurgeRule(id);
      toast.success('Surge rule deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete surge rule');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    const newStatus = coupon.status === 'active' ? 'paused' : 'active';
    try {
      await updateCouponStatus(coupon.id, newStatus);
      toast.success(`Coupon ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard`);
  };

  const getSurgeTypeIcon = (type: string) => {
    switch (type) {
      case 'time_based': return <Clock size={14} />;
      case 'zone_based': return <MapPin size={14} />;
      case 'event_based': return <Calendar size={14} />;
      case 'demand_based': return <TrendingUp size={14} />;
      default: return <TrendingUp size={14} />;
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return '%';
      case 'flat': return '₹';
      case 'free_delivery': return 'FREE';
      case 'buy_x_get_y': return 'BOGO';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Pricing & Promotions</h1>
          <p className="text-[#71717a] text-sm">Manage pricing rules, discounts, and promotional campaigns</p>
        </div>
        <Button size="sm" onClick={loadData} variant="outline">
          <RefreshCw size={14} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#71717a] uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-[#18181b] mt-1">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 12.5% vs last month</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#71717a] uppercase tracking-wider">Discounts Given</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">₹{(stats.totalDiscount / 1000).toFixed(0)}K</p>
                <p className="text-xs text-[#71717a] mt-1">{((stats.totalDiscount / stats.totalRevenue) * 100).toFixed(1)}% of revenue</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Percent className="text-amber-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#71717a] uppercase tracking-wider">Active Coupons</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.activeCoupons}</p>
                <p className="text-xs text-[#71717a] mt-1">{stats.couponRedemptionRate}% redemption rate</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Ticket className="text-purple-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#71717a] uppercase tracking-wider">Avg Order Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">₹{stats.avgOrderValue}</p>
                <p className="text-xs text-emerald-600 mt-1">↑ 8.3% improvement</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Target className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="surge" className="space-y-4">
        <TabsList>
          <TabsTrigger value="surge">
            <TrendingUp size={14} className="mr-1.5" /> Surge Pricing
          </TabsTrigger>
          <TabsTrigger value="discounts">
            <Tag size={14} className="mr-1.5" /> Discounts
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <Ticket size={14} className="mr-1.5" /> Coupons
          </TabsTrigger>
          <TabsTrigger value="flash">
            <Zap size={14} className="mr-1.5" /> Flash Sales
          </TabsTrigger>
          <TabsTrigger value="bundles">
            <Package size={14} className="mr-1.5" /> Bundles
          </TabsTrigger>
        </TabsList>

        {/* Surge Pricing Tab */}
        <TabsContent value="surge">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Dynamic Pricing Rules</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Automatic price adjustments based on time, demand, and location</p>
              </div>
              <Button size="sm" onClick={() => setAddSurgeOpen(true)}>
                <Plus size={14} className="mr-1.5" /> Add Surge Rule
              </Button>
            </div>

            <div className="overflow-auto max-h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-[#f9fafb] z-10">
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Multiplier</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Categories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgeRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-[#71717a]">
                        No surge rules configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    surgeRules.map((rule) => (
                      <TableRow key={rule.id} className="hover:bg-[#fcfcfc]">
                        <TableCell>
                          <div>
                            <div className="font-medium text-[#18181b]">{rule.name}</div>
                            <div className="text-xs text-[#71717a]">{rule.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5">
                            {getSurgeTypeIcon(rule.type)}
                            <span className="capitalize">{rule.type.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            {rule.multiplier}× Price
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {rule.type === 'time_based' && rule.conditions.timeSlots && (
                              <div className="space-y-1">
                                {rule.conditions.timeSlots.map((slot, i) => (
                                  <div key={i} className="text-[#52525b]">
                                    {slot.start} - {slot.end}
                                  </div>
                                ))}
                              </div>
                            )}
                            {rule.type === 'zone_based' && rule.conditions.zones && (
                              <div className="text-[#52525b]">{rule.conditions.zones.join(', ')}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-[#52525b]">
                            {rule.applicableCategories.length > 0 ? rule.applicableCategories.join(', ') : 'All'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rule.status === 'active' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>}
                          {rule.status === 'scheduled' && <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>}
                          {rule.status === 'inactive' && <Badge variant="secondary">Inactive</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" /> Edit Rule
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy size={14} className="mr-2" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteSurgeRule(rule.id, rule.name)}
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
          </div>
        </TabsContent>

        {/* Discounts Tab */}
        <TabsContent value="discounts">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Discount Campaigns</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Category-wide and product-specific discount offers</p>
              </div>
              <Button size="sm" onClick={() => toast.info('Add discount feature')}>
                <Plus size={14} className="mr-1.5" /> Create Campaign
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {discounts.map((discount) => {
                  const usagePercent = discount.usageLimit 
                    ? (discount.usageCount / discount.usageLimit) * 100 
                    : 0;
                  
                  return (
                    <div key={discount.id} className="border border-[#e4e4e7] rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-[#18181b]">{discount.name}</h4>
                            {discount.status === 'active' && <Badge className="bg-emerald-500">Active</Badge>}
                            {discount.status === 'scheduled' && <Badge className="bg-blue-500">Scheduled</Badge>}
                            {discount.status === 'expired' && <Badge variant="secondary">Expired</Badge>}
                            {discount.stackable && <Badge variant="outline">Stackable</Badge>}
                          </div>
                          <p className="text-sm text-[#71717a] mb-3">{discount.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-[#52525b]">
                              <Tag size={14} className="text-[#a1a1aa]" />
                              <span>
                                {discount.discountType === 'percentage' && `${discount.discountValue}% OFF`}
                                {discount.discountType === 'flat' && `₹${discount.discountValue} OFF`}
                                {discount.discountType === 'buy_x_get_y' && 'Buy 2 Get 1'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#52525b]">
                              <DollarSign size={14} className="text-[#a1a1aa]" />
                              <span>Min: ₹{discount.minOrderValue}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#52525b]">
                              <Users size={14} className="text-[#a1a1aa]" />
                              <span>{discount.usageCount.toLocaleString()} uses</span>
                            </div>
                          </div>

                          {discount.usageLimit && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-[#71717a] mb-1">
                                <span>Usage: {discount.usageCount} / {discount.usageLimit}</span>
                                <span>{usagePercent.toFixed(0)}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 text-right">
                          <div className="text-3xl font-bold text-[#e11d48] mb-1">
                            {discount.discountType === 'percentage' && `${discount.discountValue}%`}
                            {discount.discountType === 'flat' && `₹${discount.discountValue}`}
                            {discount.discountType === 'buy_x_get_y' && 'BOGO'}
                          </div>
                          <div className="text-xs text-[#71717a]">
                            {new Date(discount.startDate).toLocaleDateString()} - {new Date(discount.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Coupon Codes</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Generate and manage discount coupons for customers</p>
              </div>
              <Button size="sm" onClick={() => setAddCouponOpen(true)}>
                <Plus size={14} className="mr-1.5" /> Create Coupon
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((coupon) => {
                  const usagePercent = coupon.usageLimit 
                    ? (coupon.usageCount / coupon.usageLimit) * 100 
                    : 0;
                  
                  return (
                    <div key={coupon.id} className="border border-[#e4e4e7] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles size={16} />
                            <span className="text-xs opacity-90">COUPON CODE</span>
                          </div>
                          {coupon.status === 'active' && <Badge className="bg-white/20 text-white border-white/30">Active</Badge>}
                          {coupon.status === 'paused' && <Badge className="bg-amber-500/20 text-white border-amber-300/30">Paused</Badge>}
                          {coupon.status === 'expired' && <Badge variant="secondary">Expired</Badge>}
                        </div>
                        <div className="text-2xl font-bold font-mono tracking-wider mb-1">{coupon.code}</div>
                        <div className="text-sm opacity-90">{coupon.name}</div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            {coupon.discountType === 'percentage' && (
                              <div className="text-2xl font-bold text-purple-600">{coupon.discountValue}% OFF</div>
                            )}
                            {coupon.discountType === 'flat' && (
                              <div className="text-2xl font-bold text-purple-600">₹{coupon.discountValue} OFF</div>
                            )}
                            {coupon.discountType === 'free_delivery' && (
                              <div className="text-xl font-bold text-purple-600">FREE DELIVERY</div>
                            )}
                            {coupon.minOrderValue > 0 && (
                              <div className="text-xs text-[#71717a] mt-1">Min order: ₹{coupon.minOrderValue}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-[#18181b]">{coupon.usageCount.toLocaleString()}</div>
                            <div className="text-xs text-[#71717a]">uses</div>
                          </div>
                        </div>

                        {coupon.usageLimit && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-[#71717a] mb-1">
                              <span>Redemptions</span>
                              <span>{usagePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-[#e4e4e7] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 transition-all"
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleCopyCoupon(coupon.code)}
                          >
                            <Copy size={12} className="mr-1.5" /> Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCoupon(coupon)}
                            disabled={coupon.status === 'expired'}
                          >
                            {coupon.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical size={12} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyCoupon(coupon.code)}>
                                <Copy size={14} className="mr-2" /> Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                className="text-rose-600"
                              >
                                <Trash2 size={14} className="mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Flash Sales Tab */}
        <TabsContent value="flash">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Flash Sales</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Limited-time deals on specific products</p>
              </div>
              <Button size="sm" onClick={() => toast.info('Create flash sale')}>
                <Plus size={14} className="mr-1.5" /> Create Flash Sale
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {flashSales.map((sale) => (
                <div key={sale.id} className="border-2 border-[#e11d48] rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#e11d48] to-[#be123c] p-4 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-bold mb-1">{sale.name}</div>
                        <p className="text-sm opacity-90">{sale.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} />
                            <span>{new Date(sale.startDate).toLocaleString()} - {new Date(sale.endDate).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {sale.status === 'active' && <Badge className="bg-white/20 text-white border-white/30">⚡ LIVE NOW</Badge>}
                        {sale.status === 'upcoming' && <Badge className="bg-blue-500/20 text-white border-blue-300/30">Upcoming</Badge>}
                        {sale.status === 'ended' && <Badge variant="secondary">Ended</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      {sale.products.map((product, idx) => {
                        const soldPercent = (product.soldCount / product.stockLimit) * 100;
                        return (
                          <div key={idx} className="border border-[#e4e4e7] rounded-lg p-3">
                            <div className="font-medium text-sm text-[#18181b] mb-2">{product.name}</div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-lg font-bold text-[#e11d48]">₹{product.salePrice}</span>
                              <span className="text-xs text-[#a1a1aa] line-through">₹{product.originalPrice}</span>
                              <Badge className="bg-[#e11d48] text-xs">{product.discount}% OFF</Badge>
                            </div>
                            <div className="text-xs text-[#71717a] mb-1">
                              Sold: {product.soldCount} / {product.stockLimit}
                            </div>
                            <div className="w-full h-1.5 bg-[#e4e4e7] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#e11d48] transition-all"
                                style={{ width: `${Math.min(soldPercent, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-[#18181b]">Product Bundles</h3>
                <p className="text-xs text-[#71717a] mt-0.5">Curated product combos at discounted prices</p>
              </div>
              <Button size="sm" onClick={() => toast.info('Create bundle')}>
                <Plus size={14} className="mr-1.5" /> Create Bundle
              </Button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bundles.map((bundle) => (
                  <div key={bundle.id} className="border border-[#e4e4e7] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    {bundle.imageUrl && (
                      <div className="h-48 bg-[#f4f4f5] overflow-hidden">
                        <img src={bundle.imageUrl} alt={bundle.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-[#18181b]">{bundle.name}</h4>
                        {bundle.featured && <Star size={16} className="text-amber-500 fill-amber-500" />}
                      </div>
                      <p className="text-sm text-[#71717a] mb-3">{bundle.description}</p>

                      <div className="space-y-1.5 mb-4">
                        {bundle.products.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-[#52525b]">{product.quantity}× {product.name}</span>
                            <span className="text-[#a1a1aa]">₹{product.price}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-xs text-[#71717a] line-through">₹{bundle.totalOriginalPrice}</div>
                          <div className="text-2xl font-bold text-emerald-600">₹{bundle.bundlePrice}</div>
                        </div>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-base px-3 py-1">
                          Save ₹{bundle.savings}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#71717a]">
                        <span>{bundle.soldCount} sold</span>
                        {bundle.stockLimit && <span>{bundle.stockLimit - bundle.soldCount} remaining</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddSurgeRuleModal
        open={addSurgeOpen}
        onOpenChange={setAddSurgeOpen}
        onSuccess={loadData}
      />

      <AddCouponModal
        open={addCouponOpen}
        onOpenChange={setAddCouponOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
