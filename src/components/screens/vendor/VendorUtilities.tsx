import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Database, X, CheckCircle2, FileUp, Download, Search, Filter, Calendar, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { toast } from 'sonner';

interface UploadHistory {
  id: string;
  fileName: string;
  recordsProcessed: number;
  uploadedBy: string;
  timestamp: string;
  status: 'success' | 'failed' | 'processing';
}

interface Contract {
  id: string;
  vendorId: string;
  vendorName: string;
  contractNumber: string;
  title: string;
  type: 'Service' | 'Supply' | 'Maintenance' | 'Other';
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  renewalDate?: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  module: string;
  details?: string;
  ipAddress?: string;
}

// Load from localStorage
const loadUploadHistoryFromStorage = (): UploadHistory[] => {
  try {
    const saved = localStorage.getItem('vendorUtilities_uploadHistory');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveUploadHistoryToStorage = (history: UploadHistory[]) => {
  try {
    localStorage.setItem('vendorUtilities_uploadHistory', JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save upload history to localStorage', e);
  }
};

const loadContractsFromStorage = (): Contract[] => {
  try {
    const saved = localStorage.getItem('vendorUtilities_contracts');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  // Generate default contracts
  const defaultContracts: Contract[] = [
    {
      id: '1',
      vendorId: 'v1',
      vendorName: 'ABC Supplies Inc.',
      contractNumber: 'CNT-2024-001',
      title: 'Annual Supply Agreement',
      type: 'Supply',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      value: 500000,
      status: 'active',
      renewalDate: '2024-12-15',
    },
    {
      id: '2',
      vendorId: 'v2',
      vendorName: 'XYZ Services Ltd.',
      contractNumber: 'CNT-2024-002',
      title: 'Maintenance Services Contract',
      type: 'Maintenance',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      value: 250000,
      status: 'active',
      renewalDate: '2025-02-15',
    },
    {
      id: '3',
      vendorId: 'v3',
      vendorName: 'Tech Solutions Co.',
      contractNumber: 'CNT-2023-015',
      title: 'IT Support Services',
      type: 'Service',
      startDate: '2023-06-01',
      endDate: '2023-12-31',
      value: 150000,
      status: 'expired',
    },
  ];
  saveContractsToStorage(defaultContracts);
  return defaultContracts;
};

const saveContractsToStorage = (contracts: Contract[]) => {
  try {
    localStorage.setItem('vendorUtilities_contracts', JSON.stringify(contracts));
  } catch (e) {
    console.warn('Failed to save contracts to localStorage', e);
  }
};

const loadAuditLogsFromStorage = (): AuditLogEntry[] => {
  try {
    const saved = localStorage.getItem('vendorUtilities_auditLogs');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  // Generate default audit logs
  const defaultLogs: AuditLogEntry[] = [
    {
      id: '1',
      action: 'Bulk vendor upload',
      user: 'Admin',
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      module: 'Vendor Management',
      details: 'vendors_bulk_2024.csv - 45 records imported',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      action: 'Contract created',
      user: 'Manager',
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
      module: 'Contract Manager',
      details: 'CNT-2024-002 - XYZ Services Ltd.',
      ipAddress: '192.168.1.105',
    },
    {
      id: '3',
      action: 'Contract updated',
      user: 'Admin',
      timestamp: new Date(Date.now() - 86400000).toLocaleString(),
      module: 'Contract Manager',
      details: 'CNT-2024-001 - Renewal date updated',
      ipAddress: '192.168.1.100',
    },
    {
      id: '4',
      action: 'Vendor profile updated',
      user: 'Manager',
      timestamp: new Date(Date.now() - 172800000).toLocaleString(),
      module: 'Vendor Management',
      details: 'ABC Supplies Inc. - Contact information updated',
      ipAddress: '192.168.1.105',
    },
  ];
  saveAuditLogsToStorage(defaultLogs);
  return defaultLogs;
};

const saveAuditLogsToStorage = (logs: AuditLogEntry[]) => {
  try {
    localStorage.setItem('vendorUtilities_auditLogs', JSON.stringify(logs));
  } catch (e) {
    console.warn('Failed to save audit logs to localStorage', e);
  }
};

export function VendorUtilities() {
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showContractManagerModal, setShowContractManagerModal] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  
  // Bulk Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>(loadUploadHistoryFromStorage());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Contract Manager State
  const [contracts, setContracts] = useState<Contract[]>(loadContractsFromStorage());
  const [contractSearch, setContractSearch] = useState('');
  const [contractFilter, setContractFilter] = useState<'all' | 'active' | 'expired' | 'pending' | 'terminated'>('all');
  const [showContractDetailsModal, setShowContractDetailsModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(loadAuditLogsFromStorage());
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | string>('all');
  
  // Save to localStorage when state changes
  useEffect(() => {
    saveUploadHistoryToStorage(uploadHistory);
  }, [uploadHistory]);
  
  useEffect(() => {
    saveContractsToStorage(contracts);
  }, [contracts]);
  
  useEffect(() => {
    saveAuditLogsToStorage(auditLogs);
  }, [auditLogs]);
  
  // Bulk Upload Handlers
  const handleFileSelect = (file: File) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Invalid file type. Please upload CSV or Excel files only.');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }
    
    setUploadFile(file);
    toast.success('File selected: ' + file.name);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  
  const processUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      const recordsProcessed = Math.floor(Math.random() * 100) + 10;
      const newUpload: UploadHistory = {
        id: Date.now().toString(),
        fileName: uploadFile.name,
        recordsProcessed,
        uploadedBy: 'Current User',
        timestamp: new Date().toLocaleString(),
        status: 'success',
      };
      
      setUploadHistory(prev => [newUpload, ...prev]);
      setUploadFile(null);
      setUploadStatus('success');
      
      // Add audit log
      const newLog: AuditLogEntry = {
        id: Date.now().toString(),
        action: 'Bulk vendor upload',
        user: 'Current User',
        timestamp: new Date().toLocaleString(),
        module: 'Vendor Management',
        details: `${uploadFile.name} - ${recordsProcessed} records imported`,
        ipAddress: '192.168.1.100',
      };
      setAuditLogs(prev => [newLog, ...prev]);
      
      toast.success(`Successfully uploaded ${uploadFile.name} - ${recordsProcessed} records processed`);
      
      setTimeout(() => {
        setShowBulkUploadModal(false);
        setUploadStatus('idle');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    }, 2000);
  };
  
  // Contract Manager Handlers
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(contractSearch.toLowerCase()) ||
                         contract.vendorName.toLowerCase().includes(contractSearch.toLowerCase()) ||
                         contract.title.toLowerCase().includes(contractSearch.toLowerCase());
    const matchesFilter = contractFilter === 'all' || contract.status === contractFilter;
    return matchesSearch && matchesFilter;
  });
  
  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractDetailsModal(true);
  };
  
  const handleDeleteContract = (contractId: string) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      setContracts(prev => prev.filter(c => c.id !== contractId));
      toast.success('Contract deleted successfully');
      
      // Add audit log
      const deletedContract = contracts.find(c => c.id === contractId);
      const newLog: AuditLogEntry = {
        id: Date.now().toString(),
        action: 'Contract deleted',
        user: 'Current User',
        timestamp: new Date().toLocaleString(),
        module: 'Contract Manager',
        details: `${deletedContract?.contractNumber} - ${deletedContract?.vendorName}`,
        ipAddress: '192.168.1.100',
      };
      setAuditLogs(prev => [newLog, ...prev]);
    }
  };
  
  // Audit Logs Handlers
  const uniqueModules = Array.from(new Set(auditLogs.map(log => log.module)));
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                         log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
                         log.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
                         (log.details && log.details.toLowerCase().includes(auditSearch.toLowerCase()));
    const matchesFilter = auditFilter === 'all' || log.module === auditFilter;
    return matchesSearch && matchesFilter;
  });
  
  const exportAuditLogs = () => {
    const csvData = [
      ['Audit Logs Report', `Date: ${new Date().toISOString().split('T')[0]}`],
      [''],
      ['Action', 'User', 'Module', 'Details', 'Timestamp', 'IP Address'],
      ...filteredAuditLogs.map(log => [
        log.action,
        log.user,
        log.module,
        log.details || '',
        log.timestamp,
        log.ipAddress || '',
      ]),
    ];
    
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported successfully');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilities & Vendor Tools"
        subtitle="Bulk actions, document management, and scorecards"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setShowBulkUploadModal(true)}
          className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
            <Upload size={32} />
          </div>
          <h3 className="font-bold text-[#212121]">Bulk Vendor Upload</h3>
          <p className="text-sm text-[#757575] mt-1">Import new vendors via CSV/Excel.</p>
        </div>
        
        <div 
          onClick={() => setShowContractManagerModal(true)}
          className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
            <FileText size={32} />
          </div>
          <h3 className="font-bold text-[#212121]">Contract Manager</h3>
          <p className="text-sm text-[#757575] mt-1">Repository of all vendor agreements.</p>
        </div>
        
        <div 
          onClick={() => setShowAuditLogsModal(true)}
          className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575] group-hover:bg-[#4F46E5] group-hover:text-white transition-colors">
            <Database size={32} />
          </div>
          <h3 className="font-bold text-[#212121]">Audit Logs</h3>
          <p className="text-sm text-[#757575] mt-1">View system access and change history.</p>
        </div>
      </div>

      {/* Bulk Vendor Upload Modal */}
      <Dialog open={showBulkUploadModal} onOpenChange={setShowBulkUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Vendor Upload</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import multiple vendors at once
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {uploadStatus === 'idle' && (
              <>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-[#4F46E5] bg-[#E0E7FF]' 
                      : uploadFile 
                      ? 'border-[#10B981] bg-[#DCFCE7]' 
                      : 'border-[#E0E0E0] hover:border-[#4F46E5] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  {uploadFile ? (
                    <>
                      <CheckCircle2 size={48} className="mx-auto text-[#10B981] mb-2" />
                      <p className="text-sm font-medium text-[#212121]">{uploadFile.name}</p>
                      <p className="text-xs text-[#757575] mt-1">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                        className="mt-2 text-xs text-[#EF4444] hover:underline"
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <FileUp size={48} className="mx-auto text-[#757575] mb-2" />
                      <p className="text-sm text-[#757575]">Click to upload or drag and drop</p>
                      <p className="text-xs text-[#757575] mt-1">CSV, XLSX, XLS (Max 10MB)</p>
                    </>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900 font-medium mb-1">CSV Format Required:</p>
                  <p className="text-xs text-blue-700">Vendor Name, Contact Email, Phone, Address, Category, Status</p>
                </div>
              </>
            )}
            
            {uploadStatus === 'uploading' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
                <p className="text-sm text-[#757575]">Processing upload...</p>
              </div>
            )}
            
            {uploadStatus === 'success' && (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto text-[#10B981] mb-4" />
                <p className="text-sm font-medium text-[#212121]">Upload successful!</p>
              </div>
            )}
            
            {uploadHistory.length > 0 && (
              <div className="border-t border-[#E0E0E0] pt-4">
                <h4 className="text-sm font-medium text-[#212121] mb-3">Upload History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadHistory.slice(0, 5).map(upload => (
                    <div key={upload.id} className="flex justify-between items-center text-xs p-2 bg-[#F5F7FA] rounded">
                      <div>
                        <p className="font-medium text-[#212121]">{upload.fileName}</p>
                        <p className="text-[#757575]">{upload.recordsProcessed} records • {upload.timestamp}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        upload.status === 'success' ? 'bg-[#DCFCE7] text-[#10B981]' :
                        upload.status === 'failed' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                        'bg-[#FEF3C7] text-[#F59E0B]'
                      }`}>
                        {upload.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setUploadFile(null);
                  setUploadStatus('idle');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-white text-[#616161] border border-[#E0E0E0] rounded-lg hover:bg-[#F5F7FA] transition-colors"
              >
                Cancel
              </button>
              {uploadStatus === 'idle' && uploadFile && (
                <button 
                  onClick={processUpload}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Upload File
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Manager Modal */}
      <Dialog open={showContractManagerModal} onOpenChange={setShowContractManagerModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contract Manager</DialogTitle>
            <DialogDescription>
              Manage all vendor contracts and agreements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575]" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <select
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value as any)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            
            {filteredContracts.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No contracts found"
                description="No contracts match your search criteria"
              />
            ) : (
              <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Contract #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">End Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {filteredContracts.map(contract => (
                      <tr key={contract.id} className="hover:bg-[#F5F7FA]">
                        <td className="px-4 py-3 text-sm font-medium text-[#212121]">{contract.contractNumber}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{contract.vendorName}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{contract.title}</td>
                        <td className="px-4 py-3 text-sm text-[#757575]">{contract.type}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">${contract.value.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-[#757575]">{contract.endDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            contract.status === 'active' ? 'bg-[#DCFCE7] text-[#10B981]' :
                            contract.status === 'expired' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                            contract.status === 'pending' ? 'bg-[#FEF3C7] text-[#F59E0B]' :
                            'bg-[#E5E7EB] text-[#6B7280]'
                          }`}>
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewContract(contract)}
                              className="p-1 text-[#4F46E5] hover:bg-[#E0E7FF] rounded"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.id)}
                              className="p-1 text-[#EF4444] hover:bg-[#FEE2E2] rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Details Modal */}
      <Dialog open={showContractDetailsModal} onOpenChange={setShowContractDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contract Details</DialogTitle>
            <DialogDescription>
              View detailed information about the contract
            </DialogDescription>
          </DialogHeader>
          
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#757575] mb-1">Contract Number</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.contractNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs inline-block ${
                    selectedContract.status === 'active' ? 'bg-[#DCFCE7] text-[#10B981]' :
                    selectedContract.status === 'expired' ? 'bg-[#FEE2E2] text-[#EF4444]' :
                    selectedContract.status === 'pending' ? 'bg-[#FEF3C7] text-[#F59E0B]' :
                    'bg-[#E5E7EB] text-[#6B7280]'
                  }`}>
                    {selectedContract.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Vendor</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.vendorName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Type</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Title</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.title}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Value</p>
                  <p className="text-sm font-medium text-[#212121]">${selectedContract.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Start Date</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">End Date</p>
                  <p className="text-sm font-medium text-[#212121]">{selectedContract.endDate}</p>
                </div>
                {selectedContract.renewalDate && (
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Renewal Date</p>
                    <p className="text-sm font-medium text-[#212121]">{selectedContract.renewalDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Logs Modal */}
      <Dialog open={showAuditLogsModal} onOpenChange={setShowAuditLogsModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Logs</DialogTitle>
            <DialogDescription>
              View system access and change history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575]" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
              <button
                onClick={exportAuditLogs}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
            
            {filteredAuditLogs.length === 0 ? (
              <EmptyState
                icon={Database}
                title="No audit logs found"
                description="No audit logs match your search criteria"
              />
            ) : (
              <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#F5F7FA]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Module</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#757575]">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#F5F7FA]">
                        <td className="px-4 py-3 text-xs text-[#757575]">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm font-medium text-[#212121]">{log.action}</td>
                        <td className="px-4 py-3 text-sm text-[#212121]">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-[#757575]">{log.module}</td>
                        <td className="px-4 py-3 text-sm text-[#757575]">{log.details || '-'}</td>
                        <td className="px-4 py-3 text-xs text-[#757575]">{log.ipAddress || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
