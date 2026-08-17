import { createI18n } from 'vue-i18n'

type LocaleCode = 'en' | 'vi' | 'zh'

type LocaleMessages = Record<string, any>

const LOCALE_KEY = 'sub2api_locale'
const DEFAULT_LOCALE: LocaleCode = 'en'

const localeLoaders: Record<LocaleCode, () => Promise<{ default: LocaleMessages }>> = {
  en: () => import('./locales/en'),
  vi: () => import('./locales/en'),
  zh: () => import('./locales/zh')
}

function isLocaleCode(value: string): value is LocaleCode {
  return value === 'en' || value === 'vi' || value === 'zh'
}

function getDefaultLocale(): LocaleCode {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved && isLocaleCode(saved)) {
    return saved
  }

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  if (browserLang.startsWith('vi')) {
    return 'vi'
  }

  return DEFAULT_LOCALE
}

export const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {},
  // τªüτö¿ HTML µ╢êµü»Φ¡ªσæè - σ╝òσ»╝µ¡ÑΘ¬ñΣ╜┐τö¿σ»îµûçµ£¼σåàσ«╣∩╝êdriver.js µö»µîü HTML∩╝ë
  // Φ┐ÖΣ║¢σåàσ«╣µÿ»σåàΘâ¿σ«ÜΣ╣ëτÜä∩╝îΣ╕ìσ¡ÿσ£¿ XSS ΘúÄΘÖ⌐
  warnHtmlMessage: false
})

const loadedLocales = new Set<LocaleCode>()

export async function loadLocaleMessages(locale: LocaleCode): Promise<void> {
  if (loadedLocales.has(locale)) {
    return
  }

  const loader = localeLoaders[locale]
  const module = await loader()
  i18n.global.setLocaleMessage(locale, module.default)
  loadedLocales.add(locale)
}

export async function initI18n(): Promise<void> {
  const current = getLocale()
  await loadLocaleMessages(current)
  document.documentElement.setAttribute('lang', current)
}

export async function setLocale(locale: string): Promise<void> {
  if (!isLocaleCode(locale)) {
    return
  }

  await loadLocaleMessages(locale)
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)

  // σÉîµ¡Ñµ¢┤µû░µ╡ÅΦºêσÖ¿Θí╡τ¡╛µáçΘóÿ∩╝îΣ╜┐σà╢Φ╖ƒΘÜÅΦ»¡Φ¿Çσêçµìó
  const { resolveRouteDocumentTitle } = await import('@/router/title')
  const { default: router } = await import('@/router')
  const { useAppStore } = await import('@/stores/app')
  const { useAuthStore } = await import('@/stores/auth')
  const { useAdminSettingsStore } = await import('@/stores/adminSettings')
  const route = router.currentRoute.value
  const appStore = useAppStore()
  const authStore = useAuthStore()
  const adminSettingsStore = useAdminSettingsStore()
  const customMenuItems = [
    ...(appStore.cachedPublicSettings?.custom_menu_items ?? []),
    ...(authStore.isAdmin ? adminSettingsStore.customMenuItems : []),
  ]
  document.title = resolveRouteDocumentTitle(route, appStore.siteName, customMenuItems)
}

export function getLocale(): LocaleCode {
  const current = i18n.global.locale.value
  return isLocaleCode(current) ? current : DEFAULT_LOCALE
}

export const availableLocales = [
  { code: 'en', name: 'English', flag: '≡ƒç║≡ƒç╕' },
  { code: 'vi', name: 'Tiß║┐ng Viß╗çt', flag: '≡ƒç╗≡ƒç│' },
  { code: 'zh', name: 'Σ╕¡µûç', flag: '≡ƒç¿≡ƒç│' }
] as const

export default i18n
