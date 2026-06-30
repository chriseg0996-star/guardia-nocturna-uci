import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getCategory } from '../../data/categories'
import { QUESTIONS } from '../../data/questions'
import type { Card } from '../../data/types'
import { judgeQuestion } from '../../game/engine'
import { QuestionModal } from '../QuestionModal/QuestionModal'
import styles from './QuizView.module.css'

type QuizItem = { categoryId: number; card: Card; index: number }

const QUIZ_LENGTH = 10

function buildDeck(): QuizItem[] {
  const all: QuizItem[] = []
  for (const [id, deck] of Object.entries(QUESTIONS)) {
    const categoryId = Number(id)
    deck.forEach((card, index) => all.push({ categoryId, card, index }))
  }
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j]!, all[i]!]
  }
  return all.slice(0, QUIZ_LENGTH)
}

type QuizViewProps = {
  onExit: () => void
}

export function QuizView({ onExit }: QuizViewProps) {
  const [deck] = useState(buildDeck)
  const [current, setCurrent] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const item = deck[current]
  const player = useMemo(
    () => ({
      id: 0 as const,
      name: 'Repaso',
      color: '#34d3ee',
      position: 0,
      lives: 10,
      stamps: Array(8).fill(false),
      eliminated: false,
    }),
    [],
  )

  const handleSubmit = useCallback(
    (selectedOption?: number, _manual?: boolean, timedOut?: boolean) => {
      if (!item) return
      const ok = !timedOut && judgeQuestion(item.card, selectedOption, undefined)
      if (ok) setCorrect((c) => c + 1)
      if (current + 1 >= deck.length) {
        setDone(true)
      } else {
        setCurrent((c) => c + 1)
      }
    },
    [item, current, deck.length],
  )

  if (done) {
    return (
      <div className={styles.wrap}>
        <div className={styles.result}>
          <h1 className={styles.title}>Repaso terminado</h1>
          <p className={styles.score}>
            {correct}/{deck.length} correctas
          </p>
          <p className={styles.hint}>
            {correct >= 8
              ? 'Excelente — listo para la guardia.'
              : correct >= 5
                ? 'Bien — repasa las categorías débiles.'
                : 'Sigue practicando antes de la guardia.'}
          </p>
          <button type="button" className={styles.btnPrimary} onClick={onExit}>
            Volver al menú
          </button>
        </div>
      </div>
    )
  }

  if (!item) return null

  const category = getCategory(item.categoryId)

  return (
    <div className={styles.wrap}>
      <header className={styles.top}>
        <button type="button" className={styles.back} onClick={onExit}>
          ← Salir
        </button>
        <span className={styles.progress}>
          {current + 1}/{deck.length}
        </span>
      </header>
      <p className={styles.mode}>Modo repaso · {category?.shortName ?? 'UCI'}</p>

      <AnimatePresence mode="wait">
        <QuestionModal
          key={`${item.categoryId}-${item.index}-${current}`}
          card={item.card}
          categoryId={item.categoryId}
          player={player}
          timerEnabled
          timerSeconds={30}
          lapMessage={null}
          onSubmit={handleSubmit}
        />
      </AnimatePresence>
    </div>
  )
}
