import { motion } from 'framer-motion'
import { useGameStore } from '../../game/store'
import { EcgLine } from '../ui/EcgLine'
import styles from './Splash.module.css'

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const item = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Splash() {
  const newGame = useGameStore((s) => s.newGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const canContinue = useGameStore(
    (s) => s.gameStarted && s.players.length > 0 && s.winners.length === 0,
  )
  const currentPlayer = useGameStore((s) => s.players[s.currentPlayerIndex])

  return (
    <div className={styles.splash}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.grid} />
      </div>

      <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
        <motion.div className={styles.ecgWrap} variants={item}>
          <EcgLine />
        </motion.div>

        <motion.div className={styles.boardPreview} variants={item} aria-hidden="true">
          <span className={styles.boardPreviewLabel}>28 CASILLAS</span>
        </motion.div>

        <motion.span className={styles.badge} variants={item}>
          Medicina Crítica
        </motion.span>

        <motion.h1 className={styles.title} variants={item}>
          Guardia
          <span className={styles.titleAccent}>Nocturna en UCI</span>
        </motion.h1>

        <motion.p className={styles.subtitle} variants={item}>
          Juego de mesa digital. Domina 8 categorías clínicas antes que se acaben tus vidas.
        </motion.p>

        <motion.div className={styles.features} variants={item}>
          <span className={styles.chip}>2–4 jugadores</span>
          <span className={styles.chip}>Hot-seat</span>
          <span className={styles.chip}>Offline</span>
        </motion.div>

        <motion.div className={styles.ctaRow} variants={item}>
          {canContinue && (
            <>
              <button type="button" className={styles.ctaSecondary} onClick={continueGame}>
                ▶ Continuar partida
              </button>
              <p className={styles.savedHint}>
                Turno: {currentPlayer?.name ?? '—'}
              </p>
            </>
          )}
          <motion.button
            type="button"
            className={styles.cta}
            onClick={() => newGame()}
            whileTap={{ scale: 0.98 }}
          >
            {canContinue ? 'Nueva partida' : 'Entrar a la guardia'}
          </motion.button>
        </motion.div>

        <motion.p className={styles.credit} variants={item}>
          v1 · Guardia Nocturna
        </motion.p>
      </motion.div>
    </div>
  )
}
