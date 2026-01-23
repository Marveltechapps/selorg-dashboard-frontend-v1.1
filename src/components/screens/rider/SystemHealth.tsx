import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';
import { Activity, Smartphone, Signal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getSystemHealthSummary,
  listDeviceHealth,
  runDiagnostics,
  SystemHealthSummary,
  DeviceHealth,
} from './systemHealthApi';

export function SystemHealth() {
  const [summary, setSummary] = useState<SystemHealthSummary | null>(null);
  const [devices, setDevices] = useState<DeviceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, devicesData] = await Promise.all([
        getSystemHealthSummary().catch(err => {
          console.error("Summary API failed:", err);
          return null;
        }),
        listDeviceHealth({ limit: 100 }).catch(err => {
          console.error("Device list API failed:", err);
          return [];
        }),
      ]);
      
      if (!summaryData && devicesData.length === 0) {
        throw new Error("Could not reach System Health services");
      }
      
      setSummary(summaryData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to load system health data', error);
      toast.error('Service Offline', {
        description: error instanceof Error ? error.message : 'The monitoring service is currently unreachable.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    if (runningDiagnostics) return;
    try {
      setRunningDiagnostics(true);
      const report = await runDiagnostics({ scope: 'full' });
      toast.success('Diagnostics completed', {
        description: `Passed: ${report.summary?.passed}, Failed: ${report.summary?.failed}, Warnings: ${report.summary?.warnings}`,
      });
      await loadData(); // Refresh to see updated health statuses
    } catch (error) {
      console.error('Failed to run diagnostics', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setRunningDiagnostics(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Automatic polling disabled - use manual refresh button instead
  // Real-time polling for system health (every 30 seconds)
  // useEffect(() => {
  //   let interval: NodeJS.Timeout | null = null;
  //   
  //   const startPolling = () => {
  //     if (interval) clearInterval(interval);
  //     interval = setInterval(() => {
  //       if (!document.hidden) {
  //         loadData();
  //       }
  //     }, 30000); // Poll every 30 seconds for real-time monitoring
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       if (interval) {
  //         clearInterval(interval);
  //         interval = null;
  //       }
  //     } else {
  //       startPolling();
  //       loadData();
  //     }
  //   };

  //   startPolling();
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     if (interval) clearInterval(interval);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      Healthy: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
      Attention: 'bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]',
      Critical: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
      Offline: 'bg-[#F3F4F6] text-[#1F2937] border-[#E5E7EB]',
    };
    return styles[status as keyof typeof styles] || styles.Healthy;
  };

  const getSignalBadge = (signal: string) => {
    const styles = {
      Strong: 'text-[#16A34A]',
      Moderate: 'text-yellow-600',
      Weak: 'text-orange-600',
      None: 'text-[#EF4444]',
    };
    return styles[signal as keyof typeof styles] || styles.Strong;
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="System Health"
        subtitle="Real-time platform monitoring and diagnostics"
        actions={
          <div className="flex gap-2">
            <Button
              onClick={handleRunDiagnostics}
              disabled={runningDiagnostics}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white"
            >
              <Activity size={16} className={`mr-2 ${runningDiagnostics ? "animate-pulse" : ""}`} />
              {runningDiagnostics ? 'Running...' : 'Run Full Diagnostics'}
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[#757575] text-sm font-medium">System Uptime</p>
            <h3 className="text-2xl font-bold text-[#212121]">
              {loading ? '...' : `${summary?.systemUptime?.toFixed(2) || 0}%`}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-[#757575] text-sm font-medium">Active Devices</p>
            <h3 className="text-2xl font-bold text-[#212121]">
              {loading ? '...' : `${summary?.activeDevices || 0} / ${summary?.totalDevices || 0}`}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            <Signal size={24} />
          </div>
          <div>
            <p className="text-[#757575] text-sm font-medium">Connectivity Issues</p>
            <h3 className="text-2xl font-bold text-[#212121]">
              {loading ? '...' : summary?.connectivityIssues || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Device Health Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
          <h3 className="font-bold text-[#212121]">Device Health Logs</h3>
          <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">Device ID</th>
                <th className="px-6 py-3">Rider</th>
                <th className="px-6 py-3">App Version</th>
                <th className="px-6 py-3">Battery</th>
                <th className="px-6 py-3">Signal</th>
                <th className="px-6 py-3">Last Sync</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No devices found
                  </td>
                </tr>
              ) : (
                devices.map((device) => (
                  <tr key={device.deviceId} className="hover:bg-[#FAFAFA]">
                    <td className="px-6 py-4 font-mono text-[#616161]">{device.deviceId}</td>
                    <td className="px-6 py-4 font-medium text-[#212121]">{device.riderName}</td>
                    <td className="px-6 py-4 text-[#616161]">
                      {device.appVersion}
                      {!device.isLatestVersion && (
                        <span className="text-xs text-red-500 ml-1">(Old)</span>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        device.batteryLevel < 20
                          ? 'text-red-600'
                          : device.batteryLevel < 50
                          ? 'text-yellow-600'
                          : 'text-[#16A34A]'
                      }`}
                    >
                      {device.batteryLevel}%
                    </td>
                    <td className={`px-6 py-4 font-bold ${getSignalBadge(device.signalStrength)}`}>
                      {device.signalStrength}
                    </td>
                    <td className="px-6 py-4 text-[#616161]">
                      {new Date(device.lastSync).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                          device.status
                        )}`}
                      >
                        <div className={`w-1 h-1 rounded-full ${
                          device.status === 'Healthy' ? 'bg-[#166534]' :
                          device.status === 'Attention' ? 'bg-[#854D0E]' :
                          device.status === 'Critical' ? 'bg-[#991B1B]' :
                          'bg-[#1F2937]'
                        }`} />
                        {device.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
