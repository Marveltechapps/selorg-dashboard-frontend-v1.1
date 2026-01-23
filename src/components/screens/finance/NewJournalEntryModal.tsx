import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from 'sonner';
import { AccountOption, createJournalEntry, JournalEntryLine } from './accountingApi';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: AccountOption[];
}

export function NewJournalEntryModal({ open, onClose, onSuccess, accounts }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState(`JE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<JournalEntryLine[]>([
      { accountCode: '', debit: 0, credit: 0, description: '' },
      { accountCode: '', debit: 0, credit: 0, description: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
      if (open) {
          setDate(new Date().toISOString().split('T')[0]);
          setReference(`JE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`);
          setMemo('');
          setLines([
            { accountCode: '', debit: 0, credit: 0, description: '' },
            { accountCode: '', debit: 0, credit: 0, description: '' }
          ]);
      }
  }, [open]);

  const totalDebits = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
  const isValid = isBalanced && totalDebits > 0 && lines.every(l => l.accountCode);

  const handleAddLine = () => {
      setLines([...lines, { accountCode: '', debit: 0, credit: 0, description: '' }]);
  };

  const handleRemoveLine = (index: number) => {
      if (lines.length <= 2) {
          toast.warning("Journal entry must have at least two lines.");
          return;
      }
      const newLines = [...lines];
      newLines.splice(index, 1);
      setLines(newLines);
  };

  const updateLine = (index: number, field: keyof JournalEntryLine, value: any) => {
      const newLines = [...lines];
      newLines[index] = { ...newLines[index], [field]: value };
      
      // Auto-clear opposite field (debit/credit) if one is set? 
      // Simplified: Just let them type. But typically if I type debit, credit becomes 0.
      if (field === 'debit' && Number(value) > 0) newLines[index].credit = 0;
      if (field === 'credit' && Number(value) > 0) newLines[index].debit = 0;

      setLines(newLines);
  };

  const handleSubmit = async () => {
      if (!isValid) return;
      setIsSubmitting(true);
      try {
          await createJournalEntry({
              date,
              reference,
              memo,
              lines,
              createdBy: "Current User" // Mock
          });
          toast.success("Journal Entry Posted Successfully");
          onSuccess();
          onClose();
      } catch (e) {
          toast.error("Failed to post journal entry");
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>Create a manual journal entry to adjust accounts.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
             {/* Header Fields */}
             <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                     <Label>Date</Label>
                     <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                     <Label>Reference</Label>
                     <Input value={reference} onChange={e => setReference(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                     <Label>Memo (Optional)</Label>
                     <Input value={memo} onChange={e => setMemo(e.target.value)} placeholder="e.g. Monthly Adjustment" />
                 </div>
             </div>

             {/* Lines */}
             <div className="border rounded-md">
                 <div className="grid grid-cols-[1fr,2fr,1fr,1fr,40px] gap-2 p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
                     <div>Account</div>
                     <div>Description</div>
                     <div className="text-right">Debit</div>
                     <div className="text-right">Credit</div>
                     <div></div>
                 </div>
                 <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                     {lines.map((line, idx) => (
                         <div key={idx} className="grid grid-cols-[1fr,2fr,1fr,1fr,40px] gap-2 items-start">
                             <Select 
                                value={line.accountCode} 
                                onValueChange={(val) => updateLine(idx, 'accountCode', val)}
                             >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map(acc => (
                                        <SelectItem key={acc.code} value={acc.code}>
                                            <span className="font-mono text-xs text-gray-500 mr-2">{acc.code}</span>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>

                             <Input 
                                className="h-9" 
                                placeholder="Line description" 
                                value={line.description}
                                onChange={e => updateLine(idx, 'description', e.target.value)}
                             />

                             <Input 
                                className="h-9 text-right font-mono" 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="0.00"
                                value={line.debit || ''}
                                onChange={e => updateLine(idx, 'debit', parseFloat(e.target.value))}
                             />

                             <Input 
                                className="h-9 text-right font-mono" 
                                type="number" 
                                min="0" 
                                step="0.01"
                                placeholder="0.00"
                                value={line.credit || ''}
                                onChange={e => updateLine(idx, 'credit', parseFloat(e.target.value))}
                             />

                             <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-9 w-9 text-gray-400 hover:text-red-500"
                                onClick={() => handleRemoveLine(idx)}
                             >
                                 <Trash2 size={16} />
                             </Button>
                         </div>
                     ))}
                 </div>
                 <div className="p-2 border-t bg-gray-50">
                     <Button variant="ghost" size="sm" onClick={handleAddLine} className="text-[#14B8A6]">
                         <Plus size={16} className="mr-2" /> Add Line
                     </Button>
                 </div>
             </div>

             {/* Footer Totals */}
             <div className="flex justify-end items-center gap-8 px-4">
                 <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase">Total Debits</p>
                     <p className="font-mono font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalDebits)}</p>
                 </div>
                 <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase">Total Credits</p>
                     <p className="font-mono font-bold text-lg">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCredits)}</p>
                 </div>
                 <div className="text-right pl-4 border-l">
                     <p className="text-xs text-gray-500 uppercase">Difference</p>
                     <p className={`font-mono font-bold text-lg ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                         {Math.abs(totalDebits - totalCredits).toFixed(2)}
                     </p>
                 </div>
             </div>
        </div>

        <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !isValid}
                className="bg-[#212121] text-white hover:bg-black"
            >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Post Entry
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
