import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from "../../ui/button";
import { toast } from 'sonner';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';

import { 
    ProcurementApprovalTask, 
    ProcurementApprovalSummary, 
    ProcurementApprovalDecision,
    fetchProcurementSummary,
    fetchProcurementTasks,
    submitTaskDecision,
    ProcurementTaskStatus
} from './procurementApprovalsApi';

import { ProcurementApprovalSummaryCards } from './ProcurementApprovalSummaryCards';
import { ProcurementApprovalQueueTable } from './ProcurementApprovalQueueTable';
import { ProcurementTaskDetailsDrawer } from './ProcurementTaskDetailsDrawer';

export function VendorTaskApprovals() {
  const [summary, setSummary] = useState<ProcurementApprovalSummary | null>(null);
  const [tasks, setTasks] = useState<ProcurementApprovalTask[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<ProcurementTaskStatus>('pending');
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer
  const [selectedTask, setSelectedTask] = useState<ProcurementApprovalTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // Parallel fetch
          const [summaryData, tasksData] = await Promise.all([
              fetchProcurementSummary(),
              fetchProcurementTasks(activeFilter)
          ]);
          setSummary(summaryData);
          setTasks(tasksData);
      } catch (e) {
          toast.error("Failed to load approval tasks");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadData();
  }, [activeFilter]);

  const handleDecision = async (id: string, payload: ProcurementApprovalDecision) => {
      // Optimistic UI update
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // Update counts optimistically
      if (summary) {
          setSummary(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  pendingRequestsCount: Math.max(0, prev.pendingRequestsCount - 1),
                  approvedTodayCount: payload.decision === 'approve' ? prev.approvedTodayCount + 1 : prev.approvedTodayCount,
                  rejectedTodayCount: payload.decision === 'reject' ? prev.rejectedTodayCount + 1 : prev.rejectedTodayCount
              };
          });
      }

      try {
          await submitTaskDecision(id, payload);
          toast.success(
              payload.decision === 'approve' 
              ? "Request approved successfully" 
              : "Request rejected and requester notified"
          );
      } catch (e) {
          toast.error("Failed to process decision");
          loadData(); // Revert on failure
      }
  };

  const handleQuickApprove = (id: string) => handleDecision(id, { decision: 'approve' });
  const handleQuickReject = (id: string) => handleDecision(id, { decision: 'reject', reason: 'other' });

  const handleTaskClick = (task: ProcurementApprovalTask) => {
      setSelectedTask(task);
      setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task & Workflow Approvals"
        subtitle="Approve new vendors, purchase orders, and payment releases"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      <ProcurementApprovalSummaryCards 
          summary={summary}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
      />

      <ProcurementApprovalQueueTable 
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
      />

      <ProcurementTaskDetailsDrawer 
          task={selectedTask}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onDecision={handleDecision}
      />
    </div>
  );
}
