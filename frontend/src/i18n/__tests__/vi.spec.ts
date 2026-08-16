import { describe, it, expect } from 'vitest'
import en from '../locales/en'
import vi from '../locales/vi'
import { availableLocales, i18n } from '../index'

function keyPaths(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('vi locale', () => {
  it('is offered in the switcher', () => {
    expect(availableLocales.map((l) => l.code)).toContain('vi')
  })

  // The vi locale is deliberately partial: it covers only customer-facing
  // namespaces (landing, common, dashboard, channelMonitorV2, batchImage,
  // misc) and intentionally does NOT translate the operator-only `admin`
  // namespace. So unlike a "full parity" locale, we only assert full parity
  // for the `landing` namespace, which the new landing page depends on.
  it('covers every key path under "landing" that English defines', () => {
    const enLandingPaths = keyPaths((en as any).landing, 'landing.')
    const viLandingPaths = keyPaths((vi as any).landing, 'landing.')
    const missing = enLandingPaths.filter((k) => !viLandingPaths.includes(k))
    expect(missing).toEqual([])
  })

  it('defines the six new landing keys the departure-board page uses', () => {
    const paths = keyPaths(vi)
    for (const k of [
      'landing.stats.models',
      'landing.stats.uptime',
      'landing.stats.ttft',
      'landing.stats.formats',
      'landing.board.liveLabel',
      'landing.board.referenceLabel'
    ]) {
      expect(paths).toContain(k)
    }
  })

  it('does NOT claim full parity with English (admin namespace is out of scope)', () => {
    // English still has the operator-only `admin` namespace; vi does not.
    expect((en as any).admin).toBeTruthy()
    expect((vi as any).admin).toBeUndefined()
  })

  it('falls back to English, never to a raw dotted key path, for keys vi does not define', () => {
    expect(i18n.global.fallbackLocale.value).toBe('en')
  })
})
