import React, { useState } from 'react';
import { Users, UserPlus, Clock, Download, X, Search, Calendar } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  department: 'operators' | 'qc' | 'supervisors' | 'maintenance';
  assignedLine?: string;
  status: 'active' | 'on-break' | 'absent' | 'off-duty';
  shift: 'morning' | 'afternoon' | 'night';
  shiftTime: string;
  productivity?: number;
  attendance?: number;
  phoneNumber?: string;
}

interface Shift {
  id: string;
  name: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  assignedEmployees: number;
  requiredEmployees: number;
  date: string;
  department: string;
}

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'on-leave';
  hoursWorked?: number;
}

export function ProductionStaff() {
  const [activeTab, setActiveTab] = useState<'operators' | 'qc' | 'supervisors'>('operators');
  const [subTab, setSubTab] = useState<'roster' | 'shifts' | 'attendance'>('roster');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Michael Chen', employeeId: 'EMP-001', role: 'Lead Operator', department: 'operators', assignedLine: 'Line A', status: 'active', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 96, attendance: 98 },
    { id: '2', name: 'Sarah Johnson', employeeId: 'EMP-002', role: 'Junior Operator', department: 'operators', assignedLine: 'Line A', status: 'active', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 92, attendance: 95 },
    { id: '3', name: 'David Rodriguez', employeeId: 'EMP-003', role: 'Senior Operator', department: 'operators', assignedLine: 'Line B', status: 'on-break', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 94, attendance: 97 },
    { id: '4', name: 'Emma Wilson', employeeId: 'EMP-004', role: 'Operator', department: 'operators', assignedLine: 'Line C', status: 'absent', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 88, attendance: 85 },
    { id: '5', name: 'James Martinez', employeeId: 'EMP-011', role: 'QC Inspector', department: 'qc', status: 'active', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 95, attendance: 99 },
    { id: '6', name: 'Lisa Anderson', employeeId: 'EMP-012', role: 'QC Lead', department: 'qc', status: 'active', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 97, attendance: 100 },
    { id: '7', name: 'Robert Taylor', employeeId: 'EMP-021', role: 'Production Supervisor', department: 'supervisors', assignedLine: 'Line A-B', status: 'active', shift: 'morning', shiftTime: '6:00 AM - 2:00 PM', productivity: 93, attendance: 96 },
    { id: '8', name: 'Jennifer Lee', employeeId: 'EMP-022', role: 'Shift Supervisor', department: 'supervisors', assignedLine: 'All Lines', status: 'active', shift: 'afternoon', shiftTime: '2:00 PM - 10:00 PM', productivity: 91, attendance: 94 },
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', name: 'Morning Shift', timeRange: '6:00 AM - 2:00 PM', startTime: '06:00', endTime: '14:00', assignedEmployees: 24, requiredEmployees: 26, date: '2024-12-22', department: 'All' },
    { id: '2', name: 'Afternoon Shift', timeRange: '2:00 PM - 10:00 PM', startTime: '14:00', endTime: '22:00', assignedEmployees: 18, requiredEmployees: 20, date: '2024-12-22', department: 'All' },
    { id: '3', name: 'Night Shift', timeRange: '10:00 PM - 6:00 AM', startTime: '22:00', endTime: '06:00', assignedEmployees: 12, requiredEmployees: 15, date: '2024-12-22', department: 'All' },
    { id: '4', name: 'Morning Shift', timeRange: '6:00 AM - 2:00 PM', startTime: '06:00', endTime: '14:00', assignedEmployees: 0, requiredEmployees: 26, date: '2024-12-23', department: 'All' },
  ]);

  const [attendance, setAttendance] = useState<Attendance[]>([
    { id: '1', employeeId: 'EMP-001', employeeName: 'Michael Chen', date: '2024-12-22', checkIn: '05:55 AM', checkOut: '02:05 PM', status: 'present', hoursWorked: 8.2 },
    { id: '2', employeeId: 'EMP-002', employeeName: 'Sarah Johnson', date: '2024-12-22', checkIn: '06:10 AM', status: 'present', hoursWorked: 0 },
    { id: '3', employeeId: 'EMP-003', employeeName: 'David Rodriguez', date: '2024-12-22', checkIn: '06:20 AM', status: 'late', hoursWorked: 0 },
    { id: '4', employeeId: 'EMP-004', employeeName: 'Emma Wilson', date: '2024-12-22', status: 'absent' },
    { id: '5', employeeId: 'EMP-011', employeeName: 'James Martinez', date: '2024-12-22', checkIn: '05:58 AM', status: 'present', hoursWorked: 0 },
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    employeeId: '',
    role: '',
    department: 'operators' as const,
    assignedLine: '',
    shift: 'morning' as const,
    phoneNumber: '',
  });

  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '',
    endTime: '',
    requiredEmployees: '',
    date: '',
    department: 'All',
  });

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.employeeId && newEmployee.role) {
      const emp: Employee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        employeeId: newEmployee.employeeId,
        role: newEmployee.role,
        department: newEmployee.department,
        assignedLine: newEmployee.assignedLine || undefined,
        status: 'off-duty',
        shift: newEmployee.shift,
        shiftTime: newEmployee.shift === 'morning' ? '6:00 AM - 2:00 PM' : newEmployee.shift === 'afternoon' ? '2:00 PM - 10:00 PM' : '10:00 PM - 6:00 AM',
        productivity: 0,
        attendance: 0,
        phoneNumber: newEmployee.phoneNumber || undefined,
      };
      setEmployees([...employees, emp]);
      setNewEmployee({ name: '', employeeId: '', role: '', department: 'operators', assignedLine: '', shift: 'morning', phoneNumber: '' });
      setShowAddModal(false);
      toast.success('Employee added successfully!');
    }
  };

  const addShift = () => {
    if (newShift.name && newShift.startTime && newShift.endTime && newShift.date) {
      const shift: Shift = {
        id: Date.now().toString(),
        name: newShift.name,
        timeRange: `${newShift.startTime} - ${newShift.endTime}`,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        assignedEmployees: 0,
        requiredEmployees: parseInt(newShift.requiredEmployees) || 0,
        date: newShift.date,
        department: newShift.department,
      };
      setShifts([...shifts, shift]);
      setNewShift({ name: '', startTime: '', endTime: '', requiredEmployees: '', date: '', department: 'All' });
      setShowAddModal(false);
      toast.success('Shift scheduled successfully!');
    }
  };

  const updateEmployeeStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(employees.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const markAttendance = (employeeId: string, status: Attendance['status']) => {
    const employee = employees.find(e => e.employeeId === employeeId);
    if (employee) {
      const existingAttendance = attendance.find(a => a.employeeId === employeeId && a.date === new Date().toISOString().split('T')[0]);
      if (existingAttendance) {
        setAttendance(attendance.map(a => 
          a.id === existingAttendance.id 
            ? { ...a, status, checkIn: status === 'present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined }
            : a
        ));
      } else {
        const newAttendance: Attendance = {
          id: Date.now().toString(),
          employeeId: employee.employeeId,
          employeeName: employee.name,
          date: new Date().toISOString().split('T')[0],
          status,
          checkIn: status === 'present' ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
        setAttendance([newAttendance, ...attendance]);
      }
      updateEmployeeStatus(employee.id, status === 'present' ? 'active' : 'absent');
    }
  };

  const exportData = () => {
    const today = new Date().toISOString().split('T')[0];
    let csvData: any[] = [];

    if (subTab === 'roster') {
      csvData = [
        ['Workforce Roster Report', `Date: ${today}`],
        [''],
        ['Employee ID', 'Name', 'Role', 'Department', 'Assigned Line', 'Status', 'Shift', 'Productivity %', 'Attendance %'],
        ...filteredEmployees.map(e => [
          e.employeeId,
          e.name,
          e.role,
          e.department,
          e.assignedLine || 'N/A',
          e.status,
          e.shiftTime,
          e.productivity?.toString() || 'N/A',
          e.attendance?.toString() || 'N/A'
        ]),
      ];
    } else if (subTab === 'shifts') {
      csvData = [
        ['Shift Schedule Report', `Date: ${today}`],
        [''],
        ['Shift Name', 'Time Range', 'Date', 'Department', 'Assigned', 'Required', 'Fill Rate %'],
        ...shifts.map(s => [
          s.name,
          s.timeRange,
          s.date,
          s.department,
          s.assignedEmployees.toString(),
          s.requiredEmployees.toString(),
          ((s.assignedEmployees / s.requiredEmployees) * 100).toFixed(1)
        ]),
      ];
    } else {
      csvData = [
        ['Attendance Report', `Date: ${today}`],
        [''],
        ['Employee ID', 'Name', 'Date', 'Check In', 'Check Out', 'Status', 'Hours Worked'],
        ...attendance.map(a => [
          a.employeeId,
          a.employeeName,
          a.date,
          a.checkIn || 'N/A',
          a.checkOut || 'N/A',
          a.status,
          a.hoursWorked?.toString() || 'N/A'
        ]),
      ];
    }
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workforce-${subTab}-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredEmployees = employees.filter(e => 
    e.department === activeTab && (
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const activeCount = employees.filter(e => e.status === 'active').length;
  const totalScheduled = employees.filter(e => e.shift === 'morning').length;
  const absentCount = employees.filter(e => e.status === 'absent').length;
  const attendanceRate = totalScheduled > 0 ? (((totalScheduled - absentCount) / totalScheduled) * 100).toFixed(0) : '0';
  const avgProductivity = employees.length > 0 
    ? (employees.reduce((sum, e) => sum + (e.productivity || 0), 0) / employees.length).toFixed(0) 
    : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Workforce"
        subtitle="Shift management and productivity tracking"
        actions={
          <>
            <button 
              onClick={exportData}
              className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5] flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add Staff
            </button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
          <h3 className="font-bold text-[#212121] mb-2">On Shift Now</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#16A34A]">{activeCount}</span>
            <span className="text-sm text-[#757575] mb-1">/ {totalScheduled} Scheduled</span>
          </div>
          <p className="text-xs text-[#757575] mt-2">{absentCount} Absent • {attendanceRate}% Attendance</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
          <h3 className="font-bold text-[#212121] mb-2">Next Shift</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#212121]">
              {shifts.find(s => s.name === 'Afternoon Shift')?.assignedEmployees || 0}
            </span>
            <span className="text-sm text-[#757575] mb-1">Operators</span>
          </div>
          <p className="text-xs text-[#757575] mt-2">Starts in 3h 15m</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
          <h3 className="font-bold text-[#212121] mb-2">Avg Productivity</h3>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#16A34A]">{avgProductivity}%</span>
            <span className="text-sm text-[#757575] mb-1">This week</span>
          </div>
          <p className="text-xs text-[#757575] mt-2">↑ 2% vs last week</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 border-b border-[#E0E0E0]">
        <button
          onClick={() => setSubTab('roster')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            subTab === 'roster'
              ? 'border-[#16A34A] text-[#16A34A]'
              : 'border-transparent text-[#757575] hover:text-[#212121]'
          }`}
        >
          Employee Roster
        </button>
        <button
          onClick={() => setSubTab('shifts')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            subTab === 'shifts'
              ? 'border-[#16A34A] text-[#16A34A]'
              : 'border-transparent text-[#757575] hover:text-[#212121]'
          }`}
        >
          Shift Planning
        </button>
        <button
          onClick={() => setSubTab('attendance')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            subTab === 'attendance'
              ? 'border-[#16A34A] text-[#16A34A]'
              : 'border-transparent text-[#757575] hover:text-[#212121]'
          }`}
        >
          Attendance
        </button>
      </div>

      {/* Employee Roster Tab */}
      {subTab === 'roster' && (
        <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 bg-[#F9FAFB] border-b border-[#E0E0E0] flex justify-between items-center">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('operators')}
                className={`text-sm font-bold ${activeTab === 'operators' ? 'text-[#212121] border-b-2 border-[#16A34A]' : 'text-[#757575] hover:text-[#212121]'} pb-1`}
              >
                Machine Operators ({employees.filter(e => e.department === 'operators').length})
              </button>
              <button 
                onClick={() => setActiveTab('qc')}
                className={`text-sm font-bold ${activeTab === 'qc' ? 'text-[#212121] border-b-2 border-[#16A34A]' : 'text-[#757575] hover:text-[#212121]'} pb-1`}
              >
                QC Staff ({employees.filter(e => e.department === 'qc').length})
              </button>
              <button 
                onClick={() => setActiveTab('supervisors')}
                className={`text-sm font-bold ${activeTab === 'supervisors' ? 'text-[#212121] border-b-2 border-[#16A34A]' : 'text-[#757575] hover:text-[#212121]'} pb-1`}
              >
                Supervisors ({employees.filter(e => e.department === 'supervisors').length})
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
              <input 
                type="text" 
                placeholder="Search employees..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg bg-white border border-[#E0E0E0] text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all w-64"
              />
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Assigned Line</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Shift</th>
                <th className="px-6 py-3">Performance</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[#212121]">{employee.name}</p>
                      <p className="text-xs text-[#757575]">{employee.employeeId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#616161]">{employee.role}</td>
                  <td className="px-6 py-4 text-[#616161]">{employee.assignedLine || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.status === 'active' ? 'bg-[#DCFCE7] text-[#166534]' :
                      employee.status === 'on-break' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                      employee.status === 'absent' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                      'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {employee.status === 'on-break' ? 'On Break' : 
                       employee.status === 'off-duty' ? 'Off Duty' :
                       employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#616161]">{employee.shiftTime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#E5E7EB] rounded-full h-2">
                        <div 
                          className="bg-[#16A34A] h-2 rounded-full"
                          style={{ width: `${employee.productivity || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-[#616161]">{employee.productivity || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {employee.status === 'active' && (
                        <button 
                          onClick={() => updateEmployeeStatus(employee.id, 'on-break')}
                          className="text-[#F59E0B] hover:text-[#D97706] font-medium text-xs"
                        >
                          Break
                        </button>
                      )}
                      {employee.status === 'on-break' && (
                        <button 
                          onClick={() => updateEmployeeStatus(employee.id, 'active')}
                          className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                        >
                          Resume
                        </button>
                      )}
                      <button 
                        onClick={() => setShowProfileModal(employee)}
                        className="text-[#3B82F6] hover:text-[#2563EB] font-medium text-xs"
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shift Planning Tab */}
      {subTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] flex items-center gap-2"
            >
              <Plus size={16} />
              Schedule Shift
            </button>
          </div>
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                <tr>
                  <th className="px-6 py-3">Shift Name</th>
                  <th className="px-6 py-3">Time Range</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Assigned</th>
                  <th className="px-6 py-3">Required</th>
                  <th className="px-6 py-3">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {shifts.map(shift => {
                  const fillRate = (shift.assignedEmployees / shift.requiredEmployees) * 100;
                  return (
                    <tr key={shift.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 font-medium text-[#212121]">{shift.name}</td>
                      <td className="px-6 py-4 text-[#616161]">{shift.timeRange}</td>
                      <td className="px-6 py-4 text-[#616161]">{shift.date}</td>
                      <td className="px-6 py-4 text-[#616161]">{shift.department}</td>
                      <td className="px-6 py-4 font-medium text-[#212121]">{shift.assignedEmployees}</td>
                      <td className="px-6 py-4 text-[#616161]">{shift.requiredEmployees}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-[#E5E7EB] rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                fillRate >= 90 ? 'bg-[#16A34A]' :
                                fillRate >= 70 ? 'bg-[#F59E0B]' :
                                'bg-[#EF4444]'
                              }`}
                              style={{ width: `${Math.min(fillRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            fillRate >= 90 ? 'text-[#16A34A]' :
                            fillRate >= 70 ? 'text-[#F59E0B]' :
                            'text-[#EF4444]'
                          }`}>
                            {fillRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {subTab === 'attendance' && (
        <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Check In</th>
                <th className="px-6 py-3">Check Out</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Hours Worked</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {attendance.map(record => (
                <tr key={record.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-[#212121]">{record.employeeName}</p>
                      <p className="text-xs text-[#757575]">{record.employeeId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#616161]">{record.date}</td>
                  <td className="px-6 py-4 text-[#616161]">{record.checkIn || '-'}</td>
                  <td className="px-6 py-4 text-[#616161]">{record.checkOut || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'present' ? 'bg-[#DCFCE7] text-[#166534]' :
                      record.status === 'late' ? 'bg-[#FEF9C3] text-[#854D0E]' :
                      record.status === 'on-leave' ? 'bg-[#E0F2FE] text-[#0369A1]' :
                      'bg-[#FEE2E2] text-[#991B1B]'
                    }`}>
                      {record.status === 'on-leave' ? 'On Leave' :
                       record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#212121]">
                    {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {record.status === 'absent' && (
                      <button 
                        onClick={() => markAttendance(record.employeeId, 'present')}
                        className="text-[#16A34A] hover:text-[#15803D] font-medium text-xs"
                      >
                        Mark Present
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Full Name</label>
                  <input 
                    type="text"
                    placeholder="John Doe"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Employee ID</label>
                  <input 
                    type="text"
                    placeholder="EMP-XXX"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Role</label>
                <input 
                  type="text"
                  placeholder="e.g., Lead Operator"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Department</label>
                  <select 
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value as any})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="operators">Operators</option>
                    <option value="qc">QC Staff</option>
                    <option value="supervisors">Supervisors</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Assigned Line</label>
                  <input 
                    type="text"
                    placeholder="Line A"
                    value={newEmployee.assignedLine}
                    onChange={(e) => setNewEmployee({...newEmployee, assignedLine: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Shift</label>
                  <select 
                    value={newEmployee.shift}
                    onChange={(e) => setNewEmployee({...newEmployee, shift: e.target.value as any})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    <option value="morning">Morning (6-2)</option>
                    <option value="afternoon">Afternoon (2-10)</option>
                    <option value="night">Night (10-6)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Phone</label>
                  <input 
                    type="text"
                    placeholder="Optional"
                    value={newEmployee.phoneNumber}
                    onChange={(e) => setNewEmployee({...newEmployee, phoneNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex gap-3 justify-end">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button 
                onClick={addEmployee}
                className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D]"
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Schedule New Shift</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Shift Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Morning Shift"
                  value={newShift.name}
                  onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Start Time</label>
                  <input 
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">End Time</label>
                  <input 
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Date</label>
                  <input 
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Required Staff</label>
                  <input 
                    type="number"
                    placeholder="20"
                    value={newShift.requiredEmployees}
                    onChange={(e) => setNewShift({...newShift, requiredEmployees: e.target.value})}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">Department</label>
                <select 
                  value={newShift.department}
                  onChange={(e) => setNewShift({...newShift, department: e.target.value})}
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="All">All Departments</option>
                  <option value="Operators">Operators</option>
                  <option value="QC">QC Staff</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-[#E0E0E0] flex gap-3 justify-end">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-[#E0E0E0] text-[#212121] font-medium rounded-lg hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button 
                onClick={addShift}
                className="px-4 py-2 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB]"
              >
                Schedule Shift
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#212121]">Employee Profile</h3>
              <button onClick={() => setShowProfileModal(null)} className="text-[#757575] hover:text-[#212121]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center pb-4 border-b border-[#E0E0E0]">
                <div className="w-20 h-20 bg-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={32} className="text-white" />
                </div>
                <h4 className="font-bold text-xl text-[#212121]">{showProfileModal.name}</h4>
                <p className="text-sm text-[#757575]">{showProfileModal.employeeId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#757575]">Role</span>
                  <p className="font-bold text-[#212121]">{showProfileModal.role}</p>
                </div>
                <div>
                  <span className="text-xs text-[#757575]">Department</span>
                  <p className="font-bold text-[#212121] capitalize">{showProfileModal.department}</p>
                </div>
                <div>
                  <span className="text-xs text-[#757575]">Assigned Line</span>
                  <p className="font-bold text-[#212121]">{showProfileModal.assignedLine || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-[#757575]">Shift</span>
                  <p className="font-bold text-[#212121]">{showProfileModal.shiftTime}</p>
                </div>
                <div>
                  <span className="text-xs text-[#757575]">Productivity</span>
                  <p className="font-bold text-[#16A34A]">{showProfileModal.productivity || 0}%</p>
                </div>
                <div>
                  <span className="text-xs text-[#757575]">Attendance</span>
                  <p className="font-bold text-[#16A34A]">{showProfileModal.attendance || 0}%</p>
                </div>
              </div>
              {showProfileModal.phoneNumber && (
                <div className="bg-[#F5F5F5] p-3 rounded-lg">
                  <span className="text-xs text-[#757575] block mb-1">Contact</span>
                  <p className="text-sm font-medium text-[#212121]">{showProfileModal.phoneNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}