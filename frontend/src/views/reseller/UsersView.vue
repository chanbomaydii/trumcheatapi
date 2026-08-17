<template>
  <AppLayout><div class="space-y-6">
    <section class="flex flex-col gap-4 border-b border-gray-200 pb-5 dark:border-dark-700 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('reseller.profile.affiliateCode') }}</p>
        <p class="mt-1 font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ profile?.affiliate_code || '-' }}</p>
      </div>
      <div class="sm:text-right">
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('common.balance') }}</p>
        <p class="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(profile?.balance || 0) }}</p>
      </div>
    </section>

    <section class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-800">
      <div v-if="loading" class="p-10 text-center text-sm text-gray-500">{{ t('common.loading') }}</div>
      <div v-else-if="users.length === 0" class="p-10 text-center text-sm text-gray-500">{{ t('reseller.users.empty') }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead class="bg-gray-50 dark:bg-dark-900/60">
            <tr>
              <th v-for="key in ['user', 'status', 'balance', 'totalRecharged', 'invitedAt', 'actions']" :key="key" class="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                {{ t(`reseller.users.${key}`) }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
            <tr v-for="row in users" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-dark-700/50">
              <td class="whitespace-nowrap px-4 py-3">
                <div class="font-medium text-gray-900 dark:text-white">{{ row.username }}</div>
                <div class="text-xs text-gray-500">{{ row.email }}</div>
              </td>
              <td class="px-4 py-3"><span :class="row.status === 'active' ? 'badge badge-success' : 'badge badge-gray'">{{ t(`reseller.status.${row.status}`) }}</span></td>
              <td class="whitespace-nowrap px-4 py-3 text-sm">{{ formatCurrency(row.balance) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-sm">{{ formatCurrency(row.total_recharged) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{{ formatDateTime(row.invited_at) }}</td>
              <td class="whitespace-nowrap px-4 py-3">
                <div class="flex gap-2">
                  <button class="btn btn-secondary btn-sm" @click="openUsage(row)">{{ t('reseller.users.viewUsage') }}</button>
                  <button class="btn btn-primary btn-sm" :disabled="row.status !== 'active'" @click="openTransfer(row)">{{ t('reseller.users.transfer') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Pagination v-if="total > 0" :total="total" :page="page" :page-size="pageSize" @update:page="changePage" @update:page-size="changePageSize" />
    </section>

    <BaseDialog :show="usageOpen" :title="t('reseller.users.usageTitle', { user: selectedUser?.username || '' })" width="wide" @close="usageOpen = false">
      <div v-if="usageLoading" class="p-8 text-center text-sm text-gray-500">{{ t('common.loading') }}</div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-dark-700">
          <thead><tr><th class="px-3 py-2 text-left">{{ t('reseller.usage.model') }}</th><th class="px-3 py-2 text-right">{{ t('reseller.usage.tokens') }}</th><th class="px-3 py-2 text-right">{{ t('reseller.usage.cost') }}</th><th class="px-3 py-2 text-left">{{ t('reseller.usage.time') }}</th></tr></thead>
          <tbody><tr v-for="item in usage" :key="item.id"><td class="px-3 py-2">{{ item.model }}</td><td class="px-3 py-2 text-right">{{ item.input_tokens + item.output_tokens }}</td><td class="px-3 py-2 text-right">{{ formatCurrency(item.actual_cost) }}</td><td class="whitespace-nowrap px-3 py-2">{{ formatDateTime(item.created_at) }}</td></tr></tbody>
        </table>
        <p v-if="usage.length === 0" class="p-8 text-center text-gray-500">{{ t('reseller.users.noUsage') }}</p>
      </div>
      <Pagination v-if="usageTotal > 0" :total="usageTotal" :page="usagePage" :page-size="usagePageSize" :show-page-size-selector="false" @update:page="loadUsage" />
    </BaseDialog>

    <BaseDialog :show="transferOpen" :title="t('reseller.users.transferTitle')" width="narrow" @close="closeTransfer">
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('reseller.users.transferTo', { user: selectedUser?.username || '' }) }}</p>
        <div><label class="input-label" for="transfer-amount">{{ t('reseller.users.amount') }}</label><input id="transfer-amount" v-model.number="transferAmount" class="input" type="number" min="0.01" step="0.01" /></div>
      </div>
      <template #footer><div class="flex justify-end gap-3"><button class="btn btn-secondary" @click="closeTransfer">{{ t('common.cancel') }}</button><button class="btn btn-primary" :disabled="transferAmount <= 0" @click="confirmTransfer = true">{{ t('common.continue') }}</button></div></template>
    </BaseDialog>
    <ConfirmDialog :show="confirmTransfer" :title="t('reseller.users.confirmTitle')" :message="t('reseller.users.confirmMessage', { amount: formatCurrency(transferAmount), user: selectedUser?.username || '' })" :confirm-text="t('common.confirm')" @confirm="submitTransfer" @cancel="confirmTransfer = false" />
  </div></AppLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resellerAPI, type ResellerProfile, type ResellerUser } from '@/api'
import type { UsageLog } from '@/types'
import { useAppStore } from '@/stores'
import { formatCurrency, formatDateTime } from '@/utils/format'
import BaseDialog from '@/components/common/BaseDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Pagination from '@/components/common/Pagination.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const { t } = useI18n()
const appStore = useAppStore()
const profile = ref<ResellerProfile | null>(null)
const users = ref<ResellerUser[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedUser = ref<ResellerUser | null>(null)
const usageOpen = ref(false)
const usageLoading = ref(false)
const usage = ref<UsageLog[]>([])
const usagePage = ref(1)
const usagePageSize = 20
const usageTotal = ref(0)
const transferOpen = ref(false)
const confirmTransfer = ref(false)
const transferAmount = ref(0)

function errorMessage(error: unknown) { return error instanceof Error ? error.message : String((error as { message?: string })?.message || t('common.error')) }
function makeIdempotencyKey(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}` }

async function loadData() {
  loading.value = true
  try {
    const [profileData, result] = await Promise.all([resellerAPI.getProfile(), resellerAPI.listUsers(page.value, pageSize.value)])
    profile.value = profileData
    users.value = result.items
    total.value = result.total
  } catch (error) { appStore.showError(errorMessage(error)) } finally { loading.value = false }
}
function changePage(value: number) { page.value = value; void loadData() }
function changePageSize(value: number) { pageSize.value = value; page.value = 1; void loadData() }
function openUsage(user: ResellerUser) { selectedUser.value = user; usageOpen.value = true; void loadUsage(1) }
async function loadUsage(value: number) {
  if (!selectedUser.value) return
  usagePage.value = value; usageLoading.value = true
  try { const result = await resellerAPI.listUserUsage(selectedUser.value.id, value, usagePageSize); usage.value = result.items; usageTotal.value = result.total }
  catch (error) { appStore.showError(errorMessage(error)) } finally { usageLoading.value = false }
}
function openTransfer(user: ResellerUser) { selectedUser.value = user; transferAmount.value = 0; transferOpen.value = true }
function closeTransfer() { transferOpen.value = false; confirmTransfer.value = false }
async function submitTransfer() {
  if (!selectedUser.value || transferAmount.value <= 0) return
  try {
    const result = await resellerAPI.transfer(selectedUser.value.id, transferAmount.value, makeIdempotencyKey('transfer'))
    if (profile.value) profile.value.balance = result.reseller_balance_after
    appStore.showSuccess(t('reseller.users.transferSuccess'))
    closeTransfer(); await loadData()
  } catch (error) { appStore.showError(errorMessage(error)); confirmTransfer.value = false }
}
onMounted(loadData)
</script>