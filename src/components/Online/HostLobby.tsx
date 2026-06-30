import { useMemo, useState } from 'react'
import { MIN_PLAYERS } from '../../../shared/protocol'
import { buildJoinUrl, copyToClipboard, isLocalhostOrigin } from '../../online/joinUrl'
import { useOnlineStore } from '../../online/onlineStore'
import { PlayerPeg } from '../ui/PlayerPeg'
import { JoinQr } from './JoinQr'
import styles from './Online.module.css'

type HostLobbyProps = {
  onExit: () => void
}

const STUDENT_STEPS = [
  'Escanea el QR o abre el enlace',
  'Confirma el PIN y tu nombre',
  'Espera — el presentador inicia',
] as const

const SETUP_STEPS = [
  'En la terminal del proyecto: npm run dev:aula:full',
  'En PowerShell: ipconfig → copia la IPv4 (ej. 192.168.1.45)',
  'En el navegador abre http://TU-IP:5173/guardia-nocturna-uci/ (no localhost)',
  'Pulsa Crear sala otra vez y proyecta el QR',
] as const

export function HostLobby({ onExit }: HostLobbyProps) {
  const lobby = useOnlineStore((s) => s.lobby)
  const connected = useOnlineStore((s) => s.connected)
  const error = useOnlineStore((s) => s.error)
  const startGame = useOnlineStore((s) => s.startGame)
  const leaveRoom = useOnlineStore((s) => s.leaveRoom)

  const [copied, setCopied] = useState(false)

  const playerCount = lobby?.players.filter((p) => p.connected).length ?? 0
  const canStart = playerCount >= MIN_PLAYERS
  const pin = lobby?.pin ?? ''
  const onLocalhost = isLocalhostOrigin()
  const joinUrl = useMemo(() => (pin && !onLocalhost ? buildJoinUrl(pin) : ''), [pin, onLocalhost])

  const handleCopyUrl = async () => {
    if (!joinUrl) return
    const ok = await copyToClipboard(joinUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExit = () => {
    leaveRoom()
    onExit()
  }

  return (
    <div className={`${styles.online} ${styles.hostLobby}`}>
      <div className={styles.hostBody}>
        <header className={styles.hostHeader}>
          <button type="button" className={styles.back} onClick={handleExit}>
            ← Salir
          </button>
          <div className={styles.hostHeading}>
            <h1 className={styles.title}>Modo aula</h1>
            <p className={styles.hostTagline}>
              {onLocalhost ? 'Configura la IP antes del móvil' : 'Proyecta el QR · hasta 4 jugadores'}
            </p>
          </div>
          <p className={connected ? styles.connectedInline : styles.disconnectedInline}>
            {connected ? '● OK' : '○ Off'}
          </p>
        </header>

        {error && <p className={styles.error}>{error}</p>}

        {onLocalhost ? (
          <div className={styles.localhostBlock}>
            <p className={styles.localhostTitle}>localhost no funciona en el móvil</p>
            <p className={styles.localhostLead}>
              El QR que ves apunta a este PC solamente. Los teléfonos necesitan la{' '}
              <strong>dirección IP</strong> de tu computadora en la WiFi.
            </p>
          </div>
        ) : null}

        <div className={styles.hostJoinPanel}>
          <div className={styles.pinBox}>
            <p className={styles.pinLabel}>PIN de la sala</p>
            <p className={styles.pinCode}>{pin || '······'}</p>
            {onLocalhost ? (
              <p className={styles.pinManualHint}>
                Prueba en este PC: otra ventana → Unirse con PIN → {pin}
              </p>
            ) : joinUrl ? (
              <>
                <JoinQr url={joinUrl} size={104} label="Escanea para unirte" />
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handleCopyUrl}
                  title={joinUrl}
                >
                  {copied ? '✓ Enlace copiado' : 'Copiar enlace para alumnos'}
                </button>
              </>
            ) : null}
          </div>

          <ol className={`${styles.stepsList} ${onLocalhost ? styles.stepsSetup : ''}`}>
            {(onLocalhost ? SETUP_STEPS : STUDENT_STEPS).map((step, i) => (
              <li key={step} className={styles.stepsItem}>
                <span className={styles.stepsNum}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.hostPlayers}>
          <div className={styles.lobbySectionHead}>
            <span>Jugadores</span>
            <span className={styles.lobbyCount}>
              {playerCount}/{MIN_PLAYERS}+
            </span>
          </div>
          <ul className={styles.playerList}>
            <li className={styles.playerItem}>
              <span className={styles.hostBadge}>Host</span>
              <span className={styles.playerName}>Presentador</span>
              <span className={styles.statusDot} aria-hidden="true" />
            </li>
            {lobby?.players.map((p) => (
              <li key={p.id} className={styles.playerItem}>
                <PlayerPeg color={p.color} size="sm" />
                <span className={styles.playerName}>{p.name}</span>
                {p.connected && <span className={styles.statusDot} aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.goldBtn}
          disabled={!canStart}
          onClick={startGame}
        >
          {canStart ? 'Iniciar partida' : `Faltan ${MIN_PLAYERS - playerCount} jugador(es)`}
        </button>
      </footer>
    </div>
  )
}
