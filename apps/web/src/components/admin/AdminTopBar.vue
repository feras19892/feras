<template>
  <header class="admin-topbar">
    <div class="admin-topbar__brand">
      <span class="admin-topbar__icon">{{ icon }}</span>
      <span>{{ t(title, title) }}</span>
    </div>
    <div class="admin-topbar__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface Props {
  title: string
  icon: string
}

defineProps<Props>()
</script>