export interface VendorInvoice {
  id: string;
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: "pending_approval" | "approved" | "scheduled" | "paid" | "overdue" | "rejected";
  paymentId?: string;
  uploadedBy: string;
  uploadedAt: string;
  attachmentUrl?: string;
  notes?: string;
  items?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

export interface VendorPayablesSummary {
  outstandingPayablesAmount: number;
  outstandingHorizonText: string;
  pendingApprovalCount: number;
  overdueAmount: number;
  overdueVendorsCount: number;
}

export interface NewPaymentRequest {
  vendorId: string;
  invoices: Array<{ invoiceId: string; amount: number }>;
  paymentDate: string;
  method: "bank_transfer" | "upi" | "card" | "check" | string;
  reference: string;
}

export interface VendorInvoiceFilter {
  status?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  accountNumber?: string;
}

const MOCK_VENDORS: Vendor[] = [
  { id: "v1", name: "Fresh Farms Supplies", email: "billing@freshfarms.com", accountNumber: "US8829...112" },
  { id: "v2", name: "Tech Logistics Inc.", email: "accounts@techlogistics.com", accountNumber: "US9912...334" },
  { id: "v3", name: "Global Packaging Solutions", email: "finance@globalpack.com", accountNumber: "US7721...009" },
  { id: "v4", name: "Clean & Safe Services", email: "billing@cleansafe.com", accountNumber: "US1122...887" },
  { id: "v5", name: "Speedy Delivery Partners", email: "invoices@speedy.com", accountNumber: "US3344...556" }
];

const MOCK_INVOICES: VendorInvoice[] = [
  {
    id: "inv_001",
    vendorId: "v1",
    vendorName: "Fresh Farms Supplies",
    invoiceNumber: "INV-2024-001",
    invoiceDate: "2024-10-12",
    dueDate: "2024-10-26",
    amount: 15400.00,
    currency: "USD",
    status: "pending_approval",
    uploadedBy: "John Doe",
    uploadedAt: "2024-10-13T10:00:00Z",
    items: [
      { description: "Organic Apples (Bulk)", quantity: 500, unitPrice: 20, total: 10000 },
      { description: "Premium Bananas", quantity: 300, unitPrice: 18, total: 5400 }
    ]
  },
  {
    id: "inv_002",
    vendorId: "v2",
    vendorName: "Tech Logistics Inc.",
    invoiceNumber: "INV-9921-A",
    invoiceDate: "2024-10-10",
    dueDate: "2024-10-24",
    amount: 2800.00,
    currency: "USD",
    status: "paid",
    paymentId: "pay_554",
    uploadedBy: "Jane Smith",
    uploadedAt: "2024-10-11T14:30:00Z"
  },
  {
    id: "inv_003",
    vendorId: "v3",
    vendorName: "Global Packaging Solutions",
    invoiceNumber: "GPS-8821",
    invoiceDate: "2024-09-15",
    dueDate: "2024-10-15",
    amount: 5600.50,
    currency: "USD",
    status: "overdue",
    uploadedBy: "System",
    uploadedAt: "2024-09-16T09:00:00Z"
  },
  {
    id: "inv_004",
    vendorId: "v1",
    vendorName: "Fresh Farms Supplies",
    invoiceNumber: "INV-2024-012",
    invoiceDate: "2024-10-18",
    dueDate: "2024-11-02",
    amount: 3200.00,
    currency: "USD",
    status: "approved",
    uploadedBy: "John Doe",
    uploadedAt: "2024-10-19T11:15:00Z"
  },
  {
    id: "inv_005",
    vendorId: "v4",
    vendorName: "Clean & Safe Services",
    invoiceNumber: "CS-991",
    invoiceDate: "2024-10-20",
    dueDate: "2024-11-20",
    amount: 1200.00,
    currency: "USD",
    status: "pending_approval",
    uploadedBy: "Jane Smith",
    uploadedAt: "2024-10-21T08:45:00Z"
  },
  {
    id: "inv_006",
    vendorId: "v3",
    vendorName: "Global Packaging Solutions",
    invoiceNumber: "GPS-9002",
    invoiceDate: "2024-08-01",
    dueDate: "2024-08-31",
    amount: 6900.00,
    currency: "USD",
    status: "overdue",
    uploadedBy: "System",
    uploadedAt: "2024-08-02T10:00:00Z"
  },
  {
    id: "inv_007",
    vendorId: "v5",
    vendorName: "Speedy Delivery Partners",
    invoiceNumber: "SPD-112",
    invoiceDate: "2024-10-22",
    dueDate: "2024-11-05",
    amount: 450.00,
    currency: "USD",
    status: "scheduled",
    uploadedBy: "John Doe",
    uploadedAt: "2024-10-23T13:20:00Z"
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPayablesSummary = async (): Promise<VendorPayablesSummary> => {
  await delay(500);
  const outstanding = MOCK_INVOICES.filter(i => ['pending_approval', 'approved', 'scheduled', 'overdue'].includes(i.status));
  const pending = MOCK_INVOICES.filter(i => i.status === 'pending_approval');
  const overdue = MOCK_INVOICES.filter(i => i.status === 'overdue');
  
  const overdueVendors = new Set(overdue.map(i => i.vendorId)).size;

  return {
    outstandingPayablesAmount: outstanding.reduce((acc, curr) => acc + curr.amount, 0),
    outstandingHorizonText: "Due next 30 days",
    pendingApprovalCount: pending.length,
    overdueAmount: overdue.reduce((acc, curr) => acc + curr.amount, 0),
    overdueVendorsCount: overdueVendors
  };
};

export const fetchVendorInvoices = async (filter: VendorInvoiceFilter) => {
  await delay(600);
  let filtered = [...MOCK_INVOICES];

  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(i => i.status === filter.status);
  }

  if (filter.vendorId && filter.vendorId !== 'all') {
    filtered = filtered.filter(i => i.vendorId === filter.vendorId);
  }

  if (filter.dateFrom) {
    filtered = filtered.filter(i => new Date(i.invoiceDate) >= new Date(filter.dateFrom!));
  }

  if (filter.dateTo) {
    filtered = filtered.filter(i => new Date(i.invoiceDate) <= new Date(filter.dateTo!));
  }

  // Sort by Due Date (soonest first)
  filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const start = (filter.page - 1) * filter.pageSize;
  const end = start + filter.pageSize;

  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page: filter.page,
    pageSize: filter.pageSize
  };
};

export const fetchVendorInvoiceDetails = async (id: string) => {
  await delay(400);
  const invoice = MOCK_INVOICES.find(i => i.id === id);
  if (!invoice) throw new Error("Invoice not found");
  // Simulate fetching vendor details to attach
  const vendor = MOCK_VENDORS.find(v => v.id === invoice.vendorId);
  return { ...invoice, vendorDetails: vendor };
};

export const fetchVendors = async () => {
    await delay(300);
    return MOCK_VENDORS;
};

export const approveInvoice = async (id: string) => {
  await delay(800);
  const index = MOCK_INVOICES.findIndex(i => i.id === id);
  if (index !== -1) {
    MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], status: "approved" };
    return MOCK_INVOICES[index];
  }
  throw new Error("Invoice not found");
};

