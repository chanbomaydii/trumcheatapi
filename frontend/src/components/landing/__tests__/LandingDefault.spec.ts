import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

import LandingDefault from '../LandingDefault.vue'
import LandingHero from '../LandingHero.vue'
import LandingStats from '../LandingStats.vue'
import LandingSteps from '../LandingSteps.vue'
import LandingStatusStrip from '../LandingStatusStrip.vue'
import LandingPriceBoard from '../LandingPriceBoard.vue'
import { useLandingBoard, type BoardRow } from '@/composables/useLandingBoard'
import { useLandingStatus } from '@/composables/useLandingStatus'

// LandingDefault is the single owner of landing data fetching. Mocking both
// composables at module level lets these specs drive the exact post-fetch state
// (live rows, fallback rows, empty catalogue) and assert on the figures the
// component derives from it — the honesty rules that decide whether a number
// reaches the page at all.
vi.mock('@/composables/useLandingBoard', () => ({ useLandingBoard: vi.fn() }))
vi.mock('@/composables/useLandingStatus', () => ({ useLandingStatus: vi.fn() }))

function boardRow(savingPct: number | null, name = `m-${savingPct}`): BoardRow {
  return {
    name,
    platform: 'anthropic',
    inputOfficial: 15,
    inputActual: 4.2,
    outputOfficial: 75,
    outputActual: 21,
    savingPct
  }
}

interface BoardState {
  rows?: BoardRow[]
  usingFallback?: boolean
  modelCount?: number | null
}

const boardLoad = vi.fn()

function stubComposables(
  board: BoardState = {},
  status: { uptimeText?: string | null; ttftText?: string | null; statusLevel?: 'operational' | 'degraded' | null } = {}
) {
  boardLoad.mockResolvedValue(undefined)
  vi.mocked(useLandingBoard).mockReturnValue({
    rows: ref(board.rows ?? []),
    loading: ref(false),
    usingFallback: ref(board.usingFallback ?? false),
    modelCount: ref(board.modelCount ?? null),
    load: boardLoad
  } as unknown as ReturnType<typeof useLandingBoard>)

  vi.mocked(useLandingStatus).mockReturnValue({
    uptimeText: ref(status.uptimeText ?? null),
    ttftText: ref(status.ttftText ?? null),
    statusLevel: ref(status.statusLevel ?? null),
    load: vi.fn().mockResolvedValue(undefined)
  } as unknown as ReturnType<typeof useLandingStatus>)
}

// `shallow` stubs every child, which keeps this spec off pinia (LandingNav
// reads the app store) and off the i18n plugin while still letting
// findComponent read the props each section actually received.
async function mountDefault() {
  const wrapper = mount(LandingDefault, { shallow: true })
  await flushPromises()
  return wrapper
}

