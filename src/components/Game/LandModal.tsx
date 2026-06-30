import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { getCategory } from '../../data/categories'
import { getTile } from '../../game/board'
import type { Tile } from '../../game/board'
import styles from './LandModal.module.css'

type LandModalProps = {
  tileIndex: number
  board: Tile[]
  lapMessage: string | null
  onContinue: () => void
}

function tileMeta(tile: Tile) {
  if (tile.type === 'estrella') {
    return { icon: '✦', label: 'Carta de evento', sub: 'Suerte clínica — resuelve el efecto', accent: '#a371f7' }
  }
  if (tile.type === 'especial') {
    const map = {
      go: { icon: '🏁', label: 'Pase de visita', sub: 'Base segura — completar vuelta recupera 1 vida', accent: '#f2c14e' },
      descanso: { icon: '☕', label: 'Sala Descanso', sub: 'Micro-descanso en la guardia', accent: '#3fb950' },
      codigo_azul: { icon: '🚨', label: 'Código Azul', sub: 'Emergencia — pierdes el turno', accent: '#ff5470' },
      guardia: { icon: '🌙', label: 'Guardia Nocturna', sub: 'El corazón de la UCI', accent: '#34d3ee' },
    } as const
    return tile.corner ? { ...map[tile.corner] } : { icon: '⭐', label: tile.label, sub: '', accent: '#34d3ee' }
  }
  const cat = tile.categoryId ? getCategory(tile.categoryId) : undefined
  return {
    icon: cat?.icon ?? '❓',
    label: cat?.name ?? tile.label,
    sub: 'Pregunta clínica — acierto = sello de categoría',
    accent: cat?.color ?? '#34d3ee',
  }
}

export function LandModal({ tileIndex, board, lapMessage, onContinue }: LandModalProps) {
  const tile = getTile(tileIndex, board)
  const meta = tileMeta(tile)

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onContinue}
    >
      <motion.div
        className={styles.card}
        initial={{ y: 40, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{ '--accent': meta.accent } as CSSProperties}
      >
        <div className={styles.iconWrap}>{meta.icon}</div>
        <div className={styles.eyebrow}>Has caído en</div>
        <h2 className={styles.title}>{meta.label}</h2>
        <p className={styles.sub}>{meta.sub}</p>
        {lapMessage && <div className={styles.lap}>{lapMessage}</div>}
        <button type="button" className={styles.btn} onClick={onContinue}>
          Siguiente turno →
        </button>
      </motion.div>
    </motion.div>
  )
}
