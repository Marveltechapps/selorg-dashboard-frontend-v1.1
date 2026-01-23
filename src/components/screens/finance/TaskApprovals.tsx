import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from "../../ui/button";
import { toast } from 'sonner';

import { 
    ApprovalTask, 
    ApprovalSummary, 
    TaskType,
    ApprovalDecisionPayload,
    fetchApprovalSummary,
    fetchApprovalTasks,
    submitTaskDecision
} from './approvalsApi';

import { ApprovalSummaryCards } from './ApprovalSummaryCards';
import { ApprovalQueueTable } from './ApprovalQueueTable';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';

export function TaskApprovals() {
  const [summary, setSummary] = useState<ApprovalSummary | null>(null);
  const [tasks, setTasks] = useState<ApprovalTask[]>([]);
  
  const [activeFilter, setActiveFilter] = useState<TaskType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // Parallel fetch
          const [summaryData, tasksData] = await Promise.all([
              fetchApprovalSummary(),
              fetchApprovalTasks('pending', activeFilter)
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

  const handleDecision = async (id: string, payload: ApprovalDecisionPayload) => {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // Update counts optimistically
      if (summary) {
          setSummary(prev => {
              if (!prev) return null;
              // Just decrementing counts based on type is tricky without knowing the type here easily unless we look it up from 'tasks' before filtering
              // But we can just rely on re-fetch or simple approximate updates
              // Let's keep it simple: assume success
              return {
                  ...prev,
                  approvedTodayCount: payload.decision === 'approve' ? prev.approvedTodayCount + 1 : prev.approvedTodayCount
              };
          });
      }

      try {
          await submitTaskDecision(id, payload);
          toast.success(`Task ${payload.decision}d`);
          // Optionally refresh summary to be accurate
          const newSummary = await fetchApprovalSummary();
          setSummary(newSummary);
      } catch (e) {
          toast.error("Failed to process decision");
          loadData(); // Revert
      }
  };

  const handleQuickApprove = (id: string) => handleDecision(id, { decision: 'approve' });
  const handleQuickReject = (id: string) => handleDecision(id, { decision: 'reject', note: 'Quick rejection' });

  const handleTaskClick = (task: ApprovalTask) => {
      setSelectedTask(task);
      setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Task & Workflow Approvals</h1>
          <p className="text-[#757575] text-sm">Approve refunds, large payments, and invoice settlements</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <ApprovalSummaryCards 
          summary={summary}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
      />

      <ApprovalQueueTable 
          tasks={tasks}
          isLoading={isLoading}
          onTaskClick={handleTaskClick}
          onQuickApprove={handleQuickApprove}
          onQuickReject={handleQuickReject}
      />

      <TaskDetailsDrawer 
          task={selectedTask}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onDecision={handleDecision}
      />
    </div>
  );
}
