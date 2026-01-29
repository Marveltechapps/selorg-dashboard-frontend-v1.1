import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadInvoice, Vendor } from './payablesApi';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendors: Vendor[];
}

export function UploadInvoiceModal({ open, onClose, onSuccess, vendors }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
      vendorId: '',
      invoiceNumber: '',
      invoiceDate: '',
      dueDate: '',
      amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          const vendor = vendors.find(v => v.id === formData.vendorId);
          await uploadInvoice({
              vendorId: formData.vendorId,
              vendorName: vendor?.name,
              invoiceNumber: formData.invoiceNumber,
              invoiceDate: formData.invoiceDate,
              dueDate: formData.dueDate,
              amount: parseFloat(formData.amount),
              currency: 'USD'
          });
          toast.success("Invoice uploaded successfully");
          onSuccess();
          onClose();
          // Reset form
          setFormData({ vendorId: '', invoiceNumber: '', invoiceDate: '', dueDate: '', amount: '' });
      } catch (e) {
          toast.error("Failed to upload invoice");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Vendor Invoice</DialogTitle>
          <DialogDescription>
            Manually add a new invoice to the system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <Label htmlFor="vendor">Vendor</Label>
                    <Select 
                        value={formData.vendorId} 
                        onValueChange={(val) => setFormData({...formData, vendorId: val})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                            {vendors.map(v => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="invNumber">Invoice Number</Label>
                    <Input 
                        id="invNumber" 
                        placeholder="e.g. INV-2024-001"
                        required 
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input 
                        id="amount" 
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required 
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="invDate">Invoice Date</Label>
                    <Input 
                        id="invDate" 
                        type="date"
                        required 
                        value={formData.invoiceDate}
                        onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input 
                        id="dueDate" 
                        type="date"
                        required 
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>

                <div className="col-span-2">
                    <Label>Attachment</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload file</p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" className="bg-[#14B8A6] hover:bg-[#0D9488]" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upload Invoice
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
