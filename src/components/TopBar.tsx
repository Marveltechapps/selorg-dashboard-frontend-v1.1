import React from 'react';
import { Bell, Search, Zap } from 'lucide-react';
import { cn } from "../lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  status?: 'normal' | 'warning' | 'critical';
}

function MetricCard({ label, value, trend, trendUp, status = 'normal' }: MetricCardProps) {
  return (
    <div className={cn(
      "flex flex-col p-3 rounded-xl border shadow-sm transition-all hover:shadow-md",
      status === 'critical' ? "bg-red-50 border-red-200" : 
      status === 'warning' ? "bg-[#FFFBE6] border-[#FFE58F]" : 
      "bg-white border-[#E0E0E0]"
    )}>
      <span className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between mt-1">
        <span className={cn(
          "text-2xl font-bold tracking-tight",
          status === 'critical' ? "text-[#EF4444]" : 
          status === 'warning' ? "text-[#D48806]" : 
          "text-[#212121]"
        )}>{value}</span>
        {trend && (
          <span className={cn(
            "text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded-full",
            trendUp ? "text-[#22C55E] bg-[#DCFCE7]" : "text-[#EF4444] bg-[#FEE2E2]"
          )}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function TopBar() {
  return (
    <div className="h-[72px] bg-white border-b border-[#E0E0E0] fixed top-0 left-[220px] right-0 z-40 flex items-center px-8 justify-between shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Left: KPIs */}
      <div className="flex items-center gap-4 flex-1">
        {/* KPI Cards removed as per request */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6 ml-6 border-l pl-6 border-[#E0E0E0] h-10">
        {/* Store Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#F5F5F5] p-1 rounded-lg">
          <button className="px-3 py-1.5 bg-white shadow-sm rounded-md text-[10px] font-bold text-[#1677FF] uppercase tracking-wide flex items-center gap-1.5">
            <Zap size={12} fill="currentColor" />
            Online
          </button>
          <button className="px-3 py-1.5 text-[10px] font-bold text-[#9E9E9E] hover:text-[#212121] uppercase tracking-wide transition-colors">
            Maintenance
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
          <input 
            type="text" 
            placeholder="Search order #..." 
            className="h-9 pl-9 pr-4 rounded-lg bg-[#F5F5F5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#1677FF] focus:border-transparent w-48 transition-all focus:w-64 placeholder-[#BDBDBD]"
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
