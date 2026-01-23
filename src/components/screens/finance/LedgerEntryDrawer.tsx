import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";
import { Skeleton } from "../../ui/skeleton";
import { format } from "date-fns";
import { FileText, ExternalLink, User } from 'lucide-react';
import { LedgerEntry, JournalEntry, fetchJournalDetails } from './accountingApi';

interface Props {
  entry: LedgerEntry | null;
  open: boolean;
  onClose: () => void;
}

export function LedgerEntryDrawer({ entry, open, onClose }: Props) {
  const [details, setDetails] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (open && entry) {
          setLoading(true);
          fetchJournalDetails(entry.journalId).then(data => {
              setDetails(data);
              setLoading(false);
          });
      } else {
          setDetails(null);
      }
  }, [open, entry]);

  if (!entry) return null;

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-[400px] sm:w-[600px] p-0 flex flex-col h-full bg-white">
        <div className="p-6 border-b border-gray-100 bg-[#FAFAFA]">
             <div className="flex items-center gap-2 mb-2">
                 <Badge variant="outline" className="font-mono text-xs text-gray-500 border-gray-300">
                     {entry.reference}
                 </Badge>
                 <Badge className={`bg-green-100 text-green-700 hover:bg-green-200 border-0 shadow-none uppercase text-[10px]`}>
                     Posted
                 </Badge>
             </div>
             <SheetTitle className="text-xl font-bold text-gray-900 leading-tight">
                 {entry.description}
             </SheetTitle>
             <SheetDescription className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                 <FileText size={14} /> Journal Entry • {format(new Date(entry.date), "PPP")}
             </SheetDescription>
        </div>

        <ScrollArea className="flex-1">
             <div className="p-6 space-y-8">
                 {/* Audit Info */}
                 <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                         <span className="text-gray-500 block text-xs uppercase mb-1">Created By</span>
                         <div className="flex items-center gap-2 font-medium text-gray-900">
                             <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                <User size={12} />
                             </div>
                             {loading ? <Skeleton className="h-4 w-20" /> : details?.createdBy || entry.createdBy}
                         </div>
                     </div>
                     <div>
                         <span className="text-gray-500 block text-xs uppercase mb-1">Source Module</span>
                         <span className="capitalize font-medium text-gray-900">{entry.sourceModule}</span>
                     </div>
                 </div>

                 <Separator />

                 {/* Journal Lines */}
                 <div>
                     <h3 className="font-semibold text-gray-900 mb-4">Journal Lines</h3>
                     
                     {loading ? (
                         <div className="space-y-3">
                             <Skeleton className="h-12 w-full" />
                             <Skeleton className="h-12 w-full" />
                         </div>
                     ) : (
                         <div className="border rounded-lg overflow-hidden">
                             <div className="grid grid-cols-[3fr,1fr,1fr] gap-2 p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
                                 <div>Account / Description</div>
                                 <div className="text-right">Debit</div>
                                 <div className="text-right">Credit</div>
                             </div>
                             <div className="divide-y">
                                 {details?.lines.map((line, idx) => (
                                     <div key={idx} className="grid grid-cols-[3fr,1fr,1fr] gap-2 p-3 text-sm">
                                         <div>
                                             <div className="font-medium text-gray-900 flex items-center gap-2">
                                                 <span className="font-mono text-gray-400 text-xs">{line.accountCode}</span>
                                                 {line.accountName}
                                             </div>
                                             {line.description && (
                                                 <p className="text-gray-500 text-xs mt-0.5">{line.description}</p>
                                             )}
                                         </div>
                                         <div className="text-right font-mono text-gray-900">
                                             {line.debit > 0 ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(line.debit) : '-'}
                                         </div>
                                         <div className="text-right font-mono text-gray-900">
                                             {line.credit > 0 ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(line.credit) : '-'}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             {/* Totals Row */}
                             <div className="grid grid-cols-[3fr,1fr,1fr] gap-2 p-3 bg-gray-50 text-sm font-bold border-t">
                                 <div className="text-right pr-4 text-gray-500 uppercase text-xs pt-1">Totals</div>
                                 <div className="text-right font-mono">
                                     {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                                         details?.lines.reduce((s, l) => s + l.debit, 0) || 0
                                     )}
                                 </div>
                                 <div className="text-right font-mono">
                                     {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                                         details?.lines.reduce((s, l) => s + l.credit, 0) || 0
                                     )}
                                 </div>
                             </div>
                         </div>
                     )}
                 </div>

                 {entry.sourceModule === 'vendor' && (
                     <div className="bg-blue-50 p-4 rounded border border-blue-100 flex items-start gap-3">
                         <ExternalLink className="text-blue-600 mt-0.5" size={18} />
                         <div>
                             <h4 className="font-bold text-blue-900 text-sm">Related Bill</h4>
                             <p className="text-blue-700 text-xs mt-1">
                                 This journal entry was automatically generated from Vendor Bill #BILL-005.
                             </p>
                             <button className="text-blue-600 text-xs font-bold mt-2 hover:underline">
                                 View Source Bill
                             </button>
                         </div>
                     </div>
                 )}
             </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
