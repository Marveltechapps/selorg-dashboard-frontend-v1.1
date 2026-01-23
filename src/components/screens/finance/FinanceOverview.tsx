import React, { useEffect, useState } from 'react';
import { 
  fetchFinanceSummary, 
  fetchPaymentMethodSplit, 
  FinanceSummary, 
  PaymentMethodSplitItem,
  LiveTransaction 
} from './financeApi';
import { FinanceSummaryCards } from './FinanceSummaryCards';
import { PaymentMethodSplitCard } from './PaymentMethodSplitCard';
import { LiveTransactionsTable } from './LiveTransactionsTable';
import { TransactionDetailsDrawer } from './TransactionDetailsDrawer';
import { ExportFinanceReportModal } from './ExportFinanceReportModal';
import { Download, TrendingUp, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function FinanceOverview() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [split, setSplit] = useState<PaymentMethodSplitItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction State
  const [selectedTxn, setSelectedTxn] = useState<LiveTransaction | null>(null);
  const [filterMethod, setFilterMethod] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, splitData] = await Promise.all([
        fetchFinanceSummary("default", new Date().toISOString()),
        fetchPaymentMethodSplit("default", new Date().toISOString())
      ]);
      setSummary(summaryData);
      setSplit(splitData);
    } catch (e) {
      toast.error("Failed to load finance overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMethodClick = (method: string) => {
    setFilterMethod(prev => prev === method ? null : method);
  };

  const handleCashFlowNav = () => {
    toast.info("Navigating to Cash Flow Analysis", { description: "This feature is coming soon." });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212121] flex items-center gap-3">
            Finance Overview 
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200 uppercase tracking-wider font-semibold">
               SECURE
            </span>
          </h1>
          <p className="text-[#757575] text-sm">Real-time payment flows, gateway status, and daily liquidity</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button variant="outline" className="bg-white" onClick={() => setIsExportOpen(true)}>
            <Download size={16} className="mr-2" />
            Download Report
          </Button>
          <Button className="bg-[#14B8A6] hover:bg-[#0D9488] text-white" onClick={handleCashFlowNav}>
            <TrendingUp size={16} className="mr-2" />
            View Cash Flow
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <FinanceSummaryCards data={summary} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
         {/* Payment Methods */}
         <div className="lg:col-span-1 h-full">
            <PaymentMethodSplitCard 
              data={split} 
              loading={loading} 
              onMethodClick={handleMethodClick} 
            />
         </div>

         {/* Live Transactions */}
         <div className="lg:col-span-2 h-full">
            <LiveTransactionsTable 
               entityId="default" 
               onTransactionClick={setSelectedTxn}
               filterMethod={filterMethod}
            />
         </div>
      </div>

      {/* Modals & Drawers */}
      <ExportFinanceReportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />

      <TransactionDetailsDrawer 
        transaction={selectedTxn} 
        onClose={() => setSelectedTxn(null)} 
      />
    </div>
  );
}
