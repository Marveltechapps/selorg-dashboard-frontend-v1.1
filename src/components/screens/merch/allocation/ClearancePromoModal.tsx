import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";

interface ClearancePromoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: any;
}

export function ClearancePromoModal({ open, onOpenChange, alert }: ClearancePromoModalProps) {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gray-50/50">
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="h-4 w-4 text-[#7C3AED]" /> Create Clearance Promo
          </DialogTitle>
          <DialogDescription className="text-[10px]">
             Clear expiring stock for <strong>{alert.sku}</strong> (Batch #{alert.batch})
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-4">
             <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-gray-500">Campaign Name</Label>
                <Input defaultValue={`Clearance: ${alert.sku}`} className="h-8 text-[11px]" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Discount %</Label>
                    <Input type="number" defaultValue="50" className="h-8 text-[11px]" />
                 </div>
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-gray-500">Duration (Days)</Label>
                    <Input type="number" defaultValue="3" className="h-8 text-[11px]" />
                 </div>
             </div>
             <div className="p-2.5 bg-yellow-50 text-yellow-800 rounded-md text-[10px] border border-yellow-100 italic">
                <p><strong>Recommendation:</strong> Run for 3 days at 50% off to clear 400 units before expiry.</p>
             </div>
        </div>

        <DialogFooter className="p-3 bg-gray-50 border-t gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] h-7 text-[10px] font-bold" onClick={() => onOpenChange(false)}>Launch Campaign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
