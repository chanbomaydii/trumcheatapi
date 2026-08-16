<template>
  <!-- Mockup source: <div class="cta"> + <footer> -->
  <div class="lp-root bg-[var(--lp-accent)] py-[84px] text-center text-[var(--lp-accent-ink)]">
    <h2 class="text-[36px] font-semibold uppercase tracking-[-0.01em] text-[var(--lp-accent-ink)] sm:text-[48px] lg:text-[60px]">
      {{ t('landing.cta.heading') }}
    </h2>
    <p class="lp-mono mt-[18px] text-[13px] uppercase tracking-[0.16em] opacity-70">
      {{ t('landing.cta.subtitle') }}
    </p>
    <router-link
      to="/register"
      class="lp-mono mt-8 inline-block rounded-[3px] bg-[var(--lp-accent-ink)] px-[34px] py-4 text-[13px] font-bold text-[var(--lp-accent)]"
    >
      {{ t('landing.cta.button') }}
    </router-link>
  </div>

  <footer class="lp-root lp-mono py-[34px] text-[11px] uppercase tracking-[0.14em] text-[var(--lp-dim)]">
    <div class="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 sm:flex-row sm:justify-between sm:px-10">
      <div>{{ t('landing.footer.copyright', { year: currentYear, siteName }) }}</div>
      <div>{{ t('landing.footer.links') }}</div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const appStore = useAppStore()

const currentYear = computed(() => new Date().getFullYear())

// Same source and fallback chain as LandingNav's masthead. The copyright line
// used to hardcode "TrumCheat API", which is wrong for every other deployment
// of an open-source gateway.
const siteName = computed(
  () => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API'
)
</script>
