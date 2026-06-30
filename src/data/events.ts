import type { EventCard } from './types'

export const EVENTS: EventCard[] = [
  { ico: '☕', t: 'Pausa café', x: 'Recuperas 1 vida (máx. 10).', life: 1 },
  { ico: '📋', t: 'Interconsulta', x: 'Pierdes este turno — la guardia te retiene.', },
  { ico: '🔄', t: 'Cambio de guardia', x: 'Intercambias posición con el jugador a tu derecha en el tablero.', },
  { ico: '💉', t: 'Acceso venoso difícil', x: 'Pierdes 1 vida por estrés.', life: -1 },
  { ico: '📚', t: 'Repaso express', x: 'Recuperas 1 vida — repaso rápido entre rondas.', life: 1 },
  { ico: '🚨', t: 'Llamada del jefe', x: 'Todos los demás avanzan 1 casilla.', },
  { ico: '🛏️', t: 'Cama libre en UCI', x: 'Recuperas 2 vidas (máx. 10).', life: 2 },
  { ico: '📝', t: 'Nota de evolución', x: 'Avanza 3 casillas extra en tu próximo turno.', },
]

export function pickEvent(usedIndices: Set<number>): { card: EventCard; index: number } {
  const available = EVENTS.map((_, i) => i).filter((i) => !usedIndices.has(i))
  const pool = available.length > 0 ? available : EVENTS.map((_, i) => i)
  const index = pool[Math.floor(Math.random() * pool.length)]!
  return { card: EVENTS[index]!, index }
}
