import React from 'react';
import { Wrench, Database, Calculator, Calendar } from 'lucide-react';

export function UtilitiesTools() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Utilities & Tools</h1>
          <p className="text-[#757575] text-sm">Tax calculators, currency converters, and data tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Calculator size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Tax Calculator</h3>
              <p className="text-sm text-[#757575] mt-1">Estimate GST/VAT for cross-border transactions.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Calendar size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Fiscal Calendar</h3>
              <p className="text-sm text-[#757575] mt-1">Manage financial year periods and closing dates.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Database size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Data Export</h3>
              <p className="text-sm text-[#757575] mt-1">Bulk export of ledgers and transaction history.</p>
          </div>
      </div>
    </div>
  );
}
