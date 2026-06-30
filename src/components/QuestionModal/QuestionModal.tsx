import { useCallback, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { getCategory } from '../../data/categories'
import type { Card } from '../../data/types'
import type { Player } from '../../game/engine'
import { useQuestionTimer } from '../../hooks/useQuestionTimer'
import styles from './QuestionModal.module.css'

type QuestionModalProps = {
  card: Card
  categoryId: number
  player: Player
  timerEnabled: boolean
  timerSeconds: number
  lapMessage: string | null
  onSubmit: (selectedOption?: number, manualCorrect?: boolean, timedOut?: boolean) => void
}

export function QuestionModal({
  card,
  categoryId,
  player,
  timerEnabled,
  timerSeconds,
  lapMessage,
  onSubmit,
}: QuestionModalProps) {
  const category = getCategory(categoryId)
  const isMc = card.options !== undefined && card.correct !== undefined
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [judged, setJudged] = useState(false)
  const submitted = useRef(false)

  const safeSubmit = useCallback(
    (opt?: number, manual?: boolean, timedOut?: boolean) => {
      if (submitted.current) return
      submitted.current = true
      onSubmit(opt, manual, timedOut)
    },
    [onSubmit],
  )

  const handleTimeout = useCallback(() => {
    safeSubmit(undefined, undefined, true)
  }, [safeSubmit])

  const { remaining, progress } = useQuestionTimer(timerSeconds, timerEnabled, !judged, handleTimeout)

  const handleMcPick = (index: number) => {
    if (judged) return
    setSelected(index)
    setJudged(true)
    setTimeout(() => safeSubmit(index), 600)
  }

  const handleManual = (correct: boolean) => {
    if (!revealed || judged) return
    setJudged(true)
    safeSubmit(undefined, correct)
  }

  const radius = 22
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      style={{ '--accent': category?.color } as CSSProperties}
    >
      <div className={styles.header}>
        <div className={styles.catBadge}>
          <span className={styles.catIcon}>{category?.icon}</span>
          {category?.shortName ?? `Cat. ${categoryId}`}
        </div>
        {timerEnabled && !judged && (
          <div className={styles.timer} aria-label={`${remaining} segundos`}>
            <svg className={styles.timerSvg} viewBox="0 0 52 52">
              <circle className={styles.timerTrack} cx="26" cy="26" r={radius} />
              <circle
                className={styles.timerArc}
                cx="26"
                cy="26"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className={styles.timerNum}>{remaining}</span>
          </div>
        )}
      </div>

      <p className={styles.playerTag}>Responde, {player.name}</p>
      {lapMessage && <div className={styles.lap}>{lapMessage}</div>}

      <div className={styles.body}>
        <div className={styles.question}>{card.q}</div>

        {isMc ? (
          <div className={styles.options}>
            {card.options!.map((opt, i) => {
              let extra = ''
              if (judged && selected === i) {
                extra = i === card.correct ? styles.optionCorrect! : styles.optionWrong!
              } else if (judged && i === card.correct) {
                extra = styles.optionCorrect!
              } else if (selected === i) {
                extra = styles.optionSelected!
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={`${styles.option} ${extra}`}
                  disabled={judged}
                  onClick={() => handleMcPick(i)}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <div className={styles.revealBlock}>
            {!revealed ? (
              <button type="button" className={styles.revealBtn} onClick={() => setRevealed(true)}>
                Revelar respuesta
              </button>
            ) : (
              <>
                <div className={styles.answer}>
                  <div className={styles.answerLabel}>Respuesta</div>
                  {card.a}
                </div>
                {!judged && (
                  <div className={styles.judgeRow}>
                    <button type="button" className={`${styles.judgeBtn} ${styles.judgeOk}`} onClick={() => handleManual(true)}>
                      ✓ Correcto
                    </button>
                    <button type="button" className={`${styles.judgeBtn} ${styles.judgeFail}`} onClick={() => handleManual(false)}>
                      ✗ Falló
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
