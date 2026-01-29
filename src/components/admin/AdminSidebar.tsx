import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  ShoppingBag, 
  Tag, 
  Store, 
  Settings, 
  CreditCard, 
  Headphones, 
  ShieldAlert, 
  BarChart3, 
  Bell, 
  Map, 
  Link, 
  FileCheck, 
  History, 
  Cpu, 
  Smartphone,
  ChevronDown,
  LogOut,
  Globe
} from 'lucide-react';
import { cn } from "../../lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export function AdminSidebar({ activeTab, setActiveTab, onLogout }: AdminSidebarProps) {
  const navItems = [
    { category: "Control Room", items: [
      { id: 'citywide', label: 'Citywide Control', icon: Globe },
    ]},
    { category: "Platform Settings", items: [
      { id: 'master-data', label: 'Master Data', icon: Database },
      { id: 'users', label: 'Users & Roles', icon: Users },
      { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
      { id: 'pricing', label: 'Pricing & Promo', icon: Tag },
      { id: 'store-config', label: 'Store & Warehouse', icon: Store },
      { id: 'system-config', label: 'System Config', icon: Settings },
      { id: 'finance', label: 'Finance Rules', icon: CreditCard },
    ]},
    { category: "Operational Engines", items: [
      { id: 'support', label: 'Support Center', icon: Headphones },
      { id: 'fraud', label: 'Fraud & Risk', icon: ShieldAlert },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'geofence', label: 'Geofence Manager', icon: Map },
      { id: 'integrations', label: 'Integrations', icon: Link },
      { id: 'compliance', label: 'Compliance', icon: FileCheck },
    ]},
    { category: "System & App", items: [
      { id: 'audit', label: 'Audit Logs', icon: History },
      { id: 'system-tools', label: 'System Tools', icon: Cpu },
      { id: 'app-cms', label: 'App CMS', icon: Smartphone },
    ]}
  ];

  return (
    <div className="w-[260px] h-screen bg-[#09090b] text-[#a1a1aa] flex flex-col fixed left-0 top-0 z-50 shadow-xl border-r border-[#27272a]">
      {/* Header */}
      <div className="p-4 border-b border-[#27272a]">
        <div className="flex items-center gap-2 mb-4 text-white">
          <div className="w-8 h-8 bg-[#e11d48] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.5)]">
             <Settings className="text-white" size={18} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">AdminOps</h1>
            <p className="text-[10px] text-[#e11d48] font-bold tracking-wider uppercase mt-1">Superuser Access</p>
          </div>
        </div>
        
        {/* City Selector */}
        <div className="relative group">
          <button className="w-full bg-[#18181b] hover:bg-[#27272a] transition-colors p-2.5 rounded-lg flex items-center justify-between cursor-pointer border border-[#27272a] hover:border-[#52525b] outline-none">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#e11d48]" />
              <span className="font-medium text-sm text-[#e4e4e7]">Bangalore (All)</span>
            </div>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navItems.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#52525b] mb-2">
              {section.category}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full h-9 px-3 flex items-center gap-3 transition-all rounded-md relative group",
                      isActive 
                        ? "bg-[#e11d48] text-white shadow-[0_1px_8px_rgba(225,29,72,0.4)]" 
                        : "text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7]"
                    )}
                  >
                    <Icon size={16} className={cn(isActive ? "text-white" : "text-[#71717a] group-hover:text-white")} />
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
        <div className="flex items-center gap-3 hover:bg-[#18181b] p-2 rounded-lg cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center border border-[#3f3f46] text-[#e11d48] font-bold text-xs group-hover:bg-[#e11d48] group-hover:text-white transition-colors">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[#e4e4e7] truncate">System Admin</p>
            <p className="text-xs text-[#71717a] truncate">Root Access</p>
          </div>
          <button onClick={onLogout}>
            <LogOut size={16} className="text-[#71717a] hover:text-[#f87171]" />
          </button>
        </div>
      </div>
    </div>
  );
}
