import { motion } from 'framer-motion'
import { useGameStore } from '../../game/store'
import { EcgLine } from '../ui/EcgLine'
import styles from './Splash.module.css'

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const item = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Splash() {
  const newGame = useGameStore((s) => s.newGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const canContinue = useGameStore(
    (s) => s.gameStarted && s.players.length > 0 && s.winners.length === 0,
  )
  const currentPlayer = useGameStore((s) => s.players[s.currentPlayerIndex])

  const handleNewGame = () => newGame()

  return (
    <div className={styles.splash}>
      <div className={styles.bg} aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}assets/tablero.png`} alt="" className={styles.bgImage} />
        <div className={styles.bgOverlay} />
        <div className={styles.grid} />
      </div>

      <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
        <motion.div className={styles.ecgWrap} variants={item}>
          <EcgLine />
        </motion.div>

        <motion.span className={styles.badge} variants={item}>
          Medicina Crítica
        </motion.span>

        <motion.h1 className={styles.title} variants={item}>
          Guardia
          <span className={styles.titleAccent}>Nocturna en UCI</span>
        </motion.h1>

        <motion.p className={styles.subtitle} variants={item}>
          Domina las 8 categorías clínicas. Sobrevive la guardia. Gana el tablero.
        </motion.p>

        <motion.div className={styles.features} variants={item}>
          <span className={styles.chip}>2–4 jugadores</span>
          <span className={styles.chip}>Hot-seat</span>
          <span className={styles.chip}>Offline PWA</span>
        </motion.div>

        <motion.div className={styles.ctaRow} variants={item}>
          {canContinue && (
            <>
              <motion.button
                type="button"
                className={styles.ctaSecondary}
                onClick={continueGame}
                whileTap={{ scale: 0.97 }}
              >
                ▶ Continuar partida
              </motion.button>
              <p className={styles.savedHint}>
                Turno: {currentPlayer?.name ?? '—'} · Partida guardada en este dispositivo
              </p>
            </>
          )}
          <motion.button
            type="button"
            className={styles.cta}
            onClick={handleNewGame}
            whileTap={{ scale: 0.97 }}
          >
            {canContinue ? 'Nueva partida' : 'Entrar a la guardia'}
          </motion.button>
        </motion.div>

        <motion.p className={styles.credit} variants={item}>
          Juego de mesa digital · v1
        </motion.p>
      </motion.div>
    </div>
  )
}
