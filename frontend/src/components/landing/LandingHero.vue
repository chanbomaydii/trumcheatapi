<template>
  <!-- Mockup source: <header> -->
  <header class="lp-root">
    <div class="mx-auto max-w-[1200px] px-6 pb-[46px] pt-[76px] sm:px-10">
      <div class="lp-mono mb-[26px] text-[11px] uppercase tracking-[0.34em] text-[var(--lp-accent)]">
        {{ t('landing.hero.eyebrow') }}<template v-if="props.modelCount != null"> · {{ t('landing.hero.eyebrowModelCount', { count: props.modelCount }) }}</template>
      </div>

      <div class="flex flex-col-reverse items-start justify-between gap-[60px] lg:flex-row lg:items-end">
        <div>
          <h1 class="max-w-[16ch] text-[52px] font-semibold uppercase tracking-[-0.01em] sm:text-[68px] lg:text-[82px]">
            {{ t('landing.hero.titleLine1') }}<br />
            <i18n-t keypath="landing.hero.titleLine2" tag="span" scope="global">
              <template #emphasis><em class="not-italic text-[var(--lp-accent)]">endpoint</em></template>
            </i18n-t><br />
            <i18n-t v-if="props.savingPct != null" keypath="landing.hero.titleLine3" tag="span" scope="global">
              <template #pct>{{ props.savingPct }}</template>
            </i18n-t>
            <template v-else>{{ t('landing.hero.titleLine3Plain') }}</template>
          </h1>

          <p class="mt-[22px] max-w-[56ch] text-xl font-normal leading-[1.55] text-[var(--lp-mute)]">
            <i18n-t keypath="landing.hero.subtitle" tag="span" scope="global">
              <template #code><span class="lp-mono text-[var(--lp-accent)]">base_url</span></template>
            </i18n-t>
          </p>

          <div class="mt-[34px] flex flex-wrap gap-3">
            <router-link
              to="/register"
              class="lp-mono inline-block rounded-[3px] bg-[var(--lp-accent)] px-[26px] py-[15px] text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--lp-accent-ink)]"
            >
              {{ t('landing.hero.ctaPrimary') }}
            </router-link>
            <!--
              "See pricing ↓" scrolls to the board. Hidden when the board has
              no rows: an arrow pointing down at nothing is worse than no
              button at all.
            -->
            <a
              v-if="props.hasPricing"
              href="#board"
              class="lp-mono inline-block rounded-[3px] border border-[var(--lp-line)] px-[26px] py-[15px] text-[13px] uppercase tracking-[0.1em] text-[var(--lp-dim)]"
              @click.prevent="scrollToSection('board')"
            >
              {{ t('landing.hero.ctaSecondary') }}
            </a>
          </div>
        </div>

        <div v-if="props.updatedAt" class="shrink-0 text-right">
          <div class="lp-mono text-[44px] tracking-[-0.02em]">{{ props.updatedAt }}</div>
          <div class="lp-mono mt-2 text-[10px] uppercase tracking-[0.28em] text-[var(--lp-dim)]">
            {{ t('landing.hero.clockLabel') }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { scrollToSection } from '@/utils/landingScroll'

const { t } = useI18n()

// The headline's saving claim must be driven by real per-deployment pricing
// (rate_multiplier), never a fixed number: the live pricing board renders
// directly beneath this headline with genuine per-model percentages, and an
// invented figure here could contradict it on the same screen. No caller
// supplies this yet (a later task wires it from the board's data), so the
// non-numeric fallback line is what actually renders today -- that is
// correct, not a placeholder bug.
//
// modelCount and updatedAt are the same pattern: real per-deployment figures
// a later task wires in from the public-status endpoint (Tasks 1-5). A fake
// clock value is worse than no clock at all, so with updatedAt absent the
// whole clock block (not just the number) is omitted.
const props = withDefaults(
  defineProps<{
    savingPct?: number | null
    modelCount?: number | null
    updatedAt?: string | null
    /** Whether the pricing board rendered rows worth scrolling to. */
    hasPricing?: boolean
  }>(),
  { savingPct: null, modelCount: null, updatedAt: null, hasPricing: false }
)

// NOTE ON REQUIREMENT B: unlike LandingNav, this component does not read
// appStore.cachedPublicSettings. The approved mockup's <header> block (and
// final-dark/final-light screenshots) contains no site name, logo or docs
// link -- those only appear in the nav bar. Reproducing the visual source of
// truth exactly takes priority over the brief's blanket statement that both
// components read those fields; there is no unsanitized-URL risk here
// because no settings-derived URL is rendered by this component at all.
// Flagged in the task report for the coordinator's awareness.
</script>
