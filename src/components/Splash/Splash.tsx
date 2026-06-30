import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '../../game/store'
import { useOnlineStore } from '../../online/onlineStore'
import { RulesModal } from '../Rules/RulesModal'
import styles from './Splash.module.css'

const STAMPS = ['#5b8def', '#34d3ee', '#a371f7', '#f2c14e', '#f08a3c', '#ff5470', '#3fb950', '#ffd166']

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Splash() {
  const newGame = useGameStore((s) => s.newGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const setScreen = useGameStore((s) => s.setScreen)
  const canContinue = useGameStore(
    (s) => s.gameStarted && s.players.length > 0 && s.winners.length === 0,
  )
  const currentPlayer = useGameStore((s) => s.players[s.currentPlayerIndex])
  const createRoom = useOnlineStore((s) => s.createRoom)
  const openJoin = () => useOnlineStore.setState({ screen: 'join' })
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <div className={styles.splash}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.vignette} />
        <div className={styles.stampRing} />
      </div>

      <motion.div className={styles.content} variants={stagger} initial="initial" animate="animate">
        <motion.header className={styles.brand} variants={item}>
          <div className={styles.stampRow}>
            {STAMPS.map((color) => (
              <span key={color} className={styles.stamp} style={{ background: color }} />
            ))}
          </div>
          <p className={styles.eyebrow}>Medicina Crítica</p>
          <h1 className={styles.title}>
            Guardia <span className={styles.titleEm}>Nocturna</span>
          </h1>
          <p className={styles.tagline}>Tablero · preguntas UCI · 2–4 jugadores</p>
        </motion.header>

        {canContinue && (
          <motion.button
            type="button"
            className={styles.resumeBar}
            variants={item}
            onClick={continueGame}
          >
            <span className={styles.resumeIcon}>▶</span>
            <span className={styles.resumeText}>
              <strong>Continuar partida</strong>
              <small>Turno de {currentPlayer?.name ?? '—'}</small>
            </span>
          </motion.button>
        )}

        <motion.div className={styles.modes} variants={item}>
          <article className={`${styles.modeCard} ${styles.modeAula}`}>
            <div className={styles.modeLabel}>Recomendado en clase</div>
            <h2 className={styles.modeTitle}>Modo aula</h2>
            <p className={styles.modeDesc}>Proyector con el tablero. Alumnos en el móvil con PIN.</p>
            <div className={styles.modeActions}>
              <motion.button
                type="button"
                className={styles.btnGold}
                onClick={() => createRoom()}
                whileTap={{ scale: 0.98 }}
              >
                Crear sala
              </motion.button>
              <button type="button" className={styles.btnGhost} onClick={openJoin}>
                Unirse con PIN
              </button>
            </div>
          </article>

          <article className={`${styles.modeCard} ${styles.modeLocal}`}>
            <h2 className={styles.modeTitle}>Un solo móvil</h2>
            <p className={styles.modeDesc}>Hot-seat: pasan el teléfono entre jugadores.</p>
            <button type="button" className={styles.btnLocal} onClick={() => newGame()}>
              {canContinue ? 'Nueva partida local' : 'Empezar partida local'}
            </button>
          </article>
        </motion.div>

        <motion.footer className={styles.footer} variants={item}>
          <button type="button" className={styles.footerBtn} onClick={() => setRulesOpen(true)}>
            Cómo jugar
          </button>
          <button type="button" className={styles.footerBtn} onClick={() => setScreen('quiz')}>
            Modo repaso
          </button>
        </motion.footer>
      </motion.div>

      <AnimatePresence>
        {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
