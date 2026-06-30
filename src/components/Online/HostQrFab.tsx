import { useMemo, useState } from 'react'
import { buildJoinUrl } from '../../online/joinUrl'
import { useOnlineStore } from '../../online/onlineStore'
import { JoinQr } from '../Online/JoinQr'
import styles from './HostQrFab.module.css'

export function HostQrFab() {
  const [open, setOpen] = useState(false)
  const pin = useOnlineStore((s) => s.lobby?.pin ?? s.sync?.pin ?? s.game?.pin ?? '')

  const joinUrl = useMemo(() => (pin ? buildJoinUrl(pin) : ''), [pin])
  if (!pin || !joinUrl) return null

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Mostrar QR para unirse"
      >
        {open ? '✕' : 'QR'}
      </button>
      {open && (
        <div className={styles.pop}>
          <p className={styles.pin}>PIN {pin}</p>
          <JoinQr url={joinUrl} size={120} />
          <p className={styles.hint}>Escanea para unirte tarde</p>
        </div>
      )}
    </>
  )
}
