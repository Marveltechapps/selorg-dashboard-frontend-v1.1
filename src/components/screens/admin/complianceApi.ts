import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface ComplianceDocument {
  id: string;
  name: string;
  type: 'certificate' | 'policy' | 'license' | 'audit' | 'report' | 'agreement';
  category: 'data-protection' | 'financial' | 'operational' | 'legal' | 'security' | 'tax';
  status: 'valid' | 'expiring-soon' | 'expired' | 'pending-renewal' | 'under-review';
  uploadedAt: string;
  expiresAt: string | null;
  fileSize: string;
  version: string;
  uploadedBy: string;
  description: string;
  tags: string[];
  acknowledged: boolean;
  acknowledgedBy?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  certNumber: string;
  type: 'ISO' | 'PCI-DSS' | 'SOC2' | 'GDPR' | 'HIPAA' | 'Other';
  status: 'active' | 'expiring-soon' | 'expired' | 'pending';
  issuedDate: string;
  expiryDate: string;
  scope: string;
  auditedBy: string;
  nextAudit: string;
  score?: number;
  attachments: number;
}

export interface AuditRecord {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'regulatory' | 'third-party';
  status: 'scheduled' | 'in-progress' | 'completed' | 'failed';
  scheduledDate: string;
  completedDate?: string;
  auditor: string;
  auditorOrg: string;
  scope: string[];
  findings: AuditFinding[];
  overallScore?: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
}

export interface AuditFinding {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk';
  assignedTo: string;
  dueDate: string;
}

export interface Policy {
  id: string;
  name: string;
  category: 'privacy' | 'security' | 'hr' | 'operational' | 'financial' | 'legal';
  version: string;
  status: 'active' | 'draft' | 'under-review' | 'archived';
  effectiveDate: string;
  reviewDate: string;
  owner: string;
  approvedBy: string;
  description: string;
  requiresAcknowledgment: boolean;
  acknowledgmentRate: number;
  totalEmployees: number;
  acknowledgedEmployees: number;
}

export interface ComplianceMetrics {
  overallScore: number;
  totalDocuments: number;
  validDocuments: number;
  expiringDocuments: number;
  expiredDocuments: number;
  activeCertifications: number;
  completedAudits: number;
  openFindings: number;
  criticalFindings: number;
  policyCompliance: number;
}

export interface ViolationAlert {
  id: string;
  type: 'expiry' | 'audit-failure' | 'policy-violation' | 'data-breach' | 'regulatory';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedArea: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
  assignedTo: string;
}

// --- Mock Data ---

