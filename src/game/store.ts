import { create } from 'zustand'
import type { GameStartWire, GameSyncWire } from '../../shared/protocol'
import { persist } from 'zustand/middleware'
import type { Card, EventCard } from '../data/types'
import { pickEvent } from '../data/events'
import { pickQuestion } from '../data/questions'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../data/categories'
import {
  advancePosition,
  applyLifeChange,
  createPlayer,
  DEFAULT_SETTINGS,
  judgeQuestion,
  MAX_PLAYERS,
  MIN_PLAYERS,
  rollDice,
  type GameSettings,
  type Player,
  type PlayerId,
} from './engine'
import { generateBoard, getTile, type Tile } from './board'
import {
  applyCornerEffect,
  applyEventEffect,
  applyQuestionOutcome,
  syncElimination,
} from './resolution'
import {
  eliminationMessage,
  mergeFeedback,
  resolveWinResult,
  type WinReason,
} from './win'
import { emptyPlayerStats, recordAnswer, type PlayerSessionStats } from './sessionStats'
import type { SessionStatsWire } from '../../shared/protocol'

export type AppScreen = 'splash' | 'setup' | 'game' | 'quiz'

export type OnlineMode = false | 'host' | 'player'

export type TurnPhase = 'roll' | 'rolling' | 'moving' | 'landed' | 'resolving'

export type ResolveKind = 'question' | 'event' | 'corner'

type GameStore = {
  screen: AppScreen
  playerCount: number
  playerNames: string[]
  players: Player[]
  board: Tile[]
  settings: GameSettings
  currentPlayerIndex: number
  gameStarted: boolean
  onlineMode: OnlineMode
  winners: Player[]
  winReason: WinReason | null

  turnPhase: TurnPhase
  diceValue: number | null
  moveStepsRemaining: number
  animPosition: number | null
  animPlayerId: PlayerId | null
  landedTileIndex: number | null
  lapMessage: string | null
  resolveKind: ResolveKind | null
  activeQuestion: Card | null
  activeCategoryId: number | null
  activeEvent: EventCard | null
  cornerKey: 'go' | 'descanso' | 'codigo_azul' | 'guardia' | null
  usedQuestionIds: Record<number, number[]>
  usedEventIds: number[]
  lastFeedback: string | null
  statusMessage: string | null
  sessionStats: Record<number, PlayerSessionStats>
  onlineSessionStats: Record<number, PlayerSessionStats>

  setScreen: (screen: AppScreen) => void
  setPlayerCount: (count: number) => void
  setPlayerName: (index: number, name: string) => void
  updateSettings: (partial: Partial<GameSettings>) => void
  startGame: () => void
  hydrateFromOnlineHost: (game: GameStartWire) => void
  hydrateFromOnlinePlayer: (game: GameStartWire) => void
  applyServerSync: (sync: GameSyncWire) => void
  resetToSetup: () => void
  beginRoll: () => void
  setDiceRolling: (value: number) => void
  beginMove: () => void
  stepMove: () => boolean
  finishMove: () => void
  beginResolve: () => void
  submitQuestion: (selectedOption?: number, manualCorrect?: boolean, timedOut?: boolean) => void
  dismissEvent: () => void
  dismissCorner: () => void
  clearFeedback: () => void
  pauseToMenu: () => void
  newGame: () => void
  continueGame: () => void
  abandonGame: () => void
}

function clampPlayerCount(count: number): number {
  return Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, count))
}

function buildPlayers(count: number, names: string[]): Player[] {
  return Array.from({ length: count }, (_, i) => {
    const id = i as PlayerId
    const name = names[i]?.trim() || DEFAULT_PLAYER_NAMES[i]!
    const color = PLAYER_COLORS[i]!
    return createPlayer(id, name, color)
  })
}

function nextActivePlayerIndex(players: Player[], from: number): number {
  const n = players.length
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n
    if (!players[idx]?.eliminated) return idx
  }
  return from
}

function detectWin(players: Player[], settings: GameSettings) {
  return resolveWinResult(players, settings)
}

function normalizeSessionStats(
  wire: Record<number, SessionStatsWire> | undefined,
): Record<number, PlayerSessionStats> {
  if (!wire) return {}
  const out: Record<number, PlayerSessionStats> = {}
  for (const [id, s] of Object.entries(wire)) {
    out[Number(id)] = {
      correct: s.correct,
      wrong: s.wrong,
      categoryMisses: { ...(s.categoryMisses ?? {}) },
    }
  }
  return out
}

