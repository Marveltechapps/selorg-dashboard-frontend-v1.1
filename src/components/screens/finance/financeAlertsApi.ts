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

// Load from localStorage or use default
const loadAlertsFromStorage = (): FinanceAlert[] => {
  try {
    const stored = localStorage.getItem('financeAlerts');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load alerts from storage', e);
  }
  return [];
};

const saveAlertsToStorage = (alerts: FinanceAlert[]) => {
  try {
    localStorage.setItem('financeAlerts', JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts to storage', e);
  }
};

// Initialize MOCK_ALERTS - always ensure we have data
const initializeAlerts = (): FinanceAlert[] => {
  const stored = loadAlertsFromStorage();
  if (stored.length > 0) {
    // Ensure at least some alerts are in 'open' status
    const hasOpenAlerts = stored.some(a => ['open', 'in_progress', 'acknowledged'].includes(a.status));
    if (!hasOpenAlerts && stored.length > 0) {
      // Reset first 5 alerts to 'open' status
      stored.slice(0, Math.min(5, stored.length)).forEach(alert => {
        alert.status = 'open';
        alert.lastUpdatedAt = new Date().toISOString();
      });
      saveAlertsToStorage(stored);
    }
    return stored;
  }
  // Generate fresh mock data
  const freshAlerts = generateMockAlerts(15);
  saveAlertsToStorage(freshAlerts);
  return freshAlerts;
};

let MOCK_ALERTS: FinanceAlert[] = initializeAlerts();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API Functions ---

export const fetchAlerts = async (status: AlertStatus | 'all' = 'open'): Promise<FinanceAlert[]> => {
    await delay(600);
    
    // Ensure MOCK_ALERTS is initialized
    if (MOCK_ALERTS.length === 0) {
        MOCK_ALERTS = initializeAlerts();
    }
    
    if (status === 'all') return MOCK_ALERTS;
    // Special handling: if we ask for 'open', we might want in_progress too
    if (status === 'open') {
        const openAlerts = MOCK_ALERTS.filter(a => ['open', 'in_progress', 'acknowledged'].includes(a.status));
        // If no open alerts, ensure we have at least some data by returning all alerts
        if (openAlerts.length === 0 && MOCK_ALERTS.length > 0) {
            // Reset some alerts to 'open' status if all are resolved/dismissed
            const alertsToReset = MOCK_ALERTS.slice(0, Math.min(5, MOCK_ALERTS.length));
            alertsToReset.forEach(alert => {
                alert.status = 'open';
                alert.lastUpdatedAt = new Date().toISOString();
            });
            saveAlertsToStorage(MOCK_ALERTS);
            return alertsToReset;
        }
        return openAlerts;
    }
    return MOCK_ALERTS.filter(a => a.status === status);
};

export const fetchAlertDetails = async (id: string): Promise<FinanceAlert | null> => {
    await delay(300);
    return MOCK_ALERTS.find(a => a.id === id) || null;
};

export const performAlertAction = async (id: string, payload: AlertActionPayload): Promise<FinanceAlert> => {
    await delay(500);
    
    // Always load fresh from localStorage first
    let currentAlerts = loadAlertsFromStorage();
    if (currentAlerts.length === 0) {
        currentAlerts = MOCK_ALERTS;
    }
    
    const index = currentAlerts.findIndex(a => a.id === id);
    if (index === -1) {
        // Try MOCK_ALERTS if not found in stored
        const mockIndex = MOCK_ALERTS.findIndex(a => a.id === id);
        if (mockIndex === -1) throw new Error("Alert not found");
        currentAlerts = [...MOCK_ALERTS];
    }

    const alert = currentAlerts[index];
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
        case 'add_note':
            // For add_note, keep status but update lastUpdatedAt
            break;
    }

    const updatedAlert = {
        ...alert,
        status: newStatus,
        lastUpdatedAt: new Date().toISOString()
    };
    
    currentAlerts[index] = updatedAlert;
    MOCK_ALERTS = currentAlerts;
    saveAlertsToStorage(currentAlerts);
    
    console.log('Alert action performed:', payload.actionType, 'New status:', newStatus);
    return updatedAlert;
};

export const clearResolvedAlerts = async (): Promise<void> => {
    await delay(400);
    // In a real API this would archive them. Here we just keep them but the frontend filters them out if needed.
    // Or we can mock "hiding" them by changing status or deleting. 
    // Let's just say we don't return them in default fetch anymore if user clears them from view.
    // For the mock, let's actually delete resolved/dismissed ones from the array to simulate "clearing"
    MOCK_ALERTS = MOCK_ALERTS.filter(a => !['resolved', 'dismissed'].includes(a.status));
    saveAlertsToStorage(MOCK_ALERTS);
};
