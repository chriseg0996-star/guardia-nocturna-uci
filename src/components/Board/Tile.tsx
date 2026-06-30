import { getCategory } from '../../data/categories'
import type { Tile as TileData } from '../../game/board'
import styles from './Tile.module.css'

type TileProps = {
  tile: TileData
  active?: boolean
  showIndex?: boolean
}

export function Tile({ tile, active = false, showIndex = false }: TileProps) {
  const category = tile.categoryId ? getCategory(tile.categoryId) : undefined

  const className = [
    styles.tile,
    tile.type === 'especial' ? styles.corner : '',
    tile.type === 'estrella' ? styles.estrella : '',
    active ? styles.tileActive : '',
  ]
    .filter(Boolean)
    .join(' ')

  const icon =
    tile.type === 'estrella'
      ? '✦'
      : tile.type === 'especial'
        ? tile.corner === 'go'
          ? '🏁'
          : tile.corner === 'descanso'
            ? '☕'
            : tile.corner === 'codigo_azul'
              ? '🚨'
              : '🌙'
        : (category?.icon ?? '❓')

  const label =
    tile.type === 'categoria' ? (category?.shortName ?? tile.label) : tile.label

  const accent = category?.color

  return (
    <div
      className={className}
      style={accent && tile.type === 'categoria' ? { borderColor: accent } : undefined}
      title={category?.name ?? tile.label}
    >
      {showIndex && <span className={styles.index}>{tile.index}</span>}
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
