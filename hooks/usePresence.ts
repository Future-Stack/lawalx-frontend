'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';
import { getSocket } from '@/lib/socket';

interface PresenceEvent {
  userId: string;
  isActive: boolean;
}

/**
 * Listens to `presence_update` socket events using the singleton socket.
 * Returns a map of userId → isOnline (boolean).
 * No new socket connection is created — reuses the existing singleton.
 */
export function usePresence(): Record<string, boolean> {
  const token = useAppSelector(selectCurrentToken);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);

    const onPresence = (data: PresenceEvent) => {
      setPresenceMap((prev) => {
        if (prev[data.userId] === data.isActive) return prev;
        
        return {
          ...prev,
          [data.userId]: data.isActive,
        };
      });
    };

    socket.on('presence_update', onPresence);

    return () => {
      socket.off('presence_update', onPresence);
    };
  }, [token]);

  return presenceMap;
}
