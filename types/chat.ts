export interface ChatMessage {
  id?: string;
  ticketId: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  createdAt: string;
}

export interface PresenceUpdate {
  userId: string;
  isActive: boolean;
}
