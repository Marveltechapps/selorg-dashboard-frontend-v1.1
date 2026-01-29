import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import { toast } from "sonner";
import { Download, Mail, Calendar } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState('full');
  const [deliveryMethod, setDeliveryMethod] = useState('download');
  const [isScheduled, setIsScheduled] = useState(false);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleConfirm = () => {
    onClose();
    if (deliveryMethod === 'download') {
      toast.info("Preparing your download...", { description: "This will only take a moment." });
      
      const reportContent = `
        ANALYTICS EXPORT - ${reportType.toUpperCase()}
        Generated: ${new Date().toLocaleString()}
        
        This is a demo export file from the Merchandising Dashboard.
      `;

      setTimeout(() => {
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Analytics_Export_${Date.now()}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Report is ready", {
          description: "Your download has started automatically."
        });
      }, 1500);
    } else {
      toast.success("Report Scheduled", {
        description: isScheduled ? "You will receive this report weekly." : "Report has been emailed to you."
      });
    }
    setStep(1); // Reset
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>Select the report type, date range, file format, and delivery method.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <RadioGroup value={reportType} onValueChange={setReportType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="campaign" id="r-campaign" />
                    <Label htmlFor="r-campaign">Campaign Performance Summary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sku" id="r-sku" />
                    <Label htmlFor="r-sku">SKU Sales & Inventory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regional" id="r-regional" />
                    <Label htmlFor="r-regional">Regional Insights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="r-full" />
                    <Label htmlFor="r-full" className="font-semibold">Full Analytics Pack</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select defaultValue="30days">
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
               <div className="space-y-2">
                <Label>File Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (Raw Data)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delivery Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors ${deliveryMethod === 'download' ? 'border-[#7C3AED] bg-[#F3E8FF]/30' : 'border-gray-200'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setDeliveryMethod('download');
                    }}
                  >
                    <Download className={`h-6 w-6 ${deliveryMethod === 'download' ? 'text-[#7C3AED]' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${deliveryMethod === 'download' ? 'text-[#7C3AED]' : 'text-gray-600'}`}>Download Now</span>
                  </div>
                  <div 
                    className={`border rounded-lg p-3 cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors ${deliveryMethod === 'email' ? 'border-[#7C3AED] bg-[#F3E8FF]/30' : 'border-gray-200'}`}
                    onClick={(e) => {
                        e.preventDefault();
                        setDeliveryMethod('email');
                    }}
                  >
                    <Mail className={`h-6 w-6 ${deliveryMethod === 'email' ? 'text-[#7C3AED]' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${deliveryMethod === 'email' ? 'text-[#7C3AED]' : 'text-gray-600'}`}>Email to Me</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
               <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="schedule" 
                    checked={isScheduled} 
                    onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                  />
                  <Label htmlFor="schedule" className="font-medium">Schedule recurring report</Label>
               </div>

               {isScheduled && (
                 <div className="pl-6 space-y-4 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label>Time of Day</Label>
                      <Select defaultValue="0900">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0900">9:00 AM</SelectItem>
                          <SelectItem value="1200">12:00 PM</SelectItem>
                          <SelectItem value="1700">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                 </div>
               )}

               {!isScheduled && (
                 <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded text-center">
                   Report will be generated once immediately.
                 </div>
               )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
            Back
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
               <Button onClick={handleNext}>Next</Button>
            ) : (
               <Button onClick={handleConfirm}>
                 {deliveryMethod === 'download' ? 'Download' : isScheduled ? 'Schedule' : 'Send'}
               </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}