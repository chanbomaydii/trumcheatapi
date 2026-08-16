<template>
  <!--
    Mockup source: <div class="board">.

    The board is the redesign's centrepiece and must never misrepresent where
    its numbers came from (see useLandingBoard.ts) or show a header/table
    shell with nothing underneath it, so the whole section is gated on
    `rows.length > 0` with a single v-if.
  -->
  <section v-if="rows.length > 0" class="lp-root border-t border-[var(--lp-line)] py-16 sm:py-24">
    <div class="mx-auto max-w-[1200px] px-6 sm:px-10">
      <div
        class="overflow-hidden rounded border border-[var(--lp-board-line)] bg-[var(--lp-board-bg)] text-[var(--lp-board-ink)]"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--lp-board-line)] bg-[var(--lp-board-head)] px-[22px] py-[14px]"
        >
          <span class="lp-mono text-[11px] uppercase tracking-[0.24em] text-[var(--lp-board-dim)]">
            {{ usingFallback ? t('landing.board.referenceLabel') : t('landing.board.liveLabel') }}
          </span>
          <span class="lp-mono text-[11px] uppercase tracking-[0.24em] text-[var(--lp-board-dim)]">
            {{ t('landing.board.unit') }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th
                  class="w-[34%] border-b border-[var(--lp-board-line)] px-[22px] py-[13px] text-left text-[13px] font-normal text-[var(--lp-board-dim)]"
                >
                  {{ t('landing.board.columns.model') }}
                </th>
                <th
                  class="border-b border-[var(--lp-board-line)] px-[22px] py-[13px] text-left text-[13px] font-normal text-[var(--lp-board-dim)]"
                >
                  {{ t('landing.board.columns.provider') }}
                </th>
                <th
                  class="border-b border-[var(--lp-board-line)] px-[22px] py-[13px] text-right text-[13px] font-normal text-[var(--lp-board-dim)]"
                >
                  {{ t('landing.board.columns.input') }}
                </th>
                <th
                  class="border-b border-[var(--lp-board-line)] px-[22px] py-[13px] text-right text-[13px] font-normal text-[var(--lp-board-dim)]"
                >
                  {{ t('landing.board.columns.output') }}
                </th>
                <th
                  class="border-b border-[var(--lp-board-line)] px-[22px] py-[13px] text-right text-[13px] font-normal text-[var(--lp-board-dim)]"
                >
                  <!-- Names the output price explicitly: savingPct is computed
                       from the output price only, so a bare "Saving" header
                       would read as a claim about the whole row. -->
                  {{ t('landing.board.columns.savingOutput') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.name" class="border-b border-[var(--lp-board-line-soft)] last:border-b-0">
                <td class="h-14 px-[22px] align-middle">
                  <FlapText :text="row.name.toUpperCase()" animate />
                </td>
                <td class="lp-mono h-14 px-[22px] align-middle text-[12px] tracking-[0.06em] text-[var(--lp-board-dim)]">
                  {{ row.platform.toUpperCase() }}
                </td>
                <td class="lp-mono h-14 px-[22px] text-right align-middle text-[15px]">
                  <s v-if="row.inputOfficial !== null" class="mr-2.5 text-[13px] text-[var(--lp-board-dim)]">{{
                    money(row.inputOfficial)
                  }}</s
                  >{{ money(row.inputActual) }}
                </td>
                <td class="lp-mono h-14 px-[22px] text-right align-middle text-[15px]">
                  <s v-if="row.outputOfficial !== null" class="mr-2.5 text-[13px] text-[var(--lp-board-dim)]">{{
                    money(row.outputOfficial)
                  }}</s
                  >{{ money(row.outputActual) }}
                </td>
                <td class="h-14 px-[22px] text-right align-middle">
                  <!--
                    A null savingPct means the vendor reference price is
                    unavailable, not that saving is zero — the row above is
                    still true and still shown, so this cell must render as
                    "no comparison available", never a fabricated badge.
                  -->
                  <span
                    v-if="row.savingPct !== null"
                    data-testid="saving-badge"
                    class="lp-mono inline-flex items-center rounded-sm bg-[var(--lp-tile)] px-2 py-1 text-[13px] font-bold text-[var(--lp-board-ink)]"
                  >
                    <span class="sr-only">{{ t('landing.board.columns.savingOutput') }}: </span
                    >−{{ row.savingPct }}%
                  </span>
                  <span v-else class="lp-mono text-[13px] text-[var(--lp-board-dim)]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FlapText from './FlapText.vue'
import { useLandingBoard } from '@/composables/useLandingBoard'

const { t } = useI18n()
const { rows, usingFallback, load } = useLandingBoard(5)

function money(value: number): string {
  return `$${value.toFixed(2)}`
}

onMounted(load)
</script>
