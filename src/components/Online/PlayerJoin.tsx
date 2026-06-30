import { useEffect, useState } from 'react'
import { parseJoinPinFromUrl } from '../../online/joinUrl'
import { useOnlineStore } from '../../online/onlineStore'
import styles from './Online.module.css'

type PlayerJoinProps = {
  onExit: () => void
}

export function PlayerJoin({ onExit }: PlayerJoinProps) {
  const joinRoom = useOnlineStore((s) => s.joinRoom)
  const error = useOnlineStore((s) => s.error)

  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fromQr, setFromQr] = useState(false)

  useEffect(() => {
    const detected = parseJoinPinFromUrl()
    if (detected) {
      setPin(detected)
      setFromQr(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.trim().length < 6 || !name.trim()) return
    setLoading(true)
    await joinRoom(pin, name)
    setLoading(false)
  }

  return (
    <div className={styles.online}>
      <div className={styles.scroll}>
        <div className={styles.topBar}>
          <button type="button" className={styles.back} onClick={onExit}>
            ← Volver
          </button>
        </div>

        <h1 className={styles.title}>Unirse a la guardia</h1>

        <ol className={styles.stepsListCompact}>
          <li className={fromQr ? styles.stepsDone : undefined}>
            {fromQr ? '✓ PIN del QR detectado' : 'Pide el PIN al presentador'}
          </li>
          <li>Escribe tu nombre</li>
          <li>Pulsa Entrar y espera en la sala</li>
        </ol>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="pin">
              PIN (6 dígitos)
            </label>
            <input
              id="pin"
              className={styles.pinInput}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setFromQr(false)
                setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
              }}
              placeholder="000000"
              autoComplete="off"
              autoFocus={!fromQr}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="name">
              Tu nombre
            </label>
            <input
              id="name"
              className={styles.textInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Ana, Residente 2…"
              maxLength={24}
              autoComplete="name"
              autoFocus={fromQr}
            />
          </div>

          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={loading || pin.length < 6 || !name.trim()}
          >
            {loading ? 'Conectando…' : 'Entrar a la sala'}
          </button>
        </form>
      </div>
    </div>
  )
}
