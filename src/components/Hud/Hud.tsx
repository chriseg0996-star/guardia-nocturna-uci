import type { CSSProperties } from 'react'
import type { Player } from '../../game/engine'
import { StampTracker } from './StampTracker'
import styles from './Hud.module.css'

type HudProps = {
  currentPlayer: Player | undefined
  lapMessage: string | null
}

export function Hud({ currentPlayer, lapMessage }: HudProps) {
  const turnStyle = currentPlayer
    ? ({ '--turn-color': currentPlayer.color } as CSSProperties)
    : undefined

  return (
    <div className={styles.hud}>
      <div className={styles.turnBlock} style={turnStyle}>
        <div className={styles.turnLabel}>Turno activo</div>
        <div className={styles.turnName} style={{ color: currentPlayer?.color }}>
          {currentPlayer?.name ?? '—'}
        </div>
      </div>

      {lapMessage && <div className={styles.lapBanner}>{lapMessage}</div>}

      <div className={styles.wheelArea}>
        <StampTracker currentPlayer={currentPlayer} />
      </div>
    </div>
  )
}
