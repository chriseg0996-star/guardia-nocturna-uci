import { motion } from 'framer-motion'
import { tileToPercent } from '../../game/layout'
import type { Player } from '../../game/engine'
import { PlayerPeg } from '../ui/PlayerPeg'
import styles from './Token.module.css'

type TokenProps = {
  player: Player
  offsetIndex: number
  totalAtTile: number
  isMoving: boolean
  isActiveTurn: boolean
}

export function Token({ player, offsetIndex, totalAtTile, isMoving, isActiveTurn }: TokenProps) {
  const angle = (offsetIndex / Math.max(totalAtTile, 1)) * Math.PI * 2
  const r = totalAtTile > 1 ? 7 : 0
  const ox = Math.cos(angle) * r
  const oy = Math.sin(angle) * r

  return (
    <motion.div
      className={`${styles.tokenWrap} ${isMoving ? styles.moving : ''} ${isActiveTurn ? styles.activeTurn : ''}`}
      style={{ marginLeft: ox, marginTop: oy }}
      layout
      initial={false}
      animate={{ scale: isMoving ? 1.12 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      title={player.name}
    >
      <PlayerPeg
        color={player.color}
        size="lg"
        label={player.name.charAt(0).toUpperCase()}
      />
    </motion.div>
  )
}

type TokenLayerProps = {
  players: Player[]
  animPosition: number | null
  animPlayerId: Player['id'] | null
  activePlayerId: Player['id'] | null
}

export function groupPlayersByTile(
  players: Player[],
  positionOverride?: Map<Player['id'], number>,
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

export function TokenLayer({
  players,
  animPosition,
  animPlayerId,
  activePlayerId,
}: TokenLayerProps) {
  const override = new Map<Player['id'], number>()
  if (animPosition !== null && animPlayerId !== null) {
    override.set(animPlayerId, animPosition)
  }

  const byTile = groupPlayersByTile(players, override)

  return (
    <>
      {Array.from(byTile.entries()).flatMap(([tileIndex, tilePlayers]) =>
        tilePlayers.map((player, i) => {
          const { x, y } = tileToPercent(tileIndex)
          const isMoving = player.id === animPlayerId && animPosition !== null

          return (
            <motion.div
              key={player.id}
              className={styles.anchor}
              layout
              initial={false}
              animate={{ left: `${x}%`, top: `${y}%` }}
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
                isActiveTurn={player.id === activePlayerId}
              />
            </motion.div>
          )
        }),
      )}
    </>
  )
}
