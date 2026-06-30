import { motion } from 'framer-motion'
import { useGameStore } from '../../game/store'
import { useOnlineStore } from '../../online/onlineStore'
import { BoardPreview } from '../ui/BoardPreview'
import styles from './Splash.module.css'

const stagger = {
  animate: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
}

const item = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Splash() {
  const newGame = useGameStore((s) => s.newGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const canContinue = useGameStore(
    (s) => s.gameStarted && s.players.length > 0 && s.winners.length === 0,
  )
  const currentPlayer = useGameStore((s) => s.players[s.currentPlayerIndex])
  const createRoom = useOnlineStore((s) => s.createRoom)
  const openJoin = () => useOnlineStore.setState({ screen: 'join' })

  return (
    <div className={styles.splash}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.grid} />
      </div>

      <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
        <div className={styles.hero}>
          <motion.span className={styles.badge} variants={item}>
            Medicina Crítica
          </motion.span>

          <motion.h1 className={styles.title} variants={item}>
            Guardia
            <span className={styles.titleAccent}>Nocturna en UCI</span>
          </motion.h1>

          <motion.div className={styles.boardWrap} variants={item}>
            <BoardPreview compact />
          </motion.div>

          <motion.p className={styles.subtitle} variants={item}>
            8 categorías · tablero · guardia en UCI
          </motion.p>
        </div>

        <motion.div className={styles.actions} variants={item}>
          <div className={styles.onlineRow}>
            <motion.button
              type="button"
              className={styles.ctaJoin}
              onClick={openJoin}
              whileTap={{ scale: 0.98 }}
            >
              Unirse con PIN
            </motion.button>
            <motion.button
              type="button"
              className={styles.ctaClassroom}
              onClick={() => createRoom()}
              whileTap={{ scale: 0.98 }}
            >
              Crear sala
            </motion.button>
          </div>

          {canContinue ? (
            <button type="button" className={styles.ctaContinue} onClick={continueGame}>
              ▶ Continuar · {currentPlayer?.name ?? '—'}
            </button>
          ) : null}

          <motion.button
            type="button"
            className={styles.ctaLocal}
            onClick={() => newGame()}
            whileTap={{ scale: 0.98 }}
          >
            {canContinue ? 'Nueva partida local' : 'Jugar en este dispositivo'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
