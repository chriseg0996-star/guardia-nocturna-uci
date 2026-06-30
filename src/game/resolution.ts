import type { EventCard } from '../data/types'
import type { Player, PlayerId } from './engine'
import { applyLifeChange, BOARD_SIZE } from './engine'

export function awardStamp(stamps: boolean[], categoryId: number): { stamps: boolean[]; gained: boolean } {
  const idx = categoryId - 1
  if (idx < 0 || idx >= 8) return { stamps, gained: false }
  if (stamps[idx]) return { stamps, gained: false }
  const next = [...stamps]
  next[idx] = true
  return { stamps: next, gained: true }
}

export function applyQuestionOutcome(
  player: Player,
  categoryId: number,
  correct: boolean,
): { player: Player; gainedStamp: boolean } {
  let next = { ...player }
  if (correct) {
    const { stamps, gained } = awardStamp(player.stamps, categoryId)
    next.stamps = stamps
    return { player: syncElimination(next), gainedStamp: gained }
  }
  next.lives = applyLifeChange(player.lives, -1)
  return { player: syncElimination(next), gainedStamp: false }
}

export function syncElimination(player: Player): Player {
  return { ...player, eliminated: player.lives <= 0 }
}

export function advancePlayerPosition(position: number, steps: number): number {
  return (position + steps) % BOARD_SIZE
}

export function applyEventEffect(
  event: EventCard,
  currentId: PlayerId,
  players: Player[],
): { players: Player[]; message: string } {
  let message = event.x
  let next = players.map((p) => ({ ...p }))

  const currentIdx = next.findIndex((p) => p.id === currentId)
  const current = next[currentIdx]
  if (!current) return { players: next, message }

  if (event.life !== undefined) {
    next[currentIdx] = syncElimination({
      ...current,
      lives: applyLifeChange(current.lives, event.life),
    })
    return { players: next, message }
  }

  switch (event.t) {
    case 'Interconsulta':
      return { players: next, message: 'Turno terminado — interconsulta.' }

    case 'Cambio de guardia': {
      const others = next.filter((p) => !p.eliminated && p.id !== currentId)
      const partner = others[0]
      if (partner) {
        const partnerIdx = next.findIndex((p) => p.id === partner.id)
        const tmp = current.position
        next[currentIdx] = { ...current, position: partner.position }
        next[partnerIdx] = { ...partner, position: tmp }
        message = `Intercambiaste posición con ${partner.name}.`
      }
      return { players: next, message }
    }

    case 'Llamada del jefe': {
      next = next.map((p) => {
        if (p.id === currentId || p.eliminated) return p
        return { ...p, position: advancePlayerPosition(p.position, 1) }
      })
      return { players: next, message: 'Los demás residentes avanzan 1 casilla.' }
    }

    case 'Nota de evolución': {
      next[currentIdx] = {
        ...current,
        position: advancePlayerPosition(current.position, 3),
      }
      message = 'Avanzas 3 casillas extra.'
      return { players: next, message }
    }

    default:
      return { players: next, message }
  }
}

export function applyCornerEffect(
  corner: 'go' | 'descanso' | 'codigo_azul' | 'guardia',
  player: Player,
): { player: Player; message: string; endTurnOnly: boolean } {
  switch (corner) {
    case 'descanso':
      return {
        player: syncElimination({ ...player, lives: applyLifeChange(player.lives, 1) }),
        message: '+1 vida — micro-descanso en sala.',
        endTurnOnly: false,
      }
    case 'codigo_azul':
      return {
        player,
        message: 'Código azul — pierdes el resto del turno.',
        endTurnOnly: true,
      }
    case 'go':
      return {
        player,
        message: 'Pase de visita — base segura.',
        endTurnOnly: false,
      }
    case 'guardia':
      return {
        player,
        message: 'Guardia nocturna — sigue el turno.',
        endTurnOnly: false,
      }
  }
}
