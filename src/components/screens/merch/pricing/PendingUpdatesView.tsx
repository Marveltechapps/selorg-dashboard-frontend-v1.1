import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { History, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";

interface PendingUpdatesViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingUpdatesView({ open, onOpenChange }: PendingUpdatesViewProps) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Mock data
  const [updates, setUpdates] = useState([
    { id: '1', sku: 'Cola Can 330ml', oldPrice: 1.50, newPrice: 1.65, date: '2024-07-20', reason: 'Supplier cost increase', user: 'jane', source: 'manual', marginImpact: '+2%', priority: 'high' },
    { id: '2', sku: 'Chips Salted 150g', oldPrice: 2.20, newPrice: 2.00, date: '2024-07-21', reason: 'Competitor matching', user: 'system', source: 'rule', marginImpact: '-4%', priority: 'medium' },
    { id: '3', sku: 'Water Bottle 500ml', oldPrice: 0.80, newPrice: 0.90, date: '2024-07-22', reason: 'Surge pricing rule', user: 'system', source: 'rule', marginImpact: '+8%', priority: 'low' },
  ]);

  const filteredUpdates = updates.filter(u => {
    const matchesUser = userFilter === 'all' || u.user === userFilter;
    const matchesSource = sourceFilter === 'all' || u.source === sourceFilter;
    const matchesPriority = priorityFilter === 'all' || u.priority === priorityFilter;
    return matchesUser && matchesSource && matchesPriority;
  });

  const handleApprove = (id: string) => {
    setUpdates(updates.filter(u => u.id !== id));
    toast.success("Price change approved and queued.");
  };

  const handleReject = () => {
    if (rejectId) {
        setUpdates(updates.filter(u => u.id !== rejectId));
        setRejectId(null);
        setRejectReason("");
        toast.info("Price change request rejected.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <History className="text-blue-500" /> Pending Price Updates
          </DialogTitle>
          <DialogDescription>
            Review and approve price changes requested manually or by the rule engine.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border">
                <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Requested By" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="jane">Jane Doe</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Source" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="rule">Rule Engine</SelectItem>
                        <SelectItem value="campaign">Campaign</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-md overflow-auto flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead>Current Price</TableHead>
                            <TableHead>Proposed Price</TableHead>
                            <TableHead>Margin Impact</TableHead>
                            <TableHead>Effective Date</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUpdates.map((update) => (
                            <TableRow key={update.id}>
                                <TableCell className="font-medium">{update.sku}</TableCell>
                                <TableCell className="text-slate-500">${update.oldPrice.toFixed(2)}</TableCell>
                                <TableCell className="font-bold text-slate-900">${update.newPrice.toFixed(2)}</TableCell>
                                <TableCell className={update.marginImpact.startsWith('+') ? "text-green-600" : "text-red-600"}>
                                    {update.marginImpact}
                                </TableCell>
                                <TableCell>{update.date}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={update.reason}>{update.reason}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{update.source}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(update.id)}>
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => setRejectId(update.id)}>
                                            Reject
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={!!rejectId} onOpenChange={(o) => !o && setRejectId(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Reject Price Change</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for rejecting this price change request.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Reason for rejection</Label>
                        <Input 
                            value={rejectReason} 
                            onChange={(e) => setRejectReason(e.target.value)} 
                            placeholder="Enter reason..." 
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setRejectId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
