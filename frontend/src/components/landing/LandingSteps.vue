<template>
  <!-- Mockup source: <section> headed "01 / CÁCH DÙNG" -->
  <section class="lp-root border-t border-[var(--lp-line)] py-16 sm:py-24">
    <div class="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div class="mb-[52px] flex flex-wrap items-baseline gap-5">
        <span class="lp-mono whitespace-nowrap text-[11px] tracking-[0.24em] text-[var(--lp-accent)]">
          {{ t('landing.steps.secnum') }}
        </span>
        <h2 class="text-[32px] font-semibold uppercase tracking-[-0.01em] sm:text-[42px] lg:text-[52px]">
          {{ t('landing.steps.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
        <div>
          <div
            v-for="step in steps"
            :key="step.num"
            class="flex gap-5 border-b border-[var(--lp-line)] py-[22px] last:border-b-0"
          >
            <span class="shrink-0"><FlapText :text="step.num" /></span>
            <div>
              <h3 class="text-2xl font-semibold uppercase tracking-[0.02em]">{{ step.title }}</h3>
              <p class="mt-1.5 text-base font-normal leading-[1.5] text-[var(--lp-mute)]">{{ step.desc }}</p>
            </div>
          </div>
        </div>

        <pre class="lp-mono overflow-auto rounded border border-[var(--lp-board-line)] bg-[var(--lp-code-bg)] p-[26px] text-[13px] leading-[1.85] text-[var(--lp-board-ink)]"><span class="text-[var(--lp-board-dim)]">{{ t('landing.steps.code.comment') }}</span>
from openai import OpenAI

client = OpenAI(
    <span class="text-[var(--lp-accent)]">base_url</span>=<span class="text-[var(--lp-ok)]">"{{ baseUrl }}"</span>,
    <span class="text-[var(--lp-accent)]">api_key</span>=<span class="text-[var(--lp-ok)]">"{{ apiKeyPlaceholder }}"</span>,
)

resp = client.chat.completions.create(
    <span class="text-[var(--lp-accent)]">model</span>=<span class="text-[var(--lp-ok)]">"claude-opus-5"</span>,
    <span class="text-[var(--lp-accent)]">messages</span>=[{<span class="text-[var(--lp-ok)]">"role"</span>: <span class="text-[var(--lp-ok)]">"user"</span>,
                <span class="text-[var(--lp-ok)]">"content"</span>: <span class="text-[var(--lp-ok)]">"{{ t('landing.steps.code.greeting') }}"</span>}],
)</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FlapText from './FlapText.vue'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()
const appStore = useAppStore()

// The snippet is copy-pasteable instructions, so a wrong concrete value is
// worse than no value: this is an open-source gateway other people deploy, and
// the hardcoded "https://api.trumcheat.dev/v1" was wrong for every deployment
// but one. api_base_url is the operator-configured public gateway URL (same
// source KeysView.vue uses for its usage-endpoint snippet); the browser's own
// origin is the correct fallback because the page is being served from the
// gateway the visitor would call.
const baseUrl = computed(() => {
  const configured = appStore.cachedPublicSettings?.api_base_url || appStore.apiBaseUrl || ''
  const origin = (configured || window.location.origin).replace(/\/+$/, '')
  return `${origin}/v1`
})

// The repo's configured default key prefix (config.go: default.api_key_prefix,
// setup.go's generated config). Operators can change it, but "sk-" is what a
// stock deployment actually issues — "tc-" was issued by nothing.
const apiKeyPlaceholder = 'sk-•••••••••••••••'

// Same source and same fallback chain as LandingNav's <b>{{ siteName }}</b>:
// step 3's copy names the gateway, and hardcoding one deployment's brand into
// an open-source landing page is the footer's bug in a second place.
const siteName = computed(
  () => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API'
)

// Step 2's copy repeats the hero's "N models" claim. Same rule as the hero:
// the real count is a later task's job to wire in from live data; without it
// this renders non-numeric phrasing instead of a stale/invented figure.
const props = defineProps<{ modelCount?: number | null }>()

const steps = computed(() => [
  { num: '01', title: t('landing.steps.step1.title'), desc: t('landing.steps.step1.desc') },
  {
    num: '02',
    title: t('landing.steps.step2.title'),
    desc:
      props.modelCount != null
        ? t('landing.steps.step2.descWithCount', { count: props.modelCount })
        : t('landing.steps.step2.descPlain')
  },
  { num: '03', title: t('landing.steps.step3.title'), desc: t('landing.steps.step3.desc', { siteName: siteName.value }) }
])
</script>
