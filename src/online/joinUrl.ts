/** Build join deep-link and parse ?pin= from the current page. */

export function buildJoinUrl(pin: string): string {
  const base = import.meta.env.BASE_URL
  const path = base.endsWith('/') ? base : `${base}/`
  const url = new URL(path, window.location.origin)
  url.searchParams.set('pin', pin)
  return url.href
}

export function parseJoinPinFromUrl(search = window.location.search): string | null {
  const pin = new URLSearchParams(search).get('pin')?.trim()
  return pin && /^\d{6}$/.test(pin) ? pin : null
}

export function isLocalhostOrigin(): boolean {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]'
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
