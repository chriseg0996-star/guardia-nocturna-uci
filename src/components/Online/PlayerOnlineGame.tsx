import { AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import type { Card } from '../../data/types'
import { useGameStore } from '../../game/store'
import { useOnlineStore } from '../../online/onlineStore'
import { alertYourTurn } from '../../utils/turnAlert'
import { CornerModal } from '../CornerModal/CornerModal'
import { Dice } from '../Dice/Dice'
import { EventModal } from '../EventModal/EventModal'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import { PlayerPeg } from '../ui/PlayerPeg'
import styles from './Online.module.css'

function wireToCard(wire: { q: string; options?: string[] }): Card {
  return { q: wire.q, a: '', options: wire.options }
}

export function PlayerOnlineGame() {
  const game = useOnlineStore((s) => s.game)
  const yourPlayerId = useOnlineStore((s) => s.yourPlayerId)
  const error = useOnlineStore((s) => s.error)
  const connected = useOnlineStore((s) => s.connected)
  const reconnect = useOnlineStore((s) => s.reconnect)
  const rollDice = useOnlineStore((s) => s.rollDice)
  const submitAnswer = useOnlineStore((s) => s.submitAnswer)
  const dismissEvent = useOnlineStore((s) => s.dismissEvent)
  const dismissCorner = useOnlineStore((s) => s.dismissCorner)
  const leaveRoom = useOnlineStore((s) => s.leaveRoom)
  const privateQuestion = useOnlineStore((s) => s.privateQuestion)
  const privateEvent = useOnlineStore((s) => s.privateEvent)
  const privateCorner = useOnlineStore((s) => s.privateCorner)

  const players = useGameStore((s) => s.players)
  const settings = useGameStore((s) => s.settings)
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex)
  const turnPhase = useGameStore((s) => s.turnPhase)
  const diceValue = useGameStore((s) => s.diceValue)
  const statusMessage = useGameStore((s) => s.statusMessage)
  const winners = useGameStore((s) => s.winners)
  const winReason = useGameStore((s) => s.winReason)
  const lastFeedback = useGameStore((s) => s.lastFeedback)

  if (!game) return null

  const current = players[currentPlayerIndex]
  const you = yourPlayerId !== null ? players.find((p) => p.id === yourPlayerId) : null
  const isYourTurn =
    yourPlayerId !== null &&
    current?.id === yourPlayerId &&
    turnPhase === 'roll' &&
    winners.length === 0
  const canRoll = isYourTurn
  const youWon = winners.some((w) => w.id === yourPlayerId)

  const wasYourTurn = useRef(false)
  useEffect(() => {
    if (isYourTurn && !wasYourTurn.current) {
      alertYourTurn(settings.soundEnabled)
    }
    wasYourTurn.current = isYourTurn
  }, [isYourTurn, settings.soundEnabled])

  return (
    <div className={styles.online}>
      <div className={styles.scroll}>
        <div className={styles.topBar}>
          <p className={connected ? styles.connectedInline : styles.disconnectedInline}>
            {connected ? `● PIN ${game.pin}` : '○ Sin conexión'}
          </p>
          <button type="button" className={styles.back} onClick={leaveRoom}>
            Salir
          </button>
        </div>

        {!connected && (
          <div className={styles.reconnectBar}>
            <p>Se perdió la conexión con el servidor.</p>
            <button type="button" className={styles.reconnectBtn} onClick={() => void reconnect()}>
              Reconectar
            </button>
          </div>
        )}

        {error && <p className={styles.errorBanner}>{error}</p>}

        {winners.length > 0 ? (
          <div className={styles.waitCard}>
            <h1 className={styles.title}>{youWon ? '¡Ganaste!' : 'Partida terminada'}</h1>
            <p className={styles.subtitle}>
              {winners.map((w) => w.name).join(', ')} —{' '}
              {winReason === 'uci_master' ? 'UCI Master' : 'Supervivencia'}
            </p>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>{isYourTurn ? '¡Tu turno!' : 'Esperando'}</h1>

            {lastFeedback && <p className={styles.feedbackLine}>{lastFeedback}</p>}

            <div className={styles.waitCard}>
              {current && (
                <div className={styles.turnRow}>
                  <PlayerPeg
                    color={current.color}
                    size="md"
                    label={current.name.charAt(0).toUpperCase()}
                  />
                  <p className={styles.playerName}>
                    {isYourTurn ? 'Tira el dado' : `Turno de ${current.name}`}
                  </p>
                </div>
              )}
              <p className={styles.subtitle} style={{ marginBottom: 0 }}>
                {statusMessage ??
                  (isYourTurn
                    ? 'El tablero se actualiza en la pantalla del aula.'
                    : 'Mira el proyector para seguir la partida.')}
              </p>
            </div>

            <div className={styles.playerDice}>
              <Dice
                value={diceValue}
                rolling={turnPhase === 'rolling'}
                disabled={!canRoll}
                onRoll={rollDice}
              />
            </div>

            {you && (
              <div className={styles.yourStats}>
                <PlayerPeg color={you.color} size="sm" />
                <span className={styles.playerName}>{you.name}</span>
                <span className={styles.statChip}>♥ {you.lives}</span>
                <span className={styles.statChip}>
                  {you.stamps.filter(Boolean).length}/8 sellos
                </span>
              </div>
            )}

            <ul className={styles.playerList}>
              {players.map((p) => (
                <li
                  key={p.id}
                  className={styles.playerItem}
                  style={
                    p.id === yourPlayerId
                      ? ({ borderColor: p.color } as CSSProperties)
                      : undefined
                  }
                >
                  <PlayerPeg color={p.color} size="sm" />
                  <span className={styles.playerName}>
                    {p.name}
                    {p.id === yourPlayerId ? ' (tú)' : ''}
                  </span>
                  <span className={styles.statChip}>♥ {p.lives}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {privateQuestion && you && (
          <QuestionModal
            key={`q-${privateQuestion.categoryId}`}
            card={wireToCard(privateQuestion.card)}
            categoryId={privateQuestion.categoryId}
            player={you}
            timerEnabled={settings.timerEnabled}
            timerSeconds={settings.timerSeconds}
            lapMessage={privateQuestion.lapMessage}
            onSubmit={submitAnswer}
            onClose={leaveRoom}
            closeLabel="← Salir"
          />
        )}

        {privateEvent && (
          <EventModal
            event={privateEvent.event}
            lapMessage={privateEvent.lapMessage}
            onDismiss={dismissEvent}
            onMenu={leaveRoom}
            menuLabel="← Salir de sala"
          />
        )}

        {privateCorner && (
          <CornerModal
            corner={privateCorner.corner}
            lapMessage={privateCorner.lapMessage}
            onDismiss={dismissCorner}
            onMenu={leaveRoom}
            menuLabel="← Salir de sala"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
