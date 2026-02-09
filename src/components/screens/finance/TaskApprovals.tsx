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
          // Load from localStorage first
          const stored = localStorage.getItem('approvalTasks');
          let storedTasks: ApprovalTask[] = [];
          if (stored) {
            try {
              storedTasks = JSON.parse(stored);
            } catch (e) {
              console.error('Failed to parse stored tasks', e);
            }
          }
          
          // Parallel fetch
          const [summaryData, tasksData] = await Promise.all([
              fetchApprovalSummary(),
              fetchApprovalTasks('pending', activeFilter)
          ]);
          setSummary(summaryData);
          
          // Merge stored tasks with API results
          const mergedTasks = tasksData.map(apiTask => {
            const storedTask = storedTasks.find(t => t.id === apiTask.id);
            return storedTask && storedTask.status !== 'pending' 
              ? storedTask 
              : apiTask;
          });
          
          // Add any stored tasks not in API
          storedTasks.forEach(storedTask => {
            if (!mergedTasks.find(t => t.id === storedTask.id)) {
              mergedTasks.push(storedTask);
            }
          });
          
          // Filter to only pending for display
          const pendingTasks = mergedTasks.filter(t => t.status === 'pending');
          setTasks(pendingTasks);
          
          // Save merged data
          try {
            localStorage.setItem('approvalTasks', JSON.stringify(mergedTasks));
          } catch (e) {
            console.error('Failed to save tasks', e);
          }
      } catch (e) {
          toast.error("Failed to load approval tasks");
      } finally {
          setIsLoading(false);
      }
  };

  // Initial load only
  useEffect(() => {
      loadData();
  }, []); // Only load on mount, not when filter changes
  
  // Update tasks when filter changes (client-side filtering)
  useEffect(() => {
      if (!isLoading) {
          // Load from localStorage and filter client-side
          const stored = localStorage.getItem('approvalTasks');
          let storedTasks: ApprovalTask[] = [];
          if (stored) {
              try {
                  storedTasks = JSON.parse(stored);
              } catch (e) {
                  console.error('Failed to parse stored tasks', e);
              }
          }
          
          // Filter to pending tasks
          let filtered = storedTasks.filter(t => t.status === 'pending');
          
          // Apply type filter
          if (activeFilter !== 'all') {
              filtered = filtered.filter(t => t.type === activeFilter);
          }
          
          setTasks(filtered);
      }
  }, [activeFilter, isLoading]);

  const handleDecision = async (id: string, payload: ApprovalDecisionPayload) => {
      // Optimistic update - remove from UI immediately
      const taskBeforeUpdate = tasks.find(t => t.id === id);
      setTasks(prev => prev.filter(t => t.id !== id));
      
      // Update counts optimistically
      if (summary) {
          setSummary(prev => {
              if (!prev) return null;
              return {
                  ...prev,
                  approvedTodayCount: payload.decision === 'approve' ? prev.approvedTodayCount + 1 : prev.approvedTodayCount,
                  refundRequestsCount: prev.refundRequestsCount > 0 ? prev.refundRequestsCount - 1 : 0
              };
          });
      }

      try {
          // Update localStorage immediately
          const stored = localStorage.getItem('approvalTasks');
          let storedTasks: ApprovalTask[] = [];
          if (stored) {
              try {
                  storedTasks = JSON.parse(stored);
              } catch (e) {
                  console.error('Failed to parse stored tasks', e);
              }
          }
          
          // Update task status in stored tasks
          const updatedTasks = storedTasks.map(t => 
              t.id === id 
                  ? { 
                      ...t, 
                      status: payload.decision === 'approve' ? 'approved' : 'rejected' as any,
                      approvedAt: new Date().toISOString(),
                      approverName: 'Current User',
                      notes: payload.note
                  }
                  : t
          );
          localStorage.setItem('approvalTasks', JSON.stringify(updatedTasks));
          
          // Update summary counts based on task type
          if (taskBeforeUpdate) {
              const taskType = taskBeforeUpdate.type;
              setSummary(prev => {
                  if (!prev) return null;
                  let refundCount = prev.refundRequestsCount;
                  let invoiceCount = prev.invoiceApprovalsCount;
                  
                  if (taskType === 'refund' && refundCount > 0) {
                      refundCount = refundCount - 1;
                  } else if (taskType === 'invoice' && invoiceCount > 0) {
                      invoiceCount = invoiceCount - 1;
                  }
                  
                  return {
                      ...prev,
                      refundRequestsCount: refundCount,
                      invoiceApprovalsCount: invoiceCount,
                      approvedTodayCount: payload.decision === 'approve' ? prev.approvedTodayCount + 1 : prev.approvedTodayCount
                  };
              });
          }
          
          // Call API in background (but don't wait for it to update UI)
          submitTaskDecision(id, payload).catch(e => {
              console.error('Failed to submit decision to API:', e);
          });
          
          toast.success(`Task ${payload.decision}d`);
          // No reload - UI already updated
      } catch (e) {
          console.error('Failed to process decision:', e);
          toast.error("Failed to process decision");
          // Revert optimistic update
          if (taskBeforeUpdate) {
              setTasks(prev => [...prev, taskBeforeUpdate].sort((a, b) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              ));
          }
          // Revert summary
          if (summary && taskBeforeUpdate) {
              setSummary(prev => {
                  if (!prev) return null;
                  return {
                      ...prev,
                      approvedTodayCount: payload.decision === 'approve' ? Math.max(0, prev.approvedTodayCount - 1) : prev.approvedTodayCount,
                      refundRequestsCount: prev.refundRequestsCount + 1
                  };
              });
          }
      }
  };

  const handleQuickApprove = (id: string) => handleDecision(id, { decision: 'approve' });
  const handleQuickReject = (id: string) => handleDecision(id, { decision: 'reject', note: 'Quick rejection' });

  const handleTaskClick = (task: ApprovalTask) => {
      setSelectedTask(task);
      setDrawerOpen(true);
  };
  
  // Prevent any default form submissions or page reloads
  useEffect(() => {
    const handleSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('submit', handleSubmit, true);
    return () => document.removeEventListener('submit', handleSubmit, true);
  }, []);
  
  // Summary is updated in handleDecision, no need for separate effect

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Task & Workflow Approvals</h1>
          <p className="text-[#757575] text-sm">Approve refunds, large payments, and invoice settlements</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            loadData();
          }}
          type="button"
        >
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
