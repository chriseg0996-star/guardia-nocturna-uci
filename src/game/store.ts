import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../data/categories'
import {
  advancePosition,
  applyLifeChange,
  createPlayer,
  DEFAULT_SETTINGS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  rollDice,
  type GameSettings,
  type Player,
  type PlayerId,
} from './engine'
import { generateBoard, getTile, type Tile } from './board'

export type AppScreen = 'splash' | 'setup' | 'game'

export type TurnPhase = 'roll' | 'rolling' | 'moving' | 'landed'

type GameStore = {
  screen: AppScreen
  playerCount: number
  playerNames: string[]
  players: Player[]
  board: Tile[]
  settings: GameSettings
  currentPlayerIndex: number
  gameStarted: boolean

  turnPhase: TurnPhase
  diceValue: number | null
  moveStepsRemaining: number
  animPosition: number | null
  animPlayerId: PlayerId | null
  landedTileIndex: number | null
  lapMessage: string | null
  lastLandedLabel: string | null

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
  endTurn: () => void
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

const initialTurnState = {
  turnPhase: 'roll' as TurnPhase,
  diceValue: null as number | null,
  moveStepsRemaining: 0,
  animPosition: null as number | null,
  animPlayerId: null as PlayerId | null,
  landedTileIndex: null as number | null,
  lapMessage: null as string | null,
  lastLandedLabel: null as string | null,
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

      setPlayerCount: (count) => {
        const playerCount = clampPlayerCount(count)
        set({ playerCount })
      },

      setPlayerName: (index, name) => {
        const playerNames = [...get().playerNames]
        if (index >= 0 && index < MAX_PLAYERS) {
          playerNames[index] = name
          set({ playerNames })
        }
      },

      updateSettings: (partial) => {
        set({ settings: { ...get().settings, ...partial } })
      },

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
        const { turnPhase } = get()
        if (turnPhase !== 'roll') return
        set({ turnPhase: 'rolling', diceValue: null, lapMessage: null })
      },

      setDiceRolling: (value) => {
        set({ diceValue: value, turnPhase: 'rolling' })
      },

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
        const { moveStepsRemaining, animPosition, currentPlayerIndex, players } = get()
        if (moveStepsRemaining <= 0 || animPosition === null) return false

        const player = players[currentPlayerIndex]
        if (!player) return false

        const nextPos = (animPosition + 1) % 28
        const remaining = moveStepsRemaining - 1

        set({
          animPosition: nextPos,
          moveStepsRemaining: remaining,
        })

        return remaining > 0
      },

      finishMove: () => {
        const { diceValue, currentPlayerIndex, players, board, animPosition } = get()
        if (diceValue === null || animPosition === null) return

        const player = players[currentPlayerIndex]
        if (!player) return

        const startPos = player.position
        const { position, completedLap } = advancePosition(startPos, diceValue)
        const tile = getTile(position, board)

        const updatedPlayers = players.map((p) => {
          if (p.id !== player.id) return p
          let lives = p.lives
          if (completedLap) {
            lives = applyLifeChange(lives, 1)
          }
          return { ...p, position, lives }
        })

        set({
          players: updatedPlayers,
          turnPhase: 'landed',
          landedTileIndex: position,
          lastLandedLabel: tile.label,
          lapMessage: completedLap ? '+1 vida · Pase de visita' : null,
          animPosition: null,
          animPlayerId: null,
          moveStepsRemaining: 0,
        })
      },

      endTurn: () => {
        const { currentPlayerIndex, players } = get()
        const next = nextActivePlayerIndex(players, currentPlayerIndex)
        set({
          currentPlayerIndex: next,
          turnPhase: 'roll',
          diceValue: null,
          landedTileIndex: null,
          lastLandedLabel: null,
          lapMessage: null,
        })
      },
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
        lastLandedLabel: state.lastLandedLabel,
      }),
    },
  ),
)

/** Re-export for components that trigger roll with computed value */
export function computeDiceRoll(): number {
  return rollDice()
}
