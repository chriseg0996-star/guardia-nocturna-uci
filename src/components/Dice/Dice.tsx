import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './Dice.module.css'

type DiceProps = {
  value: number | null
  rolling: boolean
  disabled: boolean
  onRoll: () => void
}

/** Dot patterns for faces 1–6 (3×3 grid, index 0–8) */
const PATTERNS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function DiceFace({ value }: { value: number }) {
  const on = new Set(PATTERNS[value] ?? [])
  return (
    <div className={styles.dots}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`${styles.dot} ${on.has(i) ? styles.dotOn : ''}`} />
      ))}
    </div>
  )
}

export function Dice({ value, rolling, disabled, onRoll }: DiceProps) {
  const reduceMotion = useReducedMotion()
  const [spinFace, setSpinFace] = useState(1)
  const display = value ?? spinFace

  useEffect(() => {
    if (!rolling) return
    const id = setInterval(() => setSpinFace((f) => (f % 6) + 1), 80)
    return () => clearInterval(id)
  }, [rolling])

  const handleClick = () => {
    if (disabled || rolling) return
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 30, 15])
    }
    onRoll()
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        disabled={disabled || rolling}
        onClick={handleClick}
        aria-label={rolling ? 'Tirando dado' : value ? `Dado: ${value}` : 'Tirar dado'}
      >
        <div className={styles.scene}>
          <motion.div
            className={`${styles.cube} ${rolling && !reduceMotion ? styles.rolling : ''}`}
            animate={
              !rolling && value
                ? { rotateX: 0, rotateY: 0, scale: [1, 1.08, 1] }
                : undefined
            }
            transition={{ duration: 0.35 }}
          >
            <div className={styles.face}>
              <DiceFace value={rolling ? spinFace : display} />
            </div>
          </motion.div>
        </div>
      </button>
      <span className={`${styles.label} ${!disabled && !rolling ? styles.labelReady : ''}`}>
        {rolling ? '⟳ Tirando…' : disabled ? 'Espera turno' : 'Toca el dado'}
      </span>
    </div>
  )
}
