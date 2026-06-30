import { describe, expect, it } from 'vitest'
import { createPlayer } from './engine'
import {
  applyQuestionOutcome,
  awardStamp,
  applyCornerEffect,
  applyEventEffect,
} from './resolution'

describe('awardStamp', () => {
  it('marks category stamp once', () => {
    const stamps = Array(8).fill(false) as boolean[]
    const { stamps: s1, gained: g1 } = awardStamp(stamps, 3)
    expect(g1).toBe(true)
    expect(s1[2]).toBe(true)
    const { gained: g2 } = awardStamp(s1, 3)
    expect(g2).toBe(false)
  })
})

describe('applyQuestionOutcome', () => {
  it('adds stamp on correct answer', () => {
    const p = createPlayer(0, 'A', '#fff')
    const { player, gainedStamp } = applyQuestionOutcome(p, 1, true)
    expect(gainedStamp).toBe(true)
    expect(player.stamps[0]).toBe(true)
  })

  it('removes life on wrong answer', () => {
    const p = createPlayer(0, 'A', '#fff')
    const { player } = applyQuestionOutcome(p, 1, false)
    expect(player.lives).toBe(9)
  })
})

describe('applyCornerEffect', () => {
  it('descanso gives +1 life', () => {
    const p = createPlayer(0, 'A', '#fff')
    p.lives = 5
    const { player } = applyCornerEffect('descanso', p)
    expect(player.lives).toBe(6)
  })
})

describe('applyEventEffect', () => {
  it('applies life bonus from event card', () => {
    const p0 = createPlayer(0, 'A', '#fff')
    p0.lives = 5
    const p1 = createPlayer(1, 'B', '#000')
    const { players } = applyEventEffect(
      { ico: '☕', t: 'Pausa café', x: 'test', life: 1 },
      0,
      [p0, p1],
    )
    expect(players[0]?.lives).toBe(6)
  })
})
