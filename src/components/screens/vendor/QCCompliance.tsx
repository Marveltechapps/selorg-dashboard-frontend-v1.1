import React, { useState, useEffect } from 'react';
import {
  Clipboard,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  MoreVertical,
  Calendar,
  FileText,
  Upload,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  XCircle,
  AlertCircle,
  ThermometerSun,
  Shield,
  Award,
  Phone,
  Mail,
  Bell,
  Printer,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { exportToCSV, exportToCSVForExcel } from '../../../utils/csvExport';
import { exportToPDF } from '../../../utils/pdfExport';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import * as vendorManagementApi from '../../../api/vendor/vendorManagement.api';

// Types
type QCResult = 'Pass' | 'Fail' | 'Pending';
type AuditType = 'Full Audit' | 'Follow-up' | 'Routine' | 'Complaint-based' | 'Certification';
type CertificateStatus = 'Valid' | 'Expiring Soon' | 'Expired' | 'Pending Renewal';
type CheckType = 'Visual' | 'Temperature' | 'Packaging' | 'Labeling' | 'Weight' | 'Chemical' | 'Microbiological';

interface QCCheck {
  id: string;
  checkId: string;
  batchId: string;
  product: string;
  vendor: string;
  checkType: CheckType;
  result: QCResult;
  inspector?: string;
  date?: string;
  actualReading?: string;
  requirement?: string;
  severity?: string;
  // UI state for workflow/status (optimistic)
  status?: 'Pending' | 'Approved' | 'Appealed' | 'Rejected';
  // stage can represent workflow progression for "Next Report" actions
  stage?: 'Review' | 'Reported' | 'Closed';
}

interface Audit {
  id: string;
  auditId: string;
  vendor: string;
  date: string;
  auditType: AuditType;
  result: string;
  score: number;
}

interface Certificate {
  id: string;
  certificateType: string;
  vendor: string;
  issuedDate: string;
  expiryDate: string;
  status: CertificateStatus;
  daysToExpiry: number;
  licenseNumber?: string;
}

interface TemperatureCompliance {
  id: string;
  shipmentId: string;
  product: string;
  vendor: string;
  requirement: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  compliant: boolean;
}

interface VendorRating {
  id: string;
  vendor: string;
  overallRating: number;
  qcPassRate: number;
  complianceScore: number;
  auditScore: number;
  trend: 'up' | 'down' | 'stable';
}

// Mock Data
const mockRecentAudits: QCCheck[] = [
  {
    id: '1',
    checkId: 'QC-001',
    batchId: 'BCH-9921',
    product: 'Organic Spinach',
    vendor: 'Fresh Farms',
    checkType: 'Visual',
    result: 'Pass',
    inspector: 'John D.',
  },
  {
    id: '2',
    checkId: 'QC-002',
    batchId: 'BCH-9922',
    product: 'Milk Cartons',
    vendor: 'Dairy Delights',
    checkType: 'Temperature',
    result: 'Fail',
    inspector: 'Sarah M.',
    actualReading: '9.2°C',
    requirement: '2-8°C',
    severity: 'Critical',
  },
];

const mockQCChecks: QCCheck[] = [
  ...mockRecentAudits.map(c => ({ ...c, status: c.result === 'Pass' ? 'Approved' : 'Pending', stage: 'Review' })),
  {
    id: '3',
    checkId: 'QC-003',
    batchId: 'BCH-9920',
    product: 'Tomatoes',
    vendor: 'Global Foods',
    checkType: 'Packaging',
    result: 'Pass',
    inspector: 'Mike C.',
    status: 'Approved',
    stage: 'Review',
  },
];

const mockAudits: Audit[] = [
  {
    id: '1',
    auditId: 'AUD-2024-047',
    vendor: 'Fresh Farms',
    date: 'Dec 18, 2024',
    auditType: 'Routine',
    result: 'Passed',
    score: 88,
  },
  {
    id: '2',
    auditId: 'AUD-2024-046',
    vendor: 'Dairy Delights',
    date: 'Dec 15, 2024',
    auditType: 'Follow-up',
    result: 'Failed',
    score: 65,
  },
  {
    id: '3',
    auditId: 'AUD-2024-045',
    vendor: 'Global Spices',
    date: 'Dec 10, 2024',
    auditType: 'Full Audit',
    result: 'Passed',
    score: 92,
  },
];

const mockCertificates: Certificate[] = [
  {
    id: '1',
    certificateType: 'FSSAI License',
    vendor: 'Fresh Farms',
    issuedDate: 'Jan 15, 2024',
    expiryDate: 'Jan 14, 2025',
    status: 'Valid',
    daysToExpiry: 327,
    licenseNumber: '1234567890',
  },
  {
    id: '2',
    certificateType: 'ISO 22000',
    vendor: 'Dairy Delights',
    issuedDate: 'Jun 01, 2023',
    expiryDate: 'May 31, 2025',
    status: 'Valid',
    daysToExpiry: 450,
  },
  {
    id: '3',
    certificateType: 'GMP Certificate',
    vendor: 'Global Spices',
    issuedDate: 'Mar 20, 2023',
    expiryDate: 'Mar 19, 2024',
    status: 'Expired',
    daysToExpiry: -275,
  },
];

const mockTemperatureData: TemperatureCompliance[] = [
  {
    id: '1',
    shipmentId: 'SHP-9921',
    product: 'Milk',
    vendor: 'Dairy Delights',
    requirement: '2-8°C',
    avgTemp: 5.2,
    minTemp: 2,
    maxTemp: 8,
    compliant: true,
  },
  {
    id: '2',
    shipmentId: 'SHP-9922',
    product: 'Ice Cream',
    vendor: 'Frozen Foods',
    requirement: '-18°C',
    avgTemp: -16,
    minTemp: -15,
    maxTemp: -18,
    compliant: false,
  },
  {
    id: '3',
    shipmentId: 'SHP-9923',
    product: 'Meat',
    vendor: 'Fresh Meat Co',
    requirement: '0-4°C',
    avgTemp: 3.5,
    minTemp: 1,
    maxTemp: 4,
    compliant: true,
  },
];

const mockRatings: VendorRating[] = [
  {
    id: '1',
    vendor: 'Fresh Farms',
    overallRating: 4.8,
    qcPassRate: 96.5,
    complianceScore: 92,
    auditScore: 88,
    trend: 'up',
  },
  {
    id: '2',
    vendor: 'Dairy Delights',
    overallRating: 3.2,
    qcPassRate: 82.1,
    complianceScore: 75,
    auditScore: 65,
    trend: 'down',
  },
  {
    id: '3',
    vendor: 'Global Spices',
    overallRating: 4.1,
    qcPassRate: 89.2,
    complianceScore: 85,
    auditScore: 88,
    trend: 'stable',
  },
];

export function QCCompliance() {
  const [activeTab, setActiveTab] = useState<'qc' | 'audits' | 'certs' | 'temp' | 'ratings'>('qc');
  const [selectedCheck, setSelectedCheck] = useState<QCCheck | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedTemp, setSelectedTemp] = useState<TemperatureCompliance | null>(null);
  // Local mutable state for optimistic updates
  const [checks, setChecks] = useState<QCCheck[]>(mockQCChecks);
  const [audits, setAudits] = useState<Audit[]>(mockAudits);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [temps, setTemps] = useState<TemperatureCompliance[]>(mockTemperatureData);
  const [ratings, setRatings] = useState<VendorRating[]>(mockRatings);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [alerts, setAlerts] = useState<
    { id: string; checkId?: string; message: string; type?: 'info' | 'warning' | 'critical'; acknowledged?: boolean; ts?: number }[]
  >([]);
  const [openReportMenuId, setOpenReportMenuId] = useState<string | null>(null);

  const [loadingChecks, setLoadingChecks] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingChecks(true);
        const vendorId = localStorage.getItem('selectedVendorId');
        const resp = vendorId
          ? await vendorManagementApi.listVendorQCChecks(vendorId, { page: 1, perPage: 25 })
          : await vendorManagementApi.listQCChecks({ page: 1, perPage: 25 });
        if (!mounted) return;
        const items = resp.data || resp.items || resp;
        setChecks(Array.isArray(items) ? items : (items.data || items.items || []));
        if (vendorId) {
          try {
            const certResp = await vendorManagementApi.listVendorCertificates(vendorId);
            const certs = certResp.items || certResp || [];
            if (mounted) setCertificates(Array.isArray(certs) ? certs : (certs.items || []));
          } catch (e) {
            console.warn('Failed to load certificates', e);
          }
          
          // Load audits
          try {
            const auditsResp = await vendorManagementApi.getAudits({ vendorId });
            const auditsData = auditsResp.data || auditsResp || [];
            if (mounted) setAudits(Array.isArray(auditsData) ? auditsData : []);
          } catch (e) {
            console.warn('Failed to load audits', e);
          }
          
          // Load temperature compliance
          try {
            const tempResp = await vendorManagementApi.getTemperatureCompliance({ vendorId });
            const tempData = tempResp.data || tempResp || [];
            if (mounted) setTemps(Array.isArray(tempData) ? tempData : []);
          } catch (e) {
            console.warn('Failed to load temperature compliance', e);
          }
          
          // Load vendor ratings
          try {
            const ratingsResp = await vendorManagementApi.getVendorRatings(vendorId);
            const ratingsData = ratingsResp.data || ratingsResp || [];
            if (mounted) setRatings(Array.isArray(ratingsData) ? ratingsData : []);
          } catch (e) {
            console.warn('Failed to load vendor ratings', e);
          }
        }
      } catch (err) {
        console.error('Failed to load QC checks', err);
        toast.error('Failed to load QC checks');
      } finally {
        setLoadingChecks(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLoadingFor = (id: string, val: boolean) =>
    setLoadingIds(prev => ({ ...prev, [id]: val }));

  // Optimistic handlers
  const approveCheck = async (id: string) => {
    setLoadingFor(id, true);
    // capture previous state for rollback
    let previous: QCCheck | undefined;
    setChecks(prev =>
      prev.map(c => {
        if (c.id === id) {
          previous = c;
          return { ...c, status: 'Approved', result: 'Pass' };
        }
        return c;
      })
    );
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success('Check approved');
      // remove any existing alerts for this check (acknowledge)
      setAlerts(prev => prev.filter(a => a.checkId !== id));
    } catch (err) {
      // rollback
      setChecks(prev => prev.map(c => (c.id === id && previous ? previous : c)));
      toast.error('Failed to approve check');
    } finally {
      setLoadingFor(id, false);
      setShowQCDetailModal(false);
    }
  };

  const rejectCheck = async (id: string) => {
    setLoadingFor(id, true);
    let previous: QCCheck | undefined;
    setChecks(prev =>
      prev.map(c => {
        if (c.id === id) {
          previous = c;
          return { ...c, status: 'Rejected', result: 'Fail' };
        }
        return c;
      })
    );
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.error('Check rejected');
      // create an in-app alert for rejected checks
      const alertId = `alert-reject-${id}-${Date.now()}`;
      setAlerts(prev => [
        { id: alertId, checkId: id, message: `Check ${id} rejected — action required`, type: 'critical', acknowledged: false, ts: Date.now() },
        ...prev,
      ]);
    } catch (err) {
      setChecks(prev => prev.map(c => (c.id === id && previous ? previous : c)));
      toast.error('Failed to reject check');
    } finally {
      setLoadingFor(id, false);
      setShowQCDetailModal(false);
    }
  };

  const appealCheck = async (id: string) => {
    setLoadingFor(id, true);
    let previous: QCCheck | undefined;
    setChecks(prev =>
      prev.map(c => {
        if (c.id === id) {
          previous = c;
          return { ...c, status: 'Appealed' };
        }
        return c;
      })
    );
    try {
      await new Promise(res => setTimeout(res, 700));
      toast.success('Appeal submitted');
      // add informational alert
      const alertId = `alert-appeal-${id}-${Date.now()}`;
      setAlerts(prev => [{ id: alertId, checkId: id, message: `Appeal submitted for ${id}`, type: 'info', acknowledged: false, ts: Date.now() }, ...prev]);
    } catch (err) {
      setChecks(prev => prev.map(c => (c.id === id && previous ? previous : c)));
      toast.error('Failed to submit appeal');
    } finally {
      setLoadingFor(id, false);
      setShowQCDetailModal(false);
    }
  };
 
  // Next Report workflow actions (Approve / Reject as a workflow step)
  const handleNextReportAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingFor(id, true);
    let previous: QCCheck | undefined;
    setChecks(prev =>
      prev.map(c => {
        if (c.id === id) {
          previous = c;
          return {
            ...c,
            stage: 'Reported',
            status: action === 'approve' ? 'Approved' : 'Rejected',
            result: action === 'approve' ? 'Pass' : 'Fail',
          };
        }
        return c;
      })
    );
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success(`Report ${action === 'approve' ? 'approved' : 'rejected'}`);
      // close menu
      setOpenReportMenuId(null);
      if (action === 'reject') {
        const alertId = `alert-report-reject-${id}-${Date.now()}`;
        setAlerts(prev => [{ id: alertId, checkId: id, message: `Report for ${id} was rejected`, type: 'warning', acknowledged: false, ts: Date.now() }, ...prev]);
      }
    } catch (err) {
      setChecks(prev => prev.map(c => (c.id === id && previous ? previous : c)));
      toast.error('Failed to process report action');
    } finally {
      setLoadingFor(id, false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const scheduleAudit = async (auditId?: string) => {
    const id = auditId || `sch-${Date.now()}`;
    setLoadingFor(id, true);
    const newAudit: Audit = {
      id,
      auditId: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: selectedAudit?.vendor || 'N/A',
      date: new Date().toLocaleDateString(),
      auditType: 'Routine',
      result: 'Scheduled',
      score: 0
    };
    // optimistic add
    setAudits(prev => [newAudit, ...prev]);
    try {
      await new Promise(res => setTimeout(res, 800));
      toast.success('Audit scheduled');
    } catch (err) {
      setAudits(prev => prev.filter(a => a.id !== id));
      toast.error('Failed to schedule audit');
    } finally {
      setLoadingFor(id, false);
    }
  };

  const verifyCertificate = async (certId: string) => {
    setLoadingFor(certId, true);
    setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'Valid' } : c));
    try {
      await new Promise(res => setTimeout(res, 600));
      toast.success('Certificate verified');
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setLoadingFor(certId, false);
      setShowCertificateModal(false);
    }
  };

  const renewCertificate = async (certId: string) => {
    setLoadingFor(certId, true);
    setCertificates(prev => prev.map(c => c.id === certId ? { ...c, status: 'Pending Renewal' } : c));
    try {
      await new Promise(res => setTimeout(res, 800));
      toast.success('Renewal scheduled');
    } catch (err) {
      toast.error('Failed to schedule renewal');
    } finally {
      setLoadingFor(certId, false);
    }
  };

  const alertVendor = async (vendor: string) => {
    const id = `alert-${vendor}-${Date.now()}`;
    setLoadingFor(id, true);
    try {
      await new Promise(res => setTimeout(res, 500));
      toast.success(`Alert sent to ${vendor}`);
    } catch (err) {
      toast.error('Failed to send alert');
    } finally {
      setLoadingFor(id, false);
    }
  };

  // Export functions
  const exportQCCheckReport = () => {
    if (!selectedCheck) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const csvData: (string | number)[][] = [
        ['QC Check Report', `Date: ${today}`],
        [''],
        ['Check Information'],
        ['Check ID', selectedCheck.checkId],
        ['Batch ID', selectedCheck.batchId],
        ['Product', selectedCheck.product],
        ['Vendor', selectedCheck.vendor],
        ['Check Type', selectedCheck.checkType],
        ['Inspector', selectedCheck.inspector || 'N/A'],
        ['Check Date', selectedCheck.date || 'N/A'],
        [''],
        ['Check Details'],
        ['Result', selectedCheck.result],
        ['Requirement', selectedCheck.requirement || 'N/A'],
        ['Actual Reading', selectedCheck.actualReading || 'N/A'],
        ['Severity', selectedCheck.severity || 'N/A'],
      ];
      exportToCSV(csvData, `qc-check-${selectedCheck.checkId}-${today}`);
      toast.success('QC Check report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const exportAuditReport = () => {
    if (!selectedAudit) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const csvData: (string | number)[][] = [
        ['Audit Report', `Date: ${today}`],
        [''],
        ['Audit Information'],
        ['Audit ID', selectedAudit.auditId],
        ['Vendor', selectedAudit.vendor],
        ['Audit Date', selectedAudit.date],
        ['Audit Type', selectedAudit.auditType],
        ['Result', selectedAudit.result],
        ['Score', selectedAudit.score],
      ];
      exportToCSV(csvData, `audit-${selectedAudit.auditId}-${today}`);
      toast.success('Audit report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const exportSampleTestReport = () => {
    if (!selectedCheck) return; // Reusing selectedCheck for sample tests
    try {
      const today = new Date().toISOString().split('T')[0];
      const csvData: (string | number)[][] = [
        ['Sample Test Report', `Date: ${today}`],
        [''],
        ['Sample Information'],
        ['Check ID', selectedCheck.checkId],
        ['Batch ID', selectedCheck.batchId],
        ['Product', selectedCheck.product],
        ['Vendor', selectedCheck.vendor],
        ['Test Type', selectedCheck.checkType],
        ['Result', selectedCheck.result],
        ['Inspector', selectedCheck.inspector || 'N/A'],
      ];
      exportToCSV(csvData, `sample-test-${selectedCheck.checkId}-${today}`);
      toast.success('Sample test report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const exportRejectionReport = () => {
    if (!selectedCheck) return; // Reusing selectedCheck for rejections
    try {
      const today = new Date().toISOString().split('T')[0];
      const csvData: (string | number)[][] = [
        ['Rejection Report', `Date: ${today}`],
        [''],
        ['Rejection Information'],
        ['Check ID', selectedCheck.checkId],
        ['Batch ID', selectedCheck.batchId],
        ['Product', selectedCheck.product],
        ['Vendor', selectedCheck.vendor],
        ['Reason', 'Storage temperature exceeded acceptable range'],
        ['Severity', selectedCheck.severity || 'High'],
        ['Impact', 'Product quality compromise'],
        ['Recommendation', 'Reject batch / Return to vendor'],
      ];
      exportToCSV(csvData, `rejection-${selectedCheck.checkId}-${today}`);
      toast.success('Rejection report downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const exportCertificate = () => {
    if (!selectedCertificate) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const csvData: (string | number)[][] = [
        ['Certificate Report', `Date: ${today}`],
        [''],
        ['Certificate Information'],
        ['Certificate Type', selectedCertificate.certificateType],
        ['Vendor', selectedCertificate.vendor],
        ['Issued Date', selectedCertificate.issuedDate],
        ['Expiry Date', selectedCertificate.expiryDate],
        ['Status', selectedCertificate.status],
        ['Days to Expiry', selectedCertificate.daysToExpiry],
        ['License Number', selectedCertificate.licenseNumber || 'N/A'],
      ];
      exportToCSV(csvData, `certificate-${selectedCertificate.certificateType}-${today}`);
      toast.success('Certificate report downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };
  const [selectedRating, setSelectedRating] = useState<VendorRating | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  // Modal states
  const [showQCDetailModal, setShowQCDetailModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showTempReportModal, setShowTempReportModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Get result badge color
  const getResultColor = (result: QCResult) => {
    switch (result) {
      case 'Pass':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'Fail':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'Pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Get certificate status color
  const getCertificateColor = (status: CertificateStatus) => {
    switch (status) {
      case 'Valid':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'Expiring Soon':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'Expired':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'Pending Renewal':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#10B981';
    if (rating >= 4.0) return '#0EA5E9';
    if (rating >= 3.0) return '#F59E0B';
    return '#EF4444';
  };

  // Render stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'fill-current' : ''}`}
          style={{ color: getRatingColor(rating) }}
        />
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="QC & Compliance"
        subtitle="Inbound quality checks, audit logs, and safety certificates"
      />

      {/* Three-Metric Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        {/* QC Checks Today */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          style={{ borderLeft: '4px solid #0EA5E9' }}
        >
          <div className="flex items-start justify-between mb-3">
            <Clipboard className="w-6 h-6 text-[#0EA5E9]" />
          </div>
          <div className="mb-2">
            <p className="text-[28px] font-bold text-[#1F2937]">42</p>
            <p className="text-xs text-[#6B7280]">Batches</p>
            <p className="text-[10px] text-[#9CA3AF]">QC Checks Today</p>
          </div>
          <div className="text-xs text-[#6B7280] space-y-1">
            <div>Passed: <span className="font-bold text-[#10B981]">40</span> (95.2%)</div>
            <div>Failed: <span className="font-bold text-[#EF4444]">2</span> (4.8%)</div>
            <div>Pending: <span className="font-bold text-[#1F2937]">0</span></div>
          </div>
        </div>

        {/* Pass Rate */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          style={{ borderLeft: '4px solid #10B981' }}
        >
          <div className="flex items-start justify-between mb-3">
            <CheckCircle className="w-6 h-6 text-[#10B981]" />
          </div>
          <div className="mb-2">
            <p className="text-[28px] font-bold text-[#1F2937]">96%</p>
            <p className="text-xs text-[#6B7280]">Last 7 days</p>
            <p className="text-[10px] text-[#9CA3AF]">Pass Rate</p>
          </div>
          <div className="text-xs text-[#6B7280] space-y-1">
            <div>Total checks: <span className="font-bold text-[#1F2937]">287</span></div>
            <div>Passed: <span className="font-bold text-[#10B981]">275</span></div>
            <div>Failed: <span className="font-bold text-[#EF4444]">12</span> (requires action)</div>
            <div>Pass target: <span className="font-bold text-[#10B981]">&gt;95% ✓</span></div>
          </div>
        </div>

        {/* Failures */}
        <div
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          style={{ borderLeft: '4px solid #EF4444' }}
        >
          <div className="flex items-start justify-between mb-3">
            <AlertTriangle className="w-6 h-6 text-[#EF4444] animate-pulse" />
          </div>
          <div className="mb-2">
            <p className="text-[28px] font-bold text-[#1F2937]">2</p>
            <p className="text-xs text-[#6B7280]">Requires Action</p>
            <p className="text-[10px] text-[#9CA3AF]">Failures</p>
          </div>
          <div className="text-xs text-[#6B7280] space-y-1">
            <div>Critical failures: <span className="font-bold text-[#EF4444]">1</span></div>
            <div>Major failures: <span className="font-bold text-[#F59E0B]">1</span></div>
            <div>Vendor: <span className="font-bold text-[#1F2937]">Dairy Delights</span></div>
            <div>Status: <span className="font-bold text-[#F59E0B]">Pending Review</span></div>
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        {/* In-app alerts */}
        {alerts.length > 0 && (
          <div className="px-6 py-3 border-b border-[#E5E7EB] bg-[#FFFBEB]">
            <div className="flex flex-col gap-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-white border border-[#F1F5F9] rounded p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1 rounded-full" style={{ background: a.type === 'critical' ? '#DC2626' : a.type === 'warning' ? '#F59E0B' : '#0EA5E9' }} />
                    <div className="text-sm">
                      <div className="font-medium text-[#1F2937]">{a.message}</div>
                      <div className="text-xs text-[#6B7280]">{new Date(a.ts || Date.now()).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!a.acknowledged && (
                      <button onClick={() => acknowledgeAlert(a.id)} className="px-3 py-1.5 bg-[#10B981] text-white text-xs rounded">Acknowledge</button>
                    )}
                    <button onClick={() => setAlerts(prev => prev.filter(x => x.id !== a.id))} className="px-3 py-1.5 bg-white border border-[#E5E7EB] text-xs rounded">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#1F2937]">Recent QC Checks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-xs font-bold uppercase">Batch ID</th>
                <th className="px-6 py-3 text-xs font-bold uppercase">Product</th>
                <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                <th className="px-6 py-3 text-xs font-bold uppercase">Check Type</th>
                <th className="px-6 py-3 text-xs font-bold uppercase">Result</th>
                <th className="px-6 py-3 text-xs font-bold uppercase">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {checks.slice(0, 4).map((check) => {
                const colors = getResultColor(check.result);
                return (
                  <tr key={check.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#616161]">{check.batchId}</td>
                    <td className="px-6 py-4 font-medium text-[#212121]">{check.product}</td>
                    <td className="px-6 py-4 text-[#616161]">{check.vendor}</td>
                    <td className="px-6 py-4 text-[#616161]">{check.checkType} / Visual</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {check.result === 'Pass' && <CheckCircle className="w-3 h-3" />}
                        {check.result === 'Fail' && <XCircle className="w-3 h-3" />}
                        {check.result} {check.result === 'Fail' && check.actualReading && `(${check.actualReading})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#616161]">{check.inspector}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-[#E5E7EB]">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('qc')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'qc' ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            QC Checks
            {activeTab === 'qc' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]" />}
          </button>

          <button
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'audits' ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Audit Logs
            {activeTab === 'audits' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]" />}
          </button>

          <button
            onClick={() => setActiveTab('certs')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'certs' ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Certifications
            {activeTab === 'certs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]" />}
          </button>

          <button
            onClick={() => setActiveTab('temp')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'temp' ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Temperature Compliance
            {activeTab === 'temp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]" />}
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'ratings' ? 'text-[#4F46E5]' : 'text-[#6B7280] hover:text-[#1F2937]'
            }`}
          >
            Quality Ratings
            {activeTab === 'ratings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4F46E5]" />}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'qc' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Check ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Batch ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Product</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Check Type</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Result</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {checks.map((check) => {
                  const colors = getResultColor(check.result);
                  return (
                    <tr key={check.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4 font-mono text-[#616161]">{check.checkId}</td>
                      <td className="px-6 py-4 font-mono text-[#616161]">{check.batchId}</td>
                      <td className="px-6 py-4 font-medium text-[#212121]">{check.product}</td>
                      <td className="px-6 py-4 text-[#616161]">{check.vendor}</td>
                      <td className="px-6 py-4">
                        <span className="text-[#0EA5E9]">{check.checkType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {check.result === 'Pass' && <CheckCircle className="w-3 h-3" />}
                          {check.result === 'Fail' && <XCircle className="w-3 h-3" />}
                          {check.result}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCheck(check);
                              setShowQCDetailModal(true);
                            }}
                            className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200"
                          >
                            {check.result === 'Fail' ? 'Review' : 'View'}
                          </button>
                          {check.status !== 'Approved' && (
                            <button
                              onClick={() => approveCheck(check.id)}
                              className="px-3 py-1.5 bg-[#10B981] text-white text-xs font-medium rounded-md hover:bg-[#059669] transition-all duration-200"
                            >
                              {loadingIds[check.id] ? 'Processing...' : 'Approve'}
                            </button>
                          )}
                          {check.result === 'Fail' && check.status !== 'Appealed' && (
                            <button
                              onClick={() => appealCheck(check.id)}
                              className="px-3 py-1.5 bg-[#0EA5E9] text-white text-xs font-medium rounded-md hover:bg-[#0284C7] transition-all duration-200"
                            >
                              {loadingIds[check.id] ? 'Submitting...' : 'Appeal'}
                            </button>
                          )}
                          {/* Next Report dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenReportMenuId(openReportMenuId === check.id ? null : check.id)}
                              className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563] transition-all duration-200"
                            >
                              Report
                            </button>
                            {openReportMenuId === check.id && (
                              <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E5E7EB] rounded shadow-sm z-10">
                                <button
                                  onClick={() => handleNextReportAction(check.id, 'approve')}
                                  className="w-full text-left px-3 py-2 hover:bg-[#F3F4F6]"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleNextReportAction(check.id, 'reject')}
                                  className="w-full text-left px-3 py-2 hover:bg-[#FEEDEE] text-[#DC2626]"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Alert button removed per design - not used */}
                          <button className="p-1.5 border border-[#E0E0E0] rounded hover:bg-[#F5F5F5]">
                            <MoreVertical className="w-4 h-4 text-[#757575]" />
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
      )}

      {activeTab === 'audits' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Audit ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Audit Type</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Result</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#616161]">{audit.auditId}</td>
                    <td className="px-6 py-4 font-medium text-[#212121]">{audit.vendor}</td>
                    <td className="px-6 py-4 text-[#616161]">{audit.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-medium ${
                          audit.auditType === 'Full Audit' ? 'text-[#7C3AED]' :
                          audit.auditType === 'Follow-up' ? 'text-[#F59E0B]' :
                          audit.auditType === 'Routine' ? 'text-[#0EA5E9]' :
                          audit.auditType === 'Complaint-based' ? 'text-[#EF4444]' :
                          'text-[#10B981]'
                        }`}
                      >
                        {audit.auditType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${audit.result === 'Passed' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}
                        >
                          {audit.result}
                        </span>
                        <span className="text-[#6B7280]">{audit.score}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAudit(audit);
                            setShowAuditLogModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563]"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            try {
                              const today = new Date().toISOString().split('T')[0];
                              const csvData: (string | number)[][] = [
                                ['Audit Report', `Date: ${today}`],
                                [''],
                                ['Audit Information'],
                                ['Audit ID', audit.auditId],
                                ['Vendor', audit.vendor],
                                ['Audit Date', audit.date],
                                ['Audit Type', audit.auditType],
                                ['Result', audit.result],
                                ['Score', audit.score],
                              ];
                              exportToCSV(csvData, `audit-${audit.auditId}-${today}`);
                              toast.success('Audit report downloaded');
                            } catch (error) {
                              toast.error('Failed to download report');
                            }
                          }}
                          className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563]"
                        >
                          Download
                        </button>
                        {audit.result === 'Passed' && (
                          <button
                            onClick={() => scheduleAudit(audit.id)}
                            className="px-3 py-1.5 bg-[#4F46E5] text-white text-xs font-medium rounded-md hover:bg-[#4338CA]"
                          >
                            {loadingIds[audit.id] ? 'Scheduling...' : 'Schedule'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'certs' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Certificate</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Issued Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Document</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {certificates.map((cert) => {
                  const colors = getCertificateColor(cert.status);
                  return (
                    <tr key={cert.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#212121]">{cert.certificateType}</td>
                      <td className="px-6 py-4 text-[#616161]">{cert.vendor}</td>
                      <td className="px-6 py-4 text-[#616161]">{cert.issuedDate}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            cert.daysToExpiry > 180 ? 'text-[#10B981]' :
                            cert.daysToExpiry > 90 ? 'text-[#F59E0B]' :
                            cert.daysToExpiry > 0 ? 'text-[#EF4444]' :
                            'text-[#991B1B]'
                          }`}
                        >
                          {cert.expiryDate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {cert.status === 'Valid' && <CheckCircle className="w-3 h-3" />}
                          {cert.status === 'Expired' && <XCircle className="w-3 h-3" />}
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              try {
                                const today = new Date().toISOString().split('T')[0];
                                const csvData: (string | number)[][] = [
                                  ['Certificate Report', `Date: ${today}`],
                                  [''],
                                  ['Certificate Information'],
                                  ['Certificate Type', cert.certificateType],
                                  ['Vendor', cert.vendor],
                                  ['Issued Date', cert.issuedDate],
                                  ['Expiry Date', cert.expiryDate],
                                  ['Status', cert.status],
                                  ['Days to Expiry', cert.daysToExpiry],
                                  ['License Number', cert.licenseNumber || 'N/A'],
                                ];
                                exportToCSV(csvData, `certificate-${cert.certificateType}-${today}`);
                                toast.success('Certificate report downloaded');
                              } catch (error) {
                                toast.error('Failed to download certificate');
                              }
                            }}
                            className="text-xs text-[#4F46E5] hover:underline"
                          >
                            Download
                          </button>
                          {cert.status === 'Expired' && (
                            <button className="text-xs text-[#4F46E5] hover:underline">Upload</button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCertificate(cert);
                              setShowCertificateModal(true);
                            }}
                            className="px-3 py-1.5 bg-[#4F46E5] text-white text-xs font-medium rounded-md hover:bg-[#4338CA]"
                          >
                            Verify
                          </button>
                          {cert.status === 'Expired' && (
                            <button
                              onClick={() => renewCertificate(cert.id)}
                              className="px-3 py-1.5 bg-[#EF4444] text-white text-xs font-medium rounded-md hover:bg-[#DC2626]"
                            >
                              {loadingIds[cert.id] ? 'Scheduling...' : 'Renew'}
                            </button>
                          )}
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

      {activeTab === 'temp' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Shipment ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Product</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Requirement</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Avg Temperature</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Min/Max</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {temps.map((temp) => (
                  <tr key={temp.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-mono text-[#616161]">{temp.shipmentId}</td>
                    <td className="px-6 py-4 font-medium text-[#212121]">{temp.product}</td>
                    <td className="px-6 py-4 text-[#616161]">{temp.vendor}</td>
                    <td className="px-6 py-4 font-mono text-[#616161]">{temp.requirement}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${temp.compliant ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {temp.avgTemp}°C
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#616161]">
                      {temp.minTemp}°C / {temp.maxTemp}°C
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                          temp.compliant
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}
                      >
                        {temp.compliant ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Compliant
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Non-compliant
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTemp(temp);
                          setShowTempReportModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563]"
                      >
                        {temp.compliant ? 'Details' : 'Report'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#F5F7FA] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Vendor</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Overall Rating</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">QC Pass Rate</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Compliance Score</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Audit Score</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Trend</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {ratings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#212121]">{rating.vendor}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(rating.overallRating)}
                        </div>
                        <span className="font-bold" style={{ color: getRatingColor(rating.overallRating) }}>
                          {rating.overallRating.toFixed(1)}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          rating.qcPassRate >= 95 ? 'text-[#10B981]' :
                          rating.qcPassRate >= 85 ? 'text-[#0EA5E9]' :
                          rating.qcPassRate >= 75 ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}
                      >
                        {rating.qcPassRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          rating.complianceScore >= 90 ? 'text-[#10B981]' :
                          rating.complianceScore >= 80 ? 'text-[#0EA5E9]' :
                          rating.complianceScore >= 70 ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}
                      >
                        {rating.complianceScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-bold ${
                          rating.auditScore >= 90 ? 'text-[#10B981]' :
                          rating.auditScore >= 80 ? 'text-[#0EA5E9]' :
                          rating.auditScore >= 70 ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}
                      >
                        {rating.auditScore}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {rating.trend === 'up' && (
                          <>
                            <TrendingUp className="w-4 h-4 text-[#10B981]" />
                            <span className="text-xs text-[#10B981]">Improving</span>
                          </>
                        )}
                        {rating.trend === 'down' && (
                          <>
                            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                            <span className="text-xs text-[#EF4444]">Declining</span>
                          </>
                        )}
                        {rating.trend === 'stable' && (
                          <>
                            <Minus className="w-4 h-4 text-[#6B7280]" />
                            <span className="text-xs text-[#6B7280]">Stable</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRating(rating);
                            setShowRatingModal(true);
                          }}
                          className="px-3 py-1.5 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563]"
                        >
                          History
                        </button>
                        {rating.trend === 'down' && (
                          <button
                            onClick={() => alertVendor(rating.vendor)}
                            className="px-3 py-1.5 bg-[#EF4444] text-white text-xs font-medium rounded-md hover:bg-[#DC2626]"
                          >
                            {loadingIds[`alert-${rating.vendor}`] ? 'Sending...' : 'Alert'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: QC Check Details */}
      <Dialog open={showQCDetailModal} onOpenChange={setShowQCDetailModal}>
        <DialogContent className="max-w-[700px] p-0" aria-describedby="qc-check-details-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              QC Check Details
            </DialogTitle>
            <DialogDescription id="qc-check-details-description" className="text-sm text-[#6B7280]">
              {selectedCheck?.checkId} | {selectedCheck?.product} | {selectedCheck?.batchId}
            </DialogDescription>
          </DialogHeader>

          {selectedCheck && (
            <div className="px-6 py-6 space-y-6">
              {/* Check Information */}
              <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-lg">
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Check ID</p>
                  <p className="text-sm font-mono text-[#1F2937]">{selectedCheck.checkId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Batch ID</p>
                  <p className="text-sm font-mono text-[#1F2937]">{selectedCheck.batchId}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Product</p>
                  <p className="text-sm font-medium text-[#1F2937]">{selectedCheck.product}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Vendor</p>
                  <p className="text-sm text-[#1F2937]">{selectedCheck.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Inspector</p>
                  <p className="text-sm text-[#1F2937]">{selectedCheck.inspector || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Check Date</p>
                  <p className="text-sm text-[#1F2937]">Dec 19, 2024, 2:30 PM</p>
                </div>
              </div>

              {/* Check Details */}
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <h3 className="text-sm font-bold text-[#1F2937] mb-3">Check Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Check Type:</span>
                    <span className="font-medium text-[#1F2937]">{selectedCheck.checkType} Compliance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Method:</span>
                    <span className="text-[#1F2937]">Digital Thermometer</span>
                  </div>
                  {selectedCheck.requirement && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Standard/Requirement:</span>
                      <span className="font-mono text-[#1F2937]">{selectedCheck.requirement}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Result:</span>
                    <span className={`font-bold ${selectedCheck.result === 'Pass' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {selectedCheck.result}
                    </span>
                  </div>
                  {selectedCheck.actualReading && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Actual Reading:</span>
                      <span className="font-bold text-[#EF4444]">{selectedCheck.actualReading}</span>
                    </div>
                  )}
                  {selectedCheck.severity && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Severity:</span>
                      <span className="font-bold text-[#EF4444]">{selectedCheck.severity}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedCheck.result === 'Fail' && (
                <div className="bg-[#FEE2E2] border-l-4 border-[#EF4444] p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-[#991B1B] mb-2">Failure Details</h3>
                  <div className="text-sm text-[#6B7280] space-y-1">
                    <p><span className="font-medium">Reason:</span> Storage temperature exceeded acceptable range</p>
                    <p><span className="font-medium">Impact:</span> Product quality compromise</p>
                    <p><span className="font-medium">Recommendation:</span> Reject batch / Return to vendor</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            {selectedCheck && selectedCheck.status !== 'Approved' && selectedCheck.result === 'Pass' && (
              <button
                onClick={() => selectedCheck && approveCheck(selectedCheck.id)}
                className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669]"
              >
                {selectedCheck && loadingIds[selectedCheck.id] ? 'Processing...' : 'Approve'}
              </button>
            )}
            {selectedCheck && selectedCheck.result === 'Fail' && (
              <>
                <button
                  onClick={() => selectedCheck && appealCheck(selectedCheck.id)}
                  className="px-6 py-2.5 bg-[#0EA5E9] text-white text-sm font-medium rounded-md hover:bg-[#0284C7]"
                >
                  {selectedCheck && loadingIds[selectedCheck.id] ? 'Submitting...' : 'Appeal'}
                </button>
                <button
                  onClick={() => selectedCheck && rejectCheck(selectedCheck.id)}
                  className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626]"
                >
                  {selectedCheck && loadingIds[selectedCheck.id] ? 'Processing...' : 'Reject'}
                </button>
              </>
            )}
            <button
              onClick={exportQCCheckReport}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => setShowQCDetailModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Vendor Audit Log */}
      <Dialog open={showAuditLogModal} onOpenChange={setShowAuditLogModal}>
        <DialogContent className="max-w-[750px] max-h-[90vh] overflow-y-auto p-0" aria-describedby="vendor-audit-history-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Vendor Audit History
            </DialogTitle>
            <DialogDescription id="vendor-audit-history-description" className="text-sm text-[#6B7280]">
              {selectedAudit?.vendor}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Total Audits</p>
                <p className="text-2xl font-bold text-[#1F2937]">24</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Average Score</p>
                <p className="text-2xl font-bold text-[#10B981]">88.5/100</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Last Audit</p>
                <p className="text-sm font-bold text-[#1F2937]">Dec 15, 2024</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Next Due</p>
                <p className="text-sm font-bold text-[#1F2937]">Jan 15, 2025</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <p className="text-xs text-[#6B7280] mb-1">Status</p>
                <p className="text-sm font-bold text-[#10B981]">Good Standing</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] mb-3">Audit Timeline (Last 12 months)</h3>
              <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F7FA] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#6B7280]">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#6B7280]">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#6B7280]">Score</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#6B7280]">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    <tr>
                      <td className="px-4 py-2 text-[#6B7280]">Dec 15</td>
                      <td className="px-4 py-2 text-[#0EA5E9]">Routine</td>
                      <td className="px-4 py-2 font-bold text-[#1F2937]">88/100</td>
                      <td className="px-4 py-2 text-[#10B981]">Pass ✓</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-[#6B7280]">Nov 12</td>
                      <td className="px-4 py-2 text-[#0EA5E9]">Routine</td>
                      <td className="px-4 py-2 font-bold text-[#1F2937]">85/100</td>
                      <td className="px-4 py-2 text-[#10B981]">Pass ✓</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-[#6B7280]">Oct 18</td>
                      <td className="px-4 py-2 text-[#F59E0B]">Follow-up</td>
                      <td className="px-4 py-2 font-bold text-[#1F2937]">82/100</td>
                      <td className="px-4 py-2 text-[#10B981]">Pass ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => scheduleAudit()}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA]"
            >
              Schedule Audit
            </button>
            <button
              onClick={exportAuditReport}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => setShowAuditLogModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 3: Certificate Details */}
      <Dialog open={showCertificateModal} onOpenChange={setShowCertificateModal}>
        <DialogContent className="max-w-[650px] p-0" aria-describedby="certificate-details-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Certificate Details
            </DialogTitle>
            <DialogDescription id="certificate-details-description" className="text-sm text-[#6B7280]">
              {selectedCertificate?.certificateType} - {selectedCertificate?.vendor}
            </DialogDescription>
          </DialogHeader>

          {selectedCertificate && (
            <div className="px-6 py-6 space-y-6">
              <div className="bg-[#F9FAFB] p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Certificate Type</p>
                    <p className="text-sm font-medium text-[#1F2937]">{selectedCertificate.certificateType}</p>
                  </div>
                  {selectedCertificate.licenseNumber && (
                    <div>
                      <p className="text-xs text-[#6B7280] mb-1">License Number</p>
                      <p className="text-sm font-mono text-[#1F2937]">{selectedCertificate.licenseNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Issued Date</p>
                    <p className="text-sm text-[#1F2937]">{selectedCertificate.issuedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Expiry Date</p>
                    <p className={`text-sm font-bold ${
                      selectedCertificate.daysToExpiry > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                    }`}>
                      {selectedCertificate.expiryDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Days until expiry</p>
                    <p className={`text-sm font-bold ${
                      selectedCertificate.daysToExpiry > 180 ? 'text-[#10B981]' :
                      selectedCertificate.daysToExpiry > 0 ? 'text-[#F59E0B]' :
                      'text-[#EF4444]'
                    }`}>
                      {selectedCertificate.daysToExpiry > 0 ? `${selectedCertificate.daysToExpiry} days` : 'Expired'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Status</p>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{
                        backgroundColor: getCertificateColor(selectedCertificate.status).bg,
                        color: getCertificateColor(selectedCertificate.status).text
                      }}
                    >
                      {selectedCertificate.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <h3 className="text-sm font-bold text-[#1F2937] mb-2">Scope</h3>
                <div className="text-sm text-[#6B7280] space-y-1">
                  <p><span className="font-medium">Food Categories:</span> Vegetables, Fruits</p>
                  <p><span className="font-medium">Trading Type:</span> Wholesale / Retail</p>
                  <p><span className="font-medium">Approval Status:</span> Approved</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => selectedCertificate && verifyCertificate(selectedCertificate.id)}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA]"
            >
              {selectedCertificate && loadingIds[selectedCertificate.id] ? 'Verifying...' : 'Verify Certificate'}
            </button>
            {selectedCertificate?.status === 'Expired' && (
              <button
                onClick={() => selectedCertificate && renewCertificate(selectedCertificate.id)}
                className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669]"
              >
                {selectedCertificate && loadingIds[selectedCertificate.id] ? 'Scheduling...' : 'Schedule Renewal'}
              </button>
            )}
            <button
              onClick={exportCertificate}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={() => setShowCertificateModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Temperature Compliance Report */}
      <Dialog open={showTempReportModal} onOpenChange={setShowTempReportModal}>
        <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto p-0" aria-describedby="temp-compliance-report-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Temperature Compliance Report
            </DialogTitle>
            <DialogDescription id="temp-compliance-report-description" className="text-sm text-[#6B7280]">
              Shipment {selectedTemp?.shipmentId}
            </DialogDescription>
          </DialogHeader>

          {selectedTemp && (
            <div className="px-6 py-6 space-y-6">
              {/* Summary */}
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <h3 className="text-sm font-bold text-[#1F2937] mb-3">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#6B7280]">Product:</p>
                    <p className="font-medium text-[#1F2937]">{selectedTemp.product}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Vendor:</p>
                    <p className="font-medium text-[#1F2937]">{selectedTemp.vendor}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Requirement:</p>
                    <p className="font-mono text-[#1F2937]">{selectedTemp.requirement}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7280]">Duration:</p>
                    <p className="text-[#1F2937]">48 hours</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[#6B7280] mb-2">Status:</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                        selectedTemp.compliant
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      {selectedTemp.compliant ? 'PASSED ✓' : 'FAILED ✗'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Graph Placeholder */}
              <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">
                <ThermometerSun className="w-12 h-12 text-[#9CA3AF] mx-auto mb-2" />
                <p className="text-sm text-[#6B7280]">Temperature Graph</p>
                <p className="text-xs text-[#9CA3AF]">Line chart showing temperature over time</p>
              </div>

              {/* Timeline */}
              {!selectedTemp.compliant && (
                <div className="bg-[#FEE2E2] border-l-4 border-[#EF4444] p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-[#991B1B] mb-3">Impact Assessment</h3>
                  <div className="text-sm text-[#6B7280] space-y-1">
                    <p><span className="font-medium">Violation Duration:</span> 1.5 hours</p>
                    <p><span className="font-medium">Peak Temperature:</span> {selectedTemp.maxTemp}°C</p>
                    <p><span className="font-medium">Product Risk:</span> Medium to High</p>
                    <p><span className="font-medium">Recommendation:</span> Reject batch</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            {!selectedTemp?.compliant && (
              <>
                <button
                  onClick={() => {
                    toast.success('Batch approved with justification');
                    setShowTempReportModal(false);
                  }}
                  className="px-6 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-md hover:bg-[#059669]"
                >
                  Approve Anyway
                </button>
                <button
                  onClick={() => {
                    toast.success('Batch rejected');
                    setShowTempReportModal(false);
                  }}
                  className="px-6 py-2.5 bg-[#EF4444] text-white text-sm font-medium rounded-md hover:bg-[#DC2626]"
                >
                  Reject
                </button>
              </>
            )}
            <button
              onClick={exportSampleTestReport}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => setShowTempReportModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Quality Rating Details */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto p-0" aria-describedby="quality-rating-details-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">
              Quality Rating Details
            </DialogTitle>
            <DialogDescription id="quality-rating-details-description" className="text-sm text-[#6B7280]">
              {selectedRating?.vendor}
            </DialogDescription>
          </DialogHeader>

          {selectedRating && (
            <div className="px-6 py-6 space-y-6">
              {/* Overall Rating */}
              <div className="bg-[#F9FAFB] p-6 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {renderStars(selectedRating.overallRating)}
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: getRatingColor(selectedRating.overallRating) }}>
                  {selectedRating.overallRating.toFixed(1)}/5
                </p>
                <p className="text-sm text-[#6B7280]">Overall Rating</p>
                <p className="text-xs text-[#9CA3AF]">Based on: Last 6 months (180 days)</p>
              </div>

              {/* Rating Breakdown */}
              <div>
                <h3 className="text-sm font-bold text-[#1F2937] mb-3">Rating Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">QC Pass Rate (Weight: 40%)</span>
                      <span className="font-bold text-[#1F2937]">{selectedRating.qcPassRate}%</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${selectedRating.qcPassRate}%`,
                          backgroundColor: selectedRating.qcPassRate >= 95 ? '#10B981' :
                            selectedRating.qcPassRate >= 85 ? '#0EA5E9' :
                            selectedRating.qcPassRate >= 75 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">Compliance Score (Weight: 30%)</span>
                      <span className="font-bold text-[#1F2937]">{selectedRating.complianceScore}/100</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${selectedRating.complianceScore}%`,
                          backgroundColor: selectedRating.complianceScore >= 90 ? '#10B981' :
                            selectedRating.complianceScore >= 80 ? '#0EA5E9' :
                            selectedRating.complianceScore >= 70 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#6B7280]">Audit Score (Weight: 20%)</span>
                      <span className="font-bold text-[#1F2937]">{selectedRating.auditScore}/100</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${selectedRating.auditScore}%`,
                          backgroundColor: selectedRating.auditScore >= 90 ? '#10B981' :
                            selectedRating.auditScore >= 80 ? '#0EA5E9' :
                            selectedRating.auditScore >= 70 ? '#F59E0B' : '#EF4444'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend */}
              <div className="bg-[#F9FAFB] p-4 rounded-lg">
                <h3 className="text-sm font-bold text-[#1F2937] mb-2">6-Month Trend</h3>
                <div className="flex items-center gap-2">
                  {selectedRating.trend === 'up' && (
                    <>
                      <TrendingUp className="w-5 h-5 text-[#10B981]" />
                      <span className="text-sm font-bold text-[#10B981]">Improving</span>
                      <span className="text-sm text-[#6B7280]">(+0.3 from last month)</span>
                    </>
                  )}
                  {selectedRating.trend === 'down' && (
                    <>
                      <TrendingDown className="w-5 h-5 text-[#EF4444]" />
                      <span className="text-sm font-bold text-[#EF4444]">Declining</span>
                      <span className="text-sm text-[#6B7280]">(-0.5 from last month)</span>
                    </>
                  )}
                  {selectedRating.trend === 'stable' && (
                    <>
                      <Minus className="w-5 h-5 text-[#6B7280]" />
                      <span className="text-sm font-bold text-[#6B7280]">Stable</span>
                      <span className="text-sm text-[#6B7280]">(No change)</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => toast.success('Viewing full history')}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563]"
            >
              View History
            </button>
            <button
              onClick={exportRejectionReport}
              className="px-6 py-2.5 bg-[#6B7280] text-white text-sm font-medium rounded-md hover:bg-[#4B5563] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => setShowRatingModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
