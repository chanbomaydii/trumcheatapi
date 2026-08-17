import { apiClient } from './client'
import type { PaginatedResponse, UsageLog } from '@/types'

export interface ResellerProfile {
  id: number
  email: string
  username: string
  balance: number
  affiliate_code: string
}

export interface ResellerUser {
  id: number
  email: string
  username: string
  status: 'active' | 'disabled'
  balance: number
  total_recharged: number
  invited_at: string
}

export interface ResellerTransferResult {
  ledger_id: number
  amount: number
  reseller_balance_after: number
  target_balance_after: number
  replayed: boolean
}

export interface ResellerCode {
  id: number
  code: string
  value: number
  status: string
  used_by: number | null
  used_at: string | null
  expires_at: string | null
  created_at: string
}

export interface ResellerCodeBatchResult {
  ledger_id: number
  codes: ResellerCode[]
  total_value: number
  reseller_balance_after: number
  replayed: boolean
}

export const resellerAPI = {
  async getProfile(): Promise<ResellerProfile> {
    const { data } = await apiClient.get<ResellerProfile>('/reseller/profile')
    return data
  },

  async listUsers(page = 1, pageSize = 20): Promise<PaginatedResponse<ResellerUser>> {
    const { data } = await apiClient.get<PaginatedResponse<ResellerUser>>('/reseller/users', {
      params: { page, page_size: pageSize },
    })
    return data
  },

  async getUser(id: number): Promise<ResellerUser> {
    const { data } = await apiClient.get<ResellerUser>(`/reseller/users/${id}`)
    return data
  },

  async listUserUsage(id: number, page = 1, pageSize = 20): Promise<PaginatedResponse<UsageLog>> {
    const { data } = await apiClient.get<PaginatedResponse<UsageLog>>(`/reseller/users/${id}/usage`, {
      params: { page, page_size: pageSize },
    })
    return data
  },

  async transfer(id: number, amount: number, idempotencyKey: string): Promise<ResellerTransferResult> {
    const { data } = await apiClient.post<ResellerTransferResult>(
      `/reseller/users/${id}/transfer`,
      { amount },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
    return data
  },

  async listCodes(
    page = 1,
    pageSize = 20,
    filters: { search?: string; status?: string } = {},
  ): Promise<PaginatedResponse<ResellerCode>> {
    const { data } = await apiClient.get<PaginatedResponse<ResellerCode>>('/reseller/codes', {
      params: { page, page_size: pageSize, ...filters },
    })
    return data
  },

  async createCodes(count: number, value: number, expiresInDays: number | null, idempotencyKey: string): Promise<ResellerCodeBatchResult> {
    const { data } = await apiClient.post<ResellerCodeBatchResult>(
      '/reseller/codes',
      { count, value, ...(expiresInDays ? { expires_in_days: expiresInDays } : {}) },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    )
    return data
  },

  async getCode(id: number): Promise<ResellerCode> {
    const { data } = await apiClient.get<ResellerCode>(`/reseller/codes/${id}`)
    return data
  },

  async exportCodes(filters: { search?: string; status?: string } = {}): Promise<Blob> {
    const { data } = await apiClient.get<Blob>('/reseller/codes/export', {
      params: filters,
      responseType: 'blob',
    })
    return data
  },
}