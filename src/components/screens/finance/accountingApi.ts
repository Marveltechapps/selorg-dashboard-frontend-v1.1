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
    // Return mock data on error
    return {
      generalLedgerBalance: 1250000,
      receivablesBalance: 450000,
      payablesBalance: 320000,
      asOfDate: new Date().toISOString()
    };
  }
};

// Load from localStorage or use default
const loadLedgerEntriesFromStorage = (): LedgerEntry[] => {
  try {
    const stored = localStorage.getItem('ledgerEntries');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load ledger entries from storage', e);
  }
  return [];
};

const saveLedgerEntriesToStorage = (entries: LedgerEntry[]) => {
  try {
    localStorage.setItem('ledgerEntries', JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save ledger entries to storage', e);
  }
};

// Default mock entries
const getDefaultLedgerEntries = (): LedgerEntry[] => {
  const now = new Date();
  return [
    {
      id: 'entry_001',
      date: now.toISOString().split('T')[0],
      reference: 'JE-2024-001',
      description: 'Monthly Revenue Recognition',
      accountCode: '4100',
      accountName: 'Sales Revenue',
      debit: 0,
      credit: 125000,
      journalId: 'je_001',
      sourceModule: 'payments',
      createdAt: now.toISOString(),
      createdBy: 'System'
    },
    {
      id: 'entry_002',
      date: now.toISOString().split('T')[0],
      reference: 'JE-2024-001',
      description: 'Monthly Revenue Recognition',
      accountCode: '1200',
      accountName: 'Accounts Receivable',
      debit: 125000,
      credit: 0,
      journalId: 'je_001',
      sourceModule: 'payments',
      createdAt: now.toISOString(),
      createdBy: 'System'
    },
    {
      id: 'entry_003',
      date: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
      reference: 'JE-2024-002',
      description: 'Vendor Payment',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      debit: 45000,
      credit: 0,
      journalId: 'je_002',
      sourceModule: 'vendor',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      createdBy: 'Finance Team'
    },
    {
      id: 'entry_004',
      date: new Date(now.getTime() - 86400000).toISOString().split('T')[0],
      reference: 'JE-2024-002',
      description: 'Vendor Payment',
      accountCode: '1000',
      accountName: 'Cash',
      debit: 0,
      credit: 45000,
      journalId: 'je_002',
      sourceModule: 'vendor',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      createdBy: 'Finance Team'
    },
    {
      id: 'entry_005',
      date: new Date(now.getTime() - 172800000).toISOString().split('T')[0],
      reference: 'JE-2024-003',
      description: 'Inventory Adjustment',
      accountCode: '1200',
      accountName: 'Inventory',
      debit: 25000,
      credit: 0,
      journalId: 'je_003',
      sourceModule: 'manual',
      createdAt: new Date(now.getTime() - 172800000).toISOString(),
      createdBy: 'Finance Team'
    },
    {
      id: 'entry_006',
      date: new Date(now.getTime() - 172800000).toISOString().split('T')[0],
      reference: 'JE-2024-003',
      description: 'Inventory Adjustment',
      accountCode: '5000',
      accountName: 'Cost of Goods Sold',
      debit: 0,
      credit: 25000,
      journalId: 'je_003',
      sourceModule: 'manual',
      createdAt: new Date(now.getTime() - 172800000).toISOString(),
      createdBy: 'Finance Team'
    }
  ];
};

export const fetchLedgerEntries = async (params?: { dateFrom?: string; dateTo?: string; accountCode?: string }): Promise<LedgerEntry[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params?.accountCode) queryParams.append('accountCode', params.accountCode);
    
    const endpoint = `/finance/ledger/entries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest<{ success: boolean; data: LedgerEntry[] }>(endpoint);
    if (response.data && response.data.length > 0) {
      saveLedgerEntriesToStorage(response.data);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch ledger entries:', error);
  }
  
  // Always return data - from storage or defaults
  let storedEntries = loadLedgerEntriesFromStorage();
  if (storedEntries.length === 0) {
    storedEntries = getDefaultLedgerEntries();
    saveLedgerEntriesToStorage(storedEntries);
  }
  return storedEntries;
};

const DEFAULT_ACCOUNTS: AccountOption[] = [
  { code: '1000', name: 'Cash', type: 'asset' },
  { code: '1100', name: 'Accounts Receivable', type: 'asset' },
  { code: '1200', name: 'Inventory', type: 'asset' },
  { code: '1300', name: 'Prepaid Expenses', type: 'asset' },
  { code: '2000', name: 'Accounts Payable', type: 'liability' },
  { code: '2100', name: 'Accrued Expenses', type: 'liability' },
  { code: '2200', name: 'Short-term Debt', type: 'liability' },
  { code: '3000', name: 'Equity', type: 'equity' },
  { code: '3100', name: 'Retained Earnings', type: 'equity' },
  { code: '4100', name: 'Sales Revenue', type: 'revenue' },
  { code: '4200', name: 'Service Revenue', type: 'revenue' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
  { code: '6000', name: 'Operating Expenses', type: 'expense' },
  { code: '6100', name: 'Salaries & Wages', type: 'expense' },
  { code: '6200', name: 'Rent Expense', type: 'expense' },
  { code: '6300', name: 'Utilities Expense', type: 'expense' }
];

// Load journal entries from localStorage
const loadJournalEntriesFromStorage = (): JournalEntry[] => {
  try {
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load journal entries from storage', e);
  }
  return [];
};

const saveJournalEntriesToStorage = (entries: JournalEntry[]) => {
  try {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save journal entries to storage', e);
  }
};

export const fetchAccounts = async (): Promise<AccountOption[]> => {
  try {
    const response = await apiRequest<{ success: boolean; data: AccountOption[] }>('/finance/ledger/accounts');
    if (response.data && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
  }
  // Always return default accounts
  return DEFAULT_ACCOUNTS;
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
    if (response.data) {
      // Save to localStorage
      const storedEntries = loadLedgerEntriesFromStorage();
      const newEntries: LedgerEntry[] = [];
      
      // Create ledger entries from journal entry lines
      entry.lines.forEach((line, idx) => {
        const account = DEFAULT_ACCOUNTS.find(acc => acc.code === line.accountCode);
        newEntries.push({
          id: `entry_${Date.now()}_${idx}`,
          date: entry.date,
          reference: entry.reference,
          description: line.description || entry.memo || 'Journal Entry',
          accountCode: line.accountCode,
          accountName: account?.name || line.accountName || 'Unknown Account',
          debit: line.debit,
          credit: line.credit,
          journalId: response.data.id,
          sourceModule: 'manual',
          createdAt: new Date().toISOString(),
          createdBy: entry.createdBy || 'Current User'
        });
      });
      
      // Add new entries to stored entries
      const updatedEntries = [...newEntries, ...storedEntries];
      saveLedgerEntriesToStorage(updatedEntries);
      
      // Also save journal entry to localStorage
      const storedJournals = loadJournalEntriesFromStorage();
      storedJournals.push(response.data);
      saveJournalEntriesToStorage(storedJournals);
      
      return response.data;
    }
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    // Even if API fails, save to localStorage for persistence
    const journalId = `je_${Date.now()}`;
    const newJournalEntry: JournalEntry = {
      id: journalId,
      date: entry.date,
      reference: entry.reference,
      memo: entry.memo,
      lines: entry.lines,
      status: 'posted',
      createdBy: entry.createdBy || 'Current User',
      createdAt: new Date().toISOString()
    };
    
    // Create ledger entries from journal entry lines
    const storedEntries = loadLedgerEntriesFromStorage();
    const newEntries: LedgerEntry[] = [];
    
    entry.lines.forEach((line, idx) => {
      const account = DEFAULT_ACCOUNTS.find(acc => acc.code === line.accountCode);
      newEntries.push({
        id: `entry_${Date.now()}_${idx}`,
        date: entry.date,
        reference: entry.reference,
        description: line.description || entry.memo || 'Journal Entry',
        accountCode: line.accountCode,
        accountName: account?.name || line.accountName || 'Unknown Account',
        debit: line.debit,
        credit: line.credit,
        journalId: journalId,
        sourceModule: 'manual',
        createdAt: new Date().toISOString(),
        createdBy: entry.createdBy || 'Current User'
      });
    });
    
      // Add new entries to stored entries
      const updatedEntries = [...newEntries, ...storedEntries];
      saveLedgerEntriesToStorage(updatedEntries);
      
      // Also save journal entry to localStorage
      const storedJournals = loadJournalEntriesFromStorage();
      storedJournals.push(newJournalEntry);
      saveJournalEntriesToStorage(storedJournals);
      
      return newJournalEntry;
  }
  throw new Error('Failed to create journal entry');
};

export const fetchJournalDetails = async (journalId: string): Promise<JournalEntry | null> => {
  try {
    const response = await apiRequest<{ success: boolean; data: JournalEntry }>(`/finance/ledger/journal-entries/${journalId}`);
    if (response.data) {
      // Save to localStorage
      const stored = loadJournalEntriesFromStorage();
      const existingIndex = stored.findIndex(j => j.id === journalId);
      if (existingIndex >= 0) {
        stored[existingIndex] = response.data;
      } else {
        stored.push(response.data);
      }
      saveJournalEntriesToStorage(stored);
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch journal details:', error);
    // Try to load from localStorage
    const stored = loadJournalEntriesFromStorage();
    const journal = stored.find(j => j.id === journalId);
    if (journal) {
      return journal;
    }
  }
  
  // If not found, try to reconstruct from ledger entries
  const storedEntries = loadLedgerEntriesFromStorage();
  const relatedEntries = storedEntries.filter(e => e.journalId === journalId);
  if (relatedEntries.length > 0) {
    const firstEntry = relatedEntries[0];
    const journal: JournalEntry = {
      id: journalId,
      date: firstEntry.date,
      reference: firstEntry.reference,
      memo: firstEntry.description,
      lines: relatedEntries.map(e => ({
        accountCode: e.accountCode,
        accountName: e.accountName,
        debit: e.debit,
        credit: e.credit,
        description: e.description
      })),
      status: 'posted',
      createdBy: firstEntry.createdBy,
      createdAt: firstEntry.createdAt
    };
    return journal;
  }
  
  return null;
};
