import React from 'react';
import { 
  ShieldCheck, 
  Warehouse, 
  Factory, 
  Store, 
  Bike, 
  Building2, 
  Landmark, 
  Megaphone,
  LayoutGrid,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SuperAdminToolbarProps {
  currentDashboard: string;
  onSwitch: (dashboard: any) => void;
  onLogout: () => void;
}

export function SuperAdminToolbar({ currentDashboard, onSwitch, onLogout }: SuperAdminToolbarProps) {
  const modules = [
    { id: 'admin', icon: ShieldCheck, label: 'Admin', color: 'text-rose-500' },
    { id: 'warehouse', icon: Warehouse, label: 'Warehouse', color: 'text-cyan-500' },
    { id: 'production', icon: Factory, label: 'Production', color: 'text-green-500' },
    { id: 'darkstore', icon: Store, label: 'Darkstore', color: 'text-blue-500' },
    { id: 'rider', icon: Bike, label: 'Fleet', color: 'text-orange-500' },
    { id: 'vendor', icon: Building2, label: 'Vendor', color: 'text-indigo-500' },
    { id: 'finance', icon: Landmark, label: 'Finance', color: 'text-teal-500' },
    { id: 'merch', icon: Megaphone, label: 'Merch', color: 'text-purple-500' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-gray-900 text-white z-[9999] flex items-center justify-between px-4 shadow-xl border-b border-gray-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldCheck size={14} />
          Super Admin Mode
        </div>
        <div className="h-6 w-px bg-gray-700" />
      </div>

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {modules.map((mod) => (
          <button
            key={mod.id}
            onClick={() => onSwitch(mod.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              currentDashboard === mod.id 
                ? "bg-gray-800 text-white shadow-sm ring-1 ring-gray-600" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <mod.icon size={14} className={mod.color} />
            {mod.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 pl-4 border-l border-gray-700">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Exit
        </button>
      </div>
    </div>
  );
}
