import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AmountInput from '../AmountInput.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

describe('AmountInput VND formatting', () => {
  it('formats quick amounts and the selected value with Vietnamese separators', async () => {
    const wrapper = mount(AmountInput, {
      props: {
        modelValue: null,
        amounts: [10000, 20000],
        currency: 'VND',
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons[0].text()).toBe('10.000₫')
    expect(buttons[1].text()).toBe('20.000₫')

    await buttons[0].trigger('click')

    expect(wrapper.get('input').element.value).toBe('10.000')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([10000])
  })

  it('accepts grouped VND input and emits its unformatted numeric value', async () => {
    const wrapper = mount(AmountInput, {
      props: {
        modelValue: null,
        currency: 'VND',
      },
    })

    await wrapper.get('input').setValue('26000')

    expect(wrapper.get('input').element.value).toBe('26.000')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([26000])
  })
})