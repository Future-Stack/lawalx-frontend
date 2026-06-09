import { io, Socket } from 'socket.io-client';


const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

let _notifSocket: Socket | null = null;
let _notifToken: string | null = null;

/**
 * Returns a singleton Socket.IO instance connected to /notification namespace.
 * This is SEPARATE from the /support namespace used for chat.
 * Creates a new connection only when the token changes.
 */
export function getNotificationSocket(token: string): Socket {
  // Return existing socket if token hasn't changed
  if (_notifSocket && _notifToken === token) return _notifSocket;

  // Disconnect old socket if token changed
  if (_notifSocket) {
    _notifSocket.disconnect();
    _notifSocket = null;
  }

  console.log('[NotificationSocket] Connecting to /notification namespace...');

  _notifSocket = io(`${SOCKET_URL}/notification`, {
    withCredentials: true, 
    auth: { token },   
    autoConnect: true,
    transports: ['websocket'],
  });

  _notifToken = token;
  return _notifSocket;
}

export function disconnectNotificationSocket(): void {
  if (_notifSocket) {
    _notifSocket.disconnect();
    _notifSocket = null;
    _notifToken = null;
    console.log('[NotificationSocket] Disconnected.');
  }
}
