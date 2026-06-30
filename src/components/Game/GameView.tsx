import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Board } from '../Board/Board'
import { Dice } from '../Dice/Dice'
import { Hud } from '../Hud/Hud'
import { PlayerPanel } from '../Hud/PlayerPanel'
import { CornerModal } from '../CornerModal/CornerModal'
import { EventModal } from '../EventModal/EventModal'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import { WinModal } from '../WinModal/WinModal'
import { SettingsModal } from '../Settings/SettingsModal'
import { computeDiceRoll, useGameStore } from '../../game/store'
import { useOnlineStore } from '../../online/onlineStore'
import styles from './GameView.module.css'

const ROLL_MS = 550
const STEP_MS = 380
const LAND_PAUSE_MS = 700

const PHASE_HINT: Record<string, string> = {
  roll: '◉ Toca el dado para avanzar',
  rolling: '⟳ Calculando pasos…',
  moving: '→ Avanzando por el tablero…',
  landed: '✦ Casilla alcanzada',
  resolving: '✦ Resuelve la casilla',
}

export function GameView({ onlineHost = false }: { onlineHost?: boolean }) {
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
  const winReason = useGameStore((s) => s.winReason)
  const lastFeedback = useGameStore((s) => s.lastFeedback)
  const statusMessage = useGameStore((s) => s.statusMessage)
  const onlineMode = useGameStore((s) => s.onlineMode)
  const pauseToMenu = useGameStore((s) => s.pauseToMenu)
  const leaveOnline = useOnlineStore((s) => s.leaveRoom)
  const resetOnline = useOnlineStore((s) => s.reset)
  const newGame = useGameStore((s) => s.newGame)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const beginRoll = useGameStore((s) => s.beginRoll)
  const setDiceRolling = useGameStore((s) => s.setDiceRolling)
  const beginMove = useGameStore((s) => s.beginMove)
  const stepMove = useGameStore((s) => s.stepMove)
  const finishMove = useGameStore((s) => s.finishMove)
  const beginResolve = useGameStore((s) => s.beginResolve)
  const submitQuestion = useGameStore((s) => s.submitQuestion)
  const dismissEvent = useGameStore((s) => s.dismissEvent)
  const dismissCorner = useGameStore((s) => s.dismissCorner)
  const clearFeedback = useGameStore((s) => s.clearFeedback)

  const [settingsOpen, setSettingsOpen] = useState(false)

  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentPlayer = players[currentPlayerIndex]
  const isOnlineSpectator = onlineHost || onlineMode === 'host'
  const gameLocked = isOnlineSpectator || turnPhase !== 'roll' || winners.length > 0

  const highlightIndex =
    turnPhase === 'moving' && animPosition !== null
      ? animPosition
      : (turnPhase === 'landed' || turnPhase === 'resolving') && landedTileIndex !== null
        ? landedTileIndex
        : null

  const activePlayerId =
    turnPhase === 'roll' || turnPhase === 'rolling' || turnPhase === 'moving' || turnPhase === 'landed'
      ? (currentPlayer?.id ?? null)
      : null

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
    if (isOnlineSpectator || turnPhase !== 'roll' || winners.length > 0) return
    beginRoll()
    rollTimer.current = setTimeout(() => {
      const value = computeDiceRoll()
      setDiceRolling(value)
      setTimeout(() => beginMove(), 220)
    }, ROLL_MS)
  }, [isOnlineSpectator, turnPhase, winners.length, beginRoll, setDiceRolling, beginMove])

  useEffect(() => {
    if (isOnlineSpectator) return
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
  }, [isOnlineSpectator, turnPhase, stepMove, finishMove])

  useEffect(() => {
    if (isOnlineSpectator) return
    if (turnPhase !== 'landed') return
    const id = setTimeout(() => beginResolve(), LAND_PAUSE_MS)
    return () => clearTimeout(id)
  }, [isOnlineSpectator, turnPhase, landedTileIndex, beginResolve])

  const phaseHint =
    isOnlineSpectator && statusMessage
      ? statusMessage
      : (PHASE_HINT[turnPhase] ?? '')

  return (
    <div className={styles.game}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandTitle}>Guardia Nocturna</span>
          <span className={styles.brandSub}>
            {onlineHost ? 'Modo aula · Presentador' : 'Medicina Crítica · UCI'}
          </span>
        </div>
        <div className={styles.topActions}>
          <button type="button" className={styles.settingsBtn} onClick={() => setSettingsOpen(true)} aria-label="Ajustes">
            ⚙
          </button>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => {
              if (onlineHost) {
                leaveOnline()
                resetOnline()
                newGame()
              } else {
                pauseToMenu()
              }
            }}
          >
            {onlineHost ? 'Cerrar sala' : 'Pausa'}
          </button>
        </div>
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

      <p className={styles.phaseHint}>{phaseHint}</p>

      <div className={styles.boardArea}>
        <Board
          tiles={board}
          players={players}
          highlightIndex={highlightIndex}
          animPosition={animPosition}
          animPlayerId={animPlayerId}
          activePlayerId={activePlayerId}
          center={
            <Hud
              currentPlayer={currentPlayer}
              lapMessage={
                lapMessage && (turnPhase === 'moving' || turnPhase === 'landed') ? lapMessage : null
              }
            />
          }
        />
      </div>

      <div className={styles.diceBar}>
        {turnPhase === 'moving' && lapMessage && (
          <p className={styles.lapNote}>{lapMessage}</p>
        )}
        <Dice
          value={diceValue}
          rolling={turnPhase === 'rolling'}
          disabled={gameLocked}
          onRoll={handleRoll}
        />
      </div>

      <AnimatePresence mode="wait">
        {winners.length > 0 && (
          <WinModal
            winners={winners}
            reason={winReason}
            onExit={() => {
              if (onlineHost) {
                leaveOnline()
                resetOnline()
              }
              newGame()
            }}
          />
        )}

        {!isOnlineSpectator && winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'question' && activeQuestion && activeCategoryId !== null && currentPlayer && (
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

        {!isOnlineSpectator && winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'event' && activeEvent && (
          <EventModal event={activeEvent} lapMessage={lapMessage} onDismiss={dismissEvent} />
        )}

        {!isOnlineSpectator && winners.length === 0 && turnPhase === 'resolving' && resolveKind === 'corner' && cornerKey && (
          <CornerModal corner={cornerKey} lapMessage={lapMessage} onDismiss={dismissCorner} />
        )}
      </AnimatePresence>

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
