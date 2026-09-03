<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineEmits<{ (e: 'toggle-help'): void }>()

</script>

<template>
  <div class="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
    <span class="font-bold text-sm">{{ t('experiments.expBiotSavart') }}</span>
    <button
      class="ml-auto px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
      @click="$emit('toggle-help')"
    >
      {{ t('common.help') }}
    </button>
  </div>
</template>

