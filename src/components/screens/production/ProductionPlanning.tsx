import React, { useState } from 'react';
import { Calendar, Layers, Clock, Download, X, Plus } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';

interface ProductionPlan {
  id: string;
  product: string;
  line: string;
  startDate: string;
  endDate: string;
  quantity: number;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export function ProductionPlanning() {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState<ProductionPlan[]>([
    { id: '1', product: 'Organic Oats', line: 'Line A', startDate: '2024-12-23', endDate: '2024-12-24', quantity: 5000, status: 'in-progress' },
    { id: '2', product: 'Almond Milk', line: 'Line B', startDate: '2024-12-24', endDate: '2024-12-25', quantity: 3200, status: 'scheduled' },
    { id: '3', product: 'Protein Bars', line: 'Line D', startDate: '2024-12-23', endDate: '2024-12-23', quantity: 3500, status: 'in-progress' },
  ]);

  const [newPlan, setNewPlan] = useState({
    product: '',
    line: '',
    startDate: '',
    endDate: '',
    quantity: '',
  });

  const createPlan = () => {
    if (newPlan.product && newPlan.line && newPlan.startDate && newPlan.quantity) {
      const plan: ProductionPlan = {
        id: Date.now().toString(),
        product: newPlan.product,
        line: newPlan.line,
        startDate: newPlan.startDate,
        endDate: newPlan.endDate || newPlan.startDate,
        quantity: parseInt(newPlan.quantity),
        status: 'scheduled',
      };
      setPlans([...plans, plan]);
      setNewPlan({ product: '', line: '', startDate: '', endDate: '', quantity: '' });
      setShowPlanModal(false);
      toast.success('Production plan created successfully!');
    }
  };

  const exportSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    const csvData = [
      ['Production Planning Schedule', `Date: ${today}`],
      [''],
      ['Product', 'Line', 'Start Date', 'End Date', 'Quantity', 'Status'],
      ...plans.map(p => [p.product, p.line, p.startDate, p.endDate, p.quantity.toString(), p.status]),
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-schedule-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Planning"
        subtitle="Demand forecasting and capacity planning"
        actions={
          <>
            <button 
              onClick={exportSchedule}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <Download size={16} />
              Export Schedule
            </button>
            <button 
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
            >
              <Plus size={16} />
              Create Plan
            </button>
          </>
        }
      />

      {/* Schedule Table */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
          <h3 className="font-bold text-[#212121]">Production Schedule</h3>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Line</th>
              <th className="px-6 py-3">Start Date</th>
              <th className="px-6 py-3">End Date</th>
              <th className="px-6 py-3">Quantity</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E0E0]">
            {plans.map(plan => (
              <tr key={plan.id} className="hover:bg-[#FAFAFA]">
                <td className="px-6 py-4 font-medium text-[#212121]">{plan.product}</td>
                <td className="px-6 py-4 text-[#616161]">{plan.line}</td>
                <td className="px-6 py-4 text-[#616161]">{plan.startDate}</td>
                <td className="px-6 py-4 text-[#616161]">{plan.endDate}</td>
                <td className="px-6 py-4 text-[#212121]">{plan.quantity.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.status === 'completed' ? 'bg-[#DCFCE7] text-[#166534]' :
                    plan.status === 'in-progress' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                    'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {plan.status === 'in-progress' ? 'In Progress' : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 shadow-sm">
          <h3 className="font-bold text-[#212121] mb-4 flex items-center gap-2">
            <Layers size={18} /> Capacity Utilization
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Assembly Line A</span>
                <span className="font-bold">85%</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Packaging Line B</span>
                <span className="font-bold text-yellow-600">92% (High Load)</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#EAB308] h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Bottling Line C</span>
                <span className="font-bold">40%</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Processing Line D</span>
                <span className="font-bold">78%</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <div className="bg-[#16A34A] h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E0E0E0] p-6 shadow-sm">
          <h3 className="font-bold text-[#212121] mb-4 flex items-center gap-2">
            <Clock size={18} /> Lead Times
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-sm font-medium">Organic Oats</span>
              <span className="text-sm font-bold text-[#16A34A]">2.5 hours</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-sm font-medium">Almond Milk</span>
              <span className="text-sm font-bold text-[#16A34A]">3.2 hours</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-sm font-medium">Protein Bars</span>
              <span className="text-sm font-bold text-[#F59E0B]">4.1 hours</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#F5F5F5] rounded-lg">
              <span className="text-sm font-medium">Cold Brew Coffee</span>
              <span className="text-sm font-bold text-[#16A34A]">1.8 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Create Production Plan</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Product</label>
                <input 
                  type="text"
                  placeholder="e.g., Organic Oats"
                  value={newPlan.product}
                  onChange={(e) => setNewPlan({...newPlan, product: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Production Line</label>
                <select 
                  value={newPlan.line}
                  onChange={(e) => setNewPlan({...newPlan, line: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="">Select line</option>
                  <option>Line A (Assembly)</option>
                  <option>Line B (Packaging)</option>
                  <option>Line C (Bottling)</option>
                  <option>Line D (Processing)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Start Date</label>
                  <input 
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) => setNewPlan({...newPlan, startDate: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">End Date</label>
                  <input 
                    type="date"
                    value={newPlan.endDate}
                    onChange={(e) => setNewPlan({...newPlan, endDate: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Quantity</label>
                <input 
                  type="number"
                  placeholder="5000"
                  value={newPlan.quantity}
                  onChange={(e) => setNewPlan({...newPlan, quantity: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex gap-3 justify-end">
              <button 
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button 
                onClick={createPlan}
                className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D]"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}