import { v4 as uuidv4 } from 'uuid';

export type ReportType = "revenue_growth" | "cash_flow" | "expense_breakdown" | "pnl";
export type Granularity = "month" | "quarter";

export interface RevenueGrowthPoint {
  date: string;
  totalRevenue: number;
  recurringRevenue: number;
  newRevenue: number;
  churnAmount: number;
}

export interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
  projected?: number;
}

export interface ExpenseCategory {
    name: string;
    amount: number;
    color?: string;
}

export interface ExpenseBreakdownPoint {
  date: string;
  categories: ExpenseCategory[];
}

export interface AnalyticsExportRequest {
    metric: ReportType;
    from: string;
    to: string;
    format: "pdf" | "xlsx";
    details?: "summary" | "detailed";
}

// --- Mock Data Generators ---

const generateDates = (count: number, granularity: Granularity): string[] => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        dates.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return dates;
};

const DATES_12_MONTHS = generateDates(12, 'month');

// 1. Revenue Growth Data
export const generateRevenueGrowthData = (): RevenueGrowthPoint[] => {
    return DATES_12_MONTHS.map((date, idx) => {
        const base = 50000 + (idx * 2500); // Growing base
        const newRev = 5000 + (Math.random() * 3000);
        const recurring = base;
        const total = recurring + newRev;
        const churn = 1000 + (Math.random() * 500);

        return {
            date,
            totalRevenue: Math.round(total),
            recurringRevenue: Math.round(recurring),
            newRevenue: Math.round(newRev),
            churnAmount: Math.round(churn)
        };
    });
};

// 2. Cash Flow Data
export const generateCashFlowData = (): CashFlowPoint[] => {
    return DATES_12_MONTHS.map((date, idx) => {
        const inflow = 60000 + (idx * 3000) + (Math.random() * 10000 - 5000);
        const outflow = 45000 + (idx * 2000) + (Math.random() * 8000 - 4000);
        
        return {
            date,
            inflow: Math.round(inflow),
            outflow: Math.round(outflow),
            net: Math.round(inflow - outflow),
            projected: idx >= 10 ? Math.round((inflow - outflow) * 1.1) : undefined // Project last 2 months + future? simpler to just overlap
        };
    });
};

// 3. Expense Breakdown Data
const EXPENSE_CATEGORIES = [
    { name: 'Vendor Payments', color: '#3B82F6' },
    { name: 'Operations', color: '#10B981' },
    { name: 'Payroll', color: '#F59E0B' },
    { name: 'Marketing', color: '#8B5CF6' },
    { name: 'Overheads', color: '#6B7280' },
];

export const generateExpenseBreakdownData = (): ExpenseBreakdownPoint[] => {
    return DATES_12_MONTHS.map(date => {
        const categories = EXPENSE_CATEGORIES.map(cat => ({
            name: cat.name,
            amount: Math.round(10000 + Math.random() * 15000),
            color: cat.color
        }));
        return { date, categories };
    });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchRevenueGrowth = async (from?: string, to?: string, granularity: Granularity = 'month'): Promise<RevenueGrowthPoint[]> => {
    await delay(600);
    return generateRevenueGrowthData();
};

export const fetchCashFlow = async (from?: string, to?: string, granularity: Granularity = 'month'): Promise<CashFlowPoint[]> => {
    await delay(700);
    return generateCashFlowData();
};

export const fetchExpenseBreakdown = async (from?: string, to?: string, granularity: Granularity = 'month'): Promise<ExpenseBreakdownPoint[]> => {
    await delay(600);
    return generateExpenseBreakdownData();
};

export const exportAnalyticsReport = async (req: AnalyticsExportRequest): Promise<void> => {
    await delay(1500);
    // Simulate export
    return;
};
