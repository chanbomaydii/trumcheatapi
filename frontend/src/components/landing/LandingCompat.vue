<template>
  <!-- Mockup source: <section> headed "02 / TƯƠNG THÍCH" -->
  <section class="lp-root border-t border-[var(--lp-line)] py-16 sm:py-24">
    <div class="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div class="mb-[52px] flex flex-wrap items-baseline gap-5">
        <span class="lp-mono whitespace-nowrap text-[11px] tracking-[0.24em] text-[var(--lp-accent)]">
          {{ t('landing.compat.secnum') }}
        </span>
        <h2 class="text-[32px] font-semibold uppercase tracking-[-0.01em] sm:text-[42px] lg:text-[52px]">
          {{ t('landing.compat.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <div
          v-for="provider in providers"
          :key="provider.name"
          class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]"
        >
          <h4 class="flex items-center justify-between text-xl font-semibold uppercase tracking-[0.04em]">
            {{ provider.name }}
            <span
              class="lp-mono rounded-[2px] border border-[var(--lp-accent)] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[var(--lp-accent)]"
            >{{ t('landing.compat.badge') }}</span>
          </h4>
          <div
            v-for="ep in provider.endpoints"
            :key="ep"
            class="lp-mono mt-2.5 rounded-[3px] bg-[var(--lp-accent-soft)] px-3 py-2.5 text-xs text-[var(--lp-mute)]"
          >
            <b class="font-medium text-[var(--lp-accent)]">{{ ep.split(' ')[0] }}</b> {{ ep.split(' ').slice(1).join(' ') }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Provider names and endpoint paths are technical/API surface, not
// Vietnamese copy, so they are not routed through t().
const providers = [
  {
    name: 'OpenAI',
    endpoints: ['POST /v1/chat/completions', 'POST /v1/responses', 'POST /v1/embeddings']
  },
  {
    name: 'Anthropic',
    endpoints: ['POST /v1/messages', 'POST /v1/messages/count_tokens', 'GET /v1/models']
  },
  {
    name: 'Gemini',
    endpoints: ['POST /v1beta/…:generateContent', 'POST /v1beta/…:streamGenerate', 'GET /v1beta/models']
  }
]
</script>
