import React, { useState, useEffect } from 'react';
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import { CheckCircle2, ShieldAlert, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { 
    FinanceAlert, 
    AlertActionPayload, 
    fetchAlerts, 
    performAlertAction, 
    clearResolvedAlerts 
} from './financeAlertsApi';

import { FinanceAlertCard } from './FinanceAlertCard';
import { AlertDetailsDrawer } from './AlertDetailsDrawer';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

export function FinanceAlerts() {
  const [alerts, setAlerts] = useState<FinanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drawer State
  const [selectedAlert, setSelectedAlert] = useState<FinanceAlert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Clear Confirm State
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // We fetch 'open' by default which includes in_progress and acknowledged in our mock logic
          const data = await fetchAlerts('open'); 
          setAlerts(data);
      } catch (e) {
          toast.error("Failed to load alerts");
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadData();
  }, []);

  const handleAlertAction = async (id: string, payload: AlertActionPayload) => {
      // Optimistic update
      setAlerts(prev => prev.map(a => {
          if (a.id === id) {
              // Simple status map for immediate UI feedback
              let newStatus = a.status;
              if (payload.actionType === 'dismiss') newStatus = 'dismissed';
              if (payload.actionType === 'resolve') newStatus = 'resolved';
              if (payload.actionType === 'acknowledge') newStatus = 'acknowledged';
              if (['check_gateway', 'review_txn', 'reconcile'].includes(payload.actionType)) newStatus = 'in_progress';
              
              return { ...a, status: newStatus as any };
          }
          return a;
      }));

      // If we are dismissing or resolving, we might want to remove it from the list after a delay?
      // For now, let's keep it in the list but maybe filtered if we strictly follow 'fetchAlerts("open")'.
      // If the user performs an action from the Card, we call the API.
      
      try {
          const updated = await performAlertAction(id, payload);
          
          // Update with real server response
          setAlerts(prev => prev.map(a => a.id === id ? updated : a));

          // If action was dismiss or resolve, remove from view (optional UX choice)
          if (payload.actionType === 'dismiss' || payload.actionType === 'resolve') {
              setAlerts(prev => prev.filter(a => a.id !== id));
              toast.success(`Alert ${payload.actionType === 'dismiss' ? 'dismissed' : 'resolved'}`);
          }

      } catch (e) {
          toast.error("Failed to update alert");
          loadData(); // Revert on error
      }
  };

  const handleClearResolved = async () => {
      try {
          await clearResolvedAlerts();
          setAlerts(prev => prev.filter(a => !['resolved', 'dismissed'].includes(a.status)));
          toast.success("Resolved alerts cleared");
          setIsClearConfirmOpen(false);
      } catch (e) {
          toast.error("Failed to clear alerts");
      }
  };

  const handleCardClick = (alert: FinanceAlert) => {
      setSelectedAlert(alert);
      setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Alerts & Exceptions</h1>
          <p className="text-[#757575] text-sm">Payment failures, SLA breaches, and high-value alerts</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white border border-[#E0E0E0] text-[#212121] hover:bg-[#F5F5F5]"
                onClick={() => setIsClearConfirmOpen(true)}
            >
                Clear Resolved
            </Button>
        </div>
      </div>

      <div className="space-y-4 min-h-[400px]">
          {isLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
          ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
                  <div className="p-4 bg-green-50 text-green-600 rounded-full mb-4">
                      <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">All Systems Operational</h3>
                  <p className="text-gray-500 mt-1">No active alerts. Payment systems look healthy.</p>
              </div>
          ) : (
              alerts.map(alert => (
                  <FinanceAlertCard 
                      key={alert.id} 
                      alert={alert} 
                      onAction={handleAlertAction}
                      onClick={handleCardClick}
                  />
              ))
          )}
      </div>

      <AlertDetailsDrawer 
          alert={selectedAlert}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onAction={handleAlertAction}
      />

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Clear resolved alerts?</AlertDialogTitle>
            <AlertDialogDescription>
                This will hide all alerts that are marked Resolved or Dismissed from your view. This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearResolved}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