const MOCK_DOCUMENTS: ComplianceDocument[] = [
  {
    id: 'DOC-001',
    name: 'GDPR Data Processing Agreement',
    type: 'agreement',
    category: 'data-protection',
    status: 'valid',
    uploadedAt: '2024-01-15T10:00:00Z',
    expiresAt: '2025-01-15T10:00:00Z',
    fileSize: '2.4 MB',
    version: '2.0',
    uploadedBy: 'legal@quickcommerce.com',
    description: 'Main data processing agreement compliant with GDPR regulations',
    tags: ['GDPR', 'EU', 'Data Protection', 'Privacy'],
    acknowledged: true,
    acknowledgedBy: ['admin@quickcommerce.com', 'legal@quickcommerce.com'],
  },
  {
    id: 'DOC-002',
    name: 'PCI-DSS Compliance Certificate',
    type: 'certificate',
    category: 'financial',
    status: 'valid',
    uploadedAt: '2024-03-01T09:00:00Z',
    expiresAt: '2025-03-01T09:00:00Z',
    fileSize: '1.8 MB',
    version: '4.0',
    uploadedBy: 'security@quickcommerce.com',
    description: 'Payment Card Industry Data Security Standard certification',
    tags: ['PCI-DSS', 'Payment Security', 'Card Data'],
    acknowledged: true,
  },
  {
    id: 'DOC-003',
    name: 'ISO 27001:2022 Certificate',
    type: 'certificate',
    category: 'security',
    status: 'valid',
    uploadedAt: '2024-02-10T11:00:00Z',
    expiresAt: '2027-02-10T11:00:00Z',
    fileSize: '3.2 MB',
    version: '1.0',
    uploadedBy: 'compliance@quickcommerce.com',
    description: 'Information Security Management System certification',
    tags: ['ISO 27001', 'ISMS', 'Security', 'InfoSec'],
    acknowledged: true,
  },
  {
    id: 'DOC-004',
    name: 'Food Safety License (FSSAI)',
    type: 'license',
    category: 'operational',
    status: 'expiring-soon',
    uploadedAt: '2023-12-20T10:00:00Z',
    expiresAt: '2025-01-10T10:00:00Z',
    fileSize: '892 KB',
    version: '1.0',
    uploadedBy: 'ops@quickcommerce.com',
    description: 'FSSAI license for food handling and delivery operations',
    tags: ['FSSAI', 'Food Safety', 'India', 'License'],
    acknowledged: true,
  },
  {
    id: 'DOC-005',
    name: 'Privacy Policy v3.5',
    type: 'policy',
    category: 'data-protection',
    status: 'valid',
    uploadedAt: '2024-11-01T09:00:00Z',
    expiresAt: null,
    fileSize: '456 KB',
    version: '3.5',
    uploadedBy: 'legal@quickcommerce.com',
    description: 'Customer-facing privacy policy document',
    tags: ['Privacy', 'Customer Data', 'Legal'],
    acknowledged: false,
  },
  {
    id: 'DOC-006',
    name: 'SOC 2 Type II Report',
    type: 'report',
    category: 'security',
    status: 'valid',
    uploadedAt: '2024-09-15T10:00:00Z',
    expiresAt: '2025-09-15T10:00:00Z',
    fileSize: '5.6 MB',
    version: '1.0',
    uploadedBy: 'audit@quickcommerce.com',
    description: 'System and Organization Controls audit report',
    tags: ['SOC 2', 'Audit', 'Security Controls'],
    acknowledged: true,
  },
  {
    id: 'DOC-007',
    name: 'GST Registration Certificate',
    type: 'license',
    category: 'tax',
    status: 'valid',
    uploadedAt: '2024-01-05T08:00:00Z',
    expiresAt: null,
    fileSize: '324 KB',
    version: '1.0',
    uploadedBy: 'finance@quickcommerce.com',
    description: 'Goods and Services Tax registration for India operations',
    tags: ['GST', 'Tax', 'India', 'Registration'],
    acknowledged: true,
  },
  {
    id: 'DOC-008',
    name: 'Data Breach Response Plan',
    type: 'policy',
    category: 'security',
    status: 'under-review',
    uploadedAt: '2024-12-01T10:00:00Z',
    expiresAt: null,
    fileSize: '1.2 MB',
    version: '2.1',
    uploadedBy: 'security@quickcommerce.com',
    description: 'Incident response procedures for data security breaches',
    tags: ['Incident Response', 'Security', 'Data Breach'],
    acknowledged: false,
  },
  {
    id: 'DOC-009',
    name: 'Vendor Service Agreement - AWS',
    type: 'agreement',
    category: 'legal',
    status: 'valid',
    uploadedAt: '2024-01-10T09:00:00Z',
    expiresAt: '2026-01-10T09:00:00Z',
    fileSize: '3.8 MB',
    version: '1.0',
    uploadedBy: 'procurement@quickcommerce.com',
    description: 'Master service agreement with Amazon Web Services',
    tags: ['AWS', 'Vendor', 'Cloud Services'],
    acknowledged: true,
  },
  {
    id: 'DOC-010',
    name: 'Annual Financial Audit 2023',
    type: 'audit',
    category: 'financial',
    status: 'valid',
    uploadedAt: '2024-03-20T10:00:00Z',
    expiresAt: null,
    fileSize: '8.4 MB',
    version: '1.0',
    uploadedBy: 'audit@quickcommerce.com',
    description: 'External financial audit report for FY 2023',
    tags: ['Financial Audit', 'FY2023', 'External Audit'],
    acknowledged: true,
  },
];

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: 'CERT-001',
    name: 'ISO 27001:2022',
    issuer: 'BSI Group',
    certNumber: 'IS 789456',
    type: 'ISO',
    status: 'active',
    issuedDate: '2024-02-10T00:00:00Z',
    expiryDate: '2027-02-10T00:00:00Z',
    scope: 'Information Security Management System for cloud-based quick-commerce platform',
    auditedBy: 'BSI Auditors Ltd.',
    nextAudit: '2025-02-10T00:00:00Z',
    score: 96,
    attachments: 4,
  },
  {
    id: 'CERT-002',
    name: 'PCI-DSS Level 1',
    issuer: 'PCI Security Standards Council',
    certNumber: 'PCI-2024-QC-001',
    type: 'PCI-DSS',
    status: 'active',
    issuedDate: '2024-03-01T00:00:00Z',
    expiryDate: '2025-03-01T00:00:00Z',
    scope: 'Payment card processing and storage systems',
    auditedBy: 'Trustwave',
    nextAudit: '2025-01-15T00:00:00Z',
    score: 98,
    attachments: 6,
  },
  {
    id: 'CERT-003',
    name: 'SOC 2 Type II',
    issuer: 'AICPA',
    certNumber: 'SOC2-2024-789',
    type: 'SOC2',
    status: 'active',
    issuedDate: '2024-09-15T00:00:00Z',
    expiryDate: '2025-09-15T00:00:00Z',
    scope: 'Security, Availability, and Confidentiality controls',
    auditedBy: 'Deloitte',
    nextAudit: '2025-06-15T00:00:00Z',
    score: 94,
    attachments: 8,
  },
  {
    id: 'CERT-004',
    name: 'GDPR Compliance',
    issuer: 'EU Data Protection Authority',
    certNumber: 'GDPR-EU-2024-456',
    type: 'GDPR',
    status: 'active',
    issuedDate: '2024-01-15T00:00:00Z',
    expiryDate: '2025-01-15T00:00:00Z',
    scope: 'EU customer data processing and storage',
    auditedBy: 'EY Privacy & Data Protection',
    nextAudit: '2024-12-31T00:00:00Z',
    score: 92,
    attachments: 5,
  },
  {
    id: 'CERT-005',
    name: 'ISO 9001:2015',
    issuer: 'ISO',
    certNumber: 'ISO-9001-2024-123',
    type: 'ISO',
    status: 'expiring-soon',
    issuedDate: '2022-06-01T00:00:00Z',
    expiryDate: '2025-01-20T00:00:00Z',
    scope: 'Quality Management System for delivery operations',
    auditedBy: 'SGS',
    nextAudit: '2025-01-05T00:00:00Z',
    score: 88,
    attachments: 3,
  },
];

