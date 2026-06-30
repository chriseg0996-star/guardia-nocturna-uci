import type { ReactNode } from 'react'
import { tileToGrid } from '../../game/layout'
import type { Tile as TileData } from '../../game/board'
import { Tile } from './Tile'
import { TokenLayer } from './Token'
import type { Player } from '../../game/engine'
import styles from './Board.module.css'

type BoardProps = {
  tiles: TileData[]
  players: Player[]
  highlightIndex: number | null
  animPosition: number | null
  animPlayerId: Player['id'] | null
  center: ReactNode
}

export function Board({
  tiles,
  players,
  highlightIndex,
  animPosition,
  animPlayerId,
  center,
}: BoardProps) {
  return (
    <div className={styles.boardWrap}>
      <div className={styles.board} role="grid" aria-label="Tablero UCI">
        {tiles.map((tile) => {
          const { row, col } = tileToGrid(tile.index)
          return (
            <div
              key={tile.index}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
            >
              <Tile tile={tile} active={highlightIndex === tile.index} />
            </div>
          )
        })}
        <div className={styles.center}>{center}</div>
      </div>
      <div className={styles.tokenLayer}>
        <TokenLayer
          players={players}
          animPosition={animPosition}
          animPlayerId={animPlayerId}
        />
      </div>
    </div>
  )
}
