export type PlayerSessionStats = {
  correct: number
  wrong: number
  categoryMisses: Record<number, number>
}

export function emptyPlayerStats(): PlayerSessionStats {
  return { correct: 0, wrong: 0, categoryMisses: {} }
}

export function recordAnswer(
  stats: PlayerSessionStats,
  correct: boolean,
  categoryId?: number,
): PlayerSessionStats {
  const next = {
    ...stats,
    categoryMisses: { ...stats.categoryMisses },
  }
  if (correct) {
    next.correct += 1
  } else {
    next.wrong += 1
    if (categoryId !== undefined) {
      next.categoryMisses[categoryId] = (next.categoryMisses[categoryId] ?? 0) + 1
    }
  }
  return next
}

export function weakestCategory(
  categoryMisses: Record<number, number>,
  getName: (id: number) => string | undefined,
): string | null {
  let bestId: number | null = null
  let bestCount = 0
  for (const [id, count] of Object.entries(categoryMisses)) {
    const n = Number(id)
    if (count > bestCount) {
      bestCount = count
      bestId = n
    }
  }
  if (bestId === null || bestCount === 0) return null
  return getName(bestId) ?? null
}
