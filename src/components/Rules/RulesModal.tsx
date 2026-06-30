import { motion } from 'framer-motion'
import styles from './RulesModal.module.css'

type RulesModalProps = {
  onClose: () => void
}

const STEPS = [
  { title: 'Objetivo', text: 'Completa 8 sellos (categorías UCI) o sé el último con vidas. Avanza tirando el dado.' },
  { title: 'Modo aula', text: 'Presentador proyecta el tablero. Alumnos entran con PIN/QR, tiran dado y responden en su móvil.' },
  { title: 'Casillas', text: 'Categoría = pregunta. Estrella = evento. Esquinas = efectos especiales. Vuelta completa = +1 vida.' },
  { title: 'Preguntas', text: 'Acierto = sello de esa categoría. Fallo o tiempo agotado = −1 vida. Sin vidas = eliminado.' },
] as const

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.card}
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>Cómo jugar</h2>
        <ol className={styles.list}>
          {STEPS.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
        <button type="button" className={styles.btn} onClick={onClose}>
          Entendido
        </button>
      </motion.div>
    </motion.div>
  )
}
