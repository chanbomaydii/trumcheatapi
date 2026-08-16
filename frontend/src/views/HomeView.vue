<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="hasHomeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- HTML mode - SECURITY: homeContent is admin-only setting, XSS risk is acceptable -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Compact Home Page -->
  <CompactHome v-else-if="compactHomeEnabled" />

  <!-- Default Home Page -->
  <LandingDefault v-else />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore, useAppStore } from '@/stores'
import CompactHome from '@/components/landing/CompactHome.vue'
import LandingDefault from '@/components/landing/LandingDefault.vue'

const authStore = useAuthStore()
const appStore = useAppStore()

const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const hasHomeContent = computed(() => homeContent.value.trim().length > 0)
const compactHomeEnabled = computed(() => appStore.cachedPublicSettings?.compact_home_enabled === true)

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Site identity, theme handling and sanitizeUrl() now live in the mode
// components that actually render them (CompactHome.vue and LandingNav.vue).
// Theme INITIALISATION is not repeated here at all: main.ts's initThemeClass()
// applies the persisted/preferred theme to <html> before the app mounts.
onMounted(() => {
  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>
