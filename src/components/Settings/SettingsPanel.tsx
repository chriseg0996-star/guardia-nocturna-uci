import type { GameSettings } from '../../game/engine'
import styles from './SettingsPanel.module.css'

const TIMER_OPTIONS = [15, 30, 45, 60] as const

type SettingsPanelProps = {
  settings: GameSettings
  onChange: (partial: Partial<GameSettings>) => void
  compact?: boolean
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleHint}>{hint}</div>
      </div>
      <button
        type="button"
        className={`${styles.switch} ${checked ? styles.switchOn : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
    </div>
  )
}

export function SettingsPanel({ settings, onChange, compact = false }: SettingsPanelProps) {
  const wouldBlockWin = !settings.winUciMaster && !settings.winSurvival

  return (
    <div>
      <Toggle
        label="Temporizador por pregunta"
        hint={compact ? `${settings.timerSeconds}s por carta` : 'Cuenta atrás al responder (hot-seat)'}
        checked={settings.timerEnabled}
        onChange={(timerEnabled) => onChange({ timerEnabled })}
      />

      {settings.timerEnabled && (
        <div className={styles.timerRow} role="group" aria-label="Segundos del temporizador">
          {TIMER_OPTIONS.map((sec) => (
            <button
              key={sec}
              type="button"
              className={`${styles.timerBtn} ${settings.timerSeconds === sec ? styles.timerBtnActive : ''}`}
              onClick={() => onChange({ timerSeconds: sec })}
            >
              {sec}s
            </button>
          ))}
        </div>
      )}

      {!compact && (
        <>
          <Toggle
            label="Victoria UCI Master"
            hint="Gana quien consiga los 8 sellos de categoría"
            checked={settings.winUciMaster}
            onChange={(winUciMaster) => {
              if (!winUciMaster && !settings.winSurvival) return
              onChange({ winUciMaster })
            }}
          />
          <Toggle
            label="Victoria por supervivencia"
            hint="Gana el último jugador con vidas"
            checked={settings.winSurvival}
            onChange={(winSurvival) => {
              if (!winSurvival && !settings.winUciMaster) return
              onChange({ winSurvival })
            }}
          />
          <Toggle
            label="Sonido"
            hint="Efectos al tirar dado y eventos (sin autoplay)"
            checked={settings.soundEnabled}
            onChange={(soundEnabled) => onChange({ soundEnabled })}
          />
        </>
      )}

      {wouldBlockWin && (
        <p className={styles.warn}>Activa al menos una condición de victoria.</p>
      )}

      {!settings.timerEnabled && !compact && (
        <p className={styles.warn} style={{ borderColor: 'var(--line)', color: 'var(--fd)', background: 'transparent' }}>
          Timer desactivado — modo revelar sin presión de tiempo.
        </p>
      )}
    </div>
  )
}
