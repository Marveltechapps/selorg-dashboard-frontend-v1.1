import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import { Package, CreditCard, User, FileText, CheckCircle2, XCircle } from "lucide-react";
import { RefundRequest } from './refundsApi';

interface Props {
  refund: RefundRequest | null;
  open: boolean;
  onClose: () => void;
  onApprove: (refund: RefundRequest) => void;
  onReject: (refund: RefundRequest) => void;
}

export function RefundDetailsDrawer({ refund, open, onClose, onApprove, onReject }: Props) {
  if (!refund) return null;

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col h-full bg-white">
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Request Details</span>
                <Badge variant="outline" className={`ml-auto capitalize ${
                    refund.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    refund.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    refund.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''
                }`}>
                    {refund.status}
                </Badge>
            </div>
            <SheetTitle className="text-xl font-bold text-gray-900">
                Refund for Order #{refund.orderId}
            </SheetTitle>
            <SheetDescription className="hidden">
                Detailed view of refund request for order #{refund.orderId}
            </SheetDescription>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
                {/* Customer Info */}
                <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                        <User size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900">{refund.customerName}</h4>
                        <p className="text-sm text-gray-500">{refund.customerEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">Customer ID: {refund.customerId}</p>
                    </div>
                </div>

                <Separator />

                {/* Refund Request Info */}
                <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                        <FileText size={18} /> Request Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 text-sm">
                         <div className="flex justify-between">
                             <span className="text-gray-500">Reason</span>
                             <span className="font-medium capitalize">{refund.reasonCode.replace('_', ' ')}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-500">Requested</span>
                             <span className="font-medium">{new Date(refund.requestedAt).toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between">
                             <span className="text-gray-500">Channel</span>
                             <span className="font-medium capitalize">{refund.channel.replace('_', ' ')}</span>
                         </div>
                         <Separator className="bg-gray-200" />
                         <div>
                             <span className="text-gray-500 block mb-1">Customer Note</span>
                             <p className="text-gray-900 italic">"{refund.reasonText}"</p>
                         </div>
                    </div>
                </div>

                {/* Financials */}
                 <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                        <CreditCard size={18} /> Financials
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
                            <span className="text-sm text-gray-600">Refund Amount</span>
                            <span className="text-xl font-bold text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: refund.currency }).format(refund.amount)}
                            </span>
                        </div>
                        <div className="p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Original Payment ID</span>
                                <span className="font-mono text-gray-700">{refund.paymentId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Payment Method</span>
                                <span className="text-gray-700">Visa ending 4242</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Mock */}
                <div className="space-y-4">
                     <h4 className="font-semibold flex items-center gap-2">
                        <Package size={18} /> Order Context
                    </h4>
                    <div className="text-sm text-gray-500">
                        <p>Order delivered on Oct 10, 2024.</p>
                        <p>Total items: 5</p>
                        <p>No previous refunds for this order.</p>
                    </div>
                </div>
            </div>
        </ScrollArea>

        {refund.status === 'pending' && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                    onClick={() => onReject(refund)}
                >
                    <XCircle size={16} className="mr-2" /> Reject
                </Button>
                <Button 
                    className="flex-1 bg-[#14B8A6] hover:bg-[#0D9488]" 
                    onClick={() => onApprove(refund)}
                >
                    <CheckCircle2 size={16} className="mr-2" /> Approve
                </Button>
            </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
