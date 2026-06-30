import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import styles from '../Game/LandModal.module.css'

type CornerModalProps = {
  corner: 'go' | 'descanso' | 'codigo_azul' | 'guardia'
  lapMessage: string | null
  onDismiss: () => void
  onMenu?: () => void
  menuLabel?: string
}

const META = {
  go: { icon: '🏁', label: 'Pase de visita', sub: 'Base segura del tablero.', accent: '#f2c14e' },
  descanso: { icon: '☕', label: 'Sala Descanso', sub: 'Recuperas 1 vida (máx. 10).', accent: '#3fb950' },
  codigo_azul: { icon: '🚨', label: 'Código Azul', sub: 'Emergencia — pierdes el resto del turno.', accent: '#ff5470' },
  guardia: { icon: '🌙', label: 'Guardia Nocturna', sub: 'Esquina central de la UCI.', accent: '#34d3ee' },
} as const

export function CornerModal({ corner, lapMessage, onDismiss, onMenu, menuLabel = '← Menú' }: CornerModalProps) {
  const meta = META[corner]

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {onMenu && (
        <button type="button" className={styles.menuBtn} onClick={onMenu}>
          {menuLabel}
        </button>
      )}
      <motion.div
        className={styles.card}
        initial={{ y: 40, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ '--accent': meta.accent } as CSSProperties}
      >
        <div className={styles.iconWrap}>{meta.icon}</div>
        <div className={styles.eyebrow}>Casilla especial</div>
        <h2 className={styles.title}>{meta.label}</h2>
        <p className={styles.sub}>{meta.sub}</p>
        {lapMessage && <div className={styles.lap}>{lapMessage}</div>}
        <button type="button" className={styles.btn} onClick={onDismiss}>
          Continuar →
        </button>
      </motion.div>
    </motion.div>
  )
}
