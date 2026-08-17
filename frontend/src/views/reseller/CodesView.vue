<template>
  <AppLayout><div class="space-y-6">
    <section class="grid gap-4 border-b border-gray-200 pb-5 dark:border-dark-700 lg:grid-cols-[1fr_auto] lg:items-end">
      <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <input v-model="search" class="input" :placeholder="t('reseller.codes.searchPlaceholder')" @keyup.enter="applyFilters" />
        <select v-model="status" class="input" @change="applyFilters"><option value="">{{ t('reseller.codes.allStatuses') }}</option><option value="unused">{{ t('reseller.status.unused') }}</option><option value="used">{{ t('reseller.status.used') }}</option></select>
      </div>
      <div class="flex flex-wrap gap-2"><button class="btn btn-secondary" @click="exportCSV">{{ t('reseller.codes.export') }}</button><button class="btn btn-primary" @click="createOpen = true">{{ t('reseller.codes.createBatch') }}</button></div>
    </section>

    <section class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-800">
      <div v-if="loading" class="p-10 text-center text-sm text-gray-500">{{ t('common.loading') }}</div>
      <div v-else-if="codes.length === 0" class="p-10 text-center text-sm text-gray-500">{{ t('reseller.codes.empty') }}</div>
      <div v-else class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200 dark:divide-dark-700"><thead class="bg-gray-50 dark:bg-dark-900/60"><tr><th v-for="key in ['code', 'value', 'status', 'usedBy', 'usedAt', 'expiresAt', 'createdAt']" :key="key" class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{{ t(`reseller.codes.${key}`) }}</th></tr></thead><tbody class="divide-y divide-gray-100 dark:divide-dark-700"><tr v-for="item in codes" :key="item.id"><td class="whitespace-nowrap px-4 py-3"><button class="font-mono text-sm font-semibold text-primary-600" :title="t('reseller.codes.copy')" @click="copyCode(item.code)">{{ item.code }}</button></td><td class="px-4 py-3">{{ formatCurrency(item.value) }}</td><td class="px-4 py-3"><span :class="item.status === 'unused' ? 'badge badge-success' : 'badge badge-gray'">{{ t(`reseller.status.${item.status}`, item.status) }}</span></td><td class="px-4 py-3">{{ item.used_by || '-' }}</td><td class="whitespace-nowrap px-4 py-3">{{ item.used_at ? formatDateTime(item.used_at) : '-' }}</td><td class="whitespace-nowrap px-4 py-3">{{ item.expires_at ? formatDateTime(item.expires_at) : t('reseller.codes.neverExpires') }}</td><td class="whitespace-nowrap px-4 py-3">{{ formatDateTime(item.created_at) }}</td></tr></tbody></table></div>
      <Pagination v-if="total > 0" :total="total" :page="page" :page-size="pageSize" @update:page="changePage" @update:page-size="changePageSize" />
    </section>

    <BaseDialog :show="createOpen" :title="t('reseller.codes.createCDKeys')" width="narrow" @close="createOpen = false">
      <div class="space-y-4">
        <div>
          <label class="input-label">{{ t('reseller.codes.codeType') }}</label>
          <Select v-model="codeType" :options="codeTypeOptions" disabled />
        </div>
        <div>
          <label class="input-label" for="code-value">{{ t('reseller.codes.amount') }}</label>
          <input id="code-value" v-model.number="value" class="input" type="number" min="0.01" step="0.01" />
        </div>
        <div>
          <label class="input-label">{{ t('reseller.codes.codeExpiry') }}</label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <button
              v-for="option in expiryOptions"
              :key="option.value"
              :data-test="`expiry-${option.value}`"
              type="button"
              @click="expiryOption = option.value"
              :class="[
                'rounded-lg border px-3 py-2 text-sm transition-colors',
                expiryOption === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-dark-600 dark:text-gray-300 dark:hover:bg-dark-700'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
          <input
            v-if="expiryOption === 'custom'"
            data-test="custom-expiry-days"
            v-model.number="customExpiryDays"
            class="input mt-2"
            type="number"
            min="1"
            max="3650"
            :placeholder="t('reseller.codes.customDays')"
          />
        </div>
        <div>
          <label class="input-label" for="code-count">{{ t('reseller.codes.count') }}</label>
          <input id="code-count" v-model.number="count" class="input" type="number" min="1" max="1000" />
        </div>
        <p class="text-sm text-gray-500 dark:text-dark-400">
          {{ t('reseller.codes.totalValue', { total: formatCurrency(count * value) }) }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="btn btn-secondary" @click="createOpen = false">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" :disabled="creating || count < 1 || count > 1000 || value <= 0 || !expiryIsValid" @click="createBatch">{{ creating ? t('common.loading') : t('common.create') }}</button>
        </div>
      </template>
    </BaseDialog>

    <BaseDialog :show="createdOpen" :title="t('reseller.codes.createdTitle')" width="wide" @close="createdOpen = false"><p class="mb-4 text-sm text-gray-600 dark:text-gray-300">{{ t('reseller.codes.createdMessage', { count: createdCodes.length }) }}</p><div class="max-h-96 overflow-auto rounded-md border border-gray-200 dark:border-dark-700"><div v-for="item in createdCodes" :key="item.id" class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 last:border-0 dark:border-dark-700"><code class="break-all text-sm">{{ item.code }}</code><button class="btn btn-ghost btn-sm" @click="copyCode(item.code)">{{ t('reseller.codes.copy') }}</button></div></div><template #footer><div class="flex justify-end gap-3"><button class="btn btn-secondary" @click="copyAll">{{ t('reseller.codes.copyAll') }}</button><button class="btn btn-primary" @click="createdOpen = false">{{ t('common.close') }}</button></div></template></BaseDialog>
  </div></AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { saveAs } from 'file-saver'
import { resellerAPI, type ResellerCode } from '@/api'
import { useAppStore } from '@/stores'
import { formatCurrency, formatDateTime } from '@/utils/format'
import BaseDialog from '@/components/common/BaseDialog.vue'
import Select from '@/components/common/Select.vue'
import Pagination from '@/components/common/Pagination.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const { t } = useI18n(); const appStore = useAppStore()
const codes = ref<ResellerCode[]>([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = ref(20)
const search = ref(''); const status = ref(''); const createOpen = ref(false); const createdOpen = ref(false); const creating = ref(false)
const count = ref(1); const value = ref(10); const createdCodes = ref<ResellerCode[]>([])
const codeType = ref('balance')
type ExpiryOption = 'never' | '1' | '3' | '7' | 'custom'
const expiryOption = ref<ExpiryOption>('never')
const customExpiryDays = ref(30)
const codeTypeOptions = computed(() => [{ value: 'balance', label: t('reseller.codes.balance') }])
const expiryOptions = computed(() => [
  { value: 'never' as const, label: t('reseller.codes.neverExpires') },
  { value: '1' as const, label: t('reseller.codes.oneDay') },
  { value: '3' as const, label: t('reseller.codes.threeDays') },
  { value: '7' as const, label: t('reseller.codes.sevenDays') },
  { value: 'custom' as const, label: t('reseller.codes.custom') }
])
const expiryIsValid = computed(() => expiryOption.value !== 'custom' || (customExpiryDays.value >= 1 && customExpiryDays.value <= 3650))
const expiresInDays = computed(() => {
  if (expiryOption.value === 'never') return null
  if (expiryOption.value === 'custom') return Math.floor(customExpiryDays.value)
  return Number(expiryOption.value)
})
function errorMessage(error: unknown) { return error instanceof Error ? error.message : String((error as { message?: string })?.message || t('common.error')) }
function makeIdempotencyKey() { return `codes-${Date.now()}-${Math.random().toString(36).slice(2)}` }
function filters() { return { search: search.value.trim() || undefined, status: status.value || undefined } }
async function loadData() { loading.value = true; try { const result = await resellerAPI.listCodes(page.value, pageSize.value, filters()); codes.value = result.items; total.value = result.total } catch (error) { appStore.showError(errorMessage(error)) } finally { loading.value = false } }
function applyFilters() { page.value = 1; void loadData() }
function changePage(value: number) { page.value = value; void loadData() }
function changePageSize(value: number) { pageSize.value = value; page.value = 1; void loadData() }
async function createBatch() { creating.value = true; try { const result = await resellerAPI.createCodes(count.value, value.value, expiresInDays.value, makeIdempotencyKey()); createdCodes.value = result.codes; createOpen.value = false; createdOpen.value = true; appStore.showSuccess(t('reseller.codes.createSuccess')); await loadData() } catch (error) { appStore.showError(errorMessage(error)) } finally { creating.value = false } }
async function copyCode(code: string) { try { await navigator.clipboard.writeText(code); appStore.showSuccess(t('reseller.codes.copied')) } catch { appStore.showError(t('reseller.codes.copyFailed')) } }
async function copyAll() { await copyCode(createdCodes.value.map((item) => item.code).join('\n')) }
async function exportCSV() { try { const blob = await resellerAPI.exportCodes(filters()); saveAs(blob, 'codes.csv') } catch (error) { appStore.showError(errorMessage(error)) } }
onMounted(loadData)
</script>