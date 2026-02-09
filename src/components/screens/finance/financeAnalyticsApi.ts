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
    // Generate mock P&L data
    const revenue = 125000;
    const cogs = 45000;
    const grossMargin = revenue - cogs;
    const operatingExpenses = 35000;
    const netIncome = grossMargin - operatingExpenses;
    
    const dateStr = new Date().toISOString().split('T')[0];
    
    if (req.format === 'pdf') {
        // Load jsPDF from CDN and generate PDF
        return new Promise<void>((resolve, reject) => {
            // Check if jsPDF is already loaded
            if ((window as any).jspdf) {
                generatePDF();
            } else {
                // Load jsPDF from CDN
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    generatePDF();
                };
                script.onerror = () => {
                    // Fallback: use print dialog approach
                    generatePDFFallback();
                    resolve();
                };
                document.head.appendChild(script);
            }
            
            function generatePDF() {
                try {
                    const jsPDFLib = (window as any).jspdf;
                    if (!jsPDFLib) {
                        generatePDFFallback();
                        resolve();
                        return;
                    }
                    const { jsPDF } = jsPDFLib;
                    const doc = new jsPDF();
                    
                    // Set font
                    doc.setFont('helvetica');
                    
                    // Title
                    doc.setFontSize(20);
                    doc.setTextColor(33, 33, 33);
                    doc.text('Profit & Loss Statement', 105, 20, { align: 'center' });
                    
                    // Header info
                    doc.setFontSize(10);
                    doc.setTextColor(117, 117, 117);
                    doc.text(`Period: ${req.from} to ${req.to}`, 20, 35);
                    doc.text(`Generated: ${dateStr}`, 20, 42);
                    
                    // Table header
                    doc.setFontSize(12);
                    doc.setTextColor(33, 33, 33);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Item', 20, 60);
                    doc.text('Amount', 170, 60, { align: 'right' });
                    
                    // Draw line
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, 65, 190, 65);
                    
                    // Table rows
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                    let yPos = 75;
                    
                    const rows = [
                        { label: 'Revenue', amount: revenue },
                        { label: 'Cost of Goods Sold', amount: cogs },
                        { label: 'Gross Margin', amount: grossMargin },
                        { label: 'Operating Expenses', amount: operatingExpenses }
                    ];
                    
                    rows.forEach(row => {
                        doc.setTextColor(33, 33, 33);
                        doc.text(row.label, 20, yPos);
                        doc.text(`$${row.amount.toLocaleString()}`, 170, yPos, { align: 'right' });
                        yPos += 10;
                    });
                    
                    // Net Income (bold)
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setDrawColor(200, 200, 200);
                    doc.line(20, yPos - 2, 190, yPos - 2);
                    doc.text('Net Income', 20, yPos + 5);
                    doc.text(`$${netIncome.toLocaleString()}`, 170, yPos + 5, { align: 'right' });
                    
                    // Save PDF
                    doc.save(`P&L_Report_${dateStr}.pdf`);
                    resolve();
                } catch (error) {
                    console.error('Error generating PDF:', error);
                    generatePDFFallback();
                    resolve();
                }
            }
            
            function generatePDFFallback() {
                // Fallback: Create HTML and use print dialog
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>P&L Report - ${dateStr}</title>
                        <meta charset="UTF-8">
                        <style>
                          @media print {
                            @page { margin: 1cm; size: A4; }
                          }
                          body { 
                            font-family: Arial, sans-serif; 
                            padding: 40px; 
                            margin: 0;
                            color: #212121;
                          }
                          h1 { 
                            color: #212121; 
                            margin-bottom: 10px;
                            font-size: 24px;
                          }
                          .header-info {
                            margin-bottom: 30px;
                            color: #757575;
                            font-size: 14px;
                          }
                          table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 20px; 
                          }
                          th, td { 
                            padding: 12px; 
                            text-align: left; 
                            border-bottom: 1px solid #ddd; 
                          }
                          th { 
                            background-color: #f5f5f5; 
                            font-weight: bold;
                            color: #212121;
                          }
                          tr:last-child td {
                            font-weight: bold;
                            font-size: 16px;
                            border-top: 2px solid #212121;
                            background-color: #f9f9f9;
                          }
                        </style>
                      </head>
                      <body>
                        <h1>Profit & Loss Statement</h1>
                        <div class="header-info">
                          <p><strong>Period:</strong> ${req.from} to ${req.to}</p>
                          <p><strong>Generated:</strong> ${dateStr}</p>
                        </div>
                        <table>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th style="text-align: right;">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Revenue</td>
                              <td style="text-align: right;">$${revenue.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td>Cost of Goods Sold</td>
                              <td style="text-align: right;">$${cogs.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td>Gross Margin</td>
                              <td style="text-align: right;">$${grossMargin.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td>Operating Expenses</td>
                              <td style="text-align: right;">$${operatingExpenses.toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td><strong>Net Income</strong></td>
                              <td style="text-align: right;"><strong>$${netIncome.toLocaleString()}</strong></td>
                            </tr>
                          </tbody>
                        </table>
                        <script>
                          window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 100);
                          };
                        </script>
                      </body>
                    </html>
                `;
                
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                } else {
                    // If popup blocked, download as HTML
                    const blob = new Blob([htmlContent], { type: 'text/html' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `P&L_Report_${dateStr}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }
            }
        });
    } else {
        // Excel format (CSV)
        const csvContent = `Profit & Loss Statement,Period: ${req.from} to ${req.to}\n\nItem,Amount\nRevenue,${revenue}\nCost of Goods Sold,${cogs}\nGross Margin,${grossMargin}\nOperating Expenses,${operatingExpenses}\nNet Income,${netIncome}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `P&L_Report_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
};
