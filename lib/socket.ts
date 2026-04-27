import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

let _socket: Socket | null = null;
let _token: string | null = null;

/**
 * Returns the singleton Socket.IO instance connected to /support namespace.
 * Creates a new connection only when the token changes or socket doesn't exist.
 */
export function getSocket(token: string): Socket {
  if (_socket && _token === token) return _socket;

  // Disconnect existing socket if token changed
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }

  console.log('[Socket] Initializing connection with token:', token.substring(0, 10) + '...');
  _socket = io(`${SOCKET_URL}/support`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
  });

  _token = token;
  return _socket;
}

export function disconnectSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
    _token = null;
  }
}
