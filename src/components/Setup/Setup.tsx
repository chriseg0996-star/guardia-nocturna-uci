import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DEFAULT_PLAYER_NAMES, PLAYER_COLORS } from '../../data/categories'
import { MAX_PLAYERS, MIN_PLAYERS } from '../../game/engine'
import { useGameStore } from '../../game/store'
import { SettingsModal } from '../Settings/SettingsModal'
import { PlayerPeg } from '../ui/PlayerPeg'
import styles from './Setup.module.css'

const COUNT_OPTIONS = [2, 3, 4] as const

export function Setup() {
  const playerCount = useGameStore((s) => s.playerCount)
  const playerNames = useGameStore((s) => s.playerNames)
  const setScreen = useGameStore((s) => s.setScreen)
  const setPlayerCount = useGameStore((s) => s.setPlayerCount)
  const setPlayerName = useGameStore((s) => s.setPlayerName)
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const startGame = useGameStore((s) => s.startGame)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const canStart = playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS

  return (
    <div className={styles.setup}>
      <header className={styles.topBar}>
        <button type="button" className={styles.back} onClick={() => setScreen('splash')}>
          ← Volver
        </button>
        <h1 className={styles.topTitle}>Nueva partida</h1>
        <button
          type="button"
          className={styles.gearBtn}
          onClick={() => setSettingsOpen(true)}
          aria-label="Ajustes de partida"
        >
          ⚙
        </button>
      </header>

      <div className={styles.scroll}>
        <p className={styles.lead}>Elige cuántos residentes juegan esta guardia</p>

        <div className={styles.pegTray} aria-hidden="true">
          {PLAYER_COLORS.map((color, i) => (
            <span
              key={i}
              className={i < playerCount ? styles.pegSlotActive : styles.pegSlotIdle}
            >
              <PlayerPeg
                color={color}
                size="md"
                className={i < playerCount ? '' : styles.pegHidden}
              />
            </span>
          ))}
        </div>

        <div className={styles.countRow} role="group" aria-label="Número de jugadores">
          {COUNT_OPTIONS.map((n) => (
            <motion.button
              key={n}
              type="button"
              className={`${styles.countBtn} ${playerCount === n ? styles.countBtnActive : ''}`}
              onClick={() => setPlayerCount(n)}
              whileTap={{ scale: 0.94 }}
              aria-pressed={playerCount === n}
            >
              {n}
            </motion.button>
          ))}
        </div>

        <ul className={styles.roster}>
          {Array.from({ length: playerCount }, (_, i) => (
            <li key={i} className={styles.rosterItem}>
              <PlayerPeg color={PLAYER_COLORS[i]!} size="sm" />
              <input
                className={styles.rosterInput}
                type="text"
                value={playerNames[i] ?? ''}
                placeholder={DEFAULT_PLAYER_NAMES[i]}
                onChange={(e) => setPlayerName(i, e.target.value)}
                aria-label={`Nombre jugador ${i + 1}`}
                maxLength={24}
                autoComplete="off"
              />
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.footer}>
        <motion.button
          type="button"
          className={styles.startBtn}
          disabled={!canStart}
          onClick={startGame}
          whileTap={canStart ? { scale: 0.98 } : undefined}
        >
          Iniciar guardia
        </motion.button>
      </footer>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal
            settings={settings}
            onChange={updateSettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
