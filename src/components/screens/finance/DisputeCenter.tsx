import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { AlertTriangle, UploadCloud, ChevronRight, X } from 'lucide-react';
import { ChargebackCase, fetchChargebacks } from './refundsApi';
import { ScrollArea } from "../../ui/scroll-area";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DisputeCenter({ open, onClose }: Props) {
  const [cases, setCases] = useState<ChargebackCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<ChargebackCase | null>(null);

  useEffect(() => {
      if (open) {
          fetchChargebacks().then(setCases);
      }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 gap-0 bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                     <AlertTriangle size={20} />
                 </div>
                 <div>
                     <DialogTitle className="text-xl font-bold text-gray-900">Dispute Center</DialogTitle>
                     <DialogDescription>Manage chargebacks and evidence submission</DialogDescription>
                 </div>
             </div>
             <Button variant="ghost" onClick={onClose}><X size={20}/></Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                 <div className="p-4 border-b border-gray-100 bg-gray-50">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Disputes ({cases.length})</h3>
                 </div>
                 <ScrollArea className="flex-1">
                     <div className="divide-y divide-gray-100">
                         {cases.map(c => (
                             <div 
                                key={c.id} 
                                onClick={() => setSelectedCase(c)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCase?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <Badge variant="outline" className={`${c.status === 'open' ? 'text-orange-600 bg-orange-50 border-orange-200' : ''}`}>
                                         {c.status}
                                     </Badge>
                                     <span className="text-xs text-gray-400">{new Date(c.initiatedAt).toLocaleDateString()}</span>
                                 </div>
                                 <h4 className="font-bold text-gray-900 text-sm mb-1">{c.reasonCode}</h4>
                                 <div className="flex justify-between items-center">
                                     <span className="text-sm font-mono text-gray-600">{c.amount} {c.currency}</span>
                                     <span className="text-xs text-gray-400">{c.cardNetwork}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </ScrollArea>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                 {selectedCase ? (
                     <div className="max-w-2xl mx-auto space-y-6">
                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <h2 className="text-lg font-bold text-gray-900 mb-4">Case Details: {selectedCase.id}</h2>
                             
                             <div className="grid grid-cols-2 gap-6 mb-6">
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase">Amount Disputed</p>
                                     <p className="text-xl font-bold">{selectedCase.amount} {selectedCase.currency}</p>
                                 </div>
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase">Order Reference</p>
                                     <p className="text-lg font-mono text-blue-600">{selectedCase.orderId}</p>
                                 </div>
                             </div>

                             {/* Timeline Mock */}
                             <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                 <div className="relative">
                                     <div className="absolute -left-[29px] bg-red-500 h-4 w-4 rounded-full border-2 border-white"></div>
                                     <p className="text-sm font-bold text-gray-900">Chargeback Initiated</p>
                                     <p className="text-xs text-gray-500">{new Date(selectedCase.initiatedAt).toLocaleString()}</p>
                                 </div>
                                 <div className="relative">
                                     <div className="absolute -left-[29px] bg-gray-300 h-4 w-4 rounded-full border-2 border-white"></div>
                                     <p className="text-sm font-bold text-gray-500">Evidence Submission Deadline</p>
                                     <p className="text-xs text-gray-500">Due in 5 days</p>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <h3 className="font-bold text-gray-900 mb-4">Evidence</h3>
                             <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                 <UploadCloud className="h-10 w-10 text-gray-300 mb-3" />
                                 <p className="text-sm font-medium text-gray-900">Upload evidence files</p>
                                 <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG (max 10MB)</p>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400">
                         <AlertTriangle size={48} className="mb-4 opacity-20" />
                         <p>Select a chargeback case to view details</p>
                     </div>
                 )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
