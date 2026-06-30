import { QRCodeSVG } from 'qrcode.react'
import styles from './Online.module.css'

type JoinQrProps = {
  url: string
  size?: number
  label?: string
}

export function JoinQr({ url, size = 168, label = 'Escanea para unirte' }: JoinQrProps) {
  return (
    <div className={styles.qrBlock}>
      <div className={styles.qrFrame}>
        <QRCodeSVG
          value={url}
          size={size}
          level="M"
          bgColor="#070d18"
          fgColor="#f2c14e"
          marginSize={1}
          title={label}
        />
      </div>
      <p className={styles.qrLabel}>{label}</p>
    </div>
  )
}
