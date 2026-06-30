import { motion } from 'framer-motion'
import type { GameSettings } from '../../game/engine'
import { SettingsPanel } from './SettingsPanel'
import styles from './SettingsModal.module.css'

type SettingsModalProps = {
  settings: GameSettings
  onChange: (partial: Partial<GameSettings>) => void
  onClose: () => void
}

export function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.sheet}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>Ajustes</h2>
        <SettingsPanel settings={settings} onChange={onChange} />
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Cerrar
        </button>
      </motion.div>
    </motion.div>
  )
}
