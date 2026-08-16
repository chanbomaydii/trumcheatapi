import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LandingPriceBoard from '../LandingPriceBoard.vue'
import * as api from '@/api/modelPlaza'

vi.mock('@/api/modelPlaza')

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

describe('LandingPriceBoard', () => {
  beforeEach(() => vi.resetAllMocks())

  it('renders a row per model with both prices, name uppercased via FlapText', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [{
        id: 1, name: 'g', description: '', platform: 'anthropic', subscription_type: 'standard',
        rate_multiplier: 0.28, peak_rate_enabled: false, peak_start: '', peak_end: '',
        peak_rate_multiplier: 1, is_exclusive: false, image_rate_independent: false,
        image_rate_multiplier: 1,
        models: [{
          name: 'claude-opus-5', platform: 'anthropic',
          pricing: { billing_mode: 'token', input_price: 15, output_price: 75, cache_write_price: null, cache_read_price: null, image_input_price: null, image_output_price: null, per_request_price: null, intervals: [] },
          official_pricing: { input_price: 15, output_price: 75, cache_write_price: null, cache_read_price: null }
        }]
      }]
    } as any)

    const w = mount(LandingPriceBoard, mountOpts)
    await flushPromises()

    // Names are routed through FlapText uppercased, so assert the uppercase form.
    expect(w.text()).toContain('CLAUDE-OPUS-5')
    expect(w.text()).toContain('21.00')
    expect(w.text()).toContain('72')
  })

  it('flags the board as reference data when the endpoint is off', async () => {
    vi.mocked(api.getModelPlaza).mockRejectedValue(new Error('404'))
    const w = mount(LandingPriceBoard, mountOpts)
    await flushPromises()
    expect(w.html()).toContain('landing.board.referenceLabel')
    expect(w.html()).not.toContain('landing.board.liveLabel')
  })

  it('hides the saving badge when official pricing is missing, row still renders', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [{
        id: 1, name: 'g', description: '', platform: 'x', subscription_type: 'standard',
        rate_multiplier: 0.5, peak_rate_enabled: false, peak_start: '', peak_end: '',
        peak_rate_multiplier: 1, is_exclusive: false, image_rate_independent: false,
        image_rate_multiplier: 1,
        models: [{
          name: 'no-ref', platform: 'x',
          pricing: { billing_mode: 'token', input_price: 2, output_price: 4, cache_write_price: null, cache_read_price: null, image_input_price: null, image_output_price: null, per_request_price: null, intervals: [] },
          official_pricing: null
        }]
      }]
    } as any)

    const w = mount(LandingPriceBoard, mountOpts)
    await flushPromises()
    expect(w.text()).toContain('NO-REF')
    expect(w.find('[data-testid="saving-badge"]').exists()).toBe(false)
  })

  it('renders nothing when the API succeeds but every row is filtered out', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [{
        id: 1, name: 'g', description: '', platform: 'x', subscription_type: 'standard',
        rate_multiplier: 0.5, peak_rate_enabled: false, peak_start: '', peak_end: '',
        peak_rate_multiplier: 1, is_exclusive: false, image_rate_independent: false,
        image_rate_multiplier: 1,
        // No models at all: a non-empty group list with nothing usable inside
        // is a legitimate zero-row result, NOT a fallback (see useLandingBoard).
        models: []
      }]
    } as any)

    const w = mount(LandingPriceBoard, mountOpts)
    await flushPromises()

    // No board header, no table, no fallback relabel — the section must not exist at all.
    expect(w.html()).not.toContain('landing.board.liveLabel')
    expect(w.html()).not.toContain('landing.board.referenceLabel')
    expect(w.find('table').exists()).toBe(false)
    expect(w.find('section').exists()).toBe(false)
  })

  it('labels the saving column/badge as measuring the output price specifically', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [{
        id: 1, name: 'g', description: '', platform: 'anthropic', subscription_type: 'standard',
        rate_multiplier: 0.28, peak_rate_enabled: false, peak_start: '', peak_end: '',
        peak_rate_multiplier: 1, is_exclusive: false, image_rate_independent: false,
        image_rate_multiplier: 1,
        models: [{
          name: 'claude-opus-5', platform: 'anthropic',
          pricing: { billing_mode: 'token', input_price: 15, output_price: 75, cache_write_price: null, cache_read_price: null, image_input_price: null, image_output_price: null, per_request_price: null, intervals: [] },
          official_pricing: { input_price: 15, output_price: 75, cache_write_price: null, cache_read_price: null }
        }]
      }]
    } as any)

    const w = mount(LandingPriceBoard, mountOpts)
    await flushPromises()

    // The bare percentage alone would read as a whole-row claim; the wording
    // must name the output price specifically (see useLandingBoard.ts comment).
    expect(w.html()).toContain('landing.board.columns.savingOutput')
    expect(w.find('[data-testid="saving-badge"]').exists()).toBe(true)
  })
})
