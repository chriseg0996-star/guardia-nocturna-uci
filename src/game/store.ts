import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../data/categories'
import {
  createPlayer,
  DEFAULT_SETTINGS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type GameSettings,
  type Player,
  type PlayerId,
} from './engine'
import { generateBoard, type Tile } from './board'

export type AppScreen = 'splash' | 'setup' | 'game'

type GameStore = {
  screen: AppScreen
  playerCount: number
  playerNames: string[]
  players: Player[]
  board: Tile[]
  settings: GameSettings
  currentPlayerIndex: number
  gameStarted: boolean

  setScreen: (screen: AppScreen) => void
  setPlayerCount: (count: number) => void
  setPlayerName: (index: number, name: string) => void
  updateSettings: (partial: Partial<GameSettings>) => void
  startGame: () => void
  resetToSetup: () => void
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
        })
      },

      resetToSetup: () => {
        set({
          screen: 'setup',
          gameStarted: false,
          players: [],
          currentPlayerIndex: 0,
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
      }),
    },
  ),
)
