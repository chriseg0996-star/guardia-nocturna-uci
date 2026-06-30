import type { Card } from './types'

/** Question decks keyed by category id (8 categorías UCI). */
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
    {
      q: 'La hipoxia hipoxémica por baja PiO₂ (ej. altitud) se debe principalmente a:',
      a: 'Disminución de la presión parcial inspirada de O₂ (PIO₂), no a shunt.',
      options: ['Shunt anatómico masivo', 'Baja PIO₂ ambiental', 'Solo hipercapnia', 'Methemoglobinemia'],
      correct: 1,
    },
  ],
  2: [
    {
      q: '¿Qué refleja principalmente el ETCO₂ en un paciente intubado y hemodinámicamente estable?',
      a: 'Aproximación de la presión parcial alveolar de CO₂ (PACO₂) y, por tanto, de la ventilación alveolar.',
      options: [
        'Saturación arterial de O₂',
        'Ventilación alveolar (PACO₂ aproximada)',
        'Presión arterial media',
        'Gasto cardíaco directo',
      ],
      correct: 1,
    },
    {
      q: 'Tras intubación orotraqueal, la capnografía con onda cuadrada persistente confirma:',
      a: 'Posición traqueal del tubo (CO₂ exhalado); su ausencia obliga a descartar intubación esofágica.',
      options: [
        'Intubación esofágica segura',
        'Colocación traqueal del TET',
        'Neumotórax a tensión',
        'Embolia pulmonar masiva',
      ],
      correct: 1,
    },
    {
      q: 'Curva capnográfica con ascenso lento de la fase II (“patineta” o rampa prolongada) sugiere:',
      a: 'Obstrucción de vía aérea (broncoespasmo, EPOC, tubo kinked) con dificultad para vaciar alvéolos.',
      options: ['Embolia pulmonar aguda', 'Broncoespasmo / obstrucción', 'Hipovolemia severa', 'Intubación esofágica'],
      correct: 1,
    },
    {
      q: 'Durante RCP, un aumento brusco y sostenido del ETCO₂ sugiere:',
      a: 'Retorno de circulación espontánea (ROSC): mejor flujo pulmonar y eliminación de CO₂.',
      options: [
        'Falla definitiva de la reanimación',
        'Retorno de circulación espontánea (ROSC)',
        'Neumotórax bilateral',
        'Hipothermia profunda únicamente',
      ],
      correct: 1,
    },
  ],
  3: [
    {
      q: 'pH 7.22, PaCO₂ 25 mmHg, HCO₃⁻ 10 mEq/L. El trastorno primario es:',
      a: 'Acidosis metabólica (pH bajo con bicarbonato bajo); la hiperventilación compensa parcialmente.',
      options: [
        'Alcalosis respiratoria',
        'Acidosis metabólica',
        'Acidosis respiratoria',
        'Trastorno mixto sin acidosis',
      ],
      correct: 1,
    },
    {
      q: 'En acidosis metabólica con anión gap elevado, ¿cuál es una causa frecuente en UCI?',
      a: 'Acidosis láctica por shock / hipoperfusión tisular.',
      options: ['Diarrea crónica', 'Acidosis láctica', 'Acidosis tubular renal tipo I aislada', 'Hipoaldosteronismo'],
      correct: 1,
    },
    {
      q: 'Según la fórmula de Winter, en acidosis metabólica la PaCO₂ esperada (compensación) es aproximadamente:',
      a: '1,5 × [HCO₃⁻] + 8 (± 2) mmHg.',
      options: ['[HCO₃⁻] + 15', '1,5 × [HCO₃⁻] + 8', '40 − [HCO₃⁻]', '2 × pH'],
      correct: 1,
    },
    {
      q: 'pH 7.55, PaCO₂ 22 mmHg, HCO₃⁻ 19 mEq/L. Interpretación más probable:',
      a: 'Alcalosis respiratoria aguda (hiperventilación) con compensación renal aún limitada.',
      options: [
        'Acidosis metabólica',
        'Alcalosis respiratoria aguda',
        'Acidosis respiratoria crónica',
        'Alcalosis metabólica por exceso de HCO₃⁻',
      ],
      correct: 1,
    },
  ],
  4: [
    {
      q: 'La ley de Henry explica que la cantidad de gas disuelto en un líquido es proporcional a:',
      a: 'La presión parcial del gas sobre el líquido (relevante en intercambio O₂/CO₂ en sangre).',
      options: [
        'La temperatura corporal solamente',
        'La presión parcial del gas',
        'El volumen tidal',
        'La PEEP aplicada',
      ],
      correct: 1,
    },
    {
      q: 'La ley de Dalton establece que la presión total de una mezcla gaseosa es:',
      a: 'La suma de las presiones parciales de cada gas (PIO₂ = FiO₂ × [Patm − PH₂O]).',
      options: [
        'Igual al flujo inspiratorio',
        'Suma de presiones parciales',
        'Inversamente proporcional al Vt',
        'Siempre 760 mmHg en UCI',
      ],
      correct: 1,
    },
    {
      q: 'La ley de Boyle (P × V = constante a T fija) ayuda a entender que al aumentar el volumen pulmonar:',
      a: 'Disminuye la presión intrapleural/alveolar durante inspiración espontánea.',
      options: [
        'Aumenta la presión intratorácica siempre',
        'Disminuye la presión si el volumen aumenta',
        'No afecta la mecánica ventilatoria',
        'Elimina la necesidad de PEEP',
      ],
      correct: 1,
    },
    {
      q: 'A mayor altitud, la hipoxemia inicial se explica porque:',
      a: 'Disminuye la presión barométrica y, por Dalton, la PIO₂ y la PAO₂.',
      options: [
        'Aumenta el shunt intrapulmonar de forma inmediata',
        'Baja la PIO₂ por menor presión barométrica',
        'Sube la PaCO₂ por defecto alveolar',
        'Hay más hemoglobina oxidada',
      ],
      correct: 1,
    },
  ],
  5: [
    {
      q: 'La driving pressure (presión motriz) en ventilación mecánica se calcula como:',
      a: 'Presión meseta (Pplat) − PEEP total.',
      options: ['Ppico − PEEP', 'Pplat − PEEP', 'PEEP − Ppico', 'Vt / compliance solamente'],
      correct: 1,
    },
    {
      q: 'La compliance estática pulmonar refleja:',
      a: 'Cambio de volumen / cambio de presión sin flujo (relación elasticidad/distensibilidad).',
      options: [
        'Resistencia de vía aérea únicamente',
        'ΔV / ΔP sin flujo (elasticidad)',
        'Frecuencia cardíaca / gasto',
        'Shunt venoso',
      ],
      correct: 1,
    },
    {
      q: 'Auto-PEEP (PEEP intrínseca) es especialmente preocupante en:',
      a: 'Obstrucción a la salida de aire (EPOC, asma) con ventilación insuficientemente prolongada.',
      options: ['SDRA temprana sin obstrucción', 'EPOC / asma con atrapamiento aéreo', 'Neumotórax simple', 'Derrame pleural pequeño'],
      correct: 1,
    },
    {
      q: 'En SDRA, una presión meseta (Pplat) > 30 cmH₂O se asocia con:',
      a: 'Mayor riesgo de lesión pulmonar inducida por ventilador (VILI); ajustar Vt/PEEP.',
      options: [
        'Mejor oxigenación garantizada',
        'Mayor riesgo de VILI',
        'Indicación de extubar ya',
        'Normalidad mecánica',
      ],
      correct: 1,
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
    {
      q: 'La hipoxemia por mismatch V/Q (zona baja V/Q) mejora típicamente con:',
      a: 'Aumento de FiO₂, porque el problema es baja presión alveolar de O₂, no shunt puro.',
      options: [
        'Solo PEEP cero',
        'Aumento de FiO₂',
        'Nunca mejora con O₂',
        'Solo diuréticos',
      ],
      correct: 1,
    },
    {
      q: 'El gradiente alveolo-arterial de O₂ (A–a) elevado con FiO₂ al 100% sugiere:',
      a: 'Shunt o mismatch V/Q significativo, no hipoxia por hipoventilación sola.',
      options: [
        'Hipoventilación alveolar aislada',
        'Shunt o V/Q alterado',
        'Alcalosis metabólica',
        'Poliglobulia compensatoria normal',
      ],
      correct: 1,
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
    {
      q: 'Paciente con SDRA moderada, P/F 150, sin shock. Respecto a líquidos, lo más adecuado es:',
      a: 'Estrategia conservadora de líquidos una vez resuelta la fase de reanimación (evitar sobrecarga).',
      options: [
        'Cristaloides libres sin límite',
        'Balance hídrico conservador tras reanimación',
        'Restricción hídrica extrema desde el inicio del shock',
        'Albúmina rutinaria diaria',
      ],
      correct: 1,
    },
    {
      q: 'Delirium en UCI en paciente ventilado. Medida no farmacológica de primera línea:',
      a: 'Reorientación, ciclo sueño-vigilia, movilización temprana y minimizar sedación innecesaria.',
      options: [
        'Benzodiacepinas profilácticas',
        'Reorientación + descanso sedación según protocolo',
        'Contención mecánica rutinaria',
        'Aislamiento absoluto sin visitas',
      ],
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
    {
      q: 'En el bundle de sepsis, el antibiótico IV debe administrarse en:',
      a: 'La primera hora tras reconocer shock séptico (cuanto antes tras hipoperfusión).',
      options: ['Las primeras 24 h', 'La primera hora en shock séptico', 'Solo si hay cultivo positivo', 'Después del alta'],
      correct: 1,
    },
    {
      q: 'Ventana de sedación diaria (sedation vacation) en VM tiene como meta principal:',
      a: 'Evaluar capacidad de despertar y posible weaning, reduciendo tiempo de VM y delirium.',
      options: [
        'Aumentar dosis de midazolam',
        'Facilitar weaning y reducir VM',
        'Evitar toda evaluación neurológica',
        'Sedación permanente profunda',
      ],
      correct: 1,
    },
    {
      q: 'Criterio de Berlín para SDRA leve (P/F con PEEP ≥5) es:',
      a: '200 < PaO₂/FiO₂ ≤ 300 mmHg.',
      options: ['P/F > 400', '200 < P/F ≤ 300', '100 < P/F ≤ 200', 'P/F ≤ 100'],
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
