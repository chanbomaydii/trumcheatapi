<template>
  <span class="flaps">
    <span
      v-for="(ch, i) in display"
      :key="i"
      class="flap"
      :class="{ 'flap--space': ch === ' ' }"
      >{{ ch === ' ' ? '' : ch }}</span
    >
  </span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{ text: string; animate?: boolean }>(), {
  animate: false
})

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-'
const FLIPS_PER_TILE = 6
const FLIP_INTERVAL_MS = 45
const STAGGER_MS = 40

const display = ref<string[]>([...props.text])
let timers: ReturnType<typeof setTimeout>[] = []

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

function run() {
  clearTimers()
  const target = [...props.text]

  // Reduced motion, or animation not requested: land on the target immediately.
  if (!props.animate || prefersReducedMotion()) {
    display.value = target
    return
  }

  display.value = target.map((ch) => (ch === ' ' ? ' ' : GLYPHS[0]))

  target.forEach((ch, index) => {
    if (ch === ' ') return
    for (let step = 1; step <= FLIPS_PER_TILE; step++) {
      const isLast = step === FLIPS_PER_TILE
      timers.push(
        setTimeout(() => {
          const next = [...display.value]
          next[index] = isLast ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          display.value = next
        }, index * STAGGER_MS + step * FLIP_INTERVAL_MS)
      )
    }
  })
}

onMounted(run)
watch(() => props.text, run)
onBeforeUnmount(clearTimers)
</script>
