import React, { useState, useRef } from 'react';
import { 
  Search, Download, Upload, X, 
  MoreVertical, Eye, Edit, FileText, MessageSquare,
  BarChart3, Pause, XCircle, Trash2, CheckCircle,
  AlertTriangle, MapPin, Send
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { VendorProfile } from './VendorProfile';
import { AddVendorModal } from './AddVendorModal';
import { PerformanceReportModal } from './PerformanceReportModal';

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  complianceStatus: 'Compliant' | 'Pending' | 'Non-Compliant';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Under Review';
  statusColor: string;
}

interface AddVendorFormData {
  vendorName: string;
  vendorType: string;
  category: string;
  tier: string;
  description: string;
  contactPerson: string;
  phonePrimary: string;
  phoneAlternate: string;
  email: string;
  fullAddress: string;
  city: string;
  state: string;
  postalCode: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankName: string;
  ifscCode: string;
  accountHolder: string;
  accountType: string;
}

export function VendorList() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [vendors, setVendors] = useState<Vendor[]>([
    { id: 'VND-0821', name: 'Global Spices Co.', category: 'Spices', phone: '+91-9876543210', email: 'vendor@spices.com', address: '123 Market St, Koyambedu...', complianceStatus: 'Compliant', status: 'Active', statusColor: 'green' },
    { id: 'VND-0834', name: 'Fresh Farms Inc.', category: 'Vegetables', phone: '+91-9876543211', email: 'hello@freshfarms.com', address: '456 Farm Road, Madras...', complianceStatus: 'Pending', status: 'Active', statusColor: 'green' },
    { id: 'VND-0845', name: 'Dairy Delights', category: 'Dairy / Perishables', phone: '+91-9876543212', email: 'sales@dairydelights.com', address: '789 Cool Lane, Chennai...', complianceStatus: 'Compliant', status: 'Under Review', statusColor: 'purple' },
    { id: 'VND-0852', name: 'PackRight Solutions', category: 'Packaging', phone: '+91-9876543213', email: 'info@packright.com', address: '321 Industrial Ave...', complianceStatus: 'Non-Compliant', status: 'Suspended', statusColor: 'yellow' },
    { id: 'VND-0863', name: 'Organic Greens Ltd.', category: 'Fresh Produce', phone: '+91-9876543214', email: 'contact@organicgreens.com', address: '654 Green Valley...', complianceStatus: 'Compliant', status: 'Active', statusColor: 'green' },
  ]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isPerformanceReportOpen, setIsPerformanceReportOpen] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeSection, setActiveSection] = useState<'basic' | 'contact' | 'bank' | 'documents'>('basic');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [documentTab, setDocumentTab] = useState<'verified' | 'pending' | 'rejected' | 'upload'>('verified');
  
  // Form states
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' });
  const [suspendReason, setSuspendReason] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const [formData, setFormData] = useState<AddVendorFormData>({
    vendorName: '', vendorType: '', category: '', tier: '', description: '',
    contactPerson: '', phonePrimary: '', phoneAlternate: '', email: '',
    fullAddress: '', city: '', state: 'Tamil Nadu', postalCode: '',
    gstNumber: '', panNumber: '', bankAccount: '', bankName: '',
    ifscCode: '', accountHolder: '', accountType: ''
  });
  
  const [editFormData, setEditFormData] = useState<AddVendorFormData>({
    vendorName: '', vendorType: '', category: '', tier: '', description: '',
    contactPerson: '', phonePrimary: '', phoneAlternate: '', email: '',
    fullAddress: '', city: '', state: 'Tamil Nadu', postalCode: '',
    gstNumber: '', panNumber: '', bankAccount: '', bankName: '',
    ifscCode: '', accountHolder: '', accountType: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleActionClick = (action: string, vendor: Vendor) => {
    setSelectedVendor(vendor);
    setOpenMenuId(null);
    
    switch(action) {
      case 'edit':
        setEditFormData({
          vendorName: vendor.name,
          category: vendor.category,
          phonePrimary: vendor.phone,
          email: vendor.email,
          fullAddress: vendor.address,
          vendorType: '', tier: '', description: '',
          contactPerson: '', phoneAlternate: '',
          city: '', state: 'Tamil Nadu', postalCode: '',
          gstNumber: '', panNumber: '', bankAccount: '', bankName: '',
          ifscCode: '', accountHolder: '', accountType: ''
        });
        setIsEditModalOpen(true);
        break;
      case 'documents':
        setDocumentTab('verified');
        setIsDocumentsModalOpen(true);
        break;
      case 'message':
        setMessageForm({ subject: '', message: '' });
        setIsMessageModalOpen(true);
        break;
      case 'suspend':
        setSuspendReason('');
        setIsSuspendDialogOpen(true);
        break;
      case 'deactivate':
        setDeactivateReason('');
        setIsDeactivateDialogOpen(true);
        break;
      case 'delete':
        setDeleteReason('');
        setDeleteConfirmation('');
        setIsDeleteDialogOpen(true);
        break;
      case 'view':
        setIsViewDetailsOpen(true);
        break;
      case 'performance':
        setIsPerformanceReportOpen(true);
        break;
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVendor) {
      setVendors(vendors.map(v => 
        v.id === selectedVendor.id 
          ? { ...v, name: editFormData.vendorName, category: editFormData.category, phone: editFormData.phonePrimary, email: editFormData.email, address: editFormData.fullAddress }
          : v
      ));
      setIsEditModalOpen(false);
      showToast('success', `✓ Changes saved successfully. "${editFormData.vendorName}" has been updated.`);
      setActiveSection('basic');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMessageModalOpen(false);
    showToast('success', `✓ Message sent successfully to "${selectedVendor?.name}".`);
    setMessageForm({ subject: '', message: '' });
  };

  const handleSuspend = () => {
    if (selectedVendor) {
      setVendors(vendors.map(v => 
        v.id === selectedVendor.id 
          ? { ...v, status: 'Suspended', statusColor: 'yellow' }
          : v
      ));
      setIsSuspendDialogOpen(false);
      showToast('warning', `✓ Vendor suspended successfully. "${selectedVendor.name}" no longer receives new orders.`);
    }
  };

  const handleDeactivate = () => {
    if (selectedVendor) {
      setVendors(vendors.map(v => 
        v.id === selectedVendor.id 
          ? { ...v, status: 'Inactive', statusColor: 'red' }
          : v
      ));
      setIsDeactivateDialogOpen(false);
      showToast('warning', `✓ Vendor deactivated successfully. "${selectedVendor.name}" is now inactive.`);
    }
  };

  const handleDelete = () => {
    if (selectedVendor && deleteConfirmation === selectedVendor.name && deleteReason.trim()) {
      setVendors(vendors.filter(v => v.id !== selectedVendor.id));
      setIsDeleteDialogOpen(false);
      sonnerToast.success(`Vendor "${selectedVendor.name}" deleted permanently`);
      setDeleteConfirmation('');
      setDeleteReason('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.vendorName && formData.category && formData.phonePrimary && formData.email) {
      const newVendorId = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
      const newVendor: Vendor = {
        id: newVendorId,
        name: formData.vendorName,
        category: formData.category,
        phone: formData.phonePrimary,
        email: formData.email,
        address: formData.fullAddress || 'Address not provided',
        complianceStatus: 'Pending',
        status: 'Active',
        statusColor: 'green'
      };
      setVendors([newVendor, ...vendors]);
      setFormData({
        vendorName: '', vendorType: '', category: '', tier: '', description: '',
        contactPerson: '', phonePrimary: '', phoneAlternate: '', email: '',
        fullAddress: '', city: '', state: 'Tamil Nadu', postalCode: '',
        gstNumber: '', panNumber: '', bankAccount: '', bankName: '',
        ifscCode: '', accountHolder: '', accountType: ''
      });
      setIsAddModalOpen(false);
      setActiveSection('basic');
      showToast('success', `✓ Vendor \"${formData.vendorName}\" added successfully!`);
    }
  };

  // Handler for AddVendorModal (accepts formData from modal)
  const handleAddVendorSubmit = (formData: any) => {
    const newVendorId = `VND-${Math.floor(1000 + Math.random() * 9000)}`;
    const newVendor: Vendor = {
      id: newVendorId,
      name: formData.vendorName,
      category: Array.isArray(formData.selectedCategories) ? formData.selectedCategories.join(', ') : 'General',
      phone: formData.phonePrimary,
      email: formData.email,
      address: formData.fullAddress || 'Address not provided',
      complianceStatus: 'Pending',
      status: 'Under Review',
      statusColor: 'purple'
    };
    setVendors([newVendor, ...vendors]);
    setIsAddModalOpen(false);
    sonnerToast.success(`Vendor "${formData.vendorName}" added successfully!`);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleDownloadReport = () => {
    try {
      const headers = ['Vendor ID', 'Name', 'Category', 'Phone', 'Email', 'Address', 'Compliance', 'Status'];
      const rows = filteredVendors.map((v) => [
        v.id,
        v.name,
        v.category,
        v.phone,
        v.email,
        v.address,
        v.complianceStatus,
        v.status,
      ]);

      const csvContent =
        [headers, ...rows]
          .map((row) =>
            row
              .map((cell) => {
                const safe = String(cell ?? '').replace(/"/g, '""');
                return `"${safe}"`;
              })
              .join(','),
          )
          .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendor-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      sonnerToast.success('Vendor report downloaded');
    } catch (error) {
      sonnerToast.error('Failed to download vendor report');
      // eslint-disable-next-line no-console
      console.error('Download report error:', error);
    }
  };

  const handleBulkImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        sonnerToast.success(`File selected: ${file.name}. Processing bulk import...`);
        // Reset the input so the same file can be selected again
        e.target.value = '';
      } else {
        sonnerToast.error('Invalid file type. Please select a CSV or Excel file.');
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`min-w-[400px] px-6 py-4 rounded-lg shadow-2xl flex items-start gap-3 ${
            toast.type === 'success' ? 'bg-[#10B981] text-white' :
            toast.type === 'warning' ? 'bg-[#F59E0B] text-[#1F2937]' :
            'bg-[#EF4444] text-white'
          }`}>
            <div className="flex-1">
              <p className="font-medium">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="hover:opacity-80">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-[#6B7280] mb-1">Vendor Overview &gt; Vendor List</div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Vendor List</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage all vendors and suppliers</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBulkImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6]"
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button 
            onClick={handleDownloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6]"
          >
            <Download size={16} />
            Download Report
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA]"
          >
            <span className="text-lg">+</span>
            Add Vendor
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280]" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, ID, phone, email..."
                className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
            <option>Under Review</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5]"
          >
            <option>All Categories</option>
            <option>Vegetables</option>
            <option>Fruits</option>
            <option>Spices</option>
            <option>Dairy / Perishables</option>
            <option>Packaged Goods</option>
            <option>Fresh Produce</option>
            <option>Packaging</option>
          </select>

          {(searchQuery || statusFilter !== 'All Status' || categoryFilter !== 'All Categories') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Status');
                setCategoryFilter('All Categories');
              }}
              className="text-sm text-[#4F46E5] hover:underline font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-[#6B7280]">
        Showing {filteredVendors.length} of {vendors.length} vendors
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-bold text-[#1F2937] mb-2">No vendors found</h3>
            <p className="text-[#6B7280] text-sm mb-6">
              {searchQuery || statusFilter !== 'All Status' || categoryFilter !== 'All Categories'
                ? 'Try adjusting your filters'
                : 'Ready to add your first vendor?'}
            </p>
            {!searchQuery && statusFilter === 'All Status' && categoryFilter === 'All Categories' && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA]"
              >
                + Add Vendor
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left">Vendor ID</th>
                  <th className="px-6 py-3 text-left">Vendor Name</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Phone No.</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Address</th>
                  <th className="px-6 py-3 text-left">Compliance</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-[#F3F4F6] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">{vendor.id}</td>
                    <td className="px-6 py-4 font-semibold text-[#1F2937]">{vendor.name}</td>
                    <td className="px-6 py-4 text-[#6B7280]">{vendor.category}</td>
                    <td className="px-6 py-4 text-[#1F2937]">{vendor.phone}</td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${vendor.email}`} className="text-[#4F46E5] hover:underline">
                        {vendor.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-[#6B7280] max-w-[200px] truncate" title={vendor.address}>
                      {vendor.address}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.complianceStatus === 'Compliant' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        vendor.complianceStatus === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#FEE2E2] text-[#7F1D1D]'
                      }`}>
                        {vendor.complianceStatus === 'Compliant' && '✓'}
                        {vendor.complianceStatus === 'Pending' && '⚠'}
                        {vendor.complianceStatus === 'Non-Compliant' && '✕'}
                        {vendor.complianceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' :
                        vendor.status === 'Inactive' ? 'bg-[#FEE2E2] text-[#7F1D1D]' :
                        vendor.status === 'Suspended' ? 'bg-[#FEF3C7] text-[#92400E]' :
                        'bg-[#EDE9FE] text-[#5B21B6]'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === vendor.id ? null : vendor.id)}
                        className="p-1 hover:bg-[#F3F4F6] rounded"
                      >
                        <MoreVertical size={18} className="text-[#6B7280]" />
                      </button>
                      
                      {openMenuId === vendor.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 bg-white border border-[#E5E7EB] rounded-lg shadow-xl py-1 w-56">
                            <button 
                              onClick={() => handleActionClick('view', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 text-[#4F46E5]"
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <button 
                              onClick={() => handleActionClick('edit', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 text-[#4F46E5]"
                            >
                              <Edit size={14} /> Edit Vendor
                            </button>
                            <button 
                              onClick={() => handleActionClick('documents', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 text-[#1F2937]"
                            >
                              <FileText size={14} /> View Documents
                            </button>
                            <button 
                              onClick={() => handleActionClick('message', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 text-[#1F2937]"
                            >
                              <MessageSquare size={14} /> Send Message
                            </button>
                            <button 
                              onClick={() => handleActionClick('performance', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 text-[#1F2937]"
                            >
                              <BarChart3 size={14} /> Performance Report
                            </button>
                            <div className="border-t border-[#E5E7EB] my-1" />
                            <button 
                              onClick={() => handleActionClick('suspend', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#FEF3C7] flex items-center gap-2 text-[#92400E]"
                            >
                              <Pause size={14} /> Suspend Vendor
                            </button>
                            <button 
                              onClick={() => handleActionClick('deactivate', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#FEE2E2] flex items-center gap-2 text-[#EF4444]"
                            >
                              <XCircle size={14} /> Deactivate
                            </button>
                            <button 
                              onClick={() => handleActionClick('delete', vendor)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[#FEE2E2] flex items-center gap-2 text-[#EF4444]"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Vendor Modal - Same structure as Add Vendor but with pre-filled data */}
      {isEditModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Edit Vendor</h2>
                  <p className="text-sm text-[#6B7280] mt-1">Update vendor information</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] p-1 hover:bg-[#F3F4F6] rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 mt-4 overflow-x-auto">
                <button
                  onClick={() => setActiveSection('basic')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                    activeSection === 'basic' ? 'bg-[#4F46E5] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveSection('contact')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                    activeSection === 'contact' ? 'bg-[#4F46E5] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  Contact & Address
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSave} className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeSection === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#1F2937] mb-2">
                        Vendor Name <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.vendorName}
                        onChange={(e) => setEditFormData({ ...editFormData, vendorName: e.target.value })}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#1F2937] mb-2">
                        Category <span className="text-[#EF4444]">*</span>
                      </label>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                        <option value="Spices">Spices</option>
                        <option value="Dairy / Perishables">Dairy / Perishables</option>
                        <option value="Packaged Goods">Packaged Goods</option>
                        <option value="Fresh Produce">Fresh Produce</option>
                        <option value="Packaging">Packaging</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSection === 'contact' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#1F2937] mb-2">
                        Phone Number <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phonePrimary}
                        onChange={(e) => setEditFormData({ ...editFormData, phonePrimary: e.target.value })}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#1F2937] mb-2">
                        Email <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#1F2937] mb-2">
                        Full Address
                      </label>
                      <textarea
                        value={editFormData.fullAddress}
                        onChange={(e) => setEditFormData({ ...editFormData, fullAddress: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2 border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-bold hover:bg-[#4338CA] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {isDocumentsModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDocumentsModalOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Vendor Documents</h2>
                  <p className="text-sm text-[#6B7280] mt-1">{selectedVendor.name}</p>
                </div>
                <button 
                  onClick={() => setIsDocumentsModalOpen(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] p-1 hover:bg-[#F3F4F6] rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-2 border-b border-[#E5E7EB]">
                {(['verified', 'pending', 'rejected', 'upload'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDocumentTab(tab)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      documentTab === tab
                        ? 'border-[#4F46E5] text-[#4F46E5]'
                        : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                  >
                    {tab === 'verified' && '✓ Verified'}
                    {tab === 'pending' && '⚠ Pending'}
                    {tab === 'rejected' && '✕ Rejected'}
                    {tab === 'upload' && '📤 Upload New'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {documentTab === 'verified' && (
                <div className="space-y-3">
                  {[
                    { name: 'GST Certificate', expiry: '2026-01-15' },
                    { name: 'FSSAI License', expiry: '2025-12-31' },
                    { name: 'Insurance Certificate', expiry: '2026-06-30' }
                  ].map((doc, i) => (
                    <div key={i} className="p-4 border border-[#E5E7EB] rounded-lg hover:border-[#4F46E5] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-[#4F46E5]" />
                          <div>
                            <p className="font-medium text-[#1F2937]">{doc.name}</p>
                            <p className="text-xs text-[#6B7280]">Expires: {doc.expiry}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#F0F7FF] rounded">
                            View
                          </button>
                          <button className="px-3 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#F0F7FF] rounded">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {documentTab === 'pending' && (
                <div className="text-center py-12">
                  <AlertTriangle size={48} className="mx-auto text-[#F59E0B] mb-3" />
                  <p className="text-[#6B7280]">No pending documents</p>
                </div>
              )}

              {documentTab === 'rejected' && (
                <div className="text-center py-12">
                  <XCircle size={48} className="mx-auto text-[#EF4444] mb-3" />
                  <p className="text-[#6B7280]">No rejected documents</p>
                </div>
              )}

              {documentTab === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-[#D1D5DB] rounded-lg p-8 text-center hover:border-[#4F46E5] transition-colors cursor-pointer">
                    <Upload size={48} className="mx-auto text-[#6B7280] mb-3" />
                    <p className="font-medium text-[#1F2937] mb-1">Drag files here or click to browse</p>
                    <p className="text-xs text-[#6B7280]">Accepted: PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <select className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm">
                    <option>Select document type</option>
                    <option>GST Certificate</option>
                    <option>FSSAI License</option>
                    <option>Business License</option>
                    <option>ISO Certificate</option>
                    <option>Insurance Certificate</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] flex justify-end">
              <button
                onClick={() => setIsDocumentsModalOpen(false)}
                className="px-6 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-bold hover:bg-[#4338CA]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {isMessageModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsMessageModalOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E5E7EB]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#1F2937]">Send Message</h2>
                  <p className="text-sm text-[#6B7280] mt-1">To: {selectedVendor.name}</p>
                </div>
                <button 
                  onClick={() => setIsMessageModalOpen(false)}
                  className="text-[#6B7280] hover:text-[#1F2937] p-1 hover:bg-[#F3F4F6] rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">
                  Subject <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={messageForm.subject}
                  onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                  placeholder="Enter subject"
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1F2937] mb-2">
                  Message <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  required
                />
                <div className="text-xs text-[#6B7280] text-right mt-1">{messageForm.message.length}/1000 characters</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-bold hover:bg-[#4338CA] flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Dialog */}
      {isSuspendDialogOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsSuspendDialogOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto mb-3">
                <Pause size={24} className="text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Suspend Vendor?</h3>
              <p className="text-sm text-[#6B7280] mb-4">
                Are you sure you want to suspend <span className="font-bold text-[#1F2937]">"{selectedVendor.name}"</span>?
              </p>
            </div>

            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-3 mb-4 text-sm text-[#92400E]">
              <p className="font-medium mb-2">Suspended vendors will:</p>
              <ul className="space-y-1 text-xs">
                <li>• Not receive new orders</li>
                <li>• Keep existing orders active</li>
                <li>• Can be reactivated anytime</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F2937] mb-2">
                Reason (optional)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                rows={2}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsSuspendDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="flex-1 px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-bold hover:bg-[#D97706]"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      {isDeactivateDialogOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDeactivateDialogOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle size={24} className="text-[#F97316]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Deactivate Vendor?</h3>
              <p className="text-sm text-[#6B7280] mb-4">
                Are you sure you want to deactivate <span className="font-bold text-[#1F2937]">"{selectedVendor.name}"</span>?
              </p>
            </div>

            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3 mb-4 text-sm text-[#7F1D1D]">
              <p className="font-medium mb-2">Deactivated vendors:</p>
              <ul className="space-y-1 text-xs">
                <li>• Will not receive new orders</li>
                <li>• Existing orders paused</li>
                <li>• Can be reactivated anytime</li>
              </ul>
              <p className="text-xs mt-2 pt-2 border-t border-[#FECACA]">
                Note: This is a soft deactivate. To permanently delete, use Delete option.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F2937] mb-2">
                Reason (optional)
              </label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Enter reason for deactivation..."
                rows={2}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeactivateDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="flex-1 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-bold hover:bg-[#EA580C]"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsDeleteDialogOpen(false)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 size={24} className="text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-bold text-[#1F2937] mb-2">Delete Vendor?</h3>
              
              <div className="bg-[#FEE2E2] border-2 border-[#EF4444] rounded-lg p-3 mb-4 text-sm text-[#7F1D1D]">
                <p className="font-bold text-[#EF4444] mb-2">⚠️ DANGER: This action is PERMANENT and CANNOT be undone!</p>
              </div>

              <p className="text-sm text-[#6B7280] mb-4">
                You are about to delete: <span className="font-bold text-[#1F2937]">"{selectedVendor.name}"</span> ({selectedVendor.id})
              </p>
            </div>

            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3 mb-4 text-sm text-[#7F1D1D]">
              <p className="font-medium mb-2">This will:</p>
              <ul className="space-y-1 text-xs">
                <li>✕ Permanently remove all data</li>
                <li>✕ Delete all associated orders</li>
                <li>✕ Remove all documents</li>
                <li>✕ Cannot be recovered</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F2937] mb-2">
                Type vendor name to confirm <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={`Type: ${selectedVendor.name}`}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
              />
              {deleteConfirmation && deleteConfirmation !== selectedVendor.name && (
                <p className="text-xs text-[#EF4444] mt-1">Name does not match</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F2937] mb-2">
                Reason for deletion <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason for deletion..."
                rows={2}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="flex-1 px-4 py-2 border border-[#D1D5DB] rounded-lg text-sm font-bold text-[#1F2937] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== selectedVendor.name || !deleteReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  deleteConfirmation === selectedVendor.name && deleteReason.trim()
                    ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                    : 'bg-[#D1D5DB] text-[#9CA3AF] cursor-not-allowed'
                }`}
              >
                PERMANENTLY DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <AddVendorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddVendorSubmit}
        />
      )}

      {/* View Details Modal */}
      {isViewDetailsOpen && selectedVendor && (
        <VendorProfile 
          vendor={selectedVendor}
          onClose={() => setIsViewDetailsOpen(false)}
          onEdit={() => {
            setIsViewDetailsOpen(false);
            handleActionClick('edit', selectedVendor);
          }}
          onMessage={() => {
            setIsViewDetailsOpen(false);
            handleActionClick('message', selectedVendor);
          }}
          onViewDocs={() => {
            setIsViewDetailsOpen(false);
            handleActionClick('documents', selectedVendor);
          }}
          onSuspend={() => {
            setIsViewDetailsOpen(false);
            handleActionClick('suspend', selectedVendor);
          }}
        />
      )}

      {/* Performance Report Modal */}
      {isPerformanceReportOpen && selectedVendor && (
        <PerformanceReportModal
          vendor={selectedVendor}
          onClose={() => setIsPerformanceReportOpen(false)}
        />
      )}

      {/* Hidden File Input for Bulk Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}