<script setup lang="ts">
import { useTheme } from '@shared/composables/useTheme';
import { useI18n } from '../../../composables/useI18n';

const { isDark, toggle } = useTheme();
const { t } = useI18n();
</script>

<template>
  <button @click="toggle">
    {{ isDark ? t('settings.darkMode') : t('settings.lightMode') }}
  </button>
</template>
