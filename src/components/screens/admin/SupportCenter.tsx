import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchTickets,
  fetchAgents,
  fetchCannedResponses,
  fetchCategories,
  fetchSLAMetrics,
  fetchLiveChats,
  updateTicket,
  assignTicket,
  addTicketNote,
  closeTicket,
  SupportTicket,
  Agent,
  CannedResponse,
  TicketCategory,
  SLAMetrics,
  LiveChat,
} from './supportCenterApi';
import { toast } from 'sonner@2.0.3';
import {
  MessageSquare,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Send,
  MoreVertical,
  Eye,
  UserPlus,
  MessageCircle,
  Award,
  TrendingUp,
  Zap,
  Activity,
  Target,
  Users,
} from 'lucide-react';

export function SupportCenter() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics | null>(null);
  const [liveChats, setLiveChats] = useState<LiveChat[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewTicketOpen, setViewTicketOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;

      const [ticketsData, agentsData, cannedData, categoriesData, slaData, chatsData] = await Promise.all([
        fetchTickets(filters),
        fetchAgents(),
        fetchCannedResponses(),
        fetchCategories(),
        fetchSLAMetrics(),
        fetchLiveChats(),
      ]);

      setTickets(ticketsData);
      setAgents(agentsData);
      setCannedResponses(cannedData);
      setCategories(categoriesData);
      setSlaMetrics(slaData);
      setLiveChats(chatsData);
    } catch (error) {
      toast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setViewTicketOpen(true);
  };

  const handleAssignTicket = async (ticketId: string, agentId: string) => {
    try {
      await assignTicket(ticketId, agentId);
      toast.success('Ticket assigned successfully');
      loadData();
      if (selectedTicket?.id === ticketId) {
        setViewTicketOpen(false);
        setSelectedTicket(null);
      }
    } catch (error) {
      toast.error('Failed to assign ticket');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      await addTicketNote(selectedTicket.id, {
        ticketId: selectedTicket.id,
        authorId: 'agent-1',
        authorName: 'Current Agent',
        type: 'agent_reply',
        content: replyText,
        isInternal: false,
      });

      await updateTicket(selectedTicket.id, { status: 'in_progress' });

      toast.success('Reply sent successfully');
      setReplyText('');
      loadData();
      setViewTicketOpen(false);
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      await closeTicket(ticketId);
      toast.success('Ticket closed successfully');
      loadData();
      setViewTicketOpen(false);
    } catch (error) {
      toast.error('Failed to close ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await updateTicket(ticketId, { status: status as any });
      toast.success('Status updated');
      loadData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'resolved': return 'bg-emerald-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return '🛒';
      case 'payment': return '💳';
      case 'delivery': return '🚚';
      case 'account': return '👤';
      case 'technical': return '⚙️';
      case 'feedback': return '💬';
      default: return '📝';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.ticketNumber.toLowerCase().includes(query) ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.customerName.toLowerCase().includes(query) ||
      ticket.customerEmail.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#71717a]">Loading support center...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#18181b]">Support Center</h1>
          <p className="text-[#71717a] text-sm">Manage customer tickets and live chat support</p>
        </div>
        <Button size="sm" onClick={loadData} variant="outline">
          <RefreshCw size={14} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Open Tickets</p>
            <AlertCircle className="text-blue-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{tickets.filter(t => t.status === 'open').length}</p>
          <p className="text-xs text-[#71717a] mt-1">Awaiting response</p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">In Progress</p>
            <Activity className="text-purple-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{tickets.filter(t => t.status === 'in_progress').length}</p>
          <p className="text-xs text-[#71717a] mt-1">Being handled</p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Avg Response Time</p>
            <Clock className="text-amber-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{slaMetrics?.avgResponseTime}m</p>
          <p className="text-xs text-[#71717a] mt-1">Target: {slaMetrics?.firstResponseSLA}m</p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">SLA Compliance</p>
            <Target className="text-emerald-600" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">
            {slaMetrics ? Math.round((slaMetrics.withinSLA / slaMetrics.totalTickets) * 100) : 0}%
          </p>
          <p className="text-xs text-[#71717a] mt-1">{slaMetrics?.withinSLA} of {slaMetrics?.totalTickets}</p>
        </div>
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#71717a]">Active Agents</p>
            <Users className="text-[#e11d48]" size={16} />
          </div>
          <p className="text-2xl font-bold text-[#18181b]">{agents.filter(a => a.isOnline).length}</p>
          <p className="text-xs text-[#71717a] mt-1">of {agents.length} total</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all-tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-tickets">
            <MessageSquare size={14} className="mr-1.5" /> All Tickets
          </TabsTrigger>
          <TabsTrigger value="my-tickets">
            <User size={14} className="mr-1.5" /> My Tickets
          </TabsTrigger>
          <TabsTrigger value="live-chats">
            <MessageCircle size={14} className="mr-1.5" /> Live Chats ({liveChats.length})
          </TabsTrigger>
          <TabsTrigger value="canned">
            <Zap size={14} className="mr-1.5" /> Canned Responses
          </TabsTrigger>
          <TabsTrigger value="team">
            <Award size={14} className="mr-1.5" /> Team Performance
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Filter size={14} className="mr-1.5" /> Categories
          </TabsTrigger>
        </TabsList>

        {/* All Tickets Tab */}
        <TabsContent value="all-tickets">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            {/* Filters */}
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" size={16} />
                  <Input
                    placeholder="Search tickets by number, subject, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="order">Order Issues</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-[#71717a] py-8">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="cursor-pointer hover:bg-[#f4f4f5]" onClick={() => handleViewTicket(ticket)}>
                        <TableCell className="font-mono font-bold text-[#e11d48]">{ticket.ticketNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#18181b] line-clamp-1">{ticket.subject}</p>
                            {ticket.orderNumber && (
                              <p className="text-xs text-[#71717a]">Order: {ticket.orderNumber}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#18181b]">{ticket.customerName}</p>
                            <p className="text-xs text-[#71717a]">{ticket.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(ticket.category)}</span>
                            <span className="text-sm capitalize">{ticket.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(ticket.priority)} capitalize`}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(ticket.status)} capitalize`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ticket.assignedToName ? (
                            <span className="text-sm text-[#18181b]">{ticket.assignedToName}</span>
                          ) : (
                            <span className="text-xs text-[#a1a1aa]">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#71717a]">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewTicket(ticket); }}>
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* My Tickets Tab */}
        <TabsContent value="my-tickets">
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 shadow-sm">
            <div className="text-center py-12">
              <User className="mx-auto mb-4 text-[#a1a1aa]" size={48} />
              <h3 className="font-bold text-[#18181b] mb-2">My Assigned Tickets</h3>
              <p className="text-[#71717a] mb-4">
                You have {tickets.filter(t => t.assignedTo === 'agent-1').length} tickets assigned to you
              </p>
              <div className="space-y-2">
                {tickets.filter(t => t.assignedTo === 'agent-1').slice(0, 5).map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border border-[#e4e4e7] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#e11d48]">{ticket.ticketNumber}</span>
                      <span className="text-sm">{ticket.subject}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleViewTicket(ticket)}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Live Chats Tab */}
        <TabsContent value="live-chats">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Active Chat Sessions</h3>
              <p className="text-xs text-[#71717a] mt-1">{liveChats.length} active conversations</p>
            </div>

            <div className="p-6 space-y-3">
              {liveChats.length === 0 ? (
                <div className="text-center py-12 text-[#71717a]">
                  <MessageCircle className="mx-auto mb-3" size={48} />
                  <p>No active chats</p>
                </div>
              ) : (
                liveChats.map((chat) => (
                  <div key={chat.id} className="border border-[#e4e4e7] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-[#18181b]">{chat.customerName}</h4>
                        <p className="text-xs text-[#71717a]">
                          {chat.status === 'waiting' ? (
                            <span className="text-amber-600">Waiting for {chat.waitTime}s</span>
                          ) : (
                            <span className="text-emerald-600">Handled by {chat.agentName}</span>
                          )}
                        </p>
                      </div>
                      <Badge className={chat.status === 'waiting' ? 'bg-amber-500' : 'bg-emerald-500'}>
                        {chat.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                      {chat.messages.map((msg) => (
                        <div key={msg.id} className={`p-2 rounded ${msg.senderType === 'customer' ? 'bg-[#f4f4f5]' : 'bg-blue-50'}`}>
                          <p className="text-xs font-medium text-[#52525b]">{msg.senderName}</p>
                          <p className="text-sm text-[#18181b]">{msg.message}</p>
                        </div>
                      ))}
                    </div>

                    {chat.status === 'waiting' && (
                      <Button size="sm" className="w-full">
                        <UserPlus size={14} className="mr-1.5" /> Accept Chat
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Canned Responses Tab */}
        <TabsContent value="canned">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Quick Reply Templates</h3>
              <p className="text-xs text-[#71717a] mt-1">{cannedResponses.length} templates available</p>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
              {cannedResponses.map((response) => (
                <div key={response.id} className="border border-[#e4e4e7] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-[#18181b]">{response.title}</h4>
                    <Badge variant="outline" className="text-xs">{response.category}</Badge>
                  </div>
                  <p className="text-sm text-[#71717a] mb-3 line-clamp-3">{response.content}</p>
                  <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                    <span>Used {response.usageCount} times</span>
                    <Button size="sm" variant="ghost">
                      <Send size={12} className="mr-1" /> Use
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Team Performance Tab */}
        <TabsContent value="team">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Team Leaderboard</h3>
              <p className="text-xs text-[#71717a] mt-1">Agent performance metrics</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Tickets</TableHead>
                    <TableHead>Total Resolved</TableHead>
                    <TableHead>Avg Resolution Time</TableHead>
                    <TableHead>Satisfaction Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent, index) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e11d48] text-white flex items-center justify-center font-bold text-xs">
                            {agent.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-[#18181b]">{agent.name}</p>
                            <p className="text-xs text-[#71717a]">{agent.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {agent.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          <span className="text-sm">{agent.isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-[#18181b]">{agent.activeTickets}</span>
                        <span className="text-xs text-[#71717a]"> / {agent.maxTicketCapacity}</span>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">{agent.totalResolved}</TableCell>
                      <TableCell className="font-mono">{agent.avgResolutionTime}m</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#18181b]">{agent.satisfactionScore}</span>
                          <span className="text-amber-500">★</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="bg-white border border-[#e4e4e7] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#e4e4e7] bg-[#fcfcfc]">
              <h3 className="font-bold text-[#18181b]">Ticket Categories</h3>
              <p className="text-xs text-[#71717a] mt-1">Performance by category</p>
            </div>

            <div className="p-6 grid grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border border-[#e4e4e7] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#f4f4f5] rounded-lg flex items-center justify-center text-2xl">
                      {getCategoryIcon(category.name.toLowerCase().split(' ')[0])}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#18181b]">{category.name}</h4>
                      <p className="text-xs text-[#71717a]">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#71717a]">Total Tickets</p>
                      <p className="text-xl font-bold text-[#18181b]">{category.ticketCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#71717a]">Avg Resolution</p>
                      <p className="text-xl font-bold text-[#18181b]">{category.avgResolutionTime}m</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#e4e4e7]">
                    <p className="text-xs text-[#71717a]">SLA Target: {category.slaTarget} minutes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Ticket Modal */}
      <Dialog open={viewTicketOpen} onOpenChange={setViewTicketOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Ticket Details - {selectedTicket?.ticketNumber}</span>
              <Badge className={selectedTicket ? getPriorityColor(selectedTicket.priority) : ''}>
                {selectedTicket?.priority}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Created on {selectedTicket ? new Date(selectedTicket.createdAt).toLocaleString() : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-[#f4f4f5] rounded-lg">
                <h4 className="font-bold text-[#18181b] mb-2">Customer Information</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[#71717a]">Name</p>
                    <p className="font-medium">{selectedTicket.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a]">Email</p>
                    <p className="font-medium">{selectedTicket.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-[#71717a]">Phone</p>
                    <p className="font-medium">{selectedTicket.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div>
                <h4 className="font-bold text-[#18181b] mb-2">Subject</h4>
                <p className="text-[#18181b]">{selectedTicket.subject}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#18181b] mb-2">Description</h4>
                <p className="text-[#71717a]">{selectedTicket.description}</p>
              </div>

              {/* Assignment */}
              <div>
                <Label className="mb-2 block">Assign to Agent</Label>
                <Select
                  value={selectedTicket.assignedTo || ''}
                  onValueChange={(val) => handleAssignTicket(selectedTicket.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.filter(a => a.isOnline).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.activeTickets}/{agent.maxTicketCapacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label className="mb-2 block">Status</Label>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(val) => handleStatusChange(selectedTicket.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-bold text-[#18181b] mb-3">Timeline</h4>
                <div className="space-y-3">
                  {selectedTicket.notes.map((note) => (
                    <div key={note.id} className={`p-3 rounded-lg ${note.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{note.authorName}</span>
                        <span className="text-xs text-[#71717a]">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-[#18181b]">{note.content}</p>
                      {note.isInternal && <Badge variant="outline" className="mt-1 text-xs">Internal Note</Badge>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply */}
              <div>
                <Label className="mb-2 block">Send Reply</Label>
                <textarea
                  className="w-full min-h-24 p-3 border border-[#e4e4e7] rounded-lg text-sm resize-none"
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSendReply} className="flex-1">
                  <Send size={14} className="mr-1.5" /> Send Reply
                </Button>
                <Button variant="outline" onClick={() => handleCloseTicket(selectedTicket.id)}>
                  <CheckCircle size={14} className="mr-1.5" /> Close Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
