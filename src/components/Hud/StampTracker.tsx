import type { CSSProperties } from 'react'
import { CATEGORIES } from '../../data/categories'
import type { Player } from '../../game/engine'
import styles from './StampTracker.module.css'

type StampTrackerProps = {
  currentPlayer?: Player
}

export function StampTracker({ currentPlayer }: StampTrackerProps) {
  const owned = currentPlayer?.stamps.filter(Boolean).length ?? 0

  return (
    <div className={styles.tracker} aria-label="Progreso hacia UCI Master">
      <p className={styles.goal}>Objetivo: UCI Master</p>
      <div className={styles.wheel} aria-hidden="true">
        <div className={styles.ring} />
        <div className={styles.segments}>
          {CATEGORIES.map((c, i) => {
            const angle = i * 45 + 22.5
            const hasStamp = currentPlayer?.stamps[i]
            return (
              <span
                key={c.id}
                className={`${styles.seg} ${hasStamp ? styles.owned : ''}`}
                style={{ '--angle': `${angle}deg` } as CSSProperties}
                title={c.name}
              >
                {hasStamp ? '✓' : c.icon}
              </span>
            )
          })}
        </div>
        <div className={styles.core}>
          <span className={styles.coreNum}>{owned}/8</span>
          <span className={styles.coreLabel}>sellos</span>
        </div>
      </div>
      <p className={styles.hint}>Acierta preguntas para ganar sellos</p>
    </div>
  )
}