const MOCK_AUDITS: AuditRecord[] = [
  {
    id: 'AUD-001',
    name: 'Q4 2024 Security Audit',
    type: 'internal',
    status: 'completed',
    scheduledDate: '2024-12-01T09:00:00Z',
    completedDate: '2024-12-15T17:00:00Z',
    auditor: 'Sarah Chen',
    auditorOrg: 'Internal Security Team',
    scope: ['Access Controls', 'Data Encryption', 'Network Security', 'Incident Response'],
    findings: [
      {
        id: 'FIND-001',
        severity: 'major',
        title: 'Weak password policy on legacy systems',
        description: 'Some legacy admin accounts do not enforce MFA',
        status: 'in-progress',
        assignedTo: 'security@quickcommerce.com',
        dueDate: '2025-01-15T00:00:00Z',
      },
      {
        id: 'FIND-002',
        severity: 'minor',
        title: 'Outdated SSL certificates on staging environment',
        description: 'Staging server SSL cert expired 30 days ago',
        status: 'resolved',
        assignedTo: 'devops@quickcommerce.com',
        dueDate: '2024-12-20T00:00:00Z',
      },
    ],
    overallScore: 87,
    criticalIssues: 0,
    majorIssues: 1,
    minorIssues: 3,
  },
  {
    id: 'AUD-002',
    name: 'PCI-DSS Annual Compliance Audit',
    type: 'external',
    status: 'completed',
    scheduledDate: '2024-11-10T09:00:00Z',
    completedDate: '2024-11-25T17:00:00Z',
    auditor: 'Michael Roberts',
    auditorOrg: 'Trustwave',
    scope: ['Payment Processing', 'Card Data Storage', 'Network Segmentation', 'Access Logs'],
    findings: [
      {
        id: 'FIND-003',
        severity: 'observation',
        title: 'Enhanced logging recommended for payment gateway',
        description: 'Consider adding detailed transaction logs for forensic analysis',
        status: 'accepted-risk',
        assignedTo: 'payment-team@quickcommerce.com',
        dueDate: '2025-03-01T00:00:00Z',
      },
    ],
    overallScore: 98,
    criticalIssues: 0,
    majorIssues: 0,
    minorIssues: 1,
  },
  {
    id: 'AUD-003',
    name: 'ISO 27001 Surveillance Audit',
    type: 'third-party',
    status: 'scheduled',
    scheduledDate: '2025-02-10T09:00:00Z',
    auditor: 'BSI Audit Team',
    auditorOrg: 'BSI Group',
    scope: ['ISMS Implementation', 'Risk Assessment', 'Asset Management', 'Compliance'],
    findings: [],
    criticalIssues: 0,
    majorIssues: 0,
    minorIssues: 0,
  },
  {
    id: 'AUD-004',
    name: 'GDPR Data Protection Impact Assessment',
    type: 'regulatory',
    status: 'in-progress',
    scheduledDate: '2024-12-15T09:00:00Z',
    auditor: 'Emma Williams',
    auditorOrg: 'EY Privacy & Data Protection',
    scope: ['Data Collection', 'Data Processing', 'User Consent', 'Data Retention'],
    findings: [
      {
        id: 'FIND-004',
        severity: 'critical',
        title: 'Cookie consent banner missing on mobile app',
        description: 'Mobile application does not display proper cookie consent mechanism',
        status: 'open',
        assignedTo: 'mobile-team@quickcommerce.com',
        dueDate: '2024-12-30T00:00:00Z',
      },
    ],
    criticalIssues: 1,
    majorIssues: 0,
    minorIssues: 0,
  },
  {
    id: 'AUD-005',
    name: 'Financial Controls Audit FY2024',
    type: 'external',
    status: 'scheduled',
    scheduledDate: '2025-03-15T09:00:00Z',
    auditor: 'KPMG Audit Team',
    auditorOrg: 'KPMG India',
    scope: ['Revenue Recognition', 'Expense Management', 'Internal Controls', 'Fraud Prevention'],
    findings: [],
    criticalIssues: 0,
    majorIssues: 0,
    minorIssues: 0,
  },
];

