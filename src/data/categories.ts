import type { Category } from './types'

export const CATEGORIES: readonly Category[] = [
  { id: 1, name: 'Anatomía y Fisiología Pulmonar', shortName: 'Anat. Pulmonar', color: '#5b8def', icon: '🫁' },
  { id: 2, name: 'Capnografía', shortName: 'Capnografía', color: '#34d3ee', icon: '📈' },
  { id: 3, name: 'Ácido Base', shortName: 'Ácido Base', color: '#a371f7', icon: '⚗️' },
  { id: 4, name: 'Leyes de los Gases', shortName: 'Gases', color: '#f2c14e', icon: '💨' },
  { id: 5, name: 'Mecánica Pulmonar', shortName: 'Mecánica', color: '#f08a3c', icon: '⚙️' },
  { id: 6, name: 'Déficit de Oxígeno', shortName: 'Déf. O₂', color: '#ff5470', icon: '🩸' },
  { id: 7, name: 'Casos Clínicos', shortName: 'Casos', color: '#3fb950', icon: '🏥' },
  { id: 8, name: 'UCI Master', shortName: 'UCI Master', color: '#ffd166', icon: '⭐' },
] as const

export const PLAYER_COLORS = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)'] as const

export const DEFAULT_PLAYER_NAMES = ['Residente 1', 'Residente 2', 'Residente 3', 'Residente 4'] as const

export function getCategory(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
