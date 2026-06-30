import { motion } from 'framer-motion'
import type { Player } from '../../game/engine'
import styles from './WinModal.module.css'

type WinModalProps = {
  winners: Player[]
  onExit: () => void
}

export function WinModal({ winners, onExit }: WinModalProps) {
  const label = winners.map((w) => w.name).join(' · ')

  return (
    <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className={styles.card}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      >
        <div className={styles.trophy}>🏆</div>
        <h2 className={styles.title}>¡Victoria!</h2>
        <p className={styles.names}>{label}</p>
        <button type="button" className={styles.btn} onClick={onExit}>
          Volver al menú
        </button>
      </motion.div>
    </motion.div>
  )
}
