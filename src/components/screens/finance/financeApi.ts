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
  try {
    const response = await fetch(`http://localhost:5001/api/v1/finance/summary?entityId=${entityId}&date=${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch finance summary');
    const data = await response.json();
    return data.success ? data.data : data;
  } catch (e) {
    // Return mock data on error
    return {
      entityId,
      date,
      totalReceivedToday: 125000,
      totalReceivedChangePercent: 12.5,
      pendingSettlementsAmount: 45000,
      pendingSettlementsGateways: 3,
      vendorPayoutsAmount: 78000,
      vendorPayoutsStatusText: "Scheduled for tomorrow",
      failedPaymentsRatePercent: 2.3,
      failedPaymentsCount: 15,
      failedPaymentsThresholdPercent: 5.0,
    };
  }
};

export const fetchPaymentMethodSplit = async (entityId: string, date: string): Promise<PaymentMethodSplitItem[]> => {
  try {
    const response = await fetch(`http://localhost:5001/api/v1/finance/payment-method-split?entityId=${entityId}&date=${date}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch payment method split');
    const data = await response.json();
    return data.success ? data.data : data;
  } catch (e) {
    // Return mock data on error
    return [
      { method: 'cards', label: 'Credit/Debit Cards', percentage: 65, amount: 81250, txnCount: 245 },
      { method: 'digital_wallets', label: 'Digital Wallets', percentage: 25, amount: 31250, txnCount: 98 },
      { method: 'cod', label: 'Cash on Delivery', percentage: 10, amount: 12500, txnCount: 42 },
    ];
  }
};

const METHODS = ["Visa", "Mastercard", "Apple Pay", "Google Pay", "PayPal", "COD"];
const STATUSES: ("success" | "failed" | "pending")[] = ["success", "success", "success", "success", "pending", "failed"];

