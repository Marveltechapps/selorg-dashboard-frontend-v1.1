import React from 'react';
import { AlertCircle, Clock, Truck } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { toast } from 'sonner';

export function VendorAlerts() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Alerts"
        subtitle="Monitor real-time alerts, notifications, and critical vendor issues"
        actions={
          <button 
            onClick={() => toast.success('Resolved alerts cleared')}
            className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
          >
            Clear Resolved
          </button>
        }
      />

      <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-4 items-start">
              <div className="p-2 bg-white rounded-full text-[#EF4444] shadow-sm">
                  <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[#991B1B]">QC Failure: Dairy Delights</h3>
                      <span className="text-xs font-bold text-[#991B1B]">10 mins ago</span>
                  </div>
                  <p className="text-sm text-[#7F1D1D] mt-1">Batch #9922 failed temperature check. Entire shipment rejected.</p>
                  <div className="flex gap-3 mt-3">
                      <button className="px-3 py-1.5 bg-[#EF4444] text-white text-xs font-bold rounded hover:bg-[#DC2626]">View Report</button>
                      <button className="px-3 py-1.5 bg-white border border-red-200 text-[#991B1B] text-xs font-bold rounded hover:bg-red-50">Notify Vendor</button>
                  </div>
              </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-4 items-start">
              <div className="p-2 bg-white rounded-full text-[#F59E0B] shadow-sm">
                  <Truck size={24} />
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[#92400E]">Late Shipment Warning</h3>
                      <span className="text-xs font-bold text-[#92400E]">30 mins ago</span>
                  </div>
                  <p className="text-sm text-[#92400E] mt-1">Shipment SHP-9924 from Tech Logistics is delayed by 2 hours.</p>
                  <div className="flex gap-3 mt-3">
                      <button className="px-3 py-1.5 bg-[#F59E0B] text-white text-xs font-bold rounded hover:bg-[#D97706]">Track</button>
                  </div>
              </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-4 items-start">
              <div className="p-2 bg-white rounded-full text-[#F97316] shadow-sm">
                  <Clock size={24} />
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <h3 className="font-bold text-[#9A3412]">PO Acknowledgment Overdue</h3>
                      <span className="text-xs font-bold text-[#9A3412]">1 hour ago</span>
                  </div>
                  <p className="text-sm text-[#9A3412] mt-1">PO-2024-0012 to Fresh Farms has not been acknowledged for 24 hours.</p>
                  <div className="flex gap-3 mt-3">
                      <button className="px-3 py-1.5 bg-white border border-orange-200 text-[#9A3412] text-xs font-bold rounded hover:bg-orange-50">Resend</button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
