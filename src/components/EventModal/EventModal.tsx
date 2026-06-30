import { motion } from 'framer-motion'
import type { EventCard } from '../../data/types'
import styles from './EventModal.module.css'

type EventModalProps = {
  event: EventCard
  lapMessage: string | null
  onDismiss: () => void
  onMenu?: () => void
  menuLabel?: string
}

export function EventModal({ event, lapMessage, onDismiss, onMenu, menuLabel = '← Menú' }: EventModalProps) {
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
        initial={{ y: 48, scale: 0.94 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      >
        <div className={styles.icon}>{event.ico}</div>
        <div className={styles.eyebrow}>Carta de evento</div>
        <h2 className={styles.title}>{event.t}</h2>
        <p className={styles.text}>{event.x}</p>
        {lapMessage && <div className={styles.lap}>{lapMessage}</div>}
        <button type="button" className={styles.btn} onClick={onDismiss}>
          Aplicar efecto
        </button>
      </motion.div>
    </motion.div>
  )
}
