import React, { useState, useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from "../../ui/button";
import { toast } from 'sonner';

import { InvoiceStatusCards } from './InvoiceStatusCards';
import { InvoiceListPanel } from './InvoiceListPanel';
import { InvoiceDetailsDrawer } from './InvoiceDetailsDrawer';
import { InvoiceFormModal } from './InvoiceFormModal';

import { 
    InvoiceSummary, 
    Invoice, 
    InvoiceStatus,
    fetchInvoiceSummary, 
    fetchInvoices 
} from './invoicingApi';

export function BillingInvoicing() {
  // --- State ---
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [activeStatus, setActiveStatus] = useState<InvoiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals / Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // --- Data Fetching ---

  const loadSummary = async () => {
      try {
          const data = await fetchInvoiceSummary();
          setSummary(data);
      } catch (e) {
          console.error(e);
          // Use data from localStorage on error
          const data = await fetchInvoiceSummary();
          setSummary(data);
      }
  };

  const loadInvoices = async (status: InvoiceStatus | null, search: string = '') => {
      if (!status) return;
      setIsListLoading(true);
      try {
          const data = await fetchInvoices(status, search);
          setInvoices(data);
      } catch (e) {
          toast.error("Failed to load invoices");
          // Use data from localStorage on error
          try {
            const data = await fetchInvoices(status, search);
            setInvoices(data);
          } catch (e2) {
            console.error('Failed to load invoices', e2);
            setInvoices([]);
          }
      } finally {
          setIsListLoading(false);
      }
  };

  // Initial load - ensure data is initialized
  useEffect(() => {
      const init = async () => {
          setIsLoading(true);
          try {
              // Force initialization by calling fetchInvoices first to ensure data exists
              await fetchInvoices('sent', ''); // This will initialize default invoices if empty
              await loadSummary();
          } catch (e) {
              console.error('Failed to initialize invoices:', e);
          } finally {
              setIsLoading(false);
          }
      };
      init();
  }, []);

  // Update list when status changes
  useEffect(() => {
      if (activeStatus) {
          loadInvoices(activeStatus, searchTerm);
      } else {
          setInvoices([]);
      }
  }, [activeStatus]);

  // Handle Search Debounce (Mocked simplified)
  useEffect(() => {
      if (activeStatus) {
          const timer = setTimeout(() => {
              loadInvoices(activeStatus, searchTerm);
          }, 300);
          return () => clearTimeout(timer);
      }
  }, [searchTerm]);

  const handleStatusSelect = (status: InvoiceStatus) => {
      if (activeStatus === status) {
           // Optional: deselect if clicking same? For now, just keep it.
           return; 
      }
      setActiveStatus(status);
      setSearchTerm(''); // Reset search when changing category
  };

  const handleRefresh = async () => {
      // Reload both summary and invoices to reflect any status changes
      // Force reload summary first to get latest counts
      setIsLoading(true);
      try {
          await loadSummary();
          if (activeStatus) {
              await loadInvoices(activeStatus, searchTerm);
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleViewInvoice = (inv: Invoice) => {
      setSelectedInvoice(inv);
      setDetailsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Billing & Invoicing</h1>
          <p className="text-[#757575] text-sm">Customer invoices, bulk generation, and overdue tracking</p>
        </div>
        <Button 
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white font-medium shadow-sm transition-colors"
            onClick={() => setCreateModalOpen(true)}
        >
          <FileText className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <InvoiceStatusCards 
          summary={summary} 
          isLoading={isLoading} 
          activeStatus={activeStatus}
          onStatusSelect={handleStatusSelect}
      />

      <InvoiceListPanel 
          invoices={invoices}
          isLoading={isListLoading}
          activeStatus={activeStatus}
          onViewInvoice={handleViewInvoice}
          onRefresh={handleRefresh}
          onSearch={setSearchTerm}
      />

      <InvoiceFormModal 
          open={createModalOpen} 
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleRefresh}
      />

      <InvoiceDetailsDrawer 
          invoice={selectedInvoice}
          open={detailsDrawerOpen}
          onClose={() => {
              setDetailsDrawerOpen(false);
              // Refresh summary when drawer closes to ensure counts are updated
              handleRefresh();
          }}
          onUpdate={handleRefresh} // Refresh parent list to reflect changes (e.g. paid status)
      />
    </div>
  );
}
