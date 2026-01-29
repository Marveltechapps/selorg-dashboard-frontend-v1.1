import React, { useState } from 'react';
import { Play, AlertTriangle, CheckCircle2, Clock, PauseCircle, Package, Download, X, StopCircle } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

function MetricCard({ label, value, subValue, trend, trendUp, icon, color = "blue" }: MetricCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[#757575] font-medium text-xs uppercase tracking-wider">{label}</span>
        {icon && <div className={`text-${color}-500 p-1.5 bg-${color}-50 rounded-lg`}>{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#212121]">{value}</span>
        {subValue && <span className="text-sm text-[#757575] mb-1">{subValue}</span>}
      </div>
      {trend && (
        <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          <span>{trendUp ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

interface ProductionLine {
  id: string;
  name: string;
  currentJob?: string;
  status: 'running' | 'changeover' | 'idle' | 'maintenance';
  output: number;
  target: number;
  efficiency: number;
}

export function ProductionOverview() {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState<ProductionLine | null>(null);
  const [lines, setLines] = useState<ProductionLine[]>([
    { id: '1', name: 'Line A (Assembly)', currentJob: 'Job #4421 - Organic Oats', status: 'running', output: 4200, target: 5000, efficiency: 96 },
    { id: '2', name: 'Line B (Packaging)', currentJob: 'Job #4420 - Almond Milk', status: 'running', output: 3150, target: 3200, efficiency: 98 },
    { id: '3', name: 'Line C (Bottling)', status: 'changeover', output: 0, target: 4000, efficiency: 0 },
    { id: '4', name: 'Line D (Processing)', currentJob: 'Job #4419 - Protein Bars', status: 'running', output: 2800, target: 3500, efficiency: 88 },
  ]);

  const [newBatch, setNewBatch] = useState({
    line: '',
    product: '',
    target: '',
  });

  const startBatch = () => {
    if (newBatch.line && newBatch.product && newBatch.target) {
      const batchNumber = Math.floor(Math.random() * 10000);
      setLines(lines.map(line => 
        line.id === newBatch.line 
          ? { ...line, currentJob: `Job #${batchNumber} - ${newBatch.product}`, status: 'running' as const, target: parseInt(newBatch.target), output: 0 }
          : line
      ));
      setNewBatch({ line: '', product: '', target: '' });
      setShowBatchModal(false);
    }
  };

  const pauseLine = (id: string) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, status: 'idle' as const } : line
    ));
  };

  const resumeLine = (id: string) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, status: 'running' as const } : line
    ));
  };

  const stopLine = (id: string) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, status: 'idle' as const, currentJob: undefined, output: 0 } : line
    ));
  };

  const exportReport = () => {
    const today = new Date().toISOString().split('T')[0];
    const totalOutput = lines.reduce((sum, line) => sum + line.output, 0);
    const totalTarget = lines.reduce((sum, line) => sum + line.target, 0);
    const avgEfficiency = Math.round(lines.reduce((sum, line) => sum + line.efficiency, 0) / lines.length);

    const csvData = [
      ['Production Overview Report', `Date: ${today}`],
      [''],
      ['Summary Metrics'],
      ['Total Daily Output', totalOutput.toString()],
      ['Total Target', totalTarget.toString()],
      ['Average Efficiency', `${avgEfficiency}%`],
      ['Active Lines', lines.filter(l => l.status === 'running').length.toString()],
      [''],
      ['Production Lines'],
      ['Line Name', 'Current Job', 'Status', 'Output', 'Target', 'Efficiency %'],
      ...lines.map(l => [
        l.name,
        l.currentJob || '--',
        l.status,
        l.output.toString(),
        l.target.toString(),
        l.efficiency.toString()
      ]),
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-overview-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalOutput = lines.reduce((sum, line) => sum + line.output, 0);
  const totalTarget = lines.reduce((sum, line) => sum + line.target, 0);
  const avgEfficiency = lines.length > 0 ? Math.round(lines.reduce((sum, line) => sum + line.efficiency, 0) / lines.length) : 0;
  const activeDowntime = lines.filter(l => l.status !== 'running').length * 15;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Overview"
        subtitle="Live monitoring of assembly lines and output"
        actions={
          <>
            <button 
              onClick={exportReport}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
            <button 
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] transition-transform active:scale-95"
            >
              Start New Batch
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Daily Output" 
          value={totalOutput.toLocaleString()} 
          subValue={`/ ${totalTarget.toLocaleString()}`}
          trend="8.5% vs yesterday"
          trendUp={true}
          icon={<Package size={18} />}
          color="blue"
        />
        <MetricCard 
          label="Line Utilization" 
          value={`${avgEfficiency}%`}
          trend="Above target"
          trendUp={true}
          icon={<ActivityIcon />}
          color="green"
        />
        <MetricCard 
          label="Defect Rate" 
          value="0.4%" 
          trend="Within limits"
          trendUp={true}
          icon={<AlertTriangle size={18} />}
          color="yellow"
        />
        <MetricCard 
          label="Active Downtime" 
          value={`${activeDowntime}m`}
          trend={`${lines.filter(l => l.status !== 'running').length} lines affected`}
          trendUp={false}
          icon={<Clock size={18} />}
          color="red"
        />
      </div>

      {/* Production Lines Status */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
          <h3 className="font-bold text-[#212121]">Active Production Lines</h3>
          <span className="text-xs font-medium px-2 py-1 bg-[#F0FDF4] text-[#16A34A] rounded-full border border-[#16A34A]/20">
            {lines.filter(l => l.status === 'running').length} / {lines.length} Running
          </span>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">Line Name</th>
                <th className="px-6 py-3">Current Job</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Output / Target</th>
                <th className="px-6 py-3">Efficiency</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {lines.map(line => (
                <tr key={line.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4 font-medium text-[#212121]">{line.name}</td>
                  <td className="px-6 py-4 text-[#616161]">{line.currentJob || '--'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      line.status === 'running' ? 'bg-[#DCFCE7] text-[#166534]' :
                      line.status === 'changeover' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                      line.status === 'maintenance' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                      'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {line.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-[#166534] animate-pulse"></span>}
                      {line.status.charAt(0).toUpperCase() + line.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#212121]">{line.output.toLocaleString()} / {line.target.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold">
                    <span className={line.efficiency >= 90 ? 'text-[#16A34A]' : line.efficiency >= 70 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}>
                      {line.efficiency > 0 ? `${line.efficiency}%` : '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setShowManageModal(line)}
                      className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Start New Production Batch</h3>
              <button onClick={() => setShowBatchModal(false)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Production Line</label>
                <select 
                  value={newBatch.line}
                  onChange={(e) => setNewBatch({...newBatch, line: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="">Select line</option>
                  {lines.filter(l => l.status !== 'running').map(line => (
                    <option key={line.id} value={line.id}>{line.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Product</label>
                <input 
                  type="text"
                  placeholder="e.g., Organic Oats"
                  value={newBatch.product}
                  onChange={(e) => setNewBatch({...newBatch, product: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Target Quantity</label>
                <input 
                  type="number"
                  placeholder="5000"
                  value={newBatch.target}
                  onChange={(e) => setNewBatch({...newBatch, target: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex gap-3 justify-end">
              <button 
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button 
                onClick={startBatch}
                className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D]"
              >
                Start Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Line Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Manage {showManageModal.name}</h3>
              <button onClick={() => setShowManageModal(null)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#757575]">Status</span>
                    <p className="font-bold text-[#212121] capitalize">{showManageModal.status}</p>
                  </div>
                  <div>
                    <span className="text-[#757575]">Efficiency</span>
                    <p className="font-bold text-[#212121]">{showManageModal.efficiency}%</p>
                  </div>
                  <div>
                    <span className="text-[#757575]">Output</span>
                    <p className="font-bold text-[#212121]">{showManageModal.output.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[#757575]">Target</span>
                    <p className="font-bold text-[#212121]">{showManageModal.target.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {showManageModal.currentJob && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <span className="text-xs text-blue-900 font-medium">Current Job</span>
                  <p className="font-bold text-blue-900">{showManageModal.currentJob}</p>
                </div>
              )}
              <div className="flex gap-3">
                {showManageModal.status === 'running' && (
                  <>
                    <button 
                      onClick={() => {
                        pauseLine(showManageModal.id);
                        setShowManageModal(null);
                      }}
                      className="flex-1 px-4 py-2 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-[#D97706] flex items-center justify-center gap-2"
                    >
                      <PauseCircle size={16} />
                      Pause
                    </button>
                    <button 
                      onClick={() => {
                        stopLine(showManageModal.id);
                        setShowManageModal(null);
                      }}
                      className="flex-1 px-4 py-2 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] flex items-center justify-center gap-2"
                    >
                      <StopCircle size={16} />
                      Stop
                    </button>
                  </>
                )}
                {showManageModal.status === 'idle' && (
                  <button 
                    onClick={() => {
                      resumeLine(showManageModal.id);
                      setShowManageModal(null);
                    }}
                    className="flex-1 px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}