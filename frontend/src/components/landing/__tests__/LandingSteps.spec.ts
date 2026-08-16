import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LandingSteps from '../LandingSteps.vue'
import { useAppStore } from '@/stores/app'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    // Echo the key plus any interpolated values so assertions can see both.
    useI18n: () => ({
      t: (key: string, named?: Record<string, unknown>) =>
        named ? `${key}(${JSON.stringify(named)})` : key
    })
  }
})

describe('LandingSteps code snippet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('never prints the old hardcoded host or key prefix', () => {
    const w = mount(LandingSteps, { props: { modelCount: null } })
    // Both were wrong for every deployment but one: this is an open-source
    // gateway, and the repo's configured default key prefix is "sk-".
    expect(w.html()).not.toContain('api.trumcheat.dev')
    expect(w.html()).not.toContain('tc-')
  })

  it('uses the operator-configured public API base URL when there is one', () => {
    const appStore = useAppStore()
    appStore.apiBaseUrl = 'https://gateway.example.com'

    const w = mount(LandingSteps, { props: { modelCount: null } })
    expect(w.text()).toContain('https://gateway.example.com/v1')
  })

  it('strips a trailing slash rather than emitting a doubled one', () => {
    const appStore = useAppStore()
    appStore.apiBaseUrl = 'https://gateway.example.com/'

    const w = mount(LandingSteps, { props: { modelCount: null } })
    expect(w.text()).toContain('https://gateway.example.com/v1')
    expect(w.text()).not.toContain('.com//v1')
  })

  it("falls back to the browser's own origin, which is where the gateway is served from", () => {
    const w = mount(LandingSteps, { props: { modelCount: null } })
    expect(w.text()).toContain(`${window.location.origin}/v1`)
  })

  it('shows the repo default key prefix', () => {
    const w = mount(LandingSteps, { props: { modelCount: null } })
    expect(w.text()).toContain('sk-')
  })

  it('names the gateway from settings instead of a hardcoded brand', () => {
    const appStore = useAppStore()
    appStore.siteName = 'Example Gateway'

    const w = mount(LandingSteps, { props: { modelCount: null } })
    expect(w.html()).toContain('Example Gateway')
  })
})