const initialTurnState = {
  turnPhase: 'roll' as TurnPhase,
  diceValue: null as number | null,
  moveStepsRemaining: 0,
  animPosition: null as number | null,
  animPlayerId: null as PlayerId | null,
  landedTileIndex: null as number | null,
  lapMessage: null as string | null,
  resolveKind: null as ResolveKind | null,
  activeQuestion: null as Card | null,
  activeCategoryId: null as number | null,
  activeEvent: null as EventCard | null,
  cornerKey: null as 'go' | 'descanso' | 'codigo_azul' | 'guardia' | null,
  usedQuestionIds: {} as Record<number, number[]>,
  usedEventIds: [] as number[],
  lastFeedback: null as string | null,
  statusMessage: null as string | null,
  winners: [] as Player[],
  winReason: null as WinReason | null,
}

function endTurnState(get: () => GameStore, set: (partial: Partial<GameStore>) => void) {
  const { currentPlayerIndex, players, settings } = get()
  const { winners, reason } = detectWin(players, settings)
  if (winners.length > 0 && reason) {
    set({
      winners,
      winReason: reason,
      turnPhase: 'resolving',
      resolveKind: null,
      activeQuestion: null,
      activeEvent: null,
      cornerKey: null,
    })
    return
  }
  const next = nextActivePlayerIndex(players, currentPlayerIndex)
  set({
    currentPlayerIndex: next,
    turnPhase: 'roll',
    diceValue: null,
    landedTileIndex: null,
    lapMessage: null,
    resolveKind: null,
    activeQuestion: null,
    activeCategoryId: null,
    activeEvent: null,
    cornerKey: null,
  })
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: 'splash',
      playerCount: MIN_PLAYERS,
      playerNames: [...DEFAULT_PLAYER_NAMES],
      players: [],
      board: generateBoard(),
      settings: { ...DEFAULT_SETTINGS },
      currentPlayerIndex: 0,
      gameStarted: false,
      onlineMode: false,
      sessionStats: {},
      onlineSessionStats: {},
      ...initialTurnState,

      setScreen: (screen) => set({ screen }),

      setPlayerCount: (count) => set({ playerCount: clampPlayerCount(count) }),

      setPlayerName: (index, name) => {
        const playerNames = [...get().playerNames]
        if (index >= 0 && index < MAX_PLAYERS) {
          playerNames[index] = name
          set({ playerNames })
        }
      },

      updateSettings: (partial) => {
        const next = { ...get().settings, ...partial }
        if (!next.winUciMaster && !next.winSurvival) return
        set({ settings: next })
      },

      startGame: () => {
        const { playerCount, playerNames } = get()
        set({
          screen: 'game',
          gameStarted: true,
          onlineMode: false,
          players: buildPlayers(playerCount, playerNames),
          board: generateBoard(),
          currentPlayerIndex: 0,
          sessionStats: {},
          onlineSessionStats: {},
          ...initialTurnState,
        })
      },

      hydrateFromOnlineHost: (game) => {
        const players: Player[] = game.players.map((p) => ({
          id: p.id as PlayerId,
          name: p.name,
          color: p.color,
          position: p.position,
          lives: p.lives,
          stamps: [...p.stamps],
          eliminated: p.eliminated,
        }))
        set({
          screen: 'game',
          gameStarted: true,
          onlineMode: 'host',
          players,
          playerCount: players.length,
          settings: { ...game.settings },
          board: generateBoard(),
          currentPlayerIndex: game.currentPlayerIndex,
          sessionStats: {},
          onlineSessionStats: {},
          ...initialTurnState,
        })
      },

      hydrateFromOnlinePlayer: (game) => {
        const players: Player[] = game.players.map((p) => ({
          id: p.id as PlayerId,
          name: p.name,
          color: p.color,
          position: p.position,
          lives: p.lives,
          stamps: [...p.stamps],
          eliminated: p.eliminated,
        }))
        set({
          screen: 'game',
          gameStarted: true,
          onlineMode: 'player',
          players,
          playerCount: players.length,
          settings: { ...game.settings },
          board: generateBoard(),
          currentPlayerIndex: game.currentPlayerIndex,
          sessionStats: {},
          onlineSessionStats: {},
          ...initialTurnState,
        })
      },

      applyServerSync: (sync) => {
        const players: Player[] = sync.players.map((p) => ({
          id: p.id as PlayerId,
          name: p.name,
          color: p.color,
          position: p.position,
          lives: p.lives,
          stamps: [...p.stamps],
          eliminated: p.eliminated,
        }))
        const winners =
          sync.turnPhase === 'ended'
            ? players.filter((p) => sync.winners.includes(p.id))
            : []
        const clientPhase =
          sync.turnPhase === 'ended' ? 'roll' : (sync.turnPhase as TurnPhase)

        set({
          players,
          settings: { ...sync.settings },
          currentPlayerIndex: sync.currentPlayerIndex,
          turnPhase: clientPhase,
          diceValue: sync.diceValue,
          animPosition: sync.animPosition,
          animPlayerId: sync.animPlayerId as PlayerId | null,
          landedTileIndex: sync.landedTileIndex,
          lapMessage: sync.lapMessage,
          resolveKind: sync.resolveKind,
          cornerKey: sync.cornerKey,
          lastFeedback: sync.lastFeedback,
          statusMessage: sync.statusMessage,
          winners,
          winReason: sync.turnPhase === 'ended' ? sync.winReason : null,
          onlineMode: sync.yourPlayerId === null ? 'host' : 'player',
          onlineSessionStats: normalizeSessionStats(sync.sessionStats),
        })
      },

      resetToSetup: () => {
        get().abandonGame()
        set({ screen: 'setup' })
      },

      pauseToMenu: () => set({ screen: 'splash' }),

      newGame: () => {
        set({
          screen: 'setup',
          gameStarted: false,
          onlineMode: false,
          players: [],
          currentPlayerIndex: 0,
          sessionStats: {},
          onlineSessionStats: {},
          ...initialTurnState,
        })
      },

      continueGame: () => {
        const { gameStarted, players, winners } = get()
        if (gameStarted && players.length > 0 && winners.length === 0) {
          set({ screen: 'game' })
        }
      },

      abandonGame: () => {
        set({
          gameStarted: false,
          players: [],
          currentPlayerIndex: 0,
          ...initialTurnState,
        })
      },

      beginRoll: () => {
        if (get().turnPhase !== 'roll') return
        set({ turnPhase: 'rolling', diceValue: null, lapMessage: null, lastFeedback: null })
      },

      setDiceRolling: (value) => set({ diceValue: value, turnPhase: 'rolling' }),

      beginMove: () => {
        const { diceValue, currentPlayerIndex, players } = get()
        if (diceValue === null) return
        const player = players[currentPlayerIndex]
        if (!player || player.eliminated) return
        set({
          turnPhase: 'moving',
          moveStepsRemaining: diceValue,
          animPosition: player.position,
          animPlayerId: player.id,
        })
      },

      stepMove: () => {
        const { moveStepsRemaining, animPosition } = get()
        if (moveStepsRemaining <= 0 || animPosition === null) return false
        const nextPos = (animPosition + 1) % 28
        const remaining = moveStepsRemaining - 1
        set({ animPosition: nextPos, moveStepsRemaining: remaining })
        return remaining > 0
      },

      finishMove: () => {
        const { diceValue, currentPlayerIndex, players, board, usedQuestionIds, usedEventIds } = get()
        if (diceValue === null) return
        const player = players[currentPlayerIndex]
        if (!player) return

        const { position, completedLap } = advancePosition(player.position, diceValue)
        const tile = getTile(position, board)

        let updatedPlayers = players.map((p) => {
          if (p.id !== player.id) return p
          let lives = p.lives
          if (completedLap) lives = applyLifeChange(lives, 1)
          return syncElimination({ ...p, position, lives })
        })

        const lapMessage = completedLap ? '+1 vida · completaste la vuelta' : null

        if (tile.type === 'categoria' && tile.categoryId) {
          const used = new Set(usedQuestionIds[tile.categoryId] ?? [])
          const picked = pickQuestion(tile.categoryId, used)
          const q = picked?.card ?? pickQuestion(tile.categoryId, new Set())!.card
          const qIndex = picked?.index ?? 0
          const nextUsed = { ...usedQuestionIds }
          const list = [...(nextUsed[tile.categoryId] ?? []), qIndex]
          nextUsed[tile.categoryId] = list

          set({
            players: updatedPlayers,
            turnPhase: 'landed',
            landedTileIndex: position,
            lapMessage,
            resolveKind: 'question',
            activeQuestion: q,
            activeCategoryId: tile.categoryId,
            activeEvent: null,
            cornerKey: null,
            usedQuestionIds: nextUsed,
            animPosition: null,
            animPlayerId: null,
            moveStepsRemaining: 0,
          })
          return
        }

        if (tile.type === 'estrella') {
          const used = new Set(usedEventIds)
          const { card, index } = pickEvent(used)
          set({
            players: updatedPlayers,
            turnPhase: 'landed',
            landedTileIndex: position,
            lapMessage,
            resolveKind: 'event',
            activeEvent: card,
            activeQuestion: null,
            activeCategoryId: null,
            cornerKey: null,
            usedEventIds: [...usedEventIds, index],
            animPosition: null,
            animPlayerId: null,
            moveStepsRemaining: 0,
          })
          return
        }

        if (tile.type === 'especial' && tile.corner) {
          set({
            players: updatedPlayers,
            turnPhase: 'landed',
            landedTileIndex: position,
            lapMessage,
            resolveKind: 'corner',
            cornerKey: tile.corner,
            activeQuestion: null,
            activeEvent: null,
            activeCategoryId: null,
            animPosition: null,
            animPlayerId: null,
            moveStepsRemaining: 0,
          })
        }
      },

      beginResolve: () => {
        if (get().turnPhase !== 'landed') return
        set({ turnPhase: 'resolving' })
      },

      submitQuestion: (selectedOption, manualCorrect, timedOut) => {
        const { activeQuestion, activeCategoryId, currentPlayerIndex, players } = get()
        if (!activeQuestion || !activeCategoryId) return

        const player = players[currentPlayerIndex]
        if (!player) return

        const correct = timedOut
          ? false
          : judgeQuestion(activeQuestion, selectedOption, manualCorrect)

        const { player: updated, gainedStamp } = applyQuestionOutcome(
          player,
          activeCategoryId,
          correct,
        )

        const feedback = timedOut
          ? '⏱ Tiempo agotado — −1 vida'
          : correct
            ? gainedStamp
              ? '✓ Correcto — ¡sello ganado!'
              : '✓ Correcto — ya tenías este sello'
            : '✗ Incorrecto — −1 vida'

        const nextPlayers = players.map((p) => (p.id === player.id ? updated : p))
        const elim = eliminationMessage(player, updated)
        const prevStats = get().sessionStats[player.id] ?? emptyPlayerStats()
        set({
          players: nextPlayers,
          lastFeedback: mergeFeedback(feedback, elim),
          sessionStats: {
            ...get().sessionStats,
            [player.id]: recordAnswer(prevStats, correct, activeCategoryId),
          },
        })
        endTurnState(get, set)
      },

      dismissEvent: () => {
        const { activeEvent, currentPlayerIndex, players } = get()
        if (!activeEvent) return
        const player = players[currentPlayerIndex]
        if (!player) return

        const { players: nextPlayers, message } = applyEventEffect(
          activeEvent,
          player.id,
          players,
        )
        const updated = nextPlayers[currentPlayerIndex]
        const elim = updated ? eliminationMessage(player, updated) : null
        set({ players: nextPlayers, lastFeedback: mergeFeedback(message, elim) })
        endTurnState(get, set)
      },

      dismissCorner: () => {
        const { cornerKey, currentPlayerIndex, players } = get()
        if (!cornerKey) return
        const player = players[currentPlayerIndex]
        if (!player) return

        const { player: updated, message, endTurnOnly } = applyCornerEffect(cornerKey, player)
        const nextPlayers = players.map((p) => (p.id === player.id ? updated : p))
        const elim = eliminationMessage(player, updated)
        set({ players: nextPlayers, lastFeedback: mergeFeedback(message, elim) })

        if (endTurnOnly) {
          endTurnState(get, set)
          return
        }

        if (cornerKey === 'descanso') {
          endTurnState(get, set)
          return
        }

        endTurnState(get, set)
      },

      clearFeedback: () => set({ lastFeedback: null }),
    }),
    {
      name: 'guardia-nocturna-uci',
      partialize: (state) => ({
        screen: state.screen,
        playerCount: state.playerCount,
        playerNames: state.playerNames,
        players: state.players,
        board: state.board,
        settings: state.settings,
        currentPlayerIndex: state.currentPlayerIndex,
        gameStarted: state.gameStarted,
        turnPhase: state.turnPhase,
        diceValue: state.diceValue,
        moveStepsRemaining: state.moveStepsRemaining,
        animPosition: state.animPosition,
        animPlayerId: state.animPlayerId,
        landedTileIndex: state.landedTileIndex,
        lapMessage: state.lapMessage,
        resolveKind: state.resolveKind,
        activeQuestion: state.activeQuestion,
        activeCategoryId: state.activeCategoryId,
        activeEvent: state.activeEvent,
        cornerKey: state.cornerKey,
        usedQuestionIds: state.usedQuestionIds,
        usedEventIds: state.usedEventIds,
        winners: state.winners,
        winReason: state.winReason,
      }),
    },
  ),
)

export function computeDiceRoll(): number {
  return rollDice()
}
