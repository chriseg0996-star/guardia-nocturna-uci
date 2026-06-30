import type { CSSProperties } from 'react'
import { CATEGORIES } from '../../data/categories'
import type { Player } from '../../game/engine'
import { PlayerPeg } from '../ui/PlayerPeg'
import styles from './PlayerPanel.module.css'

type PlayerPanelProps = {
  player: Player
  active: boolean
}

export function PlayerPanel({ player, active }: PlayerPanelProps) {
  const stampCount = player.stamps.filter(Boolean).length

  return (
    <div
      className={`${styles.panel} ${active ? styles.active : ''}`}
      style={{ '--accent': player.color } as CSSProperties}
    >
      <div className={styles.topRow}>
        <PlayerPeg color={player.color} size="sm" label={player.name.charAt(0).toUpperCase()} />
        <div className={styles.meta}>
          <span className={styles.name}>{player.name}</span>
          <span className={styles.lives} aria-label={`${player.lives} vidas`}>
            <span className={styles.heartIcon} aria-hidden="true">
              ♥
            </span>
            {player.lives}
          </span>
        </div>
        <span className={styles.stampCount} aria-label={`${stampCount} sellos`}>
          {stampCount}/8
        </span>
      </div>

      <div className={styles.stamps} aria-label="Sellos de categorías">
        {CATEGORIES.map((c, i) => (
          <span
            key={c.id}
            className={`${styles.stamp} ${player.stamps[i] ? styles.stampOn : ''}`}
            title={c.shortName}
            style={
              {
                '--cat-color': c.color,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}
