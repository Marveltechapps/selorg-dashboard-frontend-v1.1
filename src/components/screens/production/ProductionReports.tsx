import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Package,
  Users
} from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner@2.0.3';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportType = 'kpi' | 'material' | 'quality' | 'workforce' | 'maintenance' | 'overview' | null;

interface DateRange {
  start: string;
  end: string;
}

export function ProductionReports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-12-15',
    end: '2024-12-22',
  });
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Production KPI Data
  const productionData = [
    { date: 'Dec 15', output: 2400, target: 2600, efficiency: 92 },
    { date: 'Dec 16', output: 2600, target: 2600, efficiency: 100 },
    { date: 'Dec 17', output: 2380, target: 2600, efficiency: 91 },
    { date: 'Dec 18', output: 2700, target: 2600, efficiency: 104 },
    { date: 'Dec 19', output: 2550, target: 2600, efficiency: 98 },
    { date: 'Dec 20', output: 2420, target: 2600, efficiency: 93 },
    { date: 'Dec 21', output: 2680, target: 2600, efficiency: 103 },
    { date: 'Dec 22', output: 2590, target: 2600, efficiency: 99 },
  ];

  const lineUtilizationData = [
    { name: 'Line A', utilization: 95, downtime: 5 },
    { name: 'Line B', utilization: 88, downtime: 12 },
    { name: 'Line C', utilization: 92, downtime: 8 },
    { name: 'Line D', utilization: 78, downtime: 22 },
  ];

  // Material Consumption Data
  const materialData = [
    { material: 'Organic Oats', allocated: 1500, consumed: 1380, waste: 120 },
    { material: 'Sugar', allocated: 800, consumed: 750, waste: 50 },
    { material: 'Packaging Film', allocated: 500, consumed: 485, waste: 15 },
    { material: 'Protein Powder', allocated: 600, consumed: 580, waste: 20 },
    { material: 'Almond Extract', allocated: 300, consumed: 290, waste: 10 },
  ];

  const wasteData = [
    { name: 'Organic Oats', value: 120 },
    { name: 'Sugar', value: 50 },
    { name: 'Packaging Film', value: 15 },
    { name: 'Protein Powder', value: 20 },
    { name: 'Almond Extract', value: 10 },
  ];

  // Quality Data
  const qualityData = [
    { date: 'Dec 15', passRate: 98.5, defects: 36 },
    { date: 'Dec 16', passRate: 99.2, defects: 21 },
    { date: 'Dec 17', passRate: 97.8, defects: 52 },
    { date: 'Dec 18', passRate: 99.5, defects: 14 },
    { date: 'Dec 19', passRate: 98.9, defects: 28 },
    { date: 'Dec 20', passRate: 99.1, defects: 22 },
    { date: 'Dec 21', passRate: 99.6, defects: 11 },
    { date: 'Dec 22', passRate: 98.7, defects: 34 },
  ];

  const defectTypeData = [
    { name: 'Weight Issue', value: 89 },
    { name: 'Visual Defect', value: 62 },
    { name: 'Seal Integrity', value: 31 },
    { name: 'Contamination', value: 18 },
    { name: 'Other', value: 18 },
  ];

  // Workforce Data
  const workforceData = [
    { shift: 'Morning', productivity: 94, attendance: 96 },
    { shift: 'Afternoon', productivity: 89, attendance: 92 },
    { shift: 'Night', productivity: 86, attendance: 88 },
  ];

  // Maintenance Data
  const maintenanceData = [
    { month: 'Week 1', preventive: 8, corrective: 3, breakdown: 1 },
    { month: 'Week 2', preventive: 10, corrective: 5, breakdown: 2 },
    { month: 'Week 3', preventive: 9, corrective: 4, breakdown: 1 },
    { month: 'Week 4', preventive: 11, corrective: 2, breakdown: 0 },
  ];

  const COLORS = ['#16A34A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  const exportReport = () => {
    const today = new Date().toISOString().split('T')[0];
    let csvData: any[] = [];

    if (selectedReport === 'kpi') {
      csvData = [
        ['Production KPI Report', `Period: ${dateRange.start} to ${dateRange.end}`],
        [''],
        ['Date', 'Output (units)', 'Target (units)', 'Efficiency %'],
        ...productionData.map(d => [d.date, d.output, d.target, d.efficiency]),
      ];
    } else if (selectedReport === 'material') {
      csvData = [
        ['Material Consumption Report', `Period: ${dateRange.start} to ${dateRange.end}`],
        [''],
        ['Material', 'Allocated (kg)', 'Consumed (kg)', 'Waste (kg)', 'Efficiency %'],
        ...materialData.map(m => [
          m.material,
          m.allocated,
          m.consumed,
          m.waste,
          ((m.consumed / m.allocated) * 100).toFixed(1)
        ]),
      ];
    } else if (selectedReport === 'quality') {
      csvData = [
        ['Quality Audit Report', `Period: ${dateRange.start} to ${dateRange.end}`],
        [''],
        ['Date', 'Pass Rate %', 'Total Defects'],
        ...qualityData.map(q => [q.date, q.passRate, q.defects]),
      ];
    } else if (selectedReport === 'workforce') {
      csvData = [
        ['Workforce Performance Report', `Period: ${dateRange.start} to ${dateRange.end}`],
        [''],
        ['Shift', 'Productivity %', 'Attendance %'],
        ...workforceData.map(w => [w.shift, w.productivity, w.attendance]),
      ];
    }
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-${selectedReport}-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportAllReports = () => {
    const today = new Date().toISOString().split('T')[0];
    const csvData = [
      ['Comprehensive Production Report', `Period: ${dateRange.start} to ${dateRange.end}`],
      [''],
      ['=== PRODUCTION KPIs ==='],
      ['Date', 'Output', 'Target', 'Efficiency %'],
      ...productionData.map(d => [d.date, d.output, d.target, d.efficiency]),
      [''],
      ['=== MATERIAL CONSUMPTION ==='],
      ['Material', 'Allocated', 'Consumed', 'Waste'],
      ...materialData.map(m => [m.material, m.allocated, m.consumed, m.waste]),
      [''],
      ['=== QUALITY METRICS ==='],
      ['Date', 'Pass Rate %', 'Defects'],
      ...qualityData.map(q => [q.date, q.passRate, q.defects]),
      [''],
      ['=== WORKFORCE PERFORMANCE ==='],
      ['Shift', 'Productivity %', 'Attendance %'],
      ...workforceData.map(w => [w.shift, w.productivity, w.attendance]),
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-comprehensive-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalOutput = productionData.reduce((sum, d) => sum + d.output, 0);
  const avgEfficiency = (productionData.reduce((sum, d) => sum + d.efficiency, 0) / productionData.length).toFixed(1);
  const totalDefects = qualityData.reduce((sum, q) => sum + q.defects, 0);
  const avgPassRate = (qualityData.reduce((sum, q) => sum + q.passRate, 0) / qualityData.length).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Reports"
        subtitle="Analytics and performance dashboards"
        actions={
          <>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <button 
              onClick={exportAllReports}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
            >
              <Download size={16} />
              Export All
            </button>
          </>
        }
      />

      {/* Date Range Filter Modal */}
      {showDateFilter && (
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-[#757575] mb-1">Start Date</label>
              <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#757575] mb-1">End Date</label>
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>
            <button 
              onClick={() => setShowDateFilter(false)}
              className="mt-5 px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => setSelectedReport('overview')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'overview' ? 'border-[#16A34A] ring-2 ring-[#16A34A]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Overview Dashboard</h3>
          <p className="text-sm text-[#757575] mb-4">Comprehensive view of all metrics.</p>
          <span className="text-xs font-bold text-green-600 flex items-center gap-1">View Report →</span>
        </div>

        <div 
          onClick={() => setSelectedReport('kpi')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'kpi' ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Production KPIs</h3>
          <p className="text-sm text-[#757575] mb-4">Daily output, line utilization, downtime analysis.</p>
          <span className="text-xs font-bold text-blue-600 flex items-center gap-1">View Report →</span>
        </div>

        <div 
          onClick={() => setSelectedReport('material')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'material' ? 'border-[#16A34A] ring-2 ring-[#16A34A]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Material Consumption</h3>
          <p className="text-sm text-[#757575] mb-4">Usage vs allocation, waste reports, inventory trends.</p>
          <span className="text-xs font-bold text-green-600 flex items-center gap-1">View Report →</span>
        </div>

        <div 
          onClick={() => setSelectedReport('quality')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'quality' ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
            <BarChart3 size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Quality Audit</h3>
          <p className="text-sm text-[#757575] mb-4">Defect rates, rejection logs, compliance scores.</p>
          <span className="text-xs font-bold text-purple-600 flex items-center gap-1">View Report →</span>
        </div>

        <div 
          onClick={() => setSelectedReport('workforce')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'workforce' ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Workforce Performance</h3>
          <p className="text-sm text-[#757575] mb-4">Productivity, attendance, shift analysis.</p>
          <span className="text-xs font-bold text-orange-600 flex items-center gap-1">View Report →</span>
        </div>

        <div 
          onClick={() => setSelectedReport('maintenance')}
          className={`bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
            selectedReport === 'maintenance' ? 'border-[#EF4444] ring-2 ring-[#EF4444]' : 'border-[#E0E0E0]'
          }`}
        >
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-bold text-[#212121] mb-2">Maintenance Analytics</h3>
          <p className="text-sm text-[#757575] mb-4">Equipment uptime, maintenance trends, costs.</p>
          <span className="text-xs font-bold text-red-600 flex items-center gap-1">View Report →</span>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        {/* Overview Dashboard */}
        {selectedReport === 'overview' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Overview Dashboard</h2>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Output</p>
                <p className="text-2xl font-bold text-blue-900">{totalOutput.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">units produced</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Avg Efficiency</p>
                <p className="text-2xl font-bold text-green-900">{avgEfficiency}%</p>
                <p className="text-xs text-green-600 mt-1">this period</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Quality Pass Rate</p>
                <p className="text-2xl font-bold text-purple-900">{avgPassRate}%</p>
                <p className="text-xs text-purple-600 mt-1">average</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs text-red-600 font-bold uppercase mb-1">Total Defects</p>
                <p className="text-2xl font-bold text-red-900">{totalDefects}</p>
                <p className="text-xs text-red-600 mt-1">this period</p>
              </div>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#212121] mb-4">Production Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="output" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#9CA3AF" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="font-bold text-[#212121] mb-4">Line Utilization</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={lineUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="utilization" fill="#16A34A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Production KPIs */}
        {selectedReport === 'kpi' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Production KPIs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">Total Output</p>
                <p className="text-2xl font-bold text-blue-900">{totalOutput.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">units</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Avg Efficiency</p>
                <p className="text-2xl font-bold text-green-900">{avgEfficiency}%</p>
                <p className="text-xs text-green-600 mt-1">target achievement</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-bold uppercase mb-1">Avg Downtime</p>
                <p className="text-2xl font-bold text-orange-900">11.75%</p>
                <p className="text-xs text-orange-600 mt-1">across lines</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#212121] mb-4">Daily Production vs Target</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="output" fill="#3B82F6" name="Actual Output" />
                  <Bar dataKey="target" fill="#9CA3AF" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="font-bold text-[#212121] mb-4">Line Utilization & Downtime</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lineUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#16A34A" name="Utilization %" />
                  <Bar dataKey="downtime" fill="#EF4444" name="Downtime %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Material Consumption */}
        {selectedReport === 'material' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Material Consumption Report</h2>
            
            <div>
              <h3 className="font-bold text-[#212121] mb-4">Material Usage vs Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={materialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="allocated" fill="#9CA3AF" name="Allocated (kg)" />
                  <Bar dataKey="consumed" fill="#16A34A" name="Consumed (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#212121] mb-4">Waste by Material</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={wasteData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}kg`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {wasteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-bold text-[#212121] mb-4">Material Efficiency</h3>
                <div className="space-y-3">
                  {materialData.map((material, index) => {
                    const efficiency = ((material.consumed / material.allocated) * 100).toFixed(1);
                    return (
                      <div key={index} className="border border-[#E0E0E0] rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#212121]">{material.material}</span>
                          <span className="text-sm font-bold text-[#16A34A]">{efficiency}%</span>
                        </div>
                        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                          <div 
                            className="bg-[#16A34A] h-2 rounded-full"
                            style={{ width: `${efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Audit */}
        {selectedReport === 'quality' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Quality Audit Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600 font-bold uppercase mb-1">Avg Pass Rate</p>
                <p className="text-2xl font-bold text-purple-900">{avgPassRate}%</p>
                <p className="text-xs text-purple-600 mt-1">this period</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs text-red-600 font-bold uppercase mb-1">Total Defects</p>
                <p className="text-2xl font-bold text-red-900">{totalDefects}</p>
                <p className="text-xs text-red-600 mt-1">units rejected</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Compliance</p>
                <p className="text-2xl font-bold text-green-900">98.9%</p>
                <p className="text-xs text-green-600 mt-1">standards met</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#212121] mb-4">Quality Pass Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[95, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="passRate" stroke="#8B5CF6" strokeWidth={2} name="Pass Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#212121] mb-4">Defects by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={defectTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {defectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="font-bold text-[#212121] mb-4">Daily Defects</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="defects" fill="#EF4444" name="Defects" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Workforce Performance */}
        {selectedReport === 'workforce' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Workforce Performance Report</h2>
            
            <div>
              <h3 className="font-bold text-[#212121] mb-4">Productivity & Attendance by Shift</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workforceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shift" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="productivity" fill="#16A34A" name="Productivity %" />
                  <Bar dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workforceData.map((shift, index) => (
                <div key={index} className="border border-[#E0E0E0] rounded-lg p-4">
                  <h4 className="font-bold text-[#212121] mb-3">{shift.shift} Shift</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#757575]">Productivity</span>
                        <span className="font-bold text-[#16A34A]">{shift.productivity}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className="bg-[#16A34A] h-2 rounded-full"
                          style={{ width: `${shift.productivity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#757575]">Attendance</span>
                        <span className="font-bold text-[#3B82F6]">{shift.attendance}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className="bg-[#3B82F6] h-2 rounded-full"
                          style={{ width: `${shift.attendance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Analytics */}
        {selectedReport === 'maintenance' && (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-[#212121]">Maintenance Analytics</h2>
            
            <div>
              <h3 className="font-bold text-[#212121] mb-4">Maintenance Activities Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="preventive" fill="#16A34A" name="Preventive" stackId="a" />
                  <Bar dataKey="corrective" fill="#F59E0B" name="Corrective" stackId="a" />
                  <Bar dataKey="breakdown" fill="#EF4444" name="Breakdown" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 font-bold uppercase mb-1">Preventive</p>
                <p className="text-2xl font-bold text-green-900">38</p>
                <p className="text-xs text-green-600 mt-1">tasks completed</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-bold uppercase mb-1">Corrective</p>
                <p className="text-2xl font-bold text-orange-900">14</p>
                <p className="text-xs text-orange-600 mt-1">tasks completed</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs text-red-600 font-bold uppercase mb-1">Breakdown</p>
                <p className="text-2xl font-bold text-red-900">4</p>
                <p className="text-xs text-red-600 mt-1">emergency repairs</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}