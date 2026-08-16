import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LandingNav from '../LandingNav.vue'
import LandingHero from '../LandingHero.vue'

vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

const stubs = {
  LocaleSwitcher: true,
  // vue-i18n is mocked above, so its <i18n-t> component is not registered.
  'i18n-t': { template: '<span><slot /></span>' },
  RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' }
}

describe('landing navigation targets', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('leaves no href="#" dead ends in the nav', () => {
    const w = mount(LandingNav, { props: { hasPricing: true }, global: { stubs } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).not.toContain('#')
    expect(hrefs.length).toBeGreaterThan(0)
  })

  it('points the model-board and pricing entries at the board section', () => {
    const w = mount(LandingNav, { props: { hasPricing: true }, global: { stubs } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs.filter((h) => h === '#board')).toHaveLength(2)
    expect(hrefs).toContain('#faq')
  })

  it('hides the board links when the board has no rows to scroll to', () => {
    const w = mount(LandingNav, { props: { hasPricing: false }, global: { stubs } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).not.toContain('#board')
    // The FAQ section always renders, so its entry always stays.
    expect(hrefs).toContain('#faq')
  })

  it('keeps log-in and get-API-key on the real auth routes', () => {
    const w = mount(LandingNav, { props: { hasPricing: true }, global: { stubs } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/login')
    expect(hrefs).toContain('/register')
  })

  it('scrolls rather than letting the raw hash navigate', async () => {
    const target = document.createElement('div')
    target.id = 'board'
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView
    document.body.appendChild(target)

    const w = mount(LandingNav, { props: { hasPricing: true }, global: { stubs } })
    await w.findAll('a[href="#board"]')[0].trigger('click')

    expect(scrollIntoView).toHaveBeenCalled()
    document.body.removeChild(target)
  })
})

describe('LandingHero secondary CTA', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('scrolls to the pricing board instead of href="#"', () => {
    const w = mount(LandingHero, { props: { hasPricing: true }, global: { stubs } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).not.toContain('#')
    expect(hrefs).toContain('#board')
  })

  it('is hidden when there is no board to point at', () => {
    const w = mount(LandingHero, { props: { hasPricing: false }, global: { stubs } })
    expect(w.html()).not.toContain('landing.hero.ctaSecondary')
  })
})
