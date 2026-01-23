import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAMPAIGN_CHART_DATA } from './mockData';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Percent } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CampaignPerformance() {
  const [dateRange, setDateRange] = useState('30days');
  const [campaignType, setCampaignType] = useState('all');
  const [campaignData, setCampaignData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(`http://localhost:5001/api/v1/merch/analytics/summary?type=campaign&range=${dateRange}`);
        if (!mounted) return;
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.data) {
            setCampaignData(data.data.map((item: any) => ({
              id: item.entityId,
              name: item.entityName,
              type: 'Discount',
              status: 'Active',
              revenue: item.revenue || 0,
              uplift: item.uplift || 0,
              redemptionRate: 0,
              roi: item.roi || 0
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load campaign analytics', err);
        toast.error('Failed to load campaign analytics');
        setCampaignData([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [dateRange]);

  const filteredData = useMemo(() => {
    let data = [...campaignData];
    if (campaignType !== 'all') {
      data = data.filter(c => c.type.toLowerCase() === campaignType.toLowerCase());
    }
    return data;
  }, [campaignType, campaignData]);

  const handleSavePreset = () => {
    toast.success("Preset Saved", {
        description: `Your filters for ${campaignType} campaigns over ${dateRange} have been saved.`
    });
  };

  return (
    <div className="space-y-6 flex flex-col min-h-0">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 pb-4 border-b">
        <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-white text-xs">
                <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last Quarter</SelectItem>
            </SelectContent>
        </Select>
         <Select value={campaignType} onValueChange={setCampaignType}>
            <SelectTrigger className="w-[180px] bg-white text-xs">
                <SelectValue placeholder="Campaign Type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discount">Discount</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
                <SelectItem value="flash sale">Flash Sale</SelectItem>
            </SelectContent>
        </Select>
        <Button variant="outline" className="ml-auto text-xs h-8" onClick={handleSavePreset}>Save Preset</Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-gray-500">Total Promo Revenue</p>
                 <DollarSign className="h-4 w-4 text-green-600" />
             </div>
             <p className="text-2xl font-bold">${filteredData.reduce((acc, c) => acc + c.revenue, 0).toLocaleString()}</p>
             <div className="flex items-center text-xs text-green-600 mt-1">
                 <TrendingUp className="h-3 w-3 mr-1" /> +12.5% vs baseline
             </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-gray-500">Avg Uplift</p>
                 <TrendingUp className="h-4 w-4 text-blue-600" />
             </div>
             <p className="text-2xl font-bold">{(filteredData.reduce((acc, c) => acc + c.uplift, 0) / (filteredData.length || 1)).toFixed(1)}%</p>
             <div className="flex items-center text-xs text-green-600 mt-1">
                 <TrendingUp className="h-3 w-3 mr-1" /> +2.1%
             </div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-gray-500">Avg Discount Depth</p>
                 <Percent className="h-4 w-4 text-orange-600" />
             </div>
             <p className="text-2xl font-bold">14.5%</p>
             <div className="text-xs text-gray-500 mt-1">Target: &lt;15%</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
             <div className="flex justify-between items-start mb-2">
                 <p className="text-sm font-medium text-gray-500">Total Redemptions</p>
                 <ShoppingBag className="h-4 w-4 text-purple-600" />
             </div>
             <p className="text-2xl font-bold">4,520</p>
             <div className="text-xs text-gray-500 mt-1">Across {filteredData.length} campaigns</div>
          </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-4 rounded-lg border shadow-sm h-[350px]">
          <h3 className="text-sm font-semibold mb-4">Revenue & Uplift Trend</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CAMPAIGN_CHART_DATA}>
                <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorUplift" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Revenue ($)" />
                <Area type="monotone" dataKey="uplift" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUplift)" name="Uplift (%)" />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden shrink-0">
          <Table>
              <TableHeader className="bg-gray-50">
                  <TableRow>
                      <TableHead className="text-xs font-bold">Campaign Name</TableHead>
                      <TableHead className="text-xs font-bold">Type</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-right text-xs font-bold">Revenue</TableHead>
                      <TableHead className="text-right text-xs font-bold">Uplift</TableHead>
                      <TableHead className="text-right text-xs font-bold">ROI</TableHead>
                      <TableHead className="text-right text-xs font-bold">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredData.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-gray-400">No campaigns found for this filter</TableCell>
                      </TableRow>
                  ) : filteredData.map((campaign) => (
                      <TableRow key={campaign.id} className="cursor-pointer hover:bg-gray-50 h-12">
                          <TableCell className="font-medium text-blue-600 text-xs">{campaign.name}</TableCell>
                          <TableCell className="text-xs">{campaign.type}</TableCell>
                          <TableCell>
                              <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'} className={cn("text-[10px] px-1.5 py-0 h-5", campaign.status === 'Ended' ? 'bg-gray-200 text-gray-700' : '')}>
                                  {campaign.status}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold">${campaign.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600 text-xs font-bold">+{campaign.uplift}%</TableCell>
                          <TableCell className="text-right text-xs font-bold">{campaign.roi}x</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-7 text-xs">Details</Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>
    </div>
  );
}
