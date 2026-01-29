import React, { useState } from 'react';
import { Scan, Check, Box, ArrowRight, AlertTriangle, PackageCheck, Clock, User, ChevronRight, Package, List } from 'lucide-react';
import { cn } from "../../lib/utils";
import { PageHeader } from '../ui/page-header';
import { toast } from 'sonner';

export function PackStation() {
  const [activeOrderId, setActiveOrderId] = useState('ORD-9921');

  const packQueue = [
    { id: 'ORD-9921', picker: 'Sarah C.', sla: '01:45', items: 6, status: 'urgent' },
    { id: 'ORD-9922', picker: 'Mike R.', sla: '04:20', items: 5, status: 'warning' },
    { id: 'ORD-9923', picker: 'John D.', sla: '08:15', items: 12, status: 'normal' },
    { id: 'ORD-9924', picker: 'Rachel Z.', sla: '12:00', items: 4, status: 'normal' },
    { id: 'ORD-9925', picker: 'Alex M.', sla: '14:30', items: 15, status: 'normal' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packing Station"
        subtitle="Pack and dispatch orders for delivery"
        actions={
          <button 
            onClick={() => {
              // Scroll to queue section (already visible, but could add smooth scroll)
              const queueElement = document.querySelector('[data-queue-section]');
              if (queueElement) {
                queueElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
          >
            <List size={16} />
            View Queue
          </button>
        }
      />

      <div className="grid grid-cols-12 gap-6 h-[650px]">
        {/* Left Column: Pack Queue List */}
        <div data-queue-section className="col-span-12 md:col-span-3 flex flex-col h-full bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-between">
            <h3 className="font-bold text-[#212121] flex items-center gap-2">
              <List size={18} /> Pack Queue
            </h3>
            <span className="bg-[#E6F7FF] text-[#1677FF] text-xs font-bold px-2 py-0.5 rounded-full">{packQueue.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {packQueue.map((order) => (
              <div 
                key={order.id}
                onClick={() => setActiveOrderId(order.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                  activeOrderId === order.id 
                    ? "bg-[#F0F7FF] border-[#1677FF] ring-1 ring-[#1677FF]" 
                    : "bg-white border-[#E0E0E0] hover:border-[#BDBDBD]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "font-bold text-sm",
                    activeOrderId === order.id ? "text-[#1677FF]" : "text-[#212121]"
                  )}>{order.id}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-mono font-bold px-1.5 py-0.5 rounded",
                    order.status === 'urgent' ? "bg-[#FEE2E2] text-[#EF4444]" :
                    order.status === 'warning' ? "bg-[#FFFBE6] text-[#D48806]" : "bg-[#DCFCE7] text-[#16A34A]"
                  )}>
                    <Clock size={10} />
                    {order.sla}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#616161]">
                   <div className="flex items-center gap-1">
                     <User size={12} /> {order.picker}
                   </div>
                   <div className="flex items-center gap-1">
                     <Box size={12} /> {order.items} items
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Order Details (Items) */}
        <div className="col-span-12 md:col-span-5 flex flex-col h-full bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                 <h2 className="text-xl font-bold text-[#212121]">{activeOrderId}</h2>
                 <span className="px-2 py-0.5 bg-[#E6F7FF] text-[#1677FF] rounded text-[10px] font-bold uppercase">Express</span>
              </div>
              <p className="text-[#757575] mt-0.5 text-xs">Packing for <span className="font-bold text-[#212121]">Sarah Connor</span></p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">SLA Timer</div>
              <div className="text-xl font-mono font-bold text-[#EF4444] animate-pulse">01:45</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left text-sm">
               <thead className="bg-[#FAFAFA] text-[#757575] border-b border-[#E0E0E0] sticky top-0">
                 <tr>
                   <th className="px-4 py-3 font-medium">Item</th>
                   <th className="px-4 py-3 font-medium w-16">Qty</th>
                   <th className="px-4 py-3 font-medium w-24">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#F0F0F0]">
                 {[
                   { name: 'Organic Bananas', qty: 1, weight: '1.2kg', status: 'scanned' },
                   { name: 'Sourdough Bread', qty: 1, weight: '0.4kg', status: 'scanned' },
                   { name: 'Whole Milk 1L', qty: 2, weight: '2.0kg', status: 'pending' },
                   { name: 'Avocados (Large)', qty: 3, weight: '0.8kg', status: 'pending' },
                   { name: 'Greek Yogurt', qty: 1, weight: '0.5kg', status: 'pending' },
                   { name: 'Orange Juice', qty: 1, weight: '1.0kg', status: 'pending' },
                 ].map((item, i) => (
                   <tr key={i} className={item.status === 'scanned' ? 'bg-[#F0FDF4]' : 'bg-white'}>
                     <td className="px-4 py-3">
                       <div className="flex items-center gap-3">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                           item.status === 'scanned' ? 'bg-[#22C55E] text-white' : 'bg-[#F5F5F5] text-[#9E9E9E]'
                         }`}>
                           {item.status === 'scanned' ? <Check size={14} /> : <Box size={14} />}
                         </div>
                         <div>
                           <div className={`font-medium text-sm ${item.status === 'scanned' ? 'text-[#14532D]' : 'text-[#212121]'}`}>
                             {item.name}
                           </div>
                           <div className="text-[10px] text-[#9E9E9E]">Weight: {item.weight}</div>
                         </div>
                       </div>
                     </td>
                     <td className="px-4 py-3 text-[#616161]">x{item.qty}</td>
                     <td className="px-4 py-3">
                       {item.status === 'scanned' ? (
                         <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-wide">Packed</span>
                       ) : (
                         <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wide">Waiting</span>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
          
          {/* Auto QC Checklist Footer */}
          <div className="bg-[#FAFAFA] border-t border-[#E0E0E0] p-3">
             <div className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider mb-2">Auto QC Checks</div>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-[#212121]">
                   <Check className="text-[#22C55E]" size={14} />
                   <span>Cold items separated</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#212121]">
                   <Check className="text-[#22C55E]" size={14} />
                   <span>Fragile items protected</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Actions & Scanner */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6 h-full">
          {/* Packaging Material */}
          <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
             <h3 className="text-xs font-bold text-[#212121] mb-2 flex items-center gap-2">
               <PackageCheck size={16} /> Packaging Suggestions
             </h3>
             <div className="flex gap-2">
                <div className="flex-1 p-2 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] flex flex-col items-center justify-center text-center">
                   <span className="text-lg font-bold text-[#212121]">2</span>
                   <span className="text-[10px] text-[#616161]">Medium Bags</span>
                </div>
                <div className="flex-1 p-2 bg-[#F5F5F5] rounded-lg border border-[#E0E0E0] flex flex-col items-center justify-center text-center">
                   <span className="text-lg font-bold text-[#212121]">1</span>
                   <span className="text-[10px] text-[#616161]">Cooler Bag</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-[#FEE2E2] text-[#B91C1C] rounded-lg font-bold text-[10px] hover:bg-[#FECACA] transition-colors flex flex-col items-center gap-1 border border-[#FECACA]">
                <XCircle size={16} />
                Report Missing
              </button>
              <button className="p-2 bg-[#FFF7E6] text-[#D46B08] rounded-lg font-bold text-[10px] hover:bg-[#FFD591] transition-colors flex flex-col items-center gap-1 border border-[#FFD591]">
                <AlertTriangle size={16} />
                Damaged
              </button>
            </div>
            <button className="w-full mt-1 bg-[#1677FF] text-white py-3 rounded-lg font-bold hover:bg-[#1668E3] transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-200">
              Complete Order <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function XCircle({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}