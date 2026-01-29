import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { PayablesSummaryCards } from './PayablesSummaryCards';
import { VendorInvoicesFilters } from './VendorInvoicesFilters';
import { VendorInvoicesTable } from './VendorInvoicesTable';
import { InvoiceDetailsDrawer } from './InvoiceDetailsDrawer';
import { UploadInvoiceModal } from './UploadInvoiceModal';
import { NewPaymentModal } from './NewPaymentModal';

import { 
    VendorInvoice, 
    VendorPayablesSummary, 
    VendorInvoiceFilter, 
    Vendor,
    fetchPayablesSummary,
    fetchVendorInvoices,
    fetchVendorInvoiceDetails,
    fetchVendors,
    approveInvoice,
    markInvoicePaid,
    rejectInvoice
} from './payablesApi';

export function VendorPayments() {
  // --- State ---
  const [summary, setSummary] = useState<VendorPayablesSummary | null>(null);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  
  const [filters, setFilters] = useState<VendorInvoiceFilter>({
      page: 1,
      pageSize: 10,
      status: undefined,
      vendorId: undefined,
      dateFrom: undefined,
      dateTo: undefined
  });

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // --- Data Fetching ---
  const loadSummary = async () => {
      try {
          const data = await fetchPayablesSummary();
          setSummary(data);
      } catch (e) {
          console.error("Failed to load summary", e);
      } finally {
          setIsLoadingSummary(false);
      }
  };

  const loadVendors = async () => {
      try {
          const data = await fetchVendors();
          setVendors(data);
      } catch (e) {
          console.error("Failed to load vendors", e);
      }
  };

  const loadInvoices = useCallback(async () => {
      setIsLoadingInvoices(true);
      try {
          const result = await fetchVendorInvoices(filters);
          setInvoices(result.data);
      } catch (e) {
          toast.error("Failed to load invoices");
      } finally {
          setIsLoadingInvoices(false);
      }
  }, [filters]);

  useEffect(() => {
      loadSummary();
      loadVendors();
  }, []);

  useEffect(() => {
      loadInvoices();
  }, [loadInvoices]);

  // --- Handlers ---
  const handleSummaryFilterClick = (filterType: string) => {
      if (filterType === 'outstanding') {
           // Complex logic to filter multiple statuses not supported by simple filter object yet
           // defaulting to pending approval for now or just clearing status
           setFilters(prev => ({ ...prev, status: undefined, page: 1 }));
      } else {
           setFilters(prev => ({ ...prev, status: filterType, page: 1 }));
      }
  };

  const handleApprove = async (id: string) => {
      try {
          await approveInvoice(id);
          toast.success("Invoice approved");
          loadInvoices();
          loadSummary();
      } catch (e) {
          toast.error("Failed to approve invoice");
      }
  };

  const handleMarkPaid = async (id: string) => {
      try {
          await markInvoicePaid(id);
          toast.success("Invoice marked as paid");
          loadInvoices();
          loadSummary();
      } catch (e) {
          toast.error("Failed to mark as paid");
      }
  };

  const handleReject = async (invoice: VendorInvoice) => {
       // Since rejection requires a reason, we open the details drawer which has the reject flow
       setSelectedInvoice(invoice);
       setDetailsOpen(true);
  };

  const handleViewDetails = async (invoice: VendorInvoice) => {
      setSelectedInvoice(invoice);
      setDetailsOpen(true);
      try {
          const detailed = await fetchVendorInvoiceDetails(invoice.id);
          setSelectedInvoice(detailed);
      } catch (e) {
          // Silent fail, keep basic info
      }
  };

  const handleSchedule = (invoice: VendorInvoice) => {
      // In a real app, this might open a specific scheduler
      // For now, we'll prompt to open the new payment modal
      toast.info("Opening payment workflow...");
      setPaymentOpen(true);
  };

  const handleExport = () => {
      toast.success("Export started. Downloading...");
      // Mock download
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Vendor & Supplier Payments</h1>
          <p className="text-[#757575] text-sm">Manage payables, invoices, and supplier relationships</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => setUploadOpen(true)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
                <FileText size={16} />
                Upload Invoice
            </button>
            <button 
                onClick={() => setPaymentOpen(true)}
                className="px-4 py-2 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] flex items-center gap-2"
            >
                <Plus size={16} />
                New Payment
            </button>
        </div>
      </div>

      <PayablesSummaryCards 
        summary={summary} 
        isLoading={isLoadingSummary} 
        onFilterClick={handleSummaryFilterClick}
      />

      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm p-4">
        <VendorInvoicesFilters 
            filters={filters} 
            vendors={vendors}
            onFilterChange={setFilters}
            onExport={handleExport}
        />
        
        <VendorInvoicesTable 
            data={invoices} 
            isLoading={isLoadingInvoices}
            onApprove={handleApprove}
            onMarkPaid={handleMarkPaid}
            onReject={handleReject}
            onSchedule={handleSchedule}
            onViewDetails={handleViewDetails}
        />
      </div>

      <InvoiceDetailsDrawer 
        invoice={selectedInvoice}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onUpdate={() => {
            loadInvoices();
            loadSummary();
        }}
      />

      <UploadInvoiceModal 
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
            loadInvoices();
            loadSummary();
        }}
        vendors={vendors}
      />

      <NewPaymentModal 
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSuccess={() => {
            loadInvoices();
            loadSummary();
        }}
        vendors={vendors}
      />
    </div>
  );
}
