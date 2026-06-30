import type { CSSProperties } from 'react'
import { getCategory } from '../../data/categories'
import type { Tile as TileData } from '../../game/board'
import styles from './Tile.module.css'

type TileProps = {
  tile: TileData
  active?: boolean
}

const CORNER_ROOM: Partial<Record<string, string>> = {
  go: 'var(--p3)',
  descanso: 'var(--p4)',
  codigo_azul: 'var(--p2)',
  guardia: 'var(--p1)',
}

export function Tile({ tile, active = false }: TileProps) {
  const category = tile.categoryId ? getCategory(tile.categoryId) : undefined

  const cornerClass =
    tile.corner === 'go'
      ? styles.cornerGo
      : tile.corner === 'descanso'
        ? styles.cornerDescanso
        : tile.corner === 'codigo_azul'
          ? styles.cornerCode
          : tile.corner === 'guardia'
            ? styles.cornerGuardia
            : ''

  const className = [
    styles.tile,
    tile.type === 'categoria' ? styles.categoria : '',
    tile.type === 'especial' ? styles.corner : '',
    cornerClass,
    tile.type === 'estrella' ? styles.estrella : '',
    active ? styles.tileActive : '',
  ]
    .filter(Boolean)
    .join(' ')

  const icon =
    tile.type === 'estrella'
      ? '★'
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

  const roomColor = tile.corner ? CORNER_ROOM[tile.corner] : undefined

  const style: CSSProperties = {
    ...(category && tile.type === 'categoria'
      ? { '--accent': category.color }
      : {}),
    ...(roomColor ? { '--room': roomColor } : {}),
  } as CSSProperties

  return (
    <div className={className} style={style} title={category?.name ?? tile.label}>
      <span className={styles.shine} aria-hidden="true" />
      {tile.type === 'categoria' && <span className={styles.catStripe} aria-hidden="true" />}
      {tile.type === 'especial' && <span className={styles.roomGlow} aria-hidden="true" />}
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