export const rejectInvoice = async (id: string, reason: string) => {
  await delay(800);
  const index = MOCK_INVOICES.findIndex(i => i.id === id);
  if (index !== -1) {
    MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], status: "rejected", notes: reason };
    return MOCK_INVOICES[index];
  }
  throw new Error("Invoice not found");
};

export const markInvoicePaid = async (id: string) => {
  await delay(800);
  const index = MOCK_INVOICES.findIndex(i => i.id === id);
  if (index !== -1) {
    MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], status: "paid" };
    return MOCK_INVOICES[index];
  }
  throw new Error("Invoice not found");
};

export const uploadInvoice = async (data: Partial<VendorInvoice>) => {
    await delay(1000);
    const newInvoice: VendorInvoice = {
        id: `inv_${Date.now()}`,
        vendorId: data.vendorId || "v1",
        vendorName: data.vendorName || "Unknown Vendor",
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        amount: data.amount || 0,
        currency: data.currency || "USD",
        status: "pending_approval",
        uploadedBy: "Current User",
        uploadedAt: new Date().toISOString()
    };
    MOCK_INVOICES.push(newInvoice);
    return newInvoice;
};

export const createPayment = async (request: NewPaymentRequest) => {
    await delay(1500);
    request.invoices.forEach(inv => {
        const index = MOCK_INVOICES.findIndex(i => i.id === inv.invoiceId);
        if (index !== -1) {
            MOCK_INVOICES[index] = { ...MOCK_INVOICES[index], status: "paid", paymentId: `pay_${Date.now()}` };
        }
    });
    return { success: true, paymentId: `pay_${Date.now()}` };
};
