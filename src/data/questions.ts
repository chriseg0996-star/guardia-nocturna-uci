import type { Card } from './types'

/** Question decks keyed by category id. Categories 2–5 marked [PENDIENTE] use placeholder cards. */
export const QUESTIONS: Record<number, Card[]> = {
  1: [
    {
      q: '¿Cuál es la unidad funcional del pulmón responsable del intercambio gaseoso?',
      a: 'El acino pulmonar (unidad respiratoria terminal).',
      options: ['Bronquio principal', 'Acino pulmonar', 'Pleura visceral', 'Mediastino'],
      correct: 1,
    },
    {
      q: '¿Qué estructura separa el pulmón derecho del izquierdo en la radiografía?',
      a: 'El mediastino, visible como la línea media cardíaca y traqueal.',
      options: ['Diafragma', 'Mediastino', 'Hilio pulmonar', 'Fissura oblicua'],
      correct: 1,
    },
    {
      q: 'La ventilación alveolar efectiva depende principalmente de:',
      a: 'La relación ventilación/perfusión (V/Q) en las unidades alveolares.',
      options: ['Solo del gasto cardíaco', 'Relación V/Q', 'Presión venosa central', 'Hematocrito'],
      correct: 1,
    },
  ],
  2: [
    {
      q: '[PENDIENTE] Capnografía — pregunta de ejemplo',
      a: 'Contenido pendiente de redacción. Respuesta de ejemplo para desarrollo.',
      options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correct: 0,
    },
  ],
  3: [
    {
      q: '[PENDIENTE] Ácido Base — pregunta de ejemplo',
      a: 'Contenido pendiente de redacción.',
      options: ['Acidemia', 'Alcalemia', 'Compensación', 'Anión gap'],
      correct: 3,
    },
  ],
  4: [
    {
      q: '[PENDIENTE] Leyes de los Gases — pregunta de ejemplo',
      a: 'Contenido pendiente de redacción.',
      options: ['Boyle', 'Charles', 'Dalton', 'Henry'],
      correct: 0,
    },
  ],
  5: [
    {
      q: '[PENDIENTE] Mecánica Pulmonar — pregunta de ejemplo',
      a: 'Contenido pendiente de redacción.',
      options: ['Compliance', 'Resistencia', 'PEEP', 'Driving pressure'],
      correct: 3,
    },
  ],
  6: [
    {
      q: '¿Qué hallazgo sugiere shunt intrapulmonar significativo?',
      a: 'Hipoxemia que no corrige con oxígeno suplementario (PaO₂/FiO₂ baja pese a FiO₂ alta).',
      options: [
        'Mejora rápida con O₂ nasal',
        'Hipoxemia refractaria a O₂',
        'Hipercapnia leve aislada',
        'Alcalosis respiratoria',
      ],
      correct: 1,
    },
    {
      q: 'El índice PaO₂/FiO₂ (P/F) de 180 mmHg clasifica como:',
      a: 'SDRA moderada (según criterios de Berlín: 100–200 = moderada).',
      options: ['Normal', 'SDRA leve', 'SDRA moderada', 'SDRA grave'],
      correct: 2,
    },
  ],
  7: [
    {
      q: 'Paciente con shock séptico, lactato 4.5 mmol/L. ¿Prioridad inmediata?',
      a: 'Reposición volémica con cristaloides y antibióticos precoces; evaluar vasopresores si persiste hipotensión.',
      options: ['Solo diuréticos', 'Reposición + ATB + vasopresores si precisa', 'Transfusión profiláctica', 'Alta a planta'],
      correct: 1,
    },
    {
      q: 'Neumonía nosocomial en VM: cobertura empírica debe incluir:',
      a: 'Pseudomonas y MRSA según factores de riesgo local.',
      options: ['Solo amoxicilina', 'Antipseudomónico ± cobertura MRSA', 'Metronidazol oral', 'Azitromicina sola'],
      correct: 1,
    },
  ],
  8: [
    {
      q: 'UCI Master: ¿Cuál es el objetivo principal del bundle de ventilación protectora?',
      a: 'Minimizar VILI (lesión pulmonar inducida por ventilador): Vt 4–6 ml/kg PBW, Pplat <30, driving pressure baja.',
      options: [
        'Vt 10 ml/kg siempre',
        'Minimizar VILI con Vt bajo y Pplat controlada',
        'FiO₂ 100% rutinaria',
        'PEEP cero en todos',
      ],
      correct: 1,
    },
  ],
}

export function pickQuestion(categoryId: number, usedIndices: Set<number>): { card: Card; index: number } | null {
  const deck = QUESTIONS[categoryId]
  if (!deck || deck.length === 0) return null

  const available = deck.map((_, i) => i).filter((i) => !usedIndices.has(i))
  const pool = available.length > 0 ? available : deck.map((_, i) => i)
  const index = pool[Math.floor(Math.random() * pool.length)]!
  return { card: deck[index]!, index }
}
