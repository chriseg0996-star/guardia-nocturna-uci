import { createServer } from 'node:http'
import { Server, type Socket } from 'socket.io'
import type {
  ClientToServerEvents,
  CornerKeyWire,
  RoomErrorCode,
  ServerToClientEvents,
} from '../../shared/protocol.js'
import {
  buildGameStartForSocket,
  createRoom,
  getRoomBySocket,
  joinRoom,
  leaveRoom,
  startRoom,
} from './rooms.js'
import {
  destroyGameSession,
  getGameSession,
  OnlineGameSession,
  startGameSession,
} from './gameSession.js'

const PORT = Number(process.env.PORT ?? 3001)
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const corsOrigins = [
  ...new Set([
    ...CLIENT_ORIGINS,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:4173',
  ]),
]

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Guardia Nocturna server OK')
})
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
})

function emitError(socket: Socket, code: RoomErrorCode, message: string) {
  socket.emit('room:error', { code, message })
}

const ERROR_MESSAGES: Record<RoomErrorCode, string> = {
  NOT_FOUND: 'Sala no encontrada. Revisa el PIN.',
  FULL: 'La sala está llena (máx. 4 jugadores).',
  STARTED: 'La partida ya empezó.',
  NAME_TAKEN: 'Ese nombre ya está en la sala.',
  NOT_HOST: 'Solo el presentador puede iniciar la partida.',
  INSUFFICIENT_PLAYERS: 'Necesitas al menos 2 jugadores conectados.',
  NOT_YOUR_TURN: 'No es tu turno.',
  INVALID_PHASE: 'Acción no permitida ahora.',
}

function broadcastGameSync(pin: string) {
  const session = getGameSession(pin)
  const room = [...io.sockets.adapter.rooms.get(pin) ?? []]
  if (!session) return

  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId)
    if (!socket) continue
    socket.emit('game:sync', session.buildSync(socketId))
  }
}

function makeCallbacks(pin: string) {
  return {
    broadcastSync: (_pin: string) => broadcastGameSync(pin),
    sendQuestion: (socketId: string, categoryId: number, card: import('../../src/data/types.ts').Card, lapMessage: string | null) => {
      io.to(socketId).emit('game:question', {
        categoryId,
        card: OnlineGameSession.toQuestionWire(card),
        lapMessage,
      })
    },
    sendEvent: (socketId: string, event: import('../../src/data/types.ts').EventCard, lapMessage: string | null) => {
      io.to(socketId).emit('game:event', { event, lapMessage })
    },
    sendCorner: (socketId: string, corner: CornerKeyWire, lapMessage: string | null) => {
      io.to(socketId).emit('game:corner', { corner, lapMessage })
    },
  }
}

io.on('connection', (socket) => {
  socket.on('room:create', (partialSettings) => {
    const { lobby } = createRoom(socket.id, partialSettings)
    socket.join(lobby.pin)
    socket.emit('room:created', { pin: lobby.pin, lobby })
  })

  socket.on('room:join', ({ pin, name }) => {
    const result = joinRoom(socket.id, pin.trim(), name)
    if ('error' in result) {
      emitError(socket, result.error, ERROR_MESSAGES[result.error])
      return
    }
    socket.join(result.room.pin)
    socket.emit('room:joined', { lobby: result.lobby, yourPlayerId: result.playerId })
    socket.to(result.room.pin).emit('room:updated', result.lobby)
  })

  socket.on('room:start', () => {
    const result = startRoom(socket.id)
    if ('error' in result) {
      emitError(socket, result.error, ERROR_MESSAGES[result.error])
      return
    }

    const { room } = result
    startGameSession(room, makeCallbacks(room.pin))

    for (const player of room.players) {
      const game = buildGameStartForSocket(room, player.socketId)
      io.to(player.socketId).emit('game:started', game)
    }
    const hostGame = buildGameStartForSocket(room, room.hostSocketId)
    io.to(room.hostSocketId).emit('game:started', hostGame)

    broadcastGameSync(room.pin)
  })

  socket.on('game:roll', () => {
    const room = getRoomBySocket(socket.id)
    if (!room) return emitError(socket, 'NOT_FOUND', ERROR_MESSAGES.NOT_FOUND)
    const session = getGameSession(room.pin)
    if (!session) return
    const result = session.handleRoll(socket.id)
    if (result !== 'ok') emitError(socket, result, ERROR_MESSAGES[result])
  })

  socket.on('game:resolve-ready', () => {
    const room = getRoomBySocket(socket.id)
    if (!room) return
    getGameSession(room.pin)?.handleResolveReady()
  })

  socket.on('game:answer', (payload) => {
    const room = getRoomBySocket(socket.id)
    if (!room) return
    const session = getGameSession(room.pin)
    if (!session) return
    const result = session.handleAnswer(socket.id, payload.selectedOption, payload.timedOut)
    if (result !== 'ok') emitError(socket, result, ERROR_MESSAGES[result])
  })

  socket.on('game:dismiss-event', () => {
    const room = getRoomBySocket(socket.id)
    if (!room) return
    const session = getGameSession(room.pin)
    if (!session) return
    const result = session.handleDismissEvent(socket.id)
    if (result !== 'ok') emitError(socket, result, ERROR_MESSAGES[result])
  })

  socket.on('game:dismiss-corner', () => {
    const room = getRoomBySocket(socket.id)
    if (!room) return
    const session = getGameSession(room.pin)
    if (!session) return
    const result = session.handleDismissCorner(socket.id)
    if (result !== 'ok') emitError(socket, result, ERROR_MESSAGES[result])
  })

  socket.on('room:leave', () => {
    handleDisconnect(socket.id, false)
  })

  socket.on('disconnect', () => {
    handleDisconnect(socket.id, true)
  })
})

function handleDisconnect(socketId: string, isDisconnect: boolean) {
  const room = getRoomBySocket(socketId)
  const pin = room?.pin
  const result = leaveRoom(socketId)
  if (!result) return

  if (result.lobby === null) {
    if (pin) destroyGameSession(pin)
    io.to(result.pin).emit('room:error', {
      code: 'NOT_FOUND',
      message: isDisconnect ? 'El presentador cerró la sala.' : 'Sala cerrada.',
    })
    return
  }

  io.to(result.pin).emit('room:updated', result.lobby)
}

httpServer.listen(PORT, () => {
  console.log(`Guardia Nocturna server → http://localhost:${PORT}`)
})
