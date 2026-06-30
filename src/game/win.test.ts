import { describe, expect, it } from 'vitest'
import { createPlayer } from './engine'
import { describeWinReason, resolveWinResult } from './win'

describe('resolveWinResult', () => {
  it('detects UCI Master win', () => {
    const p = createPlayer(0, 'A', '#fff')
    p.stamps = Array(8).fill(true) as boolean[]
    const { winners, reason } = resolveWinResult([p], {
      timerEnabled: true,
      timerSeconds: 30,
      winUciMaster: true,
      winSurvival: true,
      soundEnabled: false,
    })
    expect(winners).toHaveLength(1)
    expect(reason).toBe('uci_master')
    expect(describeWinReason('uci_master')).toContain('8 categorías')
  })

  it('detects survival win when one player left', () => {
    const alive = createPlayer(0, 'A', '#fff')
    const dead = createPlayer(1, 'B', '#000')
    dead.eliminated = true
    const { reason } = resolveWinResult([alive, dead], {
      timerEnabled: true,
      timerSeconds: 30,
      winUciMaster: false,
      winSurvival: true,
      soundEnabled: false,
    })
    expect(reason).toBe('survival')
  })
})
