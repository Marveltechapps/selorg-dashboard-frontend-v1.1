import { useState, useEffect } from 'react';

export interface CustomerPayment {
  id: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodDisplay: string; // e.g., "Visa - - - - 1234"
  methodType: "card" | "wallet" | "net_banking" | "cod" | string;
  gatewayRef: string;
  status: "captured" | "authorized" | "pending" | "declined" | "refunded" | "chargeback";
  createdAt: string;
  lastUpdatedAt: string;
  retryEligible: boolean;
  failureReason?: string;
}

export interface CustomerPaymentFilter {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  methodType?: string;
  page: number;
  pageSize: number;
}

const MOCK_PAYMENTS: CustomerPayment[] = [
  {
    id: "pay_123456789",
    customerName: "Alice Johnson",
    customerEmail: "alice@example.com",
    orderId: "ORD-9921",
    amount: 85.50,
    currency: "USD",
    paymentMethodDisplay: "Visa •••• 1234",
    methodType: "card",
    gatewayRef: "ch_3Jh...12x",
    status: "captured",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    retryEligible: false
  },
  {
    id: "pay_987654321",
    customerName: "Robert Smith",
    customerEmail: "rob.s@example.com",
    orderId: "ORD-9922",
    amount: 120.00,
    currency: "USD",
    paymentMethodDisplay: "MasterCard •••• 9988",
    methodType: "card",
    gatewayRef: "failed_...99x",
    status: "declined",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    retryEligible: true,
    failureReason: "Insufficient funds"
  },
  {
    id: "pay_456789123",
    customerName: "Elena Rodriguez",
    customerEmail: "elena.r@example.com",
    orderId: "ORD-9923",
    amount: 45.00,
    currency: "USD",
    paymentMethodDisplay: "Apple Pay",
    methodType: "wallet",
    gatewayRef: "ch_ApplePay_...22z",
    status: "captured",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    retryEligible: false
  },
  {
    id: "pay_112233445",
    customerName: "Michael Chang",
    customerEmail: "m.chang@example.com",
    orderId: "ORD-9924",
    amount: 210.50,
    currency: "USD",
    paymentMethodDisplay: "Amex •••• 0001",
    methodType: "card",
    gatewayRef: "ch_Amex_...00a",
    status: "authorized",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    retryEligible: false
  },
  {
    id: "pay_998877665",
    customerName: "Sarah Connor",
    customerEmail: "sarah.c@example.com",
    orderId: "ORD-9925",
    amount: 15.00,
    currency: "USD",
    paymentMethodDisplay: "PayPal",
    methodType: "wallet",
    gatewayRef: "pp_...xyz",
    status: "refunded",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    retryEligible: false
  },
  {
    id: "pay_554433221",
    customerName: "David Kim",
    customerEmail: "d.kim@example.com",
    orderId: "ORD-9926",
    amount: 320.00,
    currency: "USD",
    paymentMethodDisplay: "Visa •••• 5678",
    methodType: "card",
    gatewayRef: "ch_...error",
    status: "declined",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    retryEligible: true,
    failureReason: "Do not honor"
  },
    {
    id: "pay_667788990",
    customerName: "Emily White",
    customerEmail: "emily.w@example.com",
    orderId: "ORD-9927",
    amount: 50.00,
    currency: "USD",
    paymentMethodDisplay: "Net Banking",
    methodType: "net_banking",
    gatewayRef: "nb_...123",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    retryEligible: true
  }
];

export const fetchCustomerPayments = async (filter: CustomerPaymentFilter) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let filtered = [...MOCK_PAYMENTS];

  if (filter.query) {
    const q = filter.query.toLowerCase();
    filtered = filtered.filter(p => 
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.paymentMethodDisplay.toLowerCase().includes(q)
    );
  }

  if (filter.status && filter.status !== 'All Statuses') {
    filtered = filtered.filter(p => p.status.toLowerCase() === filter.status?.toLowerCase());
  }

  // Sort by newest
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const start = (filter.page - 1) * filter.pageSize;
  const end = start + filter.pageSize;
  
  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page: filter.page,
    pageSize: filter.pageSize
  };
};

export const fetchCustomerPaymentDetails = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const payment = MOCK_PAYMENTS.find(p => p.id === id);
  if (!payment) throw new Error("Payment not found");
  return payment;
};

export const retryCustomerPayment = async (id: string, amount?: number) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would call the backend
  // Here we just toggle status to pending or captured for demo
  const paymentIndex = MOCK_PAYMENTS.findIndex(p => p.id === id);
  if (paymentIndex === -1) throw new Error("Payment not found");

  const updatedPayment = {
    ...MOCK_PAYMENTS[paymentIndex],
    status: Math.random() > 0.3 ? "captured" as const : "pending" as const, // Random success/pending
    amount: amount || MOCK_PAYMENTS[paymentIndex].amount,
    lastUpdatedAt: new Date().toISOString(),
    retryEligible: false
  };

  MOCK_PAYMENTS[paymentIndex] = updatedPayment;
  return updatedPayment;
};
