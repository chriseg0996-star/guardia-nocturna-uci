import { useGameStore } from '../../game/store'
import styles from './GamePlaceholder.module.css'

/** Temporary screen until P1 board is implemented. */
export function GamePlaceholder() {
  const players = useGameStore((s) => s.players)
  const resetToSetup = useGameStore((s) => s.resetToSetup)

  return (
    <div className={styles.placeholder}>
      <h2 className={styles.title}>Partida iniciada</h2>
      <p className={styles.text}>
        El tablero perimetral llegará en P1. La partida se guarda automáticamente en este dispositivo.
      </p>
      <div className={styles.players}>
        {players.map((p) => (
          <span key={p.id} className={styles.chip} style={{ borderColor: p.color, color: p.color }}>
            {p.name}
          </span>
        ))}
      </div>
      <button type="button" className={styles.backBtn} onClick={resetToSetup}>
        Volver al setup
      </button>
    </div>
  )
}
