<template>
  <button class="btn-sm btn-primary" :disabled="loading" @click.stop="open">
    {{ buttonLabel }}
  </button>

  <div v-if="show" class="modal-overlay" @click.self="show = false">
    <div class="modal-content">
      <h3 class="mb-3 text-lg font-semibold">{{ titleLabel }}</h3>
      <label class="mb-1 block text-sm font-medium">{{ t('shared.alertTitleLabel') }}</label>
      <input v-model="alertTitle" class="mb-3 w-full rounded border border-gray-700 bg-gray-800 p-2 text-white" />
      <label class="mb-1 block text-sm font-medium">{{ t('shared.alertMessageLabel') }}</label>
      <textarea v-model="alertMessage" rows="3" class="mb-3 w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"></textarea>
      <div class="modal-actions">
        <button class="btn-sm btn-success" :disabled="!alertMessage || loading" @click="send">
          {{ loading ? t('shared.alertSending') : t('shared.alertSend') }}
        </button>
        <button class="btn-sm btn-warn" @click="show = false">{{ t('shared.alertCancel') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed } from 'vue'
import { sendSchoolAlert } from '@/services/school.service'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  role?: 'teacher' | 'student' | 'all'
  classId?: string
}>()

const show = ref(false)
const alertTitle = ref('')
const alertMessage = ref('')
const loading = ref(false)
const toast = useToast()

const buttonLabel = computed(() => props.classId ? t('shared.alertClassBtn') : t('shared.alertBtn'))
const titleLabel = computed(() => props.classId ? t('shared.alertClassTitle') : t('shared.alertTitle'))

function open() {
  show.value = true
  alertTitle.value = ''
  alertMessage.value = ''
}

async function send() {
  if (!alertMessage.value) return
  loading.value = true
  try {
    const targetRole = props.classId ? 'student' : (props.role || 'all')
    const res = await sendSchoolAlert(alertTitle.value, alertMessage.value, targetRole, props.classId)
    if (res.success) {
      toast.success(t('shared.alertSent'))
      show.value = false
      alertTitle.value = ''
      alertMessage.value = ''
    } else {
      toast.error(res.message || t('shared.alertFailed'))
    }
  } catch (e: any) {
    toast.error(e?.message || t('shared.alertFailed'))
  } finally {
    loading.value = false
  }
}
</script>
