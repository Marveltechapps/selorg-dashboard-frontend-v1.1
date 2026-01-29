import React from 'react';
import { Upload, FileText, Database } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';

export function VendorUtilities() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilities & Vendor Tools"
        subtitle="Bulk actions, document management, and scorecards"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Upload size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Bulk Vendor Upload</h3>
              <p className="text-sm text-[#757575] mt-1">Import new vendors via CSV/Excel.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <FileText size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Contract Manager</h3>
              <p className="text-sm text-[#757575] mt-1">Repository of all vendor agreements.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Database size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Audit Logs</h3>
              <p className="text-sm text-[#757575] mt-1">View system access and change history.</p>
          </div>
      </div>
    </div>
  );
}