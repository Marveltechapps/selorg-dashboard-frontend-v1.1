import { v4 as uuidv4 } from 'uuid';

export type AlertType = 
    | "gateway_failure_rate" 
    | "high_value_txn" 
    | "settlement_mismatch" 
    | "sla_breach" 
    | "risk_fraud" 
    | "other";

export type AlertSeverity = "critical" | "high" | "medium" | "low";

export type AlertStatus = "open" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

export interface FinanceAlert {
    id: string;
    type: AlertType;
    title: string;
    description: string;
    severity: AlertSeverity;
    createdAt: string;
    lastUpdatedAt: string;
    status: AlertStatus;
    source: {
        gateway?: string;
        txnId?: string;
        batchId?: string;
        metrics?: {
            failureRatePercent?: number;
            thresholdPercent?: number;
            amount?: number;
        };
    };
    suggestedActions: string[];
}

export interface AlertActionPayload {
    actionType: "check_gateway" | "review_txn" | "reconcile" | "acknowledge" | "dismiss" | "resolve" | "add_note";
    metadata?: any;
}

// --- Mock Data ---

const GATEWAYS = ['Stripe', 'PayPal', 'Adyen', 'Razorpay'];

const generateMockAlerts = (count: number): FinanceAlert[] => {
    const alerts: FinanceAlert[] = [];
    const types: AlertType[] = ["gateway_failure_rate", "high_value_txn", "settlement_mismatch", "risk_fraud"];
    
    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const severity: AlertSeverity = type === 'gateway_failure_rate' ? 'critical' : type === 'risk_fraud' ? 'high' : 'medium';
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)).toISOString();
        
        let title = '';
        let description = '';
        let source: FinanceAlert['source'] = {};

        switch (type) {
            case 'gateway_failure_rate':
                const gateway = GATEWAYS[Math.floor(Math.random() * GATEWAYS.length)];
                const failRate = Math.floor(Math.random() * 15) + 5;
                title = `High Failure Rate: ${gateway}`;
                description = `Failure rate spiked to ${failRate}% in last hour. Threshold is 5%.`;
                source = {
                    gateway,
                    metrics: {
                        failureRatePercent: failRate,
                        thresholdPercent: 5
                    }
                };
                break;
            case 'high_value_txn':
                const amount = Math.floor(Math.random() * 9000) + 1000;
                title = 'High Value Transaction Alert';
                description = `Transaction requires manual review. Amount: $${amount.toFixed(2)}`;
                source = {
                    txnId: `TXN-${Math.floor(Math.random() * 100000)}`,
                    metrics: { amount }
                };
                break;
            case 'settlement_mismatch':
                const diff = Math.floor(Math.random() * 100) + 10;
                title = 'Settlement Mismatch';
                description = `Settlement batch mismatch of $${diff.toFixed(2)}.`;
                source = {
                    batchId: `BATCH-${Math.floor(Math.random() * 10000)}`,
                    metrics: { amount: diff }
                };
                break;
            default:
                title = 'Suspicious Activity Detected';
                description = 'Potential fraud pattern detected in region US-EAST.';
                source = {
                    metrics: { amount: 0 }
                };
        }

        alerts.push({
            id: uuidv4(),
            type,
            title,
            description,
            severity,
            createdAt,
            lastUpdatedAt: createdAt,
            status: 'open',
            source,
            suggestedActions: ['acknowledge']
        });
    }
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

let MOCK_ALERTS = generateMockAlerts(15);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchAlerts = async (status: AlertStatus | 'all' = 'open'): Promise<FinanceAlert[]> => {
    await delay(600);
    if (status === 'all') return MOCK_ALERTS;
    // Special handling: if we ask for 'open', we might want in_progress too
    if (status === 'open') {
        return MOCK_ALERTS.filter(a => ['open', 'in_progress', 'acknowledged'].includes(a.status));
    }
    return MOCK_ALERTS.filter(a => a.status === status);
};

export const fetchAlertDetails = async (id: string): Promise<FinanceAlert | null> => {
    await delay(300);
    return MOCK_ALERTS.find(a => a.id === id) || null;
};

export const performAlertAction = async (id: string, payload: AlertActionPayload): Promise<FinanceAlert> => {
    await delay(500);
    const index = MOCK_ALERTS.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Alert not found");

    const alert = MOCK_ALERTS[index];
    let newStatus = alert.status;

    switch (payload.actionType) {
        case 'dismiss':
            newStatus = 'dismissed';
            break;
        case 'resolve':
            newStatus = 'resolved';
            break;
        case 'acknowledge':
            newStatus = 'acknowledged';
            break;
        case 'check_gateway':
        case 'review_txn':
        case 'reconcile':
            newStatus = 'in_progress';
            break;
    }

    const updatedAlert = {
        ...alert,
        status: newStatus,
        lastUpdatedAt: new Date().toISOString()
    };
    MOCK_ALERTS[index] = updatedAlert;
    return updatedAlert;
};

export const clearResolvedAlerts = async (): Promise<void> => {
    await delay(400);
    // In a real API this would archive them. Here we just keep them but the frontend filters them out if needed.
    // Or we can mock "hiding" them by changing status or deleting. 
    // Let's just say we don't return them in default fetch anymore if user clears them from view.
    // For the mock, let's actually delete resolved/dismissed ones from the array to simulate "clearing"
    MOCK_ALERTS = MOCK_ALERTS.filter(a => !['resolved', 'dismissed'].includes(a.status));
};
