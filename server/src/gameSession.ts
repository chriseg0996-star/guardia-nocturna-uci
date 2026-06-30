import type { Card, EventCard } from '../../src/data/types.ts'
import { pickEvent } from '../../src/data/events.ts'
import { pickQuestion } from '../../src/data/questions.ts'
import { generateBoard, getTile, type Tile } from '../../src/game/board.ts'
import {
  advancePosition,
  applyLifeChange,
  createPlayer,
  judgeQuestion,
  rollDice,
  type GameSettings,
  type Player,
  type PlayerId,
} from '../../src/game/engine.ts'
import {
  applyCornerEffect,
  applyEventEffect,
  applyQuestionOutcome,
  syncElimination,
} from '../../src/game/resolution.ts'
import {
  eliminationMessage,
  mergeFeedback,
  resolveWinResult,
  type WinReason,
} from '../../src/game/win.ts'
import type {
  CornerKeyWire,
  GameSettingsWire,
  GameSyncWire,
  PlayerWire,
  QuestionWire,
  ResolveKindWire,
  TurnPhaseWire,
} from '../../shared/protocol.js'
import type { Room } from './rooms.js'

const ROLL_MS = 550
const STEP_MS = 320
const LAND_MS = 700

export type TurnPhase = 'roll' | 'rolling' | 'moving' | 'landed' | 'resolving' | 'ended'

type ResolveKind = 'question' | 'event' | 'corner'

export type GameCallbacks = {
  broadcastSync: (pin: string) => void
  sendQuestion: (socketId: string, categoryId: number, card: Card, lapMessage: string | null) => void
  sendEvent: (socketId: string, event: EventCard, lapMessage: string | null) => void
  sendCorner: (socketId: string, corner: CornerKeyWire, lapMessage: string | null) => void
}

export class OnlineGameSession {
  players: Player[]
  board: Tile[]
  settings: GameSettings
  currentPlayerIndex = 0
  turnPhase: TurnPhase = 'roll'
  diceValue: number | null = null
  animPosition: number | null = null
  animPlayerId: PlayerId | null = null
  moveStepsRemaining = 0
  landedTileIndex: number | null = null
  lapMessage: string | null = null
  resolveKind: ResolveKind | null = null
  activeQuestion: Card | null = null
  activeCategoryId: number | null = null
  activeEvent: EventCard | null = null
  cornerKey: CornerKeyWire | null = null
  usedQuestionIds: Record<number, number[]> = {}
  usedEventIds: number[] = []
  winners: Player[] = []
  winReason: WinReason | null = null
  lastFeedback: string | null = null
  statusMessage: string | null = null
  sessionStats: Record<number, { correct: number; wrong: number; categoryMisses: Record<number, number> }> = {}

  private timers: ReturnType<typeof setTimeout>[] = []
  private stepInterval: ReturnType<typeof setInterval> | null = null
  private room: Room
  private cb: GameCallbacks

  constructor(room: Room, cb: GameCallbacks) {
    this.room = room
    this.cb = cb
    this.settings = { ...room.settings }
    this.players = room.players.map((p) =>
      createPlayer(p.id as PlayerId, p.name, p.color),
    )
    this.board = generateBoard()
  }

  destroy() {
    this.clearTimers()
  }

  private clearTimers() {
    for (const t of this.timers) clearTimeout(t)
    this.timers = []
    if (this.stepInterval) clearInterval(this.stepInterval)
    this.stepInterval = null
  }

