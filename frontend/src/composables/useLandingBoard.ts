import { ref, type Ref } from 'vue'
import { getModelPlaza, type ModelPlazaGroup, type PlazaModel } from '@/api/modelPlaza'

/** Prices shown per million tokens, matching the detailed plaza table. */
export interface BoardRow {
  name: string
  platform: string
  inputOfficial: number | null
  inputActual: number
  outputOfficial: number | null
  outputActual: number
  /** Whole-percent saving vs official output price; null when incomparable. */
  savingPct: number | null
}

/**
 * Static rows used when the plaza endpoint is switched off or unreachable.
 * Callers MUST surface `usingFallback` so the board can be relabelled from
 * "live" to "reference" — presenting these as live figures would be a lie.
 */
const FALLBACK_ROWS: BoardRow[] = [
  { name: 'claude-opus-5', platform: 'anthropic', inputOfficial: 15, inputActual: 4.2, outputOfficial: 75, outputActual: 21, savingPct: 72 },
  { name: 'claude-sonnet-4.5', platform: 'anthropic', inputOfficial: 3, inputActual: 0.84, outputOfficial: 15, outputActual: 4.2, savingPct: 72 },
  { name: 'gpt-5.6-sol', platform: 'openai', inputOfficial: 1.25, inputActual: 0.4, outputOfficial: 10, outputActual: 3.2, savingPct: 68 },
  { name: 'gemini-3-pro', platform: 'google', inputOfficial: 2.5, inputActual: 0.62, outputOfficial: 15, outputActual: 3.75, savingPct: 75 }
]

/** A saving outside this band means the reference price is wrong, not that we are cheap. */
const MIN_PLAUSIBLE_SAVING = 1
const MAX_PLAUSIBLE_SAVING = 95

function isImageBilled(m: PlazaModel): boolean {
  const p = m.pricing
  if (!p) return false
  return p.image_input_price != null || p.image_output_price != null
}

function toRow(g: ModelPlazaGroup, m: PlazaModel): BoardRow | null {
  const p = m.pricing
  if (!p || p.input_price == null || p.output_price == null) return null

  // Same precedence as PlazaModelPricingTable so the landing board and the
  // detailed table can never disagree.
  const rate = g.user_rate_multiplier ?? g.rate_multiplier
  const inputActual = p.input_price * rate
  const outputActual = p.output_price * rate

  const inputOfficial = m.official_pricing?.input_price ?? null
  const outputOfficial = m.official_pricing?.output_price ?? null

  // Saving is the discount our multiplier represents off the vendor's list
  // price. Our channel price is the same model at the vendor's own rate
  // before the multiplier is applied, so (1 - rate) is the real saving —
  // dividing the scaled price back by the official price would double-count
  // any pre-existing gap between our base price and the vendor's list price.
  // Gated on official_pricing being present: with nothing to compare against,
  // the comparison itself is meaningless (rule 4), even though the actual
  // price above is still true and still shown.
  let savingPct: number | null = null
  if (outputOfficial != null && outputOfficial > 0) {
    savingPct = Math.round((1 - rate) * 100)
    if (savingPct < MIN_PLAUSIBLE_SAVING || savingPct > MAX_PLAUSIBLE_SAVING) return null
  }

  return {
    name: m.name,
    platform: m.platform,
    inputOfficial,
    inputActual,
    outputOfficial,
    outputActual,
    savingPct
  }
}

export function useLandingBoard(limit = 5) {
  const rows: Ref<BoardRow[]> = ref([])
  const loading = ref(false)
  const usingFallback = ref(false)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const data = await getModelPlaza()
      const groups = data?.groups ?? []

      // An empty group list means the endpoint has nothing configured —
      // that is "nothing usable", same as a network failure below.
      // A group list that merely filters down to zero rows (every model
      // dropped by the filtering rules) is a legitimate, non-fallback
      // empty result and must not be relabelled as fallback data.
      if (groups.length === 0) {
        rows.value = FALLBACK_ROWS.slice(0, limit)
        usingFallback.value = true
        return
      }

      const best = new Map<string, BoardRow>()

      for (const g of groups) {
        for (const m of g.models ?? []) {
          if (isImageBilled(m)) continue
          const row = toRow(g, m)
          if (!row) continue
          const existing = best.get(row.name)
          if (!existing || (row.savingPct ?? -1) > (existing.savingPct ?? -1)) {
            best.set(row.name, row)
          }
        }
      }

      const sorted = [...best.values()].sort((a, b) => (b.savingPct ?? -1) - (a.savingPct ?? -1))
      rows.value = sorted.slice(0, limit)
      usingFallback.value = false
    } catch {
      rows.value = FALLBACK_ROWS.slice(0, limit)
      usingFallback.value = true
    } finally {
      loading.value = false
    }
  }

  return { rows, loading, usingFallback, load }
}
