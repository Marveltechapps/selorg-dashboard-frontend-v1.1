import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft } from "lucide-react";

interface SKURebalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sku: any;
}

export function SKURebalanceModal({ open, onOpenChange, sku }: SKURebalanceModalProps) {
  const [step, setStep] = useState('strategy'); // strategy -> preview

  if (!sku) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Rebalance: {sku.name}
          </DialogTitle>
          <DialogDescription>
             Redistribute stock across locations.
          </DialogDescription>
        </DialogHeader>

        {step === 'strategy' ? (
            <div className="py-4 space-y-4">
                <Label>Select Rebalancing Strategy</Label>
                <RadioGroup defaultValue="sales">
                    <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                        <RadioGroupItem value="sales" id="s1" />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="s1" className="cursor-pointer font-bold">Proportional to Sales</Label>
                            <p className="text-sm text-gray-500">Based on last 4 weeks performance.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                        <RadioGroupItem value="margin" id="s2" />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="s2" className="cursor-pointer font-bold">Prioritize High Margin</Label>
                            <p className="text-sm text-gray-500">Send stock to most profitable stores.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                        <RadioGroupItem value="equal" id="s3" />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="s3" className="cursor-pointer font-bold">Equal Split</Label>
                            <p className="text-sm text-gray-500">Distribute evenly across active locations.</p>
                        </div>
                    </div>
                </RadioGroup>
            </div>
        ) : (
            <div className="py-4 space-y-4">
                 <div className="p-3 bg-blue-50 text-blue-800 rounded border border-blue-100 text-sm">
                    Proposed plan moves <strong>1,200 units</strong> from Central to 3 locations.
                 </div>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Current</TableHead>
                            <TableHead className="text-right">New</TableHead>
                            <TableHead className="text-right">Diff</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>North Hub</TableCell>
                            <TableCell className="text-right">400</TableCell>
                            <TableCell className="text-right font-bold">800</TableCell>
                            <TableCell className="text-right text-green-600">+400</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>West Hub</TableCell>
                            <TableCell className="text-right">200</TableCell>
                            <TableCell className="text-right font-bold">600</TableCell>
                            <TableCell className="text-right text-green-600">+400</TableCell>
                        </TableRow>
                    </TableBody>
                 </Table>
            </div>
        )}

        <DialogFooter>
          {step === 'strategy' ? (
              <Button onClick={() => setStep('preview')}>Preview Plan</Button>
          ) : (
              <>
                <Button variant="outline" onClick={() => setStep('strategy')}>Back</Button>
                <Button className="bg-[#7C3AED]" onClick={() => onOpenChange(false)}>Confirm Rebalance</Button>
              </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
