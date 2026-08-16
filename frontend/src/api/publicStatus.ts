/**
 * Public status API (anonymous endpoint backing the landing page tiles).
 *
 * Returns ratios and bounds only — no sample counts. A 404 means the admin has
 * the feature switched off, which callers treat as "no data", not as an error.
 */
import { apiClient } from './client'

export interface PublicStatusUptime {
  window_days: number
  /** null when there were no monitor checks in the window. */
  ratio: number | null
}

export interface PublicStatusTTFT {
  window_hours: number
  /** Histogram ladder rung, not an exact measurement. null when no samples. */
  upper_bound_ms: number | null
  /** Always true — render as "< X", never as an exact figure. */
  bucketed: boolean
}

export interface PublicStatusResponse {
  uptime: PublicStatusUptime
  ttft: PublicStatusTTFT
  computed_at: string
}

export async function getPublicStatus(options?: { signal?: AbortSignal }): Promise<PublicStatusResponse> {
  const { data } = await apiClient.get<PublicStatusResponse>('/public/status', {
    signal: options?.signal
  })
  return data
}

export default { getPublicStatus }
