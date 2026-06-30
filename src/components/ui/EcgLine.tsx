import styles from './EcgLine.module.css'

export function EcgLine() {
  const path =
    'M0 14 H20 L25 14 L28 6 L32 22 L36 14 H60 L65 14 L68 10 L72 18 L76 14 H100'

  return (
    <div className={styles.ecg} aria-hidden="true">
      <div className={styles.track}>
        {[0, 1].map((i) => (
          <svg key={i} className={styles.line} width="200" height="28" viewBox="0 0 100 28">
            <path
              d={path}
              fill="none"
              stroke="var(--cy)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
        ))}
      </div>
    </div>
  )
}
