import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FlapText from '../FlapText.vue'

function stubReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query, onchange: null,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
  }))
}

describe('FlapText', () => {
  beforeEach(() => stubReducedMotion(false))

  it('renders one tile per character', () => {
    const w = mount(FlapText, { props: { text: 'ABC' } })
    expect(w.findAll('.flap')).toHaveLength(3)
  })

  it('marks spaces as spacer tiles', () => {
    const w = mount(FlapText, { props: { text: 'A B' } })
    expect(w.findAll('.flap--space')).toHaveLength(1)
  })

  it('shows the target text immediately when reduced motion is requested', async () => {
    stubReducedMotion(true)
    const w = mount(FlapText, { props: { text: 'GPT', animate: true } })
    await w.vm.$nextTick()
    expect(w.text().replace(/\s/g, '')).toBe('GPT')
  })

  it('settles on the target text even when animating', async () => {
    vi.useFakeTimers()
    const w = mount(FlapText, { props: { text: 'GPT', animate: true } })
    vi.advanceTimersByTime(5000)
    await w.vm.$nextTick()
    expect(w.text().replace(/\s/g, '')).toBe('GPT')
    vi.useRealTimers()
  })

  it('updates when the text prop changes', async () => {
    const w = mount(FlapText, { props: { text: 'AB' } })
    await w.setProps({ text: 'XYZ' })
    expect(w.findAll('.flap')).toHaveLength(3)
  })
})
