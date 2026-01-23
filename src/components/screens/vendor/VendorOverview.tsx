import React, { useState } from 'react';
import { Users, AlertTriangle, Truck, Star, Clock, X, ChevronDown, FileText, Download, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../ui/page-header';
import { exportToCSV, exportToCSVForExcel } from '../../../utils/csvExport';
import { exportToPDF } from '../../../utils/pdfExport';
import { EmptyState } from '../../ui/ux-components';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

function MetricCard({ label, value, subValue, trend, trendUp, icon, color = "indigo" }: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[#757575] font-medium text-xs uppercase tracking-wider">{label}</span>
        {icon && <div className={`text-${color}-500 p-1.5 bg-${color}-50 rounded-lg`}>{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#212121]">{value}</span>
        {subValue && <span className="text-sm text-[#757575] mb-1">{subValue}</span>}
      </div>
      {trend && (
        <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export function VendorOverview() {
  const [vendors, setVendors] = useState([
    { id: 'VND-8821', name: 'Global Spices Co.', category: 'Grocery / Spices', rating: '4.8', status: 'Active', statusColor: 'green' },
    { id: 'VND-8824', name: 'Dairy Delights Ltd.', category: 'Dairy / Perishables', rating: '4.5', status: 'Review Due', statusColor: 'yellow' },
    { id: 'VND-9901', name: 'PackRight Solutions', category: 'Packaging', rating: '4.2', status: 'On Hold', statusColor: 'red' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    contactPerson: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category) {
      const newVendorId = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
      setVendors([{
        id: newVendorId,
        name: formData.name,
        category: formData.category,
        rating: '4.0',
        status: 'Active',
        statusColor: 'green'
      }, ...vendors]);
      setFormData({ name: '', category: '', contactPerson: '', email: '', phone: '' });
      setIsDialogOpen(false);
    }
  };

  const handleDownload = (format: string) => {
    setShowDownloadMenu(false);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      if (format.toLowerCase() === 'csv' || format.toLowerCase() === 'xlsx') {
        const csvData: (string | number)[][] = [
          ['Vendor Overview Report', `Date: ${today}`, `Time: ${timestamp}`],
          [''],
          ['Vendor ID', 'Name', 'Category', 'Rating', 'Status'],
          ...filteredVendors.map(v => [
            v.id,
            v.name,
            v.category,
            v.rating,
            v.status
          ]),
        ];
        exportToCSVForExcel(csvData, `vendor-overview-${today}-${timestamp.replace(/:/g, '-')}`);
      } else if (format.toLowerCase() === 'pdf') {
        const htmlContent = `
          <h1>Vendor Overview Report</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
            <tr>
              <th>Vendor ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
            ${filteredVendors.map(v => `
              <tr>
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.category}</td>
                <td>${v.rating}</td>
                <td>${v.status}</td>
              </tr>
            `).join('')}
          </table>
        `;
        exportToPDF(htmlContent, `vendor-overview-${today}`);
      }
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const handleViewVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowVendorDetail(true);
  };

  const handleToggleVendorStatus = (vendorId: string) => {
    setVendors(vendors.map(v => {
      if (v.id === vendorId) {
        if (v.statusColor === 'red') {
          return { ...v, status: 'Active', statusColor: 'green' };
        } else {
          return { ...v, status: 'On Hold', statusColor: 'red' };
        }
      }
      return v;
    }));
    setShowVendorDetail(false);
  };

  const filteredVendors = vendors.filter(vendor => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return vendor.status === 'Active';
    if (filterStatus === 'review') return vendor.status === 'Review Due';
    if (filterStatus === 'hold') return vendor.status === 'On Hold';
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Overview"
        subtitle="Supplier performance, active relationships, and health monitoring"
        actions={
          <button 
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-[#1677FF] text-white font-medium rounded-lg hover:bg-[#409EFF] flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Vendor
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Active Vendors" 
          value="142" 
          subValue="+3 pending"
          trend="Steady Growth"
          trendUp={true}
          icon={<Users size={18} />}
          color="indigo"
        />
        <MetricCard 
          label="SLA Compliance" 
          value="94.2%" 
          trend="Above Target"
          trendUp={true}
          icon={<Clock size={18} />}
          color="green"
        />
        <MetricCard 
          label="Open POs" 
          value="28" 
          subValue="$1.2M Value"
          trend="High Volume"
          trendUp={true}
          icon={<Truck size={18} />}
          color="blue"
        />
        <MetricCard 
          label="Critical Alerts" 
          value="4" 
          trend="Needs Attention"
          trendUp={false}
          icon={<AlertTriangle size={18} />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Health Monitor */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm p-6">
              <h3 className="font-bold text-[#212121] mb-4">Vendor Health Monitor</h3>
              <div className="space-y-4">
                  <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#212121]">Delivery Timeliness</span>
                              <span className="font-bold text-green-600">92%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-[92%]"></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#212121]">Product Quality</span>
                              <span className="font-bold text-blue-600">98%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 w-[98%]"></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-[#212121]">Compliance Status</span>
                              <span className="font-bold text-orange-600">85%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 w-[85%]"></div>
                          </div>
                      </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#F5F5F5]">
                      <h4 className="text-xs font-bold text-[#757575] uppercase mb-2">Top Performers</h4>
                      <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-[#F0FDF4] text-[#166534] text-xs font-medium rounded border border-[#DCFCE7]">Fresh Farms Inc.</span>
                          <span className="px-2 py-1 bg-[#F0FDF4] text-[#166534] text-xs font-medium rounded border border-[#DCFCE7]">Tech Logistics</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Active Vendor List */}
          <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
              <h3 className="font-bold text-[#212121]">Live Vendor Dashboard</h3>
              <div className="relative">
                 <button 
                   onClick={() => setShowFilterMenu(!showFilterMenu)}
                   className="text-xs font-medium px-2 py-1 bg-[#E0E7FF] text-[#4F46E5] rounded hover:bg-[#C7D2FE] flex items-center gap-2"
                 >
                   Filter: {filterStatus === 'all' ? 'All' : filterStatus}
                   <ChevronDown size={16} className={`transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`} />
                 </button>
                 {/* Filter Dropdown Menu */}
                 {showFilterMenu && (
                   <>
                     <div 
                       className="fixed inset-0 z-10" 
                       onClick={() => setShowFilterMenu(false)}
                     />
                     <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-20 py-1">
                       <button 
                         onClick={() => { setFilterStatus('all'); setShowFilterMenu(false); }}
                         className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors"
                       >
                         <span>All</span>
                       </button>
                       <button 
                         onClick={() => { setFilterStatus('active'); setShowFilterMenu(false); }}
                         className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors"
                       >
                         <span>Active</span>
                       </button>
                       <button 
                         onClick={() => { setFilterStatus('review'); setShowFilterMenu(false); }}
                         className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors"
                       >
                         <span>Review Due</span>
                       </button>
                       <button 
                         onClick={() => { setFilterStatus('hold'); setShowFilterMenu(false); }}
                         className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors"
                       >
                         <span>On Hold</span>
                       </button>
                     </div>
                   </>
                 )}
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                <tr>
                  <th className="px-6 py-3">Vendor Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {filteredVendors.map((vendor, index) => (
                  <tr key={index} className="hover:bg-[#FAFAFA]">
                    <td className="px-6 py-4">
                        <p className="font-medium text-[#212121]">{vendor.name}</p>
                        <p className="text-xs text-[#757575]">ID: {vendor.id}</p>
                    </td>
                    <td className="px-6 py-4 text-[#616161]">{vendor.category}</td>
                    <td className="px-6 py-4 flex items-center gap-1 text-[#F59E0B] font-bold">
                      <Star size={14} fill="#F59E0B" /> {vendor.rating}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.statusColor === 'green' ? 'bg-[#DCFCE7] text-[#166534]' :
                        vendor.statusColor === 'yellow' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#FEE2E2] text-[#991B1B]'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#4F46E5] hover:text-[#4338CA] font-medium text-xs" onClick={() => handleViewVendor(vendor)}>
                        {vendor.statusColor === 'red' ? 'Manage' : 'Profile'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

      {/* Add Vendor Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsDialogOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#212121] text-lg">Add New Vendor</h3>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="text-[#616161] hover:text-[#212121] p-1 hover:bg-[#F5F5F5] rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#212121] mb-2">
                  Vendor Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter vendor name"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#212121] mb-2">
                  Category <span className="text-[#EF4444]">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Grocery / Spices">Grocery / Spices</option>
                  <option value="Dairy / Perishables">Dairy / Perishables</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Frozen Foods">Frozen Foods</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Cleaning Supplies">Cleaning Supplies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#212121] mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Primary contact name"
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[#212121] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vendor@example.com"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#212121] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#616161] hover:bg-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-bold hover:bg-[#4338CA] transition-colors"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Detail Dialog */}
      {showVendorDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowVendorDetail(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#212121] text-lg">Vendor Details</h3>
              <button 
                onClick={() => setShowVendorDetail(false)}
                className="text-[#616161] hover:text-[#212121] p-1 hover:bg-[#F5F5F5] rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Vendor Name</span>
                    <span className="font-bold text-[#212121]">{selectedVendor.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Category</span>
                    <span className="font-bold text-[#212121]">{selectedVendor.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Rating</span>
                    <span className="font-bold text-[#F59E0B]">{selectedVendor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedVendor.statusColor === 'green' ? 'bg-[#DCFCE7] text-[#166534]' :
                      selectedVendor.statusColor === 'yellow' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Contact Person</span>
                    <span className="font-bold text-[#212121]">{selectedVendor.contactPerson}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Email</span>
                    <span className="font-bold text-[#212121]">{selectedVendor.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#212121]">Phone</span>
                    <span className="font-bold text-[#212121]">{selectedVendor.phone}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleToggleVendorStatus(selectedVendor.id)}
                  className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#616161] hover:bg-[#F5F5F5] transition-colors"
                >
                  {selectedVendor.statusColor === 'red' ? 'Activate' : 'Hold'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}