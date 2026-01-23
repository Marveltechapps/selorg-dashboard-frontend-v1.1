import { v4 as uuidv4 } from 'uuid';

export interface SettlementSummaryItem {
  id: string;
  gateway: string;
  matchedAmount: number;
  pendingAmount: number;
  mismatchAmount: number;
  status: "matched" | "pending" | "mismatch";
  matchPercent: number;
  lastRunAt: string;
}

export interface ReconciliationException {
  id: string;
  title: string;
  sourceType: "gateway" | "bank" | "internal";
  gateway?: string;
  amount: number;
  currency: string;
  status: "open" | "in_review" | "resolved" | "ignored";
  reasonCode: string;
  createdAt: string;
  details?: string;
  suggestedAction?: "investigate" | "resolve" | "write_off" | "retry_match";
}

export interface ReconciliationRun {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "success" | "failed";
  period: { from: string; to: string };
  gateways: string[];
}

// --- Mock Data ---

const MOCK_SUMMARY: SettlementSummaryItem[] = [
  {
    id: "settle_stripe",
    gateway: "Stripe",
    matchedAmount: 45200,
    pendingAmount: 0,
    mismatchAmount: 0,
    status: "matched",
    matchPercent: 100,
    lastRunAt: new Date().toISOString()
  },
  {
    id: "settle_paypal",
    gateway: "PayPal",
    matchedAmount: 12500,
    pendingAmount: 2500,
    mismatchAmount: 0,
    status: "pending",
    matchPercent: 83,
    lastRunAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "settle_adyen",
    gateway: "Adyen",
    matchedAmount: 32000,
    pendingAmount: 0,
    mismatchAmount: 120.50,
    status: "mismatch",
    matchPercent: 99.6,
    lastRunAt: new Date(Date.now() - 7200000).toISOString()
  }
];

let MOCK_EXCEPTIONS: ReconciliationException[] = [
  {
    id: "ex_001",
    title: "Txn #9921 not found in Bank",
    sourceType: "gateway",
    gateway: "Adyen",
    amount: 120.50,
    currency: "USD",
    status: "open",
    reasonCode: "missing_in_bank",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    suggestedAction: "investigate",
    details: "Transaction exists in Adyen settlement report but no matching credit found in Chase Bank statement."
  },
  {
    id: "ex_002",
    title: "Duplicate Fee Charge",
    sourceType: "internal",
    gateway: "PayPal",
    amount: -4.50,
    currency: "USD",
    status: "open",
    reasonCode: "fee_mismatch",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    suggestedAction: "resolve",
    details: "System recorded fee twice for Order #ORD-8822."
  },
  {
    id: "ex_003",
    title: "Currency Conversion Variance",
    sourceType: "bank",
    amount: 12.30,
    currency: "USD",
    status: "in_review",
    reasonCode: "fx_variance",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    suggestedAction: "write_off",
    details: "Exchange rate difference exceeds 1% threshold."
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchReconSummary = async (date: string): Promise<SettlementSummaryItem[]> => {
  await delay(600);
  // In a real app, filtering by date would happen here.
  // We'll just return the mock data + some randomization to simulate different days if needed.
  return MOCK_SUMMARY;
};

export const fetchExceptions = async (status: string = "open"): Promise<ReconciliationException[]> => {
  await delay(500);
  if (status === 'all') return MOCK_EXCEPTIONS;
  return MOCK_EXCEPTIONS.filter(e => e.status === status || e.status === 'in_review');
};

export const runReconciliation = async (date: string, gateways: string[]): Promise<ReconciliationRun> => {
  await delay(300); // Initial start delay
  const runId = uuidv4();
  return {
    id: runId,
    startedAt: new Date().toISOString(),
    status: "running",
    period: { from: date, to: date },
    gateways
  };
};

export const fetchRunStatus = async (id: string): Promise<ReconciliationRun> => {
  await delay(500);
  // Mocking a successful run
  return {
    id,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    status: "success",
    period: { from: new Date().toISOString(), to: new Date().toISOString() },
    gateways: ["Stripe", "PayPal"]
  };
};

export const investigateException = async (id: string) => {
    await delay(400);
    const ex = MOCK_EXCEPTIONS.find(e => e.id === id);
    if (ex) {
        ex.status = "in_review";
    }
    return ex;
};

export const resolveException = async (id: string, resolutionType: string, note?: string) => {
    await delay(600);
    const index = MOCK_EXCEPTIONS.findIndex(e => e.id === id);
    if (index !== -1) {
        MOCK_EXCEPTIONS[index] = {
            ...MOCK_EXCEPTIONS[index],
            status: "resolved",
            details: note ? `${MOCK_EXCEPTIONS[index].details}\nResolution Note: ${note}` : MOCK_EXCEPTIONS[index].details
        };
        // Update summary just to show reactivity (simplified logic)
        return MOCK_EXCEPTIONS[index];
    }
    throw new Error("Exception not found");
};

export const getGatewayDetails = async (gatewayId: string) => {
    await delay(400);
    return MOCK_SUMMARY.find(s => s.id === gatewayId);
};
