import React from 'react';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { toast } from 'sonner';

export function VendorCommunication() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Communication"
        subtitle="Centralized messaging, announcements, and communication with vendor partners"
        actions={
          <button 
            onClick={() => toast.info('New message feature coming soon')}
            className="px-4 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] flex items-center gap-2"
          >
            <MessageSquare size={16} />
            New Message
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Chat List */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
                  <h3 className="font-bold text-[#212121]">Vendor Messages</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer bg-indigo-50">
                      <div className="flex justify-between mb-1">
                          <span className="font-bold text-[#212121]">Fresh Farms Inc.</span>
                          <span className="text-xs text-[#757575]">5m ago</span>
                      </div>
                      <p className="text-sm text-[#616161] truncate">Regarding the delayed shipment...</p>
                  </div>
                   <div className="p-4 border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer">
                      <div className="flex justify-between mb-1">
                          <span className="font-bold text-[#212121]">Tech Logistics</span>
                          <span className="text-xs text-[#757575]">1h ago</span>
                      </div>
                      <p className="text-sm text-[#616161] truncate">Invoice submission confirmation.</p>
                  </div>
              </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-[#212121]">Fresh Farms Inc.</h3>
                      <p className="text-xs text-[#4F46E5]">Contact: Michael Green</p>
                  </div>
              </div>
              
              <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                  <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">We are experiencing heavy rain in the region, causing a delay in harvest pickup.</p>
                          <span className="text-[10px] text-[#9E9E9E] mt-1 block">Michael • 10:30 AM</span>
                      </div>
                  </div>
                   <div className="flex justify-end">
                      <div className="bg-[#E0E7FF] p-3 rounded-lg border border-[#4F46E5]/20 max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">Understood. What is the new ETA for the shipment?</p>
                          <span className="text-[10px] text-[#4F46E5] mt-1 block">Me • 10:35 AM</span>
                      </div>
                  </div>
                   <div className="flex justify-start">
                      <div className="bg-white p-3 rounded-lg border border-[#E0E0E0] max-w-[80%] shadow-sm">
                          <p className="text-sm text-[#212121]">We expect to dispatch by 2 PM today.</p>
                           <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-[#E0E0E0]">
                              <Paperclip size={14} className="text-[#757575]" />
                              <span className="text-xs font-medium">revised_schedule.pdf</span>
                          </div>
                          <span className="text-[10px] text-[#9E9E9E] mt-1 block">Michael • 10:38 AM</span>
                      </div>
                  </div>
              </div>

              <div className="p-4 border-t border-[#E0E0E0] bg-white flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none"
                  />
                  <button className="bg-[#4F46E5] text-white p-2 rounded-lg hover:bg-[#4338CA]">
                      <Send size={20} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
