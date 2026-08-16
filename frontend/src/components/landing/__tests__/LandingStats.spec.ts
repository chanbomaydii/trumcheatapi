import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LandingStats from '../LandingStats.vue'
import * as api from '@/api/publicStatus'

vi.mock('@/api/publicStatus')

// LandingStats calls useI18n() directly in <script setup> (matching the other
// landing/* components), which requires an installed i18n plugin unless the
// module itself is mocked. Same pattern as LandingPriceBoard.spec.ts: return
// the key itself so assertions can check on the raw key path.
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

describe('LandingStats', () => {
  beforeEach(() => vi.resetAllMocks())

  it('shows four tiles when every metric is available', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: 0.9993 },
      ttft: { window_hours: 24, upper_bound_ms: 1000, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const w = mount(LandingStats, { props: { modelCount: 41 } })
    await flushPromises()
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(4)
  })

  it('hides the uptime and ttft tiles when the endpoint has no data', async () => {
    vi.mocked(api.getPublicStatus).mockResolvedValue({
      uptime: { window_days: 30, ratio: null },
      ttft: { window_hours: 24, upper_bound_ms: null, bucketed: true },
      computed_at: '2026-08-16T04:12:38Z'
    })
    const w = mount(LandingStats, { props: { modelCount: 41 } })
    await flushPromises()
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(2)
    expect(w.text()).not.toContain('0%')
  })

  it('hides the model tile when the count is unknown', async () => {
    vi.mocked(api.getPublicStatus).mockRejectedValue(new Error('404'))
    const w = mount(LandingStats, { props: { modelCount: null } })
    await flushPromises()
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(1)
  })
})
