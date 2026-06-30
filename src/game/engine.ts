export const MAX_LIVES = 10
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4
export const BOARD_SIZE = 28
export const DEFAULT_TIMER_SEC = 30

export type PlayerId = 0 | 1 | 2 | 3

export type Player = {
  id: PlayerId
  name: string
  color: string
  position: number
  lives: number
  stamps: boolean[]
  eliminated: boolean
}

export type GameSettings = {
  timerEnabled: boolean
  timerSeconds: number
  winUciMaster: boolean
  winSurvival: boolean
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: GameSettings = {
  timerEnabled: true,
  timerSeconds: DEFAULT_TIMER_SEC,
  winUciMaster: true,
  winSurvival: true,
  soundEnabled: false,
}

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

export function advancePosition(current: number, steps: number): { position: number; completedLap: boolean } {
  const next = current + steps
  const completedLap = next >= BOARD_SIZE
  return { position: next % BOARD_SIZE, completedLap }
}

export function createPlayer(id: PlayerId, name: string, color: string): Player {
  return {
    id,
    name,
    color,
    position: 0,
    lives: MAX_LIVES,
    stamps: Array(8).fill(false) as boolean[],
    eliminated: false,
  }
}

export function applyLifeChange(lives: number, delta: number): number {
  return Math.min(MAX_LIVES, Math.max(0, lives + delta))
}

import type { Card } from '../data/types'

export function judgeQuestion(
  card: Pick<Card, 'options' | 'correct'>,
  selectedOption?: number,
  manualCorrect?: boolean,
): boolean {
  if (card.options !== undefined && card.correct !== undefined) {
    return selectedOption === card.correct
  }
  return manualCorrect === true
}

export function hasUciMasterWin(stamps: boolean[]): boolean {
  return stamps.every(Boolean)
}

export function countActivePlayers(players: Player[]): number {
  return players.filter((p) => !p.eliminated).length
}

export function checkWinners(
  players: Player[],
  settings: GameSettings,
): Player[] {
  const active = players.filter((p) => !p.eliminated)
  const winners: Player[] = []

  if (settings.winUciMaster) {
    const master = active.filter((p) => hasUciMasterWin(p.stamps))
    winners.push(...master)
  }

  if (settings.winSurvival && winners.length === 0) {
    if (countActivePlayers(players) === 1) {
      const last = active[0]
      if (last) winners.push(last)
    }
  }

  return winners
}
