"use client";

import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send, User, X, ChevronLeft } from "lucide-react";
import CreateTicketModal from "@/components/support/CreateTicketModal";

import { useGetMyTicketsQuery, useCreateSupportTicketMutation } from "@/redux/api/users/support/supportApi";
import { IssueType } from "@/redux/api/users/support/support.types";
import { toast } from "sonner";
import { useTicketChat } from "@/hooks/useTicketChat";
import { useAppSelector } from "@/redux/store/hook";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";

const Support = () => {
  const { data: ticketsResponse, isLoading } = useGetMyTicketsQuery();
  const [createSupportTicket] = useCreateSupportTicketMutation();
  const currentUser = useAppSelector(selectCurrentUser);

  const tickets = ticketsResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnected } = useTicketChat(selectedTicket?.id ?? null);

  // Set initial selected ticket safely
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openModal = () => setIsModalOpen(true);

  const handleCreateTicket = async (data: {
    issueType: string;
    subject: string;
    message: string;
    file?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.message);
      // Map frontend issueType to enum if needed, or send as is
      formData.append('issueType', data.issueType);

      if (data.file) {
        formData.append('files', data.file);
      }

      const res = await createSupportTicket(formData).unwrap();
      if (res.success) {
        setIsModalOpen(false);
        // Automatically select the new ticket
        setSelectedTicket(res.data);
        setShowChatOnMobile(true);
        toast.success(res.message || "Ticket created successfully");
      } else {
        toast.error(res.message || "Failed to create ticket");
      }
    } catch (error: any) {
      console.error('Failed to create ticket', error);
      toast.error(error?.data?.message || "Something went wrong while creating ticket");
    }
  };

  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowChatOnMobile(true);
  };

  const handleBackToTickets = () => {
    setShowChatOnMobile(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    sendMessage(newMessage);
    setNewMessage("");
    setAttachedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      case "In Progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "Resolved":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Support Center
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We are here to help you with any issues
        </p>
      </div>

      {/* All Tickets Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Tickets
        </h2>
        <button
          onClick={openModal}
          className="px-5 py-2.5 bg-bgBlue hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-customShadow transition-colors"
        >
          + Create Ticket
        </button>
      </div>

      {/* Main Layout */}
      <div className="bg-navbarBg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden rounded-xl h-[calc(100vh-250px)] min-h-[500px]">
        <div className="flex flex-col lg:flex-row h-full">

          {/* Tickets List - Hidden on mobile if chat is open */}
          <div className={`w-full lg:w-1/2 border-r border-gray-200 dark:border-gray-700 flex-col ${showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
            <div className="h-full overflow-y-auto scrollbar-hide">
              <table className="w-full">
                {/* TABLE HEADER */}
                <thead className="bg-cardBackground2 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                  <tr className="h-20">
                    <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Issue Type
                    </th>
                    <th className="px-6 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">Loading tickets...</td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No tickets found.</td>
                    </tr>
                  ) : (
                    tickets.map((ticket: any) => (
                      <tr
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedTicket?.id === ticket.id
                          ? "bg-blue-50/60 dark:bg-blue-800/30"
                          : ""
                          }`}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {ticket.customId || ticket.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {Array.isArray(ticket.issueType) ? ticket.issueType.join(', ') : ticket.issueType}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-2.5 text-xs font-medium rounded-full ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chat Area - Hidden on mobile if chat is NOT open */}
          <div className={`w-full lg:w-1/2 flex-col h-full bg-navbarBg ${showChatOnMobile ? 'flex' : 'hidden lg:flex'}`}>
            {selectedTicket ? (
              <>
                {/* CHAT HEADER - Now perfectly matches table header */}
                <div className="min-h-20 flex items-center justify-between px-4 sm:px-6 bg-cardBackground2 border-b border-gray-200 dark:border-gray-700">

                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToTickets}
                    className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Left - Title + ID */}
                  <div className="flex items-center gap-6 sm:gap-8 min-w-0 flex-1">
                    <div className="truncate">
                      <h3 className="text-[0.825rem] xs:text-sm sm:text-base font-medium text-gray-900 dark:text-gray-300 tracking-wider truncate">
                        {selectedTicket.subject || selectedTicket.title}
                      </h3>
                      <p className="text-[0.7rem] xs:text-xs text-gray-500 dark:text-gray-400">
                        ID: {selectedTicket.customId || selectedTicket.id}
                      </p>
                    </div>
                  </div>

                  {/* Right - Connection status + Assigned To */}
                  <div className="text-right min-w-0 flex-shrink-0 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                          isConnected
                            ? 'bg-green-500'
                            : 'bg-gray-400 dark:bg-gray-600'
                        }`}
                      />
                      <span className="text-[0.65rem] text-gray-400 dark:text-gray-500">
                        {isConnected ? 'Live' : 'Offline'}
                      </span>
                    </div>
                    <p className="text-[0.7rem] xs:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      Assigned to
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-300 truncate max-w-32 sm:max-w-none">
                      {selectedTicket.assignedTo || "Not Assigned"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-navbarBg scrollbar-hide">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <p className="mb-2 text-sm text-center">
                        {selectedTicket.description || 'No description provided.'}
                      </p>
                      <p className="text-xs italic">
                        {isConnected
                          ? 'No messages yet. Start the conversation!'
                          : 'Connecting to chat...'}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id ?? index}
                          className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <div className="shrink-0">
                            {isOwn ? (
                              <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                {msg.senderName?.charAt(0)?.toUpperCase() ?? 'S'}
                              </div>
                            )}
                          </div>

                          <div className={`max-w-[85%] sm:max-w-md ${isOwn ? 'text-right' : ''}`}>
                            {!isOwn && msg.senderName && (
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {msg.senderName}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-3 text-left ${
                                isOwn
                                  ? 'bg-gray-800 dark:bg-white/20 text-white'
                                  : 'bg-cardBackground2 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-cardBackground2">
                  {attachedFiles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {attachedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>{file.name}</span>
                          <button
                            onClick={() =>
                              setAttachedFiles(
                                attachedFiles.filter((_, idx) => idx !== i)
                              )
                            }
                            className="text-gray-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        handleSendMessage()
                      }
                      rows={1}
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-sm text-gray-900 dark:text-white resize-none"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">Send</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 text-lg p-4 text-center">
                Select a ticket to view conversation
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
};
export default Support;
