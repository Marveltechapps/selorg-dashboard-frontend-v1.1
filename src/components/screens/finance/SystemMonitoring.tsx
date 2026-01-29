import React from 'react';
import { Activity, Server, Signal } from 'lucide-react';

export function SystemMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">System & Gateway Monitoring</h1>
          <p className="text-[#757575] text-sm">Real-time status of payment gateways and banking APIs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                  <Activity size={24} />
              </div>
              <div>
                  <p className="text-[#757575] text-sm font-medium">API Uptime</p>
                  <h3 className="text-2xl font-bold text-[#212121]">99.99%</h3>
              </div>
          </div>
           <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                  <Server size={24} />
              </div>
              <div>
                  <p className="text-[#757575] text-sm font-medium">Active Webhooks</p>
                  <h3 className="text-2xl font-bold text-[#212121]">12,450</h3>
              </div>
          </div>
           <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  <Signal size={24} />
              </div>
              <div>
                  <p className="text-[#757575] text-sm font-medium">Failed Retries</p>
                  <h3 className="text-2xl font-bold text-[#212121]">14</h3>
              </div>
          </div>
      </div>

      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
            <h3 className="font-bold text-[#212121]">Gateway Status</h3>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">Gateway</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Latency</th>
                <th className="px-6 py-3">Success Rate</th>
                <th className="px-6 py-3 text-right">Last Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              <tr className="hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 font-bold text-[#212121]">Stripe</td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">
                       Operational
                    </span>
                </td>
                <td className="px-6 py-4 text-[#616161]">124ms</td>
                <td className="px-6 py-4 text-[#16A34A] font-bold">99.8%</td>
                <td className="px-6 py-4 text-right text-[#616161]">Just now</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 font-bold text-[#212121]">PayPal</td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">
                       Operational
                    </span>
                </td>
                <td className="px-6 py-4 text-[#616161]">210ms</td>
                <td className="px-6 py-4 text-[#16A34A] font-bold">99.5%</td>
                <td className="px-6 py-4 text-right text-[#616161]">1 min ago</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 font-bold text-[#212121]">Local Bank API</td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B]">
                       Degraded
                    </span>
                </td>
                <td className="px-6 py-4 text-[#EF4444]">1200ms</td>
                <td className="px-6 py-4 text-[#EAB308] font-bold">85%</td>
                <td className="px-6 py-4 text-right text-[#616161]">30 secs ago</td>
              </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}
