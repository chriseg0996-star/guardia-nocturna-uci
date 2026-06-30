import type { CSSProperties } from 'react'
import { CATEGORIES } from '../../data/categories'
import type { Player } from '../../game/engine'
import styles from './PlayerPanel.module.css'

type PlayerPanelProps = {
  player: Player
  active: boolean
}

export function PlayerPanel({ player, active }: PlayerPanelProps) {
  return (
    <div
      className={`${styles.panel} ${active ? styles.active : ''}`}
      style={{ '--accent': player.color } as CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.avatar} style={{ background: player.color }}>
          {player.name.charAt(0).toUpperCase()}
        </div>
        <span className={styles.name}>{player.name}</span>
      </div>
      <div className={styles.lives} aria-label={`${player.lives} vidas`}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`${styles.heart} ${i < player.lives ? styles.heartOn : ''}`}>
            ♥
          </span>
        ))}
      </div>
      <div className={styles.stamps} aria-label="Sellos de categorías">
        {CATEGORIES.map((c, i) => (
          <span
            key={c.id}
            className={`${styles.stamp} ${player.stamps[i] ? styles.stampOn : ''}`}
            title={c.shortName}
            style={player.stamps[i] ? { background: `color-mix(in srgb, ${c.color} 35%, transparent)` } : undefined}
          >
            {player.stamps[i] ? '✓' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}
