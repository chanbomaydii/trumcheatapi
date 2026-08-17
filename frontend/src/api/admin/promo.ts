/**
 * Admin Promo Codes API endpoints
 */

import { apiClient } from '../client'
import type {
  PromoCode,
  PromoCodeUsage,
  CreatePromoCodeRequest,
  UpdatePromoCodeRequest,
  BasePaginationResponse
} from '@/types'

export async function list(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    status?: string
    search?: string
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  },
  options?: {
    signal?: AbortSignal
  }
): Promise<BasePaginationResponse<PromoCode>> {
  const { data } = await apiClient.get<BasePaginationResponse<PromoCode>>('/admin/codes/registration', {
    params: { page, page_size: pageSize, ...filters },
    signal: options?.signal
  })
  return data
}

export async function getById(id: number): Promise<PromoCode> {
  const { data } = await apiClient.get<PromoCode>(`/admin/codes/registration/${id}`)
  return data
}

export async function create(request: CreatePromoCodeRequest): Promise<PromoCode> {
  const { data } = await apiClient.post<PromoCode>('/admin/codes/registration', request)
  return data
}

export async function update(id: number, request: UpdatePromoCodeRequest): Promise<PromoCode> {
  const { data } = await apiClient.put<PromoCode>(`/admin/codes/registration/${id}`, request)
  return data
}

export async function deleteCode(id: number): Promise<{ message: string }> {
  const { data } = await apiClient.delete<{ message: string }>(`/admin/codes/registration/${id}`)
  return data
}

export async function getUsages(
  id: number,
  page: number = 1,
  pageSize: number = 20
): Promise<BasePaginationResponse<PromoCodeUsage>> {
  const { data } = await apiClient.get<BasePaginationResponse<PromoCodeUsage>>(
    `/admin/codes/registration/${id}/usages`,
    { params: { page, page_size: pageSize } }
  )
  return data
}

const promoAPI = {
  list,
  getById,
  create,
  update,
  delete: deleteCode,
  getUsages
}

export default promoAPI
