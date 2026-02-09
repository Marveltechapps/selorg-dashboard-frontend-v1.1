import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Paperclip } from 'lucide-react';
import { PageHeader } from '../../ui/page-header';
import { EmptyState } from '../../ui/ux-components';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

interface Message {
  id: string;
  content: string;
  sender: string;
  senderType: 'vendor' | 'me';
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
}

interface Chat {
  id: string;
  vendorName: string;
  contactName: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: Message[];
}

// Load chats from localStorage or use default
const loadChatsFromStorage = (): Chat[] => {
  try {
    const saved = localStorage.getItem('vendorCommunicationChats');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load chats from localStorage', e);
  }
  // Default chats
  return [
    {
      id: 'fresh-farms',
      vendorName: 'Fresh Farms Inc.',
      contactName: 'Michael Green',
      lastMessage: 'Regarding the delayed shipment...',
      lastMessageTime: '5m ago',
      messages: [
        {
          id: '1',
          content: 'We are experiencing heavy rain in the region, causing a delay in harvest pickup.',
          sender: 'Michael',
          senderType: 'vendor',
          timestamp: '10:30 AM',
        },
        {
          id: '2',
          content: 'Understood. What is the new ETA for the shipment?',
          sender: 'Me',
          senderType: 'me',
          timestamp: '10:35 AM',
        },
        {
          id: '3',
          content: 'We expect to dispatch by 2 PM today.',
          sender: 'Michael',
          senderType: 'vendor',
          timestamp: '10:38 AM',
          hasAttachment: true,
          attachmentName: 'revised_schedule.pdf',
        },
      ],
    },
    {
      id: 'tech-logistics',
      vendorName: 'Tech Logistics',
      contactName: 'Sarah Johnson',
      lastMessage: 'Invoice submission confirmation.',
      lastMessageTime: '1h ago',
      messages: [
        {
          id: '1',
          content: 'Invoice #INV-2024-0012 has been submitted for your review.',
          sender: 'Sarah',
          senderType: 'vendor',
          timestamp: '9:15 AM',
        },
        {
          id: '2',
          content: 'Thank you. We will process it within 24 hours.',
          sender: 'Me',
          senderType: 'me',
          timestamp: '9:20 AM',
        },
      ],
    },
  ];
};

const saveChatsToStorage = (chats: Chat[]) => {
  try {
    localStorage.setItem('vendorCommunicationChats', JSON.stringify(chats));
  } catch (e) {
    console.warn('Failed to save chats to localStorage', e);
  }
};

