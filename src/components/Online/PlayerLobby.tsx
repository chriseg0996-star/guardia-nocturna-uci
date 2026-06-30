import { MIN_PLAYERS } from '../../../shared/protocol'
import { useOnlineStore } from '../../online/onlineStore'
import { PlayerPeg } from '../ui/PlayerPeg'
import styles from './Online.module.css'

type PlayerLobbyProps = {
  onExit: () => void
}

export function PlayerLobby({ onExit }: PlayerLobbyProps) {
  const lobby = useOnlineStore((s) => s.lobby)
  const yourPlayerId = useOnlineStore((s) => s.yourPlayerId)
  const connected = useOnlineStore((s) => s.connected)
  const leaveRoom = useOnlineStore((s) => s.leaveRoom)

  const you = lobby?.players.find((p) => p.id === yourPlayerId)
  const playerCount = lobby?.players.filter((p) => p.connected).length ?? 0
  const ready = playerCount >= MIN_PLAYERS

  const handleExit = () => {
    leaveRoom()
    onExit()
  }

  return (
    <div className={styles.online}>
      <div className={styles.scroll}>
        <div className={styles.topBar}>
          <button type="button" className={styles.back} onClick={handleExit}>
            ← Salir
          </button>
          <p className={connected ? styles.connectedInline : styles.disconnectedInline}>
            {connected ? `● PIN ${lobby?.pin}` : '○ Reconectando…'}
          </p>
        </div>

        <h1 className={styles.title}>¡Estás dentro!</h1>

        {you && (
          <div className={styles.waitCard}>
            <PlayerPeg color={you.color} size="md" label={you.name.charAt(0).toUpperCase()} />
            <p className={styles.playerName} style={{ marginTop: 10 }}>
              {you.name}
            </p>
            <p className={styles.waitCardLead}>
              {ready
                ? 'Listo para jugar — el presentador puede iniciar.'
                : 'Esperando más compañeros…'}
            </p>
          </div>
        )}

        <div className={styles.studentTips}>
          <p className={styles.studentTipsTitle}>Mientras tanto</p>
          <ul>
            <li>Mira el tablero en la pantalla del aula</li>
            <li>No cierres esta pestaña</li>
            <li>Cuando empiece, tira el dado en tu turno</li>
          </ul>
        </div>

        <div className={styles.lobbySectionHead}>
          <span>En la sala</span>
          <span className={styles.lobbyCount}>
            {playerCount}/{MIN_PLAYERS}+
          </span>
        </div>

        <ul className={styles.playerList}>
          {lobby?.players.map((p) => (
            <li key={p.id} className={styles.playerItem}>
              <PlayerPeg color={p.color} size="sm" />
              <span className={styles.playerName}>
                {p.name}
                {p.id === yourPlayerId ? ' (tú)' : ''}
              </span>
              {p.connected && <span className={styles.statusDot} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
