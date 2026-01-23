import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { merchApi } from "../merchApi";

interface PromoUpliftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PromoUpliftModal({ isOpen, onClose }: PromoUpliftModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upliftData, setUpliftData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reverted to Mock Data for the graph
      const mockUpliftData = [
        { name: 'Jan', baseline: 10000, uplift: 12000 },
        { name: 'Feb', baseline: 12000, uplift: 15000 },
        { name: 'Mar', baseline: 11000, uplift: 14500 },
        { name: 'Apr', baseline: 13000, uplift: 18000 },
        { name: 'May', baseline: 14000, uplift: 19500 },
        { name: 'Jun', baseline: 15000, uplift: 22000 }
      ];
      setUpliftData(mockUpliftData);
      setLoading(false);
    }
  }, [isOpen]);

  const handleExport = () => {
    setIsExporting(true);
    toast.info("Preparing data for export...");
    setTimeout(() => {
        setIsExporting(false);
        toast.success("Export Complete", {
            description: "Promo_Uplift_Analytics.xlsx has been downloaded."
        });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">Promo Uplift Analytics</DialogTitle>
              <DialogDescription>
                Comparative analysis of promotional sales vs baseline performance.
              </DialogDescription>
            </div>
            <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
            >
              {isExporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
              Export Data
            </Button>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-3 my-4">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Calendar size={14} />
            <span>Last 30 Days</span>
          </Button>
          <Select defaultValue="campaign">
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Breakdown by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="campaign">By Campaign</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="region">By Region</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="h-[350px] w-full border rounded-lg p-4 bg-white">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#7C3AED]" />
            </div>
          ) : upliftData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              No performance data available.
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={upliftData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="baseline" name="Baseline Sales" stroke="#9CA3AF" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="uplift" name="Promo Sales" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xs text-green-700 font-medium uppercase">Total Uplift</div>
            <div className="text-2xl font-bold text-green-700">+22%</div>
            <div className="text-xs text-green-600">vs. last period</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 font-medium uppercase">Avg. Discount</div>
            <div className="text-2xl font-bold text-gray-700">15%</div>
            <div className="text-xs text-gray-500">Stable</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-xs text-purple-700 font-medium uppercase">ROI</div>
            <div className="text-2xl font-bold text-purple-700">3.4x</div>
            <div className="text-xs text-purple-600">High Performance</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
