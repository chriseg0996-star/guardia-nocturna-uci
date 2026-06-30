import { checkWinners, countActivePlayers, hasUciMasterWin, type GameSettings, type Player } from './engine'

export type WinReason = 'uci_master' | 'survival'

export function describeWinReason(reason: WinReason): string {
  return reason === 'uci_master'
    ? 'UCI Master — dominaste las 8 categorías'
    : 'Supervivencia — último residente en pie'
}

export function resolveWinResult(
  players: Player[],
  settings: GameSettings,
): { winners: Player[]; reason: WinReason | null } {
  const winners = checkWinners(players, settings)
  if (winners.length === 0) return { winners: [], reason: null }

  if (settings.winUciMaster) {
    const master = winners.filter((p) => hasUciMasterWin(p.stamps))
    if (master.length > 0) return { winners: master, reason: 'uci_master' }
  }

  if (settings.winSurvival && countActivePlayers(players) === 1) {
    return { winners, reason: 'survival' }
  }

  return { winners, reason: null }
}

export function eliminationMessage(before: Player, after: Player): string | null {
  if (!before.eliminated && after.eliminated) {
    return `💀 ${after.name} eliminado de la guardia`
  }
  return null
}

export function mergeFeedback(base: string, extra: string | null): string {
  return extra ? `${base} · ${extra}` : base
}
