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
    console.log('[useTicketChat] Effect triggered. ticketId:', ticketId, 'hasToken:', !!token);
    if (!token || !ticketId) return;

    const socket = getSocket(token);
    const tid = ticketId; // stable capture for closures below

    const joinRoom = () => {
      console.log('[useTicketChat] Emitting joinTicket for:', tid);
      socket.emit('joinTicket', { ticketId: tid });
    };

    // Re-emit joinTicket on every (re)connect so the client stays in the
    // room even after network drops or token rotation
    const onConnect = () => {
      console.log('[useTicketChat] Socket connected. Joining room:', tid);
      setIsConnected(true);
      joinRoom();
    };

    // connectionSuccess fires after server-side JWT auth completes
    const onConnectionSuccess = (data: { userId: string; role?: string }) => {
      console.log('[useTicketChat] Auth Success Event. UserID:', data.userId, 'Role:', data.role, 'Room:', tid);
      setIsConnected(true);
      joinRoom();
    };

    const onDisconnect = (reason: string) => {
      console.warn('[useTicketChat] Socket disconnected. Reason:', reason, 'tid:', tid);
      setIsConnected(false);
    };

    const onMessage = (msg: ChatMessage) => {
      console.log('[Socket] New message received:', msg);
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
      console.error('[useTicketChat] Connection Error (CORS/Auth/Network):', err.message);
      setIsConnected(false);
      toast.error(`Socket connection failed: ${err.message}`);
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
      console.log('[useTicketChat] Socket already connected globally. Joining room:', tid);
      joinRoom();
      setIsConnected(true);
    } else {
      console.log('[useTicketChat] Socket not connected yet. Waiting for connect/connectionSuccess events... tid:', tid);
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
