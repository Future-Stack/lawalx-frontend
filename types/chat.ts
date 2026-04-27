export interface ChatAttachment {
  tempFileId?: string;
  fileUrl: string;
  fileName: string;
}

export interface ChatMessageSender {
  id: string;
  username: string;
  full_name: string | null;
  image_url: string | null;
}

export interface ChatMessage {
  id?: string;
  ticketId: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  createdAt: string;
  attachments?: ChatAttachment[];
  sender?: ChatMessageSender; // present in real-time socket messages
}

export interface PresenceUpdate {
  userId: string;
  isActive: boolean;
}
