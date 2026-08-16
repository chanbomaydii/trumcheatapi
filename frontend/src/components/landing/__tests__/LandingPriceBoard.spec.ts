import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingPriceBoard from '../LandingPriceBoard.vue'
import type { BoardRow } from '@/composables/useLandingBoard'

// LandingPriceBoard calls useI18n() directly (matching the other landing/*
// components), which requires an installed i18n plugin unless the module
// itself is mocked. Same pattern already used by HomeView.compact.spec.ts:
// return the key itself so assertions can check on the raw key path.
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-i18n')>()
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

const mountOpts = {
  global: {
    stubs: { FlapText: { props: ['text'], template: '<span>{{ text }}</span>' } }
  }
}

// The component is purely presentational now — LandingDefault owns the fetch and
// passes rows down — so these specs supply BoardRow values directly instead of
// mocking /model-plaza. The price maths that produces those values (rate
// multipliers, saving percentage, filtering, fallback) is covered end to end by
// composables/__tests__/useLandingBoard.spec.ts; nothing is lost by not routing
// this component's rendering assertions through it.
function row(overrides: Partial<BoardRow> = {}): BoardRow {
  return {
    name: 'claude-opus-5',
    platform: 'anthropic',
    inputOfficial: 15,
    inputActual: 4.2,
    outputOfficial: 75,
    outputActual: 21,
    savingPct: 72,
    ...overrides
  }
}

describe('LandingPriceBoard', () => {
  it('renders a row per model with both prices, name uppercased via FlapText', () => {
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: { rows: [row()], usingFallback: false }
    })

    // Names are routed through FlapText uppercased, so assert the uppercase form.
    expect(w.text()).toContain('CLAUDE-OPUS-5')
    expect(w.text()).toContain('21.00')
    expect(w.text()).toContain('72')
  })

  it('labels the board as live data when the rows came from the endpoint', () => {
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: { rows: [row()], usingFallback: false }
    })
    expect(w.html()).toContain('landing.board.liveLabel')
    expect(w.html()).not.toContain('landing.board.referenceLabel')
  })

  it('flags the board as reference data when the endpoint is off', () => {
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: { rows: [row()], usingFallback: true }
    })
    expect(w.html()).toContain('landing.board.referenceLabel')
    expect(w.html()).not.toContain('landing.board.liveLabel')
  })

  it('hides the saving badge when official pricing is missing, row still renders', () => {
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: {
        rows: [row({ name: 'no-ref', platform: 'x', inputOfficial: null, outputOfficial: null, savingPct: null })],
        usingFallback: false
      }
    })
    expect(w.text()).toContain('NO-REF')
    expect(w.find('[data-testid="saving-badge"]').exists()).toBe(false)
  })

  it('renders nothing when the API succeeds but every row is filtered out', () => {
    // A non-empty group list with nothing usable inside is a legitimate
    // zero-row result, NOT a fallback (see useLandingBoard).
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: { rows: [], usingFallback: false }
    })

    // No board header, no table, no fallback relabel — the section must not exist at all.
    expect(w.html()).not.toContain('landing.board.liveLabel')
    expect(w.html()).not.toContain('landing.board.referenceLabel')
    expect(w.find('table').exists()).toBe(false)
    expect(w.find('section').exists()).toBe(false)
  })

  it('labels the saving column/badge as measuring the output price specifically', () => {
    const w = mount(LandingPriceBoard, {
      ...mountOpts,
      props: { rows: [row()], usingFallback: false }
    })

    // The bare percentage alone would read as a whole-row claim; the wording
    // must name the output price specifically (see useLandingBoard.ts comment).
    expect(w.html()).toContain('landing.board.columns.savingOutput')
    expect(w.find('[data-testid="saving-badge"]').exists()).toBe(true)
  })
})
