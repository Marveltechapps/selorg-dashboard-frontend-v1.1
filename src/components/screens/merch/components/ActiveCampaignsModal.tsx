import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Input } from "../../../ui/input";
import { Filter, Download, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from 'react';

interface ActiveCampaignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCampaign: () => void;
}

export function ActiveCampaignsModal({ isOpen, onClose, onCreateCampaign }: ActiveCampaignsModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [regionFilter, setRegionFilter] = useState("all-regions");
  const [typeFilter, setTypeFilter] = useState("all-types");

  const CAMPAIGNS = [
    { name: "Summer Essentials", type: "bundle", status: "Active", start: "Jun 01", end: "Aug 31", uplift: "+18.5%", redemptions: 842, region: "na" },
    { name: "Flash Sale: Beverages", type: "flash", status: "Active", start: "Jul 15", end: "Jul 18", uplift: "+42.1%", redemptions: 2105, region: "eu" },
    { name: "New User Discount", type: "discount", status: "Ending Soon", start: "Jan 01", end: "Dec 31", uplift: "+12.0%", redemptions: 154, region: "na" },
    { name: "Loyalty Bonus", type: "loyalty", status: "Active", start: "Ongoing", end: "-", uplift: "+5.2%", redemptions: 4320, region: "eu" },
    { name: "Weekend Special", type: "discount", status: "Scheduled", start: "Next Fri", end: "Next Sun", uplift: "-", redemptions: 0, region: "na" },
  ];

  const filteredCampaigns = CAMPAIGNS.filter(campaign => {
    const regionMatch = regionFilter === "all-regions" || campaign.region === regionFilter;
    const typeMatch = typeFilter === "all-types" || campaign.type === typeFilter;
    return regionMatch && typeMatch;
  });

  const handleExport = () => {
    setIsExporting(true);
    toast.info("Generating campaign report...");
    
    setTimeout(() => {
      try {
        // Create CSV content
        const headers = ["Campaign Name", "Type", "Status", "Start Date", "End Date", "Sales Uplift", "Redemptions", "Region"];
        const csvRows = filteredCampaigns.map(c => [
          `"${c.name}"`,
          c.type,
          c.status,
          c.start,
          c.end,
          c.uplift,
          c.redemptions,
          c.region.toUpperCase()
        ].join(","));
        
        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Active_Campaigns_${regionFilter}_${typeFilter}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setIsExporting(false);
        toast.success("Report Ready", {
            description: "Active_Campaigns_List.csv has been downloaded."
        });
      } catch (error) {
        console.error("Export failed:", error);
        setIsExporting(false);
        toast.error("Export failed", {
          description: "There was an error generating your report."
        });
      }
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <div>
              <DialogTitle className="text-xl font-bold">Active Campaigns</DialogTitle>
              <DialogDescription>
                Overview of all currently running promotional campaigns.
              </DialogDescription>
            </div>
            <Button onClick={() => { onClose(); onCreateCampaign(); }} className="bg-[#7C3AED] hover:bg-[#6D28D9]">
              <Plus size={16} className="mr-2" />
              Create Campaign
            </Button>
          </div>
        </DialogHeader>

        <div className="flex gap-3 my-2">
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-regions">All Regions</SelectItem>
              <SelectItem value="na">North America</SelectItem>
              <SelectItem value="eu">Europe</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Campaign Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="discount">Discount</SelectItem>
              <SelectItem value="flash">Flash Sale</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
              <SelectItem value="loyalty">Loyalty</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex-1"></div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Campaign Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Sales Uplift</TableHead>
                <TableHead className="text-right">Redemption</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="capitalize">{campaign.type}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`${
                        campaign.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        campaign.status === 'Ending Soon' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.start}</TableCell>
                  <TableCell>{campaign.end}</TableCell>
                  <TableCell className="text-right font-bold text-green-600">{campaign.uplift}</TableCell>
                  <TableCell className="text-right">{campaign.redemptions}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-[#7C3AED]">View</Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCampaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    No campaigns found matching the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
