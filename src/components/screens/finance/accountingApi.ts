import { apiRequest } from '@/api/apiClient';

export interface LedgerSummary {
  generalLedgerBalance: number;
  receivablesBalance: number;
  payablesBalance: number;
  asOfDate: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  journalId: string;
  sourceModule: "payments" | "vendor" | "refunds" | "manual" | string;
  createdAt: string;
  createdBy: string;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName?: string; // Optional for input, populated by backend
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  memo?: string;
  lines: JournalEntryLine[];
  status: "draft" | "posted";
  createdBy: string;
  createdAt: string;
}

export interface AccountOption {
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
}

// --- API Functions ---

export const fetchAccountingSummary = async (): Promise<LedgerSummary> => {
  try {
    const response = await apiRequest<{ success: boolean; data: LedgerSummary }>('/finance/ledger/summary');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch accounting summary:', error);
    throw error;
  }
};

export const fetchLedgerEntries = async (params?: { dateFrom?: string; dateTo?: string; accountCode?: string }): Promise<LedgerEntry[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.accountCode) queryParams.append('accountCode', params.accountCode);
    
    const endpoint = `/finance/ledger/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest<{ success: boolean; data: LedgerEntry[] }>(endpoint);
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch ledger entries:', error);
    throw error;
  }
};

export const fetchAccounts = async (): Promise<AccountOption[]> => {
  try {
    const response = await apiRequest<{ success: boolean; data: AccountOption[] }>('/finance/ledger/accounts');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    throw error;
  }
};

export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'status'>): Promise<JournalEntry> => {
  try {
    const response = await apiRequest<{ success: boolean; data: JournalEntry }>(
      '/finance/ledger/journal-entries',
      {
        method: 'POST',
        body: JSON.stringify(entry),
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    throw error;
  }
};

export const fetchJournalDetails = async (journalId: string): Promise<JournalEntry | null> => {
  try {
    const response = await apiRequest<{ success: boolean; data: JournalEntry }>(`/finance/ledger/journal-entries/${journalId}`);
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch journal details:', error);
    throw error;
  }
};
