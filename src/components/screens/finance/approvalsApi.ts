import { v4 as uuidv4 } from 'uuid';

export type TaskType = "refund" | "invoice" | "vendor_payment" | "large_payment" | "adjustment";
export type TaskStatus = "pending" | "approved" | "rejected";

export interface ApprovalTask {
  id: string;
  type: TaskType;
  description: string;
  details?: string;
  amount: number;
  currency: string;
  requesterName: string;
  requesterRole: string;
  createdAt: string;
  status: TaskStatus;
  approverName?: string;
  approvedAt?: string;
  relatedIds?: {
    orderId?: string;
    invoiceId?: string;
    vendorId?: string;
    customerId?: string;
  };
  notes?: string;
}

export interface ApprovalSummary {
  refundRequestsCount: number;
  invoiceApprovalsCount: number;
  approvedTodayCount: number;
}

export interface ApprovalDecisionPayload {
  decision: "approve" | "reject";
  note?: string;
}

// --- Mock Data ---

const generateMockTasks = (count: number): ApprovalTask[] => {
    const tasks: ApprovalTask[] = [];
    const types: TaskType[] = ["refund", "invoice", "vendor_payment", "large_payment", "adjustment"];
    const names = ["Alice Support", "Bob Ops", "Charlie Finance", "David Manager"];
    const roles = ["Support Agent", "Ops Manager", "Finance Controller", "Regional Lead"];

    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const nameIdx = Math.floor(Math.random() * names.length);
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 3)).toISOString();
        
        let description = "";
        let details = "";
        let amount = 0;
        let relatedIds: any = {};

        switch (type) {
            case 'refund':
                description = `Order #${10000+i} Customer Refund`;
                details = "Customer reported damaged goods upon delivery.";
                amount = Math.floor(Math.random() * 200) + 20;
                relatedIds = { orderId: `${10000+i}`, customerId: `CUST-${i}` };
                break;
            case 'invoice':
                description = `Vendor Invoice #${500+i}`;
                details = "Monthly server maintenance fee.";
                amount = Math.floor(Math.random() * 5000) + 1000;
                relatedIds = { invoiceId: `INV-${500+i}`, vendorId: `V-${i}` };
                break;
            case 'large_payment':
                description = "Urgent Equipment Purchase";
                details = "New delivery fleet scooters deposit.";
                amount = Math.floor(Math.random() * 15000) + 5000;
                break;
            case 'vendor_payment':
                description = "Supplier Payment: Fresh Foods Ltd";
                details = "Weekly inventory restocking.";
                amount = Math.floor(Math.random() * 2000) + 500;
                relatedIds = { vendorId: `V-FRESH-${i}` };
                break;
            default:
                description = "Manual Ledger Adjustment";
                details = "Correction for double entry on May 4th.";
                amount = Math.floor(Math.random() * 100);
        }

        tasks.push({
            id: uuidv4(),
            type,
            description,
            details,
            amount,
            currency: 'USD',
            requesterName: names[nameIdx],
            requesterRole: roles[nameIdx],
            createdAt,
            status: 'pending',
            relatedIds
        });
    }
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

let MOCK_TASKS = generateMockTasks(25);
let APPROVED_TODAY_COUNT = 14; 

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchApprovalSummary = async (): Promise<ApprovalSummary> => {
    await delay(500);
    const pending = MOCK_TASKS.filter(t => t.status === 'pending');
    return {
        refundRequestsCount: pending.filter(t => t.type === 'refund').length,
        invoiceApprovalsCount: pending.filter(t => t.type === 'invoice').length,
        approvedTodayCount: APPROVED_TODAY_COUNT
    };
};

export const fetchApprovalTasks = async (status: TaskStatus = 'pending', type?: string, minAmount?: number): Promise<ApprovalTask[]> => {
    await delay(600);
    let tasks = MOCK_TASKS.filter(t => t.status === status);
    
    if (type && type !== 'all') {
        tasks = tasks.filter(t => t.type === type);
    }
    
    if (minAmount) {
        tasks = tasks.filter(t => t.amount >= minAmount);
    }

    return tasks;
};

export const fetchTaskDetails = async (id: string): Promise<ApprovalTask | null> => {
    await delay(300);
    return MOCK_TASKS.find(t => t.id === id) || null;
};

export const submitTaskDecision = async (id: string, payload: ApprovalDecisionPayload): Promise<ApprovalTask> => {
    await delay(800);
    const index = MOCK_TASKS.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Task not found");

    const updatedTask = {
        ...MOCK_TASKS[index],
        status: payload.decision === 'approve' ? 'approved' : 'rejected' as TaskStatus,
        notes: payload.note,
        approvedAt: new Date().toISOString(),
        approverName: 'Current User' // mock
    };

    MOCK_TASKS[index] = updatedTask;

    if (payload.decision === 'approve') {
        APPROVED_TODAY_COUNT++;
    }

    return updatedTask;
};
