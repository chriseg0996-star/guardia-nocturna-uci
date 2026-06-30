import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Board } from '../Board/Board'
import { Hud } from '../Hud/Hud'
import { computeDiceRoll, useGameStore } from '../../game/store'
import styles from './GameView.module.css'

const ROLL_MS = 550
const STEP_MS = 320

export function GameView() {
  const players = useGameStore((s) => s.players)
  const board = useGameStore((s) => s.board)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const diceValue = useGameStore((s) => s.diceValue)
  const animPosition = useGameStore((s) => s.animPosition)
  const animPlayerId = useGameStore((s) => s.animPlayerId)
  const landedTileIndex = useGameStore((s) => s.landedTileIndex)
  const lapMessage = useGameStore((s) => s.lapMessage)
  const lastLandedLabel = useGameStore((s) => s.lastLandedLabel)
  const resetToSetup = useGameStore((s) => s.resetToSetup)
  const beginRoll = useGameStore((s) => s.beginRoll)
  const setDiceRolling = useGameStore((s) => s.setDiceRolling)
  const beginMove = useGameStore((s) => s.beginMove)
  const stepMove = useGameStore((s) => s.stepMove)
  const finishMove = useGameStore((s) => s.finishMove)
  const endTurn = useGameStore((s) => s.endTurn)

  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const highlightIndex =
    turnPhase === 'moving' && animPosition !== null
      ? animPosition
      : turnPhase === 'landed' && landedTileIndex !== null
        ? landedTileIndex
        : currentPlayer?.position ?? null

  const clearTimers = useCallback(() => {
    if (rollTimer.current) clearTimeout(rollTimer.current)
    if (stepTimer.current) clearInterval(stepTimer.current)
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const handleRoll = useCallback(() => {
    if (turnPhase !== 'roll') return
    beginRoll()

    rollTimer.current = setTimeout(() => {
      const value = computeDiceRoll()
      setDiceRolling(value)
      setTimeout(() => {
        beginMove()
      }, 200)
    }, ROLL_MS)
  }, [turnPhase, beginRoll, setDiceRolling, beginMove])

  useEffect(() => {
    if (turnPhase !== 'moving') {
      if (stepTimer.current) clearInterval(stepTimer.current)
      return
    }

    stepTimer.current = setInterval(() => {
      const hasMore = stepMove()
      if (!hasMore) {
        if (stepTimer.current) clearInterval(stepTimer.current)
        setTimeout(() => finishMove(), STEP_MS * 0.6)
      }
    }, STEP_MS)

    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }, [turnPhase, stepMove, finishMove])

  const diceDisabled = turnPhase !== 'roll'

  return (
    <div className={styles.game}>
      <div className={styles.topBar}>
        <span className={styles.menuBtn} style={{ border: 'none', paddingLeft: 0 }}>
          Guardia UCI
        </span>
        <button type="button" className={styles.menuBtn} onClick={resetToSetup}>
          Salir
        </button>
      </div>

      {turnPhase === 'landed' && lastLandedLabel && (
        <motion.div
          className={styles.landedBanner}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.landedTitle}>Casilla</div>
          <div className={styles.landedText}>{lastLandedLabel}</div>
          {lapMessage && (
            <div className={styles.landedTitle} style={{ marginTop: 6, color: 'var(--gold)' }}>
              {lapMessage}
            </div>
          )}
          <button type="button" className={styles.continueBtn} onClick={endTurn}>
            Siguiente turno
          </button>
        </motion.div>
      )}

      <div className={styles.boardArea}>
        <Board
          tiles={board}
          players={players}
          highlightIndex={highlightIndex}
          animPosition={animPosition}
          animPlayerId={animPlayerId}
          center={
            <Hud
              currentPlayer={currentPlayer}
              players={players}
              diceValue={diceValue}
              rolling={turnPhase === 'rolling'}
              diceDisabled={diceDisabled}
              lapMessage={turnPhase === 'moving' ? lapMessage : null}
              onRoll={handleRoll}
            />
          }
        />
      </div>
    </div>
  )
}
