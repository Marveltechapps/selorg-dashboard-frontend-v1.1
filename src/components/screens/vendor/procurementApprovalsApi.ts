import { v4 as uuidv4 } from 'uuid';

export type ProcurementTaskType = "vendor_onboarding" | "purchase_order" | "contract_renewal" | "price_change" | "payment_release";
export type ProcurementTaskStatus = "pending" | "approved" | "rejected";
export type ProcurementTaskPriority = "high" | "normal" | "low";

export interface ProcurementApprovalTask {
  id: string;
  type: ProcurementTaskType;
  description: string;
  details?: string;
  requesterName: string;
  requesterRole: string;
  valueAmount?: number;
  currency?: string;
  createdAt: string;
  status: ProcurementTaskStatus;
  priority: ProcurementTaskPriority;
  relatedIds?: {
    vendorId?: string;
    poNumber?: string;
    contractId?: string;
  };
  rejectionReason?: string;
  decisionNote?: string;
  approvedAt?: string;
}

export interface ProcurementApprovalSummary {
  pendingRequestsCount: number;
  approvedTodayCount: number;
  rejectedTodayCount: number;
}

export interface ProcurementApprovalDecision {
  decision: "approve" | "reject";
  note?: string;
  reason?: string; // specific for rejection
}

// --- Mock Data Generators ---

const generateMockProcurementTasks = (count: number): ProcurementApprovalTask[] => {
    const tasks: ProcurementApprovalTask[] = [];
    const types: ProcurementTaskType[] = ["vendor_onboarding", "purchase_order", "contract_renewal", "price_change", "payment_release"];
    const priorities: ProcurementTaskPriority[] = ["high", "normal", "low"];
    const names = ["Sarah Buyer", "Mike Sourcing", "Jenny Ops", "David Logistics"];
    const roles = ["Procurement Specialist", "Sourcing Manager", "Ops Lead", "Logistics Coordinator"];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        let priority = priorities[Math.floor(Math.random() * priorities.length)];
        const nameIdx = Math.floor(Math.random() * names.length);
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 48)).toISOString(); // Last 48 hours

        let description = "";
        let details = "";
        let valueAmount: number | undefined = undefined;
        let relatedIds: any = {};

        switch (type) {
            case 'vendor_onboarding':
                description = `New Vendor: ${['Green Earth Supplies', 'Tech Parts Inc', 'Office Depot', 'Global Logistics'][Math.floor(Math.random()*4)]}`;
                details = "Region: North America • Category: Office Supplies";
                relatedIds = { vendorId: `V-${1000+i}` };
                break;
            case 'purchase_order':
                description = `PO-${2024000+i} Approval`;
                details = "Bulk order of laptops for new hires";
                valueAmount = Math.floor(Math.random() * 50000) + 1000;
                relatedIds = { poNumber: `PO-${2024000+i}`, vendorId: `V-${1000+i}` };
                break;
            case 'contract_renewal':
                description = "Annual Contract Renewal: Cleaning Services";
                details = "Rate increase of 2% proposed";
                valueAmount = 12000;
                relatedIds = { contractId: `CTR-${500+i}`, vendorId: `V-${1000+i}` };
                break;
            case 'price_change':
                description = "Price Adjustment: Raw Materials";
                details = "15% increase due to supply chain issues";
                priority = 'high';
                relatedIds = { vendorId: `V-${1000+i}` };
                break;
            case 'payment_release':
                description = "Release Milestone Payment";
                details = "Project completion: Phase 1";
                valueAmount = 25000;
                relatedIds = { poNumber: `PO-${2024000+i}` };
                break;
        }

        tasks.push({
            id: uuidv4(),
            type,
            description,
            details,
            requesterName: names[nameIdx],
            requesterRole: roles[nameIdx],
            valueAmount,
            currency: 'USD',
            createdAt,
            status: 'pending',
            priority,
            relatedIds
        });
    }
    
    // Sort by priority (High > Normal > Low) then Date
    return tasks.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

let MOCK_TASKS = generateMockProcurementTasks(25);
let APPROVED_TODAY_COUNT = 8;
let REJECTED_TODAY_COUNT = 2;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchProcurementSummary = async (): Promise<ProcurementApprovalSummary> => {
    await delay(500);
    const pending = MOCK_TASKS.filter(t => t.status === 'pending');
    return {
        pendingRequestsCount: pending.length,
        approvedTodayCount: APPROVED_TODAY_COUNT,
        rejectedTodayCount: REJECTED_TODAY_COUNT
    };
};

export const fetchProcurementTasks = async (status: ProcurementTaskStatus = 'pending', type?: string, minValue?: number): Promise<ProcurementApprovalTask[]> => {
    await delay(600);
    let tasks = MOCK_TASKS.filter(t => t.status === status);
    
    if (type && type !== 'all') {
        tasks = tasks.filter(t => t.type === type);
    }
    
    if (minValue) {
        tasks = tasks.filter(t => (t.valueAmount || 0) >= minValue);
    }

    return tasks;
};

export const fetchTaskDetails = async (id: string): Promise<ProcurementApprovalTask | null> => {
    await delay(300);
    return MOCK_TASKS.find(t => t.id === id) || null;
};

export const submitTaskDecision = async (id: string, payload: ProcurementApprovalDecision): Promise<ProcurementApprovalTask> => {
    await delay(800);
    const index = MOCK_TASKS.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Task not found");

    const updatedTask = {
        ...MOCK_TASKS[index],
        status: payload.decision === 'approve' ? 'approved' : 'rejected' as ProcurementTaskStatus,
        decisionNote: payload.note,
        rejectionReason: payload.reason,
        approvedAt: new Date().toISOString()
    };

    MOCK_TASKS[index] = updatedTask;

    if (payload.decision === 'approve') {
        APPROVED_TODAY_COUNT++;
    } else {
        REJECTED_TODAY_COUNT++;
    }

    return updatedTask;
};
