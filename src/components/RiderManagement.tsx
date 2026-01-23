import React from 'react';
import { RiderSidebar } from './rider/RiderSidebar';
import { RiderTopBar } from './rider/RiderTopBar';
import { RiderOverview } from './screens/rider/RiderOverview';
import { RiderHR } from './screens/rider/RiderHR';
import { DispatchOps } from './screens/rider/DispatchOps';
import { FleetManagement } from './screens/fleet/FleetManagement';
import { AlertsDashboard as RiderAlerts } from './screens/AlertsDashboard';
import { RiderAnalytics } from './screens/rider/RiderAnalytics';
import { StaffShifts } from './screens/rider/StaffShifts';
import { CommunicationHub } from './screens/rider/CommunicationHub';
import { SystemHealth } from './screens/rider/SystemHealth';
import { TaskApprovals } from './screens/rider/TaskApprovals';
import { useDashboardNavigation } from '../hooks/useDashboardNavigation';

export function RiderManagement({ onLogout }: { onLogout: () => void }) {
  const { activeTab, setActiveTab } = useDashboardNavigation('overview');

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#212121] font-sans">
      <RiderSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <div className="pl-[220px]">
        <RiderTopBar />
        
        <main className="pt-[88px] px-8 pb-12 min-h-screen max-w-[1920px] mx-auto">
            {activeTab === 'overview' && <RiderOverview />}
            {activeTab === 'hr' && <RiderHR />}
            {activeTab === 'dispatch' && <DispatchOps />}
            {activeTab === 'fleet' && <FleetManagement />}
            {activeTab === 'alerts' && <RiderAlerts />}
            {activeTab === 'analytics' && <RiderAnalytics />}
            {activeTab === 'shifts' && <StaffShifts />}
            {activeTab === 'communication' && <CommunicationHub />}
            {activeTab === 'health' && <SystemHealth />}
            {activeTab === 'approvals' && <TaskApprovals />}
        </main>
      </div>
    </div>
  );
}
