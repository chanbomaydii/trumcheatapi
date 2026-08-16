import { ref, computed } from 'vue'
import { getPublicStatus } from '@/api/publicStatus'

/** Vietnamese decimal separator: 99,93% and 1,0 s. */
function vnDecimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',')
}

export function useLandingStatus() {
  const ratio = ref<number | null>(null)
  const ttftMs = ref<number | null>(null)

  const uptimeText = computed(() =>
    ratio.value === null ? null : `${vnDecimal(ratio.value * 100, 2)}%`
  )

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

  return { uptimeText, ttftText, load }
}
