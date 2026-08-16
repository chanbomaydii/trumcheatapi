import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const headerSource = readFileSync(resolve(dir, '../AppHeader.vue'), 'utf8')
// HomeView.vue no longer renders the docs link itself: it is a three-mode
// dispatcher and each mode component owns its own markup. The doc_url <a href>
// — and so the sanitizeUrl() call guarding it — moved to LandingNav.vue
// (default mode) and CompactHome.vue (compact mode), asserted on below.
const landingNavSource = readFileSync(resolve(dir, '../../landing/LandingNav.vue'), 'utf8')
const compactHomeSource = readFileSync(resolve(dir, '../../landing/CompactHome.vue'), 'utf8')
const keyUsageViewSource = readFileSync(resolve(dir, '../../../views/KeyUsageView.vue'), 'utf8')

describe('doc_url sanitization', () => {
  it('AppHeader imports sanitizeUrl', () => {
    expect(headerSource).toContain("import { sanitizeUrl } from '@/utils/url'")
  })

  it('AppHeader applies sanitizeUrl to docUrl', () => {
    expect(headerSource).toContain('sanitizeUrl(appStore.docUrl)')
  })

  it('LandingNav imports sanitizeUrl', () => {
    expect(landingNavSource).toContain("import { sanitizeUrl } from '@/utils/url'")
  })

  it('LandingNav applies sanitizeUrl to docUrl', () => {
    expect(landingNavSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl')
  })

  it('CompactHome imports sanitizeUrl', () => {
    expect(compactHomeSource).toContain("import { sanitizeUrl } from '@/utils/url'")
  })

  it('CompactHome applies sanitizeUrl to docUrl', () => {
    expect(compactHomeSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl')
  })

  it('KeyUsageView imports sanitizeUrl', () => {
    expect(keyUsageViewSource).toContain("import { sanitizeUrl } from '@/utils/url'")
  })

  it('KeyUsageView applies sanitizeUrl to docUrl', () => {
    expect(keyUsageViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl')
  })
})
