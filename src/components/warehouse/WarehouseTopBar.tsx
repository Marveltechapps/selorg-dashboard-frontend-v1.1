import React from 'react';
import { Bell, Search, Activity, Wifi } from 'lucide-react';

export function WarehouseTopBar() {
  return (
    <div className="h-[72px] bg-white border-b border-[#E2E8F0] fixed top-0 left-[240px] right-0 z-40 flex items-center px-8 justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Left: System Status */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold text-[#1E293B]">Ops Control Center</span>
           <span className="bg-[#CFFAFE] text-[#0891b2] text-xs font-bold px-2 py-0.5 rounded-full border border-[#0891b2]/20 flex items-center gap-1">
             <Activity size={12} />
             LIVE
           </span>
        </div>
        <div className="h-6 w-px bg-[#E2E8F0] mx-2"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
            <Wifi size={14} className="text-green-500" />
            <span>HSD Network: Strong</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6 ml-6 border-l pl-6 border-[#E2E8F0] h-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
          <input 
            type="text" 
            placeholder="Search SKU, Bin, PO, or Transfer ID..." 
            className="h-9 pl-9 pr-4 rounded-lg bg-[#F1F5F9] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#0891b2] focus:border-transparent w-64 transition-all focus:w-80 placeholder-[#CBD5E1] text-[#334155]"
          />
        </div>
        <button className="relative p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full shadow-sm"></span>
        </button>
      </div>
    </div>
  );
}
