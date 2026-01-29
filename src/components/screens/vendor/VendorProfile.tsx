import React, { useState } from 'react';
import { 
  ArrowLeft, X, MoreVertical, Edit, MessageSquare, FileText, 
  BarChart3, Pause, Phone, Mail, MapPin, Building2, CreditCard,
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle,
  Download, Eye, RefreshCw, Copy, Trash2
} from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  complianceStatus: 'Compliant' | 'Pending' | 'Non-Compliant';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Under Review';
  statusColor: string;
}

interface VendorProfileProps {
  vendor: Vendor;
  onClose: () => void;
  onEdit: () => void;
  onMessage: () => void;
  onViewDocs: () => void;
  onSuspend: () => void;
}

export function VendorProfile({ vendor, onClose, onEdit, onMessage, onViewDocs, onSuspend }: VendorProfileProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);

  // Mock data for vendor profile
  const profileData = {
    photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.name)}&size=120&background=4F46E5&color=fff&bold=true`,
    rating: 4.8,
    review_count: 2456,
    joined_date: 'January 15, 2023',
    tier: 'Preferred',
    
    contact: {
      person_name: 'Rajesh Kumar',
      phone: vendor.phone,
      phone_alt: '+91-9876543211',
      email: vendor.email,
    },
    
    address: {
      street: '123 Market Street, Koyambedu',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '600107',
      country: 'India'
    },
    
    financial: {
      gst_number: '33AABCU6034K2Z5',
      gst_verified: true,
      pan: 'ABCDE1234F',
      bank_name: 'ICICI Bank',
      account_number: '1234567890123456',
      account_masked: '••••••••••••7890',
      account_type: 'Savings Account',
      ifsc_code: 'ICIC0000001',
      account_holder: 'Rajesh Kumar'
    },
    
    performance: {
      total_orders: 245,
      orders_trend: '+15',
      on_time_delivery: 98,
      delivery_trend: '+2',
      quality_score: 4.8,
      quality_trend: '+0.2',
      payment_timeliness: 95,
      payment_trend: '0'
    },
    
    compliance: [
      { name: 'GST Certificate', status: 'Valid', valid_until: '2026-01-15', days_left: 393 },
      { name: 'FSSAI License', status: 'Valid', valid_until: '2025-12-31', days_left: 13 },
      { name: 'ISO Certificate', status: 'Pending', valid_until: null, days_left: null },
      { name: 'Insurance Certificate', status: 'Valid', valid_until: '2026-06-30', days_left: 560 }
    ],
    
    recent_orders: [
      { date: '2025-12-15', order_id: 'ORD-0821', amount: 5000, status: 'Delivered', quality: 'Pass' },
      { date: '2025-12-14', order_id: 'ORD-0820', amount: 3200, status: 'Delivered', quality: 'Pass' },
      { date: '2025-12-13', order_id: 'ORD-0819', amount: 4500, status: 'In Transit', quality: '-' },
      { date: '2025-12-12', order_id: 'ORD-0818', amount: 2800, status: 'Delivered', quality: 'Pass' },
      { date: '2025-12-11', order_id: 'ORD-0817', amount: 6200, status: 'Delivered', quality: 'Pass' }
    ]
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const getDaysLeftColor = (days: number | null) => {
    if (!days) return 'text-[#9CA3AF]';
    if (days < 30) return 'text-[#EF4444]';
    if (days < 90) return 'text-[#F59E0B]';
    return 'text-[#10B981]';
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden animate-slide-in-right">
      {/* Header Bar - Fixed */}
      <div className="sticky top-0 h-16 bg-white border-b border-[#E5E7EB] shadow-sm flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-[#4F46E5] hover:text-[#4338CA] font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Vendors</span>
          </button>
          <span className="text-[#D1D5DB]">|</span>
          <h1 className="text-lg font-bold text-[#1F2937]">Vendor Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setOpenMenu(!openMenu)}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
            >
              <MoreVertical size={20} className="text-[#6B7280]" />
            </button>
            {openMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
                <div className="absolute right-0 top-12 z-20 bg-white border border-[#E5E7EB] rounded-lg shadow-xl py-1 w-56">
                  <button onClick={() => { onEdit(); setOpenMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2">
                    <Edit size={14} /> Edit Vendor
                  </button>
                  <button onClick={() => { onMessage(); setOpenMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2">
                    <MessageSquare size={14} /> Send Message
                  </button>
                  <button onClick={() => { onViewDocs(); setOpenMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2">
                    <FileText size={14} /> View Documents
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2">
                    <BarChart3 size={14} /> Performance Report
                  </button>
                  <div className="border-t border-[#E5E7EB] my-1" />
                  <button onClick={() => { onSuspend(); setOpenMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-[#FEF3C7] flex items-center gap-2 text-[#92400E]">
                    <Pause size={14} /> Suspend Vendor
                  </button>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-64px)] overflow-y-auto">
        {/* Vendor Hero Card */}
        <div className="bg-gradient-to-b from-[#F9FAFB] to-white border-b border-[#E5E7EB] p-6">
          <div className="max-w-7xl mx-auto flex gap-6">
            {/* Vendor Photo */}
            <div className="flex-shrink-0">
              <img 
                src={profileData.photo_url} 
                alt={vendor.name}
                className={`w-32 h-32 rounded-full object-cover border-4 ${
                  profileData.tier === 'Preferred' ? 'border-[#4F46E5]' : 'border-[#10B981]'
                }`}
              />
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-[#1F2937]">{vendor.name}</h2>
                    <span className="text-sm text-[#6B7280] font-mono">({vendor.id})</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      vendor.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      vendor.status === 'Inactive' ? 'bg-[#FEE2E2] text-[#7F1D1D]' :
                      vendor.status === 'Suspended' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#EDE9FE] text-[#5B21B6]'
                    }`}>
                      {vendor.status === 'Active' && '✓'} {vendor.status}
                    </span>
                    <span className="text-sm text-[#6B7280]">{vendor.category}</span>
                    <span className="text-sm text-[#1F2937] flex items-center gap-1">
                      ⭐ {profileData.rating}/5 <span className="text-[#6B7280]">({profileData.review_count.toLocaleString()} reviews)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-[#6B7280]">
                    <span>Joined: {profileData.joined_date}</span>
                    <span>Tier: <span className="font-medium text-[#4F46E5]">{profileData.tier} ◆</span></span>
                    <span>Compliance: <span className={`font-medium ${vendor.complianceStatus === 'Compliant' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {vendor.complianceStatus === 'Compliant' ? '✓' : '⚠'} {vendor.complianceStatus}
                    </span></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={onEdit}
                  className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] flex items-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={onMessage}
                  className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-[#F3F4F6] flex items-center gap-2"
                >
                  <MessageSquare size={16} /> Message
                </button>
                <button 
                  onClick={onViewDocs}
                  className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-[#F3F4F6] flex items-center gap-2"
                >
                  <FileText size={16} /> View Docs
                </button>
                <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-[#F3F4F6] flex items-center gap-2">
                  <BarChart3 size={16} /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Contact Information Section */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Phone size={20} className="text-[#4F46E5]" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Contact Person</label>
                <p className="text-sm text-[#1F2937] mt-1">{profileData.contact.person_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Email</label>
                <a href={`mailto:${profileData.contact.email}`} className="text-sm text-[#4F46E5] hover:underline mt-1 block">
                  {profileData.contact.email}
                </a>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Primary Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-[#1F2937]">{profileData.contact.phone}</p>
                  <button 
                    onClick={() => copyToClipboard(profileData.contact.phone)}
                    className="p-1 hover:bg-[#F3F4F6] rounded"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} className="text-[#6B7280]" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Alternate Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-[#1F2937]">{profileData.contact.phone_alt}</p>
                  <button 
                    onClick={() => copyToClipboard(profileData.contact.phone_alt)}
                    className="p-1 hover:bg-[#F3F4F6] rounded"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} className="text-[#6B7280]" />
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide flex items-center gap-1">
                  <MapPin size={14} /> Address
                </label>
                <p className="text-sm text-[#1F2937] mt-1">
                  {profileData.address.street}<br/>
                  {profileData.address.city}, {profileData.address.state} {profileData.address.postal_code}<br/>
                  {profileData.address.country}
                </p>
              </div>
            </div>
          </section>

          {/* Financial Information Section */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-[#4F46E5]" />
              Financial Details
            </h3>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">GST Number</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-[#1F2937]">{profileData.financial.gst_number}</p>
                  {profileData.financial.gst_verified && (
                    <CheckCircle size={16} className="text-[#10B981]" title="Verified" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">PAN Number</label>
                <p className="text-sm font-mono text-[#1F2937] mt-1">{profileData.financial.pan}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Bank Name</label>
                <p className="text-sm text-[#1F2937] mt-1">{profileData.financial.bank_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Account Type</label>
                <p className="text-sm text-[#1F2937] mt-1">{profileData.financial.account_type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Bank Account</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-mono text-[#1F2937]">
                    {showFullAccount ? profileData.financial.account_number : profileData.financial.account_masked}
                  </p>
                  <button 
                    onClick={() => setShowFullAccount(!showFullAccount)}
                    className="text-xs text-[#4F46E5] hover:underline"
                  >
                    {showFullAccount ? 'Hide' : 'Reveal'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">IFSC Code</label>
                <p className="text-sm font-mono text-[#1F2937] mt-1">{profileData.financial.ifsc_code}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Account Holder Name</label>
                <p className="text-sm text-[#1F2937] mt-1">{profileData.financial.account_holder}</p>
              </div>
            </div>
          </section>

          {/* Performance KPIs Section */}
          <section>
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* KPI Card 1 - Total Orders */}
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] rounded-xl p-5 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wide mb-3">Total Orders</p>
                <p className="text-4xl font-bold text-[#1E3A8A] mb-2">{profileData.performance.total_orders}</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={16} className="text-[#10B981]" />
                  <span className="text-[#10B981] font-medium">{profileData.performance.orders_trend}%</span>
                  <span className="text-[#6B7280] text-xs">vs last month</span>
                </div>
              </div>

              {/* KPI Card 2 - On-Time Delivery */}
              <div className="bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[#BBF7D0] rounded-xl p-5 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-xs font-bold text-[#166534] uppercase tracking-wide mb-3">On-Time Delivery</p>
                <p className="text-4xl font-bold text-[#14532D] mb-2">{profileData.performance.on_time_delivery}%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={16} className="text-[#10B981]" />
                  <span className="text-[#10B981] font-medium">{profileData.performance.delivery_trend}%</span>
                  <span className="text-[#6B7280] text-xs">vs last month</span>
                </div>
              </div>

              {/* KPI Card 3 - Quality Score */}
              <div className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border border-[#FCD34D] rounded-xl p-5 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-xs font-bold text-[#92400E] uppercase tracking-wide mb-3">Quality Score</p>
                <p className="text-4xl font-bold text-[#78350F] mb-2">{profileData.performance.quality_score}/5</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp size={16} className="text-[#10B981]" />
                  <span className="text-[#10B981] font-medium">+{profileData.performance.quality_trend}</span>
                  <span className="text-[#6B7280] text-xs">vs last month</span>
                </div>
              </div>

              {/* KPI Card 4 - Payment Timeliness */}
              <div className="bg-gradient-to-br from-[#FEE2E2] to-[#FECACA] border border-[#FCA5A5] rounded-xl p-5 hover:scale-105 transition-transform cursor-pointer">
                <p className="text-xs font-bold text-[#7F1D1D] uppercase tracking-wide mb-3">Payment Timeliness</p>
                <p className="text-4xl font-bold text-[#991B1B] mb-2">{profileData.performance.payment_timeliness}%</p>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-[#6B7280] font-medium">↔ Same</span>
                  <span className="text-[#6B7280] text-xs">vs last month</span>
                </div>
              </div>
            </div>
          </section>

          {/* Compliance Status Table */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Compliance Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left">Certificate</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Valid Until</th>
                    <th className="px-4 py-3 text-left">Days Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {profileData.compliance.map((cert, index) => (
                    <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <FileText size={16} className="text-[#6B7280]" />
                        <span className="text-[#1F2937]">{cert.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 font-medium ${
                          cert.status === 'Valid' ? 'text-[#10B981]' :
                          cert.status === 'Pending' ? 'text-[#F59E0B]' :
                          'text-[#EF4444]'
                        }`}>
                          {cert.status === 'Valid' && <CheckCircle size={16} />}
                          {cert.status === 'Pending' && <AlertTriangle size={16} />}
                          {cert.status === 'Rejected' && <XCircle size={16} />}
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#1F2937]">{cert.valid_until || '-'}</td>
                      <td className="px-4 py-3">
                        {cert.days_left ? (
                          <span className={`font-medium ${getDaysLeftColor(cert.days_left)}`}>
                            {cert.days_left} days
                            {cert.days_left < 30 && ' ⚠'}
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Orders Table */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Quality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {profileData.recent_orders.map((order, index) => (
                    <tr key={index} className="hover:bg-[#F9FAFB] transition-colors cursor-pointer">
                      <td className="px-4 py-3 text-[#6B7280]">{order.date}</td>
                      <td className="px-4 py-3">
                        <a href="#" className="text-[#4F46E5] font-medium hover:underline">
                          {order.order_id}
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#1F2937]">₹{order.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-[#D1FAE5] text-[#065F46]' :
                          order.status === 'In Transit' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                          'bg-[#FEF3C7] text-[#92400E]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.quality === 'Pass' ? (
                          <span className="text-[#10B981] font-medium">✓ Pass</span>
                        ) : order.quality === 'Fail' ? (
                          <span className="text-[#EF4444] font-medium">✕ Fail</span>
                        ) : (
                          <span className="text-[#9CA3AF]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <a href="#" className="text-[#4F46E5] text-sm font-medium hover:underline">
                View All Orders →
              </a>
            </div>
          </section>

          {/* Documents Quick View */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8">
            <h3 className="text-lg font-bold text-[#1F2937] mb-4">Documents</h3>
            <div className="space-y-3">
              {profileData.compliance.map((doc, index) => (
                <div key={index} className="p-4 border border-[#E5E7EB] rounded-lg hover:border-[#4F46E5] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-[#4F46E5]" />
                      <div>
                        <p className="font-medium text-[#1F2937]">{doc.name}</p>
                        {doc.valid_until && (
                          <p className={`text-xs ${getDaysLeftColor(doc.days_left)}`}>
                            Expires: {doc.valid_until} {doc.days_left && doc.days_left < 30 && '⚠'}
                          </p>
                        )}
                        {doc.status === 'Pending' && (
                          <p className="text-xs text-[#F59E0B]">⚠ Pending Review</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#F0F7FF] rounded flex items-center gap-1">
                        <Eye size={14} /> View
                      </button>
                      <button className="px-3 py-1 text-xs font-medium text-[#4F46E5] hover:bg-[#F0F7FF] rounded flex items-center gap-1">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button 
                onClick={onViewDocs}
                className="text-[#4F46E5] text-sm font-medium hover:underline"
              >
                View All Documents →
              </button>
            </div>
          </section>

          {/* SECTION 7: Categories & Products */}
          <CategoryManagement />

          {/* SECTION 8: Purchase Limits */}
          <PurchaseLimits />

          {/* SECTION 9: Product-Specific Constraints */}
          <ProductConstraints />
        </div>
      </div>
    </div>
  );
}

// Category Management Component
function CategoryManagement() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const categories = [
    { name: 'Fruits', enabled: true, products: [{ name: 'Apple', type: 'Raw' }, { name: 'Mango Juice', type: 'Finished' }] },
    { name: 'Vegetables', enabled: true, products: [{ name: 'Tomato', type: 'Raw' }, { name: 'Carrot', type: 'Raw' }] },
    { name: 'Atta', enabled: true, products: [{ name: 'Wheat Flour', type: 'Finished' }] },
    { name: 'Rice', enabled: true, products: [{ name: 'Basmati Rice', type: 'Raw' }] },
    { name: 'Oil', enabled: false, products: [] },
    { name: 'Dals', enabled: true, products: [{ name: 'Moong Dal', type: 'Raw' }] },
    { name: 'Dairy', enabled: true, products: [{ name: 'Milk', type: 'Raw' }] },
    { name: 'Bread', enabled: false, products: [] },
    { name: 'Eggs', enabled: true, products: [{ name: 'Farm Eggs', type: 'Raw' }] },
    { name: 'Masalas', enabled: true, products: [{ name: 'Garam Masala', type: 'Finished' }] },
  ];

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-[#1F2937] mb-4">Categories & Products</h3>
      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
              onClick={() => toggleCategory(category.name)}
            >
              <div className="flex items-center gap-3">
                <button className="text-[#6B7280] transition-transform">
                  {expandedCategories.includes(category.name) ? '▼' : '▶'}
                </button>
                <span className="font-medium text-[#1F2937]">{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  category.enabled ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}>
                  {category.enabled ? '✓ Enabled' : 'Disabled'}
                </span>
              </div>
              <button className="px-3 py-1 text-sm text-[#4F46E5] hover:bg-[#F0F7FF] rounded">
                Edit
              </button>
            </div>
            
            {expandedCategories.includes(category.name) && (
              <div className="px-4 pb-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
                <div className="mt-3">
                  <p className="text-xs font-medium text-[#6B7280] uppercase mb-2">Products:</p>
                  {category.products.length > 0 ? (
                    <div className="space-y-2">
                      {category.products.map((product, pIndex) => (
                        <div key={pIndex} className="flex items-center justify-between bg-white p-2 rounded border border-[#E5E7EB]">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#1F2937]">{product.name}</span>
                            <span className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded">
                              {product.type}
                            </span>
                          </div>
                          <button className="text-xs text-[#EF4444] hover:underline">Remove</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#9CA3AF] italic">No products added</p>
                  )}
                  <button className="mt-3 text-sm text-[#4F46E5] hover:underline">+ Add Product</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Purchase Limits Component
function PurchaseLimits() {
  const [isEditingGlobal, setIsEditingGlobal] = useState(false);

  const globalLimits = {
    min: 100,
    max: 500,
    unit: 'kg'
  };

  const categoryLimits = [
    { category: 'Vegetables', min: 50, max: 200, unit: 'kg' },
    { category: 'Fruits', min: 30, max: 150, unit: 'kg' },
    { category: 'Dairy', min: 20, max: 100, unit: 'L' },
  ];

  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold text-[#1F2937] mb-4">Purchase Limits & Constraints</h3>
      
      {/* Global Limits */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-[#6B7280] uppercase mb-3">Global Limits</h4>
        <div className="bg-[#F9FAFB] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Minimum Quantity Per Order</p>
              <p className="text-sm text-[#1F2937] font-medium">{globalLimits.min} {globalLimits.unit} per day</p>
            </div>
            <button 
              onClick={() => setIsEditingGlobal(true)}
              className="p-2 hover:bg-white rounded transition-colors"
            >
              <Edit size={16} className="text-[#4F46E5]" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] mb-1">Maximum Quantity Per Order</p>
              <p className="text-sm text-[#1F2937] font-medium">{globalLimits.max} {globalLimits.unit} per day</p>
            </div>
            <button 
              onClick={() => setIsEditingGlobal(true)}
              className="p-2 hover:bg-white rounded transition-colors"
            >
              <Edit size={16} className="text-[#4F46E5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Category-Specific Limits */}
      <div>
        <h4 className="text-sm font-bold text-[#6B7280] uppercase mb-3">Category-Specific Limits</h4>
        <div className="space-y-2">
          {categoryLimits.map((limit, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1F2937]">{limit.category}</p>
                <p className="text-xs text-[#6B7280]">
                  Min: {limit.min} {limit.unit} | Max: {limit.max} {limit.unit}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs text-[#4F46E5] hover:bg-white rounded">Edit</button>
                <button className="px-3 py-1 text-xs text-[#EF4444] hover:bg-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 text-sm text-[#4F46E5] hover:underline">+ Add Category Limit</button>
      </div>
    </section>
  );
}

// Product Constraints Component
function ProductConstraints() {
  const constraints = [
    { product: 'Tomato', category: 'Vegetables', min: 50, max: 200, unit: 'kg' },
    { product: 'Apple', category: 'Fruits', min: 30, max: 150, unit: 'kg' },
    { product: 'Milk', category: 'Dairy', min: 20, max: 100, unit: 'L' },
    { product: 'Rice (Basmati)', category: 'Rice', min: 100, max: 500, unit: 'kg' },
    { product: 'Mustard Oil', category: 'Oil', min: 50, max: 300, unit: 'L' },
  ];

  return (
    <section className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 mb-8">
      <h3 className="text-lg font-bold text-[#1F2937] mb-4">Product-Specific Constraints</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F9FAFB] text-[#6B7280] font-medium border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Min/Day</th>
              <th className="px-4 py-3 text-left">Max/Day</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {constraints.map((item, index) => (
              <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-4 py-3 font-medium text-[#1F2937]">{item.product}</td>
                <td className="px-4 py-3 text-[#6B7280]">{item.category}</td>
                <td className="px-4 py-3 font-mono text-[#1F2937]">{item.min} {item.unit}</td>
                <td className="px-4 py-3 font-mono text-[#1F2937]">{item.max} {item.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-[#F0F7FF] rounded" title="Edit">
                      <Edit size={16} className="text-[#4F46E5]" />
                    </button>
                    <button className="p-1 hover:bg-[#FEE2E2] rounded" title="Delete">
                      <Trash2 size={16} className="text-[#EF4444]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <button className="text-[#4F46E5] text-sm font-medium hover:underline">
          + Add Product Constraint
        </button>
      </div>
    </section>
  );
}