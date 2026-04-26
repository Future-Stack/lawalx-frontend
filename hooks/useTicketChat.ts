'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';
import { getSocket } from '@/lib/socket';
import type { ChatMessage, PresenceUpdate } from '@/types/chat';

export interface UseTicketChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  isConnected: boolean;
  presence: PresenceUpdate[];
}

/**
 * Reusable real-time chat hook for a single ticket room.
 * Joins the ticket room on mount, listens for new_chat_message events,
 * and exposes sendMessage. Cleans up listeners on unmount without
 * closing the singleton socket so it can be reused elsewhere.
 */
export function useTicketChat(ticketId: string | null, initialMessages: ChatMessage[] = []): UseTicketChatReturn {
  const token = useAppSelector(selectCurrentToken);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceUpdate[]>([]);

  const initialMessagesString = JSON.stringify(initialMessages);
  useEffect(() => {
    try {
      const parsed = JSON.parse(initialMessagesString);
      setMessages((prev) => {
        if (!parsed || parsed.length === 0) {
          // If no initial messages, just keep current socket messages (or clear if switching ticket, handled below)
          return prev;
        }
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const newSocketMessages = prev.filter((m) => !existingIds.has(m.id) && m.id);
        return [...parsed, ...newSocketMessages].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (e) {
      // safely ignore
    }
  }, [ticketId, initialMessagesString]);

  useEffect(() => {
    if (!token || !ticketId) return;

    const socket = getSocket(token);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onMessage = (msg: ChatMessage) =>
      setMessages((prev) => [...prev, msg]);

    const onPresence = (data: PresenceUpdate) =>
      setPresence((prev) => {
        const existing = prev.findIndex((p) => p.userId === data.userId);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        }
        return [...prev, data];
      });

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_chat_message', onMessage);
    socket.on('presence_update', onPresence);

    socket.emit('joinTicket', { ticketId });

    // Sync initial connection state
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_chat_message', onMessage);
      socket.off('presence_update', onPresence);
      setMessages([]);
      setPresence([]);
    };
  }, [token, ticketId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!token || !ticketId || !text.trim()) return;
      getSocket(token).emit('sendMessage', { ticketId, text });
    },
    [token, ticketId]
  );

  return { messages, sendMessage, isConnected, presence };
}
