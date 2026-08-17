import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CodesView from '../CodesView.vue'

const { listCodes, createCodes } = vi.hoisted(() => ({ listCodes: vi.fn(), createCodes: vi.fn() }))

const SelectStub = {
  name: 'SelectStub',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    options: { type: Array, default: () => [] }
  },
  template: '<select :value="modelValue"><option value="balance">Balance</option></select>'
}

vi.mock('@/api', () => ({
  resellerAPI: {
    listCodes,
    createCodes,
    exportCodes: vi.fn()
  }
}))

vi.mock('@/stores', () => ({
  useAppStore: () => ({ showError: vi.fn(), showSuccess: vi.fn() })
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

describe('reseller CDKey dialog', () => {
  beforeEach(() => {
    listCodes.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20, pages: 0 })
    createCodes.mockResolvedValue({ codes: [], total_value: 0 })
  })

  it('matches the Root/Admin CDKey fields and defaults', async () => {
    const wrapper = mount(CodesView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          BaseDialog: {
            props: ['show', 'title'],
            template: '<section v-if="show"><h2>{{ title }}</h2><slot /><slot name="footer" /></section>'
          },
          Pagination: true,
          Select: SelectStub
        }
      }
    })

    await flushPromises()
    await wrapper.get('.btn-primary').trigger('click')

    expect(wrapper.text()).toContain('reseller.codes.createCDKeys')
    expect(wrapper.text()).toContain('reseller.codes.codeType')
    expect(wrapper.text()).toContain('reseller.codes.amount')
    expect(wrapper.text()).toContain('reseller.codes.codeExpiry')
    expect(wrapper.text()).toContain('reseller.codes.count')
    expect(wrapper.getComponent(SelectStub).props('disabled')).toBe(true)
    expect((wrapper.get('#code-value').element as HTMLInputElement).value).toBe('10')
    expect((wrapper.get('#code-count').element as HTMLInputElement).value).toBe('1')
    expect(wrapper.get('#code-count').attributes('max')).toBe('1000')
    expect(wrapper.findAll('[data-test^="expiry-"]')).toHaveLength(5)
    expect(wrapper.findAll('[data-test^="expiry-"][disabled]')).toHaveLength(0)

    await wrapper.get('[data-test="expiry-7"]').trigger('click')
    const createButton = wrapper.findAll('section .btn-primary').at(-1)
    await createButton?.trigger('click')
    await flushPromises()

    expect(createCodes).toHaveBeenCalledWith(1, 10, 7, expect.any(String))
  })

  it('shows and validates a custom expiry input', async () => {
    const wrapper = mount(CodesView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          BaseDialog: {
            props: ['show', 'title'],
            template: '<section v-if="show"><h2>{{ title }}</h2><slot /><slot name="footer" /></section>'
          },
          Pagination: true,
          Select: SelectStub
        }
      }
    })

    await flushPromises()
    await wrapper.get('.btn-primary').trigger('click')
    await wrapper.get('[data-test="expiry-custom"]').trigger('click')

    const input = wrapper.get('[data-test="custom-expiry-days"]')
    expect((input.element as HTMLInputElement).value).toBe('30')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('3650')
  })
})