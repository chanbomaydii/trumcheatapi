<template>
  <!-- Mockup source: <div class="strip"> -->
  <div class="lp-root lp-mono border-b border-[var(--lp-line)] bg-[var(--lp-panel)] text-[11px] uppercase tracking-[0.14em] text-[var(--lp-dim)]">
    <div class="mx-auto flex max-w-[1200px] justify-between gap-4 px-6 py-[9px] sm:px-10">
      <!--
        The light and its label render ONLY when an uptime measurement exists.
        This block used to be unconditional markup: a green dot plus "all
        systems operational" that no data could ever contradict, so a 72% ratio
        would have rendered "all systems operational · 72,00% uptime" on the
        same line. With no measurement there is nothing to report, and silence
        beats a light that means nothing.
      -->
      <div data-testid="status-cell">
        <template v-if="statusLevel">
          <span
            data-testid="status-dot"
            class="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
            :class="
              statusLevel === 'operational'
                ? 'bg-[var(--lp-ok)] shadow-[0_0_10px_var(--lp-ok)]'
                : 'bg-[var(--lp-warn)] shadow-[0_0_10px_var(--lp-warn)]'
            "
          ></span>{{ statusLevel === 'operational' ? t('landing.strip.status') : t('landing.strip.statusDegraded')
          }}<template v-if="uptimeText"> · {{ t('landing.strip.statusUptime', { uptime: uptimeText }) }}</template>
        </template>
      </div>
      <div v-if="ttftText">
        {{ t('landing.strip.latencyTtft', { ttft: ttftText }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { LandingStatusLevel } from '@/composables/useLandingStatus'

const { t } = useI18n()

// Uptime/latency figures must come from the public-status endpoint (Tasks
// 1-5) built specifically so this page never has to invent them -- a made-up
// number here would sit directly above the live pricing board's genuine
// per-model figures and contradict it on the same screen.
//
// statusLevel is derived from the same uptime ratio as uptimeText (see
// useLandingStatus), which is what keeps the light honest: it cannot claim
// health while the percentage printed beside it says otherwise, and it is
// absent entirely when there is no measurement to describe.
defineProps<{
  uptimeText?: string | null
  ttftText?: string | null
  statusLevel?: LandingStatusLevel | null
}>()
</script>
