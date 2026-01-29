import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, 
  FileCheck, 
  AlertCircle, 
  Search, 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  MoreVertical,
  Clock,
  Shield,
  FileText,
  Eye,
  Bell,
  Check,
  Upload,
  File,
  Star,
  StickyNote,
  User,
  History,
  Calendar,
  MessageSquare,
  Flag,
  Edit,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF } from '../../../utils/pdfExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';

import * as vendorManagementApi from '../../../api/vendor/vendorManagement.api';

// Types
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Farmer' | 'Distributor' | 'Aggregator' | 'Third-party';
  category: string;
  submissionDate: string;
  stage: VendorStage;
  docsStatus: 'ok' | 'missing' | 'incomplete';
  registrationDate: string;
  daysInStage: number;
  documents: Document[];
  activityLog: Activity[];
  tier?: 'Gold' | 'Silver' | 'Bronze';
  contractSigned?: boolean;
  contractId?: string;
}

type VendorStage = 
  | 'new_request' 
  | 'kyc_verification' 
  | 'docs_verification' 
  | 'review_pending' 
  | 'contract' 
  | 'tier_assignment' 
  | 'approved' 
  | 'rejected';

interface Document {
  name: string;
  status: 'verified' | 'missing' | 'pending';
  uploadedAt?: string;
}

interface Activity {
  action: string;
  user: string;
  timestamp: string;
}

type ModalType = 
  | 'invite' 
  | 'approve' 
  | 'reject' 
  | 'nudge' 
  | 'review' 
  | 'reRequestDocs' 
  | 'viewContract' 
  | 'assignTier' 
  | 'addNote' 
  | 'downloadDocs'
  | 'activityLog'
  | 'scheduleMeeting'
  | 'sendMessage'
  | 'flagVendor'
  | 'editInfo'
  | null;


// Persistence & multi-tab sync
const VENDORS_STORAGE_KEY = 'vendors_v1';
const VENDORS_BROADCAST_CHANNEL = 'vendors_channel_v1';

function persistVendorsToStorage(list: Vendor[]) {
  try {
    localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(list));
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel(VENDORS_BROADCAST_CHANNEL);
        bc.postMessage({ type: 'vendors:sync', payload: { timestamp: Date.now() } });
        bc.close();
      } else {
        // storage ping fallback
        localStorage.setItem('__vendors_ping__', JSON.stringify({ t: Date.now() }));
      }
    } catch (e) {
      // ignore broadcast failures
    }
  } catch (e) {
    // ignore storage failures in dev
  }
}

// Helper function to get stage badge styling
function getStageBadgeStyle(stage: VendorStage) {
  const styles = {
    new_request: { bg: '#EFF6FF', text: '#1E40AF', label: 'New Request' },
    kyc_verification: { bg: '#FEF3C7', text: '#92400E', label: 'KYC Verification' },
    docs_verification: { bg: '#FEF3C7', text: '#92400E', label: 'Docs Verification' },
    review_pending: { bg: '#EFF6FF', text: '#1E40AF', label: 'Review Pending' },
    contract: { bg: '#E9D5FF', text: '#6B21A8', label: 'Contract' },
    tier_assignment: { bg: '#E9D5FF', text: '#6B21A8', label: 'Tier Assignment' },
    approved: { bg: '#DCFCE7', text: '#166534', label: 'Approved' },
    rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' }
  };
  return styles[stage];
}

