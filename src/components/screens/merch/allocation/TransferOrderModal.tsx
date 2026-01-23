import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";

interface TransferOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku: any;
}

export function TransferOrderModal({ open, onOpenChange, sku }: TransferOrderModalProps) {
  if (!sku) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" /> Create Transfer Order
          </DialogTitle>
          <DialogDescription>
             Move stock for <strong>{sku.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>From Location</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select origin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="central">Central Warehouse</SelectItem>
                            <SelectItem value="south">South Hub</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>To Location</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select dest." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="north">North Hub</SelectItem>
                            <SelectItem value="west">Westside Hub</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>

             <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" placeholder="Enter amount" />
             </div>

             <div className="space-y-2">
                <Label>Required Date (ETA)</Label>
                <Input type="date" />
             </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#212121] hover:bg-black text-white" onClick={() => onOpenChange(false)}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
