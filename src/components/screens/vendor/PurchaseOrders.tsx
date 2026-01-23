import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Plus, 
  Filter, 
  ChevronDown, 
  MoreVertical,
  X,
  Calendar,
  CloudUpload,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  FileText,
  Edit,
  Share2,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { exportToPDF } from '../../../utils/pdfExport';

import * as purchaseOrdersApi from '../../../api/vendor/purchaseOrders.api';

// Types
type POStatus = 'Pending Approval' | 'Sent' | 'Partially Received' | 'Fully Received' | 'Cancelled' | 'On Hold';
type PaymentTerms = 'Net 15' | 'Net 30' | 'COD' | 'Custom';
type POType = 'Standard' | 'Blanket PO' | 'Contract Release';

interface LineItem {
  sku: string;
  product: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  vendorContact: string;
  vendorEmail: string;
  vendorPhone: string;
  createdDate: string;
  deliveryDue: string;
  totalValue: number;
  status: POStatus;
  poType: POType;
  category: string;
  referenceNumber?: string;
  paymentTerms: PaymentTerms;
  lineItems: LineItem[];
  notes?: string;
  subtotal: number;
  tax: number;
  createdBy: string;
  sentDate?: string;
  receivedDate?: string;
  quantityReceived?: number;
  totalQuantity?: number;
}


