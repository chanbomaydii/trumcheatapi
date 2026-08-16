<template>
  <div class="lp-root flex min-h-screen flex-col">
    <LandingStatusStrip :uptime-text="uptimeText" :ttft-text="ttftText" :status-level="statusLevel" />
    <LandingNav :has-pricing="hasPricing" />
    <LandingHero
      :saving-pct="savingPct"
      :model-count="modelCount"
      :updated-at="updatedAt"
      :has-pricing="hasPricing"
    />
    <LandingPriceBoard :rows="rows" />
    <!--
      LandingPriceBoard carries its own `mx-auto max-w-[1200px] px-6 sm:px-10`
      container, LandingStats does not (it is a bare full-bleed grid), so only
      the stats strip is wrapped. Wrapping both would nest two 1200px containers
      and shrink the board by one extra gutter on each side.
    -->
    <div class="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <LandingStats :model-count="modelCount" :uptime-text="uptimeText" :ttft-text="ttftText" />
    </div>
    <LandingSteps :model-count="modelCount" />
    <LandingCompat />
    <LandingFaq />
    <LandingSupport />
    <LandingCta />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LandingStatusStrip from './LandingStatusStrip.vue'
import LandingNav from './LandingNav.vue'
import LandingHero from './LandingHero.vue'
import LandingPriceBoard from './LandingPriceBoard.vue'
import LandingStats from './LandingStats.vue'
import LandingSteps from './LandingSteps.vue'
import LandingCompat from './LandingCompat.vue'
import LandingFaq from './LandingFaq.vue'
import LandingSupport from './LandingSupport.vue'
import LandingCta from './LandingCta.vue'
import { useLandingBoard } from '@/composables/useLandingBoard'
import { useLandingStatus } from '@/composables/useLandingStatus'

// This component is the SINGLE owner of landing data fetching: exactly one
// /model-plaza request and one /public/status request per page load, pushed
// down to the presentational sections as props. The sections must not fetch
// for themselves. Both endpoints share one per-IP rate-limit bucket, so every
// duplicate request lowers the number of page loads an IP (office NAT, CGNAT,
// crawler fleet) gets before a 429 — and a 429 makes useLandingBoard fall back
// to static rows, which trips the honesty gates below and strips the page of
// every figure it was built to show.
//
// Unbounded limit: the board displays five rows, but savingPct below is a
// median over the whole comparable catalogue. useLandingBoard sorts by saving
// descending, so a median over the top five would be a median of the five best
// savings, not a typical figure. LandingPriceBoard slices what it displays.
const { rows, modelCount, load: loadBoard } = useLandingBoard(Number.MAX_SAFE_INTEGER)

// Same two figures feed LandingStatusStrip and LandingStats. Fetched once,
// passed through untouched — including null, which is what makes both render
// their numberless variants instead of inventing a figure.
const { uptimeText, ttftText, statusLevel, load: loadStatus } = useLandingStatus()

// Formatted clock for the hero. null whenever the prices on screen are not
// demonstrably live — a "last updated" clock above canned data is a false claim.
const updatedAt = ref<string | null>(null)

// LandingPriceBoard hides itself when it has no rows, taking the #board anchor
// with it. The nav's model-board/pricing entries and the hero's "see pricing ↓"
// button all scroll there, so they are gated on the same condition: a link to a
// section that is not on the page is the `href="#"` dead end in a slower form.
const hasPricing = computed(() => rows.value.length > 0)

const savingPct = computed<number | null>(() => {
  // No explicit fallback guard is needed any more: useLandingBoard produces no
  // rows at all when the endpoint is off or unreachable, so `values` is empty
  // and the hero keeps its non-numeric line. Every row that gets here came from
  // this deployment's own pricing data.
  const values = rows.value.map((r) => r.savingPct).filter((v): v is number => v !== null)
  if (values.length === 0) return null

  // MEDIAN, never the maximum: the headline copy carries no "up to" qualifier so
  // it reads as a typical figure, and publishing the best case there would be
  // cherry-picking. On an even count take the LOWER middle value, i.e. round the
  // claim against our own favour.
  const sorted = [...values].sort((a, b) => a - b)
  return Math.round(sorted[Math.floor((sorted.length - 1) / 2)])
})

/** 24-hour local wall clock, e.g. "14:32", to match the hero's monospace tile. */
function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

onMounted(async () => {
  void loadStatus()

  await loadBoard()
  // Only stamp the clock when prices really came back. Rows are empty for a
  // failed request, a switched-off endpoint and an unconfigured one alike, so
  // a non-empty board is now sufficient proof that the figures are live.
  updatedAt.value = rows.value.length > 0 ? formatClock(new Date()) : null
})
</script>
