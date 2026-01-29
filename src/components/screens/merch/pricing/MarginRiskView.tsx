import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Checkbox } from "../../../ui/checkbox";
import { Download, Wand2, AlertTriangle, Check, X } from "lucide-react";
import { toast } from "sonner";

interface MarginRiskViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarginRiskView({ open, onOpenChange }: MarginRiskViewProps) {
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [marginFilter, setMarginFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  
  // Use state for risks to allow Smart Fix to work
  const [risks, setRisks] = useState([
    { id: '1', name: 'Organic Bananas', code: 'FRT-BAN-001', base: 1.20, sell: 1.50, cost: 1.45, margin: 3.3, competitor: 1.48, status: 'Critical', category: 'produce', region: 'east' },
    { id: '2', name: 'Whole Milk 2L', code: 'DAI-MIL-002', base: 3.50, sell: 3.80, cost: 3.60, margin: 5.2, competitor: 3.75, status: 'Warning', category: 'dairy', region: 'east' },
    { id: '3', name: 'Sourdough Bread', code: 'BAK-BRE-005', base: 4.00, sell: 4.50, cost: 4.20, margin: 6.6, competitor: 4.40, status: 'Warning', category: 'bakery', region: 'west' },
  ]);

  const filteredRisks = risks.filter(sku => {
    const matchesCategory = categoryFilter === 'all' || sku.category === categoryFilter;
    const matchesRegion = regionFilter === 'all' || sku.region === regionFilter;
    let matchesMargin = true;
    if (marginFilter === 'critical') matchesMargin = sku.margin < 5;
    else if (marginFilter === 'warning') matchesMargin = sku.margin >= 5 && sku.margin <= 10;
    return matchesCategory && matchesRegion && matchesMargin;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSkus(filteredRisks.map(r => r.id));
    } else {
      setSelectedSkus([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSkus([...selectedSkus, id]);
    } else {
      setSelectedSkus(selectedSkus.filter(s => s !== id));
    }
  };

  const handleExport = () => {
    toast.info("Generating margin risk report...");
    setTimeout(() => {
      const headers = ["SKU Name", "Code", "Category", "Region", "Cost", "Sell Price", "Margin %", "Competitor", "Status"];
      const csvRows = filteredRisks.map(sku => [
        `"${sku.name}"`,
        sku.code,
        sku.category,
        sku.region,
        sku.cost,
        sku.sell,
        sku.margin,
        sku.competitor,
        sku.status
      ].join(","));
      
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Margin_Risk_SKUs.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Report downloaded successfully");
    }, 1000);
  };

  const handleSmartFix = () => {
    setRisks(risks.filter(r => !selectedSkus.includes(r.id)));
    toast.success(`Smart recommendations applied to ${selectedSkus.length} SKUs. Margins restored to >15% targets.`);
    setSelectedSkus([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="text-red-500" /> Margin Risk SKUs
          </DialogTitle>
          <DialogDescription>
            Identify and fix SKUs falling below minimum margin thresholds.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg border">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="produce">Produce</SelectItem>
                        <SelectItem value="dairy">Dairy</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={marginFilter} onValueChange={setMarginFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Margin Bucket" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Margins</SelectItem>
                        <SelectItem value="critical">&lt; 5% (Critical)</SelectItem>
                        <SelectItem value="warning">5-10% (Warning)</SelectItem>
                    </SelectContent>
                </Select>
                 <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="east">East Coast</SelectItem>
                        <SelectItem value="west">West Coast</SelectItem>
                    </SelectContent>
                </Select>
                
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download size={16} className="mr-2" /> Export
                    </Button>
                    <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={selectedSkus.length === 0}
                        onClick={handleSmartFix}
                    >
                        <Wand2 size={16} className="mr-2" /> Smart Fix ({selectedSkus.length})
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-md overflow-auto flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    checked={selectedSkus.length === filteredRisks.length && filteredRisks.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>SKU Details</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Current Sell</TableHead>
                            <TableHead>Margin %</TableHead>
                            <TableHead>Competitor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRisks.map((sku) => (
                            <TableRow key={sku.id}>
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedSkus.includes(sku.id)}
                                        onCheckedChange={(c) => handleSelect(sku.id, c as boolean)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-slate-900">{sku.name}</p>
                                        <p className="text-xs text-slate-500">{sku.code}</p>
                                    </div>
                                </TableCell>
                                <TableCell>${sku.cost.toFixed(2)}</TableCell>
                                <TableCell className="font-bold">${sku.sell.toFixed(2)}</TableCell>
                                <TableCell className={sku.margin < 5 ? "text-red-600 font-bold" : "text-amber-600 font-bold"}>
                                    {sku.margin.toFixed(1)}%
                                </TableCell>
                                <TableCell>${sku.competitor.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={sku.status === 'Critical' ? "destructive" : "secondary"}>
                                        {sku.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline" onClick={() => toast.info(`Adjusting price for ${sku.name}`)}>Adjust</Button>
                                        <Button size="sm" variant="ghost" title="Mark Reviewed" onClick={() => toast.success(`Marked ${sku.name} as reviewed`)}><Check size={16} /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredRisks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                    No risks found for selected filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
