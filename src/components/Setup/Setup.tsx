import { motion } from 'framer-motion'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../../data/categories'
import { MAX_PLAYERS, MIN_PLAYERS } from '../../game/engine'
import { useGameStore } from '../../game/store'
import styles from './Setup.module.css'

const COUNT_OPTIONS = [2, 3, 4] as const

export function Setup() {
  const playerCount = useGameStore((s) => s.playerCount)
  const playerNames = useGameStore((s) => s.playerNames)
  const setScreen = useGameStore((s) => s.setScreen)
  const setPlayerCount = useGameStore((s) => s.setPlayerCount)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const startGame = useGameStore((s) => s.startGame)

  const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS

  return (
    <div className={styles.setup}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => setScreen('splash')}>
          ← Volver
        </button>
        <h1 className={styles.title}>Nueva partida</h1>
        <p className={styles.subtitle}>Configura residentes para la guardia nocturna</p>
      </header>

      <section className={styles.section} aria-labelledby="players-heading">
        <h2 id="players-heading" className={styles.sectionTitle}>
          Jugadores
        </h2>
        <div className={styles.countRow} role="group" aria-label="Número de jugadores">
          {COUNT_OPTIONS.map((n) => (
            <motion.button
              key={n}
              type="button"
              className={`${styles.countBtn} ${playerCount === n ? styles.countBtnActive : ''}`}
              onClick={() => setPlayerCount(n)}
              whileTap={{ scale: 0.96 }}
              aria-pressed={playerCount === n}
            >
              {n}
            </motion.button>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="names-heading">
        <h2 id="names-heading" className={styles.sectionTitle}>
          Nombres
        </h2>
        <div className={styles.playerList}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className={styles.playerRow}>
              <span
                className={styles.playerDot}
                style={{ color: PLAYER_COLORS[i], backgroundColor: PLAYER_COLORS[i] }}
                aria-hidden="true"
              />
              <input
                className={styles.playerInput}
                type="text"
                value={playerNames[i] ?? ''}
                placeholder={DEFAULT_PLAYER_NAMES[i]}
                onChange={(e) => setPlayerName(i, e.target.value)}
                aria-label={`Nombre jugador ${i + 1}`}
                maxLength={24}
                autoComplete="off"
              />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="rules-heading">
        <h2 id="rules-heading" className={styles.sectionTitle}>
          Reglas rápidas
        </h2>
        <ul className={styles.rules}>
          <li>10 vidas por jugador · 8 sellos (categorías)</li>
          <li>Tira el dado, avanza y resuelve la casilla</li>
          <li>Victoria: dominar las 8 categorías o ser el último con vidas</li>
        </ul>
      </section>

      <motion.button
        type="button"
        className={styles.startBtn}
        disabled={!canStart}
        onClick={startGame}
        whileTap={canStart ? { scale: 0.98 } : undefined}
      >
        Iniciar guardia
      </motion.button>
    </div>
  )
}
