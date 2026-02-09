import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../ui/page-header';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { HrSummaryCards } from "./hr/HrSummaryCards";
import { DocumentApprovalTable } from "./hr/DocumentApprovalTable";
import { DocumentReviewDrawer } from "./hr/DocumentReviewDrawer";
import { OnboardRiderModal } from "./hr/OnboardRiderModal";
import { OnboardingStatusTab } from "./hr/OnboardingStatusTab";
import { TrainingStatusTab } from "./hr/TrainingStatusTab";
import { AccessAndDeviceTab } from "./hr/AccessAndDeviceTab";
import { ContractsComplianceTab } from "./hr/ContractsComplianceTab";

import { 
  fetchHrSummary, 
  fetchDocuments, 
  fetchRiderDetails, 
  fetchAllRiders,
  fetchDocumentDetails
} from "./hr/hrApi";
import { HrDashboardSummary, RiderDocument, Rider } from "./hr/types";

interface RiderHRProps {
  searchQuery?: string;
}

export function RiderHR({ searchQuery = '' }: RiderHRProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<HrDashboardSummary | null>(null);
  const [documents, setDocuments] = useState<RiderDocument[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  
  // Filter State
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("documents");
  const localRidersRef = useRef<Rider[]>([]);
  const localDocumentUpdatesRef = useRef<Record<string, 'approved' | 'rejected'>>({});
  const localRiderAccessRef = useRef<Record<string, 'enabled' | 'disabled'>>({});

  // Modal/Drawer State
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [reviewDoc, setReviewDoc] = useState<RiderDocument | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRiderDetails, setReviewRiderDetails] = useState<Rider | null>(null);

  // Filter riders and documents based on search query
  const filteredRiders = React.useMemo(() => {
    if (!searchQuery.trim()) return riders;
    const query = searchQuery.toLowerCase();
    return riders.filter(r => 
      r.id.toLowerCase().includes(query) ||
      r.name.toLowerCase().includes(query) ||
      r.email.toLowerCase().includes(query) ||
      r.phone.toLowerCase().includes(query)
    );
  }, [riders, searchQuery]);

  const filteredDocuments = React.useMemo(() => {
    let docs = documents;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      docs = docs.filter(d => 
        d.id.toLowerCase().includes(query) ||
        d.riderId.toLowerCase().includes(query) ||
        d.riderName.toLowerCase().includes(query) ||
        d.documentType.toLowerCase().includes(query)
      );
    }
    return docs;
  }, [documents, searchQuery]);

  // Initial Data Load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload documents when filter changes
  useEffect(() => {
    loadDocuments();
  }, [filterStatus]);

  // Real-time polling for document queue and summary (every 30 seconds)
  // Pause polling when tab is hidden to save resources
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (!document.hidden) {
          loadDashboardData();
        }
      }, 30000); // Poll every 30 seconds
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause polling when tab is hidden
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      } else {
        // Resume polling when tab becomes visible
        startPolling();
        // Also refresh immediately when tab becomes visible
        loadDashboardData();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryData, ridersData] = await Promise.all([
        fetchHrSummary(),
        fetchAllRiders()
      ]);
      setSummary(summaryData);
      const merged = [...ridersData];
      localRidersRef.current.forEach(l => {
        if (!merged.find(m => m.id === l.id)) merged.push(l);
      });
      merged.forEach(r => { if (localRiderAccessRef.current[r.id]) r.appAccess = localRiderAccessRef.current[r.id]; });
      setRiders(merged);
      await loadDocuments();
    } catch (error) {
      console.error("Failed to load HR data", error);
      // Fallback to mock so UI always has data
      try {
        const [s, r] = await Promise.all([fetchHrSummary(), fetchAllRiders()]);
        setSummary(s);
        const base = Array.isArray(r) ? r : [];
        const merged = [...base];
        localRidersRef.current.forEach(l => { if (!merged.find(m => m.id === l.id)) merged.push(l); });
        merged.forEach(r => { if (localRiderAccessRef.current[r.id]) r.appAccess = localRiderAccessRef.current[r.id]; });
        setRiders(merged);
        const { data } = await fetchDocuments({ status: filterStatus });
        const docsMerged = (data || []).map((d: RiderDocument) => ({ ...d, ...(localDocumentUpdatesRef.current[d.id] && { status: localDocumentUpdatesRef.current[d.id] }) }));
        setDocuments(docsMerged);
      } catch {
        setSummary({ pendingVerifications: 3, expiredDocuments: 1, activeCompliantRiders: 24 });
        const merged = [...localRidersRef.current];
        setRiders(merged);
        setDocuments([]);
      }
      toast.info("Using sample data. Connect backend for live data.");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data } = await fetchDocuments({ status: filterStatus });
      const list = Array.isArray(data) ? data : [];
      const docsMerged = list.map((d: RiderDocument) => ({ ...d, ...(localDocumentUpdatesRef.current[d.id] && { status: localDocumentUpdatesRef.current[d.id] }) }));
      setDocuments(docsMerged);
    } catch (error) {
      console.error("Failed to load documents", error);
      setDocuments(prev => prev.map(d => ({ ...d, ...(localDocumentUpdatesRef.current[d.id] && { status: localDocumentUpdatesRef.current[d.id] }) })));
      toast.error("Failed to load documents", { description: error instanceof Error ? error.message : "Please try again" });
    }
  };

  const handleReviewClick = async (doc: RiderDocument) => {
    try {
      // Fetch fresh document details and rider details
      const [freshDoc, rider] = await Promise.all([
        fetchDocumentDetails(doc.id),
        fetchRiderDetails(doc.riderId)
      ]);
      
      if (freshDoc) {
        setReviewDoc(freshDoc);
      } else {
        setReviewDoc(doc); // Fallback to passed doc
      }
      setReviewRiderDetails(rider);
      setIsReviewOpen(true);
    } catch (error) {
      console.error("Error opening review drawer:", error);
      toast.error("Failed to load document details");
      // Still open with existing doc data
      setReviewDoc(doc);
      setIsReviewOpen(true);
    }
  };

  const handleStatusUpdate = async (docId?: string, newStatus?: 'approved' | 'rejected') => {
    if (docId && newStatus) {
      localDocumentUpdatesRef.current[docId] = newStatus;
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));
      // Background refresh without blocking UI
      loadDocuments().catch(() => {});
      refreshSummaryBackground();
    }
  };

  // Lightweight refresh functions that don't show loading state
  const refreshRidersBackground = async () => {
    try {
      const ridersData = await fetchAllRiders();
      const merged = [...ridersData];
      localRidersRef.current.forEach(l => {
        if (!merged.find(m => m.id === l.id)) merged.push(l);
      });
      merged.forEach(r => { 
        if (localRiderAccessRef.current[r.id]) r.appAccess = localRiderAccessRef.current[r.id]; 
      });
      setRiders(merged);
    } catch (error) {
      console.error("Background refresh failed", error);
      // Don't show error toast for background refreshes
    }
  };

  const refreshSummaryBackground = async () => {
    try {
      const summaryData = await fetchHrSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Background summary refresh failed", error);
      // Don't show error toast for background refreshes
    }
  };

  // Lightweight refresh that updates riders and summary without full page reload
  const handleLightRefresh = async () => {
    await Promise.all([
      refreshRidersBackground(),
      refreshSummaryBackground()
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rider HR & Payroll"
        subtitle="Staff management and compensation"
        actions={
          <button 
            onClick={() => setIsOnboardOpen(true)}
            className="px-4 py-2 bg-[#16A34A] text-white font-medium rounded-lg hover:bg-[#15803D] flex items-center gap-2"
          >
            <Plus size={16} />
            Add Rider
          </button>
        }
      />

      {/* Summary Cards - clicking switches to relevant tab and filter */}
      <HrSummaryCards 
        summary={summary} 
        loading={loading}
        onFilterPending={() => { setActiveTab("documents"); setFilterStatus("pending"); }}
        onShowExpired={() => { setActiveTab("documents"); setFilterStatus("expired"); }}
        onShowActive={() => { setActiveTab("access"); setFilterStatus("all"); toast.info("Showing active & compliant riders"); }}
      />

      {/* Main Content Tabs - forceMount so tab content is available when switching from summary cards */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-[#E0E0E0] p-1 h-auto w-full justify-start overflow-x-auto flex flex-wrap gap-1">
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#F3F4F6]">Document Queue</TabsTrigger>
          <TabsTrigger value="onboarding" className="data-[state=active]:bg-[#F3F4F6]">Onboarding Status</TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-[#F3F4F6]">Training</TabsTrigger>
          <TabsTrigger value="access" className="data-[state=active]:bg-[#F3F4F6]">Access & Devices</TabsTrigger>
          <TabsTrigger value="contracts" className="data-[state=active]:bg-[#F3F4F6]">Contracts & Compliance</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="documents" className="m-0 data-[state=inactive]:hidden">
            <DocumentApprovalTable 
              documents={filteredDocuments}
              loading={loading}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onReview={handleReviewClick}
              onViewReason={(doc) => {
                setReviewDoc(doc);
                setIsReviewOpen(true);
              }}
            />
          </TabsContent>
          
          <TabsContent value="onboarding" className="m-0 data-[state=inactive]:hidden">
            <OnboardingStatusTab riders={filteredRiders} loading={loading} onRefresh={handleLightRefresh} />
          </TabsContent>

          <TabsContent value="training" className="m-0 data-[state=inactive]:hidden">
            <TrainingStatusTab 
              riders={filteredRiders} 
              loading={loading} 
              onRefresh={handleLightRefresh} 
              onRiderTrainingUpdated={(riderId) => {
                setRiders(prev => prev.map(r => r.id === riderId ? { ...r, trainingStatus: 'completed' as const } : r));
                // Background refresh to sync with server
                handleLightRefresh().catch(() => {});
              }} 
            />
          </TabsContent>

          <TabsContent value="access" className="m-0 data-[state=inactive]:hidden">
            <AccessAndDeviceTab 
              riders={filteredRiders} 
              loading={loading} 
              onRefresh={handleLightRefresh}
              onAccessUpdated={(riderId, access) => {
                localRiderAccessRef.current[riderId] = access;
                setRiders(prev => prev.map(r => r.id === riderId ? { ...r, appAccess: access } : r));
                // Background refresh to sync with server
                handleLightRefresh().catch(() => {});
              }}
            />
          </TabsContent>

          <TabsContent value="contracts" className="m-0 data-[state=inactive]:hidden">
            <ContractsComplianceTab riders={filteredRiders} loading={loading} onRefresh={handleLightRefresh} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Drawers & Modals */}
      <DocumentReviewDrawer 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        document={reviewDoc}
        riderDetails={reviewRiderDetails}
        onStatusUpdate={handleStatusUpdate}
      />

      <OnboardRiderModal 
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onSuccess={(newRider) => {
          if (newRider) {
            setActiveTab('onboarding');
            // Add new rider to local state immediately
            if (newRider.id) {
              const newRiderData: Rider = {
                id: newRider.id,
                name: newRider.name,
                email: newRider.email,
                phone: newRider.phone,
                status: 'onboarding',
                onboardingStatus: 'invited',
                trainingStatus: 'not_started',
                appAccess: 'disabled',
                deviceAssigned: false,
                contract: {
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  renewalDue: false,
                },
                compliance: {
                  isCompliant: true,
                  lastAuditDate: new Date().toISOString().split('T')[0],
                  policyViolationsCount: 0,
                },
              };
              setRiders(prev => {
                const exists = prev.find(r => r.id === newRider.id);
                if (exists) return prev;
                return [...prev, newRiderData];
              });
            }
            // Background refresh to sync with server (non-blocking)
            handleLightRefresh().catch(() => {});
          }
        }}
      />
    </div>
  );
}