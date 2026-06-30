import { motion, useReducedMotion } from 'framer-motion'
import styles from './Dice.module.css'

type DiceProps = {
  value: number | null
  rolling: boolean
  disabled: boolean
  onRoll: () => void
}

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

export function Dice({ value, rolling, disabled, onRoll }: DiceProps) {
  const reduceMotion = useReducedMotion()

  const handleClick = () => {
    if (disabled || rolling) return
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12)
    }
    onRoll()
  }

  const display =
    rolling && !reduceMotion
      ? '?'
      : value !== null
        ? reduceMotion
          ? String(value)
          : FACES[value - 1]
        : '·'

  return (
    <div className={styles.wrap}>
      <motion.button
        type="button"
        className={`${styles.dice} ${rolling ? styles.diceRolling : styles.diceIdle}`}
        disabled={disabled || rolling}
        onClick={handleClick}
        animate={
          rolling && !reduceMotion
            ? { rotate: [0, 18, -18, 12, -8, 0], scale: [1, 1.08, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
        aria-label={rolling ? 'Tirando dado' : value ? `Dado: ${value}` : 'Tirar dado'}
      >
        {display}
      </motion.button>
      <span className={styles.label}>
        {rolling ? 'Tirando…' : disabled ? 'Espera' : 'Toca para tirar'}
      </span>
    </div>
  )
}
