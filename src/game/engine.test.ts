import { describe, expect, it } from 'vitest'
import { generateBoard } from '../game/board'
import {
  advancePosition,
  applyLifeChange,
  BOARD_SIZE,
  checkWinners,
  createPlayer,
  DEFAULT_SETTINGS,
  judgeQuestion,
  MAX_LIVES,
  rollDice,
} from '../game/engine'

describe('rollDice', () => {
  it('returns values between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const v = rollDice()
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(6)
    }
  })
})

describe('advancePosition', () => {
  it('wraps around the board and detects lap completion', () => {
    expect(advancePosition(26, 3)).toEqual({ position: 1, completedLap: true })
    expect(advancePosition(5, 2)).toEqual({ position: 7, completedLap: false })
  })

  it('uses BOARD_SIZE of 28', () => {
    expect(BOARD_SIZE).toBe(28)
  })
})

describe('judgeQuestion', () => {
  it('auto-grades multiple choice', () => {
    expect(judgeQuestion({ options: ['a', 'b'], correct: 1 }, 1)).toBe(true)
    expect(judgeQuestion({ options: ['a', 'b'], correct: 1 }, 0)).toBe(false)
  })

  it('uses manual judgment without options', () => {
    expect(judgeQuestion({}, undefined, true)).toBe(true)
    expect(judgeQuestion({}, undefined, false)).toBe(false)
  })
})

describe('applyLifeChange', () => {
  it('clamps between 0 and MAX_LIVES', () => {
    expect(applyLifeChange(10, 5)).toBe(MAX_LIVES)
    expect(applyLifeChange(1, -5)).toBe(0)
    expect(applyLifeChange(5, 2)).toBe(7)
  })
})

describe('checkWinners', () => {
  it('detects UCI Master victory', () => {
    const player = createPlayer(0, 'A', '#fff')
    player.stamps = Array(8).fill(true) as boolean[]
    const winners = checkWinners([player], DEFAULT_SETTINGS)
    expect(winners).toHaveLength(1)
  })

  it('detects survival victory when one player remains', () => {
    const alive = createPlayer(0, 'A', '#fff')
    const dead = createPlayer(1, 'B', '#000')
    dead.eliminated = true
    const winners = checkWinners([alive, dead], { ...DEFAULT_SETTINGS, winUciMaster: false })
    expect(winners[0]?.name).toBe('A')
  })
})

describe('generateBoard', () => {
  it('creates 28 tiles with 4 corners', () => {
    const board = generateBoard()
    expect(board).toHaveLength(28)
    const corners = board.filter((t) => t.type === 'especial')
    expect(corners).toHaveLength(4)
  })
})
