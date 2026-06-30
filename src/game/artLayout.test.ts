import { describe, expect, it } from 'vitest'
import { ART_BOARD_SIZE, ART_TILE_POSITIONS, tileToArtPercent } from './artLayout'

describe('artLayout', () => {
  it('defines 28 tile positions', () => {
    expect(ART_TILE_POSITIONS.length).toBe(28)
    expect(ART_BOARD_SIZE).toBe(28)
  })

  it('returns positions within board bounds', () => {
    for (let i = 0; i < 28; i++) {
      const { x, y } = tileToArtPercent(i)
      expect(x).toBeGreaterThan(10)
      expect(x).toBeLessThan(90)
      expect(y).toBeGreaterThan(10)
      expect(y).toBeLessThan(90)
    }
  })

  it('wraps negative and overflow indices', () => {
    expect(tileToArtPercent(-1)).toEqual(tileToArtPercent(27))
    expect(tileToArtPercent(28)).toEqual(tileToArtPercent(0))
  })
})
