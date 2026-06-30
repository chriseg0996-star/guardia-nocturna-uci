import type { CategoryId } from '../data/types'

export type TileType = 'especial' | 'categoria' | 'estrella'

export type CornerKind = 'go' | 'descanso' | 'codigo_azul' | 'guardia'

export type Tile = {
  index: number
  type: TileType
  label: string
  categoryId?: CategoryId
  corner?: CornerKind
}

const CORNERS: { index: number; corner: CornerKind; label: string }[] = [
  { index: 0, corner: 'go', label: 'Pase de visita' },
  { index: 7, corner: 'descanso', label: 'Sala Descanso' },
  { index: 14, corner: 'codigo_azul', label: 'Código Azul' },
  { index: 21, corner: 'guardia', label: 'Guardia Nocturna' },
]

/** Category ids assigned to perimeter tiles (excluding corners). */
const SIDE_CATEGORIES: CategoryId[] = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]

/** Star (event) tile indices on each side middle segment. */
const STAR_INDICES = new Set([3, 10, 17, 24])

function cornerAt(index: number): CornerKind | undefined {
  return CORNERS.find((c) => c.index === index)?.corner
}

function cornerLabel(index: number): string | undefined {
  return CORNERS.find((c) => c.index === index)?.label
}

export function generateBoard(): Tile[] {
  const tiles: Tile[] = []
  let catIdx = 0

  for (let i = 0; i < 28; i++) {
    const corner = cornerAt(i)
    if (corner) {
      tiles.push({
        index: i,
        type: 'especial',
        label: cornerLabel(i) ?? 'Esquina',
        corner,
      })
      continue
    }

    if (STAR_INDICES.has(i)) {
      tiles.push({ index: i, type: 'estrella', label: 'Evento' })
      continue
    }

    const categoryId = SIDE_CATEGORIES[catIdx % SIDE_CATEGORIES.length]!
    catIdx++
    tiles.push({
      index: i,
      type: 'categoria',
      label: `Cat. ${categoryId}`,
      categoryId,
    })
  }

  return tiles
}

export function getTile(index: number, board: Tile[]): Tile {
  const normalized = ((index % board.length) + board.length) % board.length
  return board[normalized]!
}
