import { HostLobby } from './HostLobby'
import { HostOnlineGame } from './HostOnlineGame'
import { PlayerJoin } from './PlayerJoin'
import { PlayerLobby } from './PlayerLobby'
import { PlayerOnlineGame } from './PlayerOnlineGame'
import { useOnlineStore } from '../../online/onlineStore'

type OnlineFlowProps = {
  onExit: () => void
}

export function OnlineFlow({ onExit }: OnlineFlowProps) {
  const screen = useOnlineStore((s) => s.screen)

  switch (screen) {
    case 'host-lobby':
      return <HostLobby onExit={onExit} />
    case 'join':
      return <PlayerJoin onExit={onExit} />
    case 'player-lobby':
      return <PlayerLobby onExit={onExit} />
    case 'host-game':
      return <HostOnlineGame />
    case 'player-game':
      return <PlayerOnlineGame />
    default:
      return null
  }
}
