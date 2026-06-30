/** Wire protocol shared between client and server. */

export const PLAYER_COLORS = ['#3da9fc', '#f08a3c', '#3fb950', '#a371f7'] as const

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

export type GameSettingsWire = {
  timerEnabled: boolean
  timerSeconds: number
  winUciMaster: boolean
  winSurvival: boolean
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS_WIRE: GameSettingsWire = {
  timerEnabled: true,
  timerSeconds: 30,
  winUciMaster: true,
  winSurvival: true,
  soundEnabled: false,
}

export type LobbyPlayerWire = {
  id: number
  name: string
  color: string
  connected: boolean
}

export type LobbyHostWire = {
  name: string
  connected: boolean
}

export type LobbyStateWire = {
  pin: string
  status: 'lobby' | 'playing'
  host: LobbyHostWire
  players: LobbyPlayerWire[]
  settings: GameSettingsWire
}

export type PlayerWire = {
  id: number
  name: string
  color: string
  position: number
  lives: number
  stamps: boolean[]
  eliminated: boolean
}

export type TurnPhaseWire = 'roll' | 'rolling' | 'moving' | 'landed' | 'resolving' | 'ended'

export type ResolveKindWire = 'question' | 'event' | 'corner' | null

export type CornerKeyWire = 'go' | 'descanso' | 'codigo_azul' | 'guardia'

export type SessionStatsWire = {
  correct: number
  wrong: number
  categoryMisses?: Record<number, number>
}

export type QuestionWire = {
  q: string
  options?: string[]
}

export type EventWire = {
  ico: string
  t: string
  x: string
}

export type GameSyncWire = {
  pin: string
  players: PlayerWire[]
  settings: GameSettingsWire
  currentPlayerIndex: number
  turnPhase: TurnPhaseWire
  diceValue: number | null
  animPosition: number | null
  animPlayerId: number | null
  landedTileIndex: number | null
  lapMessage: string | null
  resolveKind: ResolveKindWire
  cornerKey: CornerKeyWire | null
  lastFeedback: string | null
  winners: number[]
  winReason: 'uci_master' | 'survival' | null
  yourPlayerId: number | null
  statusMessage: string | null
  sessionStats: Record<number, SessionStatsWire>
}

export type QuestionPayloadWire = {
  categoryId: number
  card: QuestionWire
  lapMessage: string | null
}

export type EventPayloadWire = {
  event: EventWire
  lapMessage: string | null
}

export type CornerPayloadWire = {
  corner: CornerKeyWire
  lapMessage: string | null
}

export type GameStartWire = {
  pin: string
  players: PlayerWire[]
  settings: GameSettingsWire
  currentPlayerIndex: number
  yourPlayerId: number | null
}

export type RoomErrorCode =
  | 'NOT_FOUND'
  | 'FULL'
  | 'STARTED'
  | 'NAME_TAKEN'
  | 'NOT_HOST'
  | 'INSUFFICIENT_PLAYERS'
  | 'NOT_YOUR_TURN'
  | 'INVALID_PHASE'

export type ClientToServerEvents = {
  'room:create': (settings?: Partial<GameSettingsWire>) => void
  'room:join': (payload: { pin: string; name: string }) => void
  'room:start': () => void
  'room:leave': () => void
  'game:roll': () => void
  'game:resolve-ready': () => void
  'game:answer': (payload: { selectedOption?: number; timedOut?: boolean }) => void
  'game:dismiss-event': () => void
  'game:dismiss-corner': () => void
}

export type ServerToClientEvents = {
  'room:created': (payload: { pin: string; lobby: LobbyStateWire }) => void
  'room:joined': (payload: { lobby: LobbyStateWire; yourPlayerId: number }) => void
  'room:updated': (lobby: LobbyStateWire) => void
  'game:started': (game: GameStartWire) => void
  'game:sync': (sync: GameSyncWire) => void
  'game:question': (payload: QuestionPayloadWire) => void
  'game:event': (payload: EventPayloadWire) => void
  'game:corner': (payload: CornerPayloadWire) => void
  'room:error': (payload: { code: RoomErrorCode; message: string }) => void
}