export function VendorCommunication() {
  const [chats, setChats] = useState<Chat[]>(loadChatsFromStorage());
  // Load selected chat ID from localStorage or use default
  const [selectedChatId, setSelectedChatId] = useState<string>(() => {
    const saved = localStorage.getItem('vendorCommunicationSelectedChatId');
    return saved || 'fresh-farms';
  });
  
  // Save selected chat ID when it changes
  useEffect(() => {
    localStorage.setItem('vendorCommunicationSelectedChatId', selectedChatId);
  }, [selectedChatId]);
  const [messageInput, setMessageInput] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      sender: 'Me',
      senderType: 'me',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    // Update chats state with the new message
    setChats(prevChats => {
      const updated = prevChats.map(chat => 
        chat.id === selectedChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: messageInput.trim(),
              lastMessageTime: 'Just now',
            }
          : chat
      );
      // Save to localStorage
      saveChatsToStorage(updated);
      return updated;
    });

    setMessageInput('');
    toast.success('Message sent');
  };

  const handleNewMessage = () => {
    if (!newMessageRecipient || !newMessageContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check if a chat already exists for this recipient
    const existingChat = chats.find(chat => chat.id === newMessageRecipient);
    
    const vendorNames: Record<string, { name: string; contact: string }> = {
      'fresh-farms': { name: 'Fresh Farms Inc.', contact: 'Michael Green' },
      'tech-logistics': { name: 'Tech Logistics', contact: 'Sarah Johnson' },
      'global-spices': { name: 'Global Spices', contact: 'John Smith' },
      'dairy-delights': { name: 'Dairy Delights', contact: 'Emma Wilson' },
    };

    const vendorInfo = vendorNames[newMessageRecipient] || { name: newMessageRecipient, contact: 'Contact' };

    if (existingChat) {
      // Add message to existing chat
      const newMessage: Message = {
        id: Date.now().toString(),
        content: newMessageContent.trim(),
        sender: 'Me',
        senderType: 'me',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setChats(prevChats => {
        const updated = prevChats.map(chat =>
          chat.id === newMessageRecipient
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessageContent.trim(),
                lastMessageTime: 'Just now',
              }
            : chat
        );
        // Save to localStorage
        saveChatsToStorage(updated);
        return updated;
      });

      // Switch to this chat
      setSelectedChatId(newMessageRecipient);
    } else {
      // Create new chat
      const newChat: Chat = {
        id: newMessageRecipient,
        vendorName: vendorInfo.name,
        contactName: vendorInfo.contact,
        lastMessage: newMessageContent.trim(),
        lastMessageTime: 'Just now',
        messages: [
          {
            id: Date.now().toString(),
            content: newMessageContent.trim(),
            sender: 'Me',
            senderType: 'me',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      };

      setChats(prevChats => {
        const updated = [...prevChats, newChat];
        // Save to localStorage
        saveChatsToStorage(updated);
        return updated;
      });
      setSelectedChatId(newMessageRecipient);
    }

    toast.success(`Message sent to ${vendorInfo.name}`);
    setShowNewMessageModal(false);
    setNewMessageRecipient('');
    setNewMessageContent('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor Communication"
        subtitle="Centralized messaging, announcements, and communication with vendor partners"
        actions={
          <button 
            onClick={() => setShowNewMessageModal(true)}
            className="px-4 py-2 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] flex items-center gap-2 transition-colors"
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
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 border-b border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors ${
                        selectedChatId === chat.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-[#212121]">{chat.vendorName}</span>
                            <span className="text-xs text-[#757575]">{chat.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-[#616161] truncate">{chat.lastMessage}</p>
                    </div>
                  ))}
              </div>
          </div>

          {/* Chat Window */}
          {selectedChat ? (
            <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA] flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-[#212121]">{selectedChat.vendorName}</h3>
                        <p className="text-xs text-[#4F46E5]">Contact: {selectedChat.contactName}</p>
                    </div>
                </div>
                
                <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderType === 'vendor' ? 'justify-start' : 'justify-end'}`}
                      >
                          <div className={`p-3 rounded-lg border max-w-[80%] shadow-sm ${
                            message.senderType === 'vendor'
                              ? 'bg-white border-[#E0E0E0]'
                              : 'bg-[#E0E7FF] border-[#4F46E5]/20'
                          }`}>
                              <p className="text-sm text-[#212121]">{message.content}</p>
                              {message.hasAttachment && (
                                <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded border border-[#E0E0E0]">
                                    <Paperclip size={14} className="text-[#757575]" />
                                    <span className="text-xs font-medium">{message.attachmentName}</span>
                                </div>
                              )}
                              <span className={`text-[10px] mt-1 block ${
                                message.senderType === 'vendor' ? 'text-[#9E9E9E]' : 'text-[#4F46E5]'
                              }`}>
                                {message.sender} • {message.timestamp}
                              </span>
                          </div>
                      </div>
                    ))}
                </div>

                <div className="p-4 border-t border-[#E0E0E0] bg-white flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-[#4F46E5] text-white p-2 rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" />
                <p className="text-lg font-bold text-[#1F2937] mb-2">No Chat Selected</p>
                <p className="text-sm text-[#6B7280]">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
      </div>

      {/* New Message Modal */}
      <Dialog open={showNewMessageModal} onOpenChange={setShowNewMessageModal}>
        <DialogContent className="max-w-[600px] p-0" aria-describedby="new-message-description">
          <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
            <DialogTitle className="text-lg font-bold text-[#1F2937]">New Message</DialogTitle>
            <DialogDescription id="new-message-description" className="text-sm text-[#6B7280]">
              Start a conversation with a vendor
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Recipient <span className="text-red-500">*</span>
              </label>
              <select
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="">Select vendor...</option>
                <option value="fresh-farms">Fresh Farms Inc.</option>
                <option value="tech-logistics">Tech Logistics</option>
                <option value="global-spices">Global Spices</option>
                <option value="dairy-delights">Dairy Delights</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                placeholder="Type your message..."
                rows={5}
                maxLength={2000}
                className="w-full px-3 py-2 bg-white border border-[#D1D5DB] rounded-md text-sm text-[#1F2937] placeholder-[#9CA3AF] resize-none focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">{newMessageContent.length}/2000 characters</p>
            </div>
          </div>

          <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E5E7EB] flex justify-end gap-3">
            <button
              onClick={() => setShowNewMessageModal(false)}
              className="px-6 py-2.5 bg-white border border-[#D1D5DB] text-[#1F2937] text-sm font-medium rounded-md hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>
            <button
              onClick={handleNewMessage}
              disabled={!newMessageRecipient || !newMessageContent.trim()}
              className="px-6 py-2.5 bg-[#4F46E5] text-white text-sm font-medium rounded-md hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Message
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
