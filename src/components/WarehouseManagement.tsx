import React from 'react';
import { WarehouseSidebar } from './warehouse/WarehouseSidebar';
import { WarehouseTopBar } from './warehouse/WarehouseTopBar';
import { WarehouseOverview } from './screens/warehouse/WarehouseOverview';
import { InboundOps } from './screens/warehouse/InboundOps';
import { InventoryStorage } from './screens/warehouse/InventoryStorage';
import { OutboundOps } from './screens/warehouse/OutboundOps';
import { Transfers } from './screens/warehouse/Transfers';
import { QCCompliance } from './screens/warehouse/QCCompliance';
import { WorkforceShifts } from './screens/warehouse/WorkforceShifts';
import { EquipmentAssets } from './screens/warehouse/EquipmentAssets';
import { Exceptions } from './screens/warehouse/Exceptions';
import { ReportsAnalytics } from './screens/warehouse/ReportsAnalytics';
import { WarehouseUtilities } from './screens/warehouse/WarehouseUtilities';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';

export function WarehouseManagement({ onLogout }: { onLogout: () => void }) {
  const { activeTab, setActiveTab } = useDashboardNavigation('overview');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      <WarehouseSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <div className="pl-[240px]">
        <WarehouseTopBar />
        
        <main className="pt-[88px] px-8 pb-12 min-h-screen max-w-[1920px] mx-auto">
            {activeTab === 'overview' && <WarehouseOverview />}
            {activeTab === 'inbound' && <InboundOps />}
            {activeTab === 'inventory' && <InventoryStorage />}
            {activeTab === 'outbound' && <OutboundOps />}
            {activeTab === 'transfers' && <Transfers />}
            {activeTab === 'qc' && <QCCompliance />}
            {activeTab === 'workforce' && <WorkforceShifts />}
            {activeTab === 'equipment' && <EquipmentAssets />}
            {activeTab === 'exceptions' && <Exceptions />}
            {activeTab === 'analytics' && <ReportsAnalytics />}
            {activeTab === 'utilities' && <WarehouseUtilities />}
        </main>
      </div>
    </div>
  );
}
