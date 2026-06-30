import { motion } from 'framer-motion'
import { tileToGrid } from '../../game/layout'
import type { Player } from '../../game/engine'
import styles from './Token.module.css'

type TokenProps = {
  player: Player
  offsetIndex: number
  totalAtTile: number
  isMoving: boolean
}

export function Token({ player, offsetIndex, totalAtTile, isMoving }: TokenProps) {
  const angle = (offsetIndex / Math.max(totalAtTile, 1)) * Math.PI * 2
  const r = totalAtTile > 1 ? 7 : 0
  const ox = Math.cos(angle) * r
  const oy = Math.sin(angle) * r

  return (
    <motion.div
      className={`${styles.token} ${isMoving ? styles.moving : ''}`}
      style={{
        backgroundColor: player.color,
        boxShadow: `0 0 14px ${player.color}, 0 2px 8px rgba(0,0,0,0.4)`,
        color: player.color,
        marginLeft: ox,
        marginTop: oy,
      }}
      layout
      initial={false}
      animate={{ scale: isMoving ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      title={player.name}
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

export function groupPlayersByTile(
  players: Player[],
  positionOverride?: Map<number, number>,
): Map<number, Player[]> {
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
          const isMoving = player.id === animPlayerId && animPosition !== null

          return (
            <motion.div
              key={player.id}
              className={styles.tokenWrap}
              layout
              initial={false}
              animate={{ left: `${left}%`, top: `${top}%` }}
              transition={{
                type: 'spring',
                stiffness: isMoving ? 280 : 320,
                damping: isMoving ? 24 : 26,
                mass: 0.75,
              }}
            >
              <Token
                player={player}
                offsetIndex={i}
                totalAtTile={tilePlayers.length}
                isMoving={isMoving}
              />
            </motion.div>
          )
        }),
      )}
    </>
  )
}
