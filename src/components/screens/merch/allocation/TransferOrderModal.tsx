import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { allocationApi } from './allocationApi';

interface TransferOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku: any;
  onComplete?: () => void;
}

export function TransferOrderModal({ open, onOpenChange, sku, onComplete }: TransferOrderModalProps) {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requiredDate, setRequiredDate] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFromLocation('');
      setToLocation('');
      setQuantity('');
      setRequiredDate('');
    }
  }, [open]);

  const handleCreateOrder = () => {
    if (!fromLocation || !toLocation || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Save transfer order to localStorage
    const order = allocationApi.createTransferOrder({
      skuId: sku?.id,
      skuName: sku?.name,
      fromLocation,
      toLocation,
      quantity: parseInt(quantity),
      requiredDate,
      status: 'pending'
    });

    // Update SKU allocations to reflect transfer
    // Load existing allocations first to preserve all fields
    const persisted = allocationApi.loadSKUAllocations();
    
    if (sku?.locations) {
      // Find the "to" location and update its inTransit
      const toLoc = sku.locations.find((loc: any) => 
        loc.name.toLowerCase().includes(toLocation.toLowerCase())
      );
      if (toLoc) {
        const key = `${sku.id}_${toLoc.id}`;
        const existing = persisted[key] || {};
        
        // Update with all fields preserved
        allocationApi.updateSKUAllocation(sku.id, toLoc.id, {
          allocated: existing.allocated ?? toLoc.allocated,
          target: existing.target ?? toLoc.target,
          onHand: existing.onHand ?? toLoc.onHand,
          inTransit: (existing.inTransit ?? toLoc.inTransit ?? 0) + parseInt(quantity),
          safetyStock: existing.safetyStock ?? toLoc.safetyStock
        });
      }
    }
    
    toast.success('Transfer order created', {
      description: `${quantity} units of ${sku?.name} from ${fromLocation} to ${toLocation}`
    });
    
    // Call onComplete before closing to ensure parent refreshes
    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 100);
    }
    onOpenChange(false);
  };

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
                    <Select value={fromLocation} onValueChange={setFromLocation}>
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
                    <Select value={toLocation} onValueChange={setToLocation}>
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
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
             </div>

             <div className="space-y-2">
                <Label>Required Date (ETA)</Label>
                <Input 
                  type="date" 
                  value={requiredDate}
                  onChange={(e) => setRequiredDate(e.target.value)}
                />
             </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#212121] hover:bg-black text-white" onClick={handleCreateOrder}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
