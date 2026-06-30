import { motion } from 'framer-motion'
import { CATEGORIES } from '../../data/categories'
import { describeWinReason, type WinReason } from '../../game/win'
import type { Player } from '../../game/engine'
import styles from './WinModal.module.css'

type WinModalProps = {
  winners: Player[]
  reason: WinReason | null
  onExit: () => void
}

export function WinModal({ winners, reason, onExit }: WinModalProps) {
  const label = winners.map((w) => w.name).join(' · ')
  const subtitle = reason ? describeWinReason(reason) : 'Fin de la guardia'

  const stampCount = winners[0]?.stamps.filter(Boolean).length ?? 0

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
        <p className={styles.reason}>{subtitle}</p>
        <p className={styles.names}>{label}</p>

        {reason === 'uci_master' && winners[0] && (
          <div className={styles.stamps} aria-label="Sellos conseguidos">
            {CATEGORIES.map((c, i) => (
              <span
                key={c.id}
                className={`${styles.stamp} ${winners[0]!.stamps[i] ? styles.stampOn : ''}`}
                title={c.name}
              >
                {c.icon}
              </span>
            ))}
          </div>
        )}

        {reason === 'survival' && winners[0] && (
          <p className={styles.stat}>♥ {winners[0].lives} vidas restantes</p>
        )}

        {reason === 'uci_master' && (
          <p className={styles.stat}>{stampCount}/8 categorías dominadas</p>
        )}

        <button type="button" className={styles.btnPrimary} onClick={onExit}>
          Nueva partida
        </button>
      </motion.div>
    </motion.div>
  )
}
