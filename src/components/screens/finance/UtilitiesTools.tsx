import React, { useState } from 'react';
import { Database, Calculator, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { toast } from 'sonner';

export function UtilitiesTools() {
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [showFiscalCalendar, setShowFiscalCalendar] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  
  const [taxAmount, setTaxAmount] = useState('');
  const [taxRate, setTaxRate] = useState('10');
  const [taxResult, setTaxResult] = useState<number | null>(null);
  
  const handleTaxCalculate = () => {
    const amount = parseFloat(taxAmount);
    const rate = parseFloat(taxRate);
    if (!isNaN(amount) && !isNaN(rate)) {
      setTaxResult(amount * (rate / 100));
    } else {
      toast.error('Please enter valid numbers');
    }
  };
  
  const handleDataExport = () => {
    const csvContent = `Type,Date,Amount,Description\nRevenue,2024-01-01,125000,Monthly Revenue\nExpense,2024-01-01,45000,Operating Costs`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
    setShowDataExport(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Utilities & Tools</h1>
          <p className="text-[#757575] text-sm">Tax calculators, currency converters, and data tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center"
            onClick={() => setShowTaxCalculator(true)}
          >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Calculator size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Tax Calculator</h3>
              <p className="text-sm text-[#757575] mt-1">Estimate GST/VAT for cross-border transactions.</p>
          </div>
          <div 
            className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center"
            onClick={() => setShowFiscalCalendar(true)}
          >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Calendar size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Fiscal Calendar</h3>
              <p className="text-sm text-[#757575] mt-1">Manage financial year periods and closing dates.</p>
          </div>
          <div 
            className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center"
            onClick={() => setShowDataExport(true)}
          >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-[#757575]">
                  <Database size={32} />
              </div>
              <h3 className="font-bold text-[#212121]">Data Export</h3>
              <p className="text-sm text-[#757575] mt-1">Bulk export of ledgers and transaction history.</p>
          </div>
      </div>
      
      <Dialog open={showTaxCalculator} onOpenChange={setShowTaxCalculator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tax Calculator</DialogTitle>
            <DialogDescription>Calculate GST/VAT for transactions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tax-amount">Amount</Label>
              <Input
                id="tax-amount"
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Select value={taxRate} onValueChange={setTaxRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {taxResult !== null && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Tax Amount</p>
                <p className="text-2xl font-bold text-gray-900">${taxResult.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">${(parseFloat(taxAmount) + taxResult).toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTaxCalculator(false);
              setTaxAmount('');
              setTaxResult(null);
            }}>Close</Button>
            <Button onClick={handleTaxCalculate} className="bg-[#14B8A6] hover:bg-[#0D9488]">Calculate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showFiscalCalendar} onOpenChange={setShowFiscalCalendar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fiscal Calendar</DialogTitle>
            <DialogDescription>Financial year periods and closing dates</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="font-bold text-gray-900 mb-2">Current Fiscal Year</p>
                <p className="text-sm text-gray-600">Start: January 1, 2024</p>
                <p className="text-sm text-gray-600">End: December 31, 2024</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-bold text-gray-900 mb-2">Upcoming Closures</p>
                <p className="text-sm text-gray-600">Q1 Closing: March 31, 2024</p>
                <p className="text-sm text-gray-600">Q2 Closing: June 30, 2024</p>
                <p className="text-sm text-gray-600">Q3 Closing: September 30, 2024</p>
                <p className="text-sm text-gray-600">Year End: December 31, 2024</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFiscalCalendar(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDataExport} onOpenChange={setShowDataExport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Export</DialogTitle>
            <DialogDescription>Export financial data for reporting</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">Export all financial transactions and ledger entries as CSV.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDataExport(false)}>Cancel</Button>
            <Button onClick={handleDataExport} className="bg-[#14B8A6] hover:bg-[#0D9488]">Export Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
