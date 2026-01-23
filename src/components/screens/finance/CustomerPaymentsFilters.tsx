import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Label } from "../../ui/label";
import { CustomerPaymentFilter } from './customerPaymentsApi';

interface Props {
  filters: CustomerPaymentFilter;
  onFilterChange: (newFilters: CustomerPaymentFilter) => void;
}

export function CustomerPaymentsFilters({ filters, onFilterChange }: Props) {
  const [localQuery, setLocalQuery] = useState(filters.query || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, query: localQuery, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status: status === 'all' ? undefined : status, page: 1 });
  };

  // Debounce search input for better UX (optional, but good)
  // For now just on Enter or blur to keep it simple with the form submit
  
  return (
    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[#E0E0E0] shadow-sm">
      <form onSubmit={handleSearch} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]" size={16} />
        <Input 
          type="text" 
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search by Customer Name, Order ID, Last 4 digits..." 
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#F5F5F5] border-transparent text-sm focus:bg-white focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent transition-all shadow-none"
        />
      </form>

      <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px] h-9 border-[#E0E0E0] bg-white focus:ring-[#14B8A6]">
           <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="captured">Captured</SelectItem>
            <SelectItem value="authorized">Authorized</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="chargeback">Chargeback</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 gap-2 text-[#757575] border-[#E0E0E0] hover:text-[#212121]">
                <Filter size={16} />
                Filters
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
                <h4 className="font-medium leading-none">Advanced Filters</h4>
                <div className="space-y-2">
                    <Label htmlFor="date-from">Date From</Label>
                    <Input id="date-from" type="date" className="h-8" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date-to">Date To</Label>
                    <Input id="date-to" type="date" className="h-8" />
                </div>
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select>
                        <SelectTrigger className="h-8"><SelectValue placeholder="Any" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="wallet">Wallet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={() => {}}>Reset</Button>
                    <Button size="sm" className="bg-[#14B8A6] hover:bg-[#0D9488]">Apply</Button>
                </div>
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
