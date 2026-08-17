/**
 * Admin Redeem Codes API endpoints
 * Handles redeem code generation and management for administrators
 */

import { apiClient } from '../client'
import type {
  RedeemCode,
  GenerateRedeemCodesRequest,
  BatchUpdateRedeemCodeFields,
  RedeemCodeType,
  PaginatedResponse
} from '@/types'

/**
 * List all redeem codes with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 * @param filters - Optional filters
 * @returns Paginated list of redeem codes
 */
export async function list(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    type?: RedeemCodeType
    status?: 'active' | 'used' | 'expired' | 'unused' | 'disabled'
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    source?: 'all' | 'system' | 'reseller_cdkey'
  },
  options?: {
    signal?: AbortSignal
  }
): Promise<PaginatedResponse<RedeemCode>> {
  const { data } = await apiClient.get<PaginatedResponse<RedeemCode>>('/admin/codes/redeem', {
    params: {
      page,
      page_size: pageSize,
      ...filters
    },
    signal: options?.signal
  })
  return data
}

/**
 * Get redeem code by ID
 * @param id - Redeem code ID
 * @returns Redeem code details
 */
export async function getById(id: number): Promise<RedeemCode> {
  const { data } = await apiClient.get<RedeemCode>(`/admin/codes/redeem/${id}`)
  return data
}

/**
 * Generate new redeem codes
 * @param count - Number of codes to generate
 * @param type - Type of redeem code
 * @param value - Value of the code
 * @param groupId - Group ID (required for subscription type)
 * @param validityDays - Validity days (for subscription type)
 * @param expiresInDays - Days before the code itself expires
 * @returns Array of generated redeem codes
 */
export async function generate(
  count: number,
  type: RedeemCodeType,
  value: number,
  groupId?: number | null,
  validityDays?: number,
  expiresInDays?: number | null
): Promise<RedeemCode[]> {
  const payload: GenerateRedeemCodesRequest = {
    count,
    type,
    value
  }

  // 订阅类型专用字段
  if (type === 'subscription') {
    payload.group_id = groupId
    if (validityDays && validityDays > 0) {
      payload.validity_days = validityDays
    }
  }
  if (expiresInDays && expiresInDays > 0) {
    payload.expires_in_days = expiresInDays
  }

  const { data } = await apiClient.post<RedeemCode[]>('/admin/codes/redeem/generate', payload)
  return data
}

export async function createCDKeysForReseller(
  resellerId: number,
  count: number,
  value: number,
  expiresInDays: number | null,
  idempotencyKey: string
): Promise<{
  ledger_id: number
  codes: RedeemCode[]
  total_value: number
  reseller_balance_after: number
  replayed: boolean
}> {
  const { data } = await apiClient.post('/admin/codes/cdkeys/generate', {
    reseller_id: resellerId,
    count,
    value,
    ...(expiresInDays ? { expires_in_days: expiresInDays } : {})
  }, {
    headers: { 'Idempotency-Key': idempotencyKey }
  })
  return data
}

/**
 * Delete redeem code
 * @param id - Redeem code ID
 * @returns Success confirmation
 */
export async function deleteCode(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/admin/codes/redeem/${id}`)
  return data
}

/**
 * Batch delete redeem codes
 * @param ids - Array of redeem code IDs
 * @returns Success confirmation
 */
export async function batchDelete(ids: number[]): Promise<{
  deleted: number
  message: string
}> {
  const { data } = await apiClient.post<{
    deleted: number
    message: string
  }>('/admin/codes/redeem/batch-delete', { ids })
  return data
}

/**
 * Batch update selected redeem code fields
 * @param ids - Array of redeem code IDs
 * @param fields - Field collection to update
 * @returns Updated count
 */
export async function batchUpdate(
  ids: number[],
  fields: BatchUpdateRedeemCodeFields
): Promise<{
  updated: number
  message: string
}> {
  const { data } = await apiClient.post<{
    updated: number
    message: string
  }>('/admin/codes/redeem/batch-update', { ids, fields })
  return data
}

/**
 * Expire redeem code
 * @param id - Redeem code ID
 * @returns Updated redeem code
 */
export async function expire(id: number): Promise<RedeemCode> {
  const { data } = await apiClient.post<RedeemCode>(`/admin/codes/redeem/${id}/expire`)
  return data
}

/**
 * Get redeem code statistics
 * @returns Statistics about redeem codes
 */
export async function getStats(): Promise<{
  total_codes: number
  active_codes: number
  used_codes: number
  expired_codes: number
  total_value_distributed: number
  by_type: Record<RedeemCodeType, number>
}> {
  const { data } = await apiClient.get<{
    total_codes: number
    active_codes: number
    used_codes: number
    expired_codes: number
    total_value_distributed: number
    by_type: Record<RedeemCodeType, number>
  }>('/admin/codes/redeem/stats')
  return data
}

/**
 * Export redeem codes to CSV
 * @param filters - Optional filters
 * @returns CSV data as blob
 */
export async function exportCodes(filters?: {
  type?: RedeemCodeType
  status?: 'used' | 'expired' | 'unused' | 'disabled'
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  source?: 'all' | 'system' | 'reseller_cdkey'
}): Promise<Blob> {
  const response = await apiClient.get('/admin/codes/redeem/export', {
    params: filters,
    responseType: 'blob'
  })
  return response.data
}

export const redeemAPI = {
  list,
  getById,
  generate,
  createCDKeysForReseller,
  delete: deleteCode,
  batchDelete,
  batchUpdate,
  expire,
  getStats,
  exportCodes
}

export default redeemAPI
