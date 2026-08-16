<template>
  <div class="lp-root flex min-h-screen flex-col">
    <LandingStatusStrip :uptime-text="uptimeText" :ttft-text="ttftText" />
    <LandingNav />
    <LandingHero :saving-pct="savingPct" :model-count="modelCount" :updated-at="updatedAt" />
    <LandingPriceBoard :rows="rows" :using-fallback="usingFallback" />
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
const { rows, usingFallback, modelCount, load: loadBoard } = useLandingBoard(Number.MAX_SAFE_INTEGER)

// Same two figures feed LandingStatusStrip and LandingStats. Fetched once,
// passed through untouched — including null, which is what makes both render
// their numberless variants instead of inventing a figure.
const { uptimeText, ttftText, load: loadStatus } = useLandingStatus()

// Formatted clock for the hero. null whenever the prices on screen are not
// demonstrably live — a "last updated" clock above canned data is a false claim.
const updatedAt = ref<string | null>(null)

const savingPct = computed<number | null>(() => {
  // Fallback rows are canned reference data. A headline saving derived from them
  // would be fabricated for this deployment, so the hero keeps its non-numeric
  // line instead.
  if (usingFallback.value) return null

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
  // Only stamp the clock when the prices really came back live. `usingFallback`
  // covers both a failed request and a switched-off endpoint.
  updatedAt.value = !usingFallback.value && rows.value.length > 0 ? formatClock(new Date()) : null
})
</script>
