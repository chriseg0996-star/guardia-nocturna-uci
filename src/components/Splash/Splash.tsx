import { motion } from 'framer-motion'
import styles from './Splash.module.css'

type SplashProps = {
  onStart: () => void
}

export function Splash({ onStart }: SplashProps) {
  return (
    <div className={styles.splash}>
      <div className={styles.bg} aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}assets/tablero.png`} alt="" className={styles.bgImage} />
        <div className={styles.bgOverlay} />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.badge}>SONOCRÍTICO · UCI</span>
        <h1 className={styles.title}>Guardia Nocturna en UCI</h1>
        <p className={styles.subtitle}>
          Juego de mesa digital. Domina las 8 categorías clínicas antes que caigan tus vidas.
        </p>
        <motion.button
          type="button"
          className={styles.cta}
          onClick={onStart}
          whileTap={{ scale: 0.97 }}
        >
          Entrar a la guardia
        </motion.button>
        <p className={styles.credit}>Hot-seat · 2–4 jugadores · Sin conexión</p>
      </motion.div>
    </div>
  )
}
