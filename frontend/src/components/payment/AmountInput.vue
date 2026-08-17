<template>
  <div class="space-y-4">
    <!-- Quick Amount Buttons -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.quickAmounts') }}
      </label>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="amt in filteredAmounts"
          :key="amt"
          type="button"
          :class="[
            'rounded-lg border-2 px-4 py-3 text-center font-medium transition-colors',
            modelValue === amt
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/40 dark:text-primary-300'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-dark-500',
          ]"
          @click="selectAmount(amt)"
        >
      {{ formatQuickAmountLabel(amt) }}
        </button>
      </div>
    </div>

    <!-- Custom Amount Input -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.customAmount') }}
      </label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-500">
		  {{ amountSymbol }}
        </span>
        <input
          type="text"
          inputmode="decimal"
          :value="customText"
          :placeholder="placeholderText"
          class="input w-full py-3 pl-8 pr-4"
          @input="handleInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  amounts?: number[]
  modelValue: number | null
  min?: number
  max?: number
	 currency?: string
}>(), {
  amounts: () => [10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
  min: 0,
  max: 0,
	 currency: 'USD',
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const { t } = useI18n()

const customText = ref('')
const normalizedCurrency = computed(() => String(props.currency || 'USD').trim().toUpperCase())
const amountSymbol = computed(() => normalizedCurrency.value === 'VND' ? '₫' : normalizedCurrency.value === 'USD' ? '$' : normalizedCurrency.value)
const fractionDigits = computed(() => normalizedCurrency.value === 'VND' ? 0 : 2)
const numberLocale = computed(() => normalizedCurrency.value === 'VND' ? 'vi-VN' : undefined)

// 0 = no limit
const filteredAmounts = computed(() =>
  props.amounts.filter((a) => (props.min <= 0 || a >= props.min) && (props.max <= 0 || a <= props.max))
)

const placeholderText = computed(() => {
  if (props.min > 0 && props.max > 0) return `${formatQuickAmount(props.min)} - ${formatQuickAmount(props.max)}`
  if (props.min > 0) return `≥ ${formatQuickAmount(props.min)}`
  if (props.max > 0) return `≤ ${formatQuickAmount(props.max)}`
  return t('payment.enterAmount')
})

function formatQuickAmount(amount: number): string {
  return new Intl.NumberFormat(numberLocale.value, { maximumFractionDigits: fractionDigits.value }).format(amount)
}

function formatQuickAmountLabel(amount: number): string {
  return `${formatQuickAmount(amount)}${amountSymbol.value}`
}

function selectAmount(amt: number) {
  customText.value = formatQuickAmount(amt)
  emit('update:modelValue', amt)
}

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (normalizedCurrency.value === 'VND') {
    const digits = val.replace(/\./g, '')
    if (!/^\d*$/.test(digits)) return
    customText.value = digits === '' ? '' : formatQuickAmount(Number(digits))
    emit('update:modelValue', digits === '' || Number(digits) <= 0 ? null : Number(digits))
    return
  }
  const pattern = fractionDigits.value === 0 ? /^\d*$/ : /^\d*(\.\d{0,2})?$/
  if (!pattern.test(val)) return
  customText.value = val
  if (val === '') {
    emit('update:modelValue', null)
    return
  }
  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) {
    emit('update:modelValue', num)
  } else {
    emit('update:modelValue', null)
  }
}

watch(() => props.modelValue, (v) => {
  if (v === null) {
    customText.value = ''
    return
  }
  if (v !== null && String(v) !== customText.value) {
    customText.value = normalizedCurrency.value === 'VND' ? formatQuickAmount(v) : String(v)
  }
}, { immediate: true })

watch(normalizedCurrency, () => {
  customText.value = props.modelValue === null
    ? ''
    : normalizedCurrency.value === 'VND' ? formatQuickAmount(props.modelValue) : String(props.modelValue)
})
</script>