  private schedule(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms)
    this.timers.push(id)
  }

  socketForPlayerId(id: number): string | undefined {
    return this.room.players.find((p) => p.id === id)?.socketId
  }

  currentPlayerSocket(): string | undefined {
    const p = this.players[this.currentPlayerIndex]
    if (!p) return undefined
    return this.socketForPlayerId(p.id)
  }

  toPlayerWire(p: Player): PlayerWire {
    return {
      id: p.id,
      name: p.name,
      color: p.color,
      position: p.position,
      lives: p.lives,
      stamps: [...p.stamps],
      eliminated: p.eliminated,
    }
  }

  buildSync(forSocketId: string): GameSyncWire {
    const isHost = forSocketId === this.room.hostSocketId
    const lobbyPlayer = this.room.players.find((p) => p.socketId === forSocketId)
    const current = this.players[this.currentPlayerIndex]
    let statusMessage = this.statusMessage
    if (!statusMessage && this.turnPhase === 'resolving' && this.resolveKind === 'question' && current) {
      statusMessage = `${current.name} respondiendo…`
    }

    return {
      pin: this.room.pin,
      players: this.players.map((p) => this.toPlayerWire(p)),
      settings: { ...this.settings },
      currentPlayerIndex: this.currentPlayerIndex,
      turnPhase: this.turnPhase as TurnPhaseWire,
      diceValue: this.diceValue,
      animPosition: this.animPosition,
      animPlayerId: this.animPlayerId,
      landedTileIndex: this.landedTileIndex,
      lapMessage: this.lapMessage,
      resolveKind: this.resolveKind as ResolveKindWire,
      cornerKey: this.cornerKey,
      lastFeedback: this.lastFeedback,
      winners: this.winners.map((w) => w.id),
      winReason: this.winReason,
      yourPlayerId: isHost ? null : (lobbyPlayer?.id ?? null),
      statusMessage,
      sessionStats: { ...this.sessionStats },
    }
  }

  buildGameStart(forSocketId: string) {
    const isHost = forSocketId === this.room.hostSocketId
    const lobbyPlayer = this.room.players.find((p) => p.socketId === forSocketId)
    return {
      pin: this.room.pin,
      players: this.players.map((p) => this.toPlayerWire(p)),
      settings: { ...this.settings },
      currentPlayerIndex: this.currentPlayerIndex,
      yourPlayerId: isHost ? null : (lobbyPlayer?.id ?? null),
    }
  }

  resendPrivateIfNeeded(socketId: string) {
    if (this.turnPhase !== 'resolving') return
    if (socketId !== this.currentPlayerSocket()) return
    if (this.resolveKind === 'question' && this.activeQuestion && this.activeCategoryId !== null) {
      this.cb.sendQuestion(socketId, this.activeCategoryId, this.activeQuestion, this.lapMessage)
    } else if (this.resolveKind === 'event' && this.activeEvent) {
      this.cb.sendEvent(socketId, this.activeEvent, this.lapMessage)
    } else if (this.resolveKind === 'corner' && this.cornerKey) {
      this.cb.sendCorner(socketId, this.cornerKey, this.lapMessage)
    }
  }

  private recordStat(playerId: number, correct: boolean, categoryId?: number) {
    const cur = this.sessionStats[playerId] ?? { correct: 0, wrong: 0, categoryMisses: {} }
    const categoryMisses = { ...cur.categoryMisses }
    if (!correct && categoryId !== undefined) {
      categoryMisses[categoryId] = (categoryMisses[categoryId] ?? 0) + 1
    }
    this.sessionStats[playerId] = correct
      ? { correct: cur.correct + 1, wrong: cur.wrong, categoryMisses }
      : { correct: cur.correct, wrong: cur.wrong + 1, categoryMisses }
  }

  broadcast() {
    this.cb.broadcastSync(this.room.pin)
  }

  handleRoll(socketId: string): 'ok' | 'NOT_YOUR_TURN' | 'INVALID_PHASE' {
    if (this.turnPhase !== 'roll' || this.winners.length > 0) return 'INVALID_PHASE'
    const lobbyPlayer = this.room.players.find((p) => p.socketId === socketId)
    if (!lobbyPlayer) return 'NOT_YOUR_TURN'
    const current = this.players[this.currentPlayerIndex]
    if (!current || current.id !== lobbyPlayer.id || current.eliminated) return 'NOT_YOUR_TURN'

    this.clearTimers()
    this.lastFeedback = null
    this.statusMessage = null
    this.turnPhase = 'rolling'
    this.diceValue = null
    this.broadcast()

    this.schedule(() => {
      const value = rollDice()
      this.diceValue = value
      this.turnPhase = 'moving'
      this.animPosition = current.position
      this.animPlayerId = current.id
      this.moveStepsRemaining = value
      this.broadcast()

      this.stepInterval = setInterval(() => {
        if (this.moveStepsRemaining <= 0 || this.animPosition === null) {
          if (this.stepInterval) clearInterval(this.stepInterval)
          this.stepInterval = null
          this.schedule(() => this.finishMove(), STEP_MS / 2)
          return
        }
        this.animPosition = (this.animPosition + 1) % 28
        this.moveStepsRemaining -= 1
        this.broadcast()
        if (this.moveStepsRemaining <= 0) {
          if (this.stepInterval) clearInterval(this.stepInterval)
          this.stepInterval = null
          this.schedule(() => this.finishMove(), STEP_MS / 2)
        }
      }, STEP_MS)
    }, ROLL_MS)

    return 'ok'
  }

  private finishMove() {
    const current = this.players[this.currentPlayerIndex]
    if (!current || this.diceValue === null) return

    const { position, completedLap } = advancePosition(current.position, this.diceValue)
    const tile = getTile(position, this.board)

    this.players = this.players.map((p) => {
      if (p.id !== current.id) return p
      let lives = p.lives
      if (completedLap) lives = applyLifeChange(lives, 1)
      return syncElimination({ ...p, position, lives })
    })

    this.lapMessage = completedLap ? '+1 vida · completaste la vuelta' : null
    this.landedTileIndex = position
    this.animPosition = null
    this.animPlayerId = null
    this.turnPhase = 'landed'

    if (tile.type === 'categoria' && tile.categoryId) {
      const used = new Set(this.usedQuestionIds[tile.categoryId] ?? [])
      const picked = pickQuestion(tile.categoryId, used)
      const q = picked?.card ?? pickQuestion(tile.categoryId, new Set())!.card
      const qIndex = picked?.index ?? 0
      this.usedQuestionIds[tile.categoryId] = [...(this.usedQuestionIds[tile.categoryId] ?? []), qIndex]
      this.resolveKind = 'question'
      this.activeQuestion = q
      this.activeCategoryId = tile.categoryId
      this.activeEvent = null
      this.cornerKey = null
    } else if (tile.type === 'estrella') {
      const used = new Set(this.usedEventIds)
      const { card, index } = pickEvent(used)
      this.resolveKind = 'event'
      this.activeEvent = card
      this.activeQuestion = null
      this.activeCategoryId = null
      this.cornerKey = null
      this.usedEventIds = [...this.usedEventIds, index]
    } else if (tile.type === 'especial' && tile.corner) {
      this.resolveKind = 'corner'
      this.cornerKey = tile.corner
      this.activeQuestion = null
      this.activeEvent = null
      this.activeCategoryId = null
    }

    this.broadcast()
    this.schedule(() => this.beginResolve(), LAND_MS)
  }

  handleResolveReady() {
    if (this.turnPhase === 'landed') this.beginResolve()
  }

  private beginResolve() {
    if (this.turnPhase !== 'landed') return
    this.turnPhase = 'resolving'
    this.broadcast()

    const socketId = this.currentPlayerSocket()
    if (!socketId) return

    if (this.resolveKind === 'question' && this.activeQuestion && this.activeCategoryId !== null) {
      this.cb.sendQuestion(socketId, this.activeCategoryId, this.activeQuestion, this.lapMessage)
    } else if (this.resolveKind === 'event' && this.activeEvent) {
      this.cb.sendEvent(socketId, this.activeEvent, this.lapMessage)
    } else if (this.resolveKind === 'corner' && this.cornerKey) {
      this.cb.sendCorner(socketId, this.cornerKey, this.lapMessage)
    }
  }

  handleAnswer(socketId: string, selectedOption?: number, timedOut?: boolean): 'ok' | 'NOT_YOUR_TURN' | 'INVALID_PHASE' {
    if (this.turnPhase !== 'resolving' || this.resolveKind !== 'question') return 'INVALID_PHASE'
    if (socketId !== this.currentPlayerSocket()) return 'NOT_YOUR_TURN'
    if (!this.activeQuestion || this.activeCategoryId === null) return 'INVALID_PHASE'

    const player = this.players[this.currentPlayerIndex]
    if (!player) return 'INVALID_PHASE'

    const correct = timedOut ? false : judgeQuestion(this.activeQuestion, selectedOption, undefined)
    const { player: updated, gainedStamp } = applyQuestionOutcome(player, this.activeCategoryId, correct)

    const feedback = timedOut
      ? '⏱ Tiempo agotado — −1 vida'
      : correct
        ? gainedStamp
          ? '✓ Correcto — ¡sello ganado!'
          : '✓ Correcto — ya tenías este sello'
        : '✗ Incorrecto — −1 vida'

    this.players = this.players.map((p) => (p.id === player.id ? updated : p))
    this.recordStat(player.id, correct, this.activeCategoryId)
    this.lastFeedback = mergeFeedback(feedback, eliminationMessage(player, updated))
    this.clearResolve()
    this.endTurn()
    return 'ok'
  }

  handleDismissEvent(socketId: string): 'ok' | 'NOT_YOUR_TURN' | 'INVALID_PHASE' {
    if (this.turnPhase !== 'resolving' || this.resolveKind !== 'event' || !this.activeEvent) {
      return 'INVALID_PHASE'
    }
    if (socketId !== this.currentPlayerSocket()) return 'NOT_YOUR_TURN'

    const player = this.players[this.currentPlayerIndex]
    if (!player) return 'INVALID_PHASE'

    const { players: nextPlayers, message } = applyEventEffect(this.activeEvent, player.id, this.players)
    this.players = nextPlayers
    const updated = nextPlayers[this.currentPlayerIndex]
    this.lastFeedback = mergeFeedback(message, updated ? eliminationMessage(player, updated) : null)
    this.clearResolve()
    this.endTurn()
    return 'ok'
  }

  handleDismissCorner(socketId: string): 'ok' | 'NOT_YOUR_TURN' | 'INVALID_PHASE' {
    if (this.turnPhase !== 'resolving' || this.resolveKind !== 'corner' || !this.cornerKey) {
      return 'INVALID_PHASE'
    }
    if (socketId !== this.currentPlayerSocket()) return 'NOT_YOUR_TURN'

    const player = this.players[this.currentPlayerIndex]
    if (!player) return 'INVALID_PHASE'

    const { player: updated, message, endTurnOnly } = applyCornerEffect(this.cornerKey, player)
    this.players = this.players.map((p) => (p.id === player.id ? updated : p))
    this.lastFeedback = mergeFeedback(message, eliminationMessage(player, updated))
    this.clearResolve()
    if (endTurnOnly || this.cornerKey === 'descanso') {
      this.endTurn()
    } else {
      this.endTurn()
    }
    return 'ok'
  }

  private clearResolve() {
    this.resolveKind = null
    this.activeQuestion = null
    this.activeCategoryId = null
    this.activeEvent = null
    this.cornerKey = null
    this.landedTileIndex = null
    this.lapMessage = null
    this.statusMessage = null
  }

  private endTurn() {
    const { winners, reason } = resolveWinResult(this.players, this.settings)
    if (winners.length > 0 && reason) {
      this.winners = winners
      this.winReason = reason
      this.turnPhase = 'ended'
      this.broadcast()
      return
    }

    let next = (this.currentPlayerIndex + 1) % this.players.length
    for (let i = 0; i < this.players.length; i++) {
      if (!this.players[next]?.eliminated) break
      next = (next + 1) % this.players.length
    }
    this.currentPlayerIndex = next
    this.turnPhase = 'roll'
    this.diceValue = null
    this.broadcast()
  }

  static toQuestionWire(card: Card): QuestionWire {
    return { q: card.q, options: card.options }
  }
}

const sessions = new Map<string, OnlineGameSession>()

export function startGameSession(room: Room, cb: GameCallbacks): OnlineGameSession {
  const existing = sessions.get(room.pin)
  existing?.destroy()
  const session = new OnlineGameSession(room, cb)
  sessions.set(room.pin, session)
  return session
}

export function getGameSession(pin: string): OnlineGameSession | undefined {
  return sessions.get(pin)
}

export function getGameSessionBySocket(socketId: string, room: Room): OnlineGameSession | undefined {
  return sessions.get(room.pin)
}

export function destroyGameSession(pin: string) {
  sessions.get(pin)?.destroy()
  sessions.delete(pin)
}
