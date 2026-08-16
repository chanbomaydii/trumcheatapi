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

  // Saving is what the customer actually pays us versus what the vendor
  // charges on their own public list — NOT a function of our multiplier
  // alone. An operator's base price need not equal the vendor's list price,
  // so (1 - rate) would silently ignore any gap between the two and publish
  // a number that has nothing to do with what the customer really saves.
  // Gated on official_pricing being present: with nothing to compare against,
  // the comparison itself is meaningless (rule 4), even though the actual
  // price above is still true and still shown.
  let savingPct: number | null = null
  if (outputOfficial != null && outputOfficial > 0) {
    savingPct = Math.round((1 - outputActual / outputOfficial) * 100)
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
  /**
   * Distinct model names in the RAW response, counted before any of the
   * filtering that produces `rows` (image-billed, unpriced, implausible
   * saving). `rows.length` is a strict undercount of the catalogue and must
   * never be used as "how many models we serve".
   *
   * null means "unknown" — a failed request, a switched-off endpoint, or a
   * response with no models at all. Never 0: callers drop the figure entirely
   * rather than claim a catalogue of zero.
   */
  const modelCount = ref<number | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const data = await getModelPlaza()
      const groups = data?.groups ?? []

      const names = new Set<string>()
      for (const g of groups) {
        for (const m of g.models ?? []) names.add(m.name)
      }
      modelCount.value = names.size > 0 ? names.size : null

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
      // The fallback rows are canned demo data, so their names say nothing
      // about this deployment's catalogue.
      modelCount.value = null
    } finally {
      loading.value = false
    }
  }

  return { rows, loading, usingFallback, modelCount, load }
}
