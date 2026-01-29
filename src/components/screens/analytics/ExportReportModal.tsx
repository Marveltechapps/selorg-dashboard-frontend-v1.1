import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { exportReport } from "@/api/analytics/analyticsApi";
import { toast } from "sonner";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState("rider");
  const [format, setFormat] = useState("pdf");

  const handleExport = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const result = await exportReport({ 
        metric: metric as 'rider' | 'sla' | 'fleet',
        format: format as 'pdf' | 'excel' | 'csv',
        dateRange: {
          from: sevenDaysAgo.toISOString(),
          to: now.toISOString(),
        },
        includeCharts: true,
        includeSummary: true,
      });
      
      toast.success("Report exported successfully", {
        description: result.message || "Your download will start shortly.",
      });
      onClose();
    } catch (e: any) {
      toast.error("Export failed", {
        description: e.message || "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]" aria-describedby="export-analytics-description">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription id="export-analytics-description">Select parameters for your exported report.</DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rider">Rider Performance</SelectItem>
                <SelectItem value="sla">SLA Adherence</SelectItem>
                <SelectItem value="fleet">Fleet Utilization</SelectItem>
                <SelectItem value="exceptions">Exceptions Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label>Format</Label>
             <div className="flex gap-4">
               <button 
                 onClick={() => setFormat('pdf')}
                 className={`flex-1 py-2 px-4 rounded border text-sm font-medium flex items-center justify-center gap-2 ${format === 'pdf' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
               >
                 PDF Document
               </button>
               <button 
                 onClick={() => setFormat('xlsx')}
                 className={`flex-1 py-2 px-4 rounded border text-sm font-medium flex items-center justify-center gap-2 ${format === 'xlsx' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
               >
                 Excel Spreadsheet
               </button>
             </div>
          </div>

          <div className="space-y-3 pt-2">
             <Label>Include Breakdowns</Label>
             <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="by-rider" />
                  <Label htmlFor="by-rider" className="font-normal">By individual rider</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="by-zone" />
                  <Label htmlFor="by-zone" className="font-normal">By delivery zone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="by-time" />
                  <Label htmlFor="by-time" className="font-normal">By time of day (hourly)</Label>
                </div>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
