<template>
  <!-- Mockup source: <section> headed "03 / HỎI ĐÁP" -->
  <section class="lp-root border-t border-[var(--lp-line)] py-16 sm:py-24">
    <div class="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div class="mb-[52px] flex flex-wrap items-baseline gap-5">
        <span class="lp-mono whitespace-nowrap text-[11px] tracking-[0.24em] text-[var(--lp-accent)]">
          {{ t('landing.faq.secnum') }}
        </span>
        <h2 class="text-[32px] font-semibold uppercase tracking-[-0.01em] sm:text-[42px] lg:text-[52px]">
          {{ t('landing.faq.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-x-[60px] lg:grid-cols-2">
        <div
          v-for="column in columns"
          :key="column[0].num"
          class="border-t border-[var(--lp-line)]"
        >
          <div
            v-for="item in column"
            :key="item.num"
            class="border-b border-[var(--lp-line)] py-[22px]"
          >
            <div class="flex items-baseline justify-between gap-[18px]">
              <h3 class="text-xl font-semibold leading-[1.3] tracking-[0.01em]">{{ t(item.questionKey) }}</h3>
              <span class="lp-mono shrink-0 text-[11px] tracking-[0.16em] text-[var(--lp-accent)]">{{ item.num }}</span>
            </div>
            <p class="mt-[9px] max-w-[50ch] text-base font-normal leading-[1.6] text-[var(--lp-mute)]">
              {{ t(item.answerKey) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const questions = [
  { num: '01', questionKey: 'landing.faq.q1.question', answerKey: 'landing.faq.q1.answer' },
  { num: '02', questionKey: 'landing.faq.q2.question', answerKey: 'landing.faq.q2.answer' },
  { num: '03', questionKey: 'landing.faq.q3.question', answerKey: 'landing.faq.q3.answer' },
  { num: '04', questionKey: 'landing.faq.q4.question', answerKey: 'landing.faq.q4.answer' },
  { num: '05', questionKey: 'landing.faq.q5.question', answerKey: 'landing.faq.q5.answer' },
  { num: '06', questionKey: 'landing.faq.q6.question', answerKey: 'landing.faq.q6.answer' }
]

// Mockup lays out the six questions as two hand-picked columns of three
// (not an even split by index parity).
const columns = [questions.slice(0, 3), questions.slice(3, 6)]
</script>
