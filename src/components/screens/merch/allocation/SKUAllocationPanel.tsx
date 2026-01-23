import React, { useState } from 'react';
import { Boxes } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { ScrollArea } from "../../../ui/scroll-area";
import { AllocationDetailDrawer } from './AllocationDetailDrawer';
import { SKURebalanceModal } from './SKURebalanceModal';
import { TransferOrderModal } from './TransferOrderModal';

const MOCK_SKUS = [
    {
        id: '1',
        name: 'Cola Can 330ml',
        code: 'BEV-001',
        packSize: '24x330ml',
        category: 'Beverages',
        totalStock: 50000,
        locations: [
            { id: 'l1', name: 'Downtown Hub', allocated: 4000, target: 5000, onHand: 4000, inTransit: 500, safetyStock: 1000 },
            { id: 'l2', name: 'Westside Hub', allocated: 2250, target: 5000, onHand: 2250, inTransit: 0, safetyStock: 1000 },
            { id: 'l3', name: 'North Hub', allocated: 3800, target: 4000, onHand: 3800, inTransit: 200, safetyStock: 800 }
        ]
    },
    {
        id: '2',
        name: 'Chips Party Pack',
        code: 'SNK-023',
        packSize: '12x150g',
        category: 'Snacks',
        totalStock: 12000,
        locations: [
            { id: 'l1', name: 'Downtown Hub', allocated: 1200, target: 2000, onHand: 1200, inTransit: 0, safetyStock: 400 },
            { id: 'l2', name: 'Westside Hub', allocated: 800, target: 1500, onHand: 800, inTransit: 100, safetyStock: 300 }
        ]
    },
    {
        id: '3',
        name: 'Mineral Water 1L',
        code: 'BEV-005',
        packSize: '6x1L',
        category: 'Beverages',
        totalStock: 8500,
        locations: [
            { id: 'l1', name: 'Downtown Hub', allocated: 2000, target: 2000, onHand: 2000, inTransit: 0, safetyStock: 500 },
            { id: 'l3', name: 'North Hub', allocated: 1500, target: 1500, onHand: 1500, inTransit: 0, safetyStock: 400 }
        ]
    }
];

export function SKUAllocationPanel({ searchQuery = "" }: { searchQuery?: string }) {
  const [filter, setFilter] = useState('high-priority');
  const [selectedSKU, setSelectedSKU] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRebalanceOpen, setIsRebalanceOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleSKUClick = (sku: any) => {
      setSelectedSKU(sku);
      setIsDrawerOpen(true);
  };

  const filteredSKUs = MOCK_SKUS.filter(sku => {
      // Search logic
      if (searchQuery && !sku.name.toLowerCase().includes(searchQuery.toLowerCase()) && !sku.code.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
      }

      if (filter === 'all') return true;
      // Mock filter logic
      if (filter === 'high-priority') return ['1', '2'].includes(sku.id);
      return true;
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex flex-col h-full">
         <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-[#212121] flex items-center gap-2">
                 <Boxes size={18} /> SKU Allocation
             </h3>
             <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue placeholder="Filter SKUs" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="high-priority">High Priority SKUs</SelectItem>
                    <SelectItem value="all">All SKUs</SelectItem>
                    <SelectItem value="low-stock">Low Stock SKUs</SelectItem>
                    <SelectItem value="promo">Promo SKUs</SelectItem>
                    <SelectItem value="new">New Launches</SelectItem>
                </SelectContent>
             </Select>
         </div>

         <ScrollArea className="flex-1 pr-4">
             <div className="space-y-4">
                 {filteredSKUs.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        No SKUs found for this filter.
                        <button className="text-[#7C3AED] underline ml-2" onClick={() => setFilter('all')}>View all</button>
                    </div>
                 ) : filteredSKUs.map((sku) => (
                     <div 
                        key={sku.id} 
                        className="p-4 border border-[#E0E0E0] rounded-lg hover:border-[#7C3AED] hover:shadow-md transition-all cursor-pointer bg-white group"
                        onClick={() => handleSKUClick(sku)}
                     >
                         <div className="flex justify-between mb-3">
                             <div>
                                <span className="font-bold text-[#212121] text-sm group-hover:text-[#7C3AED] transition-colors">{sku.name}</span>
                                <span className="text-xs text-gray-400 ml-2">{sku.packSize}</span>
                             </div>
                             <span className="text-xs font-bold text-[#757575] bg-gray-100 px-2 py-0.5 rounded-full">Total: {sku.totalStock.toLocaleString()}</span>
                         </div>
                         <div className="space-y-3">
                             {sku.locations.map((loc) => {
                                 const percent = Math.min(100, (loc.allocated / loc.target) * 100);
                                 return (
                                     <div key={loc.id} className="flex items-center gap-3 text-xs">
                                         <span className="w-24 text-[#616161] truncate" title={loc.name}>{loc.name}</span>
                                         <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                             <div 
                                                className={`h-full rounded-full ${percent < 50 ? 'bg-red-500' : percent < 80 ? 'bg-yellow-500' : 'bg-[#7C3AED]'}`} 
                                                style={{ width: `${percent}%` }}
                                             />
                                         </div>
                                         <span className="font-bold w-12 text-right">{loc.allocated.toLocaleString()}</span>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                 ))}
             </div>
         </ScrollArea>

         <AllocationDetailDrawer 
            open={isDrawerOpen} 
            onOpenChange={setIsDrawerOpen} 
            sku={selectedSKU} 
            onRebalance={() => setIsRebalanceOpen(true)}
            onCreateTransfer={() => setIsTransferOpen(true)}
         />

         <SKURebalanceModal 
            open={isRebalanceOpen}
            onOpenChange={setIsRebalanceOpen}
            sku={selectedSKU}
         />

         <TransferOrderModal
            open={isTransferOpen}
            onOpenChange={setIsTransferOpen}
            sku={selectedSKU}
         />
    </div>
  );
}
