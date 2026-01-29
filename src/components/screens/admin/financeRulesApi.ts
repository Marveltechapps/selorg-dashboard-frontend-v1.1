import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface TaxRule {
  id: string;
  name: string;
  type: 'GST' | 'TDS' | 'CESS' | 'VAT';
  rate: number;
  applicableOn: string;
  isActive: boolean;
  effectiveFrom: string;
  threshold?: number;
}

export interface PayoutSchedule {
  id: string;
  vendorTier: 'platinum' | 'gold' | 'silver' | 'bronze';
  cycle: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  processingDay: string;
  minPayout: number;
  maxPayout: number;
  autoApprove: boolean;
  autoApproveThreshold: number;
}

export interface CommissionSlab {
  id: string;
  category: string;
  vendorTier: 'platinum' | 'gold' | 'silver' | 'bronze';
  commissionRate: number;
  minOrderValue: number;
  maxOrderValue: number;
  effectiveFrom: string;
}

export interface ReconciliationRule {
  id: string;
  name: string;
  type: 'order' | 'payment' | 'refund' | 'payout';
  autoReconcile: boolean;
  toleranceAmount: number;
  tolerancePercentage: number;
  frequency: 'realtime' | 'hourly' | 'daily';
  notifyOnMismatch: boolean;
}

export interface RefundPolicy {
  id: string;
  name: string;
  orderType: 'all' | 'prepaid' | 'cod';
  autoApproveThreshold: number;
  processingTime: number; // in hours
  refundMethod: 'original' | 'wallet' | 'both';
  requiresManagerApproval: boolean;
  managerApprovalThreshold: number;
}

export interface InvoiceSettings {
  autoGenerate: boolean;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  startingNumber: number;
  includeGST: boolean;
  includeTDS: boolean;
  paymentTerms: string;
  notesTemplate: string;
  footerText: string;
}

export interface PaymentTerm {
  id: string;
  name: string;
  creditPeriod: number; // in days
  lateFeePercentage: number;
  lateFeeGracePeriod: number; // in days
  applicableTo: 'vendors' | 'customers' | 'both';
  isDefault: boolean;
}

export interface FinancialLimit {
  id: string;
  name: string;
  limitType: 'transaction' | 'daily' | 'weekly' | 'monthly';
  entityType: 'customer' | 'vendor' | 'store';
  maxAmount: number;
  currentUsage: number;
  resetDate?: string;
  alertThreshold: number;
}

export interface FinancialYear {
  startMonth: number;
  startDay: number;
  currentYear: string;
  lockPreviousYears: boolean;
}

// --- Mock Data ---
<<<<<<< HEAD
let MOCK_FINANCIAL_YEAR: FinancialYear = {
  startMonth: 4,
  startDay: 1,
  currentYear: '2024-2025',
  lockPreviousYears: true,
};
=======
>>>>>>> 63b3bc210ee91a70915e036eecbe3c11bfc59f48

// --- API Functions ---

export async function fetchTaxRules(): Promise<TaxRule[]> {
  // TODO: Implement backend endpoint for tax rules
  return [];
}

export async function updateTaxRule(id: string, data: Partial<TaxRule>): Promise<TaxRule> {
  // TODO: Implement backend endpoint for tax rules
  throw new Error('Not implemented');
}

export async function createTaxRule(data: Omit<TaxRule, 'id'>): Promise<TaxRule> {
  // TODO: Implement backend endpoint for tax rules
  throw new Error('Not implemented');
}

export async function fetchPayoutSchedules(): Promise<PayoutSchedule[]> {
  // TODO: Implement backend endpoint for payout schedules
  return [];
}

export async function updatePayoutSchedule(id: string, data: Partial<PayoutSchedule>): Promise<PayoutSchedule> {
  // TODO: Implement backend endpoint for payout schedules
  throw new Error('Not implemented');
}

export async function fetchCommissionSlabs(): Promise<CommissionSlab[]> {
  // TODO: Implement backend endpoint for commission slabs
  return [];
}

