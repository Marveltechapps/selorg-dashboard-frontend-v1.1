import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Download, Calendar, Mail, FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from 'react';
import { Input } from "../../../ui/input";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    toast.info("Generating PDF report...", {
        description: "Compiling metrics and charts."
    });
    
    // Create a mock PDF content (as text for this demo)
    const reportContent = `
      MERCHANDISING PERFORMANCE REPORT
      Generated: ${new Date().toLocaleString()}
      
      KPI SUMMARY:
      - Total Revenue: $1.2M
      - Total Uplift: +22.5%
      - Active Campaigns: 14
      - Avg. Discount: 18%
      
      CAMPAIGN DATA:
      Summer Essentials: $450k | +18% Uplift | 3.2x ROI
      Flash Sale Beverages: $120k | +42% Uplift | 4.5x ROI
    `;

    // Simulate generation delay
    setTimeout(() => {
        const blob = new Blob([reportContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Merch_Report_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setIsDownloading(false);
        toast.success("PDF Downloaded", {
            description: "Check your browser downloads folder."
        });
    }, 2500);
  };

  const handleScheduleEmail = () => {
    if (!emailAddress || !emailAddress.includes('@')) {
        toast.error("Invalid Email", { description: "Please enter a valid email address." });
        return;
    }

    setIsScheduling(true);
    // Simulate API call
    setTimeout(() => {
        setIsScheduling(false);
        setShowEmailInput(false);
        setEmailAddress('');
        toast.success("Email Scheduled", {
            description: `A copy of this report will be sent to ${emailAddress} daily.`
        });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <DialogTitle className="text-xl font-bold">Merchandising Performance Report</DialogTitle>
              <DialogDescription>
                Detailed performance analysis for the selected period.
              </DialogDescription>
            </div>
            <div className="flex gap-2 shrink-0">
                {showEmailInput ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                        <Input 
                            type="email" 
                            placeholder="Enter email address" 
                            className="h-9 w-48 text-xs"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScheduleEmail()}
                        />
                        <Button 
                            size="sm" 
                            className="h-9 bg-[#7C3AED]"
                            onClick={handleScheduleEmail}
                            disabled={isScheduling}
                        >
                            {isScheduling ? <Loader2 size={14} className="animate-spin" /> : "Send"}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9"
                            onClick={() => setShowEmailInput(false)}
                        >
                            <X size={14} />
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 h-9"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowEmailInput(true);
                        }}
                    >
                        <Mail size={14} />
                        Schedule Email
                    </Button>
                )}
                
                <Button 
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] gap-2 h-9 text-white" 
                    size="sm"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownload();
                    }}
                    disabled={isDownloading || showEmailInput}
                >
                    {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                    Download PDF
                </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Date Range</label>
                <Select defaultValue="last-30">
                    <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="last-7">Last 7 Days</SelectItem>
                        <SelectItem value="last-30">Last 30 Days</SelectItem>
                        <SelectItem value="this-quarter">This Quarter</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Region</label>
                <Select defaultValue="na">
                    <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="na">North America</SelectItem>
                        <SelectItem value="eu">Europe</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Channel</label>
                <Select defaultValue="all">
                    <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Online & Offline</SelectItem>
                        <SelectItem value="online">Online Only</SelectItem>
                        <SelectItem value="store">In-Store Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500">Campaign Type</label>
                <Select defaultValue="all">
                    <SelectTrigger className="bg-white h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="promo">Promotions</SelectItem>
                        <SelectItem value="clearance">Clearance</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-4 mt-2">
            <div className="p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Total Revenue (Promo)</div>
                <div className="text-2xl font-bold text-[#212121]">$1.2M</div>
                <div className="text-xs text-green-600 font-medium">+14% vs prev</div>
            </div>
            <div className="p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Total Uplift</div>
                <div className="text-2xl font-bold text-[#212121]">+22.5%</div>
                <div className="text-xs text-green-600 font-medium">+2.1% vs prev</div>
            </div>
            <div className="p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold text-[#212121]">14</div>
                <div className="text-xs text-gray-500 font-medium">Across 3 regions</div>
            </div>
            <div className="p-4 border rounded-xl bg-white shadow-sm">
                <div className="text-sm text-gray-500 mb-1">Avg. Discount Depth</div>
                <div className="text-2xl font-bold text-[#212121]">18%</div>
                <div className="text-xs text-orange-600 font-medium">+1.5% vs target</div>
            </div>
        </div>

        {/* Sections */}
        <div className="space-y-6 mt-4">
            <div>
                <h3 className="font-bold text-lg mb-3">Campaign Performance</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2 font-medium text-gray-600">Campaign</th>
                                <th className="px-4 py-2 font-medium text-gray-600 text-right">Revenue</th>
                                <th className="px-4 py-2 font-medium text-gray-600 text-right">Uplift</th>
                                <th className="px-4 py-2 font-medium text-gray-600 text-right">ROI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="px-4 py-2">Summer Essentials</td>
                                <td className="px-4 py-2 text-right">$450k</td>
                                <td className="px-4 py-2 text-right text-green-600">+18%</td>
                                <td className="px-4 py-2 text-right">3.2x</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">Flash Sale: Bev</td>
                                <td className="px-4 py-2 text-right">$120k</td>
                                <td className="px-4 py-2 text-right text-green-600">+42%</td>
                                <td className="px-4 py-2 text-right">4.5x</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
