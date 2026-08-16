import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingSupport from '../LandingSupport.vue'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

describe('LandingSupport', () => {
  it('shows no external-link glyph on cards that are not links', () => {
    const w = mount(LandingSupport)
    // The three channel cards are plain <div>s with no href; an "↗" on them
    // promised a click target that never existed.
    expect(w.text()).not.toContain('↗')
    expect(w.findAll('a')).toHaveLength(0)
  })

  it('makes no claim about a status page or incident history', () => {
    const w = mount(LandingSupport)
    // Neither exists in this deployment or any other; the claim went the same
    // way as the invented "99,98%" uptime figure that used to sit beside it.
    expect(w.html()).not.toContain('landing.support.sla')
  })

  it('still renders the three real support channels', () => {
    const w = mount(LandingSupport)
    expect(w.html()).toContain('landing.support.telegram.title')
    expect(w.html()).toContain('landing.support.zalo.title')
    expect(w.html()).toContain('landing.support.email.title')
  })
})
