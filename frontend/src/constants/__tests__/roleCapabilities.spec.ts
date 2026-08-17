import { describe, expect, it } from 'vitest'

import { canRoleAccessPath, roleHomePath } from '../roleCapabilities'

describe('roleCapabilities', () => {
  it.each([
    ['root', '/admin/settings', true],
    ['root', '/admin/ops', true],
    ['admin', '/admin/dashboard', true],
    ['admin', '/admin/users', true],
    ['admin', '/admin/groups', true],
    ['admin', '/admin/accounts', true],
    ['admin', '/admin/announcements', true],
    ['admin', '/admin/cdkeys', true],
    ['root', '/admin/cdkeys', true],
    ['admin', '/admin/usage', true],
    ['admin', '/admin/settings', false],
    ['admin', '/admin/ops', false],
    ['reseller', '/admin/dashboard', false],
    ['user', '/admin/dashboard', false],
    ['reseller', '/reseller/users', true],
    ['reseller', '/reseller/codes', true],
    ['root', '/reseller/users', false],
    ['admin', '/reseller/users', false],
    ['user', '/reseller/users', false],
  ] as const)('%s truy cập %s: %s', (role, path, expected) => {
    expect(canRoleAccessPath(role, path)).toBe(expected)
  })

  it.each([
    ['root', '/admin/dashboard'],
    ['admin', '/admin/dashboard'],
    ['reseller', '/dashboard'],
    ['user', '/dashboard'],
  ] as const)('chọn trang chủ cho %s', (role, expected) => {
    expect(roleHomePath(role)).toBe(expected)
  })
})