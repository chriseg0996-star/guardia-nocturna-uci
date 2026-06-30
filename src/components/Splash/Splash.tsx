import { motion } from 'framer-motion'
import { useGameStore } from '../../game/store'
import { EcgLine } from '../ui/EcgLine'
import styles from './Splash.module.css'

const TABLERO = `${import.meta.env.BASE_URL}assets/tablero.png`

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

const item = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
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

        <motion.span className={styles.badge} variants={item}>
          Medicina Crítica · Hot-seat
        </motion.span>

        <motion.h1 className={styles.title} variants={item}>
          Guardia
          <span className={styles.titleAccent}>Nocturna en UCI</span>
        </motion.h1>

        <motion.figure className={styles.boardArt} variants={item}>
          <img
            src={TABLERO}
            alt="Tablero Guardia Nocturna — 4 salas UCI, 8 categorías clínicas"
            width={1024}
            height={1024}
            loading="eager"
            decoding="async"
          />
        </motion.figure>

        <motion.p className={styles.subtitle} variants={item}>
          Domina las 8 categorías. Sobrevive la guardia. Gana el tablero.
        </motion.p>

        <motion.div className={styles.features} variants={item}>
          <span className={styles.chip}>2–4 jugadores</span>
          <span className={styles.chip}>28 casillas</span>
          <span className={styles.chip}>Offline PWA</span>
        </motion.div>

        <motion.div className={styles.ctaRow} variants={item}>
          {canContinue && (
            <>
              <button type="button" className={styles.ctaSecondary} onClick={continueGame}>
                ▶ Continuar partida
              </button>
              <p className={styles.savedHint}>Turno: {currentPlayer?.name ?? '—'}</p>
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
          Juego de mesa digital
        </motion.p>
      </motion.div>
    </div>
  )
}
