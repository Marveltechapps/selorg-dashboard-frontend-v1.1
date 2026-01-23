import React from 'react';
import { Database, Plus, Search, Filter, MoreHorizontal, User, Shield, Key } from 'lucide-react';

export function MasterData() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Master Data Management</h1>
          <p className="text-[#71717a] text-sm">Centralized control for all system entities.</p>
        </div>
      </div>

      <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          {/* Tabs */}
          <div className="flex border-b border-[#e4e4e7] overflow-x-auto custom-scrollbar">
              {['Cities', 'Zones', 'Stores', 'Warehouses', 'Riders', 'Employees', 'Vehicle Types', 'SKU Units'].map((tab, i) => (
                  <button 
                    key={tab} 
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${i === 2 ? 'border-[#e11d48] text-[#e11d48] bg-rose-50/50' : 'border-transparent text-[#71717a] hover:text-[#18181b] hover:bg-[#fcfcfc]'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>

          {/* Controls */}
          <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa]" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search stores..." 
                        className="h-9 pl-9 pr-4 rounded-lg bg-white border border-[#e4e4e7] text-sm focus:ring-2 focus:ring-[#e11d48] focus:border-transparent w-64 shadow-sm"
                      />
                  </div>
                  <button className="h-9 px-3 bg-white border border-[#e4e4e7] rounded-lg text-sm text-[#71717a] hover:text-[#18181b] flex items-center gap-2 shadow-sm">
                      <Filter size={14} /> Filters
                  </button>
              </div>
              <button className="h-9 px-4 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] flex items-center gap-2 shadow-lg shadow-zinc-500/20">
                  <Plus size={14} /> Add New Store
              </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-[#f9fafb] text-[#71717a] font-medium border-b border-[#e4e4e7] sticky top-0 z-10">
                      <tr>
                          <th className="px-6 py-3">Store ID</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">City / Zone</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Manager</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e4e7]">
                      {[1,2,3,4,5,6,7,8].map((i) => (
                          <tr key={i} className="hover:bg-[#fcfcfc] group">
                              <td className="px-6 py-4 font-mono text-[#71717a]">ST-10{i}</td>
                              <td className="px-6 py-4">
                                  <div className="font-medium text-[#18181b]">Indiranagar Central {i}</div>
                                  <div className="text-xs text-[#71717a]">12th Main Road</div>
                              </td>
                              <td className="px-6 py-4 text-[#52525b]">Bangalore • Zone 5</td>
                              <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      Dark Store
                                  </span>
                              </td>
                              <td className="px-6 py-4">
                                  {i === 2 ? (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Offline
                                      </span>
                                  ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                      </span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-[#52525b]">
                                  <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-[#f4f4f5] border border-[#e4e4e7] flex items-center justify-center text-[10px]">VM</div>
                                      Vikram M.
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="p-1.5 text-[#a1a1aa] hover:text-[#18181b] hover:bg-[#f4f4f5] rounded transition-colors">
                                      <MoreHorizontal size={16} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}

export function UserManagement() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">User & Role Management</h1>
          <p className="text-[#71717a] text-sm">RBAC configuration and access logs.</p>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc] flex justify-between items-center">
                    <h3 className="font-bold text-[#18181b]">System Users</h3>
                    <button className="text-xs font-medium text-[#18181b] border border-[#e4e4e7] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#f4f4f5]">
                        + Add User
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#f9fafb] text-[#71717a] font-medium border-b border-[#e4e4e7]">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Access Level</th>
                            <th className="px-6 py-3">Last Login</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e4e7]">
                        <tr>
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">AD</div>
                                <div>
                                    <div className="font-bold text-[#18181b]">Admin User</div>
                                    <div className="text-xs text-[#71717a]">admin@platform.com</div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded border border-zinc-200 text-xs font-bold">Super Admin</span></td>
                            <td className="px-6 py-4 text-[#52525b] text-xs">Full Access (Root)</td>
                            <td className="px-6 py-4 text-[#71717a] text-xs">Just Now</td>
                        </tr>
                         <tr>
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">DS</div>
                                <div>
                                    <div className="font-bold text-[#18181b]">Darkstore Mgr</div>
                                    <div className="text-xs text-[#71717a]">ops@indiranagar.com</div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 text-xs font-bold">Store Manager</span></td>
                            <td className="px-6 py-4 text-[#52525b] text-xs">Zone 5 Only</td>
                            <td className="px-6 py-4 text-[#71717a] text-xs">2 hours ago</td>
                        </tr>
                    </tbody>
                </table>
           </div>

           <div className="space-y-6">
                <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm p-4">
                    <h3 className="font-bold text-[#18181b] mb-4 flex items-center gap-2">
                        <Shield size={16} /> Roles & Permissions
                    </h3>
                    <div className="space-y-2">
                        {['Super Admin', 'City Manager', 'Store Manager', 'Finance Lead', 'Support Agent'].map((role) => (
                            <div key={role} className="flex justify-between items-center p-2 hover:bg-[#f4f4f5] rounded cursor-pointer border border-transparent hover:border-[#e4e4e7] transition-all">
                                <span className="text-sm text-[#52525b] font-medium">{role}</span>
                                <MoreHorizontal size={14} className="text-[#a1a1aa]" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 border border-dashed border-[#d4d4d8] text-[#71717a] text-xs font-medium rounded hover:bg-[#f4f4f5] hover:text-[#18181b] transition-colors">
                        + Create New Role
                    </button>
                </div>

                 <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm p-4">
                    <h3 className="font-bold text-[#18181b] mb-4 flex items-center gap-2">
                        <Key size={16} /> Recent Access Logs
                    </h3>
                    <div className="space-y-3">
                        <div className="text-xs">
                            <p className="font-bold text-[#18181b]">Super Admin</p>
                            <p className="text-[#71717a]">Updated "Pricing Rules"</p>
                            <p className="text-[10px] text-[#a1a1aa] mt-0.5">10 mins ago • IP 192.168.1.1</p>
                        </div>
                        <div className="w-full h-px bg-[#e4e4e7]"></div>
                         <div className="text-xs">
                            <p className="font-bold text-[#18181b]">Darkstore Mgr</p>
                            <p className="text-[#71717a]">Viewed "Inventory Report"</p>
                            <p className="text-[10px] text-[#a1a1aa] mt-0.5">25 mins ago • IP 192.168.1.42</p>
                        </div>
                    </div>
                </div>
           </div>
       </div>
    </div>
  );
}
