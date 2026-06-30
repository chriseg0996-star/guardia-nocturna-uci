import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Board } from '../Board/Board'
import { Hud } from '../Hud/Hud'
import { PlayerPanel } from '../Hud/PlayerPanel'
import { CornerModal } from '../CornerModal/CornerModal'
import { EventModal } from '../EventModal/EventModal'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import { WinModal } from '../WinModal/WinModal'
import { computeDiceRoll, useGameStore } from '../../game/store'
import styles from './GameView.module.css'

const ROLL_MS = 550
const STEP_MS = 300

const PHASE_HINT: Record<string, string> = {
  roll: '◉ Toca el dado para avanzar',
  rolling: '⟳ Calculando pasos…',
  moving: '→ Avanzando por el tablero',
  resolving: '✦ Resuelve la casilla',
}

export function GameView() {
  const players = useGameStore((s) => s.players)
  const board = useGameStore((s) => s.board)
  const settings = useGameStore((s) => s.settings)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const diceValue = useGameStore((s) => s.diceValue)
  const animPosition = useGameStore((s) => s.animPosition)
  const animPlayerId = useGameStore((s) => s.animPlayerId)
  const landedTileIndex = useGameStore((s) => s.landedTileIndex)
  const lapMessage = useGameStore((s) => s.lapMessage)
  const resolveKind = useGameStore((s) => s.resolveKind)
  const activeQuestion = useGameStore((s) => s.activeQuestion)
  const activeCategoryId = useGameStore((s) => s.activeCategoryId)
  const activeEvent = useGameStore((s) => s.activeEvent)
  const cornerKey = useGameStore((s) => s.cornerKey)
  const winners = useGameStore((s) => s.winners)
  const lastFeedback = useGameStore((s) => s.lastFeedback)
  const resetToSetup = useGameStore((s) => s.resetToSetup)
  const beginRoll = useGameStore((s) => s.beginRoll)
  const setDiceRolling = useGameStore((s) => s.setDiceRolling)
  const beginMove = useGameStore((s) => s.beginMove)
  const stepMove = useGameStore((s) => s.stepMove)
  const finishMove = useGameStore((s) => s.finishMove)
  const submitQuestion = useGameStore((s) => s.submitQuestion)
  const dismissEvent = useGameStore((s) => s.dismissEvent)
  const dismissCorner = useGameStore((s) => s.dismissCorner)
  const clearFeedback = useGameStore((s) => s.clearFeedback)

  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const gameLocked = turnPhase !== 'roll' || winners.length > 0

  const highlightIndex =
    (turnPhase === 'moving' || turnPhase === 'resolving') && animPosition !== null
      ? animPosition
      : turnPhase === 'resolving' && landedTileIndex !== null
        ? landedTileIndex
        : currentPlayer?.position ?? null

  const clearTimers = useCallback(() => {
    if (rollTimer.current) clearTimeout(rollTimer.current)
    if (stepTimer.current) clearInterval(stepTimer.current)
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  useEffect(() => {
    if (!lastFeedback) return
    const id = setTimeout(() => clearFeedback(), 2800)
    return () => clearTimeout(id)
  }, [lastFeedback, clearFeedback])

  const handleRoll = useCallback(() => {
    if (turnPhase !== 'roll' || winners.length > 0) return
    beginRoll()
    rollTimer.current = setTimeout(() => {
      const value = computeDiceRoll()
      setDiceRolling(value)
      setTimeout(() => beginMove(), 220)
    }, ROLL_MS)
  }, [turnPhase, winners.length, beginRoll, setDiceRolling, beginMove])

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
          <span className={styles.brandSub}>Medicina Crítica · UCI</span>
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

      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            className={styles.feedback}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {lastFeedback}
          </motion.div>
        )}
      </AnimatePresence>

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
              diceDisabled={gameLocked}
              lapMessage={turnPhase === 'moving' ? lapMessage : null}
              onRoll={handleRoll}
            />
          }
        />
      </div>

      <AnimatePresence mode="wait">
        {winners.length > 0 && <WinModal winners={winners} onExit={resetToSetup} />}

        {winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'question' && activeQuestion && activeCategoryId !== null && currentPlayer && (
          <QuestionModal
            key={`q-${activeCategoryId}-${activeQuestion.q.slice(0, 12)}`}
            card={activeQuestion}
            categoryId={activeCategoryId}
            player={currentPlayer}
            timerEnabled={settings.timerEnabled}
            timerSeconds={settings.timerSeconds}
            lapMessage={lapMessage}
            onSubmit={submitQuestion}
          />
        )}

        {winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'event' && activeEvent && (
          <EventModal event={activeEvent} lapMessage={lapMessage} onDismiss={dismissEvent} />
        )}

        {winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'corner' && cornerKey && (
          <CornerModal corner={cornerKey} lapMessage={lapMessage} onDismiss={dismissCorner} />
        )}
      </AnimatePresence>
    </div>
  )
}
