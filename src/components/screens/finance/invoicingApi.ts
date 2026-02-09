import { apiRequest } from '@/api/apiClient';

// --- Types ---

export type InvoiceStatus = "sent" | "pending" | "overdue" | "paid" | "draft" | "cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  pdfUrl?: string;
  lastReminderAt?: string;
  createdAt: string;
}

export interface InvoiceSummary {
  sentCount: number;
  pendingCount: number;
  overdueCount: number;
  paidCount: number;
  periodLabel: string;
}

export interface CreateInvoicePayload {
    customerId?: string; // If selecting existing
    customerName: string;
    customerEmail: string;
    issueDate: string;
    dueDate: string;
    items: Omit<InvoiceItem, 'id'>[];
    notes?: string;
}

// --- API Functions ---

export const fetchInvoiceSummary = async (): Promise<InvoiceSummary> => {
    try {
        const response = await apiRequest<{ success: boolean; data: InvoiceSummary }>('/finance/invoices/summary');
        if (response.data) {
          // Also update localStorage with the response if it has invoice data
          // But for now, we'll always calculate from localStorage to ensure consistency
        }
    } catch (error) {
        console.error('Failed to fetch invoice summary:', error);
    }
    
    // Always calculate from the latest localStorage data
    let storedInvoices = loadInvoicesFromStorage();
    if (storedInvoices.length === 0) {
      // Initialize with default invoices if empty
      const defaultInvoices = getDefaultInvoices();
      saveInvoicesToStorage(defaultInvoices);
      storedInvoices = defaultInvoices;
    }
    
    // Calculate from stored invoices - always use fresh data
    const sentCount = storedInvoices.filter(i => i.status === 'sent').length;
    const pendingCount = storedInvoices.filter(i => i.status === 'pending').length;
    const overdueCount = storedInvoices.filter(i => i.status === 'overdue').length;
    const paidCount = storedInvoices.filter(i => i.status === 'paid').length;
    
    console.log('Invoice Summary Calculated:', { sentCount, pendingCount, overdueCount, paidCount, total: storedInvoices.length });
    
    return {
        sentCount,
        pendingCount,
        overdueCount,
        paidCount,
        periodLabel: 'this month'
    };
};

// Load from localStorage or use default
const loadInvoicesFromStorage = (): Invoice[] => {
  try {
    const stored = localStorage.getItem('invoices');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load invoices from storage', e);
  }
  return [];
};

const saveInvoicesToStorage = (invoices: Invoice[]) => {
  try {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to storage', e);
  }
};

// Default mock invoices
const getDefaultInvoices = (): Invoice[] => {
  const now = new Date();
  return [
    {
      id: 'inv_001',
      invoiceNumber: 'INV-2024-001',
      customerId: 'cust_001',
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.com',
      issueDate: now.toISOString().split('T')[0],
      dueDate: new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0],
      amount: 12500,
      currency: 'USD',
      status: 'sent',
      items: [
        { id: 'item_1', description: 'Professional Services', quantity: 40, unitPrice: 250, taxPercent: 10 },
        { id: 'item_2', description: 'Consulting Hours', quantity: 20, unitPrice: 150, taxPercent: 10 }
      ],
      createdAt: now.toISOString()
    },
    {
      id: 'inv_002',
      invoiceNumber: 'INV-2024-002',
      customerId: 'cust_002',
      customerName: 'Tech Solutions Inc',
      customerEmail: 'finance@techsol.com',
      issueDate: new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0],
      amount: 8500,
      currency: 'USD',
      status: 'pending',
      items: [
        { id: 'item_3', description: 'Software License', quantity: 1, unitPrice: 8500, taxPercent: 0 }
      ],
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString()
    },
    {
      id: 'inv_003',
      invoiceNumber: 'INV-2024-003',
      customerId: 'cust_003',
      customerName: 'Global Enterprises',
      customerEmail: 'accounts@globalent.com',
      issueDate: new Date(now.getTime() - 10 * 86400000).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0],
      amount: 15200,
      currency: 'USD',
      status: 'overdue',
      items: [
        { id: 'item_4', description: 'Monthly Subscription', quantity: 1, unitPrice: 15200, taxPercent: 8 }
      ],
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString()
    },
    {
      id: 'inv_004',
      invoiceNumber: 'INV-2024-004',
      customerId: 'cust_004',
      customerName: 'Digital Services Co',
      customerEmail: 'payments@digitalservices.com',
      issueDate: new Date(now.getTime() - 15 * 86400000).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0],
      amount: 9800,
      currency: 'USD',
      status: 'paid',
      items: [
        { id: 'item_5', description: 'Web Development', quantity: 1, unitPrice: 9800, taxPercent: 10 }
      ],
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString()
    },
    {
      id: 'inv_005',
      invoiceNumber: 'INV-2024-005',
      customerId: 'cust_005',
      customerName: 'Retail Partners',
      customerEmail: 'billing@retailpartners.com',
      issueDate: new Date(now.getTime() - 3 * 86400000).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() + 27 * 86400000).toISOString().split('T')[0],
      amount: 6500,
      currency: 'USD',
      status: 'draft',
      items: [
        { id: 'item_6', description: 'Marketing Services', quantity: 1, unitPrice: 6500, taxPercent: 0 }
      ],
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString()
    }
  ];
};

