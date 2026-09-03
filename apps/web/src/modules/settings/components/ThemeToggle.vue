<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useTheme } from '@shared/composables/useTheme';

const { isDark, toggle } = useTheme();

</script>

<template>
  <button @click="toggle">
    {{ isDark ? t('settings.darkMode') : t('settings.lightMode') }}
  </button>
</template>
