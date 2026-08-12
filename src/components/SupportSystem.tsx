import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { SupportTicket, TicketStatus } from '../types';
import { 
  ShieldCheck, 
  MapPin, 
  Key, 
  Clock, 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  Send, 
  AlertTriangle,
  FolderOpen,
  X
} from 'lucide-react';

interface SupportSystemProps {
  onNavigate: (route: string) => void;
}

export default function SupportSystem({ onNavigate }: SupportSystemProps) {
  const [session, setSession] = useState(() => rideEngine.getState());
  
  // Create ticket states
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [category, setCategory] = useState('Payment Issue');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Selected Ticket state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
      // Synchronize active ticket details if open
      if (selectedTicket) {
        const updated = state.supportTickets.find(t => t.ticketId === selectedTicket.ticketId);
        if (updated) setSelectedTicket(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedTicket]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    const ticket = await rideEngine.createSupportTicket(category, subject, description);
    setSelectedTicket(ticket);
    setIsOpenForm(false);
    setSubject('');
    setDescription('');
    alert('Support ticket created! Our team will respond shortly.');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !selectedTicket) return;
    await rideEngine.replyToSupportTicket(selectedTicket.ticketId, replyText);
    setReplyText('');
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    await rideEngine.updateTicketStatus(selectedTicket.ticketId, status);
  };

  if (!session.currentUser) return null;

  const role = session.currentUser.role;
  const filteredTickets = role === 'admin' 
    ? session.supportTickets 
    : session.supportTickets.filter(t => t.userId === session.currentUser?.uid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen pb-20" id="support_system_root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <span>ScootyRide Assistance Center</span>
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
            {role === 'admin' ? 'Manage complaints and platform queries' : 'Resolve billing, safety, and trip questions'}
          </p>
        </div>
        {role !== 'admin' && (
          <button
            onClick={() => setIsOpenForm(!isOpenForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/10 flex items-center space-x-1 transition-all cursor-pointer"
            id="btn_create_ticket_trigger"
          >
            <Plus className="w-4 h-4" />
            <span>Open Help Ticket</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Tickets List (Column Span 5) */}
        <div className="lg:col-span-5 space-y-6">

          {/* CREATE NEW TICKET FORM */}
          {isOpenForm && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="font-extrabold text-sm text-gray-900 uppercase">New Support Case</h3>
                <button onClick={() => setIsOpenForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                  >
                    <option value="Payment Issue">Payment & Billing Dispute</option>
                    <option value="Safety Issue">Safety & Emergency Alert</option>
                    <option value="Rider Complaint">Driver Behavior Feedback</option>
                    <option value="Lost Item">Lost & Found Property</option>
                    <option value="Technical Issue">App Bug & Crash Feedback</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Subject Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary (e.g. charged twice for ride #KA01)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe exactly what happened. Include trip numbers or times if possible..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </form>
            </div>
          )}

          {/* LIST OF CURRENT TICKETS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/40">
              <h3 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                <FolderOpen className="w-4 h-4 text-gray-400" />
                <span>Active Tickets & Issues</span>
              </h3>
            </div>

            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                  No support cases found
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50/40 transition-all flex justify-between items-center ${
                      selectedTicket?.ticketId === ticket.ticketId ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <div className="space-y-1 truncate max-w-[240px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-gray-900 text-xs truncate">{ticket.subject}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          ticket.status === 'open' 
                            ? 'bg-amber-100 text-amber-800' 
                            : ticket.status === 'resolved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold truncate">
                        Category: {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      {role === 'admin' && (
                        <p className="text-[9px] text-amber-600 font-black">Opened by: {ticket.userName} ({ticket.userRole})</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Detailed Chats & Conversation (Column Span 7) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden flex flex-col h-[520px]" id="support_ticket_viewer">
              
              {/* Ticket Details Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/40 flex justify-between items-center">
                <div>
                  <span className="text-[8px] font-black bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    CASE ID: #{selectedTicket.ticketId.slice(-6).toUpperCase()}
                  </span>
                  <h3 className="font-black text-sm text-gray-950 mt-1">{selectedTicket.subject}</h3>
                </div>

                {/* Admin Controls */}
                {role === 'admin' ? (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-extrabold uppercase tracking-wide rounded-lg transition-all"
                    >
                      Resolve Case
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="px-2.5 py-1 bg-gray-900 hover:bg-black text-white text-[9px] font-extrabold uppercase tracking-wide rounded-lg transition-all"
                    >
                      Close Case
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-gray-400 uppercase">
                    Status: {selectedTicket.status.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Chat replies list */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
                
                {/* Initial Description */}
                <div className="flex items-start space-x-3.5 max-w-md">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-xs">
                    {selectedTicket.userName.charAt(0)}
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{selectedTicket.userName} ({selectedTicket.userRole})</p>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">{selectedTicket.description}</p>
                    <span className="text-[8px] text-gray-400 mt-1 block">{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Replies Thread */}
                {selectedTicket.replies.map((reply) => {
                  const isMe = reply.senderId === session.currentUser?.uid;
                  return (
                    <div 
                      key={reply.replyId} 
                      className={`flex items-start space-x-3.5 max-w-md ${isMe ? 'ml-auto justify-end flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-xs">
                        {reply.senderName.charAt(0)}
                      </div>
                      <div className={`rounded-2xl p-4 border shadow-sm space-y-1 ${
                        isMe ? 'bg-amber-500 text-white border-amber-400' : 'bg-white text-gray-700 border-gray-100'
                      }`}>
                        <p className={`text-[8px] font-bold uppercase ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                          {reply.senderName} ({reply.senderRole})
                        </p>
                        <p className="text-xs leading-relaxed font-semibold">{reply.message}</p>
                        <span className={`text-[8px] mt-1 block ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                          {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Reply Send Form */}
              <form onSubmit={handleSendReply} className="px-6 py-3 border-t border-gray-100 flex items-center space-x-3 bg-white">
                <input
                  type="text"
                  required
                  disabled={selectedTicket.status === 'closed'}
                  placeholder={selectedTicket.status === 'closed' ? 'Case closed. Re-open to chat...' : 'Type support message reply...'}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={selectedTicket.status === 'closed'}
                  className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl shadow-md transition-all cursor-pointer"
                  id="btn_send_reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-md text-center space-y-3 h-[520px] flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="font-extrabold text-sm text-gray-500">No Support Case Selected</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Click on any of the tickets on the left panel to review message threads, responses, and agent resolutions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