export async function updateCommissionSlab(id: string, data: Partial<CommissionSlab>): Promise<CommissionSlab> {
  // TODO: Implement backend endpoint for commission slabs
  throw new Error('Not implemented');
}

export async function createCommissionSlab(data: Omit<CommissionSlab, 'id'>): Promise<CommissionSlab> {
  // TODO: Implement backend endpoint for commission slabs
  throw new Error('Not implemented');
}

export async function fetchReconciliationRules(): Promise<ReconciliationRule[]> {
  // TODO: Implement backend endpoint for reconciliation rules
  return [];
}

export async function updateReconciliationRule(id: string, data: Partial<ReconciliationRule>): Promise<ReconciliationRule> {
  // TODO: Implement backend endpoint for reconciliation rules
  throw new Error('Not implemented');
}

export async function fetchRefundPolicies(): Promise<RefundPolicy[]> {
  // TODO: Implement backend endpoint for refund policies
  return [];
}

export async function updateRefundPolicy(id: string, data: Partial<RefundPolicy>): Promise<RefundPolicy> {
  // TODO: Implement backend endpoint for refund policies
  throw new Error('Not implemented');
}

export async function fetchInvoiceSettings(): Promise<InvoiceSettings> {
<<<<<<< HEAD
  try {
    const response = await apiRequest<{ success: boolean; data: InvoiceSettings }>('/finance/invoice-settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch invoice settings:', error);
    // Return default mock data
    return {
      autoGenerate: true,
      invoicePrefix: 'QC-INV',
      invoiceNumberFormat: 'PREFIX-YYYY-NNNNNN',
      startingNumber: 100000,
      includeGST: true,
      includeTDS: false,
      paymentTerms: 'NET 30',
      notesTemplate: 'Thank you for your business!',
      footerText: 'Terms and conditions apply.',
    };
  }
}

export async function updateInvoiceSettings(data: Partial<InvoiceSettings>): Promise<InvoiceSettings> {
  try {
    const response = await apiRequest<{ success: boolean; data: InvoiceSettings }>('/finance/invoice-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update invoice settings:', error);
    // Return updated mock data
    const current = await fetchInvoiceSettings();
    return { ...current, ...data };
  }
=======
  // TODO: Implement backend endpoint for invoice settings
  return {
    invoicePrefix: 'INV',
    invoiceNumberFormat: 'INV-{year}-{number}',
    defaultPaymentTerms: 30,
    autoSend: false,
    reminderDays: [7, 3, 1],
    footerText: '',
    logoUrl: '',
  };
}

export async function updateInvoiceSettings(data: Partial<InvoiceSettings>): Promise<InvoiceSettings> {
  // TODO: Implement backend endpoint for invoice settings
  return await fetchInvoiceSettings();
>>>>>>> 63b3bc210ee91a70915e036eecbe3c11bfc59f48
}

export async function fetchPaymentTerms(): Promise<PaymentTerm[]> {
  // TODO: Implement backend endpoint for payment terms
  return [];
}

export async function updatePaymentTerm(id: string, data: Partial<PaymentTerm>): Promise<PaymentTerm> {
  // TODO: Implement backend endpoint for payment terms
  throw new Error('Not implemented');
}

export async function fetchFinancialLimits(): Promise<FinancialLimit[]> {
  // TODO: Implement backend endpoint for financial limits
  return [];
}

export async function updateFinancialLimit(id: string, data: Partial<FinancialLimit>): Promise<FinancialLimit> {
  // TODO: Implement backend endpoint for financial limits
  throw new Error('Not implemented');
}

export async function fetchFinancialYear(): Promise<FinancialYear> {
  // TODO: Implement backend endpoint for financial year
  return { ...MOCK_FINANCIAL_YEAR };
}

export async function updateFinancialYear(data: Partial<FinancialYear>): Promise<FinancialYear> {
  await new Promise(resolve => setTimeout(resolve, 400));
  MOCK_FINANCIAL_YEAR = { ...MOCK_FINANCIAL_YEAR, ...data };
  return { ...MOCK_FINANCIAL_YEAR };
}