export const fetchInvoices = async (
    status?: InvoiceStatus, 
    search?: string
): Promise<Invoice[]> => {
    try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (search) params.append('search', search);
        const response = await apiRequest<{ success: boolean; data: Invoice[] }>(`/finance/invoices?${params.toString()}`);
        if (response.data && response.data.length > 0) {
          saveInvoicesToStorage(response.data);
          return response.data;
        }
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
    }
    
    // Always return data - from storage or defaults
    let storedInvoices = loadInvoicesFromStorage();
    if (storedInvoices.length === 0) {
      storedInvoices = getDefaultInvoices();
      saveInvoicesToStorage(storedInvoices);
    }
    
    // Filter by status and search
    let filtered = storedInvoices;
    if (status) {
        filtered = filtered.filter(inv => inv.status === status);
    }
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(inv => 
            inv.invoiceNumber.toLowerCase().includes(q) ||
            inv.customerName.toLowerCase().includes(q) ||
            inv.customerEmail.toLowerCase().includes(q)
        );
    }
    return filtered;
};

export const fetchInvoiceDetails = async (id: string): Promise<Invoice | null> => {
    try {
        const response = await apiRequest<{ success: boolean; data: Invoice }>(`/finance/invoices/${id}`);
        return response.data || null;
    } catch (error) {
        console.error('Failed to fetch invoice details:', error);
        return null;
    }
};

export const createInvoice = async (payload: CreateInvoicePayload, asDraft: boolean = false): Promise<Invoice> => {
    try {
        const response = await apiRequest<{ success: boolean; data: Invoice }>('/finance/invoices', {
            method: 'POST',
            body: JSON.stringify({ ...payload, asDraft }),
        });
        if (response.data) {
          // Save to localStorage
          const storedInvoices = loadInvoicesFromStorage();
          storedInvoices.unshift(response.data); // Add to beginning
          saveInvoicesToStorage(storedInvoices);
          return response.data;
        }
    } catch (error) {
        console.error('Failed to create invoice:', error);
    }
    
    // Always create and save invoice (even if API fails)
    const now = new Date();
    const totalAmount = payload.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * (1 + item.taxPercent / 100)), 0
    );
    const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        customerId: payload.customerId || `cust_${Date.now()}`,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        issueDate: payload.issueDate,
        dueDate: payload.dueDate,
        amount: totalAmount,
        currency: 'USD',
        status: asDraft ? 'draft' : 'sent',
        items: payload.items.map((item, idx) => ({ ...item, id: `item_${idx}` })),
        notes: payload.notes,
        createdAt: now.toISOString()
    };
    
    // Save to localStorage
    const storedInvoices = loadInvoicesFromStorage();
    storedInvoices.unshift(newInvoice); // Add to beginning
    saveInvoicesToStorage(storedInvoices);
    
    return newInvoice;
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<void> => {
    // Always update localStorage first to ensure immediate update
    const storedInvoices = loadInvoicesFromStorage();
    const index = storedInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        storedInvoices[index] = { ...storedInvoices[index], status };
        saveInvoicesToStorage(storedInvoices);
        console.log('Invoice status updated in localStorage:', id, status);
    }
    
    try {
        await apiRequest(`/finance/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    } catch (error) {
        console.error('Failed to update invoice status via API:', error);
        // Status already updated in localStorage, so continue
    }
};

export const sendInvoice = async (id: string): Promise<void> => {
    try {
        await apiRequest(`/finance/invoices/${id}/send`, {
            method: 'POST',
        });
    } catch (error) {
        console.error('Failed to send invoice:', error);
    }
    
    // Update status to 'sent' in localStorage
    await updateInvoiceStatus(id, 'sent');
};

export const sendReminder = async (id: string): Promise<void> => {
    try {
        await apiRequest(`/finance/invoices/${id}/send-reminder`, {
            method: 'POST',
        });
    } catch (error) {
        console.error('Failed to send reminder:', error);
    }
    
    // Update lastReminderAt in localStorage
    const storedInvoices = loadInvoicesFromStorage();
    const index = storedInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        storedInvoices[index] = { 
            ...storedInvoices[index], 
            lastReminderAt: new Date().toISOString() 
        };
        saveInvoicesToStorage(storedInvoices);
    }
};

export const markInvoicePaid = async (id: string): Promise<void> => {
    // Always update status to 'paid' in localStorage first
    const storedInvoices = loadInvoicesFromStorage();
    const index = storedInvoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
        storedInvoices[index] = { ...storedInvoices[index], status: 'paid' };
        saveInvoicesToStorage(storedInvoices);
        console.log('Invoice marked as paid in localStorage:', id);
    }
    
    try {
        await apiRequest(`/finance/invoices/${id}/mark-paid`, {
            method: 'POST',
        });
    } catch (error) {
        console.error('Failed to mark invoice as paid via API:', error);
        // Status already updated in localStorage, so continue
    }
};