const MOCK_POLICIES: Policy[] = [
  {
    id: 'POL-001',
    name: 'Data Privacy Policy',
    category: 'privacy',
    version: '3.5',
    status: 'active',
    effectiveDate: '2024-11-01T00:00:00Z',
    reviewDate: '2025-11-01T00:00:00Z',
    owner: 'legal@quickcommerce.com',
    approvedBy: 'CEO',
    description: 'Comprehensive data privacy policy covering customer and employee data handling',
    requiresAcknowledgment: true,
    acknowledgmentRate: 94,
    totalEmployees: 450,
    acknowledgedEmployees: 423,
  },
  {
    id: 'POL-002',
    name: 'Information Security Policy',
    category: 'security',
    version: '2.8',
    status: 'active',
    effectiveDate: '2024-09-15T00:00:00Z',
    reviewDate: '2025-09-15T00:00:00Z',
    owner: 'security@quickcommerce.com',
    approvedBy: 'CTO',
    description: 'Security controls, access management, and incident response procedures',
    requiresAcknowledgment: true,
    acknowledgmentRate: 98,
    totalEmployees: 450,
    acknowledgedEmployees: 441,
  },
  {
    id: 'POL-003',
    name: 'Code of Conduct',
    category: 'hr',
    version: '1.2',
    status: 'active',
    effectiveDate: '2024-01-01T00:00:00Z',
    reviewDate: '2025-01-01T00:00:00Z',
    owner: 'hr@quickcommerce.com',
    approvedBy: 'CEO',
    description: 'Employee code of conduct and ethical guidelines',
    requiresAcknowledgment: true,
    acknowledgmentRate: 100,
    totalEmployees: 450,
    acknowledgedEmployees: 450,
  },
  {
    id: 'POL-004',
    name: 'Vendor Management Policy',
    category: 'operational',
    version: '2.1',
    status: 'active',
    effectiveDate: '2024-06-01T00:00:00Z',
    reviewDate: '2025-06-01T00:00:00Z',
    owner: 'procurement@quickcommerce.com',
    approvedBy: 'CFO',
    description: 'Vendor onboarding, assessment, and ongoing management procedures',
    requiresAcknowledgment: false,
    acknowledgmentRate: 0,
    totalEmployees: 450,
    acknowledgedEmployees: 0,
  },
  {
    id: 'POL-005',
    name: 'Incident Response Plan',
    category: 'security',
    version: '2.1',
    status: 'under-review',
    effectiveDate: '2024-12-01T00:00:00Z',
    reviewDate: '2025-12-01T00:00:00Z',
    owner: 'security@quickcommerce.com',
    approvedBy: 'Pending',
    description: 'Security incident detection, response, and recovery procedures',
    requiresAcknowledgment: true,
    acknowledgmentRate: 67,
    totalEmployees: 450,
    acknowledgedEmployees: 301,
  },
  {
    id: 'POL-006',
    name: 'Financial Controls Policy',
    category: 'financial',
    version: '3.0',
    status: 'active',
    effectiveDate: '2024-04-01T00:00:00Z',
    reviewDate: '2025-04-01T00:00:00Z',
    owner: 'finance@quickcommerce.com',
    approvedBy: 'CFO',
    description: 'Expense approval, budget management, and financial reporting controls',
    requiresAcknowledgment: true,
    acknowledgmentRate: 96,
    totalEmployees: 450,
    acknowledgedEmployees: 432,
  },
];

