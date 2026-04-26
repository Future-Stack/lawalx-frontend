'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken, selectCurrentUser } from '@/redux/features/auth/authSlice';
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
 *
 * Key behaviours:
 * - joinTicket is re-emitted on every connect/reconnect so the client
 *   stays in the room even after network drops or token refreshes.
 * - connectionSuccess (server auth confirmed) also triggers joinTicket.
 * - sendMessage adds an optimistic message instantly so the sender
 *   sees their own message without waiting for a server echo.
 * - Incoming messages deduplicate by ID to handle server echoes of
 *   optimistic messages.
 */
export function useTicketChat(
  ticketId: string | null,
  initialMessages: ChatMessage[] = []
): UseTicketChatReturn {
  const token = useAppSelector(selectCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceUpdate[]>([]);

  // Keep a ref to currentUser so closures inside the effect always see latest value
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Load initial messages from REST API when available, merging with any
  // socket messages already received (deduplication by id)
  const initialMessagesString = JSON.stringify(initialMessages);
  useEffect(() => {
    if (!initialMessages || initialMessages.length === 0) return;
    setMessages((prev) => {
      const serverIds = new Set(initialMessages.map((m) => m.id));
      // Keep socket messages that aren't in the REST response (newer), ensuring they belong to current ticket
      const onlySocket = prev.filter((m) => m.id && !serverIds.has(m.id) && m.ticketId === ticketId);
      return [...initialMessages, ...onlySocket].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, initialMessagesString]);

  useEffect(() => {
    if (!token || !ticketId) return;

    const socket = getSocket(token);

    // Centralised room-join so it can be called from multiple places
    const joinRoom = () => {
      socket.emit('joinTicket', { ticketId });
    };

    // Re-emit joinTicket on every (re)connect so the client is always in
    // the room, even after network drops or token rotation
    const onConnect = () => {
      setIsConnected(true);
      joinRoom();
    };

    // connectionSuccess fires after server-side JWT auth completes
    const onConnectionSuccess = (_data: { userId: string }) => {
      setIsConnected(true);
      joinRoom();
    };

    const onDisconnect = () => setIsConnected(false);

    const onMessage = (msg: ChatMessage) =>
      setMessages((prev) => {
        // Replace matching optimistic message (same text + senderId, local id)
        if (msg.id && msg.senderId === currentUserRef.current?.id) {
          const optimisticIdx = prev.findIndex(
            (m) =>
              typeof m.id === 'string' &&
              m.id.startsWith('local-') &&
              m.text === msg.text &&
              m.senderId === msg.senderId
          );
          if (optimisticIdx !== -1) {
            const next = [...prev];
            next[optimisticIdx] = msg;
            return next;
          }
        }
        // Generic deduplication by id
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

    const onPresence = (data: PresenceUpdate) =>
      setPresence((prev) => {
        const idx = prev.findIndex((p) => p.userId === data.userId);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });

    socket.on('connect', onConnect);
    socket.on('connectionSuccess', onConnectionSuccess);
    socket.on('disconnect', onDisconnect);
    socket.on('new_chat_message', onMessage);
    socket.on('presence_update', onPresence);

    // If the singleton socket is already connected (switching ticket),
    // join the new room immediately without waiting for connect event
    if (socket.connected) {
      joinRoom();
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('connectionSuccess', onConnectionSuccess);
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
      const user = currentUserRef.current;

      // Optimistic update — sender sees their message instantly without
      // needing the server to echo it back
      const optimisticMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        ticketId,
        text,
        senderId: user?.id ?? '',
        senderName: user?.name ?? '',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      getSocket(token).emit('sendMessage', { ticketId, text });
    },
    [token, ticketId]
  );

  return { messages, sendMessage, isConnected, presence };
}
