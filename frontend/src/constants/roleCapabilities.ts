import type { UserRole } from '@/types'

export const LIMITED_ADMIN_ROUTE_PATHS = new Set([
  '/admin/dashboard',
  '/admin/users',
  '/admin/groups',
  '/admin/accounts',
  '/admin/announcements',
  '/admin/cdkeys',
  '/admin/usage',
])

export function roleHomePath(role?: UserRole): string {
  return role === 'root' || role === 'admin' ? '/admin/dashboard' : '/dashboard'
}

export function canRoleAccessPath(role: UserRole, path: string): boolean {
  if (path.startsWith('/reseller/')) return role === 'reseller'
  if (!path.startsWith('/admin/')) return true
  if (role === 'root') return true
  return role === 'admin' && LIMITED_ADMIN_ROUTE_PATHS.has(path)
}