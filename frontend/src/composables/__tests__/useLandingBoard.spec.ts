import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLandingBoard } from '../useLandingBoard'
import * as api from '@/api/modelPlaza'

vi.mock('@/api/modelPlaza')

function group(overrides: Partial<any> = {}) {
  return {
    id: 1, name: 'g', description: '', platform: 'anthropic',
    subscription_type: 'standard', rate_multiplier: 0.28,
    peak_rate_enabled: false, peak_start: '', peak_end: '', peak_rate_multiplier: 1,
    is_exclusive: false, image_rate_independent: false, image_rate_multiplier: 1,
    models: [],
    ...overrides
  }
}

function model(name: string, input: number, output: number, official: any = { input_price: 15, output_price: 75, cache_write_price: null, cache_read_price: null }) {
  return {
    name, platform: 'anthropic',
    pricing: {
      billing_mode: 'token', input_price: input, output_price: output,
      cache_write_price: null, cache_read_price: null,
      image_input_price: null, image_output_price: null,
      per_request_price: null, intervals: []
    },
    official_pricing: official
  }
}

describe('useLandingBoard', () => {
  beforeEach(() => vi.resetAllMocks())

  it('multiplies base price by the effective rate', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({ rate_multiplier: 0.28, models: [model('claude-opus-5', 15, 75)] })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value[0].inputActual).toBeCloseTo(4.2, 5)
    expect(b.rows.value[0].outputActual).toBeCloseTo(21, 5)
  })

  it('prefers the per-user rate over the group rate', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({
        rate_multiplier: 0.28, user_rate_multiplier: 0.2,
        // Official pricing must be coherent with our own base price (10):
        // an operator does not set their base price at a fraction of list.
        models: [model('m', 10, 10, { input_price: 10, output_price: 10, cache_write_price: null, cache_read_price: null })]
      })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value[0].inputActual).toBeCloseTo(2, 5)
  })

  it('computes the saving percentage from official output price', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({ rate_multiplier: 0.28, models: [model('m', 15, 75)] })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value[0].savingPct).toBe(72)
  })

  it('keeps the row but nulls the saving when official pricing is missing', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({ models: [model('m', 1, 1, null)] })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value).toHaveLength(1)
    expect(b.rows.value[0].savingPct).toBeNull()
  })

  it('drops models with no pricing at all', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({ models: [{ name: 'm', platform: 'x', pricing: null, official_pricing: null }] })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value).toHaveLength(0)
  })

  it('drops image-billed models because their multiplier differs', async () => {
    // Official pricing coherent with base price (1) even though this row is
    // dropped before pricing comparison ever runs, for the image-billed check.
    const imageModel = model('gemini-3-pro-image', 1, 1, { input_price: 1, output_price: 1, cache_write_price: null, cache_read_price: null })
    imageModel.pricing.image_output_price = 0.05
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({ image_rate_independent: true, image_rate_multiplier: 0.9, models: [imageModel] })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value).toHaveLength(0)
  })

  it('drops rows whose saving is negative or implausibly high', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({
        rate_multiplier: 2,
        models: [model('too-expensive', 15, 75)]
      }), group({
        id: 2, rate_multiplier: 0.01,
        models: [model('too-cheap', 15, 75)]
      })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value.map(r => r.name)).not.toContain('too-expensive')
    expect(b.rows.value.map(r => r.name)).not.toContain('too-cheap')
  })

  it('deduplicates by model name keeping the biggest saving', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [
        group({ id: 1, rate_multiplier: 0.5, models: [model('dup', 15, 75)] }),
        group({ id: 2, rate_multiplier: 0.28, models: [model('dup', 15, 75)] })
      ]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value).toHaveLength(1)
    expect(b.rows.value[0].savingPct).toBe(72)
  })

  it('falls back to static rows when the endpoint is off', async () => {
    vi.mocked(api.getModelPlaza).mockRejectedValue(new Error('404'))
    const b = useLandingBoard()
    await b.load()
    expect(b.usingFallback.value).toBe(true)
    expect(b.rows.value.length).toBeGreaterThan(0)
  })

  it('computes saving against official price, not against our own base price', async () => {
    // Base output price (150) is deliberately different from the vendor's
    // list price (75). At rate 0.5 the customer actually pays 75 — exactly
    // list price, i.e. 0% real saving — even though `1 - rate` would report
    // a misleading 50%. A 0% saving falls below the plausibility floor, so
    // the row must be dropped entirely.
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({
        rate_multiplier: 0.5,
        models: [model('mismatched', 150, 150, { input_price: 75, output_price: 75, cache_write_price: null, cache_read_price: null })]
      })]
    } as any)
    const b = useLandingBoard()
    await b.load()
    expect(b.rows.value.map(r => r.name)).not.toContain('mismatched')
  })

  it('honours the row limit', async () => {
    vi.mocked(api.getModelPlaza).mockResolvedValue({
      description: '',
      groups: [group({
        rate_multiplier: 0.28,
        models: [model('a', 15, 75), model('b', 15, 75), model('c', 15, 75)]
      })]
    } as any)
    const b = useLandingBoard(2)
    await b.load()
    expect(b.rows.value).toHaveLength(2)
  })
})
