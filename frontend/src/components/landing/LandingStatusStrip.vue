<template>
  <!-- Mockup source: <div class="strip"> -->
  <div class="lp-root lp-mono border-b border-[var(--lp-line)] bg-[var(--lp-panel)] text-[11px] uppercase tracking-[0.14em] text-[var(--lp-dim)]">
    <div class="mx-auto flex max-w-[1200px] justify-between gap-4 px-6 py-[9px] sm:px-10">
      <div>
        <span
          class="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--lp-ok)] align-middle shadow-[0_0_10px_var(--lp-ok)]"
        ></span>{{ t('landing.strip.status') }}<template v-if="uptimeText"> · {{ t('landing.strip.statusUptime', { uptime: uptimeText }) }}</template>
      </div>
      <div>
        {{ t('landing.strip.latency') }}<template v-if="ttftText"> · {{ t('landing.strip.latencyTtft', { ttft: ttftText }) }}</template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Uptime/latency figures must come from the public-status endpoint (Tasks
// 1-5) built specifically so this page never has to invent them -- a made-up
// number here would sit directly above the live pricing board's genuine
// per-model figures and contradict it on the same screen. No caller supplies
// these yet (a later task wires them in), so the numberless variant is what
// actually renders today.
defineProps<{ uptimeText?: string | null; ttftText?: string | null }>()
</script>
