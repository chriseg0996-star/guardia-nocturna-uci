import type { CSSProperties } from 'react'
import styles from './PlayerPeg.module.css'

type PegSize = 'sm' | 'md' | 'lg'

type PlayerPegProps = {
  color: string
  size?: PegSize
  label?: string
  className?: string
}

export function PlayerPeg({ color, size = 'md', label, className = '' }: PlayerPegProps) {
  return (
    <span
      className={`${styles.peg} ${styles[size]} ${className}`}
      style={{ '--peg-color': color } as CSSProperties}
      aria-hidden={label ? undefined : true}
    >
      {label && <span className={styles.label}>{label}</span>}
    </span>
  )
}
