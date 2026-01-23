import React from 'react';
import { Bell, Search, Command, ShieldCheck } from 'lucide-react';

export function AdminTopBar() {
  return (
    <div className="h-[64px] bg-white border-b border-[#e4e4e7] fixed top-0 left-[260px] right-0 z-40 flex items-center px-8 justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={16} />
          <input 
            type="text" 
            placeholder="Search for orders, users, stores, or config keys..." 
            className="h-10 pl-10 pr-12 w-full rounded-lg bg-[#f4f4f5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#e11d48] focus:border-transparent transition-all placeholder-[#a1a1aa] text-[#18181b]"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
             <div className="px-1.5 py-0.5 rounded border border-[#d4d4d8] bg-white text-[10px] text-[#71717a] font-mono">⌘K</div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 ml-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
           <ShieldCheck size={14} className="text-[#e11d48]" />
           <span className="text-xs font-medium text-rose-900">Prod Environment</span>
        </div>
        
        <div className="h-6 w-px bg-[#e4e4e7] mx-2"></div>

        <button className="relative p-2 text-[#71717a] hover:bg-[#f4f4f5] rounded-full transition-colors group">
          <Bell size={20} className="group-hover:text-[#18181b]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#e11d48] rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}
