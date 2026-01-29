import React, { useState, useEffect } from 'react';
import { picklistsApi } from '../../api/production/picklists.api';
import { toast } from 'sonner';
import { 
  Layers, User, Map, Clock, AlertTriangle, CheckCircle2, 
  Search, Plus, Play, Settings, ArrowRight, Box, FileText,
  ShoppingCart, Route, Zap, Info, Bell, Filter, ChevronDown,
  Grid3x3, List, Pause, XCircle, UserPlus, TrendingUp, Package
} from 'lucide-react';
import { cn } from "../../lib/utils";
import { PageHeader } from '../ui/page-header';

// Types for our data
type PickListStatus = 'pending' | 'inprogress' | 'completed' | 'paused';
type Zone = 'Ambient A' | 'Ambient B' | 'Chiller' | 'Frozen';
type Priority = 'normal' | 'high' | 'urgent';

type PickList = {
  id: string;
  zone: Zone;
  slaTime: string; // Time string like "08:15"
  slaStatus: 'safe' | 'atrisk' | 'urgent';
  items: number;
  orders: number;
  status: PickListStatus;
  progress?: number;
  picker?: {
    name: string;
    avatar: string;
  };
  suggestedPicker?: string;
  priority: Priority;
};

export function PickTasks() {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'batch' | 'multi' | 'route' | 'assign'>('auto');
  const [trainingMode, setTrainingMode] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('sla');

  const [allPicklists, setAllPicklists] = useState<PickList[]>([]);
  const [loading, setLoading] = useState(false);

  // Load picklists from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await picklistsApi.getPicklists({});
        if (!mounted) return;
        if (resp.success && resp.data) {
          setAllPicklists(resp.data);
        } else if (resp.data && Array.isArray(resp.data)) {
          setAllPicklists(resp.data);
        }
      } catch (err) {
        console.error('Failed to load picklists', err);
        toast.error('Failed to load picklists');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Use API data
  const picklistsToUse = allPicklists;

  // Calculate stats
  const stats = {
    total: picklistsToUse.length,
    pending: picklistsToUse.filter(p => p.status === 'pending').length,
    inProgress: picklistsToUse.filter(p => p.status === 'inprogress').length,
    completed: picklistsToUse.filter(p => p.status === 'completed').length,
    slaCompliance: 94,
    overallProgress: 68
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pick Tasks"
        subtitle="Manage picking assignments and workflows"
        actions={
          <button 
            onClick={() => toast.info('Creating new pick list...')}
            className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
          >
            <Plus size={16} />
            Create Pick List
          </button>
        }
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E0E0E0] overflow-x-auto">
        <TabButton id="auto" label="Auto Picklist" active={activeTab} onClick={setActiveTab} />
        <TabButton id="manual" label="Manual Picklist" active={activeTab} onClick={setActiveTab} />
        <TabButton id="batch" label="Batch Picking" active={activeTab} onClick={setActiveTab} />
        <TabButton id="multi" label="Multi-Order" active={activeTab} onClick={setActiveTab} />
        <TabButton id="route" label="Route Optimization" active={activeTab} onClick={setActiveTab} />
        <TabButton id="assign" label="Picker Assignment" active={activeTab} onClick={setActiveTab} />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-4">
        <StatsCard label="Total Picklists Today" value={stats.total} color="bg-[#F5F5F5]" textColor="text-[#212121]" />
        <StatsCard label="Pending" value={stats.pending} color="bg-[#FFF7E6]" textColor="text-[#D46B08]" />
        <StatsCard label="In Progress" value={stats.inProgress} color="bg-[#E6F7FF]" textColor="text-[#1677FF]" />
        <StatsCard label="Completed" value={stats.completed} color="bg-[#F0FDF4]" textColor="text-[#16A34A]" />
        <StatsCard label="SLA Compliance %" value={`${stats.slaCompliance}%`} color="bg-[#F3E8FF]" textColor="text-[#9333EA]" />
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <p className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-2">Overall Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#F5F5F5] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1677FF] h-full rounded-full" style={{ width: `${stats.overallProgress}%` }} />
            </div>
            <span className="text-sm font-bold text-[#212121]">{stats.overallProgress}%</span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E0E0E0]">
        <div className="flex items-center gap-2 text-sm font-bold text-[#616161]">
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        <FilterDropdown 
          label="Status" 
          value={statusFilter} 
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'inprogress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ]}
        />

        <FilterDropdown 
          label="Zone" 
          value={zoneFilter} 
          onChange={setZoneFilter}
          options={[
            { value: 'all', label: 'All Zones' },
            { value: 'ambient', label: 'Ambient' },
            { value: 'chiller', label: 'Chiller' },
            { value: 'frozen', label: 'Frozen' }
          ]}
        />

        <FilterDropdown 
          label="Priority" 
          value={priorityFilter} 
          onChange={setPriorityFilter}
          options={[
            { value: 'all', label: 'All Priority' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'high', label: 'High' },
            { value: 'normal', label: 'Normal' }
          ]}
        />

        <FilterDropdown 
          label="Assignment" 
          value={assignmentFilter} 
          onChange={setAssignmentFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'unassigned', label: 'Unassigned' },
            { value: 'myteam', label: 'My Team' }
          ]}
        />

        <div className="h-6 w-px bg-[#E0E0E0]" />

        <FilterDropdown 
          label="Sort" 
          value={sortBy} 
          onChange={setSortBy}
          options={[
            { value: 'sla', label: 'By SLA' },
            { value: 'items', label: 'By Items' },
            { value: 'orders', label: 'By Orders' },
            { value: 'newest', label: 'Newest' }
          ]}
        />
      </div>

      {/* Main Content - Picklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {picklistsToUse.map((picklist) => (
          <PicklistCard key={picklist.id} picklist={picklist} />
        ))}
      </div>

      {/* Bottom Pagination and View Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0]">
        <div className="text-sm text-[#757575]">
          Showing <span className="font-bold text-[#212121]">{picklistsToUse.length}</span> of <span className="font-bold text-[#212121]">{picklistsToUse.length}</span> picklists
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-[#616161] hover:bg-[#F5F5F5] rounded-lg transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 text-sm font-bold text-white bg-[#1677FF] rounded-lg">
            1
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[#616161] hover:bg-[#F5F5F5] rounded-lg transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[#616161] hover:bg-[#F5F5F5] rounded-lg transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-[#616161] hover:bg-[#F5F5F5] rounded-lg transition-colors">
            Next
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-lg p-1">
          <button 
            onClick={() => setViewMode('card')}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === 'card' ? "bg-[#1677FF] text-white" : "text-[#616161] hover:bg-[#F5F5F5]"
            )}
            title="Card View"
          >
            <Grid3x3 size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded transition-colors",
              viewMode === 'list' ? "bg-[#1677FF] text-white" : "text-[#616161] hover:bg-[#F5F5F5]"
            )}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function TabButton({ id, label, active, onClick }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "px-4 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
        isActive 
          ? "border-[#1677FF] text-[#1677FF] bg-[#F0F7FF]" 
          : "border-transparent text-[#616161] hover:text-[#212121] hover:bg-[#F5F5F5]"
      )}
    >
      {label}
    </button>
  );
}

function StatsCard({ label, value, color, textColor }: any) {
  return (
    <div className={cn("p-4 rounded-xl border border-[#E0E0E0] shadow-sm", color)}>
      <p className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-2">{label}</p>
      <p className={cn("text-2xl font-bold", textColor)}>{value}</p>
    </div>
  );
}

function FilterDropdown({ label, value, onChange, options }: any) {
  return (
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium text-[#212121] bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#1677FF] cursor-pointer hover:bg-[#ECECEC] transition-colors"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#616161] pointer-events-none" />
    </div>
  );
}

function PicklistCard({ picklist }: { picklist: PickList }) {
  const getZoneColor = (zone: Zone) => {
    switch (zone) {
      case 'Ambient A':
      case 'Ambient B':
        return { bg: 'bg-[#FFF7E6]', text: 'text-[#D46B08]', border: 'border-[#FFD591]' };
      case 'Chiller':
        return { bg: 'bg-[#E6F7FF]', text: 'text-[#1677FF]', border: 'border-[#91CAFF]' };
      case 'Frozen':
        return { bg: 'bg-[#F0F9FF]', text: 'text-[#0EA5E9]', border: 'border-[#7DD3FC]' };
      default:
        return { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]', border: 'border-[#E0E0E0]' };
    }
  };

  const getSLAColor = (status: 'safe' | 'atrisk' | 'urgent') => {
    switch (status) {
      case 'urgent':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#EF4444]', border: 'border-[#FECACA]' };
      case 'atrisk':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#FCD34D]' };
      case 'safe':
        return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', border: 'border-[#86EFAC]' };
    }
  };

  const getStatusBadge = (status: PickListStatus) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-[#FFF7E6]', text: 'text-[#D46B08]', label: 'Pending' };
      case 'inprogress':
        return { bg: 'bg-[#E6F7FF]', text: 'text-[#1677FF]', label: 'In Progress' };
      case 'completed':
        return { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', label: 'Completed' };
      case 'paused':
        return { bg: 'bg-[#F5F5F5]', text: 'text-[#616161]', label: 'Paused' };
    }
  };

  const zoneColors = getZoneColor(picklist.zone);
  const slaColors = getSLAColor(picklist.slaStatus);
  const statusBadge = getStatusBadge(picklist.status);

  return (
    <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      {/* Urgent indicator */}
      {picklist.slaStatus === 'urgent' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-[#EF4444]" />
      )}

      {/* Top Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-[#212121]">{picklist.id}</span>
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-bold border",
            zoneColors.bg, zoneColors.text, zoneColors.border
          )}>
            {picklist.zone}
          </span>
        </div>
        
        <div className={cn(
          "px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border",
          slaColors.bg, slaColors.text, slaColors.border
        )}>
          <Clock size={12} /> {picklist.slaTime}
        </div>
      </div>

      {/* Middle Content */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-4 text-sm text-[#616161]">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-[#9E9E9E]" />
            <span className="font-medium">{picklist.items} items</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingCart size={14} className="text-[#9E9E9E]" />
            <span className="font-medium">{picklist.orders} orders</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn(
          "inline-flex px-2 py-1 rounded-full text-xs font-bold",
          statusBadge.bg, statusBadge.text
        )}>
          {statusBadge.label}
        </div>

        {/* Progress Bar (if In Progress) */}
        {picklist.status === 'inprogress' && picklist.progress !== undefined && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#757575]">Picking progress</span>
              <span className="font-bold text-[#1677FF]">{picklist.progress}%</span>
            </div>
            <div className="w-full bg-[#F5F5F5] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#1677FF] h-full rounded-full transition-all" 
                style={{ width: `${picklist.progress}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Content */}
      <div className="pt-4 border-t border-[#F5F5F5] space-y-3">
        {/* Picker Info */}
        {picklist.picker ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E0E7FF] flex items-center justify-center text-[10px] font-bold text-[#4F46E5]">
              {picklist.picker.avatar}
            </div>
            <span className="text-sm font-medium text-[#616161]">{picklist.picker.name}</span>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <User size={12} className="text-[#9E9E9E]" />
              </div>
              <span className="text-sm font-medium text-[#9E9E9E] italic">Unassigned</span>
            </div>
            {picklist.suggestedPicker && (
              <p className="text-xs text-[#757575] ml-8">
                Suggested: <span className="font-medium text-[#1677FF]">{picklist.suggestedPicker}</span>
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {picklist.status === 'pending' && (
            <>
              <button className="flex-1 px-3 py-2 bg-[#212121] text-white rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-1">
                <Play size={12} /> Start Picking
              </button>
              <button className="px-3 py-2 border border-[#E0E0E0] text-[#616161] rounded-lg text-xs font-bold hover:bg-[#F5F5F5] transition-colors">
                <UserPlus size={12} />
              </button>
            </>
          )}

          {picklist.status === 'inprogress' && (
            <>
              <button className="flex-1 px-3 py-2 bg-[#1677FF] text-white rounded-lg text-xs font-bold hover:bg-[#1668E3] transition-colors">
                Continue
              </button>
              <button className="px-3 py-2 border border-[#E0E0E0] text-[#616161] rounded-lg text-xs font-bold hover:bg-[#F5F5F5] transition-colors">
                <Pause size={12} />
              </button>
              <button className="px-3 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803D] transition-colors">
                <CheckCircle2 size={12} />
              </button>
            </>
          )}

          {picklist.status === 'completed' && (
            <button className="flex-1 px-3 py-2 bg-[#9333EA] text-white rounded-lg text-xs font-bold hover:bg-[#7E22CE] transition-colors flex items-center justify-center gap-1">
              <ArrowRight size={12} /> Move to Packing
            </button>
          )}
        </div>

        {/* Details Link */}
        <button className="text-xs text-[#1677FF] hover:underline font-medium flex items-center gap-1">
          <Info size={12} /> Details
        </button>
      </div>
    </div>
  );
}