import React from 'react';
import { MessageSquare, BellRing, Send, Paperclip } from 'lucide-react';

export function CommunicationHub() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Communication & Collaboration</h1>
          <p className="text-[#757575] text-sm">Internal notes, vendor chats, and escalation logs</p>
        </div>
        <button className="px-4 py-2 bg-[#14B8A6] text-white font-medium rounded-lg hover:bg-[#0D9488] flex items-center gap-2">
          <MessageSquare size={16} />
          New Thread
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
                  <h3 className="font-bold text-[#212121]">Recent Discussions</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer bg-teal-50">
                      <div className="flex justify-between mb-1">
                          <span className="font-bold text-[#212121]">Invoice #9921 Dispute</span>
                          <span className="text-xs text-[#757575]">10m ago</span>
                      </div>
                      <p className="text-sm text-[#616161] truncate">Vendor claims amount mismatch...</p>
                  </div>
                   <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer">
                      <div className="flex justify-between mb-1">
                          <span className="font-bold text-[#212121]">Refund Policy Update</span>
                          <span className="text-xs text-[#757575]">1h ago</span>
                      </div>
                      <p className="text-sm text-[#616161] truncate">Please review the new draft...</p>
                  </div>
              </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-[#212121]">Invoice #9921 Dispute</h3>
                      <p className="text-xs text-[#14B8A6]">Vendor: Fresh Farms Supplies</p>
                  </div>
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                  <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">The vendor has flagged that the invoice amount is short by $45.</p>
                          <span className="text-[10px] text-[#9E9E9E] mt-1 block">Sara (Ops) • 10:00 AM</span>
                      </div>
                  </div>
                   <div className="flex justify-end">
                      <div className="bg-[#F0FDFA] p-3 rounded-lg border border-[#14B8A6]/20 max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">Checking the GRN (Goods Received Note). It seems we rejected 3 crates due to damage.</p>
                          <span className="text-[10px] text-[#14B8A6] mt-1 block">Me • 10:15 AM</span>
                      </div>
                  </div>
                   <div className="flex justify-end">
                      <div className="bg-[#F0FDFA] p-3 rounded-lg border border-[#14B8A6]/20 max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">Attached the rejection slip.</p>
                          <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-[#E0E0E0]">
                              <Paperclip size={14} className="text-[#757575]" />
                              <span className="text-xs font-medium">rejection_slip_442.pdf</span>
                          </div>
                          <span className="text-[10px] text-[#14B8A6] mt-1 block">Me • 10:16 AM</span>
                      </div>
                  </div>
              </div>

              <div className="p-4 border-t border-[#E0E0E0] bg-white flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a note..." 
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6] outline-none"
                  />
                  <button className="bg-[#14B8A6] text-white p-2 rounded-lg hover:bg-[#0D9488]">
                      <Send size={20} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
