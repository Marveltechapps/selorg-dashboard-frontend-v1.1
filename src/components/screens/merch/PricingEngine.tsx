import React, { useState, useEffect } from 'react';
import { Tag, TrendingUp, AlertCircle, Edit2, History, ChevronRight, BarChart3, Filter, Loader2 } from 'lucide-react';
import { pricingApi } from './pricing/pricingApi';
import { PriceRuleWizard } from './pricing/PriceRuleWizard';
import { SurgePricingDrawer } from './pricing/SurgePricingDrawer';
import { MarginRiskView } from './pricing/MarginRiskView';
import { PendingUpdatesView } from './pricing/PendingUpdatesView';
import { SKUPriceDetailDrawer } from './pricing/SKUPriceDetailDrawer';
import { BulkPriceEditModal } from './pricing/BulkPriceEditModal';
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "../../ui/dropdown-menu";

export function PricingEngine({ searchQuery = "" }: { searchQuery?: string }) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSurgeOpen, setIsSurgeOpen] = useState(false);
  const [isMarginOpen, setIsMarginOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Using Real API
  const [allSkus, setAllSkus] = useState<any[]>([]);
  const [surgeRules, setSurgeRules] = useState<any[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<any[]>([]);


  // Load data from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const [skusResp, rulesResp, updatesResp] = await Promise.all([
          pricingApi.getPricingSKUs(),
          pricingApi.getSurgeRules(),
          pricingApi.getPendingUpdates()
        ]);
        if (!mounted) return;
        
        if (skusResp.success && skusResp.data) {
          setAllSkus(skusResp.data.map((sku: any) => ({
            id: sku.id,
            name: sku.name,
            code: sku.sku,
            cost: sku.cost || 0,
            base: sku.basePrice || sku.currentPrice || 0,
            sell: sku.currentPrice || 0,
            competitor: sku.competitorPrice || 0,
            margin: sku.margin || 0,
            marginStatus: sku.marginStatus || 'healthy',
            history: sku.history || []
          })));
        }
        if (rulesResp.success && rulesResp.data) {
          setSurgeRules(rulesResp.data);
        }
        if (updatesResp.success && updatesResp.data) {
          setPendingUpdates(updatesResp.data);
        }
      } catch (err) {
        console.error('Failed to load pricing data', err);
        toast.error('Failed to load pricing data');
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const skusToUse = allSkus.length > 0 ? allSkus : mockSkus;

  const [activeFilters, setActiveFilters] = useState({
    status: 'all'
  });

  const skus = skusToUse.filter((sku: any) => {
    const matchesSearch = sku.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sku.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = activeFilters.status === 'all' || sku.marginStatus === activeFilters.status;
    return matchesSearch && matchesStatus;
  });

  const handleEditSku = (sku: any) => {
    setSelectedSku(sku);
  };

  const handleUpdateSkuPrice = (updatedSku: any) => {
    setAllSkus(prev => prev.map(s => s.id === updatedSku.id ? {
        ...s,
        ...updatedSku,
        marginStatus: updatedSku.margin < 10 ? 'critical' : (updatedSku.margin < 15 ? 'warning' : 'healthy')
    } : s));
    setSelectedSku(null);
    toast.success(`${updatedSku.name} updated locally`);
  };

  const handleCreateRule = (rule: any) => {
    toast.success(`Rule "${rule.name}" created and pending approval (Local State)`);
    setIsWizardOpen(false);
  };

  if (isLoading && skusToUse.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#7C3AED]" />
              <p className="font-medium">Loading pricing data from MongoDB...</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Pricing Engine</h1>
          <p className="text-[#757575] text-sm">Base pricing, geo-pricing rules, and competitor benchmarking</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsWizardOpen(true)}
          className="px-4 py-2 bg-[#7C3AED] text-white font-medium rounded-lg hover:bg-[#6D28D9] flex items-center gap-2 transition-colors shadow-sm"
        >
          <Tag size={16} />
          New Price Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setIsSurgeOpen(true)}
            className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
             <div className="flex justify-between items-start">
                 <h3 className="font-bold text-[#212121] mb-2 flex items-center gap-2">
                     <TrendingUp size={18} className="text-[#7C3AED]" /> Surge Pricing
                 </h3>
                 <ChevronRight className="text-gray-300 group-hover:text-[#7C3AED] transition-colors" size={20} />
             </div>
             <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold text-[#212121]">Active</span>
                 <span className="text-sm text-[#757575] mb-1">in 3 zones</span>
             </div>
             <p className="text-xs text-[#757575] mt-2 group-hover:text-[#7C3AED] transition-colors">Multiplier: 1.1x - 1.25x</p>
          </div>

           <div 
            onClick={() => setIsMarginOpen(true)}
            className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
           >
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-[#212121] mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-[#EF4444]" /> Margin Alert
                </h3>
                <ChevronRight className="text-gray-300 group-hover:text-[#EF4444] transition-colors" size={20} />
             </div>
             <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold text-[#EF4444]">12</span>
                 <span className="text-sm text-[#757575] mb-1">SKUs</span>
             </div>
             <p className="text-xs text-[#757575] mt-2 group-hover:text-[#EF4444] transition-colors">Below min. margin threshold</p>
          </div>

           <div 
             onClick={() => setIsPendingOpen(true)}
             className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
           >
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-[#212121] mb-2 flex items-center gap-2">
                    <History size={18} className="text-[#3B82F6]" /> Pending Updates
                </h3>
                <ChevronRight className="text-gray-300 group-hover:text-[#3B82F6] transition-colors" size={20} />
             </div>
             <div className="flex items-end gap-2">
                 <span className="text-4xl font-bold text-[#212121]">8</span>
                 <span className="text-sm text-[#757575] mb-1">Requests</span>
             </div>
             <p className="text-xs text-[#757575] mt-2 group-hover:text-[#3B82F6] transition-colors">Waiting for approval</p>
          </div>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
             <div className="flex items-center gap-2">
                <BarChart3 className="text-[#757575]" size={20} />
                <h3 className="font-bold text-[#212121]">SKU Price Management</h3>
             </div>
             <div className="flex gap-2">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "p-2 text-[#757575] hover:text-[#212121] hover:bg-white rounded-lg border border-transparent hover:border-[#E0E0E0] transition-all",
                            activeFilters.status !== 'all' && "text-[#7C3AED] border-[#E0E0E0] bg-purple-50"
                        )}>
                            <Filter size={16} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => {
                            console.log("Setting filter to all");
                            setActiveFilters({status: 'all'});
                        }}>
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-2 h-2 rounded-full bg-slate-300" /> All SKUs
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                            console.log("Setting filter to healthy");
                            setActiveFilters({status: 'healthy'});
                        }}>
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-2 h-2 rounded-full bg-green-500" /> Healthy Margin
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                            console.log("Setting filter to warning");
                            setActiveFilters({status: 'warning'});
                        }}>
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" /> Warning
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                            console.log("Setting filter to critical");
                            setActiveFilters({status: 'critical'});
                        }}>
                            <div className="flex items-center gap-2 w-full">
                                <div className="w-2 h-2 rounded-full bg-red-500" /> Critical
                            </div>
                        </DropdownMenuItem>
                        {activeFilters.status !== 'all' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setActiveFilters({status: 'all'})} className="text-[#7C3AED] font-bold">
                                    Clear Filters
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                 </DropdownMenu>
                 <button 
                    type="button"
                    onClick={() => setIsBulkOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold bg-white border border-[#E0E0E0] rounded text-[#212121] hover:bg-gray-50 transition-colors"
                 >
                    Bulk Edit
                 </button>
             </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">SKU Name</th>
                <th className="px-6 py-3">Base Price</th>
                <th className="px-6 py-3">Current Selling</th>
                <th className="px-6 py-3">Competitor Avg</th>
                <th className="px-6 py-3">Margin</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {skus.map((sku) => (
                <tr key={sku.id} className="hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-6 py-4">
                        <button 
                            type="button"
                            onClick={() => handleEditSku(sku)}
                            className="text-left hover:text-[#7C3AED] transition-colors"
                        >
                            <p className="font-medium text-[#212121] group-hover:text-[#7C3AED]">{sku.name}</p>
                            <p className="text-xs text-[#757575]">{sku.code}</p>
                        </button>
                    </td>
                    <td className="px-6 py-4 text-[#616161]">${sku.base.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-[#212121]">${sku.sell.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[#616161]">${sku.competitor.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-medium ${
                        sku.marginStatus === 'healthy' ? 'text-[#16A34A]' :
                        sku.marginStatus === 'warning' ? 'text-[#EAB308]' : 'text-[#EF4444]'
                    }`}>
                        {sku.margin}%
                    </td>
                    <td className="px-6 py-4 text-right">
                    <button 
                        type="button"
                        onClick={() => handleEditSku(sku)}
                        className="text-[#7C3AED] hover:text-[#6D28D9] font-medium text-xs flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Edit2 size={12} /> Edit
                    </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Interactive Components */}
      <PriceRuleWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} onSubmit={handleCreateRule} />
      <SurgePricingDrawer open={isSurgeOpen} onOpenChange={setIsSurgeOpen} />
      <MarginRiskView open={isMarginOpen} onOpenChange={setIsMarginOpen} />
      <PendingUpdatesView open={isPendingOpen} onOpenChange={setIsPendingOpen} />
      <SKUPriceDetailDrawer 
        sku={selectedSku} 
        open={!!selectedSku} 
        onOpenChange={(open) => !open && setSelectedSku(null)} 
        onUpdate={handleUpdateSkuPrice}
      />
      <BulkPriceEditModal open={isBulkOpen} onOpenChange={setIsBulkOpen} />
    </div>
  );
}
