import { describe, expect, it } from 'vitest'
import { tileToGrid, tileToPercent } from '../game/layout'

describe('tileToGrid', () => {
  it('places GO at bottom-left', () => {
    expect(tileToGrid(0)).toEqual({ row: 7, col: 0 })
  })

  it('places corners correctly', () => {
    expect(tileToGrid(7)).toEqual({ row: 7, col: 7 })
    expect(tileToGrid(14)).toEqual({ row: 0, col: 7 })
    expect(tileToGrid(21)).toEqual({ row: 0, col: 0 })
  })

  it('maps 28 unique perimeter cells', () => {
    const cells = new Set(Array.from({ length: 28 }, (_, i) => {
      const { row, col } = tileToGrid(i)
      return `${row},${col}`
    }))
    expect(cells.size).toBe(28)
  })
})

describe('tileToPercent', () => {
  it('returns center percentages within 0–100', () => {
    for (let i = 0; i < 28; i++) {
      const { x, y } = tileToPercent(i)
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(100)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(100)
    }
  })
})
