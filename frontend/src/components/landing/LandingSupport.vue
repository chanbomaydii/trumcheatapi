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
            {{ t('landing.support.telegram.title') }}
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.telegram.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.telegram.note') }}
          </span>
        </div>

        <div class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]">
          <div class="lp-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-dim)]">
            {{ t('landing.support.zalo.channel') }}
          </div>
          <h4 class="mb-2 mt-3 text-2xl font-semibold uppercase tracking-[0.02em]">
            {{ t('landing.support.zalo.title') }}
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.zalo.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.zalo.note') }}
          </span>
        </div>

        <div class="rounded border border-[var(--lp-line)] bg-[var(--lp-panel)] p-[26px]">
          <div class="lp-mono text-[10px] uppercase tracking-[0.22em] text-[var(--lp-dim)]">
            {{ t('landing.support.email.channel') }}
          </div>
          <h4 class="mb-2 mt-3 text-2xl font-semibold uppercase tracking-[0.02em]">
            {{ t('landing.support.email.title') }}
          </h4>
          <p class="text-[15px] font-normal leading-[1.55] text-[var(--lp-mute)]">{{ t('landing.support.email.desc') }}</p>
          <span class="lp-mono mt-4 block text-[11px] uppercase tracking-[0.12em] text-[var(--lp-ok)]">
            {{ t('landing.support.email.note') }}
          </span>
        </div>
      </div>

      <!--
        The mockup's SLA bar is gone entirely. Its uptime/incident-count/
        last-updated figures were invented (hardcoded "99,98%" / "0" bypassing
        i18n, plus a fake "cập nhật 04:12" timestamp) and were removed in an
        earlier round; the "public status page · incident history" pointer that
        survived them advertised something that does not exist either. There is
        no status page and no incident history to link to, so the claim goes
        with the numbers rather than sitting here as the last unbacked line on
        the section.

        The three cards above are plain <div>s and carry no href, so they no
        longer render an "↗" external-link glyph: an affordance that looks
        clickable and is not is a false promise, however small.
      -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
