<template>
  <!--
    Mockup source: the four-tile stat strip beneath the pricing board.

    A tile with no real data is dropped entirely rather than rendered as a
    fabricated 0%/0 ms/"—" — see the `tiles` computed below. The grid's column
    count therefore follows however many tiles survive, not a fixed four.
  -->
  <div
    v-if="tiles.length >= 2"
    class="lp-root grid border border-t-0 border-[var(--lp-line)]"
    :style="{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }"
  >
    <div
      v-for="tile in tiles"
      :key="tile.key"
      data-testid="stat-tile"
      class="border-r border-[var(--lp-line)] px-6 py-7 last:border-r-0"
    >
      <div class="lp-mono text-3xl tracking-tight text-[var(--lp-ink)]">{{ tile.value }}</div>
      <div class="lp-mono mt-2.5 text-[10px] uppercase tracking-[0.2em] text-[var(--lp-dim)]">
        {{ tile.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Purely presentational. This component used to own a useLandingStatus()
// instance, so /public/status was fetched here AND in LandingDefault (which
// needs the same two figures for LandingStatusStrip). Both landing endpoints
// share a single per-IP rate-limit bucket, so the duplicate spent the visitor's
// allowance twice over for identical data — and could in principle show a
// figure that disagrees with the strip if the two responses straddled a
// refresh. LandingDefault now fetches once and passes the values down.
const props = defineProps<{
  modelCount: number | null
  uptimeText: string | null
  ttftText: string | null
}>()

const { t } = useI18n()

// A tile with no data is dropped entirely rather than rendered as 0 or "—":
// an invented figure on a page whose whole pitch is transparency is worse than
// a missing one, and the grid re-flows to whatever survives. "formats" is the
// one tile that is a genuine constant (the gateway really does speak three API
// formats), not a measurement of a particular deployment, so it always renders.
const tiles = computed(() => {
  const out: Array<{ key: string; value: string; label: string }> = []
  if (props.modelCount !== null) {
    out.push({ key: 'models', value: String(props.modelCount), label: t('landing.stats.models') })
  }
  if (props.uptimeText !== null) {
    out.push({ key: 'uptime', value: props.uptimeText, label: t('landing.stats.uptime') })
  }
  if (props.ttftText !== null) {
    out.push({ key: 'ttft', value: props.ttftText, label: t('landing.stats.ttft') })
  }
  out.push({ key: 'formats', value: '3', label: t('landing.stats.formats') })
  return out
})
</script>
