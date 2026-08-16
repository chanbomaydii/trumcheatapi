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
              <h3 class="text-2xl font-semibold uppercase tracking-[0.02em]">{{ t(step.titleKey) }}</h3>
              <p class="mt-1.5 text-base font-normal leading-[1.5] text-[var(--lp-mute)]">{{ t(step.descKey) }}</p>
            </div>
          </div>
        </div>

        <pre class="lp-mono overflow-auto rounded border border-[var(--lp-board-line)] bg-[var(--lp-code-bg)] p-[26px] text-[13px] leading-[1.85] text-[var(--lp-board-ink)]"><span class="text-[var(--lp-board-dim)]">{{ t('landing.steps.code.comment') }}</span>
from openai import OpenAI

client = OpenAI(
    <span class="text-[var(--lp-accent)]">base_url</span>=<span class="text-[var(--lp-ok)]">"https://api.trumcheat.dev/v1"</span>,
    <span class="text-[var(--lp-accent)]">api_key</span>=<span class="text-[var(--lp-ok)]">"tc-•••••••••••••••"</span>,
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
import { useI18n } from 'vue-i18n'
import FlapText from './FlapText.vue'

const { t } = useI18n()

const steps = [
  { num: '01', titleKey: 'landing.steps.step1.title', descKey: 'landing.steps.step1.desc' },
  { num: '02', titleKey: 'landing.steps.step2.title', descKey: 'landing.steps.step2.desc' },
  { num: '03', titleKey: 'landing.steps.step3.title', descKey: 'landing.steps.step3.desc' }
]
</script>