describe('LandingDefault', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Fake only Date so the clock assertion is deterministic; flushPromises
    // still needs real timers to resolve.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 16, 14, 32, 5))
  })

  afterEach(() => vi.useRealTimers())

  describe('savingPct', () => {
    it('is the median of the comparable savings, not the maximum', async () => {
      stubComposables({ rows: [boardRow(60), boardRow(70), boardRow(95)] })
      const w = await mountDefault()

      // Maximum would be 95 — the headline copy carries no "up to" qualifier,
      // so publishing the best case there would be cherry-picking.
      expect(w.findComponent(LandingHero).props('savingPct')).toBe(70)
    })

    it('takes the LOWER middle value on an even count', async () => {
      stubComposables({ rows: [boardRow(60), boardRow(70), boardRow(80), boardRow(90)] })
      const w = await mountDefault()

      // Upper middle (80) or the mean of the two middles (75) would both round
      // the claim in our own favour; 70 rounds it against us.
      expect(w.findComponent(LandingHero).props('savingPct')).toBe(70)
    })

    it('ignores rows with no comparable saving', async () => {
      stubComposables({ rows: [boardRow(null), boardRow(60), boardRow(null), boardRow(80)] })
      const w = await mountDefault()

      // Only 60 and 80 are comparable; the lower middle of those two is 60.
      // Counting the nulls as zeros would drag the figure down into fiction.
      expect(w.findComponent(LandingHero).props('savingPct')).toBe(60)
    })

    it('is null when the board fell back to canned rows', async () => {
      stubComposables({ rows: [boardRow(72), boardRow(75)], usingFallback: true })
      const w = await mountDefault()

      // The fallback rows carry real-looking percentages, but they describe no
      // actual deployment — publishing one as a headline would be fabrication.
      expect(w.findComponent(LandingHero).props('savingPct')).toBeNull()
    })

    it('is null when no row has a comparable saving', async () => {
      stubComposables({ rows: [boardRow(null), boardRow(null)] })
      const w = await mountDefault()
      expect(w.findComponent(LandingHero).props('savingPct')).toBeNull()
    })
  })

  describe('updatedAt', () => {
    it('stamps the clock after a live, non-empty pricing fetch', async () => {
      stubComposables({ rows: [boardRow(70)] })
      const w = await mountDefault()
      expect(w.findComponent(LandingHero).props('updatedAt')).toBe('14:32')
    })

    it('is null when the board fell back to canned rows', async () => {
      stubComposables({ rows: [boardRow(72)], usingFallback: true })
      const w = await mountDefault()

      // A "last price update" clock above static demo prices is a false claim
      // about freshness, so the hero drops the whole clock block.
      expect(w.findComponent(LandingHero).props('updatedAt')).toBeNull()
    })

    it('is null when the fetch succeeded but produced no rows', async () => {
      stubComposables({ rows: [] })
      const w = await mountDefault()
      expect(w.findComponent(LandingHero).props('updatedAt')).toBeNull()
    })
  })

  describe('modelCount', () => {
    it('is null rather than 0 when the catalogue is empty', async () => {
      stubComposables({ rows: [], modelCount: null })
      const w = await mountDefault()

      const count = w.findComponent(LandingStats).props('modelCount')
      expect(count).toBeNull()
      expect(count).not.toBe(0)
    })

    it('feeds the same count to the hero, the stat tiles and the steps', async () => {
      stubComposables({ rows: [boardRow(70)], modelCount: 41 })
      const w = await mountDefault()

      expect(w.findComponent(LandingHero).props('modelCount')).toBe(41)
      expect(w.findComponent(LandingStats).props('modelCount')).toBe(41)
      expect(w.findComponent(LandingSteps).props('modelCount')).toBe(41)
    })
  })

  describe('status figures', () => {
    it('passes uptime and ttft through to both the strip and the tiles', async () => {
      stubComposables({ rows: [boardRow(70)] }, { uptimeText: '99,93%', ttftText: '< 1,0 s' })
      const w = await mountDefault()

      expect(w.findComponent(LandingStatusStrip).props('uptimeText')).toBe('99,93%')
      expect(w.findComponent(LandingStatusStrip).props('ttftText')).toBe('< 1,0 s')
      expect(w.findComponent(LandingStats).props('uptimeText')).toBe('99,93%')
      expect(w.findComponent(LandingStats).props('ttftText')).toBe('< 1,0 s')
    })

    it('passes the derived status level to the strip so the light matches the number', async () => {
      stubComposables({ rows: [boardRow(70)] }, { uptimeText: '72,00%', statusLevel: 'degraded' })
      const w = await mountDefault()

      expect(w.findComponent(LandingStatusStrip).props('statusLevel')).toBe('degraded')
    })

    it('passes null through untouched so both render their numberless variant', async () => {
      stubComposables({ rows: [boardRow(70)] }, { uptimeText: null, ttftText: null })
      const w = await mountDefault()

      expect(w.findComponent(LandingStatusStrip).props('uptimeText')).toBeNull()
      expect(w.findComponent(LandingStats).props('ttftText')).toBeNull()
    })
  })

  describe('fetch ownership', () => {
    it('fetches each landing endpoint exactly once per page load', async () => {
      const statusLoad = vi.fn().mockResolvedValue(undefined)
      stubComposables({ rows: [boardRow(70)] })
      vi.mocked(useLandingStatus).mockReturnValue({
        uptimeText: ref(null),
        ttftText: ref(null),
        statusLevel: ref(null),
        load: statusLoad
      } as unknown as ReturnType<typeof useLandingStatus>)

      await mountDefault()

      // Both composables are instantiated once here and their data pushed down
      // as props. The child sections must never fetch for themselves: the two
      // landing endpoints share one per-IP rate-limit bucket, and a 429 makes
      // the board fall back to canned rows, which blanks every figure above.
      expect(useLandingBoard).toHaveBeenCalledTimes(1)
      expect(useLandingStatus).toHaveBeenCalledTimes(1)
      expect(boardLoad).toHaveBeenCalledTimes(1)
      expect(statusLoad).toHaveBeenCalledTimes(1)
    })

    it('gives the price board the rows and fallback flag it no longer fetches', async () => {
      const rows = [boardRow(70), boardRow(80)]
      stubComposables({ rows, usingFallback: true })
      const w = await mountDefault()

      expect(w.findComponent(LandingPriceBoard).props('rows')).toEqual(rows)
      expect(w.findComponent(LandingPriceBoard).props('usingFallback')).toBe(true)
    })
  })
})
