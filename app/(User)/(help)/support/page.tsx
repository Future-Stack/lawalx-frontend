"use client";

import React, { useState, useRef, useEffect } from "react";
import CreateTicketModal from "@/components/support/CreateTicketModal";

import {
  useGetMyTicketsQuery,
  useCreateSupportTicketMutation,
  useGetTicketDetailsQuery,
  useUploadSupportFileMutation,
} from "@/redux/api/users/support/supportApi";
import { toast } from "sonner";
import { useTicketChat } from "@/hooks/useTicketChat";
import { useAppSelector } from "@/redux/store/hook";
import { selectCurrentUser } from "@/redux/features/auth/authSlice";
import type { ChatAttachment } from "@/types/chat";

// Refactored Components
import TicketList from "./_components/TicketList";
import ChatHeader from "./_components/ChatHeader";
import MessageList from "./_components/MessageList";
import ChatInput from "./_components/ChatInput";

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

function roleLabel(role?: string): string {
  if (!role) return 'Support';
  const r = role.toUpperCase();
  if (r === 'USER') return 'Client';
  if (r === 'SUPPORTER') return 'Supporter';
  if (r === 'ADMIN' || r === 'SUPERADMIN') return 'Admin';
  return role;
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
}

const Support = () => {
  const { data: ticketsResponse, isLoading } = useGetMyTicketsQuery();
  const [createSupportTicket] = useCreateSupportTicketMutation();
  const currentUser = useAppSelector(selectCurrentUser);

  const tickets = ticketsResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadSupportFile] = useUploadSupportFileMutation();

  // Fetch full details of the selected ticket to get the initial messages
  const { currentData: selectedTicketDetails } = useGetTicketDetailsQuery(selectedTicket?.id, {
    skip: !selectedTicket?.id,
  });

  // Map raw API messages → ChatMessage
  const rawMessages = selectedTicketDetails?.data?.messages ?? [];
  const initialMessages = rawMessages.map((m: any) => ({
    id: m.id,
    ticketId: selectedTicket?.id ?? '',
    text: m.text,
    senderId: m.sender?.id,
    senderName: m.sender?.full_name || m.sender?.username,
    senderRole: m.sender?.role,
    createdAt: m.createdAt,
    attachments: m.attachments ?? [],
    sender: m.sender,
  }));

  const { messages, sendMessage, isConnected } = useTicketChat(selectedTicket?.id ?? null, initialMessages);

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
      formData.append('issueType', data.issueType);

      if (data.file) {
        formData.append('files', data.file);
      }

      const res = await createSupportTicket(formData).unwrap();
      if (res.success) {
        setIsModalOpen(false);
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
    if (!newMessage.trim() && pendingAttachments.length === 0) return;
    if (!selectedTicket) return;
    const tempFileId = pendingAttachments[0]?.tempFileId;
    sendMessage(newMessage, tempFileId);
    setNewMessage("");
    setPendingAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await uploadSupportFile(fd).unwrap();
        if (res.success) {
          setPendingAttachments((prev) => [
            ...prev,
            { tempFileId: res.data.tempFileId, fileUrl: res.data.fileUrl, fileName: res.data.fileName },
          ]);
        }
      }
    } catch {
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx: number) =>
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));

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

  const assignedTo = (() => {
    const assignments = selectedTicketDetails?.data?.assignments;
    if (assignments && assignments.length > 0) {
      const user = assignments[0].user;
      return user.full_name || user.username || "Assigned";
    }
    return "Not Assigned";
  })();

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

          {/* Tickets List */}
          <TicketList
            tickets={tickets}
            isLoading={isLoading}
            selectedTicketId={selectedTicket?.id}
            onTicketSelect={handleTicketSelect}
            showChatOnMobile={showChatOnMobile}
            getStatusColor={getStatusColor}
          />

          {/* Chat Area */}
          <div className={`w-full lg:w-1/2 flex-col h-full bg-navbarBg ${showChatOnMobile ? 'flex' : 'hidden lg:flex'}`}>
            {selectedTicket ? (
              <>
                <ChatHeader
                  selectedTicket={selectedTicket}
                  isConnected={isConnected}
                  onBack={handleBackToTickets}
                  assignedTo={assignedTo}
                />

                <MessageList
                  messages={messages}
                  currentUser={currentUser}
                  isConnected={isConnected}
                  selectedTicket={selectedTicket}
                  messagesEndRef={messagesEndRef}
                  roleLabel={roleLabel}
                  isImageUrl={isImageUrl}
                  BASE_URL={BASE_URL}
                />

                <ChatInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  pendingAttachments={pendingAttachments}
                  onRemoveAttachment={removeAttachment}
                  onFileSelect={handleFileSelect}
                  onSendMessage={handleSendMessage}
                  isUploading={isUploading}
                  isConnected={isConnected}
                  fileInputRef={fileInputRef}
                />
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