const MOCK_METRICS: ComplianceMetrics = {
  overallScore: 92,
  totalDocuments: 10,
  validDocuments: 7,
  expiringDocuments: 1,
  expiredDocuments: 0,
  activeCertifications: 5,
  completedAudits: 2,
  openFindings: 2,
  criticalFindings: 1,
  policyCompliance: 92,
};

const MOCK_VIOLATIONS: ViolationAlert[] = [
  {
    id: 'VIO-001',
    type: 'expiry',
    severity: 'high',
    title: 'FSSAI License Expiring Soon',
    description: 'Food Safety License expires in 21 days. Renewal process must begin immediately.',
    affectedArea: 'Operational License',
    timestamp: '2024-12-20T08:00:00Z',
    status: 'open',
    assignedTo: 'ops@quickcommerce.com',
  },
  {
    id: 'VIO-002',
    type: 'audit-failure',
    severity: 'critical',
    title: 'GDPR Cookie Consent Missing on Mobile',
    description: 'Critical finding from GDPR audit - mobile app lacks proper cookie consent mechanism',
    affectedArea: 'Data Protection',
    timestamp: '2024-12-18T14:30:00Z',
    status: 'investigating',
    assignedTo: 'mobile-team@quickcommerce.com',
  },
  {
    id: 'VIO-003',
    type: 'policy-violation',
    severity: 'medium',
    title: 'Incident Response Plan Acknowledgment Low',
    description: 'Only 67% of employees have acknowledged the updated Incident Response Plan',
    affectedArea: 'Policy Compliance',
    timestamp: '2024-12-15T10:00:00Z',
    status: 'open',
    assignedTo: 'hr@quickcommerce.com',
  },
];

// --- API Functions ---

export async function fetchDocuments(): Promise<ComplianceDocument[]> {
  // TODO: Implement backend endpoint for compliance documents
  return [];
}

export async function fetchCertifications(): Promise<Certification[]> {
  // TODO: Implement backend endpoint for certifications
  return [];
}

export async function fetchAudits(): Promise<AuditRecord[]> {
  // TODO: Implement backend endpoint for audits
  return [];
}

export async function fetchPolicies(): Promise<Policy[]> {
  // TODO: Implement backend endpoint for policies
  return [];
}

export async function fetchMetrics(): Promise<ComplianceMetrics> {
  // TODO: Implement backend endpoint for compliance metrics
  return {
    totalDocuments: 0,
    expiringSoon: 0,
    expired: 0,
    complianceScore: 0,
    pendingAudits: 0,
    violations: 0,
  };
}

export async function fetchViolations(): Promise<ViolationAlert[]> {
  // TODO: Implement backend endpoint for violations
  return [];
}

export async function uploadDocument(doc: Partial<ComplianceDocument>): Promise<ComplianceDocument> {
  // TODO: Implement backend endpoint for uploading documents
  throw new Error('Not implemented');
}

export async function scheduleAudit(audit: Partial<AuditRecord>): Promise<AuditRecord> {
  // TODO: Implement backend endpoint for scheduling audits
  throw new Error('Not implemented');
}

export async function updateFindingStatus(findingId: string, status: string): Promise<void> {
  // TODO: Implement backend endpoint for updating finding status
  throw new Error('Not implemented');
}

export async function acknowledgePolicy(policyId: string): Promise<void> {
  // TODO: Implement backend endpoint for acknowledging policies
  throw new Error('Not implemented');
}

export async function generateComplianceReport(): Promise<{ url: string }> {
  // TODO: Implement backend endpoint for generating compliance reports
  throw new Error('Not implemented');
}
