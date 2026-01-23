import { apiRequest } from '@/api/apiClient';

// --- Type Definitions ---

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'order' | 'payment' | 'delivery' | 'account' | 'technical' | 'feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerId: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  orderNumber?: string;
  responseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  slaBreached: boolean;
  rating?: number;
  notes: TicketNote[];
}

export interface TicketNote {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  type: 'customer_reply' | 'agent_reply' | 'internal_note' | 'status_change' | 'assignment';
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'agent' | 'senior_agent' | 'team_lead' | 'manager';
  isOnline: boolean;
  activeTickets: number;
  totalResolved: number;
  avgResolutionTime: number; // in minutes
  satisfactionScore: number;
  maxTicketCapacity: number;
}

export interface CannedResponse {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  usageCount: number;
  createdBy: string;
  lastUsed?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  ticketCount: number;
  avgResolutionTime: number;
  slaTarget: number; // in minutes
}

export interface SLAMetrics {
  totalTickets: number;
  withinSLA: number;
  breachedSLA: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  firstResponseSLA: number; // target in minutes
  resolutionSLA: number; // target in minutes
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'agent';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface LiveChat {
  id: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
  messages: ChatMessage[];
  waitTime: number; // in seconds
}

// --- Mock Data ---

const MOCK_AGENTS: Agent[] = [
  { id: 'agent-1', name: 'Priya Sharma', email: 'priya@quickcommerce.com', avatar: 'PS', role: 'team_lead', isOnline: true, activeTickets: 8, totalResolved: 342, avgResolutionTime: 24, satisfactionScore: 4.8, maxTicketCapacity: 15 },
  { id: 'agent-2', name: 'Rahul Verma', email: 'rahul@quickcommerce.com', avatar: 'RV', role: 'senior_agent', isOnline: true, activeTickets: 12, totalResolved: 278, avgResolutionTime: 32, satisfactionScore: 4.6, maxTicketCapacity: 15 },
  { id: 'agent-3', name: 'Anjali Patel', email: 'anjali@quickcommerce.com', avatar: 'AP', role: 'agent', isOnline: true, activeTickets: 6, totalResolved: 156, avgResolutionTime: 45, satisfactionScore: 4.4, maxTicketCapacity: 12 },
  { id: 'agent-4', name: 'Karan Singh', email: 'karan@quickcommerce.com', avatar: 'KS', role: 'agent', isOnline: false, activeTickets: 3, totalResolved: 189, avgResolutionTime: 38, satisfactionScore: 4.5, maxTicketCapacity: 12 },
  { id: 'agent-5', name: 'Sneha Reddy', email: 'sneha@quickcommerce.com', avatar: 'SR', role: 'manager', isOnline: true, activeTickets: 2, totalResolved: 512, avgResolutionTime: 18, satisfactionScore: 4.9, maxTicketCapacity: 10 },
];

let MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    ticketNumber: 'TKT-10245',
    subject: 'Order not delivered - Wrong address',
    description: 'I ordered groceries but they were delivered to the wrong address. Order #ORD-78234',
    category: 'delivery',
    priority: 'high',
    status: 'in_progress',
    customerName: 'Amit Kumar',
    customerEmail: 'amit.k@email.com',
    customerPhone: '+91-98765-43210',
    customerId: 'cust-1001',
    assignedTo: 'agent-1',
    assignedToName: 'Priya Sharma',
    createdAt: '2024-12-20T10:30:00Z',
    updatedAt: '2024-12-20T11:15:00Z',
    tags: ['delivery_issue', 'urgent'],
    orderNumber: 'ORD-78234',
    responseTime: 12,
    slaBreached: false,
    notes: [
      { id: 'note-1', ticketId: 'ticket-1', authorId: 'cust-1001', authorName: 'Amit Kumar', type: 'customer_reply', content: 'I ordered groceries but they were delivered to the wrong address. Order #ORD-78234', createdAt: '2024-12-20T10:30:00Z', isInternal: false },
      { id: 'note-2', ticketId: 'ticket-1', authorId: 'agent-1', authorName: 'Priya Sharma', type: 'assignment', content: 'Ticket assigned to Priya Sharma', createdAt: '2024-12-20T10:35:00Z', isInternal: true },
      { id: 'note-3', ticketId: 'ticket-1', authorId: 'agent-1', authorName: 'Priya Sharma', type: 'agent_reply', content: 'Hi Amit, I apologize for the inconvenience. I am checking with our delivery partner about this issue. Can you confirm the address where it was delivered?', createdAt: '2024-12-20T10:42:00Z', isInternal: false },
    ],
  },
  {
    id: 'ticket-2',
    ticketNumber: 'TKT-10244',
    subject: 'Refund not received for cancelled order',
    description: 'I cancelled order #ORD-78190 3 days ago but haven\'t received my refund yet.',
    category: 'payment',
    priority: 'medium',
    status: 'open',
    customerName: 'Neha Gupta',
    customerEmail: 'neha.gupta@email.com',
    customerPhone: '+91-98765-43211',
    customerId: 'cust-1002',
    assignedTo: 'agent-2',
    assignedToName: 'Rahul Verma',
    createdAt: '2024-12-20T09:15:00Z',
    updatedAt: '2024-12-20T09:15:00Z',
    tags: ['refund', 'payment'],
    orderNumber: 'ORD-78190',
    slaBreached: false,
    notes: [
      { id: 'note-4', ticketId: 'ticket-2', authorId: 'cust-1002', authorName: 'Neha Gupta', type: 'customer_reply', content: 'I cancelled order #ORD-78190 3 days ago but haven\'t received my refund yet.', createdAt: '2024-12-20T09:15:00Z', isInternal: false },
    ],
  },
  {
    id: 'ticket-3',
    ticketNumber: 'TKT-10243',
    subject: 'Unable to apply coupon code',
    description: 'The coupon code SAVE20 is not working at checkout. Getting error message.',
    category: 'technical',
    priority: 'low',
    status: 'resolved',
    customerName: 'Rajesh Patel',
    customerEmail: 'rajesh.p@email.com',
    customerPhone: '+91-98765-43212',
    customerId: 'cust-1003',
    assignedTo: 'agent-3',
    assignedToName: 'Anjali Patel',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:45:00Z',
    resolvedAt: '2024-12-20T08:45:00Z',
    tags: ['coupon', 'technical'],
    responseTime: 8,
    resolutionTime: 45,
    slaBreached: false,
    rating: 5,
    notes: [
      { id: 'note-5', ticketId: 'ticket-3', authorId: 'cust-1003', authorName: 'Rajesh Patel', type: 'customer_reply', content: 'The coupon code SAVE20 is not working at checkout. Getting error message.', createdAt: '2024-12-20T08:00:00Z', isInternal: false },
      { id: 'note-6', ticketId: 'ticket-3', authorId: 'agent-3', authorName: 'Anjali Patel', type: 'agent_reply', content: 'The coupon code has expired. I\'ve added a new code FRESH20 to your account. Please try again.', createdAt: '2024-12-20T08:08:00Z', isInternal: false },
      { id: 'note-7', ticketId: 'ticket-3', authorId: 'agent-3', authorName: 'Anjali Patel', type: 'status_change', content: 'Status changed to Resolved', createdAt: '2024-12-20T08:45:00Z', isInternal: true },
    ],
  },
  {
    id: 'ticket-4',
    ticketNumber: 'TKT-10242',
    subject: 'Wrong item delivered',
    description: 'Ordered 1kg sugar but received salt instead. Need urgent replacement.',
    category: 'order',
    priority: 'urgent',
    status: 'in_progress',
    customerName: 'Priya Mehta',
    customerEmail: 'priya.m@email.com',
    customerPhone: '+91-98765-43213',
    customerId: 'cust-1004',
    assignedTo: 'agent-1',
    assignedToName: 'Priya Sharma',
    createdAt: '2024-12-20T11:00:00Z',
    updatedAt: '2024-12-20T11:10:00Z',
    tags: ['wrong_item', 'replacement'],
    orderNumber: 'ORD-78245',
    responseTime: 5,
    slaBreached: false,
    notes: [
      { id: 'note-8', ticketId: 'ticket-4', authorId: 'cust-1004', authorName: 'Priya Mehta', type: 'customer_reply', content: 'Ordered 1kg sugar but received salt instead. Need urgent replacement.', createdAt: '2024-12-20T11:00:00Z', isInternal: false },
      { id: 'note-9', ticketId: 'ticket-4', authorId: 'agent-1', authorName: 'Priya Sharma', type: 'agent_reply', content: 'I sincerely apologize for this error. I\'m arranging an immediate replacement delivery within the next 30 minutes.', createdAt: '2024-12-20T11:05:00Z', isInternal: false },
    ],
  },
  {
    id: 'ticket-5',
    ticketNumber: 'TKT-10241',
    subject: 'Account login issues',
    description: 'Cannot login to my account. Password reset not working.',
    category: 'account',
    priority: 'medium',
    status: 'open',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.s@email.com',
    customerPhone: '+91-98765-43214',
    customerId: 'cust-1005',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-20T10:00:00Z',
    tags: ['login', 'account'],
    slaBreached: false,
    notes: [
      { id: 'note-10', ticketId: 'ticket-5', authorId: 'cust-1005', authorName: 'Vikram Singh', type: 'customer_reply', content: 'Cannot login to my account. Password reset not working.', createdAt: '2024-12-20T10:00:00Z', isInternal: false },
    ],
  },
  {
    id: 'ticket-6',
    ticketNumber: 'TKT-10240',
    subject: 'Delivery delayed by 2 hours',
    description: 'Expected delivery at 6 PM, still not received. Order #ORD-78220',
    category: 'delivery',
    priority: 'high',
    status: 'in_progress',
    customerName: 'Sunita Rao',
    customerEmail: 'sunita.r@email.com',
    customerPhone: '+91-98765-43215',
    customerId: 'cust-1006',
    assignedTo: 'agent-2',
    assignedToName: 'Rahul Verma',
    createdAt: '2024-12-20T08:30:00Z',
    updatedAt: '2024-12-20T09:00:00Z',
    tags: ['delay', 'tracking'],
    orderNumber: 'ORD-78220',
    responseTime: 15,
    slaBreached: false,
    notes: [],
  },
  {
    id: 'ticket-7',
    ticketNumber: 'TKT-10239',
    subject: 'Charged twice for same order',
    description: 'My credit card was charged twice for order #ORD-78195',
    category: 'payment',
    priority: 'urgent',
    status: 'open',
    customerName: 'Arjun Khanna',
    customerEmail: 'arjun.k@email.com',
    customerPhone: '+91-98765-43216',
    customerId: 'cust-1007',
    createdAt: '2024-12-20T11:30:00Z',
    updatedAt: '2024-12-20T11:30:00Z',
    tags: ['double_charge', 'payment'],
    orderNumber: 'ORD-78195',
    slaBreached: false,
    notes: [],
  },
  {
    id: 'ticket-8',
    ticketNumber: 'TKT-10238',
    subject: 'Great service!',
    description: 'Just wanted to thank the team for excellent delivery experience.',
    category: 'feedback',
    priority: 'low',
    status: 'closed',
    customerName: 'Kavita Desai',
    customerEmail: 'kavita.d@email.com',
    customerPhone: '+91-98765-43217',
    customerId: 'cust-1008',
    assignedTo: 'agent-5',
    assignedToName: 'Sneha Reddy',
    createdAt: '2024-12-19T16:00:00Z',
    updatedAt: '2024-12-19T16:30:00Z',
    resolvedAt: '2024-12-19T16:30:00Z',
    tags: ['positive', 'feedback'],
    responseTime: 10,
    resolutionTime: 30,
    slaBreached: false,
    rating: 5,
    notes: [],
  },
];

