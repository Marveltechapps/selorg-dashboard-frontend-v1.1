import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Send,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  Building2,
  Users,
  FileCheck,
  FileClock,
  FileX
} from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { exportToCSV } from '../../../utils/csvExport';

// Mock data generators
const generateFinancialSummary = () => ({
  pendingPayouts: 142500 + Math.floor(Math.random() * 10000),
  approvedInvoices: Math.floor(Math.random() * 5) + 28,
  disputedAmount: 8400 + Math.floor(Math.random() * 2000),
  paidThisMonth: 456700 + Math.floor(Math.random() * 50000),
  avgPaymentCycle: Math.floor(Math.random() * 3) + 12,
  outstandingBalance: 89300 + Math.floor(Math.random() * 5000),
  creditLimit: 500000,
  availableCredit: 410700
});

const generateInvoices = () => [
  {
    id: 'INV-2024-1234',
    vendorId: 'VEN-001',
    vendorName: 'Fresh Farms Inc.',
    amount: 15400.00,
    tax: 1540.00,
    totalAmount: 16940.00,
    currency: 'USD',
    issueDate: '2024-10-15',
    dueDate: '2024-10-25',
    paymentDate: null,
    status: 'scheduled',
    paymentMethod: 'Bank Transfer',
    category: 'Fresh Produce',
    poReference: 'PO-2024-456',
    description: 'Fresh vegetables and fruits - October batch',
    attachments: 2
  },
  {
    id: 'INV-2024-1235',
    vendorId: 'VEN-002',
    vendorName: 'Tech Logistics LLC',
    amount: 2800.00,
    tax: 280.00,
    totalAmount: 3080.00,
    currency: 'USD',
    issueDate: '2024-10-18',
    dueDate: '2024-10-28',
    paymentDate: null,
    status: 'processing',
    paymentMethod: 'ACH',
    category: 'Logistics',
    poReference: 'PO-2024-478',
    description: 'Delivery services for Q3',
    attachments: 1
  },
  {
    id: 'INV-2024-1236',
    vendorId: 'VEN-003',
    vendorName: 'Dairy Products Co.',
    amount: 8900.00,
    tax: 890.00,
    totalAmount: 9790.00,
    currency: 'USD',
    issueDate: '2024-10-12',
    dueDate: '2024-10-22',
    paymentDate: '2024-10-20',
    status: 'paid',
    paymentMethod: 'Wire Transfer',
    category: 'Dairy',
    poReference: 'PO-2024-445',
    description: 'Milk, cheese, and yogurt products',
    attachments: 3
  },
  {
    id: 'INV-2024-1237',
    vendorId: 'VEN-004',
    vendorName: 'Packaging Solutions',
    amount: 12600.00,
    tax: 1260.00,
    totalAmount: 13860.00,
    currency: 'USD',
    issueDate: '2024-10-20',
    dueDate: '2024-11-05',
    paymentDate: null,
    status: 'approved',
    paymentMethod: 'Bank Transfer',
    category: 'Packaging',
    poReference: 'PO-2024-489',
    description: 'Eco-friendly packaging materials',
    attachments: 2
  },
  {
    id: 'INV-2024-1238',
    vendorId: 'VEN-005',
    vendorName: 'Global Beverages',
    amount: 4200.00,
    tax: 420.00,
    totalAmount: 4620.00,
    currency: 'USD',
    issueDate: '2024-10-08',
    dueDate: '2024-10-18',
    paymentDate: null,
    status: 'disputed',
    paymentMethod: 'Check',
    category: 'Beverages',
    poReference: 'PO-2024-432',
    description: 'Soft drinks and juices - Quantity mismatch',
    attachments: 4
  },
  {
    id: 'INV-2024-1239',
    vendorId: 'VEN-006',
    vendorName: 'Organic Grains Ltd.',
    amount: 7800.00,
    tax: 780.00,
    totalAmount: 8580.00,
    currency: 'USD',
    issueDate: '2024-10-22',
    dueDate: '2024-11-08',
    paymentDate: null,
    status: 'pending',
    paymentMethod: 'Bank Transfer',
    category: 'Grains',
    poReference: 'PO-2024-495',
    description: 'Organic rice, wheat, and quinoa',
    attachments: 1
  },
  {
    id: 'INV-2024-1240',
    vendorId: 'VEN-007',
    vendorName: 'Meat & Poultry Suppliers',
    amount: 18500.00,
    tax: 1850.00,
    totalAmount: 20350.00,
    currency: 'USD',
    issueDate: '2024-10-10',
    dueDate: '2024-10-20',
    paymentDate: '2024-10-19',
    status: 'paid',
    paymentMethod: 'Wire Transfer',
    category: 'Meat',
    poReference: 'PO-2024-438',
    description: 'Fresh chicken, beef, and lamb',
    attachments: 2
  },
  {
    id: 'INV-2024-1241',
    vendorId: 'VEN-008',
    vendorName: 'Cleaning Supplies Inc.',
    amount: 3400.00,
    tax: 340.00,
    totalAmount: 3740.00,
    currency: 'USD',
    issueDate: '2024-10-25',
    dueDate: '2024-11-10',
    paymentDate: null,
    status: 'pending',
    paymentMethod: 'ACH',
    category: 'Supplies',
    poReference: 'PO-2024-501',
    description: 'Sanitizers and cleaning equipment',
    attachments: 1
  },
  {
    id: 'INV-2024-1242',
    vendorId: 'VEN-009',
    vendorName: 'Frozen Foods Warehouse',
    amount: 11200.00,
    tax: 1120.00,
    totalAmount: 12320.00,
    currency: 'USD',
    issueDate: '2024-10-17',
    dueDate: '2024-10-30',
    paymentDate: null,
    status: 'approved',
    paymentMethod: 'Bank Transfer',
    category: 'Frozen',
    poReference: 'PO-2024-467',
    description: 'Frozen vegetables and ready meals',
    attachments: 3
  },
  {
    id: 'INV-2024-1243',
    vendorId: 'VEN-010',
    vendorName: 'Bakery Products Co.',
    amount: 5600.00,
    tax: 560.00,
    totalAmount: 6160.00,
    currency: 'USD',
    issueDate: '2024-10-19',
    dueDate: '2024-11-03',
    paymentDate: null,
    status: 'approved',
    paymentMethod: 'ACH',
    category: 'Bakery',
    poReference: 'PO-2024-481',
    description: 'Bread, pastries, and cakes',
    attachments: 2
  },
  {
    id: 'INV-2024-1244',
    vendorId: 'VEN-003',
    vendorName: 'Dairy Products Co.',
    amount: 6700.00,
    tax: 670.00,
    totalAmount: 7370.00,
    currency: 'USD',
    issueDate: '2024-10-05',
    dueDate: '2024-10-15',
    paymentDate: '2024-10-14',
    status: 'paid',
    paymentMethod: 'Wire Transfer',
    category: 'Dairy',
    poReference: 'PO-2024-421',
    description: 'Premium cheese selection',
    attachments: 1
  },
  {
    id: 'INV-2024-1245',
    vendorId: 'VEN-005',
    vendorName: 'Global Beverages',
    amount: 4200.00,
    tax: 420.00,
    totalAmount: 4620.00,
    currency: 'USD',
    issueDate: '2024-10-14',
    dueDate: '2024-10-24',
    paymentDate: null,
    status: 'disputed',
    paymentMethod: 'Check',
    category: 'Beverages',
    poReference: 'PO-2024-451',
    description: 'Energy drinks - Damaged packaging claim',
    attachments: 5
  }
];

