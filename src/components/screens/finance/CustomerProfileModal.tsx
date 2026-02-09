import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { User, Mail, Phone, MapPin, CreditCard, Calendar, DollarSign, FileText, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { CustomerPayment } from './customerPaymentsApi';

interface Props {
  payment: CustomerPayment | null;
  open: boolean;
  onClose: () => void;
}

export function CustomerProfileModal({ payment, open, onClose }: Props) {
  if (!payment) return null;

  // Mock customer profile data - in real app, this would come from an API
  const customerProfile = {
    id: `customer_${payment.customerEmail.replace('@', '_').replace('.', '_')}`,
    name: payment.customerName,
    email: payment.customerEmail,
    phone: "+1 (555) 123-4567",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States"
    },
    joinedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year ago
    totalOrders: 24,
    totalSpent: 2450.50,
    averageOrderValue: 102.10,
    paymentMethods: [
      { type: "card", display: payment.paymentMethodDisplay, lastUsed: payment.createdAt },
      { type: "wallet", display: "PayPal", lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() }
    ],
    recentPayments: [
      { id: payment.id, amount: payment.amount, status: payment.status, date: payment.createdAt },
      { id: "pay_prev1", amount: 125.00, status: "captured", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
      { id: "pay_prev2", amount: 89.50, status: "captured", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() }
    ],
    riskScore: 85,
    riskLevel: "Low"
  };

  // Ensure modal appears above sheet (z-100)
  useEffect(() => {
    if (open) {
      // Add custom styles to ensure z-index is higher
      const style = document.createElement('style');
      style.textContent = `
        [data-slot="dialog-overlay"] {
          z-index: 105 !important;
        }
        [data-slot="dialog-content"] {
          z-index: 110 !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2">
            <User size={20} className="text-[#14B8A6]" />
            Customer Profile
          </DialogTitle>
          <DialogDescription>
            Complete customer information and payment history
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 rounded-full bg-[#14B8A6] flex items-center justify-center text-white text-2xl font-bold">
                {customerProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{customerProfile.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{customerProfile.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="text-xs">
                    Risk: {customerProfile.riskLevel} ({customerProfile.riskScore}/100)
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Member since {new Date(customerProfile.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{customerProfile.totalOrders}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${customerProfile.totalSpent.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${customerProfile.averageOrderValue.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <Mail size={16} /> Contact Information
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{customerProfile.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{customerProfile.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div className="text-sm text-gray-900">
                        <p>{customerProfile.address.street}</p>
                        <p>{customerProfile.address.city}, {customerProfile.address.state} {customerProfile.address.zip}</p>
                        <p>{customerProfile.address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="space-y-4 mt-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <CreditCard size={16} /> Payment History
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {customerProfile.recentPayments.map((pay) => (
                      <div key={pay.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Payment {pay.id.substring(0, 12)}...</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(pay.date).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              ${pay.amount.toFixed(2)}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 text-xs ${
                                pay.status === 'captured' ? 'bg-green-50 text-green-700 border-green-200' :
                                pay.status === 'declined' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              {pay.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <CreditCard size={16} /> Payment Methods
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {customerProfile.paymentMethods.map((method, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{method.display}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last used: {new Date(method.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">{method.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2 text-sm">
                      <FileText size={16} /> Account Details
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                        <p className="text-sm font-mono text-gray-900">{customerProfile.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Member Since</p>
                        <p className="text-sm text-gray-900">
                          {new Date(customerProfile.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                        <p className="text-sm font-bold text-gray-900">{customerProfile.riskScore}/100</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                        <Badge variant="outline">{customerProfile.riskLevel}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            className="bg-[#14B8A6] hover:bg-[#0D9488]"
            onClick={() => {
              // Could navigate to full customer management page
              onClose();
            }}
          >
            View Full Profile <ExternalLink size={14} className="ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
