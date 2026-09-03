<template>
  <section class="hud-grid" :aria-label="ariaLabel">
    <slot />
  </section>
</template>

<script setup lang="ts">
interface Props {
  ariaLabel?: string
}

defineProps<Props>()
</script>
