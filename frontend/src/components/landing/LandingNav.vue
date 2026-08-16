<template>
  <!-- Mockup source: <nav> -->
  <nav class="lp-root border-b border-[var(--lp-line)]">
    <div class="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-5 sm:px-10">
      <div class="flex items-center gap-3">
        <div
          class="relative grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-[3px] bg-[var(--lp-accent)] text-[var(--lp-accent-ink)] after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/40 after:content-['']"
        >
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-full w-full object-contain" />
        </div>
        <b class="truncate text-[22px] font-semibold uppercase tracking-[0.06em]">{{ siteName }}</b>
      </div>

      <div class="hidden items-center gap-[34px] text-[15px] uppercase tracking-[0.12em] text-[var(--lp-dim)] md:flex">
        <!--
          The board is the target for both of these: it IS the model board and
          it IS the pricing table. Rendered only when it has rows, exactly like
          the docs link is rendered only when a doc URL is configured — a nav
          entry that scrolls to a section which is not on the page is the
          `href="#"` bug in a slower form.
        -->
        <a
          v-if="hasPricing"
          href="#board"
          class="text-[var(--lp-ink)]"
          @click.prevent="scrollToSection('board')"
        >{{ t('landing.nav.modelBoard') }}</a>
        <a
          v-if="hasPricing"
          href="#board"
          @click.prevent="scrollToSection('board')"
        >{{ t('landing.nav.pricing') }}</a>
        <a
          v-if="docUrl"
          :href="docUrl"
          target="_blank"
          rel="noopener noreferrer"
        >{{ t('landing.nav.docs') }}</a>
        <a href="#faq" @click.prevent="scrollToSection('faq')">{{ t('landing.nav.faq') }}</a>
      </div>

      <div class="flex items-center gap-3">
        <LocaleSwitcher />
        <button
          type="button"
          class="grid h-[38px] w-[38px] place-items-center rounded-[3px] border border-[var(--lp-line)] text-[15px] text-[var(--lp-dim)]"
          :aria-label="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          @click="toggleTheme"
        >
          ◐
        </button>
        <router-link
          to="/login"
          class="lp-mono hidden rounded-[3px] border border-[var(--lp-line)] px-[18px] py-[11px] text-xs uppercase tracking-[0.1em] text-[var(--lp-dim)] sm:inline-block"
        >
          {{ t('landing.nav.login') }}
        </router-link>
        <router-link
          to="/register"
          class="lp-mono inline-block rounded-[3px] bg-[var(--lp-accent)] px-[18px] py-[11px] text-xs font-bold uppercase tracking-[0.1em] text-[var(--lp-accent-ink)]"
        >
          {{ t('landing.nav.getApiKey') }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import { useAppStore } from '@/stores/app'
import { sanitizeUrl } from '@/utils/url'
import { scrollToSection } from '@/utils/landingScroll'

const { t } = useI18n()
const appStore = useAppStore()

// Whether the pricing board rendered any rows. LandingDefault owns the fetch
// and therefore owns the answer; the nav only decides whether to offer a link
// to it. Login and "get API key" are already router-links to the real /login
// and /register routes and need no gate.
withDefaults(defineProps<{ hasPricing?: boolean }>(), { hasPricing: false })

// Site identity, read from public settings exactly like HomeView.vue does.
// sanitizeUrl() is load-bearing here: an admin-supplied javascript: URL in
// site_logo or doc_url must never become a live link/src.
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() =>
  sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', {
    allowRelative: true,
    allowDataUrl: true
  })
)
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))

// Theme toggle: LandingNav owns this exclusively (lifted from HomeView.vue:524-528).
// Theme INITIALISATION is intentionally NOT duplicated here — main.ts's
// initThemeClass() already applies the persisted/preferred theme to
// <html> before the app mounts, so this component only needs to reflect
// and flip the current state.
const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>
