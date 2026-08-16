import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingStatusStrip from '../LandingStatusStrip.vue'

// Same pattern as the other landing/* specs: return the key itself so
// assertions can check on the raw key path rather than translated copy.
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

describe('LandingStatusStrip', () => {
  it('claims operational only when the uptime data says so', () => {
    const w = mount(LandingStatusStrip, {
      props: { uptimeText: '99,93%', ttftText: '< 1,0 s', statusLevel: 'operational' }
    })
    expect(w.html()).toContain('landing.strip.status')
    expect(w.html()).not.toContain('landing.strip.statusDegraded')
    expect(w.find('[data-testid="status-dot"]').classes().join(' ')).toContain('--lp-ok')
  })

  it('reports degraded service instead of claiming everything is fine', () => {
    // The regression this guards: the dot and "all systems operational" used to
    // be unconditional markup, so a 72% ratio rendered
    // "all systems operational · 72,00% uptime" — a green light contradicted by
    // the number printed beside it.
    const w = mount(LandingStatusStrip, {
      props: { uptimeText: '72,00%', ttftText: null, statusLevel: 'degraded' }
    })
    expect(w.html()).toContain('landing.strip.statusDegraded')
    expect(w.html()).not.toContain('>landing.strip.status<')
    expect(w.find('[data-testid="status-dot"]').classes().join(' ')).toContain('--lp-warn')
  })

  it('renders no light and no status text when there is no uptime data', () => {
    const w = mount(LandingStatusStrip, {
      props: { uptimeText: null, ttftText: null, statusLevel: null }
    })
    expect(w.find('[data-testid="status-dot"]').exists()).toBe(false)
    expect(w.html()).not.toContain('landing.strip.status')
    // The cell itself stays in the layout; only its unbacked contents go.
    expect(w.find('[data-testid="status-cell"]').text()).toBe('')
  })

  it('describes the latency figure as TTFT, matching the stat tile', () => {
    const w = mount(LandingStatusStrip, {
      props: { uptimeText: null, ttftText: '< 1,0 s', statusLevel: null }
    })
    // The abolished label was "gateway latency": nothing measures gateway
    // overhead, and the stat tile calls the same number "24h median TTFT".
    expect(w.html()).toContain('landing.strip.latencyTtft')
  })

  it('omits the ttft clause entirely when there is no measurement', () => {
    const w = mount(LandingStatusStrip, {
      props: { uptimeText: null, ttftText: null, statusLevel: null }
    })
    expect(w.html()).not.toContain('landing.strip.latencyTtft')
  })
})