const generatePaymentHistory = () => {
  const data = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    data.push({
      month: date.toLocaleString('default', { month: 'short' }),
      paid: Math.floor(Math.random() * 200000) + 350000,
      pending: Math.floor(Math.random() * 50000) + 50000,
      disputed: Math.floor(Math.random() * 10000) + 5000
    });
  }
  return data;
};

const generatePaymentByCategory = () => [
  { name: 'Fresh Produce', value: 45000, color: '#10B981' },
  { name: 'Dairy', value: 32000, color: '#3B82F6' },
  { name: 'Meat', value: 28000, color: '#EF4444' },
  { name: 'Beverages', value: 18000, color: '#F59E0B' },
  { name: 'Packaging', value: 15000, color: '#8B5CF6' },
  { name: 'Logistics', value: 12000, color: '#EC4899' }
];

const generateVendorPayments = () => [
  {
    vendorId: 'VEN-001',
    vendorName: 'Fresh Farms Inc.',
    totalPaid: 145600,
    pendingAmount: 15400,
    invoiceCount: 24,
    avgPaymentDays: 11,
    creditRating: 'A+',
    lastPayment: '2024-10-20'
  },
  {
    vendorId: 'VEN-003',
    vendorName: 'Dairy Products Co.',
    totalPaid: 98400,
    pendingAmount: 0,
    invoiceCount: 18,
    avgPaymentDays: 9,
    creditRating: 'A',
    lastPayment: '2024-10-20'
  },
  {
    vendorId: 'VEN-007',
    vendorName: 'Meat & Poultry Suppliers',
    totalPaid: 87300,
    pendingAmount: 0,
    invoiceCount: 15,
    avgPaymentDays: 10,
    creditRating: 'A',
    lastPayment: '2024-10-19'
  },
  {
    vendorId: 'VEN-004',
    vendorName: 'Packaging Solutions',
    totalPaid: 56700,
    pendingAmount: 12600,
    invoiceCount: 12,
    avgPaymentDays: 13,
    creditRating: 'B+',
    lastPayment: '2024-10-18'
  },
  {
    vendorId: 'VEN-005',
    vendorName: 'Global Beverages',
    totalPaid: 42300,
    pendingAmount: 8400,
    invoiceCount: 10,
    avgPaymentDays: 15,
    creditRating: 'B',
    lastPayment: '2024-10-15'
  }
];