const MOCK_CANNED_RESPONSES: CannedResponse[] = [
  { id: 'canned-1', title: 'Order Delay Apology', category: 'delivery', content: 'We sincerely apologize for the delay in your order delivery. Our team is working to get your order to you as soon as possible. You can track your order in real-time using the tracking link.', tags: ['delay', 'apology'], usageCount: 145, createdBy: 'agent-5', lastUsed: '2024-12-20T10:00:00Z' },
  { id: 'canned-2', title: 'Refund Processing', category: 'payment', content: 'Your refund has been initiated and will be processed within 5-7 business days. The amount will be credited to your original payment method. You will receive a confirmation email once processed.', tags: ['refund', 'payment'], usageCount: 234, createdBy: 'agent-5', lastUsed: '2024-12-20T09:30:00Z' },
  { id: 'canned-3', title: 'Order Cancellation Confirmation', category: 'order', content: 'Your order has been successfully cancelled. If any amount was charged, it will be refunded to your original payment method within 5-7 business days.', tags: ['cancellation', 'order'], usageCount: 189, createdBy: 'agent-5', lastUsed: '2024-12-20T08:15:00Z' },
  { id: 'canned-4', title: 'Technical Issue Escalation', category: 'technical', content: 'Thank you for reporting this technical issue. I have escalated this to our technical team who will investigate and resolve it. We will update you within 24 hours.', tags: ['technical', 'escalation'], usageCount: 98, createdBy: 'agent-2', lastUsed: '2024-12-19T15:00:00Z' },
  { id: 'canned-5', title: 'Account Verification', category: 'account', content: 'For security purposes, please verify your account by clicking the link sent to your registered email address. If you did not receive the email, please check your spam folder or request a new verification link.', tags: ['account', 'verification'], usageCount: 167, createdBy: 'agent-3', lastUsed: '2024-12-20T07:00:00Z' },
  { id: 'canned-6', title: 'Wrong Item Replacement', category: 'order', content: 'We apologize for delivering the wrong item. I have arranged for a replacement delivery which will reach you within the next 60 minutes. The incorrect item can be returned to our delivery partner at no extra cost.', tags: ['wrong_item', 'replacement'], usageCount: 76, createdBy: 'agent-1', lastUsed: '2024-12-20T11:05:00Z' },
  { id: 'canned-7', title: 'Coupon Code Issue', category: 'technical', content: 'I apologize for the inconvenience with the coupon code. I have applied a discount of [AMOUNT] to your account which you can use on your next order. The coupon code [CODE] is now active on your account.', tags: ['coupon', 'discount'], usageCount: 203, createdBy: 'agent-3', lastUsed: '2024-12-20T08:08:00Z' },
  { id: 'canned-8', title: 'Positive Feedback Thank You', category: 'feedback', content: 'Thank you so much for your kind words! We are delighted to hear about your positive experience. Your feedback motivates us to continue providing excellent service.', tags: ['feedback', 'positive'], usageCount: 312, createdBy: 'agent-5', lastUsed: '2024-12-19T16:10:00Z' },
];

