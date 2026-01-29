import React, { useState, useMemo, useEffect } from 'react';
import { Download, Trash2, History, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
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

import { Alert, AlertStatus } from './alerts/types';
import { alertsApi } from './alerts/alertsApi';
import { AlertTile } from './alerts/AlertTile';
import { AlertDetailDrawer } from './alerts/AlertDetailDrawer';
import { PricingConflictDialog } from './alerts/PricingConflictDialog';
import { StockAllocationModal } from './alerts/StockAllocationModal';
import { PauseCampaignDialog } from './alerts/PauseCampaignDialog';
import { AlertsFilterBar } from './alerts/AlertsFilterBar';
import { AlertHistoryDialog } from './alerts/AlertHistoryDialog';

interface MerchAlertsProps {
  searchQuery?: string;
  onNavigate?: (tab: string) => void;
}

export function MerchAlerts({ searchQuery = "", onNavigate }: MerchAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  // Load alerts from API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const alertsResp = await alertsApi.getAlerts({});
        if (!mounted) return;
        if (alertsResp.success && alertsResp.data) {
          setAlerts(alertsResp.data);
        } else if (alertsResp.data && Array.isArray(alertsResp.data)) {
          setAlerts(alertsResp.data);
        }
      } catch (err) {
        console.error('Failed to load alerts', err);
        toast.error('Failed to load alerts');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'active', // default to show new/in-progress
    search: '',
  });

  // History State
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync prop searchQuery with filter search
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  // Dialog States
  const [detailAlert, setDetailAlert] = useState<Alert | null>(null);
  const [pricingAlert, setPricingAlert] = useState<Alert | null>(null);
  const [stockAlert, setStockAlert] = useState<Alert | null>(null);
  const [pauseAlert, setPauseAlert] = useState<Alert | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Filtering Logic (Client side)
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!alert.title.toLowerCase().includes(query) && !alert.description.toLowerCase().includes(query)) return false;
      }
      if (filters.type !== 'all' && alert.type !== filters.type) return false;
      if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
      return true;
    }).sort((a, b) => {
        const severityScore = { critical: 3, warning: 2, info: 1 };
        const scoreA = severityScore[a.severity as keyof typeof severityScore] || 0;
        const scoreB = severityScore[b.severity as keyof typeof severityScore] || 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [alerts, filters.search, filters.type, filters.severity]);

  // Handlers - Updated locally
  const handleResolve = (id: string) => {
    const alert = alerts.find(a => (a.id || (a as any)._id) === id);
    if (alert) {
        setAlerts(prev => prev.filter(a => (a.id || (a as any)._id) !== id));
        setResolvedAlerts(prev => [{ ...alert, status: 'Resolved', updatedAt: new Date().toISOString() }, ...prev]);
        toast.success("Alert Resolved Locally");
    }
  };

  const handleDismiss = (id: string) => {
    const alert = alerts.find(a => (a.id || (a as any)._id) === id);
    if (alert) {
        setAlerts(prev => prev.filter(a => (a.id || (a as any)._id) !== id));
        setResolvedAlerts(prev => [{ ...alert, status: 'Dismissed', updatedAt: new Date().toISOString() }, ...prev]);
        toast.success("Alert Dismissed Locally");
    }
  };

  const handleAlertsBulkAction = (action: string) => {
      if (action === 'resolve') {
          const ids = Array.from(selectedAlerts);
          const solved = alerts.filter(a => ids.includes(a.id || (a as any)._id));
          setAlerts(prev => prev.filter(a => !ids.includes(a.id || (a as any)._id)));
          setResolvedAlerts(prev => [...solved.map(s => ({ ...s, status: 'Resolved' as AlertStatus })), ...prev]);
          toast.success(`${ids.length} alerts resolved locally`);
          setSelectedAlerts(new Set());
      } else if (action === 'clear') {
          setSelectedAlerts(new Set());
      }
  };

  const handleSelect = (id: string, checked: boolean) => {
      const newSet = new Set(selectedAlerts);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      setSelectedAlerts(newSet);
  };

  const handleTileAction = (action: string, alert: Alert) => {
      const alertId = alert.id || (alert as any)._id;
      switch (action) {
          case 'resolve_pricing':
              setPricingAlert(alert);
              break;
          case 'view_campaigns':
              if (onNavigate) {
                  onNavigate('promotions');
                  toast.info("Opening Campaigns", { description: `Filtering for conflict in ${alert.linkedEntities.campaigns?.map(c => c.name).join(' & ')}` });
              }
              break;
          case 'allocate_stock':
              setStockAlert(alert);
              break;
          case 'pause_campaign':
              setPauseAlert(alert);
              break;
          case 'view_report':
              if (onNavigate) {
                  onNavigate('analytics');
                  toast.info("Opening Analytics", { description: `Opening detailed report for ${alert.linkedEntities.campaigns?.[0]?.name || 'impacted entities'}` });
              }
              break;
          case 'dismiss':
              handleDismiss(alertId);
              break;
      }
  };

  const handleClearResolved = () => {
      toast.info("View Cleared");
      setIsClearConfirmOpen(false);
  };

  const handleSeedData = () => {
    setAlerts(INITIAL_ALERTS);
    toast.success("Mock alerts restored");
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Alerts & Exceptions</h1>
          <p className="text-[#757575] text-sm">Overlapping campaigns, stock shortages, and pricing conflicts</p>
        </div>
        <div className="flex gap-2">
             <Button variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => setIsHistoryOpen(true)}>
                <History className="h-4 w-4 mr-2" /> History
            </Button>
            <Button variant="outline" className="bg-white text-gray-700 hover:bg-gray-50 border-gray-200" onClick={() => setIsClearConfirmOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" /> Clear Resolved
            </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="shrink-0">
          <AlertsFilterBar 
            filters={filters} 
            setFilters={setFilters} 
            onBulkAction={handleAlertsBulkAction}
            selectedCount={selectedAlerts.size}
          />
      </div>

      {/* Alerts List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pb-10">
          {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-500 mt-2">Loading active alerts...</p>
              </div>
          ) : filteredAlerts.length > 0 ? (
              filteredAlerts.map(alert => (
                  <div key={alert.id || (alert as any)._id}>
                    <AlertTile 
                        alert={alert} 
                        isSelected={selectedAlerts.has(alert.id || (alert as any)._id)}
                        onSelect={(checked) => handleSelect(alert.id || (alert as any)._id, checked)}
                        onClick={() => setDetailAlert(alert)}
                        onAction={handleTileAction}
                    />
                  </div>
              ))
          ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">You're all caught up</h3>
                  <p className="text-gray-500 max-w-sm mt-1">No active alerts match your filters.</p>
                  {(filters.status !== 'active' || filters.type !== 'all' || filters.severity !== 'all') ? (
                      <Button variant="link" onClick={() => setFilters({ ...filters, status: 'active', type: 'all', severity: 'all', search: '' })}>
                          Clear Filters
                      </Button>
                  ) : (
                      <Button variant="outline" size="sm" className="mt-4 font-bold uppercase tracking-wider text-[10px]" onClick={handleSeedData}>
                          Seed Mock Alerts
                      </Button>
                  )}
              </div>
          )}
      </div>

      {/* Dialogs & Drawers */}
      <AlertDetailDrawer 
        alert={detailAlert} 
        onClose={() => setDetailAlert(null)} 
        onResolve={() => detailAlert && handleResolve(detailAlert.id || (detailAlert as any)._id)}
        onNavigate={onNavigate}
      />

      {pricingAlert && (
          <PricingConflictDialog 
            isOpen={!!pricingAlert} 
            onClose={() => setPricingAlert(null)}
            alert={pricingAlert}
            onResolve={() => handleResolve(pricingAlert.id || (pricingAlert as any)._id)}
          />
      )}

      {stockAlert && (
          <StockAllocationModal 
            isOpen={!!stockAlert} 
            onClose={() => setStockAlert(null)}
            alert={stockAlert}
            onResolve={() => handleResolve(stockAlert.id || (stockAlert as any)._id)}
          />
      )}

      {pauseAlert && (
          <PauseCampaignDialog 
             isOpen={!!pauseAlert}
             onClose={() => setPauseAlert(null)}
             alert={pauseAlert}
             onResolve={() => handleResolve(pauseAlert.id || (pauseAlert as any)._id)}
          />
      )}

      <AlertHistoryDialog 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        resolvedAlerts={resolvedAlerts} 
      />

      <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Clear Resolved Alerts?</AlertDialogTitle>
            <AlertDialogDescription>
                This will remove all resolved alerts from your main view. You can still access them in the Audit History.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearResolved}>Clear Alerts</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
