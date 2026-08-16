import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingStats from '../LandingStats.vue'

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

// Purely presentational now — LandingDefault owns the /public/status fetch and
// passes the formatted figures down — so these specs supply the prop values
// directly. The formatting and the null-on-failure behaviour behind them is
// covered by composables/__tests__/useLandingStatus.spec.ts.
describe('LandingStats', () => {
  it('shows four tiles when every metric is available', () => {
    const w = mount(LandingStats, {
      props: { modelCount: 41, uptimeText: '99,93%', ttftText: '< 1,0 s' }
    })
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(4)
  })

  it('hides the uptime and ttft tiles when the endpoint has no data', () => {
    const w = mount(LandingStats, {
      props: { modelCount: 41, uptimeText: null, ttftText: null }
    })
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(2)
    expect(w.text()).not.toContain('0%')
  })

  it('hides the entire strip when only one tile would survive', () => {
    const w = mount(LandingStats, {
      props: { modelCount: null, uptimeText: null, ttftText: null }
    })
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(0)
    expect(w.find('.lp-root').exists()).toBe(false)
  })

  it('shows the strip with two tiles when exactly two metrics survive', () => {
    const w = mount(LandingStats, {
      props: { modelCount: 41, uptimeText: null, ttftText: null }
    })
    expect(w.findAll('[data-testid="stat-tile"]')).toHaveLength(2)
    expect(w.find('.lp-root').exists()).toBe(true)
  })
})
