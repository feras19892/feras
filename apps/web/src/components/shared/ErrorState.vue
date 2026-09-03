<template>
  <div class="error-state">
    <span class="error-icon">{{ icon }}</span>
    <p class="error-message">{{ message }}</p>
    <button v-if="showRetry" @click="$emit('retry')" class="retry-btn">إعادة المحاولة</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import { getErrorType, getErrorMessage } from '@/services/core/api-helpers'


const props = defineProps<{
  error: unknown
  showRetry?: boolean
}>()

defineEmits<{ retry: [] }>()

const errorType = computed(() => getErrorType(props.error))
const message = computed(() => {
  const msg = getErrorMessage(props.error)
  const labels: Record<string, string> = {
    network: 'تعذر الاتصال بالخادم',
    auth: 'انتهت الجلسة — يرجى إعادة تسجيل الدخول',
    server: 'خطأ في الخادم — حاول لاحقاً',
    'not-found': 'البيانات غير موجودة',
    unknown: msg,
  }
  return labels[errorType.value] || msg
})

const icon = computed(() => {
  const icons: Record<string, string> = {
    network: '📡',
    auth: '🔒',
    server: '🖥️',
    'not-found': '🔍',
    unknown: '⚠️',
  }
  return icons[errorType.value] || '⚠️'
})
</script>

<style scoped>
.error-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; text-align: center;
}
.error-icon { font-size: 48px; margin-bottom: 12px; }
.error-message { color: #6b7280; margin: 0 0 16px; font-size: 15px; }
.retry-btn {
  padding: 8px 20px; background: #3b82f6; color: white;
  border: none; border-radius: 8px; cursor: pointer; font-size: 14px;
}
.retry-btn:hover { background: #2563eb; }
</style>
