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
})
