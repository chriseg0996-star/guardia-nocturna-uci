import {
  DEFAULT_SETTINGS_WIRE,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
  type GameSettingsWire,
  type GameStartWire,
  type LobbyPlayerWire,
  type LobbyStateWire,
  type PlayerWire,
} from '../../shared/protocol.js'

type InternalPlayer = {
  socketId: string
  id: number
  name: string
  color: string
  connected: boolean
}

export type Room = {
  pin: string
  hostSocketId: string
  status: 'lobby' | 'playing'
  settings: GameSettingsWire
  players: InternalPlayer[]
}

const rooms = new Map<string, Room>()
const socketToPin = new Map<string, string>()

function randomPin(): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const pin = String(Math.floor(100000 + Math.random() * 900000))
    if (!rooms.has(pin)) return pin
  }
  throw new Error('No se pudo generar PIN único')
}

function toLobbyState(room: Room): LobbyStateWire {
  const hostConnected = room.players.some((p) => p.socketId === room.hostSocketId) === false
    ? true
    : true // host always "connected" if room exists
  return {
    pin: room.pin,
    status: room.status,
    settings: room.settings,
    host: { name: 'Presentador', connected: hostConnected },
    players: room.players.map(
      (p): LobbyPlayerWire => ({
        id: p.id,
        name: p.name,
        color: p.color,
        connected: p.connected,
      }),
    ),
  }
}

function toGamePlayers(room: Room): PlayerWire[] {
  return room.players.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    position: 0,
    lives: 10,
    stamps: Array(8).fill(false),
    eliminated: false,
  }))
}

export function createRoom(
  hostSocketId: string,
  partialSettings?: Partial<GameSettingsWire>,
): { room: Room; lobby: LobbyStateWire } {
  const pin = randomPin()
  const settings = { ...DEFAULT_SETTINGS_WIRE, ...partialSettings }
  const room: Room = {
    pin,
    hostSocketId,
    status: 'lobby',
    settings,
    players: [],
  }
  rooms.set(pin, room)
  socketToPin.set(hostSocketId, pin)
  return { room, lobby: toLobbyState(room) }
}

export function joinRoom(
  socketId: string,
  pin: string,
  name: string,
): { room: Room; lobby: LobbyStateWire; playerId: number } | { error: 'NOT_FOUND' | 'FULL' | 'STARTED' | 'NAME_TAKEN' } {
  const room = rooms.get(pin)
  if (!room) return { error: 'NOT_FOUND' }
  if (room.status === 'playing') return { error: 'STARTED' }
  if (socketId === room.hostSocketId) return { error: 'NOT_FOUND' }
  if (room.players.length >= MAX_PLAYERS) return { error: 'FULL' }

  const trimmed = name.trim().slice(0, 24) || 'Residente'
  const nameTaken = room.players.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase() && p.socketId !== socketId,
  )
  if (nameTaken) return { error: 'NAME_TAKEN' }

  const existing = room.players.find((p) => p.socketId === socketId)
  if (existing) {
    existing.name = trimmed
    existing.connected = true
    socketToPin.set(socketId, pin)
    return { room, lobby: toLobbyState(room), playerId: existing.id }
  }

  const id = room.players.length
  const player: InternalPlayer = {
    socketId,
    id,
    name: trimmed,
    color: PLAYER_COLORS[id]!,
    connected: true,
  }
  room.players.push(player)
  socketToPin.set(socketId, pin)
  return { room, lobby: toLobbyState(room), playerId: id }
}

export function startRoom(
  socketId: string,
): { room: Room; game: GameStartWire } | { error: 'NOT_FOUND' | 'NOT_HOST' | 'STARTED' | 'INSUFFICIENT_PLAYERS' } {
  const pin = socketToPin.get(socketId)
  if (!pin) return { error: 'NOT_FOUND' }
  const room = rooms.get(pin)
  if (!room) return { error: 'NOT_FOUND' }
  if (room.hostSocketId !== socketId) return { error: 'NOT_HOST' }
  if (room.status === 'playing') return { error: 'STARTED' }
  const connected = room.players.filter((p) => p.connected).length
  if (connected < MIN_PLAYERS) return { error: 'INSUFFICIENT_PLAYERS' }

  room.status = 'playing'
  const game: GameStartWire = {
    pin: room.pin,
    players: toGamePlayers(room),
    settings: room.settings,
    currentPlayerIndex: 0,
    yourPlayerId: null,
  }
  return { room, game }
}

export function getRoomBySocket(socketId: string): Room | undefined {
  const pin = socketToPin.get(socketId)
  if (!pin) return undefined
  return rooms.get(pin)
}

export function leaveRoom(socketId: string): { pin: string; lobby: LobbyStateWire | null } | null {
  const pin = socketToPin.get(socketId)
  if (!pin) return null
  const room = rooms.get(pin)
  if (!room) {
    socketToPin.delete(socketId)
    return null
  }

  if (socketId === room.hostSocketId) {
    rooms.delete(pin)
    for (const p of room.players) socketToPin.delete(p.socketId)
    socketToPin.delete(socketId)
    return { pin, lobby: null }
  }

  const player = room.players.find((p) => p.socketId === socketId)
  if (!player) {
    socketToPin.delete(socketId)
    return null
  }

  room.players = room.players.filter((p) => p.socketId !== socketId)
  room.players.forEach((p, i) => {
    p.id = i
    p.color = PLAYER_COLORS[i]!
  })
  socketToPin.delete(socketId)

  if (room.players.length === 0 && room.status === 'lobby') {
    return { pin, lobby: toLobbyState(room) }
  }

  return { pin, lobby: toLobbyState(room) }
}

export function buildGameStartForSocket(room: Room, socketId: string): GameStartWire {
  const isHost = socketId === room.hostSocketId
  const player = room.players.find((p) => p.socketId === socketId)
  return {
    pin: room.pin,
    players: toGamePlayers(room),
    settings: room.settings,
    currentPlayerIndex: 0,
    yourPlayerId: isHost ? null : (player?.id ?? null),
  }
}
