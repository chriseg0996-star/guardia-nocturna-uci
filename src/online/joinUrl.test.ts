import { describe, expect, it } from 'vitest'
import { parseJoinPinFromUrl } from './joinUrl'

describe('parseJoinPinFromUrl', () => {
  it('returns valid 6-digit pin', () => {
    expect(parseJoinPinFromUrl('?pin=123456')).toBe('123456')
  })

  it('rejects invalid pin', () => {
    expect(parseJoinPinFromUrl('?pin=12345')).toBeNull()
    expect(parseJoinPinFromUrl('?pin=abcdef')).toBeNull()
    expect(parseJoinPinFromUrl('')).toBeNull()
  })
})
