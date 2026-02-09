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

// Load from localStorage or generate new
const loadTasksFromStorage = (): ProcurementApprovalTask[] => {
    try {
        const saved = localStorage.getItem('procurementApprovalTasks');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure we have some approved/rejected tasks if counts are set
            const approvedCount = parseInt(localStorage.getItem('procurementApprovedTodayCount') || '8', 10);
            const rejectedCount = parseInt(localStorage.getItem('procurementRejectedTodayCount') || '2', 10);
            const approved = parsed.filter((t: ProcurementApprovalTask) => t.status === 'approved');
            const rejected = parsed.filter((t: ProcurementApprovalTask) => t.status === 'rejected');
            
            // If we don't have enough approved/rejected tasks, create some from pending
            if (approved.length < approvedCount) {
                const pending = parsed.filter((t: ProcurementApprovalTask) => t.status === 'pending');
                const toApprove = Math.min(approvedCount - approved.length, pending.length);
                for (let i = 0; i < toApprove; i++) {
                    const task = pending[i];
                    if (task) {
                        task.status = 'approved';
                        task.approvedAt = new Date().toISOString();
                        task.decisionNote = 'Approved';
                    }
                }
            }
            
            if (rejected.length < rejectedCount) {
                const pending = parsed.filter((t: ProcurementApprovalTask) => t.status === 'pending');
                const toReject = Math.min(rejectedCount - rejected.length, pending.length);
                for (let i = 0; i < toReject; i++) {
                    const task = pending[i];
                    if (task) {
                        task.status = 'rejected';
                        task.approvedAt = new Date().toISOString();
                        task.rejectionReason = 'Rejected';
                    }
                }
            }
            
            // Save updated tasks
            try {
                localStorage.setItem('procurementApprovalTasks', JSON.stringify(parsed));
            } catch (e) {
                console.warn('Failed to save tasks to localStorage', e);
            }
            
            return parsed;
        }
    } catch (e) {
        console.warn('Failed to load tasks from localStorage', e);
    }
    const newTasks = generateMockProcurementTasks(25);
    // Initialize some approved/rejected tasks
    const approvedCount = 8;
    const rejectedCount = 2;
    for (let i = 0; i < approvedCount && i < newTasks.length; i++) {
        newTasks[i].status = 'approved';
        newTasks[i].approvedAt = new Date().toISOString();
        newTasks[i].decisionNote = 'Approved';
    }
    for (let i = approvedCount; i < approvedCount + rejectedCount && i < newTasks.length; i++) {
        newTasks[i].status = 'rejected';
        newTasks[i].approvedAt = new Date().toISOString();
        newTasks[i].rejectionReason = 'Rejected';
    }
    return newTasks;
};

const saveTasksToStorage = (tasks: ProcurementApprovalTask[]) => {
    try {
        localStorage.setItem('procurementApprovalTasks', JSON.stringify(tasks));
    } catch (e) {
        console.warn('Failed to save tasks to localStorage', e);
    }
};

let MOCK_TASKS = loadTasksFromStorage();
let APPROVED_TODAY_COUNT = parseInt(localStorage.getItem('procurementApprovedTodayCount') || '8', 10);
let REJECTED_TODAY_COUNT = parseInt(localStorage.getItem('procurementRejectedTodayCount') || '2', 10);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchProcurementSummary = async (): Promise<ProcurementApprovalSummary> => {
    await delay(500);
    // Reload from localStorage to get latest data
    MOCK_TASKS = loadTasksFromStorage();
    APPROVED_TODAY_COUNT = parseInt(localStorage.getItem('procurementApprovedTodayCount') || '8', 10);
    REJECTED_TODAY_COUNT = parseInt(localStorage.getItem('procurementRejectedTodayCount') || '2', 10);
    
    const pending = MOCK_TASKS.filter(t => t.status === 'pending');
    const approvedToday = MOCK_TASKS.filter(t => {
        if (t.status !== 'approved' || !t.approvedAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const approvedDate = new Date(t.approvedAt);
        approvedDate.setHours(0, 0, 0, 0);
        return approvedDate.getTime() === today.getTime();
    });
    const rejectedToday = MOCK_TASKS.filter(t => {
        if (t.status !== 'rejected' || !t.approvedAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rejectedDate = new Date(t.approvedAt);
        rejectedDate.setHours(0, 0, 0, 0);
        return rejectedDate.getTime() === today.getTime();
    });
    
    return {
        pendingRequestsCount: pending.length,
        approvedTodayCount: approvedToday.length || APPROVED_TODAY_COUNT,
        rejectedTodayCount: rejectedToday.length || REJECTED_TODAY_COUNT
    };
};

export const fetchProcurementTasks = async (status: ProcurementTaskStatus = 'pending', type?: string, minValue?: number): Promise<ProcurementApprovalTask[]> => {
    await delay(600);
    // Reload from localStorage to get latest data
    MOCK_TASKS = loadTasksFromStorage();
    
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
    
    // Persist to localStorage
    saveTasksToStorage(MOCK_TASKS);

    if (payload.decision === 'approve') {
        APPROVED_TODAY_COUNT++;
        localStorage.setItem('procurementApprovedTodayCount', APPROVED_TODAY_COUNT.toString());
    } else {
        REJECTED_TODAY_COUNT++;
        localStorage.setItem('procurementRejectedTodayCount', REJECTED_TODAY_COUNT.toString());
    }

    return updatedTask;
};
