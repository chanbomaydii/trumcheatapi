import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('@/api/client', () => ({ apiClient: { get, post } }))

import { resellerAPI } from '@/api/reseller'

describe('reseller API contract', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('sends transfer amount with Idempotency-Key', async () => {
    post.mockResolvedValue({ data: { amount: 12 } })

    await resellerAPI.transfer(7, 12, 'transfer-7')

    expect(post).toHaveBeenCalledWith(
      '/reseller/users/7/transfer',
      { amount: 12 },
      { headers: { 'Idempotency-Key': 'transfer-7' } },
    )
  })

  it('sends CDKey batch request with Idempotency-Key', async () => {
    post.mockResolvedValue({ data: { codes: [] } })

    await resellerAPI.createCodes(5, 20, 7, 'batch-5')

    expect(post).toHaveBeenCalledWith(
      '/reseller/codes',
      { count: 5, value: 20, expires_in_days: 7 },
      { headers: { 'Idempotency-Key': 'batch-5' } },
    )
  })

  it('exports the active search and status filters as a CSV blob', async () => {
    get.mockResolvedValue({ data: new Blob() })

    await resellerAPI.exportCodes({ search: 'ABC', status: 'unused' })

    expect(get).toHaveBeenCalledWith('/reseller/codes/export', {
      params: { search: 'ABC', status: 'unused' },
      responseType: 'blob',
    })
  })
})