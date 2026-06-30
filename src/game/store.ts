import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Card, EventCard } from '../data/types'
import { pickEvent } from '../data/events'
import { pickQuestion } from '../data/questions'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../data/categories'
import {
  advancePosition,
  applyLifeChange,
  checkWinners,
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

export type AppScreen = 'splash' | 'setup' | 'game'

export type TurnPhase = 'roll' | 'rolling' | 'moving' | 'resolving'

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
  winners: Player[]

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

  setScreen: (screen: AppScreen) => void
  setPlayerCount: (count: number) => void
  setPlayerName: (index: number, name: string) => void
  updateSettings: (partial: Partial<GameSettings>) => void
  startGame: () => void
  resetToSetup: () => void
  beginRoll: () => void
  setDiceRolling: (value: number) => void
  beginMove: () => void
  stepMove: () => boolean
  finishMove: () => void
  submitQuestion: (selectedOption?: number, manualCorrect?: boolean, timedOut?: boolean) => void
  dismissEvent: () => void
  dismissCorner: () => void
  clearFeedback: () => void
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

function detectWinners(players: Player[], settings: GameSettings): Player[] {
  return checkWinners(players, settings)
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
  winners: [] as Player[],
}

function endTurnState(get: () => GameStore, set: (partial: Partial<GameStore>) => void) {
  const { currentPlayerIndex, players, settings } = get()
  const winners = detectWinners(players, settings)
  if (winners.length > 0) {
    set({
      winners,
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

      updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

      startGame: () => {
        const { playerCount, playerNames } = get()
        set({
          screen: 'game',
          gameStarted: true,
          players: buildPlayers(playerCount, playerNames),
          board: generateBoard(),
          currentPlayerIndex: 0,
          ...initialTurnState,
        })
      },

      resetToSetup: () => {
        set({
          screen: 'setup',
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
            turnPhase: 'resolving',
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
            turnPhase: 'resolving',
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
            turnPhase: 'resolving',
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
        set({ players: nextPlayers, lastFeedback: feedback })
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
        set({ players: nextPlayers, lastFeedback: message })
        endTurnState(get, set)
      },

      dismissCorner: () => {
        const { cornerKey, currentPlayerIndex, players } = get()
        if (!cornerKey) return
        const player = players[currentPlayerIndex]
        if (!player) return

        const { player: updated, message, endTurnOnly } = applyCornerEffect(cornerKey, player)
        const nextPlayers = players.map((p) => (p.id === player.id ? updated : p))
        set({ players: nextPlayers, lastFeedback: message })

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
      }),
    },
  ),
)

export function computeDiceRoll(): number {
  return rollDice()
}
