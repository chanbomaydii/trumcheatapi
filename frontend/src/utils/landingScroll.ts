/**
 * Smooth-scrolls to an on-page landing section.
 *
 * The links that call this keep a real `href="#id"`, so they stay copyable,
 * middle-clickable and keyboard-reachable. The handler exists only to suppress
 * the raw hash navigation: a bare hash change on the current route makes
 * vue-router run a navigation, and the landing page has no scrollBehavior to
 * service it. Missing targets are a no-op rather than a throw — the sections
 * these point at are themselves conditional, and the affordances are hidden in
 * step with them (see LandingDefault's hasPricing).
 */
export function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
