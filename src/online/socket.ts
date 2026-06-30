import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../../shared/protocol'

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: GameSocket | null = null

function socketUrl(): string {
  const env = import.meta.env.VITE_SOCKET_URL
  if (env) return env
  if (import.meta.env.DEV) return window.location.origin
  return window.location.origin
}

export function getSocket(): GameSocket {
  if (!socket) {
    socket = io(socketUrl(), {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket(): Promise<GameSocket> {
  const s = getSocket()
  if (s.connected) return Promise.resolve(s)
  return new Promise((resolve, reject) => {
    const onConnect = () => {
      cleanup()
      resolve(s)
    }
    const onError = (err: Error) => {
      cleanup()
      reject(err)
    }
    const cleanup = () => {
      s.off('connect', onConnect)
      s.off('connect_error', onError)
    }
    s.on('connect', onConnect)
    s.on('connect_error', onError)
    s.connect()
  })
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}