const MOCK_CATEGORIES: TicketCategory[] = [
  { id: 'cat-1', name: 'Order Issues', description: 'Problems with orders, items, quantities', icon: 'ShoppingBag', ticketCount: 145, avgResolutionTime: 35, slaTarget: 60 },
  { id: 'cat-2', name: 'Payment & Refunds', description: 'Payment failures, refunds, charges', icon: 'CreditCard', ticketCount: 98, avgResolutionTime: 45, slaTarget: 120 },
  { id: 'cat-3', name: 'Delivery', description: 'Delivery delays, wrong address, tracking', icon: 'Truck', ticketCount: 167, avgResolutionTime: 28, slaTarget: 30 },
  { id: 'cat-4', name: 'Account', description: 'Login issues, profile updates, verification', icon: 'User', ticketCount: 56, avgResolutionTime: 22, slaTarget: 45 },
  { id: 'cat-5', name: 'Technical', description: 'App crashes, bugs, features not working', icon: 'AlertCircle', ticketCount: 78, avgResolutionTime: 67, slaTarget: 180 },
  { id: 'cat-6', name: 'Feedback', description: 'Customer feedback, suggestions, compliments', icon: 'MessageSquare', ticketCount: 34, avgResolutionTime: 15, slaTarget: 1440 },
];

