import { create } from 'zustand'
import type {
  CornerPayloadWire,
  EventPayloadWire,
  GameStartWire,
  GameSyncWire,
  LobbyStateWire,
  QuestionPayloadWire,
  RoomErrorCode,
} from '../../shared/protocol'
import { useGameStore } from '../game/store'
import { connectSocket, disconnectSocket, getSocket } from './socket'

export type OnlineScreen =
  | 'idle'
  | 'host-lobby'
  | 'join'
  | 'player-lobby'
  | 'host-game'
  | 'player-game'

type OnlineStore = {
  screen: OnlineScreen
  connected: boolean
  error: string | null
  lobby: LobbyStateWire | null
  game: GameStartWire | null
  sync: GameSyncWire | null
  yourPlayerId: number | null
  isHost: boolean
  privateQuestion: QuestionPayloadWire | null
  privateEvent: EventPayloadWire | null
  privateCorner: CornerPayloadWire | null

  reset: () => void
  createRoom: () => Promise<void>
  joinRoom: (pin: string, name: string) => Promise<void>
  startGame: () => void
  leaveRoom: () => void
  rollDice: () => void
  submitAnswer: (selectedOption?: number, timedOut?: boolean) => void
  dismissEvent: () => void
  dismissCorner: () => void
  bindSocketEvents: () => void
}

const initial = {
  screen: 'idle' as OnlineScreen,
  connected: false,
  error: null as string | null,
  lobby: null as LobbyStateWire | null,
  game: null as GameStartWire | null,
  sync: null as GameSyncWire | null,
  yourPlayerId: null as number | null,
  isHost: false,
  privateQuestion: null as QuestionPayloadWire | null,
  privateEvent: null as EventPayloadWire | null,
  privateCorner: null as CornerPayloadWire | null,
}

let listenersBound = false

function clearPrivateModals() {
  return {
    privateQuestion: null as QuestionPayloadWire | null,
    privateEvent: null as EventPayloadWire | null,
    privateCorner: null as CornerPayloadWire | null,
  }
}

export const useOnlineStore = create<OnlineStore>((set, get) => ({
  ...initial,

  reset: () => {
    disconnectSocket()
    listenersBound = false
    set({ ...initial })
  },

  bindSocketEvents: () => {
    if (listenersBound) return
    listenersBound = true
    const socket = getSocket()

    socket.on('connect', () => set({ connected: true, error: null }))
    socket.on('disconnect', () => set({ connected: false }))

    socket.on('room:created', ({ pin, lobby }) => {
      set({
        screen: 'host-lobby',
        lobby: { ...lobby, pin },
        isHost: true,
        yourPlayerId: null,
        error: null,
      })
    })

    socket.on('room:joined', ({ lobby, yourPlayerId }) => {
      set({
        screen: 'player-lobby',
        lobby,
        yourPlayerId,
        isHost: false,
        error: null,
      })
    })

    socket.on('room:updated', (lobby) => {
      set({ lobby })
    })

    socket.on('game:started', (game) => {
      const { isHost } = get()
      if (isHost) {
        useGameStore.getState().hydrateFromOnlineHost(game)
      } else {
        useGameStore.getState().hydrateFromOnlinePlayer(game)
      }
      set({
        game,
        yourPlayerId: game.yourPlayerId,
        screen: isHost ? 'host-game' : 'player-game',
        lobby: get().lobby ? { ...get().lobby!, status: 'playing' } : null,
        error: null,
      })
    })

    socket.on('game:sync', (sync) => {
      useGameStore.getState().applyServerSync(sync)
      const clearing =
        sync.turnPhase !== 'resolving' ? clearPrivateModals() : {}
      set({ sync, ...clearing })
    })

    socket.on('game:question', (payload) => {
      set({ privateQuestion: payload, privateEvent: null, privateCorner: null })
    })

    socket.on('game:event', (payload) => {
      set({ privateEvent: payload, privateQuestion: null, privateCorner: null })
    })

    socket.on('game:corner', (payload) => {
      set({ privateCorner: payload, privateQuestion: null, privateEvent: null })
    })

    socket.on('room:error', ({ message }) => {
      set({ error: message })
    })
  },

  createRoom: async () => {
    get().bindSocketEvents()
    set({ error: null })
    try {
      await connectSocket()
      getSocket().emit('room:create')
    } catch {
      set({ error: 'No se pudo conectar al servidor. ¿Está encendido?' })
    }
  },

  joinRoom: async (pin, name) => {
    get().bindSocketEvents()
    set({ error: null })
    try {
      await connectSocket()
      getSocket().emit('room:join', { pin: pin.trim(), name })
    } catch {
      set({ error: 'No se pudo conectar al servidor. ¿Está encendido?' })
    }
  },

  startGame: () => {
    getSocket().emit('room:start')
  },

  leaveRoom: () => {
    const socket = getSocket()
    if (socket.connected) socket.emit('room:leave')
    get().reset()
  },

  rollDice: () => {
    getSocket().emit('game:roll')
  },

  submitAnswer: (selectedOption, timedOut) => {
    getSocket().emit('game:answer', { selectedOption, timedOut })
    set({ privateQuestion: null })
  },

  dismissEvent: () => {
    getSocket().emit('game:dismiss-event')
    set({ privateEvent: null })
  },

  dismissCorner: () => {
    getSocket().emit('game:dismiss-corner')
    set({ privateCorner: null })
  },
}))

export function onlineErrorLabel(code: RoomErrorCode): string {
  const labels: Record<RoomErrorCode, string> = {
    NOT_FOUND: 'Sala no encontrada',
    FULL: 'Sala llena',
    STARTED: 'Partida en curso',
    NAME_TAKEN: 'Nombre ocupado',
    NOT_HOST: 'Solo el presentador',
    INSUFFICIENT_PLAYERS: 'Faltan jugadores',
    NOT_YOUR_TURN: 'No es tu turno',
    INVALID_PHASE: 'Acción no permitida',
  }
  return labels[code]
}
