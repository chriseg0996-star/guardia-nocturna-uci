import { motion } from 'framer-motion'
import { CATEGORIES, getCategory } from '../../data/categories'
import { describeWinReason, type WinReason } from '../../game/win'
import type { Player } from '../../game/engine'
import { useGameStore } from '../../game/store'
import { weakestCategory } from '../../game/sessionStats'
import styles from './WinModal.module.css'

type WinModalProps = {
  winners: Player[]
  reason: WinReason | null
  onExit: () => void
}

export function WinModal({ winners, reason, onExit }: WinModalProps) {
  const players = useGameStore((s) => s.players)
  const onlineMode = useGameStore((s) => s.onlineMode)
  const sessionStats = useGameStore((s) => s.sessionStats)
  const onlineSessionStats = useGameStore((s) => s.onlineSessionStats)

  const statsMap = onlineMode ? onlineSessionStats : sessionStats
  const statRows = players
    .map((p) => {
      const s = statsMap[p.id]
      if (!s || (s.correct === 0 && s.wrong === 0)) return null
      const weak = weakestCategory(s.categoryMisses, (id) => getCategory(id)?.shortName)
      return { name: p.name, correct: s.correct, wrong: s.wrong, weak }
    })
    .filter(Boolean) as { name: string; correct: number; wrong: number; weak: string | null }[]

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

        {statRows.length > 0 && (
          <div className={styles.statsBlock}>
            <p className={styles.statsTitle}>Resumen de la guardia</p>
            <ul className={styles.statsList}>
              {statRows.map((row) => (
                <li key={row.name}>
                  <strong>{row.name}</strong>
                  <span>
                    {row.correct}✓ · {row.wrong}✗
                    {row.weak ? ` · repasar ${row.weak}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className={styles.btnPrimary} onClick={onExit}>
          Nueva partida
        </button>
      </motion.div>
    </motion.div>
  )
}
