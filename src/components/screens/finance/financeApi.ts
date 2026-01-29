import { v4 as uuidv4 } from 'uuid';

export interface FinanceSummary {
  entityId: string;
  date: string;
  totalReceivedToday: number;
  totalReceivedChangePercent: number;
  pendingSettlementsAmount: number;
  pendingSettlementsGateways: number;
  vendorPayoutsAmount: number;
  vendorPayoutsStatusText: string;
  failedPaymentsRatePercent: number;
  failedPaymentsCount: number;
  failedPaymentsThresholdPercent: number;
}

export interface PaymentMethodSplitItem {
  method: string;
  label: string;
  percentage: number;
  amount: number;
  txnCount: number;
}

export interface LiveTransaction {
  id: string;
  txnId: string;
  amount: number;
  currency: string;
  methodDisplay: string;
  maskedDetails: string;
  status: "success" | "failed" | "pending";
  createdAt: string;
  gateway: string;
  orderId?: string;
  customerName?: string;
}

export interface CashFlowSnapshot {
  dateRange: { from: string; to: string };
  inflowAmount: number;
  outflowAmount: number;
  netCashFlow: number;
  breakdownByType: Array<{ type: string; amount: number }>;
}

// Mock Data Generators

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

export const fetchFinanceSummary = async (entityId: string, date: string): Promise<FinanceSummary> => {
  const response = await fetch(`http://localhost:5001/api/v1/finance/summary?entityId=${entityId}&date=${date}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch finance summary');
  const data = await response.json();
  return data.success ? data.data : data;
};

export const fetchPaymentMethodSplit = async (entityId: string, date: string): Promise<PaymentMethodSplitItem[]> => {
  const response = await fetch(`http://localhost:5001/api/v1/finance/payment-method-split?entityId=${entityId}&date=${date}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch payment method split');
  const data = await response.json();
  return data.success ? data.data : data;
};

const METHODS = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "COD"];
const STATUSES: ("success" | "failed" | "pending")[] = ["success", "success", "success", "success", "pending", "failed"];

export const fetchLiveTransactions = async (entityId: string, limit: number = 10, cursor?: string): Promise<LiveTransaction[]> => {
  const params = new URLSearchParams({ entityId, limit: String(limit) });
  if (cursor) params.append('cursor', cursor);
  const response = await fetch(`http://localhost:5001/api/v1/finance/live-transactions?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch live transactions');
  const data = await response.json();
  return data.success ? data.data : data;
};

export const fetchCashFlow = async (entityId: string, from: string, to: string): Promise<CashFlowSnapshot> => {
  await new Promise(r => setTimeout(r, 800));
  return {
    dateRange: { from, to },
    inflowAmount: 1250000,
    outflowAmount: 980000,
    netCashFlow: 270000,
    breakdownByType: [
      { type: "Sales", amount: 1200000 },
      { type: "Refunds", amount: -50000 },
      { type: "Vendor Payouts", amount: -600000 },
      { type: "OpEx", amount: -380000 },
    ]
  };
};

export const exportFinanceReport = async (payload: { entityId: string, dateRange: any, format: string, scope: string[] }) => {
  await new Promise(r => setTimeout(r, 1500));
  return "https://example.com/finance-report.pdf";
};