let MOCK_LIVE_CHATS: LiveChat[] = [
  {
    id: 'chat-1',
    customerId: 'cust-2001',
    customerName: 'Rohit Sharma',
    agentId: 'agent-1',
    agentName: 'Priya Sharma',
    status: 'active',
    startedAt: '2024-12-20T11:45:00Z',
    waitTime: 45,
    messages: [
      { id: 'msg-1', chatId: 'chat-1', senderId: 'cust-2001', senderName: 'Rohit Sharma', senderType: 'customer', message: 'Hi, I need help with my order', timestamp: '2024-12-20T11:45:00Z', isRead: true },
      { id: 'msg-2', chatId: 'chat-1', senderId: 'agent-1', senderName: 'Priya Sharma', senderType: 'agent', message: 'Hello Rohit! I\'m here to help. What\'s your order number?', timestamp: '2024-12-20T11:45:45Z', isRead: true },
      { id: 'msg-3', chatId: 'chat-1', senderId: 'cust-2001', senderName: 'Rohit Sharma', senderType: 'customer', message: 'ORD-78250', timestamp: '2024-12-20T11:46:15Z', isRead: true },
    ],
  },
  {
    id: 'chat-2',
    customerId: 'cust-2002',
    customerName: 'Meera Iyer',
    status: 'waiting',
    startedAt: '2024-12-20T11:50:00Z',
    waitTime: 120,
    messages: [
      { id: 'msg-4', chatId: 'chat-2', senderId: 'cust-2002', senderName: 'Meera Iyer', senderType: 'customer', message: 'Need support urgently', timestamp: '2024-12-20T11:50:00Z', isRead: false },
    ],
  },
];

