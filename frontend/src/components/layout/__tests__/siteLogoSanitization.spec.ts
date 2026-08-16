import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const sidebarSource = readFileSync(resolve(dir, '../AppSidebar.vue'), 'utf8')
// HomeView.vue no longer renders the logo itself: it is a three-mode dispatcher
// and each mode component owns its own markup. The site_logo <img> — and so the
// sanitizeUrl() call guarding it — moved to LandingNav.vue (default mode) and
// CompactHome.vue (compact mode), which are the files asserted on below.
const landingNavSource = readFileSync(resolve(dir, '../../landing/LandingNav.vue'), 'utf8')
const compactHomeSource = readFileSync(resolve(dir, '../../landing/CompactHome.vue'), 'utf8')
const keyUsageViewSource = readFileSync(resolve(dir, '../../../views/KeyUsageView.vue'), 'utf8')

describe('site_logo sanitization', () => {
  it('AppSidebar imports sanitizeUrl and applies it to siteLogo', () => {
    expect(sidebarSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(sidebarSource).toContain('sanitizeUrl(appStore.siteLogo')
  })

  it('LandingNav applies sanitizeUrl to siteLogo', () => {
    expect(landingNavSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(landingNavSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
  })

  it('CompactHome applies sanitizeUrl to siteLogo', () => {
    expect(compactHomeSource).toContain("import { sanitizeUrl } from '@/utils/url'")
    expect(compactHomeSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
  })

  it('KeyUsageView applies sanitizeUrl to siteLogo', () => {
    expect(keyUsageViewSource).toContain('sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo')
  })

  it('every site_logo consumer passes allowRelative and allowDataUrl options', () => {
    for (const src of [sidebarSource, landingNavSource, compactHomeSource, keyUsageViewSource]) {
      expect(src).toContain('allowRelative: true')
      expect(src).toContain('allowDataUrl: true')
    }
  })
})
