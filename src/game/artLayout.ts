/**
 * Posiciones (x%, y%) de cada casilla sobre el arte oficial del tablero.
 * Índice 0–27, sentido horario desde Pase de visita (esquina inferior izquierda).
 * Ajustadas al laberinto del PNG — no al grid 8×8 lógico.
 */
export const ART_TILE_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  /* 0 GO — UCI 03 verde */
  { x: 22, y: 74 },
  { x: 30, y: 68 },
  { x: 37, y: 68 },
  { x: 44, y: 68 },
  { x: 51, y: 68 },
  { x: 58, y: 68 },
  { x: 65, y: 68 },
  /* 7 Descanso — UCI 04 morado */
  { x: 74, y: 74 },
  { x: 68, y: 64 },
  { x: 68, y: 58 },
  { x: 68, y: 52 },
  { x: 68, y: 46 },
  { x: 62, y: 40 },
  { x: 68, y: 34 },
  /* 14 Código Azul — UCI 02 naranja */
  { x: 74, y: 22 },
  { x: 65, y: 28 },
  { x: 56, y: 28 },
  { x: 48, y: 28 },
  { x: 40, y: 28 },
  { x: 32, y: 28 },
  { x: 26, y: 34 },
  /* 21 Guardia — UCI 01 azul */
  { x: 22, y: 22 },
  { x: 26, y: 40 },
  { x: 26, y: 46 },
  { x: 26, y: 52 },
  { x: 22, y: 58 },
  { x: 22, y: 64 },
  { x: 22, y: 70 },
] as const

export const ART_BOARD_SIZE = ART_TILE_POSITIONS.length

export function tileToArtPercent(index: number): { x: number; y: number } {
  const normalized = ((index % ART_BOARD_SIZE) + ART_BOARD_SIZE) % ART_BOARD_SIZE
  return ART_TILE_POSITIONS[normalized]!
}

/** Centro de la ruleta de categorías en el arte (para sellos, paso 3). */
export const ART_WHEEL_CENTER = { x: 50, y: 50 } as const

/** Ángulos de cada categoría en la ruleta (1–8, sentido horario desde arriba). */
export function categoryToWheelAngle(categoryId: number): number {
  return (categoryId - 1) * 45
}