const MOCK_SLA_METRICS: SLAMetrics = {
  totalTickets: 544,
  withinSLA: 487,
  breachedSLA: 57,
  avgResponseTime: 18,
  avgResolutionTime: 42,
  firstResponseSLA: 30,
  resolutionSLA: 120,
};

// --- API Functions ---

export async function fetchTickets(filters?: { status?: string; priority?: string; category?: string; assignedTo?: string }): Promise<SupportTicket[]> {
  // TODO: Implement backend endpoint for support tickets
  return [];
}

export async function fetchTicketById(id: string): Promise<SupportTicket | null> {
  // TODO: Implement backend endpoint for ticket details
  return null;
}

export async function createTicket(data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<SupportTicket> {
  // TODO: Implement backend endpoint for creating tickets
  throw new Error('Not implemented');
}

export async function updateTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
  // TODO: Implement backend endpoint for updating tickets
  throw new Error('Not implemented');
}

export async function assignTicket(ticketId: string, agentId: string): Promise<SupportTicket> {
  // TODO: Implement backend endpoint for assigning tickets
  throw new Error('Not implemented');
}

export async function addTicketNote(ticketId: string, note: Omit<TicketNote, 'id' | 'createdAt'>): Promise<TicketNote> {
  // TODO: Implement backend endpoint for adding ticket notes
  throw new Error('Not implemented');
}

export async function fetchAgents(): Promise<Agent[]> {
  // TODO: Implement backend endpoint for agents
  return [];
}

export async function fetchCannedResponses(): Promise<CannedResponse[]> {
  // TODO: Implement backend endpoint for canned responses
  return [];
}

export async function fetchCategories(): Promise<TicketCategory[]> {
  // TODO: Implement backend endpoint for ticket categories
  return [];
}

export async function fetchSLAMetrics(): Promise<SLAMetrics> {
  // TODO: Implement backend endpoint for SLA metrics
  return {
    avgResponseTime: 0,
    avgResolutionTime: 0,
    slaCompliance: 0,
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    breachedTickets: 0,
  };
}

export async function fetchLiveChats(): Promise<LiveChat[]> {
  // TODO: Implement backend endpoint for live chats
  return [];
}

export async function sendChatMessage(chatId: string, senderId: string, senderName: string, senderType: 'customer' | 'agent', message: string): Promise<ChatMessage> {
  // TODO: Implement backend endpoint for sending chat messages
  throw new Error('Not implemented');
}

export async function closeTicket(ticketId: string): Promise<SupportTicket> {
  // TODO: Implement backend endpoint for closing tickets
  throw new Error('Not implemented');
}