export function VendorOnboarding() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingVendors(true);
        const resp = await vendorManagementApi.listVendors({ page: 1, pageSize: 25 });
        if (!mounted) return;
        // API returns { meta, data } or VendorList directly
        const items = resp.data || resp.items || resp;
        if (Array.isArray(items)) setVendors(items);
      } catch (err) {
        console.error('Failed to load vendors', err);
        toast.error('Failed to load vendors');
      } finally {
        setLoadingVendors(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<VendorStage | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalVendor, setModalVendor] = useState<Vendor | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [dropdownDirection, setDropdownDirection] = useState<{ [key: string]: 'up' | 'down' }>({});

  const downloadDocument = (doc: Document, vendor: Vendor) => {
    try {
      const htmlContent = `
        <h1>Vendor Document</h1>
        <h2>${doc.name}</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
          <tr><th style="text-align:left;">Field</th><th style="text-align:left;">Value</th></tr>
          <tr><td>Document Name</td><td>${doc.name}</td></tr>
          <tr><td>Status</td><td>${doc.status}</td></tr>
          <tr><td>Vendor</td><td>${vendor.name}</td></tr>
          <tr><td>Vendor ID</td><td>${vendor.id}</td></tr>
          <tr><td>Type</td><td>${vendor.type}</td></tr>
          <tr><td>Category</td><td>${vendor.category}</td></tr>
        </table>
        <p style="margin-top:20px; font-size:12px; color:#666;">
          Generated on ${new Date().toLocaleString()}
        </p>
      `;
      exportToPDF(htmlContent, `${doc.name}-${vendor.id}`);
      toast.success(`Download started: ${doc.name}`);
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const downloadAllDocuments = () => {
    if (!modalVendor) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const htmlContent = `
        <h1>All Vendor Documents</h1>
        <h2>${modalVendor.name} (${modalVendor.id})</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <th style="text-align:left;">Document Name</th>
            <th style="text-align:left;">Status</th>
          </tr>
          ${modalVendor.documents.map(doc => `
            <tr>
              <td>${doc.name}</td>
              <td>${doc.status}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top:20px; font-size:12px; color:#666;">
          Generated on ${new Date().toLocaleString()}
        </p>
      `;
      exportToPDF(htmlContent, `all-documents-${modalVendor.id}-${today}`);
      toast.success('Download started: All vendor documents.zip');
    } catch (error) {
      toast.error('Failed to download documents');
    }
  };

  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    type: '',
    message: ''
  });

  const [rejectForm, setRejectForm] = useState({
    reason: '',
    message: '',
    allowResubmit: false
  });

  const [approveNotes, setApproveNotes] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [nudgeForm, setNudgeForm] = useState({
    subject: 'KYC Verification Reminder - Your Application',
    message: ''
  });

  const [reRequestDocsForm, setReRequestDocsForm] = useState({
    documents: [] as string[],
    message: '',
    deadline: ''
  });

  const [assignTierForm, setAssignTierForm] = useState({
    tier: '' as 'Gold' | 'Silver' | 'Bronze' | '',
    notes: ''
  });

  const [addNoteForm, setAddNoteForm] = useState({
    note: '',
    visibleToAll: true
  });

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || vendor.stage === stageFilter;
    const matchesType = typeFilter === 'all' || vendor.type === typeFilter;
    
    return matchesSearch && matchesStage && matchesType;
  });

  // Count vendors in each stage
  const stageCounts = {
    new_request: vendors.filter(v => v.stage === 'new_request').length,
    kyc_verification: vendors.filter(v => v.stage === 'kyc_verification').length,
    docs_verification: vendors.filter(v => v.stage === 'docs_verification').length,
    review_pending: vendors.filter(v => v.stage === 'review_pending').length,
    contract: vendors.filter(v => v.stage === 'contract').length,
    tier_assignment: vendors.filter(v => v.stage === 'tier_assignment').length,
    approved: vendors.filter(v => v.stage === 'approved').length,
    rejected: vendors.filter(v => v.stage === 'rejected').length
  };

  // Smart dropdown positioning
  useEffect(() => {
    if (!showMoreMenu) return;

    const calculatePosition = () => {
      const menuButton = menuRefs.current[showMoreMenu];
      if (!menuButton) return;

      const rect = menuButton.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const DROPDOWN_HEIGHT = 250; // Approximate height
      const FLIP_THRESHOLD = 150;

      let direction: 'up' | 'down' = 'down';
      
      if (spaceBelow < DROPDOWN_HEIGHT && spaceAbove > FLIP_THRESHOLD) {
        direction = 'up';
      }

      setDropdownDirection(prev => ({ ...prev, [showMoreMenu]: direction }));
    };

    calculatePosition();
    
    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showMoreMenu]);

  // Init from storage and setup multi-tab sync
  useEffect(() => {
    // load from storage if present
    try {
      const raw = localStorage.getItem(VENDORS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVendors(parsed);
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    // BroadcastChannel listener
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel(VENDORS_BROADCAST_CHANNEL);
        bc.onmessage = () => {
          try {
            const raw = localStorage.getItem(VENDORS_STORAGE_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) setVendors(parsed);
            }
          } catch (e) {
            // ignore
          }
        };
      }
    } catch (e) {
      bc = null;
    }

    // storage event fallback for other tabs
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === VENDORS_STORAGE_KEY || ev.key === '__vendors_ping__') {
        try {
          const raw = localStorage.getItem(VENDORS_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setVendors(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      try {
        if (bc) bc.close();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Event handlers
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation (HTML required exists but extra check for UX)
    if (!inviteForm.email || !inviteForm.name) {
      toast.error('Please provide vendor name and email');
      return;
    }

    // optimistic add
    const newVendor: Vendor = {
      id: `VND-${Date.now().toString().slice(-6)}`,
      name: inviteForm.name,
      email: inviteForm.email,
      phone: '',
      type: (inviteForm.type as any) || ('Third-party' as Vendor['type']),
      category: 'Uncategorized',
      submissionDate: new Date().toLocaleDateString(),
      stage: 'new_request',
      docsStatus: 'pending' as any,
      registrationDate: new Date().toLocaleDateString(),
      daysInStage: 0,
      documents: [],
      activityLog: [{ action: 'Invite sent', user: 'Admin', timestamp: new Date().toLocaleString() }]
    };

    // update UI immediately
    setVendors((prev) => {
      const next = [newVendor, ...prev];
      // persist immediately so other tabs see it
      persistVendorsToStorage(next);
      return next;
    });

    setActiveModal(null);
    setInviteForm({ email: '', name: '', type: '', message: '' });
    toast.success(`Invite sent to ${newVendor.email}`);

    // simulate remote call with small chance of failure -> rollback
    setTimeout(() => {
      if (Math.random() < 0.05) {
        // rollback
        setVendors((prev) => {
          const next = prev.filter((v) => v.id !== newVendor.id);
          persistVendorsToStorage(next);
          return next;
        });
        toast.error(`Failed to send invite to ${newVendor.email}. Retrying recommended.`);
      } else {
        // mark as persisted (already persisted above)
        // optionally notify other tabs (already done by persist)
      }
    }, 900);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalVendor) return;
    // simulate network latency and show loading state
    setApproveLoading(true);
    setTimeout(() => {
      const updatedVendors = vendors.map(v =>
        v.id === modalVendor.id
          ? { ...v, stage: 'contract' as VendorStage, daysInStage: 0 }
          : v
      );
      setVendors(updatedVendors);
      // persist and notify other tabs
      persistVendorsToStorage(updatedVendors);
      const updatedSelected = updatedVendors.find(v => v.id === modalVendor.id) || null;
      if (updatedSelected) {
        updatedSelected.activityLog = [
          ...(updatedSelected.activityLog || []),
          { action: 'Approved', user: 'Admin', timestamp: new Date().toLocaleString() }
        ];
      }
      setSelectedVendor(updatedSelected);
      setActiveModal(null);
      setModalVendor(null);
      setApproveNotes('');
      setApproveLoading(false);
      toast.success(`${modalVendor.name} approved — moved to Contract`);
    }, 900);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalVendor) return;
    setRejectLoading(true);
    setTimeout(() => {
      const updatedVendors = vendors.map(v =>
        v.id === modalVendor.id
          ? { ...v, stage: 'rejected' as VendorStage }
          : v
      );
      setVendors(updatedVendors);
      // persist and notify other tabs
      persistVendorsToStorage(updatedVendors);
      const updatedSelected = updatedVendors.find(v => v.id === modalVendor.id) || null;
      if (updatedSelected) {
        updatedSelected.activityLog = [
          ...(updatedSelected.activityLog || []),
          { action: 'Rejected', user: 'Admin', timestamp: new Date().toLocaleString() }
        ];
      }
      setSelectedVendor(updatedSelected);
      setActiveModal(null);
      setModalVendor(null);
      setRejectForm({ reason: '', message: '', allowResubmit: false });
      setRejectLoading(false);
      toast.error(`${modalVendor.name} has been rejected`);
    }, 900);
  };

  const handleNudge = (e: React.FormEvent) => {
    e.preventDefault();
    // Nudge vendor action - API call would go here
    setActiveModal(null);
    setNudgeForm({ subject: 'KYC Verification Reminder - Your Application', message: '' });
  };

  const handleReRequestDocs = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-request docs action - API call would go here
    setActiveModal(null);
    setReRequestDocsForm({ documents: [], message: '', deadline: '' });
  };

  const handleAssignTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalVendor || !assignTierForm.tier) return;
    
    const updatedVendors = vendors.map(v => 
      v.id === modalVendor.id 
        ? { ...v, tier: assignTierForm.tier, stage: 'approved' as VendorStage }
        : v
    );
    setVendors(updatedVendors);
    persistVendorsToStorage(updatedVendors);
    setActiveModal(null);
    setAssignTierForm({ tier: '', notes: '' });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    // Add note action - API call would go here
    setActiveModal(null);
    setAddNoteForm({ note: '', visibleToAll: true });
  };

  const handleReviewClick = (vendor: Vendor) => {
    setModalVendor(vendor);
    setActiveModal('review');
  };

  // Get action buttons based on vendor stage
  const getActionButtons = (vendor: Vendor) => {
    const buttons: JSX.Element[] = [];

    // Review button - for review_pending or docs_verification
    if (vendor.stage === 'review_pending' || vendor.stage === 'docs_verification') {
      buttons.push(
        <button
          key="review"
          onClick={() => handleReviewClick(vendor)}
          className="px-4 py-2 bg-[#4F46E5] text-white text-xs font-medium rounded-md hover:bg-[#4338CA] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Eye className="w-3 h-3 inline mr-1" />
          Review
        </button>
      );
    }

    // Nudge button - for kyc_verification or docs_verification (pending >3 days)
    if ((vendor.stage === 'kyc_verification' || vendor.stage === 'docs_verification') && vendor.daysInStage >= 3) {
      buttons.push(
        <button
          key="nudge"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('nudge');
          }}
          className="px-4 py-2 bg-[#F59E0B] text-white text-xs font-medium rounded-md hover:bg-[#D97706] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Bell className="w-3 h-3 inline mr-1" />
          Nudge
        </button>
      );
    }

    // Approve button - for review_pending with all docs verified
    if (vendor.stage === 'review_pending' && vendor.docsStatus === 'ok') {
      buttons.push(
        <button
          key="approve"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('approve');
          }}
          className="px-4 py-2 bg-[#10B981] text-white text-xs font-medium rounded-md hover:bg-[#059669] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Check className="w-3 h-3 inline mr-1" />
          Approve
        </button>
      );
    }

    // Reject button - for review_pending or kyc_verification
    if (vendor.stage === 'review_pending' || vendor.stage === 'kyc_verification') {
      buttons.push(
        <button
          key="reject"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('reject');
          }}
          className="px-4 py-2 bg-[#EF4444] text-white text-xs font-medium rounded-md hover:bg-[#DC2626] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <X className="w-3 h-3 inline mr-1" />
          Reject
        </button>
      );
    }

    // Re-Request Docs button - for docs_verification with incomplete docs
    if (vendor.stage === 'docs_verification' && vendor.docsStatus === 'incomplete') {
      buttons.push(
        <button
          key="reRequestDocs"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('reRequestDocs');
          }}
          className="px-4 py-2 bg-[#F97316] text-white text-xs font-medium rounded-md hover:bg-[#EA580C] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Upload className="w-3 h-3 inline mr-1" />
          Re-Request
        </button>
      );
    }

    // View Contract button - for contract, tier_assignment, or approved
    if (vendor.stage === 'contract' || vendor.stage === 'tier_assignment' || vendor.stage === 'approved') {
      buttons.push(
        <button
          key="viewContract"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('viewContract');
          }}
          className="px-4 py-2 bg-[#6B7280] text-white text-xs font-medium rounded-md hover:bg-[#4B5563] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <File className="w-3 h-3 inline mr-1" />
          Contract
        </button>
      );
    }

    // Assign Tier button - for contract with signed contract
    if (vendor.stage === 'contract' && vendor.contractSigned) {
      buttons.push(
        <button
          key="assignTier"
          onClick={() => {
            setModalVendor(vendor);
            setActiveModal('assignTier');
          }}
          className="px-4 py-2 bg-[#7C3AED] text-white text-xs font-medium rounded-md hover:bg-[#6D28D9] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <Star className="w-3 h-3 inline mr-1" />
          Assign Tier
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Onboarding"
        subtitle="Manage vendor applications and approvals"
        actions={
          <button
            onClick={() => setActiveModal('invite')}
            className="px-4 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Vendor
          </button>
        }
      />

      {/* Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStageFilter(stageFilter === 'review_pending' ? 'all' : 'review_pending')}
          className={`bg-white p-4 rounded-xl border-l-4 border-[#4F46E5] cursor-pointer transition-all hover:shadow-md ${stageFilter === 'review_pending' ? 'ring-2 ring-[#4F46E5]' : 'border border-[#E0E0E0]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase mb-1">Review Pending</p>
              <h3 className="text-2xl font-bold text-[#1F2937]">{stageCounts.review_pending}</h3>
            </div>
            <div className="p-2 bg-[#EFF6FF] text-[#4F46E5] rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStageFilter(stageFilter === 'docs_verification' ? 'all' : 'docs_verification')}
          className={`bg-white p-4 rounded-xl border-l-4 border-[#F59E0B] cursor-pointer transition-all hover:shadow-md ${stageFilter === 'docs_verification' ? 'ring-2 ring-[#F59E0B]' : 'border border-[#E0E0E0]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase mb-1">Docs Verification</p>
              <h3 className="text-2xl font-bold text-[#1F2937]">{stageCounts.docs_verification}</h3>
            </div>
            <div className="p-2 bg-[#FEF3C7] text-[#F59E0B] rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStageFilter(stageFilter === 'contract' ? 'all' : 'contract')}
          className={`bg-white p-4 rounded-xl border-l-4 border-[#7C3AED] cursor-pointer transition-all hover:shadow-md ${stageFilter === 'contract' ? 'ring-2 ring-[#7C3AED]' : 'border border-[#E0E0E0]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase mb-1">Contract</p>
              <h3 className="text-2xl font-bold text-[#1F2937]">{stageCounts.contract}</h3>
            </div>
            <div className="p-2 bg-[#E9D5FF] text-[#7C3AED] rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => setStageFilter(stageFilter === 'approved' ? 'all' : 'approved')}
          className={`bg-white p-4 rounded-xl border-l-4 border-[#10B981] cursor-pointer transition-all hover:shadow-md ${stageFilter === 'approved' ? 'ring-2 ring-[#10B981]' : 'border border-[#E0E0E0]'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9CA3AF] uppercase mb-1">Approved</p>
              <h3 className="text-2xl font-bold text-[#1F2937]">{stageCounts.approved}</h3>
            </div>
            <div className="p-2 bg-[#DCFCE7] text-[#10B981] rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-3 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 border border-[#D1D5DB] rounded-lg text-sm bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
        >
          <option value="all">All Types</option>
          <option value="Farmer">Farmer</option>
          <option value="Distributor">Distributor</option>
          <option value="Aggregator">Aggregator</option>
          <option value="Third-party">Third-party</option>
        </select>
      </div>

      {/* Vendor Queue Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-2 py-3 text-center text-xs font-bold text-[#6B7280] uppercase tracking-wider w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredVendors.map((vendor) => {
                const stageBadge = getStageBadgeStyle(vendor.stage);
                return (
                  <tr 
                    key={vendor.id} 
                    onClick={() => setSelectedVendor(vendor)}
                    className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#1F2937]">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {vendor.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {vendor.submissionDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span 
                        className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium"
                        style={{ backgroundColor: stageBadge.bg, color: stageBadge.text }}
                      >
                        {stageBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vendor.docsStatus === 'ok' && (
                        <div className="flex items-center justify-center gap-1 text-[#10B981]">
                          <CheckCircle size={14} />
                          <span className="text-xs font-medium">OK</span>
                        </div>
                      )}
                      {vendor.docsStatus === 'missing' && (
                        <div className="flex items-center justify-center gap-1 text-[#EF4444]">
                          <XCircle size={14} />
                          <span className="text-xs font-medium">Missing</span>
                        </div>
                      )}
                      {vendor.docsStatus === 'incomplete' && (
                        <div className="flex items-center justify-center gap-1 text-[#F59E0B]">
                          <AlertTriangle size={14} />
                          <span className="text-xs font-medium">Incomplete</span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-4 w-12">
                      <div className="flex items-center justify-center">
                        <div 
                          className="relative"
                          ref={(el) => {
                            if (el) menuRefs.current[vendor.id] = el;
                          }}
                        >
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMoreMenu(showMoreMenu === vendor.id ? null : vendor.id);
                            }}
                            className="p-1 hover:bg-[#F3F4F6] rounded transition-colors"
                            aria-label="Actions menu"
                            aria-expanded={showMoreMenu === vendor.id}
                          >
                            <MoreVertical size={16} className="text-[#9CA3AF]" />
                          </button>
                          
                          {/* More Options Dropdown */}
                          {showMoreMenu === vendor.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-[90]" 
                                onClick={() => setShowMoreMenu(null)}
                              />
                              <div 
                                className={`absolute right-0 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-[100] py-1 max-h-[320px] overflow-y-auto transition-all duration-200 ${
                                  dropdownDirection[vendor.id] === 'up' 
                                    ? 'bottom-full mb-2' 
                                    : 'top-full mt-2'
                                }`}
                                style={{
                                  transformOrigin: dropdownDirection[vendor.id] === 'up' ? 'bottom center' : 'top center'
                                }}
                                role="menu"
                                aria-label="Vendor actions"
                              >
                                <button 
                                  onClick={() => {
                                    setSelectedVendor(vendor);
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  View Profile
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('downloadDocs');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Download Docs
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('activityLog');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Activity Log
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('addNote');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Add Note
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('scheduleMeeting');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Schedule Meeting
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('sendMessage');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Send Message
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('flagVendor');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Flag Vendor
                                </button>
                                <button 
                                  onClick={() => {
                                    setModalVendor(vendor);
                                    setActiveModal('editInfo');
                                    setShowMoreMenu(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-[#1F2937] hover:bg-[#F9FAFB] transition-colors"
                                  role="menuitem"
                                >
                                  Edit Info
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedVendor && (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-white border-l border-[#E5E7EB] shadow-2xl z-50 overflow-y-auto animate-slide-in">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex justify-between items-center z-10">
            <h3 className="text-lg font-bold text-[#1F2937]">{selectedVendor.name}</h3>
            <button 
              onClick={() => setSelectedVendor(null)}
              className="p-1.5 hover:bg-[#F3F4F6] rounded-md transition-colors"
            >
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="p-6 space-y-6">
            {/* Vendor Info */}
            <div>
              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                Vendor Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Email:</span>
                  <span className="text-[#1F2937] font-medium">{selectedVendor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Phone:</span>
                  <span className="text-[#1F2937] font-medium">{selectedVendor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Type:</span>
                  <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E40AF] text-xs font-medium rounded">
                    {selectedVendor.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Category:</span>
                  <span className="text-[#1F2937] font-medium">{selectedVendor.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Registration:</span>
                  <span className="text-[#1F2937] font-medium">{selectedVendor.registrationDate}</span>
                </div>
                {selectedVendor.tier && (
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Tier:</span>
                    <span className="px-2 py-0.5 bg-[#E9D5FF] text-[#7C3AED] text-xs font-medium rounded flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {selectedVendor.tier}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Stage */}
            <div>
              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                Current Stage
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium"
                    style={{ 
                      backgroundColor: getStageBadgeStyle(selectedVendor.stage).bg, 
                      color: getStageBadgeStyle(selectedVendor.stage).text 
                    }}
                  >
                    {getStageBadgeStyle(selectedVendor.stage).label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Clock size={14} />
                  <span>{selectedVendor.daysInStage} days in current stage</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                Documents
              </h4>
              <div className="space-y-2">
                {selectedVendor.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#6B7280]" />
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{doc.name}</p>
                        {doc.uploadedAt && (
                          <p className="text-xs text-[#6B7280]">{doc.uploadedAt}</p>
                        )}
                      </div>
                    </div>
                    {doc.status === 'verified' && (
                      <CheckCircle size={16} className="text-[#10B981]" />
                    )}
                    {doc.status === 'pending' && (
                      <Clock size={16} className="text-[#F59E0B]" />
                    )}
                    {doc.status === 'missing' && (
                      <XCircle size={16} className="text-[#EF4444]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                Activity Log
              </h4>
              <div className="space-y-3">
                {selectedVendor.activityLog.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 bg-[#4F46E5] rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm text-[#1F2937]">{activity.action}</p>
                      <p className="text-xs text-[#6B7280]">{activity.user} • {activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button 
                onClick={() => {
                  setModalVendor(selectedVendor);
                  setActiveModal('approve');
                }}
                className="w-full px-4 py-2.5 bg-[#10B981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors"
              >
                Approve Application
              </button>
              <button 
                onClick={() => {
                  setModalVendor(selectedVendor);
                  setActiveModal('reject');
                }}
                className="w-full px-4 py-2.5 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="vendor-onboarding-modal-description">
          <DialogHeader>
            <DialogTitle>
              {activeModal === 'invite' && "Invite New Vendor"}
              {activeModal === 'approve' && "Approve Vendor"}
              {activeModal === 'reject' && "Reject Vendor"}
              {activeModal === 'nudge' && "Send Reminder"}
              {activeModal === 'review' && "Vendor Review"}
              {activeModal === 'reRequestDocs' && "Re-Request Documents"}
              {activeModal === 'viewContract' && "Contract Details"}
              {activeModal === 'assignTier' && "Assign Vendor Tier"}
              {activeModal === 'addNote' && "Add Internal Note"}
              {activeModal === 'downloadDocs' && "Download Documents"}
              {activeModal === 'activityLog' && "Activity Log"}
              {activeModal === 'scheduleMeeting' && "Schedule Meeting"}
              {activeModal === 'sendMessage' && "Send Message"}
              {activeModal === 'flagVendor' && "Flag Vendor"}
              {activeModal === 'editInfo' && "Edit Vendor Information"}
            </DialogTitle>
            <DialogDescription id="vendor-onboarding-modal-description">
              {activeModal === 'invite' && "Enter the details of the vendor you want to invite to the platform."}
              {activeModal === 'approve' && `Review the details before approving ${modalVendor?.name}.`}
              {activeModal === 'reject' && `Please provide a reason for rejecting ${modalVendor?.name}.`}
              {activeModal === 'nudge' && `Send a notification to ${modalVendor?.name} to complete their application.`}
              {activeModal === 'review' && `Complete vendor details for ${modalVendor?.name}.`}
              {activeModal === 'reRequestDocs' && `Select documents to request from ${modalVendor?.name}.`}
              {activeModal === 'viewContract' && modalVendor?.contractId}
              {activeModal === 'assignTier' && `Select a tier for ${modalVendor?.name}.`}
              {activeModal === 'addNote' && `Add an internal note for ${modalVendor?.name}.`}
              {activeModal === 'downloadDocs' && `Download all documents submitted by ${modalVendor?.name}.`}
              {activeModal === 'activityLog' && `View all activities and actions for ${modalVendor?.name}.`}
              {activeModal === 'scheduleMeeting' && `Schedule a meeting with ${modalVendor?.name}.`}
              {activeModal === 'sendMessage' && `Send a direct message to ${modalVendor?.name}.`}
              {activeModal === 'flagVendor' && `Report or flag ${modalVendor?.name} for review.`}
              {activeModal === 'editInfo' && `Update vendor information for ${modalVendor?.name}.`}
            </DialogDescription>
          </DialogHeader>

          {/* Modal 1: Invite Vendor */}
          {activeModal === 'invite' && (
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    EMAIL <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="vendor@example.com"
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    NAME <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="Vendor Name"
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    TYPE
                  </label>
                  <select
                    value={inviteForm.type}
                    onChange={(e) => setInviteForm({ ...inviteForm, type: e.target.value })}
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  >
                    <option value="">Select type</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Aggregator">Aggregator</option>
                    <option value="Third-party">Third-party</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    MESSAGE
                  </label>
                  <textarea
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                    placeholder="Welcome message (optional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Send Invite
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 2: Nudge Vendor */}
          {activeModal === 'nudge' && modalVendor && (
            <form onSubmit={handleNudge} className="space-y-4">
              <div className="space-y-4 py-2">
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-[#1E40AF] mt-0.5" />
                  <p className="text-sm text-[#1E40AF]">
                    Vendor will receive this email at <strong>{modalVendor.email}</strong>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    EMAIL SUBJECT
                  </label>
                  <input
                    type="text"
                    value={nudgeForm.subject}
                    onChange={(e) => setNudgeForm({ ...nudgeForm, subject: e.target.value })}
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    CUSTOM MESSAGE (OPTIONAL)
                  </label>
                  <textarea
                    value={nudgeForm.message}
                    onChange={(e) => setNudgeForm({ ...nudgeForm, message: e.target.value })}
                    placeholder="Add personalized message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F59E0B] text-white font-medium rounded-lg hover:bg-[#D97706] transition-colors"
                >
                  Send Reminder
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 3: Approve Vendor */}
          {activeModal === 'approve' && modalVendor && (
            <form onSubmit={handleApprove} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Vendor Name
                  </label>
                  <div className="w-full h-10 px-3 bg-[#F9FAFB] border-0 rounded-md text-sm flex items-center text-[#1F2937]">
                    {modalVendor.name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Stage Transition
                  </label>
                  <div className="text-sm text-[#6B7280]">
                    {getStageBadgeStyle(modalVendor.stage).label} → Contract
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    APPROVAL NOTES (OPTIONAL)
                  </label>
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Internal notes about approval..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]" defaultChecked />
                    <span className="text-sm text-[#1F2937]">KYC verification complete</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]" defaultChecked />
                    <span className="text-sm text-[#1F2937]">Documents verified</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]" defaultChecked />
                    <span className="text-sm text-[#1F2937]">No red flags or issues</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]" defaultChecked />
                    <span className="text-sm text-[#1F2937]">Ready to send contract</span>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveLoading}
                  className="px-6 py-2.5 bg-[#10B981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-60"
                >
                  {approveLoading ? 'Confirming...' : 'Confirm Approval'}
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 4: Reject Vendor */}
          {activeModal === 'reject' && modalVendor && (
            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    REJECTION REASON <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    required
                    value={rejectForm.reason}
                    onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm bg-white focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  >
                    <option value="">Select reason...</option>
                    <option value="incomplete">Incomplete Information</option>
                    <option value="kyc_failed">Failed KYC Verification</option>
                    <option value="invalid_docs">Documents Invalid/Expired</option>
                    <option value="compliance">Compliance Issues</option>
                    <option value="financial">Financial Concerns</option>
                    <option value="quality">Quality Concerns</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    MESSAGE TO VENDOR <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    required
                    value={rejectForm.message}
                    onChange={(e) => setRejectForm({ ...rejectForm, message: e.target.value })}
                    placeholder="Reason for rejection (will be sent via email)"
                    rows={4}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={rejectForm.allowResubmit}
                    onChange={(e) => setRejectForm({ ...rejectForm, allowResubmit: e.target.checked })}
                    className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]" 
                  />
                  <span className="text-sm text-[#1F2937]">Allow vendor to resubmit after 30 days</span>
                </label>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectLoading}
                  className="px-6 py-2.5 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors disabled:opacity-60"
                >
                  {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 5: Review Vendor */}
          {activeModal === 'review' && modalVendor && (
            <div className="space-y-4 py-2 max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                    Vendor Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Name:</span>
                      <span className="text-[#1F2937] font-medium">{modalVendor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Email:</span>
                      <span className="text-[#1F2937]">{modalVendor.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Phone:</span>
                      <span className="text-[#1F2937]">{modalVendor.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Type:</span>
                      <span className="text-[#1F2937]">{modalVendor.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">Stage:</span>
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium"
                        style={{ 
                          backgroundColor: getStageBadgeStyle(modalVendor.stage).bg,
                          color: getStageBadgeStyle(modalVendor.stage).text
                        }}
                      >
                        {getStageBadgeStyle(modalVendor.stage).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                    Documents
                  </h4>
                  <div className="space-y-2">
                    {modalVendor.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[#6B7280]" />
                          <span className="text-sm text-[#1F2937]">{doc.name}</span>
                        </div>
                        {doc.status === 'verified' && (
                          <span className="text-xs text-[#10B981] flex items-center gap-1">
                            <CheckCircle size={12} />
                            Verified
                          </span>
                        )}
                        {doc.status === 'pending' && (
                          <span className="text-xs text-[#F59E0B] flex items-center gap-1">
                            <Clock size={12} />
                            Pending
                          </span>
                        )}
                        {doc.status === 'missing' && (
                          <span className="text-xs text-[#EF4444] flex items-center gap-1">
                            <XCircle size={12} />
                            Missing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={() => {
                    setActiveModal('approve');
                  }}
                  className="px-6 py-2.5 bg-[#10B981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setActiveModal('reject');
                  }}
                  className="px-6 py-2.5 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors"
                >
                  Reject
                </button>
              </DialogFooter>
            </div>
          )}

          {/* Modal 6: Re-Request Docs */}
          {activeModal === 'reRequestDocs' && modalVendor && (
            <form onSubmit={handleReRequestDocs} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Select Missing Documents
                  </label>
                  <div className="space-y-2">
                    {['GST Certificate', 'Business License', 'Bank Details', 'Insurance Certificate', 'Certifications', 'References'].map((doc) => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reRequestDocsForm.documents.includes(doc)}
                          onChange={(e) => {
                            const newDocs = e.target.checked
                              ? [...reRequestDocsForm.documents, doc]
                              : reRequestDocsForm.documents.filter(d => d !== doc);
                            setReRequestDocsForm({ ...reRequestDocsForm, documents: newDocs });
                          }}
                          className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]"
                        />
                        <span className="text-sm text-[#1F2937]">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    MESSAGE TO VENDOR (OPTIONAL)
                  </label>
                  <textarea
                    value={reRequestDocsForm.message}
                    onChange={(e) => setReRequestDocsForm({ ...reRequestDocsForm, message: e.target.value })}
                    placeholder="Add specific instructions for document submission..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    SUBMISSION DEADLINE <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={reRequestDocsForm.deadline}
                    onChange={(e) => setReRequestDocsForm({ ...reRequestDocsForm, deadline: e.target.value })}
                    className="w-full h-10 px-3 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#F97316] text-white font-medium rounded-lg hover:bg-[#EA580C] transition-colors"
                >
                  Send Request
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 7: View Contract */}
          {activeModal === 'viewContract' && modalVendor && (
            <div className="space-y-4 py-2">
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-6 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <File size={48} className="text-[#6B7280] mx-auto mb-3" />
                  <p className="text-sm text-[#6B7280]">Contract Document</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Contract ID: {modalVendor.contractId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Vendor:</span>
                  <span className="text-[#1F2937] font-medium">{modalVendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Contract Date:</span>
                  <span className="text-[#1F2937]">{modalVendor.registrationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Signed:</span>
                  <span className="text-[#10B981]">
                    {modalVendor.contractSigned ? 'Yes ✓' : 'Pending'}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <button className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors flex items-center gap-2">
                  <Download size={16} />
                  Download PDF
                </button>
                <button className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors">
                  Print
                </button>
              </DialogFooter>
            </div>
          )}

          {/* Modal 8: Assign Tier */}
          {activeModal === 'assignTier' && modalVendor && (
            <form onSubmit={handleAssignTier} className="space-y-4">
              <div className="space-y-4 py-2">
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border-2 border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4F46E5] transition-colors">
                    <input
                      type="radio"
                      name="tier"
                      value="Gold"
                      checked={assignTierForm.tier === 'Gold'}
                      onChange={(e) => setAssignTierForm({ ...assignTierForm, tier: e.target.value as 'Gold' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1F2937]">GOLD TIER</span>
                        <div className="flex gap-0.5">
                          <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                          <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                          <Star size={12} className="text-[#F59E0B] fill-[#F59E0B]" />
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280]">Premium pricing, priority support, dedicated account manager</p>
                      <p className="text-xs text-[#6B7280] mt-1">Annual Volume: &gt;$500k</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border-2 border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4F46E5] transition-colors">
                    <input
                      type="radio"
                      name="tier"
                      value="Silver"
                      checked={assignTierForm.tier === 'Silver'}
                      onChange={(e) => setAssignTierForm({ ...assignTierForm, tier: e.target.value as 'Silver' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1F2937]">SILVER TIER</span>
                        <div className="flex gap-0.5">
                          <Star size={12} className="text-[#9CA3AF] fill-[#9CA3AF]" />
                          <Star size={12} className="text-[#9CA3AF] fill-[#9CA3AF]" />
                        </div>
                      </div>
                      <p className="text-xs text-[#6B7280]">Standard pricing, regular support, monthly reviews</p>
                      <p className="text-xs text-[#6B7280] mt-1">Annual Volume: $100k-$500k</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border-2 border-[#E5E7EB] rounded-lg cursor-pointer hover:border-[#4F46E5] transition-colors">
                    <input
                      type="radio"
                      name="tier"
                      value="Bronze"
                      checked={assignTierForm.tier === 'Bronze'}
                      onChange={(e) => setAssignTierForm({ ...assignTierForm, tier: e.target.value as 'Bronze' })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1F2937]">BRONZE TIER</span>
                        <Star size={12} className="text-[#CD7F32] fill-[#CD7F32]" />
                      </div>
                      <p className="text-xs text-[#6B7280]">Basic pricing, standard support, quarterly reviews</p>
                      <p className="text-xs text-[#6B7280] mt-1">Annual Volume: &lt;$100k</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    NOTES (OPTIONAL)
                  </label>
                  <textarea
                    value={assignTierForm.notes}
                    onChange={(e) => setAssignTierForm({ ...assignTierForm, notes: e.target.value })}
                    placeholder="Additional notes about tier assignment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#7C3AED] text-white font-medium rounded-lg hover:bg-[#6D28D9] transition-colors"
                >
                  Assign Tier
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 9: Add Note */}
          {activeModal === 'addNote' && modalVendor && (
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    NOTE <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    required
                    value={addNoteForm.note}
                    onChange={(e) => setAddNoteForm({ ...addNoteForm, note: e.target.value })}
                    placeholder="Add internal note (visible to team only)..."
                    rows={4}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addNoteForm.visibleToAll}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, visibleToAll: e.target.checked })}
                      className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]"
                    />
                    <span className="text-sm text-[#1F2937]">Make visible to all team members</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!addNoteForm.visibleToAll}
                      onChange={(e) => setAddNoteForm({ ...addNoteForm, visibleToAll: !e.target.checked })}
                      className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]"
                    />
                    <span className="text-sm text-[#1F2937]">Private to me only</span>
                  </label>
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Save Note
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 10: Download Documents */}
          {activeModal === 'downloadDocs' && modalVendor && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                {modalVendor.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 px-3 hover:bg-[#F9FAFB] rounded">
                    <div>
                      <p className="text-sm text-[#1F2937]">{doc.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        {doc.status === 'verified' && 'Verified'}
                        {doc.status === 'pending' && 'Pending'}
                        {doc.status === 'missing' && 'Missing'}
                      </p>
                    </div>
                    <button
                      onClick={() => modalVendor && downloadDocument(doc, modalVendor)}
                      className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={downloadAllDocuments}
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Download All
                </button>
              </DialogFooter>
            </div>
          )}

          {/* Modal 11: Activity Log */}
          {activeModal === 'activityLog' && modalVendor && (
            <div className="space-y-4 py-2">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {modalVendor.activityLog.map((activity, index) => (
                  <div key={index} className="py-2.5 px-3 hover:bg-[#F9FAFB] rounded">
                    <p className="text-sm text-[#1F2937]">{activity.action}</p>
                    <p className="text-xs text-[#6B7280] mt-1">
                      by {activity.user} • {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Close
                </button>
              </DialogFooter>
            </div>
          )}

          {/* Modal 12: Schedule Meeting */}
          {activeModal === 'scheduleMeeting' && modalVendor && (
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); toast.success('Meeting scheduled!'); }} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Meeting Title <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Onboarding Discussion"
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                      Date <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                      Time <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Meeting Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Notes
                  </label>
                  <textarea
                    placeholder="Add meeting agenda or notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Schedule Meeting
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 13: Send Message */}
          {activeModal === 'sendMessage' && modalVendor && (
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); toast.success('Message sent'); }} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Subject <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Message subject"
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Message <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    required
                    placeholder="Type your message here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendCopy"
                    className="w-4 h-4 text-[#4F46E5] border-[#D1D5DB] rounded focus:ring-[#4F46E5]"
                  />
                  <label htmlFor="sendCopy" className="text-sm text-[#1F2937]">
                    Send me a copy
                  </label>
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Send Message
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 14: Flag Vendor */}
          {activeModal === 'flagVendor' && modalVendor && (
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); toast.success('Vendor flagged for review'); }} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Reason <span className="text-[#EF4444]">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  >
                    <option value="">Select a reason</option>
                    <option value="quality">Quality Issues</option>
                    <option value="delivery">Delivery Problems</option>
                    <option value="compliance">Compliance Violation</option>
                    <option value="fraud">Suspected Fraud</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Priority <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="low" required className="w-4 h-4 text-[#4F46E5]" />
                      <span className="text-sm text-[#1F2937]">Low</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="medium" className="w-4 h-4 text-[#4F46E5]" />
                      <span className="text-sm text-[#1F2937]">Medium</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="priority" value="high" className="w-4 h-4 text-[#4F46E5]" />
                      <span className="text-sm text-[#1F2937]">High</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Details <span className="text-[#EF4444]">*</span>
                  </label>
                  <textarea
                    required
                    placeholder="Provide detailed information about the issue..."
                    rows={4}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#EF4444] text-white font-medium rounded-lg hover:bg-[#DC2626] transition-colors"
                >
                  Flag Vendor
                </button>
              </DialogFooter>
            </form>
          )}

          {/* Modal 15: Edit Vendor Info */}
          {activeModal === 'editInfo' && modalVendor && (
            <form onSubmit={(e) => { e.preventDefault(); setActiveModal(null); toast.success('Vendor information updated'); }} className="space-y-4">
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Vendor Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue={modalVendor.name}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                      Email <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      defaultValue={modalVendor.email}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                      Phone <span className="text-[#EF4444]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      defaultValue={modalVendor.phone}
                      className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    defaultValue={modalVendor.category}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  >
                    <option value="Fruits & Veg">Fruits & Veg</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Spices">Spices</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    Vendor Type
                  </label>
                  <select
                    defaultValue={modalVendor.type}
                    className="w-full px-3 py-2 border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-3 focus:ring-[#4F46E5]/10"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Aggregator">Aggregator</option>
                    <option value="Third-party">Third-party</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 border border-[#D1D5DB] text-[#1F2937] font-medium rounded-lg hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors"
                >
                  Save Changes
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
