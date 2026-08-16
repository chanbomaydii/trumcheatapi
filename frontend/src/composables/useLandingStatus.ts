import { ref, computed } from 'vue'
import { getPublicStatus } from '@/api/publicStatus'

/** Vietnamese decimal separator: 99,93% and 1,0 s. */
function vnDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',')
}

/**
 * Uptime at or above this may be described as "all systems operational".
 *
 * 99% over a 30-day window is roughly 7 hours of downtime; below that the page
 * must not tell a visitor everything is fine. The threshold exists because the
 * green light used to be unconditional markup: it would have read "all systems
 * operational · 72,00% uptime" without ever contradicting itself.
 */
export const OPERATIONAL_UPTIME_RATIO = 0.99

/**
 * null means "we have no uptime measurement", which is neither a claim of
 * health nor a claim of trouble — callers render no light at all rather than
 * pick one. Never widen this to a third "unknown but probably fine" state.
 */
export type LandingStatusLevel = 'operational' | 'degraded'

export function useLandingStatus() {
  const ratio = ref<number | null>(null)
  const ttftMs = ref<number | null>(null)

  const uptimeText = computed(() =>
    ratio.value === null ? null : `${vnDecimal(ratio.value * 100, 2)}%`
  )

  // Drives the status light. Derived from the SAME ratio that produces
  // uptimeText, so the light and the percentage beside it can never disagree.
  const statusLevel = computed<LandingStatusLevel | null>(() => {
    if (ratio.value === null) return null
    return ratio.value >= OPERATIONAL_UPTIME_RATIO ? 'operational' : 'degraded'
  })

  // The value is a bucket upper bound, so it is always rendered with "<".
  // Never interpolate inside the bucket to make it look more precise.
  const ttftText = computed(() => {
    if (ttftMs.value === null) return null
    return ttftMs.value >= 1000
      ? `< ${vnDecimal(ttftMs.value / 1000, 1)} s`
      : `< ${ttftMs.value} ms`
  })

  async function load(): Promise<void> {
    try {
      const data = await getPublicStatus()
      ratio.value = data.uptime?.ratio ?? null
      ttftMs.value = data.ttft?.upper_bound_ms ?? null
    } catch {
      // Switched off or unreachable — the tiles simply do not render.
      ratio.value = null
      ttftMs.value = null
    }
  }

  return { uptimeText, ttftText, statusLevel, load }
}
