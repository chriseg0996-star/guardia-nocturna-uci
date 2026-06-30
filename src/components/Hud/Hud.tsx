import { CATEGORIES } from '../../data/categories'
import type { Player } from '../../game/engine'
import { Dice } from '../Dice/Dice'
import styles from './Hud.module.css'

type HudProps = {
  currentPlayer: Player | undefined
  players: Player[]
  diceValue: number | null
  rolling: boolean
  diceDisabled: boolean
  lapMessage: string | null
  onRoll: () => void
}

export function Hud({
  currentPlayer,
  players,
  diceValue,
  rolling,
  diceDisabled,
  lapMessage,
  onRoll,
}: HudProps) {
  return (
    <div className={styles.hud}>
      <div className={styles.turn}>
        <div className={styles.turnLabel}>Turno</div>
        <div className={styles.turnName} style={{ color: currentPlayer?.color }}>
          {currentPlayer?.name ?? '—'}
        </div>
      </div>

      <div className={styles.playersRow}>
        {players
          .filter((p) => !p.eliminated)
          .map((p) => (
            <span
              key={p.id}
              className={`${styles.playerPill} ${p.id === currentPlayer?.id ? styles.playerPillActive : ''}`}
              style={{ color: p.color, borderColor: p.id === currentPlayer?.id ? undefined : 'var(--line)' }}
            >
              {p.name}
              <span className={styles.lives}>♥{p.lives}</span>
            </span>
          ))}
      </div>

      {lapMessage && <div className={styles.lapBanner}>{lapMessage}</div>}

      <div className={styles.wheel} aria-label="Categorías clínicas">
        {CATEGORIES.map((c) => (
          <div
            key={c.id}
            className={styles.catChip}
            style={{ borderColor: c.color }}
            title={c.name}
          >
            <span className={styles.catIcon}>{c.icon}</span>
            <span>{c.shortName}</span>
          </div>
        ))}
      </div>

      <p className={styles.legend}>8 categorías · sellos · vidas · dado</p>

      <div className={styles.diceRow}>
        <Dice value={diceValue} rolling={rolling} disabled={diceDisabled} onRoll={onRoll} />
      </div>
    </div>
  )
}
