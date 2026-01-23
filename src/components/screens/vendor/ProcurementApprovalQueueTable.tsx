import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "../../ui/table";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";
import { 
    CheckCircle2, 
    XCircle, 
    ArrowUpDown, 
    Filter,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { ProcurementApprovalTask, ProcurementTaskType } from './procurementApprovalsApi';

interface Props {
  tasks: ProcurementApprovalTask[];
  isLoading: boolean;
  onTaskClick: (task: ProcurementApprovalTask) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (id: string) => void;
}

export function ProcurementApprovalQueueTable({ tasks, isLoading, onTaskClick, onQuickApprove, onQuickReject }: Props) {
  
  if (isLoading) {
      return (
          <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
              ))}
          </div>
      );
  }

  if (tasks.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-gray-50/50 border-dashed">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                  <CheckCircle2 className="text-green-600 h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
              <p className="text-gray-500 max-w-sm mt-1">No pending procurement approvals found.</p>
          </div>
      );
  }

  const getTypeBadge = (type: ProcurementTaskType) => {
      switch (type) {
          case 'vendor_onboarding': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">Onboarding</Badge>;
          case 'purchase_order': return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">PO</Badge>;
          case 'contract_renewal': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">Contract</Badge>;
          case 'price_change': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-0">Price Change</Badge>;
          case 'payment_release': return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Payment</Badge>;
          default: return <Badge variant="outline" className="text-gray-600">Other</Badge>;
      }
  };

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
            <h3 className="font-bold text-[#212121]">Approval Queue</h3>
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                    <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
                 </Button>
                 <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" /> Sort
                 </Button>
            </div>
        </div>

        <Table>
            <TableHeader className="bg-[#F5F7FA]">
                <TableRow>
                    <TableHead className="w-[140px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map((task) => (
                    <TableRow 
                        key={task.id} 
                        className="group cursor-pointer hover:bg-gray-50/80 transition-colors"
                        onClick={() => onTaskClick(task)}
                    >
                        <TableCell className="font-medium align-top py-4">
                            <div className="flex flex-col gap-2">
                                {getTypeBadge(task.type)}
                                {task.priority === 'high' && (
                                    <span className="inline-flex items-center text-[10px] font-bold text-red-600 uppercase">
                                        <AlertCircle size={10} className="mr-1" /> High Priority
                                    </span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                            <div className="flex flex-col">
                                <span className="font-medium text-[#212121]">{task.description}</span>
                                <span className="text-xs text-[#757575] mt-1 line-clamp-1">{task.details}</span>
                            </div>
                        </TableCell>
                        <TableCell className="align-top py-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">{task.requesterName}</span>
                                <span className="text-xs text-gray-500">{task.requesterRole}</span>
                            </div>
                        </TableCell>
                         <TableCell className="align-top py-4">
                            <span className="font-bold text-[#212121]">
                                {task.valueAmount ? `$${task.valueAmount.toLocaleString()}` : '—'}
                            </span>
                        </TableCell>
                        <TableCell className="text-right align-top py-4">
                            <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => onQuickApprove(task.id)}
                                    title="Quick Approve"
                                >
                                    <CheckCircle2 size={18} />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => onQuickReject(task.id)}
                                    title="Quick Reject"
                                >
                                    <XCircle size={18} />
                                </Button>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 ml-2" />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
