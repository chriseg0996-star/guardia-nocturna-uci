import type { CSSProperties } from 'react'
import { CATEGORIES } from '../../data/categories'
import type { Player } from '../../game/engine'
import styles from './CategoryWheel.module.css'

type CategoryWheelProps = {
  currentPlayer?: Player
}

export function CategoryWheel({ currentPlayer }: CategoryWheelProps) {
  const owned = currentPlayer?.stamps.filter(Boolean).length ?? 0

  return (
    <div className={styles.wheel} aria-label="Ruleta de categorías clínicas">
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
              {c.icon}
            </span>
          )
        })}
      </div>
      <div className={styles.core}>
        <span className={styles.coreLabel}>Sellos</span>
        <span className={styles.coreNum}>
          {owned}/8
        </span>
      </div>
    </div>
  )
}
