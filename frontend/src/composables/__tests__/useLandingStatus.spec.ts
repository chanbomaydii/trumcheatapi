import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLandingStatus } from '../useLandingStatus'
import * as api from '@/api/publicStatus'

vi.mock('@/api/publicStatus')

describe('useLandingStatus', () => {
  beforeEach(() => vi.resetAllMocks())

  it('formats uptime as a two-decimal percentage', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: 0.9993 },
      ttft: { window_hours: 24, upper_bound_ms: 1000, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const s = useLandingStatus()
    await s.load()
    expect(s.uptimeText.value).toBe('99,93%')
  })

  it('renders bucketed ttft as an upper bound in seconds', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: 0.99 },
      ttft: { window_hours: 24, upper_bound_ms: 1000, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const s = useLandingStatus()
    await s.load()
    expect(s.ttftText.value).toBe('< 1,0 s')
  })

  it('renders sub-second bounds in milliseconds', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: 0.99 },
      ttft: { window_hours: 24, upper_bound_ms: 500, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const s = useLandingStatus()
    await s.load()
    expect(s.ttftText.value).toBe('< 500 ms')
  })

  it('yields null when the endpoint reports no data', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: null },
      ttft: { window_hours: 24, upper_bound_ms: null, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const s = useLandingStatus()
    await s.load()
    expect(s.uptimeText.value).toBeNull()
    expect(s.ttftText.value).toBeNull()
  })

  it('yields null when the endpoint is disabled (404)', async () => {
    vi.mocked(api.getPublicStatus).mockRejectedValue(new Error('404'))
    const s = useLandingStatus()
    await s.load()
    expect(s.uptimeText.value).toBeNull()
    expect(s.ttftText.value).toBeNull()
  })

  describe('genuine zeroes survive the null coalescing', () => {
    // `?? null` is load-bearing here and `|| null` would pass every other test
    // in this file. A total outage reports ratio: 0 — exactly the moment the
    // uptime tile exists to report — and `||` would silently blank it, turning
    // the worst possible reading into "no data".
    it('renders ratio: 0 as 0,00% rather than hiding the tile', async () => {
      vi.mocked(api.getPublicStatus).mockResolvedValue({
        uptime: { window_days: 30, ratio: 0 },
        ttft: { window_hours: 24, upper_bound_ms: null, bucketed: true },
        computed_at: '2026-08-16T04:12:38Z'
      })
      const s = useLandingStatus()
      await s.load()
      expect(s.uptimeText.value).toBe('0,00%')
      expect(s.uptimeText.value).not.toBeNull()
      // And a total outage must never light the green "operational" dot.
      expect(s.statusLevel.value).toBe('degraded')
    })

    it('renders upper_bound_ms: 0 rather than hiding the tile', async () => {
      vi.mocked(api.getPublicStatus).mockResolvedValue({
        uptime: { window_days: 30, ratio: null },
        ttft: { window_hours: 24, upper_bound_ms: 0, bucketed: true },
        computed_at: '2026-08-16T04:12:38Z'
      })
      const s = useLandingStatus()
      await s.load()
      expect(s.ttftText.value).toBe('< 0 ms')
      expect(s.ttftText.value).not.toBeNull()
    })
  })

  describe('statusLevel', () => {
    async function levelFor(ratio: number | null) {
      vi.mocked(api.getPublicStatus).mockResolvedValue({
        uptime: { window_days: 30, ratio },
        ttft: { window_hours: 24, upper_bound_ms: null, bucketed: true },
        computed_at: '2026-08-16T04:12:38Z'
      })
      const s = useLandingStatus()
      await s.load()
      return s.statusLevel.value
    }

    it('is operational at or above the 99% bar', async () => {
      expect(await levelFor(0.9993)).toBe('operational')
      expect(await levelFor(0.99)).toBe('operational')
    })

    it('is degraded below it, so the light cannot contradict the number', async () => {
      // 0.72 is the case the review called out: the strip would otherwise read
      // "all systems operational · 72,00% uptime".
      expect(await levelFor(0.72)).toBe('degraded')
      expect(await levelFor(0.9899)).toBe('degraded')
    })

    it('is null with no measurement — neither a claim of health nor of trouble', async () => {
      expect(await levelFor(null)).toBeNull()

      vi.mocked(api.getPublicStatus).mockRejectedValue(new Error('404'))
      const s = useLandingStatus()
      await s.load()
      expect(s.statusLevel.value).toBeNull()
    })
  })
})
