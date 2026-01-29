import React from 'react';
import { Bell, Search, Activity } from 'lucide-react';
import { cn } from "../../lib/utils";

export function ProductionTopBar() {
  return (
    <div className="h-[72px] bg-white border-b border-[#E0E0E0] fixed top-0 left-[220px] right-0 z-40 flex items-center px-8 justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Left: Factory Status */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
           <span className="text-xl font-bold text-[#212121]">Main Assembly Line</span>
           <span className="bg-[#DCFCE7] text-[#166534] text-xs font-bold px-2 py-0.5 rounded-full border border-[#166534]/20">RUNNING</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6 ml-6 border-l pl-6 border-[#E0E0E0] h-10">
        {/* Factory Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#F5F5F5] p-1 rounded-lg">
          <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-[10px] font-bold text-[#16A34A] uppercase tracking-wide flex items-center gap-1.5">
            <Activity size={12} fill="currentColor" />
            Production
          </button>
          <button className="px-3 py-1.5 text-[10px] font-bold text-[#9E9E9E] hover:text-[#212121] uppercase tracking-wide transition-colors">
            Downtime
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
          <input 
            type="text" 
            placeholder="Search job card #..." 
            className="h-9 pl-9 pr-4 rounded-lg bg-[#F5F5F5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#16A34A] focus:border-transparent w-48 transition-all focus:w-64 placeholder-[#BDBDBD]"
          />
        </div>
        <button className="relative p-2 text-[#757575] hover:bg-[#F5F5F5] rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full shadow-sm"></span>
        </button>
      </div>
    </div>
  );
}