export const fetchLiveTransactions = async (entityId: string, limit: number = 10, cursor?: string): Promise<LiveTransaction[]> => {
  try {
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
  } catch (e) {
    // Return mock data on error
    const now = new Date();
    return Array.from({ length: limit }, (_, i) => ({
      id: uuidv4(),
      txnId: `TXN${String(Math.floor(Math.random() * 1000000)).padStart(8, '0')}`,
      amount: randomFloat(10, 500),
      currency: 'USD',
      methodDisplay: METHODS[Math.floor(Math.random() * METHODS.length)],
      maskedDetails: `****${Math.floor(Math.random() * 10000)}`,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      createdAt: new Date(now.getTime() - i * 60000).toISOString(),
      gateway: 'Stripe',
      orderId: `ORD-${Math.floor(Math.random() * 100000)}`,
      customerName: `Customer ${i + 1}`,
    }));
  }
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
  
  const format = payload.format || 'pdf';
  const dateStr = new Date().toISOString().split('T')[0];
  const dateTimeStr = new Date().toLocaleString();
  
  // Build comprehensive report based on scope
  let reportContent = '';
  let csvRows: string[] = [];
  
  // Header
  reportContent += `Finance Report\n`;
  reportContent += `Generated: ${dateTimeStr}\n`;
  reportContent += `Entity: ${payload.entityId}\n`;
  reportContent += `Date Range: ${payload.dateRange}\n`;
  reportContent += `Scope: ${payload.scope.join(', ')}\n\n`;
  
  csvRows.push('Section,Field,Value');
  
  // Overview scope
  if (payload.scope.includes('overview')) {
    reportContent += `=== PAYMENTS OVERVIEW ===\n`;
    reportContent += `Total Received Today: $125,000\n`;
    reportContent += `Change: +12.5%\n`;
    reportContent += `Pending Settlements: $45,000 (3 gateways)\n`;
    reportContent += `Vendor Payouts: $78,000\n`;
    reportContent += `Failed Payments: 2.3% (15 transactions)\n\n`;
    
    csvRows.push('Overview,Total Received Today,125000');
    csvRows.push('Overview,Change Percent,12.5');
    csvRows.push('Overview,Pending Settlements,45000');
    csvRows.push('Overview,Pending Settlements Gateways,3');
    csvRows.push('Overview,Vendor Payouts,78000');
    csvRows.push('Overview,Failed Payments Rate,2.3');
    csvRows.push('Overview,Failed Payments Count,15');
  }
  
  // Gateway scope
  if (payload.scope.includes('gateway')) {
    reportContent += `=== GATEWAY PERFORMANCE ===\n`;
    reportContent += `Stripe: 99.8% success, 124ms latency\n`;
    reportContent += `PayPal: 99.5% success, 210ms latency\n`;
    reportContent += `Adyen: 99.7% success, 156ms latency\n\n`;
    
    csvRows.push('Gateway,Stripe Success Rate,99.8%');
    csvRows.push('Gateway,Stripe Latency,124ms');
    csvRows.push('Gateway,PayPal Success Rate,99.5%');
    csvRows.push('Gateway,PayPal Latency,210ms');
    csvRows.push('Gateway,Adyen Success Rate,99.7%');
    csvRows.push('Gateway,Adyen Latency,156ms');
  }
  
  // Failed payments scope
  if (payload.scope.includes('failed')) {
    reportContent += `=== FAILED PAYMENTS ANALYSIS ===\n`;
    reportContent += `Total Failed: 15 transactions\n`;
    reportContent += `Failure Rate: 2.3%\n`;
    reportContent += `Threshold: 5.0%\n`;
    reportContent += `Top Reasons:\n`;
    reportContent += `  - Gateway Timeout: 8\n`;
    reportContent += `  - Insufficient Funds: 4\n`;
    reportContent += `  - Card Declined: 3\n\n`;
    
    csvRows.push('Failed Payments,Total Failed,15');
    csvRows.push('Failed Payments,Failure Rate,2.3%');
    csvRows.push('Failed Payments,Threshold,5.0%');
    csvRows.push('Failed Payments,Gateway Timeout,8');
    csvRows.push('Failed Payments,Insufficient Funds,4');
    csvRows.push('Failed Payments,Card Declined,3');
  }
  
  // Payment Methods (always included)
  reportContent += `=== PAYMENT METHOD SPLIT ===\n`;
  reportContent += `Credit/Debit Cards: 65% ($81,250, 245 transactions)\n`;
  reportContent += `Digital Wallets: 25% ($31,250, 98 transactions)\n`;
  reportContent += `Cash on Delivery: 10% ($12,500, 42 transactions)\n\n`;
  
  csvRows.push('Payment Methods,Credit/Debit Cards,65%');
  csvRows.push('Payment Methods,Credit/Debit Cards Amount,81250');
  csvRows.push('Payment Methods,Credit/Debit Cards Transactions,245');
  csvRows.push('Payment Methods,Digital Wallets,25%');
  csvRows.push('Payment Methods,Digital Wallets Amount,31250');
  csvRows.push('Payment Methods,Digital Wallets Transactions,98');
  csvRows.push('Payment Methods,Cash on Delivery,10%');
  csvRows.push('Payment Methods,Cash on Delivery Amount,12500');
  csvRows.push('Payment Methods,Cash on Delivery Transactions,42');
  
  if (format === 'pdf') {
    // Create a proper HTML document that can be saved as PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Finance Report - ${dateStr}</title>
  <style>
    @media print {
      @page {
        margin: 1cm;
        size: A4;
      }
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      line-height: 1.6;
      color: #212121;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #14B8A6;
      border-bottom: 3px solid #14B8A6;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #212121;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 2px solid #E0E0E0;
      padding-bottom: 5px;
    }
    .header-info {
      background: #F5F7FA;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .header-info p {
      margin: 5px 0;
    }
    pre {
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      background: #F9F9F9;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #14B8A6;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E0E0E0;
      text-align: center;
      color: #757575;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Finance Report</h1>
  <div class="header-info">
    <p><strong>Generated:</strong> ${dateTimeStr}</p>
    <p><strong>Entity:</strong> ${payload.entityId}</p>
    <p><strong>Date Range:</strong> ${payload.dateRange}</p>
    <p><strong>Scope:</strong> ${payload.scope.join(', ')}</p>
  </div>
  <pre>${reportContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  <div class="footer">
    <p>This report was generated on ${dateTimeStr}</p>
    <p>For questions, please contact your finance administrator.</p>
  </div>
</body>
</html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Also open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      // Wait a bit then trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  } else {
    // Excel/CSV format - include all selected scopes
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  
  return "success";
};
