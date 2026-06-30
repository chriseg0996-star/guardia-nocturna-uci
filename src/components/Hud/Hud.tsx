import type { CSSProperties } from 'react'
import type { Player } from '../../game/engine'
import { CategoryWheel } from './CategoryWheel'
import { Dice } from '../Dice/Dice'
import { EcgLine } from '../ui/EcgLine'
import styles from './Hud.module.css'

type HudProps = {
  currentPlayer: Player | undefined
  diceValue: number | null
  rolling: boolean
  diceDisabled: boolean
  lapMessage: string | null
  onRoll: () => void
}

export function Hud({
  currentPlayer,
  diceValue,
  rolling,
  diceDisabled,
  lapMessage,
  onRoll,
}: HudProps) {
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

      <EcgLine />

      {lapMessage && <div className={styles.lapBanner}>{lapMessage}</div>}

      <div className={styles.wheelArea}>
        <CategoryWheel currentPlayer={currentPlayer} />
      </div>

      <div className={styles.diceRow}>
        <Dice value={diceValue} rolling={rolling} disabled={diceDisabled} onRoll={onRoll} />
      </div>
    </div>
  )
}
