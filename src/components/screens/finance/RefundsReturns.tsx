import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { RefundsSummaryCards } from './RefundsSummaryCards';
import { RefundQueueTable } from './RefundQueueTable';
import { RefundDetailsDrawer } from './RefundDetailsDrawer';
import { ApproveRefundModal } from './ApproveRefundModal';
import { RejectRefundModal } from './RejectRefundModal';
import { DisputeCenter } from './DisputeCenter';

import { 
    RefundRequest, 
    RefundsSummary, 
    RefundQueueFilter,
    fetchRefundsSummary,
    fetchRefundQueue,
    fetchRefundDetails
} from './refundsApi';

export function RefundsReturns() {
  // --- State ---
  const [summary, setSummary] = useState<RefundsSummary | null>(null);
  const [queue, setQueue] = useState<RefundRequest[]>([]);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  
  const [filters, setFilters] = useState<RefundQueueFilter>({
      page: 1,
      pageSize: 10,
      status: 'pending',
      reason: undefined,
      dateFrom: undefined,
      dateTo: undefined
  });

  // Modals / Drawers
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);

  // --- Data Fetching ---
  const loadSummary = async () => {
      try {
          const data = await fetchRefundsSummary();
          setSummary(data);
      } catch (e) {
          console.error("Failed to load summary", e);
      } finally {
          setIsLoadingSummary(false);
      }
  };

  const loadQueue = useCallback(async () => {
      setIsLoadingQueue(true);
      try {
          const result = await fetchRefundQueue(filters);
          setQueue(result.data);
      } catch (e) {
          toast.error("Failed to load refund queue");
      } finally {
          setIsLoadingQueue(false);
      }
  }, [filters]);

  useEffect(() => {
      loadSummary();
  }, []);

  useEffect(() => {
      loadQueue();
  }, [loadQueue]);

  // --- Handlers ---
  const handleFilterClick = (type: 'pending' | 'chargebacks' | 'processed') => {
      if (type === 'chargebacks') {
          setDisputeOpen(true);
      } else if (type === 'processed') {
           setFilters(prev => ({ ...prev, status: 'processed', page: 1 }));
      } else {
           setFilters(prev => ({ ...prev, status: 'pending', page: 1 }));
      }
  };

  const handleApproveClick = (refund: RefundRequest) => {
      setSelectedRefund(refund);
      setApproveOpen(true);
  };

  const handleRejectClick = (refund: RefundRequest) => {
      setSelectedRefund(refund);
      setRejectOpen(true);
  };

  const handleViewDetails = async (refund: RefundRequest) => {
      setSelectedRefund(refund);
      setDetailsOpen(true);
      try {
          const detailed = await fetchRefundDetails(refund.id);
          setSelectedRefund(detailed);
      } catch (e) {
          // Silent fail
      }
  };

  const handleRefresh = () => {
      loadQueue();
      loadSummary();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Refunds & Returns</h1>
          <p className="text-[#757575] text-sm">Process refund requests, handle chargebacks, and track returns</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => setDisputeOpen(true)}
                className="px-4 py-2 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] flex items-center gap-2 shadow-sm transition-colors"
             >
                <AlertTriangle size={16} />
                Dispute Center
            </button>
        </div>
      </div>

      <RefundsSummaryCards 
        summary={summary} 
        isLoading={isLoadingSummary} 
        onFilterClick={handleFilterClick}
      />

      <RefundQueueTable 
        data={queue}
        isLoading={isLoadingQueue}
        filters={filters}
        onFilterChange={setFilters}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
        onViewDetails={handleViewDetails}
      />

      {/* Details Drawer */}
      <RefundDetailsDrawer 
        refund={selectedRefund}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onApprove={(r) => {
            setDetailsOpen(false);
            handleApproveClick(r);
        }}
        onReject={(r) => {
             setDetailsOpen(false);
             handleRejectClick(r);
        }}
      />

      {/* Action Modals */}
      <ApproveRefundModal 
        refund={selectedRefund}
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onSuccess={handleRefresh}
      />

      <RejectRefundModal 
        refund={selectedRefund}
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Dispute Center Modal */}
      <DisputeCenter 
        open={disputeOpen}
        onClose={() => setDisputeOpen(false)}
      />
    </div>
  );
}
