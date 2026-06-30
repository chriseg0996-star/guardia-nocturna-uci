import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Board } from '../Board/Board'
import { Hud } from '../Hud/Hud'
import { PlayerPanel } from '../Hud/PlayerPanel'
import { computeDiceRoll, useGameStore } from '../../game/store'
import { LandModal } from './LandModal'
import styles from './GameView.module.css'

const ROLL_MS = 550
const STEP_MS = 300

const PHASE_HINT: Record<string, string> = {
  roll: '◉ Toca el dado para avanzar',
  rolling: '⟳ Calculando pasos…',
  moving: '→ Avanzando por el tablero',
  landed: '✦ Resuelve la casilla',
}

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
      setTimeout(() => beginMove(), 220)
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
        setTimeout(() => finishMove(), STEP_MS * 0.5)
      }
    }, STEP_MS)

    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current)
    }
  }, [turnPhase, stepMove, finishMove])

  return (
    <div className={styles.game}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Guardia Nocturna</span>
          <span className={styles.brandSub}>UCI · SONOCRÍTICO</span>
        </div>
        <button type="button" className={styles.menuBtn} onClick={resetToSetup}>
          Salir
        </button>
      </header>

      <div className={styles.playersStrip}>
        {players
          .filter((p) => !p.eliminated)
          .map((p) => (
            <PlayerPanel key={p.id} player={p} active={p.id === currentPlayer?.id} />
          ))}
      </div>

      <p className={styles.phaseHint}>{PHASE_HINT[turnPhase] ?? ''}</p>

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
              diceValue={diceValue}
              rolling={turnPhase === 'rolling'}
              diceDisabled={turnPhase !== 'roll'}
              lapMessage={turnPhase === 'moving' ? lapMessage : null}
              onRoll={handleRoll}
            />
          }
        />
      </div>

      <AnimatePresence>
        {turnPhase === 'landed' && landedTileIndex !== null && (
          <LandModal
            tileIndex={landedTileIndex}
            board={board}
            lapMessage={lapMessage}
            onContinue={endTurn}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
