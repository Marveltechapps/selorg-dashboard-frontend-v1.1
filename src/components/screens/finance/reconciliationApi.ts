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

// Load from localStorage or use default
const loadExceptionsFromStorage = (): ReconciliationException[] => {
  try {
    const stored = localStorage.getItem('reconciliationExceptions');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load exceptions from storage', e);
  }
  return [];
};

const saveExceptionsToStorage = (exceptions: ReconciliationException[]) => {
  try {
    localStorage.setItem('reconciliationExceptions', JSON.stringify(exceptions));
  } catch (e) {
    console.error('Failed to save exceptions to storage', e);
  }
};

// Default mock exceptions - always available
const DEFAULT_EXCEPTIONS: ReconciliationException[] = [
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
  },
  {
    id: "ex_004",
    title: "Missing Settlement Record",
    sourceType: "gateway",
    gateway: "Stripe",
    amount: 89.25,
    currency: "USD",
    status: "open",
    reasonCode: "missing_settlement",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    suggestedAction: "investigate",
    details: "Payment processed but settlement record not found in bank statement."
  },
  {
    id: "ex_005",
    title: "Amount Mismatch",
    sourceType: "bank",
    gateway: "PayPal",
    amount: 15.75,
    currency: "USD",
    status: "open",
    reasonCode: "amount_mismatch",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    suggestedAction: "resolve",
    details: "Bank statement shows different amount than gateway settlement."
  }
];

// Initialize MOCK_EXCEPTIONS - use stored data if available, otherwise use defaults
const getInitialExceptions = (): ReconciliationException[] => {
  const stored = loadExceptionsFromStorage();
  if (stored.length > 0) {
    return stored;
  }
  // Return default exceptions and save them
  saveExceptionsToStorage(DEFAULT_EXCEPTIONS);
  return DEFAULT_EXCEPTIONS;
};

let MOCK_EXCEPTIONS: ReconciliationException[] = getInitialExceptions();

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
  // Always load fresh from localStorage first
  let storedExceptions = loadExceptionsFromStorage();
  
  // If no stored data, initialize with defaults
  if (storedExceptions.length === 0) {
    saveExceptionsToStorage(DEFAULT_EXCEPTIONS);
    storedExceptions = DEFAULT_EXCEPTIONS;
  }
  
  // Update MOCK_EXCEPTIONS to match stored data
  MOCK_EXCEPTIONS = storedExceptions;
  
  if (status === 'all') return storedExceptions;
  // For 'open' status, show both 'open' and 'in_review' exceptions
  if (status === 'open') {
    return storedExceptions.filter(e => e.status === 'open' || e.status === 'in_review');
  }
  return storedExceptions.filter(e => e.status === status);
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
    // Always load fresh from localStorage
    let storedExceptions = loadExceptionsFromStorage();
    
    // If no stored data, initialize with defaults
    if (storedExceptions.length === 0) {
        saveExceptionsToStorage(DEFAULT_EXCEPTIONS);
        storedExceptions = [...DEFAULT_EXCEPTIONS];
    }
    
    const index = storedExceptions.findIndex(e => e.id === id);
    if (index !== -1) {
        storedExceptions[index] = {
            ...storedExceptions[index],
            status: "in_review"
        };
        // Update both MOCK_EXCEPTIONS and localStorage
        MOCK_EXCEPTIONS = storedExceptions;
        saveExceptionsToStorage(storedExceptions);
        return storedExceptions[index];
    }
    throw new Error("Exception not found");
};

export const resolveException = async (id: string, resolutionType: string, note?: string) => {
    await delay(600);
    // Always load fresh from localStorage
    let storedExceptions = loadExceptionsFromStorage();
    
    // If no stored data, initialize with defaults
    if (storedExceptions.length === 0) {
        saveExceptionsToStorage(DEFAULT_EXCEPTIONS);
        storedExceptions = [...DEFAULT_EXCEPTIONS];
    }
    
    const index = storedExceptions.findIndex(e => e.id === id);
    if (index !== -1) {
        storedExceptions[index] = {
            ...storedExceptions[index],
            status: "resolved",
            details: note ? `${storedExceptions[index].details || ''}\nResolution Note: ${note}` : storedExceptions[index].details
        };
        // Update both MOCK_EXCEPTIONS and localStorage
        MOCK_EXCEPTIONS = storedExceptions;
        saveExceptionsToStorage(storedExceptions);
        return storedExceptions[index];
    }
    throw new Error("Exception not found");
};

export const getGatewayDetails = async (gatewayId: string) => {
    await delay(400);
    return MOCK_SUMMARY.find(s => s.id === gatewayId);
};
