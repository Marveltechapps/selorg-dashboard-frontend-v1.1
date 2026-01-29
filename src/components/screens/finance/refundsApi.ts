export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  reasonCode: "item_damaged" | "expired" | "late_delivery" | "wrong_item" | "customer_cancelled" | "other";
  reasonText: string;
  amount: number;
  currency: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "processed" | "escalated";
  channel: "customer_support" | "self_service" | "ops_adjustment";
  paymentId?: string;
  notes?: string;
}

export interface ChargebackCase {
  id: string;
  cardNetwork: string;
  amount: number;
  currency: string;
  initiatedAt: string;
  status: "open" | "won" | "lost" | "under_review";
  reasonCode: string;
  orderId?: string;
}

export interface RefundsSummary {
  refundRequestsCount: number;
  activeChargebacksCount: number;
  processedTodayAmount: number;
}

export interface RefundQueueFilter {
  status?: string;
  page: number;
  pageSize: number;
  reason?: string;
  dateFrom?: string;
  dateTo?: string;
}

const MOCK_REFUNDS: RefundRequest[] = [
  {
    id: "ref_001",
    orderId: "ORD-8821",
    customerId: "cust_123",
    customerName: "Emily White",
    customerEmail: "emily.w@example.com",
    reasonCode: "item_damaged",
    reasonText: "Apples arrived bruised and mushy.",
    amount: 15.50,
    currency: "USD",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "pending",
    channel: "self_service",
    paymentId: "pay_abc123"
  },
  {
    id: "ref_002",
    orderId: "ORD-8855",
    customerId: "cust_456",
    customerName: "James Green",
    customerEmail: "j.green@example.com",
    reasonCode: "late_delivery",
    reasonText: "Order arrived 2 hours after the slot.",
    amount: 12.50,
    currency: "USD",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: "pending",
    channel: "customer_support",
    paymentId: "pay_def456"
  },
  {
    id: "ref_003",
    orderId: "ORD-9901",
    customerId: "cust_789",
    customerName: "Sarah Connor",
    customerEmail: "sarah.c@example.com",
    reasonCode: "wrong_item",
    reasonText: "Received milk instead of almond milk.",
    amount: 4.99,
    currency: "USD",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "approved",
    channel: "self_service",
    paymentId: "pay_ghi789",
    notes: "Auto-approved by system rules"
  },
  {
    id: "ref_004",
    orderId: "ORD-9950",
    customerId: "cust_101",
    customerName: "Michael Scott",
    customerEmail: "m.scott@example.com",
    reasonCode: "other",
    reasonText: "I just didn't like the vibe of this salad.",
    amount: 18.00,
    currency: "USD",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    status: "rejected",
    channel: "self_service",
    paymentId: "pay_jkl012",
    notes: "Invalid reason code - customer preference not covered"
  },
  {
    id: "ref_005",
    orderId: "ORD-1002",
    customerId: "cust_202",
    customerName: "Pam Beesly",
    customerEmail: "pam.b@example.com",
    reasonCode: "expired",
    reasonText: "Yogurt was past expiration date.",
    amount: 6.50,
    currency: "USD",
    requestedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: "pending",
    channel: "self_service",
    paymentId: "pay_mno345"
  }
];

const MOCK_CHARGEBACKS: ChargebackCase[] = [
  {
    id: "cb_001",
    cardNetwork: "Visa",
    amount: 125.00,
    currency: "USD",
    initiatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: "open",
    reasonCode: "Fraudulent Transaction",
    orderId: "ORD-7712"
  },
  {
    id: "cb_002",
    cardNetwork: "Mastercard",
    amount: 45.00,
    currency: "USD",
    initiatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    status: "under_review",
    reasonCode: "Product Not Received",
    orderId: "ORD-7650"
  },
  {
    id: "cb_003",
    cardNetwork: "Amex",
    amount: 220.50,
    currency: "USD",
    initiatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    status: "won",
    reasonCode: "Duplicate Processing",
    orderId: "ORD-7100"
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchRefundsSummary = async (): Promise<RefundsSummary> => {
  await delay(500);
  const pending = MOCK_REFUNDS.filter(r => r.status === 'pending').length;
  const activeCB = MOCK_CHARGEBACKS.filter(c => ['open', 'under_review'].includes(c.status)).length;
  // Mock processed today amount
  const processedToday = 1240.50;

  return {
    refundRequestsCount: pending,
    activeChargebacksCount: activeCB,
    processedTodayAmount: processedToday
  };
};

export const fetchRefundQueue = async (filter: RefundQueueFilter) => {
  await delay(600);
  let filtered = [...MOCK_REFUNDS];

  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(r => r.status === filter.status);
  }

  if (filter.reason && filter.reason !== 'all') {
      filtered = filtered.filter(r => r.reasonCode === filter.reason);
  }

  // Simple pagination
  const start = (filter.page - 1) * filter.pageSize;
  const end = start + filter.pageSize;
  
  return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page: filter.page,
      pageSize: filter.pageSize
  };
};

export const fetchRefundDetails = async (id: string) => {
    await delay(400);
    const refund = MOCK_REFUNDS.find(r => r.id === id);
    if (!refund) throw new Error("Refund request not found");
    return refund;
};

export const approveRefund = async (id: string, notes?: string, partialAmount?: number) => {
    await delay(800);
    const index = MOCK_REFUNDS.findIndex(r => r.id === id);
    if (index !== -1) {
        MOCK_REFUNDS[index] = { 
            ...MOCK_REFUNDS[index], 
            status: "approved", 
            notes: notes ? (MOCK_REFUNDS[index].notes ? MOCK_REFUNDS[index].notes + "\n" + notes : notes) : MOCK_REFUNDS[index].notes,
            amount: partialAmount ?? MOCK_REFUNDS[index].amount 
        };
        return MOCK_REFUNDS[index];
    }
    throw new Error("Refund not found");
};

export const rejectRefund = async (id: string, reason: string) => {
    await delay(800);
    const index = MOCK_REFUNDS.findIndex(r => r.id === id);
    if (index !== -1) {
        MOCK_REFUNDS[index] = { 
            ...MOCK_REFUNDS[index], 
            status: "rejected", 
            notes: `Rejected: ${reason}` 
        };
        return MOCK_REFUNDS[index];
    }
    throw new Error("Refund not found");
};

export const fetchChargebacks = async () => {
    await delay(600);
    return MOCK_CHARGEBACKS;
};