// Status Badge Component
const StatusBadge: React.FC<{ status: POStatus }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending Approval':
        return {
          bg: '#FEF3C7',
          text: '#92400E',
          icon: <AlertCircle className="w-3 h-3" />
        };
      case 'Sent':
        return {
          bg: '#DCFCE7',
          text: '#166534',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'Partially Received':
        return {
          bg: '#DBEAFE',
          text: '#1E40AF',
          icon: <AlertCircle className="w-3 h-3" />
        };
      case 'Fully Received':
        return {
          bg: '#DCFCE7',
          text: '#166534',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'Cancelled':
        return {
          bg: '#FEE2E2',
          text: '#991B1B',
          icon: <XCircle className="w-3 h-3" />
        };
      case 'On Hold':
        return {
          bg: '#FEEDDE',
          text: '#9A3412',
          icon: <Pause className="w-3 h-3" />
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#6B7280',
          icon: null
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {styles.icon}
      {status}
    </div>
  );
};

// Main Component
export function PurchaseOrders() {
  const [statusFilter, setStatusFilter] = useState<string>('Status: All');
  const [vendorFilter, setVendorFilter] = useState<string>('Vendor: All');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRecordReceiptModal, setShowRecordReceiptModal] = useState(false);

  // local mutable orders and loading map so UI reflects actions immediately
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOrders(true);
        const resp = await purchaseOrdersApi.listPurchaseOrders({ page: 1, perPage: 25 });
        if (!mounted) return;
        const items = resp.data || resp.items || resp;
        if (Array.isArray(items)) setOrders(items);
        else if (items && Array.isArray(items.data)) setOrders(items.data);
      } catch (err) {
        console.error('Failed to load purchase orders', err);
        toast.error('Failed to load purchase orders');
      } finally {
        setLoadingOrders(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const trackingIntervalRef = useRef<number | null>(null);

  const setLoadingFor = (id: string, val: boolean) =>
    setLoadingIds(prev => ({ ...prev, [id]: val }));

  const approvePO = async (id: string) => {
    setLoadingFor(id, true);
    // Optimistically update UI
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'Sent' } : o)));
    try {
      const resp = await purchaseOrdersApi.performPOAction(id, { action: 'approve', performedBy: 'ui' });
      const updatedPO = (resp && (resp.data || resp)) || null;
      if (updatedPO) {
        setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updatedPO } : o)));
      }
      toast.success('Purchase order approved', { description: `${id} approved and sent` });
    } catch (err) {
      // rollback optimistic update
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'Pending Approval' } : o)));
      console.error('approvePO error', err);
      toast.error('Failed to approve PO');
    } finally {
      setLoadingFor(id, false);
      setShowApproveModal(false);
    }
  };

  const rejectPO = async (id: string) => {
    setLoadingFor(id, true);
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'On Hold' } : o)));
    try {
      const resp = await purchaseOrdersApi.performPOAction(id, { action: 'reject', performedBy: 'ui', reason: 'Rejected via UI' });
      const updatedPO = (resp && (resp.data || resp)) || null;
      if (updatedPO) {
        setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updatedPO } : o)));
      }
      toast.error('Purchase order rejected', { description: `${id} rejected` });
    } catch (err) {
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'Pending Approval' } : o)));
      console.error('rejectPO error', err);
      toast.error('Failed to reject PO');
    } finally {
      setLoadingFor(id, false);
      setShowRejectModal(false);
    }
  };

  const cancelPO = async (id: string) => {
    setLoadingFor(id, true);
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'Cancelled' } : o)));
    try {
      const resp = await purchaseOrdersApi.performPOAction(id, { action: 'cancel', performedBy: 'ui' });
      const updatedPO = (resp && (resp.data || resp)) || null;
      if (updatedPO) {
        setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updatedPO } : o)));
      }
      toast.success('Purchase order cancelled', { description: `${id} cancelled` });
    } catch (err) {
      console.error('cancelPO error', err);
      toast.error('Failed to cancel PO');
    } finally {
      setLoadingFor(id, false);
      setShowCancelModal(false);
    }
  };

  const openTrackingFor = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowTrackingModal(true);
    if (trackingIntervalRef.current) window.clearInterval(trackingIntervalRef.current);
    trackingIntervalRef.current = window.setInterval(() => {
      // small no-op update to keep UI feeling live (could append history)
      setOrders(prev => prev.map(o => (o.id === po.id ? { ...o } : o)));
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) window.clearInterval(trackingIntervalRef.current);
    };
  }, []);

  // PDF Export function
  const downloadPOPDF = (po: PurchaseOrder) => {
    try {
      const htmlContent = `
        <h1>Purchase Order</h1>
        <h2>${po.poNumber}</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
          <tr><th style="text-align:left;">Field</th><th style="text-align:left;">Value</th></tr>
          <tr><td>PO Number</td><td>${po.poNumber}</td></tr>
          <tr><td>Vendor</td><td>${po.vendor}</td></tr>
          <tr><td>Vendor Contact</td><td>${po.vendorContact}</td></tr>
          <tr><td>Vendor Email</td><td>${po.vendorEmail}</td></tr>
          <tr><td>Vendor Phone</td><td>${po.vendorPhone}</td></tr>
          <tr><td>Created Date</td><td>${po.createdDate}</td></tr>
          <tr><td>Delivery Due</td><td>${po.deliveryDue}</td></tr>
          <tr><td>Status</td><td>${po.status}</td></tr>
          <tr><td>PO Type</td><td>${po.poType}</td></tr>
          <tr><td>Category</td><td>${po.category}</td></tr>
          <tr><td>Payment Terms</td><td>${po.paymentTerms}</td></tr>
          ${po.referenceNumber ? `<tr><td>Reference Number</td><td>${po.referenceNumber}</td></tr>` : ''}
          ${po.notes ? `<tr><td>Notes</td><td>${po.notes}</td></tr>` : ''}
          <tr><td>Subtotal</td><td>$${po.subtotal.toFixed(2)}</td></tr>
          <tr><td>Tax</td><td>$${po.tax.toFixed(2)}</td></tr>
          <tr><td><strong>Total Value</strong></td><td><strong>$${po.totalValue.toFixed(2)}</strong></td></tr>
        </table>
        <h3>Line Items</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <th style="text-align:left;">SKU</th>
            <th style="text-align:left;">Product</th>
            <th style="text-align:right;">Quantity</th>
            <th style="text-align:left;">Unit</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Total</th>
          </tr>
          ${po.lineItems.map(item => `
            <tr>
              <td>${item.sku}</td>
              <td>${item.product}</td>
              <td style="text-align:right;">${item.quantity}</td>
              <td>${item.unit}</td>
              <td style="text-align:right;">$${item.unitPrice.toFixed(2)}</td>
              <td style="text-align:right;">$${item.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top:20px; font-size:12px; color:#666;">
          Created by: ${po.createdBy}<br/>
          Generated on ${new Date().toLocaleString()}
        </p>
      `;
      exportToPDF(htmlContent, po.poNumber);
      toast.success(`PDF generated for ${po.poNumber}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    }
  };

  // Create PO Form State
  const [createPOForm, setCreatePOForm] = useState({
    vendor: '',
    poType: 'Standard',
    category: '',
    referenceNumber: '',
    poDate: '',
    deliveryDue: '',
    paymentTerms: 'Net 30' as PaymentTerms,
    lineItems: [
      { sku: '', product: '', quantity: 0, unit: 'kg', unitPrice: 0, total: 0 }
    ],
    notes: '',
    saveAsDraft: false,
  });

  // Filter purchase orders (driven from local orders state)
  const filteredOrders = orders.filter(po => {
    const statusMatch = statusFilter === 'Status: All' || po.status === statusFilter.replace('Status: ', '');
    const vendorMatch = vendorFilter === 'Vendor: All' || po.vendor === vendorFilter.replace('Vendor: ', '');
    return statusMatch && vendorMatch;
  });

  // Get action button for status
  const getActionButton = (po: PurchaseOrder) => {
    switch (po.status) {
      case 'Pending Approval':
        return (
          <button
            onClick={() => {
              setSelectedPO(po);
              setShowDetailsModal(true);
            }}
            className="px-4 py-2 bg-[#4F46E5] text-white text-xs font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200 hover:shadow-md"
          >
            {loadingIds[po.id] ? 'Processing...' : 'Review'}
          </button>
        );
      case 'Sent':
        return (
          <button
            onClick={() => {
              setSelectedPO(po);
              setShowDetailsModal(true);
            }}
            className="px-4 py-2 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200 hover:shadow-md"
          >
            View
          </button>
        );
      case 'Partially Received':
      case 'Fully Received':
        return (
          <button
            onClick={() => {
              openTrackingFor(po);
            }}
            className="px-4 py-2 bg-[#0EA5E9] text-white text-xs font-medium rounded-md hover:bg-[#0284C7] transition-all duration-200 hover:shadow-md"
          >
            Track
          </button>
        );
      default:
        return (
          <button
            onClick={() => {
              setSelectedPO(po);
              setShowDetailsModal(true);
            }}
            className="px-4 py-2 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200 hover:shadow-md"
          >
            View
          </button>
        );
    }
  };

  // Add line item
  const addLineItem = () => {
    setCreatePOForm(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { sku: '', product: '', quantity: 0, unit: 'kg', unitPrice: 0, total: 0 }
      ]
    }));
  };

  // Remove line item
  const removeLineItem = (index: number) => {
    setCreatePOForm(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = createPOForm.lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = 0;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Create, approve, and track purchase orders"
        actions={
          <>
            <button 
              onClick={() => setShowBulkUploadModal(true)}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create PO
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[#E0E0E0]">
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-[#E0E0E0]">
          <Filter size={16} className="text-[#757575]" />
          <span className="text-sm font-medium text-[#212121]">Filters:</span>
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 pr-8 rounded-lg border border-[#E0E0E0] text-sm bg-white focus:border-[#4F46E5] outline-none appearance-none"
          >
            <option>Status: All</option>
            <option>Pending Approval</option>
            <option>Sent</option>
            <option>Partially Received</option>
            <option>Fully Received</option>
            <option>Cancelled</option>
            <option>On Hold</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575] pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="h-9 px-3 pr-8 rounded-lg border border-[#E0E0E0] text-sm bg-white focus:border-[#4F46E5] outline-none appearance-none"
          >
            <option>Vendor: All</option>
            <option>Fresh Farms Inc.</option>
            <option>Tech Logistics</option>
            <option>Dairy Delights</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575] pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">PO Number</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3">Created Date</th>
                <th className="px-6 py-3">Delivery Due</th>
                <th className="px-6 py-3 text-right">Total Value</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredOrders.map((po) => (
                <tr 
                  key={po.id}
                  className="hover:bg-[#FAFAFA] transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-[#616161]">{po.poNumber}</td>
                  <td className="px-6 py-4 font-medium text-[#212121]">{po.vendor}</td>
                  <td className="px-6 py-4 text-[#616161]">{po.createdDate}</td>
                  <td className="px-6 py-4 text-[#616161]">{po.deliveryDue}</td>
                  <td className="px-6 py-4 font-bold text-[#212121] text-right">
                    ${po.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={po.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-full custom-scrollbar" style={{ scrollbarGutter: 'stable' }}>
                      {getActionButton(po)}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoreMenu(showMoreMenu === po.id ? null : po.id);
                          }}
                          className="p-1.5 border border-[#E0E0E0] rounded hover:bg-[#F5F5F5] transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4 text-[#757575]" />
                        </button>
                        {showMoreMenu === po.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowMoreMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E0E0E0] rounded-lg shadow-lg z-20">
                              <button 
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowDetailsModal(true);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2 rounded-t-lg"
                              >
                                <FileText className="w-4 h-4" />
                                View Details
                              </button>
                              {po.status === 'Pending Approval' && (
                                <button 
                                  onClick={() => {
                                    setSelectedPO(po);
                                    setShowEditModal(true);
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowCancelModal(true);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancel PO
                              </button>
                              <button 
                                onClick={() => {
                                  downloadPOPDF(po);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <FileDown className="w-4 h-4" />
                                Download PDF
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowNotesModal(true);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                Add Notes
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowShareModal(true);
                                  setShowMoreMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#212121] hover:bg-[#F9FAFB] flex items-center gap-2 rounded-b-lg"
                              >
                                <Share2 className="w-4 h-4" />
                                Share with Team
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create PO */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto p-0" aria-describedby="create-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Create New Purchase Order
            </DialogTitle>
            <DialogDescription id="create-po-description" className="text-sm text-[#6B7280]">
              Fill in the details below to create a new purchase order
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Vendor Selection */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-4">Select Vendor</h3>
              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  value={createPOForm.vendor}
                  onChange={(e) => setCreatePOForm(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                >
                  <option value="">Search and select vendor...</option>
                  <option value="Fresh Farms Inc.">Fresh Farms Inc.</option>
                  <option value="Tech Logistics">Tech Logistics</option>
                  <option value="Dairy Delights">Dairy Delights</option>
                </select>
              </div>
            </div>

            {/* PO Details */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-4">PO Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                    PO Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createPOForm.poType}
                    onChange={(e) => setCreatePOForm(prev => ({ ...prev, poType: e.target.value }))}
                    className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Blanket PO">Blanket PO</option>
                    <option value="Contract Release">Contract Release</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createPOForm.category}
                    onChange={(e) => setCreatePOForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  >
                    <option value="">Select category...</option>
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                  Reference Number (Optional)
                </label>
                <input
                  type="text"
                  value={createPOForm.referenceNumber}
                  onChange={(e) => setCreatePOForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="PO-REF-12345"
                  className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-4">Dates</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                    PO Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={createPOForm.poDate}
                      onChange={(e) => setCreatePOForm(prev => ({ ...prev, poDate: e.target.value }))}
                      className="w-full h-10 px-3 pr-10 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                    Delivery Due Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={createPOForm.deliveryDue}
                      onChange={(e) => setCreatePOForm(prev => ({ ...prev, deliveryDue: e.target.value }))}
                      className="w-full h-10 px-3 pr-10 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {(['Net 15', 'Net 30', 'COD', 'Custom'] as PaymentTerms[]).map((term) => (
                    <label key={term} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentTerms"
                        value={term}
                        checked={createPOForm.paymentTerms === term}
                        onChange={(e) => setCreatePOForm(prev => ({ ...prev, paymentTerms: e.target.value as PaymentTerms }))}
                        className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] focus:ring-[#4F46E5]"
                      />
                      <span className="text-sm text-[#1F2937]">{term}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Line Items</h3>
              <p className="text-xs text-[#6B7280] mb-4">Add products/items to this PO</p>
              
              <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Item SKU</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Unit</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Total</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {createPOForm.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.sku}
                            onChange={(e) => {
                              const newItems = [...createPOForm.lineItems];
                              newItems[index].sku = e.target.value;
                              setCreatePOForm(prev => ({ ...prev, lineItems: newItems }));
                            }}
                            placeholder="SKU-001"
                            className="w-full h-8 px-2 bg-white border border-[#D1D5DB] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.product}
                            onChange={(e) => {
                              const newItems = [...createPOForm.lineItems];
                              newItems[index].product = e.target.value;
                              setCreatePOForm(prev => ({ ...prev, lineItems: newItems }));
                            }}
                            placeholder="Product name"
                            className="w-full h-8 px-2 bg-white border border-[#D1D5DB] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const newItems = [...createPOForm.lineItems];
                              newItems[index].quantity = Number(e.target.value);
                              newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                              setCreatePOForm(prev => ({ ...prev, lineItems: newItems }));
                            }}
                            placeholder="0"
                            className="w-full h-8 px-2 bg-white border border-[#D1D5DB] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.unit}
                            onChange={(e) => {
                              const newItems = [...createPOForm.lineItems];
                              newItems[index].unit = e.target.value;
                              setCreatePOForm(prev => ({ ...prev, lineItems: newItems }));
                            }}
                            className="w-full h-8 px-2 bg-white border border-[#D1D5DB] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                          >
                            <option value="kg">kg</option>
                            <option value="L">L</option>
                            <option value="units">units</option>
                            <option value="boxes">boxes</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice || ''}
                            onChange={(e) => {
                              const newItems = [...createPOForm.lineItems];
                              newItems[index].unitPrice = Number(e.target.value);
                              newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                              setCreatePOForm(prev => ({ ...prev, lineItems: newItems }));
                            }}
                            placeholder="0.00"
                            className="w-full h-8 px-2 bg-white border border-[#D1D5DB] rounded text-xs focus:outline-none focus:border-[#4F46E5]"
                          />
                        </td>
                        <td className="px-3 py-2 text-xs font-medium text-[#1F2937]">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeLineItem(index)}
                            className="p-1 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={addLineItem}
                className="mt-3 text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>

              <div className="mt-4 space-y-2 text-right">
                <div className="flex justify-end gap-4 text-xs text-[#6B7280]">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-4 text-xs text-[#6B7280]">
                  <span>Tax (0%):</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB]">
                  <div className="flex justify-end gap-4 text-sm font-bold text-[#1F2937]">
                    <span>Total:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Attachments */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-4">Additional Information</h3>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={createPOForm.notes}
                  onChange={(e) => setCreatePOForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any special instructions or notes..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                  Attachments (Optional)
                </label>
                <div className="bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] rounded-lg p-8 text-center">
                  <CloudUpload className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280]">Drag files here or click to upload</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">PDF, Excel, images • Max 10MB per file</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createPOForm.saveAsDraft}
                onChange={(e) => setCreatePOForm(prev => ({ ...prev, saveAsDraft: e.target.checked }))}
                className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]"
              />
              <span className="text-xs text-[#1F2937]">Save as draft</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200"
              >
                Save Draft
              </button>
              <button
                className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
              >
                Create & Send
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: PO Details/Review */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto p-0" aria-describedby="po-details-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Purchase Order Details
            </DialogTitle>
            <DialogDescription id="po-details-description" className="text-sm text-[#6B7280]">
              {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedPO && (
            <div className="px-6 py-6 space-y-6">
              {/* Vendor Information */}
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-3">Vendor Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Vendor Name</span>
                    <span className="text-[#1F2937]">{selectedPO.vendor}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Contact Person</span>
                    <span className="text-[#1F2937]">{selectedPO.vendorContact}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Email</span>
                    <span className="text-[#1F2937]">{selectedPO.vendorEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Phone</span>
                    <span className="text-[#1F2937]">{selectedPO.vendorPhone}</span>
                  </div>
                </div>
              </div>

              {/* PO Information */}
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-3">PO Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">PO Number</span>
                    <span className="text-[#1F2937]">{selectedPO.poNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">PO Date</span>
                    <span className="text-[#1F2937]">{selectedPO.createdDate}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Delivery Due</span>
                    <span className="text-[#1F2937]">{selectedPO.deliveryDue}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Payment Terms</span>
                    <span className="text-[#1F2937]">{selectedPO.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Status</span>
                    <StatusBadge status={selectedPO.status} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B7280] uppercase block mb-1">Category</span>
                    <span className="text-[#1F2937]">{selectedPO.category}</span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-3">Line Items</h3>
                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#F9FAFB]">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">SKU</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-bold text-[#6B7280] uppercase">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-[#6B7280] uppercase">Unit</th>
                        <th className="px-3 py-2 text-right text-xs font-bold text-[#6B7280] uppercase">Price</th>
                        <th className="px-3 py-2 text-right text-xs font-bold text-[#6B7280] uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {selectedPO.lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 text-xs text-[#1F2937]">{item.sku}</td>
                          <td className="px-3 py-2 text-xs text-[#1F2937]">{item.product}</td>
                          <td className="px-3 py-2 text-xs text-[#1F2937] text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-xs text-[#1F2937]">{item.unit}</td>
                          <td className="px-3 py-2 text-xs text-[#1F2937] text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-3 py-2 text-xs text-[#1F2937] text-right font-medium">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-2 text-right">
                  <div className="flex justify-end gap-4 text-xs text-[#6B7280]">
                    <span>Subtotal:</span>
                    <span>${selectedPO.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end gap-4 text-xs text-[#6B7280]">
                    <span>Tax (0%):</span>
                    <span>${selectedPO.tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <div className="flex justify-end gap-4 text-sm font-bold text-[#1F2937]">
                      <span>Total:</span>
                      <span>${selectedPO.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-3">Activity Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm text-[#1F2937]">Created: {selectedPO.createdDate} by {selectedPO.createdBy}</p>
                    </div>
                  </div>
                  {selectedPO.sentDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-sm text-[#1F2937]">Sent: {selectedPO.sentDate} to Vendor</p>
                      </div>
                    </div>
                  )}
                  {selectedPO.receivedDate && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5"></div>
                      <div>
                        <p className="text-sm text-[#1F2937]">Received: {selectedPO.receivedDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPO.notes && (
                <div>
                  <h3 className="text-base font-bold text-[#1F2937] mb-3">Notes</h3>
                  <p className="text-sm text-[#6B7280] bg-[#F9FAFB] p-4 rounded-lg">
                    {selectedPO.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            {selectedPO?.status === 'Pending Approval' && (
              <>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRejectModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626] transition-all duration-200"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowApproveModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669] transition-all duration-200"
                >
                  Approve
                </button>
              </>
            )}
            {selectedPO?.status === 'Sent' && (
              <>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowCancelModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626] transition-all duration-200"
                >
                  Cancel PO
                </button>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowEditModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
                >
                  Edit
                </button>
              </>
            )}
            {(selectedPO?.status === 'Partially Received' || selectedPO?.status === 'Fully Received') && (
              <>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowRecordReceiptModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
                >
                  Record Receipt
                </button>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowTrackingModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200"
                >
                  View Tracking
                </button>
              </>
            )}
            <button 
              onClick={() => selectedPO && downloadPOPDF(selectedPO)}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Bulk Upload */}
      <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
        <DialogContent className="max-w-[600px] p-0" aria-describedby="bulk-upload-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Bulk Upload Purchase Orders
            </DialogTitle>
            <DialogDescription id="bulk-upload-po-description" className="text-sm text-[#6B7280]">
              Upload multiple purchase orders at once using our Excel template
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Step 1 */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Step 1: Download Template</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Download the Excel template to fill with your PO data
              </p>
              <button className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Step 2: Select File</h3>
              <p className="text-sm text-[#6B7280] mb-3">
                Select your filled Excel file
              </p>
              <div className="bg-[#F9FAFB] border-2 border-dashed border-[#D1D5DB] rounded-lg p-12 text-center">
                <CloudUpload className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
                <p className="text-xs text-[#6B7280] mb-1">Drag file here or click to browse</p>
                <p className="text-xs text-[#9CA3AF]">Excel files only (.xlsx, .xls)</p>
              </div>
            </div>

            {/* Step 3 - Preview */}
            <div>
              <h3 className="text-base font-bold text-[#1F2937] mb-2">Step 3: Preview & Validation</h3>
              <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#166534]" />
                <span className="text-sm text-[#166534] font-medium">✓ 50 POs ready to upload</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowBulkUploadModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669] transition-all duration-200">
              Upload POs
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Track Delivery */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-[600px] p-0" aria-describedby="track-delivery-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Track Delivery
            </DialogTitle>
            <DialogDescription id="track-delivery-description" className="text-sm text-[#6B7280]">
              {selectedPO?.poNumber} - {selectedPO?.vendor}
            </DialogDescription>
          </DialogHeader>

          {selectedPO && (
            <div className="px-6 py-6 space-y-6">
              {/* Expected Delivery */}
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-[#1F2937]">Expected Delivery</span>
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="text-sm text-[#6B7280]">{selectedPO.deliveryDue}</span>
              </div>

              {/* Current Status */}
              <div className="bg-[#DBEAFE] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#1F2937]">Current Status</span>
                  <AlertCircle className="w-5 h-5 text-[#1E40AF]" />
                </div>
                <StatusBadge status={selectedPO.status} />

                {selectedPO.status === 'Partially Received' && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-bold text-[#1F2937]">Items Received:</p>
                    {selectedPO.lineItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {index === 0 ? (
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                          )}
                          <span className="text-sm text-[#1F2937]">
                            {item.product} ({index === 0 ? '500' : '0'} of {item.quantity} {item.unit})
                          </span>
                        </div>
                        <span className="text-xs font-medium text-[#6B7280]">
                          {index === 0 ? '62.5%' : '0%'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-base font-bold text-[#1F2937] mb-4">Updates:</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm text-[#1F2937] font-medium">{selectedPO.deliveryDue}, 10:30 AM</p>
                      <p className="text-sm text-[#6B7280]">Vendor received shipment</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-[#0EA5E9] rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm text-[#1F2937] font-medium">Oct 11, 2:45 PM</p>
                      <p className="text-sm text-[#6B7280]">Partial delivery in transit</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-[#6B7280] rounded-full mt-1.5"></div>
                    <div>
                      <p className="text-sm text-[#1F2937] font-medium">{selectedPO.createdDate}, 8:00 AM</p>
                      <p className="text-sm text-[#6B7280]">Order confirmed & processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            {selectedPO?.status === 'Fully Received' && (
              <button className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            )}
            <button
              onClick={() => setShowTrackingModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Edit PO */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-[600px] p-0" aria-describedby="edit-po-modal-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Edit Purchase Order
            </DialogTitle>
            <DialogDescription id="edit-po-modal-description" className="text-sm text-[#6B7280]">
              {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Delivery Due Date
              </label>
              <input
                type="date"
                defaultValue={selectedPO?.deliveryDue}
                className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Notes
              </label>
              <textarea
                rows={4}
                defaultValue={selectedPO?.notes}
                placeholder="Add notes..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success(`${selectedPO?.poNumber} updated successfully`);
                setShowEditModal(false);
              }}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
            >
              Save Changes
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 6: Cancel PO */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="max-w-[500px] p-0" aria-describedby="cancel-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Cancel Purchase Order
            </DialogTitle>
            <DialogDescription id="cancel-po-description" className="text-sm text-[#6B7280]">
              Are you sure you want to cancel {selectedPO?.poNumber}?
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide a reason for cancellation..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Keep PO
            </button>
            <button
              onClick={() => {
                if (selectedPO) cancelPO(selectedPO.id);
              }}
              className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626] transition-all duration-200"
            >
              Cancel PO
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 7: Add Notes */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-[500px] p-0" aria-describedby="add-notes-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Add Internal Note
            </DialogTitle>
            <DialogDescription id="add-notes-description" className="text-sm text-[#6B7280]">
              {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Note
              </label>
              <textarea
                rows={6}
                placeholder="Add an internal note for this purchase order..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowNotesModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success(`Note added to ${selectedPO?.poNumber}`);
                setShowNotesModal(false);
              }}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
            >
              Add Note
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 8: Share with Team */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-[500px] p-0" aria-describedby="share-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Share with Team
            </DialogTitle>
            <DialogDescription id="share-po-description" className="text-sm text-[#6B7280]">
              Share {selectedPO?.poNumber} with team members
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Team Members
              </label>
              <select
                multiple
                className="w-full h-32 px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option>Sarah Johnson - Procurement Manager</option>
                <option>David Lee - Operations Lead</option>
                <option>Emma Watson - Finance Team</option>
                <option>Mike Chen - Logistics Coordinator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Message (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add a message..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowShareModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success(`${selectedPO?.poNumber} shared with team`);
                setShowShareModal(false);
              }}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
            >
              Share
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 9: Reject PO */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-[500px] p-0" aria-describedby="reject-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Reject Purchase Order
            </DialogTitle>
            <DialogDescription id="reject-po-description" className="text-sm text-[#6B7280]">
              Provide a reason for rejecting {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide a detailed reason for rejection..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedPO) rejectPO(selectedPO.id);
              }}
              className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626] transition-all duration-200"
            >
              Reject PO
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 10: Approve PO */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-[500px] p-0" aria-describedby="approve-po-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Approve Purchase Order
            </DialogTitle>
            <DialogDescription id="approve-po-description" className="text-sm text-[#6B7280]">
              Review and approve {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-[#1F2937]">PO Number:</span>
                <span className="text-sm text-[#6B7280]">{selectedPO?.poNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-[#1F2937]">Vendor:</span>
                <span className="text-sm text-[#6B7280]">{selectedPO?.vendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-[#1F2937]">Total Value:</span>
                <span className="text-sm font-bold text-[#1F2937]">
                  ${selectedPO?.totalValue.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add any notes regarding this approval..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowApproveModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedPO) approvePO(selectedPO.id);
              }}
              className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669] transition-all duration-200"
            >
              Approve & Send
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 11: Record Receipt */}
      <Dialog open={showRecordReceiptModal} onOpenChange={setShowRecordReceiptModal}>
        <DialogContent className="max-w-[600px] p-0" aria-describedby="record-receipt-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Record Receipt
            </DialogTitle>
            <DialogDescription id="record-receipt-description" className="text-sm text-[#6B7280]">
              Record received items for {selectedPO?.poNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full h-10 px-3 pr-10 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1F2937] mb-3">Items Received</h3>
              <div className="space-y-3">
                {selectedPO?.lineItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1F2937]">{item.product}</p>
                      <p className="text-xs text-[#6B7280]">
                        Ordered: {item.quantity} {item.unit}
                      </p>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        placeholder="Received"
                        defaultValue={item.quantity}
                        max={item.quantity}
                        className="w-full h-9 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Receipt Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Add notes about the received items..."
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowRecordReceiptModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.success(`Receipt recorded for ${selectedPO?.poNumber}`);
                setShowRecordReceiptModal(false);
              }}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] transition-all duration-200"
            >
              Save Receipt
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
