import { motion } from 'framer-motion'
import { tileToGrid } from '../../game/layout'
import type { Player } from '../../game/engine'
import styles from './Token.module.css'

type TokenProps = {
  player: Player
  offsetIndex: number
  totalAtTile: number
}

export function Token({ player, offsetIndex, totalAtTile }: TokenProps) {
  const angle = (offsetIndex / Math.max(totalAtTile, 1)) * Math.PI * 2
  const r = totalAtTile > 1 ? 6 : 0
  const ox = Math.cos(angle) * r
  const oy = Math.sin(angle) * r

  return (
    <motion.div
      className={styles.token}
      style={{
        backgroundColor: player.color,
        boxShadow: `0 0 8px ${player.color}`,
        marginLeft: ox,
        marginTop: oy,
      }}
      layout
      initial={false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      title={player.name}
      aria-label={`Ficha de ${player.name}`}
    >
      <span className={styles.initial}>{player.name.charAt(0).toUpperCase()}</span>
    </motion.div>
  )
}

type TokenLayerProps = {
  players: Player[]
  animPosition: number | null
  animPlayerId: Player['id'] | null
}

export function groupPlayersByTile(players: Player[], positionOverride?: Map<number, number>): Map<number, Player[]> {
  const map = new Map<number, Player[]>()
  for (const p of players) {
    if (p.eliminated) continue
    const pos = positionOverride?.has(p.id) ? positionOverride.get(p.id)! : p.position
    const list = map.get(pos) ?? []
    list.push(p)
    map.set(pos, list)
  }
  return map
}

export function TokenLayer({ players, animPosition, animPlayerId }: TokenLayerProps) {
  const override = new Map<number, number>()
  if (animPosition !== null && animPlayerId !== null) {
    override.set(animPlayerId, animPosition)
  }

  const byTile = groupPlayersByTile(players, override)

  return (
    <>
      {Array.from(byTile.entries()).flatMap(([tileIndex, tilePlayers]) =>
        tilePlayers.map((player, i) => {
          const pos = tileToGrid(tileIndex)
          const cellW = 100 / 8
          const cellH = 100 / 8
          const left = pos.col * cellW + cellW / 2
          const top = pos.row * cellH + cellH / 2

          return (
            <motion.div
              key={player.id}
              className={styles.tokenWrap}
              layout
              initial={false}
              animate={{ left: `${left}%`, top: `${top}%` }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 26,
                mass: 0.8,
              }}
            >
              <Token player={player} offsetIndex={i} totalAtTile={tilePlayers.length} />
            </motion.div>
          )
        }),
      )}
    </>
  )
}
