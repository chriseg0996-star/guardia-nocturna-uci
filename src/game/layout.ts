/** Grid cell for a perimeter tile on an 8×8 board (7 tiles + corner per side). */
export type GridCell = { row: number; col: number }

const GRID = 8

/** Maps tile index (0–27, clockwise from GO bottom-left) to grid coordinates. */
export function tileToGrid(index: number): GridCell {
  if (index >= 0 && index <= 6) {
    return { row: GRID - 1, col: index }
  }
  if (index >= 7 && index <= 13) {
    return { row: GRID - 1 - (index - 7), col: GRID - 1 }
  }
  if (index >= 14 && index <= 20) {
    return { row: 0, col: GRID - 1 - (index - 14) }
  }
  if (index === 21) {
    return { row: 0, col: 0 }
  }
  return { row: index - 21, col: 0 }
}

/** Percentage position (center of tile) for absolute placement inside the board. */
export function tileToPercent(index: number): { x: number; y: number } {
  const { row, col } = tileToGrid(index)
  const cell = 100 / GRID
  return {
    x: col * cell + cell / 2,
    y: row * cell + cell / 2,
  }
}

export const BOARD_GRID_SIZE = GRID
