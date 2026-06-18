<script setup lang="ts">
import { useTheme } from '@shared/composables/useTheme';

const { isDark, toggle } = useTheme();
</script>

<template>
  <button @click="toggle">
    {{ isDark ? 'وضع داكن' : 'وضع فاتح' }}
  </button>
</template>
