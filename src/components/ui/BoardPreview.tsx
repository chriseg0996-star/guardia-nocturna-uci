import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { generateBoard } from '../../game/board'
import { tileToGrid } from '../../game/layout'
import { getCategory } from '../../data/categories'
import styles from './BoardPreview.module.css'

type BoardPreviewProps = {
  className?: string
  compact?: boolean
}

export function BoardPreview({ className = '', compact = false }: BoardPreviewProps) {
  const tiles = useMemo(() => generateBoard(), [])

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''} ${className}`} aria-hidden="true">
      <div className={styles.board}>
        {tiles.map((tile) => {
          const { row, col } = tileToGrid(tile.index)
          const category = tile.categoryId ? getCategory(tile.categoryId) : undefined
          const kind =
            tile.type === 'estrella'
              ? styles.star
              : tile.type === 'especial'
                ? styles.corner
                : styles.cat

          return (
            <span
              key={tile.index}
              className={`${styles.cell} ${kind}`}
              style={
                {
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  ...(category ? { '--accent': category.color } : {}),
                } as CSSProperties
              }
            />
          )
        })}
        <div className={styles.center}>
          <div className={styles.wheel} />
        </div>
      </div>
    </div>
  )
}
