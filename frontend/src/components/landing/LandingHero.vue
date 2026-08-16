<template>
  <!-- Mockup source: <header> -->
  <header class="lp-root">
    <div class="mx-auto max-w-[1200px] px-6 pb-[46px] pt-[76px] sm:px-10">
      <div class="lp-mono mb-[26px] text-[11px] uppercase tracking-[0.34em] text-[var(--lp-accent)]">
        {{ t('landing.hero.eyebrow') }}
      </div>

      <div class="flex flex-col-reverse items-start justify-between gap-[60px] lg:flex-row lg:items-end">
        <div>
          <h1 class="max-w-[16ch] text-[52px] font-semibold uppercase tracking-[-0.01em] sm:text-[68px] lg:text-[82px]">
            {{ t('landing.hero.titleLine1') }}<br />
            <i18n-t keypath="landing.hero.titleLine2" tag="span" scope="global">
              <template #emphasis><em class="not-italic text-[var(--lp-accent)]">endpoint</em></template>
            </i18n-t><br />
            {{ t('landing.hero.titleLine3') }}
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
            <a
              href="#"
              class="lp-mono inline-block rounded-[3px] border border-[var(--lp-line)] px-[26px] py-[15px] text-[13px] uppercase tracking-[0.1em] text-[var(--lp-dim)]"
            >
              {{ t('landing.hero.ctaSecondary') }}
            </a>
          </div>
        </div>

        <div class="shrink-0 text-right">
          <div class="lp-mono text-[44px] tracking-[-0.02em]">04:12:38</div>
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

const { t } = useI18n()

// NOTE ON REQUIREMENT B: unlike LandingNav, this component does not read
// appStore.cachedPublicSettings. The approved mockup's <header> block (and
// final-dark/final-light screenshots) contains no site name, logo or docs
// link -- those only appear in the nav bar. Reproducing the visual source of
// truth exactly takes priority over the brief's blanket statement that both
// components read those fields; there is no unsanitized-URL risk here
// because no settings-derived URL is rendered by this component at all.
// Flagged in the task report for the coordinator's awareness.
</script>