// Load invoices from localStorage or use default
const loadInvoicesFromStorage = () => {
  try {
    const saved = localStorage.getItem('vendorFinance_invoices');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load invoices from localStorage', e);
  }
  return null;
};

const saveInvoicesToStorage = (invoices: any[]) => {
  try {
    localStorage.setItem('vendorFinance_invoices', JSON.stringify(invoices));
  } catch (e) {
    console.warn('Failed to save invoices to localStorage', e);
  }
};

export function VendorFinance() {
  const [summary, setSummary] = useState(generateFinancialSummary());
  
  // Load invoices from localStorage or use default
  const [invoices, setInvoices] = useState(() => {
    const saved = loadInvoicesFromStorage();
    return saved || generateInvoices();
  });
  
  const [paymentHistory, setPaymentHistory] = useState(generatePaymentHistory());
  const [categoryData, setCategoryData] = useState(generatePaymentByCategory());
  const [vendorPayments, setVendorPayments] = useState(generateVendorPayments());
  
  const [selectedView, setSelectedView] = useState<'invoices' | 'payments' | 'vendors' | 'analytics'>('invoices');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Modal states
  const [showUploadInvoiceModal, setShowUploadInvoiceModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showVendorPaymentDetailsModal, setShowVendorPaymentDetailsModal] = useState(false);
  const [selectedVendorPayment, setSelectedVendorPayment] = useState<any>(null);
  
  // Upload invoice form state
  const [uploadForm, setUploadForm] = useState({
    vendorId: '',
    invoiceNumber: '',
    amount: '',
    file: null as File | null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setSummary(generateFinancialSummary());
        setLastUpdated(new Date());
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', icon: CheckCircle2 };
      case 'scheduled':
        return { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', icon: Calendar };
      case 'processing':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', icon: Clock };
      case 'approved':
        return { bg: 'bg-[#E0E7FF]', text: 'text-[#4F46E5]', icon: FileCheck };
      case 'pending':
        return { bg: 'bg-[#F3E8FF]', text: 'text-[#7C3AED]', icon: FileClock };
      case 'disputed':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', icon: FileX };
      default:
        return { bg: 'bg-[#E5E7EB]', text: 'text-[#374151]', icon: FileText };
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.poReference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleApproveInvoice = (invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'approved' } : inv
      );
      saveInvoicesToStorage(updated);
      return updated;
    });
    toast.success(`Invoice ${invoiceId} approved successfully`);
  };

  const handleSchedulePayment = (invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'scheduled' } : inv
      );
      saveInvoicesToStorage(updated);
      return updated;
    });
    toast.success(`Payment scheduled for ${invoiceId}`);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'paid', paymentDate: new Date().toISOString().split('T')[0] } : inv
      );
      saveInvoicesToStorage(updated);
      return updated;
    });
    toast.success(`Invoice ${invoiceId} marked as paid`);
  };

  const handleDispute = (invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'disputed' } : inv
      );
      saveInvoicesToStorage(updated);
      return updated;
    });
    toast.error(`Invoice ${invoiceId} disputed`);
  };
  
  const handleShareInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // Copy invoice details to clipboard or open share dialog
      const shareText = `Invoice ${invoiceId}\nVendor: ${invoice.vendorName}\nAmount: $${invoice.totalAmount.toLocaleString()}\nStatus: ${invoice.status}`;
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success('Invoice details copied to clipboard');
      }).catch(() => {
        toast.info('Share: ' + shareText);
      });
    }
  };
  
  const handleCancelInvoice = (invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'disputed' } : inv
      );
      saveInvoicesToStorage(updated);
      return updated;
    });
    toast.success(`Invoice ${invoiceId} cancelled`);
  };
  
  const handleDownloadInvoice = (invoice: any) => {
    try {
      const csvData: (string | number)[][] = [
        ['Invoice Details'],
        [''],
        ['Invoice ID', invoice.id],
        ['Vendor ID', invoice.vendorId],
        ['Vendor Name', invoice.vendorName],
        ['Amount', `$${invoice.amount.toFixed(2)}`],
        ['Tax', `$${invoice.tax.toFixed(2)}`],
        ['Total Amount', `$${invoice.totalAmount.toFixed(2)}`],
        ['Currency', invoice.currency],
        ['Issue Date', invoice.issueDate],
        ['Due Date', invoice.dueDate],
        ['Payment Date', invoice.paymentDate || 'N/A'],
        ['Status', invoice.status],
        ['Payment Method', invoice.paymentMethod],
        ['Category', invoice.category],
        ['PO Reference', invoice.poReference],
        ['Description', invoice.description],
        ['Attachments', invoice.attachments],
      ];
      exportToCSV(csvData, `invoice-${invoice.id}`);
      toast.success('Invoice downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };
  
  const handleDownloadReceipt = (invoice: any) => {
    try {
      const csvData: (string | number)[][] = [
        ['Payment Receipt'],
        [''],
        ['Transaction ID', `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`],
        ['Invoice ID', invoice.id],
        ['Vendor', invoice.vendorName],
        ['Payment Date', invoice.paymentDate || new Date().toISOString().split('T')[0]],
        ['Amount Paid', `$${invoice.totalAmount.toFixed(2)}`],
        ['Payment Method', invoice.paymentMethod],
        ['Status', 'Paid'],
        [''],
        ['Thank you for your payment!'],
      ];
      exportToCSV(csvData, `receipt-${invoice.id}-${new Date().toISOString().split('T')[0]}`);
      toast.success('Receipt downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    }
  };
  
  const handleExportReport = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      const csvData: (string | number)[][] = [
        ['Finance Integration Report', `Date: ${today}`, `Time: ${timestamp}`],
        [''],
        
        // Financial Summary
        ['=== FINANCIAL SUMMARY ==='],
        ['Pending Payouts', `$${(summary.pendingPayouts / 1000).toFixed(1)}k`],
        ['Approved Invoices', summary.approvedInvoices],
        ['Disputed Amount', `$${(summary.disputedAmount / 1000).toFixed(1)}k`],
        ['Paid This Month', `$${(summary.paidThisMonth / 1000).toFixed(0)}k`],
        ['Avg Payment Cycle', `${summary.avgPaymentCycle} days`],
        ['Outstanding Balance', `$${(summary.outstandingBalance / 1000).toFixed(0)}k`],
        ['Credit Limit', `$${(summary.creditLimit / 1000).toFixed(0)}k`],
        ['Available Credit', `$${(summary.availableCredit / 1000).toFixed(0)}k`],
        [''],
        
        // Invoices
        ['=== INVOICES ==='],
        ['Invoice ID', 'Vendor', 'Amount', 'Tax', 'Total', 'Issue Date', 'Due Date', 'Status', 'Payment Method', 'Category', 'PO Reference'],
        ...invoices.map(inv => [
          inv.id,
          inv.vendorName,
          `$${inv.amount.toFixed(2)}`,
          `$${inv.tax.toFixed(2)}`,
          `$${inv.totalAmount.toFixed(2)}`,
          inv.issueDate,
          inv.dueDate,
          inv.status,
          inv.paymentMethod,
          inv.category,
          inv.poReference,
        ]),
        [''],
        
        // Vendor Payments
        ['=== VENDOR PAYMENTS ==='],
        ['Vendor ID', 'Vendor Name', 'Total Paid', 'Pending Amount', 'Invoice Count', 'Avg Payment Days', 'Credit Rating', 'Last Payment'],
        ...vendorPayments.map(vp => [
          vp.vendorId,
          vp.vendorName,
          `$${(vp.totalPaid / 1000).toFixed(1)}k`,
          `$${(vp.pendingAmount / 1000).toFixed(1)}k`,
          vp.invoiceCount,
          vp.avgPaymentDays,
          vp.creditRating,
          vp.lastPayment,
        ]),
        [''],
        
        // Payment History
        ['=== PAYMENT HISTORY (Last 12 Months) ==='],
        ['Month', 'Paid', 'Pending', 'Disputed'],
        ...paymentHistory.map(ph => [
          ph.month,
          `$${ph.paid.toLocaleString()}`,
          `$${ph.pending.toLocaleString()}`,
          `$${ph.disputed.toLocaleString()}`,
        ]),
      ];
      
      exportToCSV(csvData, `finance-integration-report-${today}-${timestamp.replace(/:/g, '-')}`);
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };
  
  const handleUploadInvoice = () => {
    // Reset form when opening modal
    setUploadForm({
      vendorId: '',
      invoiceNumber: '',
      amount: '',
      file: null,
    });
    setShowUploadInvoiceModal(true);
  };
  
  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF, JPG, or PNG files only.');
      return;
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }
    
    setUploadForm(prev => ({ ...prev, file }));
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
  
  const handleUploadSubmit = () => {
    // Validate form
    if (!uploadForm.vendorId || uploadForm.vendorId === 'Select vendor...') {
      toast.error('Please select a vendor');
      return;
    }
    if (!uploadForm.invoiceNumber.trim()) {
      toast.error('Please enter invoice number');
      return;
    }
    if (!uploadForm.amount || parseFloat(uploadForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    // Find vendor name
    const vendor = vendorPayments.find(vp => vp.vendorId === uploadForm.vendorId);
    const vendorName = vendor?.vendorName || 'Unknown Vendor';
    
    // Create new invoice
    const newInvoice = {
      id: uploadForm.invoiceNumber || `INV-${Date.now()}`,
      vendorId: uploadForm.vendorId,
      vendorName: vendorName,
      amount: parseFloat(uploadForm.amount),
      tax: parseFloat(uploadForm.amount) * 0.1, // 10% tax
      totalAmount: parseFloat(uploadForm.amount) * 1.1,
      currency: 'USD',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      paymentDate: null,
      status: 'pending',
      paymentMethod: 'Bank Transfer',
      category: 'Other',
      poReference: `PO-${Date.now()}`,
      description: `Uploaded invoice - ${uploadForm.file.name}`,
      attachments: 1
    };
    
    // Add to invoices and save
    setInvoices(prev => {
      const updated = [newInvoice, ...prev];
      saveInvoicesToStorage(updated);
      return updated;
    });
    
    toast.success(`Invoice ${newInvoice.id} uploaded successfully`);
    setShowUploadInvoiceModal(false);
    
    // Reset form
    setUploadForm({
      vendorId: '',
      invoiceNumber: '',
      amount: '',
      file: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance Integration"
        subtitle="Payment tracking, invoice management, and financial reconciliation"
        actions={
          <>
            <div className="text-xs text-[#757575] flex items-center gap-2">
              <Clock size={14} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                autoRefresh 
                  ? 'bg-[#4F46E5] text-white' 
                  : 'bg-white text-[#616161] border border-[#E0E0E0]'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              Auto Refresh
            </button>
            <button 
              onClick={handleUploadInvoice}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA] transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Upload Invoice
            </button>
            <button 
              onClick={handleExportReport}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export Report
            </button>
          </>
        }
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#FEF3C7] text-[#92400E] rounded-lg">
              <DollarSign size={20} />
            </div>
            <ArrowUpRight size={16} className="text-[#F59E0B]" />
          </div>
          <p className="text-xs text-[#757575] font-medium mb-1">Pending Payouts</p>
          <h3 className="text-2xl font-bold text-[#212121]">${(summary.pendingPayouts / 1000).toFixed(1)}k</h3>
          <p className="text-xs text-[#757575] mt-1">Due within 30 days</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#E0E7FF] text-[#4F46E5] rounded-lg">
              <FileCheck size={20} />
            </div>
            <span className="text-xs font-bold text-[#4F46E5]">{summary.approvedInvoices}</span>
          </div>
          <p className="text-xs text-[#757575] font-medium mb-1">Approved Invoices</p>
          <h3 className="text-2xl font-bold text-[#212121]">{summary.approvedInvoices}</h3>
          <p className="text-xs text-[#757575] mt-1">Ready for payment</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#FEE2E2] text-[#991B1B] rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <ArrowDownRight size={16} className="text-[#EF4444]" />
          </div>
          <p className="text-xs text-[#757575] font-medium mb-1">Disputed Amount</p>
          <h3 className="text-2xl font-bold text-[#212121]">${(summary.disputedAmount / 1000).toFixed(1)}k</h3>
          <p className="text-xs text-[#757575] mt-1">Requires resolution</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-[#DCFCE7] text-[#166534] rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <TrendingUp size={16} className="text-[#22C55E]" />
          </div>
          <p className="text-xs text-[#757575] font-medium mb-1">Paid This Month</p>
          <h3 className="text-2xl font-bold text-[#212121]">${(summary.paidThisMonth / 1000).toFixed(0)}k</h3>
          <p className="text-xs text-[#22C55E] mt-1">+12% vs last month</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#DBEAFE] text-[#1E40AF] rounded-lg">
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Avg Payment Cycle</p>
              <h4 className="text-xl font-bold text-[#212121]">{summary.avgPaymentCycle} days</h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#F3E8FF] text-[#7C3AED] rounded-lg">
              <Wallet size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Outstanding Balance</p>
              <h4 className="text-xl font-bold text-[#212121]">${(summary.outstandingBalance / 1000).toFixed(0)}k</h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#E0E7FF] text-[#4F46E5] rounded-lg">
              <CreditCard size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Credit Limit</p>
              <h4 className="text-xl font-bold text-[#212121]">${(summary.creditLimit / 1000).toFixed(0)}k</h4>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#DCFCE7] text-[#166534] rounded-lg">
              <TrendingUp size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#757575]">Available Credit</p>
              <h4 className="text-xl font-bold text-[#212121]">${(summary.availableCredit / 1000).toFixed(0)}k</h4>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-[#E0E0E0]">
        {[
          { id: 'invoices', label: 'Invoice Management', icon: FileText },
          { id: 'payments', label: 'Payment History', icon: Receipt },
          { id: 'vendors', label: 'Vendor Payments', icon: Building2 },
          { id: 'analytics', label: 'Financial Analytics', icon: BarChart3 }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                selectedView === view.id
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-[#757575] hover:text-[#212121]'
              }`}
            >
              <Icon size={16} />
              {view.label}
            </button>
          );
        })}
      </div>

      {/* Invoice Management Tab */}
      {selectedView === 'invoices' && (
        <>
          {/* Filters */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
              <input
                type="text"
                placeholder="Search by vendor, invoice ID, or PO reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All', count: invoices.length },
                { value: 'pending', label: 'Pending', count: invoices.filter(i => i.status === 'pending').length },
                { value: 'approved', label: 'Approved', count: invoices.filter(i => i.status === 'approved').length },
                { value: 'scheduled', label: 'Scheduled', count: invoices.filter(i => i.status === 'scheduled').length },
                { value: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
                { value: 'disputed', label: 'Disputed', count: invoices.filter(i => i.status === 'disputed').length }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === filter.value
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-white text-[#616161] border border-[#E0E0E0] hover:bg-[#F5F7FA]'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3 text-left">Invoice ID</th>
                    <th className="px-6 py-3 text-left">Vendor</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Issue Date</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Payment Method</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {filteredInvoices.map(invoice => {
                    const statusConfig = getStatusColor(invoice.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={invoice.id} className="hover:bg-[#FAFAFA]">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#212121]">{invoice.id}</div>
                          <div className="text-xs text-[#757575]">{invoice.poReference}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#212121]">{invoice.vendorName}</div>
                          <div className="text-xs text-[#757575]">{invoice.category}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#212121]">${invoice.totalAmount.toLocaleString()}</div>
                          <div className="text-xs text-[#757575]">Tax: ${invoice.tax.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 text-[#616161]">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[#616161]">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                          {invoice.paymentDate && (
                            <div className="text-xs text-[#22C55E]">Paid: {new Date(invoice.paymentDate).toLocaleDateString()}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon size={12} />
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#616161]">
                          {invoice.paymentMethod}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Share button */}
                            <button
                              onClick={() => handleShareInvoice(invoice.id)}
                              className="p-1.5 hover:bg-[#F5F7FA] rounded text-[#616161] transition-colors"
                              title="Share"
                            >
                              <Send size={16} />
                            </button>
                            
                            {/* Cancel button */}
                            {invoice.status !== 'paid' && invoice.status !== 'disputed' && (
                              <button
                                onClick={() => handleCancelInvoice(invoice.id)}
                                className="p-1.5 hover:bg-[#FEE2E2] rounded text-[#991B1B] transition-colors"
                                title="Cancel"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            
                            {/* Schedule Payment button */}
                            {invoice.status === 'approved' && (
                              <button
                                onClick={() => handleSchedulePayment(invoice.id)}
                                className="p-1.5 hover:bg-[#DBEAFE] rounded text-[#1E40AF] transition-colors"
                                title="Schedule Payment"
                              >
                                <Calendar size={16} />
                              </button>
                            )}
                            
                            {/* View Details button */}
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceDetailsModal(true);
                              }}
                              className="p-1.5 hover:bg-[#F5F7FA] rounded text-[#616161] transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Download button */}
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="p-1.5 hover:bg-[#F5F7FA] rounded text-[#616161] transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment History Tab */}
      {selectedView === 'payments' && (
        <>
          <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
            <h3 className="font-bold text-[#212121] mb-4">Payment Trends (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={paymentHistory}>
                <defs>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#757575" style={{ fontSize: '12px' }} />
                <YAxis stroke="#757575" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="paid" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fill="url(#paidGradient)" 
                  name="Paid"
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  fill="url(#pendingGradient)" 
                  name="Pending"
                />
                <Area 
                  type="monotone" 
                  dataKey="disputed" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  fill="none" 
                  name="Disputed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Payments */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
              <h3 className="font-bold text-[#212121]">Recent Payments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7FA] text-[#757575] font-medium border-b border-[#E0E0E0]">
                  <tr>
                    <th className="px-6 py-3 text-left">Payment Date</th>
                    <th className="px-6 py-3 text-left">Invoice ID</th>
                    <th className="px-6 py-3 text-left">Vendor</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Method</th>
                    <th className="px-6 py-3 text-left">Transaction ID</th>
                    <th className="px-6 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {invoices.filter(inv => inv.status === 'paid').slice(0, 5).map((invoice, idx) => (
                    <tr key={invoice.id} className="hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 text-[#616161]">
                        {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#212121]">{invoice.id}</td>
                      <td className="px-6 py-4 text-[#616161]">{invoice.vendorName}</td>
                      <td className="px-6 py-4 font-bold text-[#22C55E]">${invoice.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[#616161]">{invoice.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-[#F5F7FA] text-[#4F46E5] rounded text-xs font-mono">
                          TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDownloadReceipt(invoice)}
                          className="text-[#4F46E5] hover:underline text-xs font-medium flex items-center gap-1 ml-auto"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Vendor Payments Tab */}
      {selectedView === 'vendors' && (
        <>
          <div className="grid grid-cols-1 gap-4">
            {vendorPayments.map(vendor => (
              <div key={vendor.vendorId} className="bg-white p-5 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#E0E7FF] text-[#4F46E5] rounded-lg flex items-center justify-center font-bold">
                      {vendor.vendorName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#212121]">{vendor.vendorName}</h3>
                      <p className="text-xs text-[#757575]">{vendor.vendorId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#757575]">Credit Rating</p>
                      <p className="text-sm font-bold text-[#22C55E]">{vendor.creditRating}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedVendorPayment(vendor);
                        setShowVendorPaymentDetailsModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-lg text-xs font-medium hover:bg-[#4338CA] transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Total Paid (YTD)</p>
                    <p className="text-lg font-bold text-[#212121]">${(vendor.totalPaid / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Pending Amount</p>
                    <p className="text-lg font-bold text-[#F59E0B]">${(vendor.pendingAmount / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Total Invoices</p>
                    <p className="text-lg font-bold text-[#212121]">{vendor.invoiceCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Avg Payment Days</p>
                    <p className="text-lg font-bold text-[#3B82F6]">{vendor.avgPaymentDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Last Payment</p>
                    <p className="text-sm font-medium text-[#616161]">{new Date(vendor.lastPayment).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {selectedView === 'analytics' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment by Category */}
            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <h3 className="font-bold text-[#212121] mb-4">Payments by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-[#616161]">{cat.name}: ${(cat.value / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status Distribution */}
            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <h3 className="font-bold text-[#212121] mb-4">Invoice Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { status: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
                  { status: 'Scheduled', count: invoices.filter(i => i.status === 'scheduled').length },
                  { status: 'Approved', count: invoices.filter(i => i.status === 'approved').length },
                  { status: 'Processing', count: invoices.filter(i => i.status === 'processing').length },
                  { status: 'Pending', count: invoices.filter(i => i.status === 'pending').length },
                  { status: 'Disputed', count: invoices.filter(i => i.status === 'disputed').length }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="status" stroke="#757575" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#757575" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]">Payment Efficiency</h3>
                <TrendingUp size={20} className="text-[#22C55E]" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#757575]">On-time Payments</span>
                    <span className="text-xs font-bold text-[#212121]">94%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div className="bg-[#22C55E] h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#757575]">Auto-processed</span>
                    <span className="text-xs font-bold text-[#212121]">78%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#757575]">Dispute Rate</span>
                    <span className="text-xs font-bold text-[#212121]">6%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                    <div className="bg-[#EF4444] h-2 rounded-full" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]">Top Vendors</h3>
                <Users size={20} className="text-[#4F46E5]" />
              </div>
              <div className="space-y-3">
                {vendorPayments.slice(0, 3).map((vendor, idx) => (
                  <div key={vendor.vendorId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-[#E0E7FF] text-[#4F46E5] rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-[#616161]">{vendor.vendorName}</span>
                    </div>
                    <span className="text-xs font-bold text-[#212121]">${(vendor.totalPaid / 1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#212121]">Upcoming Payments</h3>
                <Calendar size={20} className="text-[#F59E0B]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#757575]">Next 7 days</span>
                  <span className="text-sm font-bold text-[#F59E0B]">$42.5k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#757575]">Next 15 days</span>
                  <span className="text-sm font-bold text-[#F59E0B]">$78.3k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#757575]">Next 30 days</span>
                  <span className="text-sm font-bold text-[#F59E0B]">$142.5k</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upload Invoice Modal */}
      <Dialog open={showUploadInvoiceModal} onOpenChange={setShowUploadInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Invoice</DialogTitle>
            <DialogDescription>
              Upload a new invoice document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Vendor</label>
              <select 
                value={uploadForm.vendorId}
                onChange={(e) => setUploadForm(prev => ({ ...prev, vendorId: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">Select vendor...</option>
                {vendorPayments.map(vp => (
                  <option key={vp.vendorId} value={vp.vendorId}>{vp.vendorName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Invoice Number</label>
              <input 
                type="text" 
                value={uploadForm.invoiceNumber}
                onChange={(e) => setUploadForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                placeholder="INV-2024-XXXX"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Amount</label>
              <input 
                type="number" 
                value={uploadForm.amount}
                onChange={(e) => setUploadForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">Upload File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-[#4F46E5] bg-[#E0E7FF]' 
                    : uploadForm.file 
                    ? 'border-[#10B981] bg-[#DCFCE7]' 
                    : 'border-[#E0E0E0] hover:border-[#4F46E5] hover:bg-[#F5F7FA]'
                }`}
              >
                {uploadForm.file ? (
                  <>
                    <CheckCircle2 size={24} className="mx-auto text-[#10B981] mb-2" />
                    <p className="text-sm font-medium text-[#212121]">{uploadForm.file.name}</p>
                    <p className="text-xs text-[#757575] mt-1">
                      {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadForm(prev => ({ ...prev, file: null }));
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
                    <Upload size={24} className="mx-auto text-[#757575] mb-2" />
                    <p className="text-sm text-[#757575]">Click to upload or drag and drop</p>
                    <p className="text-xs text-[#757575] mt-1">PDF, JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button 
                onClick={() => {
                  setShowUploadInvoiceModal(false);
                  setUploadForm({
                    vendorId: '',
                    invoiceNumber: '',
                    amount: '',
                    file: null,
                  });
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="px-4 py-2 bg-white text-[#616161] border border-[#E0E0E0] rounded-lg hover:bg-[#F5F7FA] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Upload Invoice
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceDetailsModal} onOpenChange={setShowInvoiceDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#757575] mb-1">Invoice ID</p>
                  <p className="font-medium text-[#212121]">{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Vendor</p>
                  <p className="font-medium text-[#212121]">{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Amount</p>
                  <p className="font-medium text-[#212121]">${selectedInvoice.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Tax</p>
                  <p className="font-medium text-[#212121]">${selectedInvoice.tax.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-[#212121]">${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status).bg} ${getStatusColor(selectedInvoice.status).text}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Issue Date</p>
                  <p className="font-medium text-[#212121]">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Due Date</p>
                  <p className="font-medium text-[#212121]">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                {selectedInvoice.paymentDate && (
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Payment Date</p>
                    <p className="font-medium text-[#212121]">{new Date(selectedInvoice.paymentDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-[#757575] mb-1">Payment Method</p>
                  <p className="font-medium text-[#212121]">{selectedInvoice.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Category</p>
                  <p className="font-medium text-[#212121]">{selectedInvoice.category}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">PO Reference</p>
                  <p className="font-medium text-[#212121]">{selectedInvoice.poReference}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Description</p>
                <p className="font-medium text-[#212121] bg-[#F5F7FA] p-3 rounded-lg">{selectedInvoice.description}</p>
              </div>
              <div>
                <p className="text-sm text-[#757575] mb-1">Attachments</p>
                <p className="font-medium text-[#212121]">{selectedInvoice.attachments} file(s)</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-[#E0E0E0]">
                <button 
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="px-4 py-2 bg-white text-[#616161] border border-[#E0E0E0] rounded-lg hover:bg-[#F5F7FA] transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download Invoice
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Payment Details Modal */}
      <Dialog open={showVendorPaymentDetailsModal} onOpenChange={setShowVendorPaymentDetailsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vendor Payment Details</DialogTitle>
            <DialogDescription>
              Payment history and details for {selectedVendorPayment?.vendorName}
            </DialogDescription>
          </DialogHeader>
          {selectedVendorPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#757575] mb-1">Vendor ID</p>
                  <p className="font-medium text-[#212121]">{selectedVendorPayment.vendorId}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Vendor Name</p>
                  <p className="font-medium text-[#212121]">{selectedVendorPayment.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Total Paid (YTD)</p>
                  <p className="text-lg font-bold text-[#212121]">${(selectedVendorPayment.totalPaid / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Pending Amount</p>
                  <p className="text-lg font-bold text-[#F59E0B]">${(selectedVendorPayment.pendingAmount / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Total Invoices</p>
                  <p className="font-medium text-[#212121]">{selectedVendorPayment.invoiceCount}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Avg Payment Days</p>
                  <p className="font-medium text-[#212121]">{selectedVendorPayment.avgPaymentDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Credit Rating</p>
                  <p className="text-lg font-bold text-[#22C55E]">{selectedVendorPayment.creditRating}</p>
                </div>
                <div>
                  <p className="text-sm text-[#757575] mb-1">Last Payment</p>
                  <p className="font-medium text-[#212121]">{new Date(selectedVendorPayment.lastPayment).toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Related Invoices */}
              <div>
                <p className="text-sm font-medium text-[#212121] mb-3">Related Invoices</p>
                <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F5F7FA] text-[#757575] font-medium">
                        <tr>
                          <th className="px-4 py-2 text-left">Invoice ID</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E0E0]">
                        {invoices.filter(inv => inv.vendorId === selectedVendorPayment.vendorId).slice(0, 5).map(inv => (
                          <tr key={inv.id} className="hover:bg-[#FAFAFA]">
                            <td className="px-4 py-2 font-medium text-[#212121]">{inv.id}</td>
                            <td className="px-4 py-2 text-[#616161]">${inv.totalAmount.toLocaleString()}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status).bg} ${getStatusColor(inv.status).text}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-[#616161]">{new Date(inv.dueDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}