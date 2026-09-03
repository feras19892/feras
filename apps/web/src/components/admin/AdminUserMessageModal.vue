<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>{{ mode === 'warning' ? 'تحذير لـ' : 'رسالة إلى' }} {{ userName }}</h3>
      <div v-if="mode === 'warning'" class="form-group">
        <input v-model="title" class="form-input" placeholder="عنوان التحذير" />
      </div>
      <div v-if="mode === 'warning'" class="form-group">
        <select v-model="severity" class="form-input">
          <option value="low">منخفض</option>
          <option value="normal">متوسط</option>
          <option value="high">عالي</option>
          <option value="critical">حرج</option>
        </select>
      </div>
      <div class="form-group">
        <textarea v-model="content" class="form-input" rows="3" :placeholder="mode === 'warning' ? 'نص التحذير...' : 'اكتب الرسالة...'"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-sm" :class="mode === 'warning' ? 'btn-danger' : 'btn-primary'" :disabled="!content.trim() || loading || (mode === 'warning' && !title.trim())" @click="send">{{ loading ? '...' : (mode === 'warning' ? 'إرسال تحذير' : 'إرسال') }}</button>
        <button class="btn-sm btn-warn" @click="emit('close')">إلغاء</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendDirectMessage } from '@/services/admin-messages.service'
import { sendAdminWarning } from '@/services/admin.service'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ userId: number; userName: string; mode?: 'message' | 'warning' }>()
const emit = defineEmits<{ close: []; sent: [] }>()
const content = ref('')
const title = ref('')
const severity = ref('normal')
const loading = ref(false)
const toast = useToast()

async function send() {
  const text = content.value.trim()
  if (!text) return
  if (props.mode === 'warning' && !title.value.trim()) return
  loading.value = true
  try {
    let res
    if (props.mode === 'warning') {
      res = await sendAdminWarning(props.userId, title.value.trim(), text, severity.value)
    } else {
      res = await sendDirectMessage(props.userId, text)
    }
    if (res.success) {
      toast.success(props.mode === 'warning' ? 'تم إرسال التحذير' : 'تم إرسال الرسالة')
      content.value = ''
      title.value = ''
      emit('sent')
      emit('close')
    } else {
      const errorText = typeof (res as any).message === 'string' ? (res as any).message : null
      toast.error(errorText || (res as any).message_text || 'فشل الإرسال')
    }
  } catch (e: any) {
    toast.error(e?.message || 'فشل الإرسال')
  } finally { loading.value = false }
}
</script>
