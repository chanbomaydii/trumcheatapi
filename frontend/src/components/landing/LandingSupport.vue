<template>
  <!-- Mockup source: <section> headed "04 / HỖ TRỢ" -->
  <section class="lp-root border-t border-[var(--lp-line)] py-16 sm:py-24">
    <div class="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div class="mb-[52px] flex flex-wrap items-baseline gap-5">
        <span class="lp-mono whitespace-nowrap text-[11px] tracking-[0.24em] text-[var(--lp-accent)]">
          {{ t('landing.support.secnum') }}
        </span>
        <h2 class="text-[32px] font-semibold uppercase tracking-[-0.01em] sm:text-[42px] lg:text-[52px]">
          {{ t('landing.support.heading') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <div class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]">
          <div class="lp-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-dim)]">
            {{ t('landing.support.telegram.channel') }}
          </div>
          <h4 class="mb-2 mt-3 text-2xl font-semibold uppercase tracking-[0.02em]">
            {{ t('landing.support.telegram.title') }} <span class="text-[var(--lp-accent)]">↗</span>
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.telegram.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.telegram.responseTime') }}
          </span>
        </div>

        <div class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]">
          <div class="lp-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-dim)]">
            {{ t('landing.support.zalo.channel') }}
          </div>
          <h4 class="mb-2 mt-3 text-2xl font-semibold uppercase tracking-[0.02em]">
            {{ t('landing.support.zalo.title') }} <span class="text-[var(--lp-accent)]">↗</span>
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.zalo.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.zalo.hours') }}
          </span>
        </div>

        <div class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]">
          <div class="lp-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-dim)]">
            {{ t('landing.support.email.channel') }}
          </div>
          <h4 class="mb-2 mt-3 text-2xl font-semibold uppercase tracking-[0.02em]">
            {{ t('landing.support.email.title') }} <span class="text-[var(--lp-accent)]">↗</span>
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.email.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.email.responseTime') }}
          </span>
        </div>
      </div>

      <div
        class="lp-mono flex flex-col gap-2 border border-t-0 border-[var(--lp-line)] bg-[var(--lp-panel)] px-[26px] py-5 text-xs uppercase tracking-[0.12em] text-[var(--lp-dim)] sm:flex-row sm:items-center sm:justify-between"
      >
        <div>{{ t('landing.support.sla.statusPage') }}</div>
        <div>
          <b class="font-medium text-[var(--lp-ink)]">99,98%</b> {{ t('landing.support.sla.uptimeLabel') }}
          &nbsp;·&nbsp;
          <b class="font-medium text-[var(--lp-ink)]">0</b> {{ t('landing.support.sla.incidentsLabel') }}
          &nbsp;·&nbsp;
          {{ t('landing.support.sla.updatedLabel') }}
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
