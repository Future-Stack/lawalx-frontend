'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken, selectCurrentUser } from '@/redux/features/auth/authSlice';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';
import type { ChatMessage, ChatAttachment, PresenceUpdate } from '@/types/chat';

export interface UseTicketChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string, tempFileId?: string) => void;
  isConnected: boolean;
  presence: PresenceUpdate[];
}

/**
 * Reusable real-time chat hook for a single ticket room.
 *
 * Messages are stored in a map keyed by ticketId so that:
 *  - Switching tickets never wipes history (Bug 2 fix).
 *  - Incoming events are routed to their own bucket by msg.ticketId,
 *    so messages from other open rooms never bleed into the current
 *    ticket view (Bug 1 fix).
 */
export function useTicketChat(
  ticketId: string | null,
  initialMessages: ChatMessage[] = []
): UseTicketChatReturn {
  const token = useAppSelector(selectCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentUserRef = useRef(currentUser);

  // Per-ticket message buckets — never cleared on ticket switch
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<PresenceUpdate[]>([]);

  // Keep ref fresh so closures created inside effects see the latest user
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Expose only the current ticket's messages; empty array for unseen tickets
  const messages: ChatMessage[] = ticketId ? (messagesMap[ticketId] ?? []) : [];

  // Merge REST-fetched initial messages into the correct ticket bucket,
  // preserving any socket messages already received for that ticket
  const initialMessagesString = JSON.stringify(initialMessages);
  useEffect(() => {
    if (!ticketId || initialMessages.length === 0) return;
    setMessagesMap((prev) => {
      const existing = prev[ticketId] ?? [];
      const serverIds = new Set(initialMessages.map((m) => m.id));
      const socketOnly = existing.filter((m) => m.id && !serverIds.has(m.id));
      const merged = [...initialMessages, ...socketOnly].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return { ...prev, [ticketId]: merged };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, initialMessagesString]);

  useEffect(() => {
    if (!token || !ticketId) return;

    const socket = getSocket(token);
    const tid = ticketId; // stable capture for closures below

    const joinRoom = () => socket.emit('joinTicket', { ticketId: tid });

    // Re-emit joinTicket on every (re)connect so the client stays in the
    // room even after network drops or token rotation
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

    const onMessage = (msg: ChatMessage) => {
      const targetId = msg.ticketId;
      if (!targetId) return;

      // Route message into its own ticket bucket regardless of which
      // ticket is currently selected — this prevents cross-ticket bleed
      setMessagesMap((prev) => {
        const current = prev[targetId] ?? [];

        // Replace optimistic placeholder if this is a server echo of our own message
        if (msg.id && msg.senderId === currentUserRef.current?.id) {
          const optIdx = current.findIndex(
            (m) =>
              typeof m.id === 'string' &&
              m.id.startsWith('local-') &&
              m.text === msg.text &&
              m.senderId === msg.senderId
          );
          if (optIdx !== -1) {
            const next = [...current];
            next[optIdx] = msg;
            return { ...prev, [targetId]: next };
          }
        }

        // Generic deduplication by server-assigned id
        if (msg.id && current.some((m) => m.id === msg.id)) return prev;

        return { ...prev, [targetId]: [...current, msg] };
      });
    };

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

    // Socket error from backend (e.g. 'Access Denied' from canAccessTicket)
    const onSocketError = (err: { message?: string }) => {
      console.error('[Socket] error event:', err);
      toast.error(err?.message || 'Chat error');
    };

    // Socket.IO connection error (network, CORS, auth rejection)
    const onConnectError = (err: Error) => {
      console.error('[Socket] connect_error:', err.message);
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('connectionSuccess', onConnectionSuccess);
    socket.on('disconnect', onDisconnect);
    socket.on('new_chat_message', onMessage);
    socket.on('presence_update', onPresence);
    socket.on('error', onSocketError);
    socket.on('connect_error', onConnectError);

    // Singleton socket already connected (e.g. switching ticket) — join immediately
    if (socket.connected) {
      console.log('[Socket] already connected, joining room:', tid);
      joinRoom();
      setIsConnected(true);
    } else {
      console.log('[Socket] waiting for connection, ticketId:', tid);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('connectionSuccess', onConnectionSuccess);
      socket.off('disconnect', onDisconnect);
      socket.off('new_chat_message', onMessage);
      socket.off('presence_update', onPresence);
      socket.off('error', onSocketError);
      socket.off('connect_error', onConnectError);
      // Intentionally NOT clearing messagesMap here — history is preserved
      // per-ticket so switching back restores previous messages
    };
  }, [token, ticketId]);

  const sendMessage = useCallback(
    (text: string, tempFileId?: string) => {
      if (!token || !ticketId) return;
      if (!text.trim() && !tempFileId) return;
      const user = currentUserRef.current;

      // Optimistic update so sender sees their own message instantly
      const optimisticMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        ticketId,
        text,
        senderId: user?.id ?? '',
        senderName: user?.name ?? '',
        createdAt: new Date().toISOString(),
      };
      setMessagesMap((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] ?? []), optimisticMsg],
      }));

      getSocket(token).emit('sendMessage', {
        ticketId,
        text,
        ...(tempFileId ? { tempFileId } : {}),
      });
    },
    [token, ticketId]
  );

  return { messages, sendMessage, isConnected, presence };
}
