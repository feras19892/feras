<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>📢 بث جماعي</h3>
      <div class="form-group">
        <label>الفئة المستهدفة</label>
        <select v-model="targetType" class="form-input">
          <option value="all">كل طلاب فصولي</option>
          <option value="class">فصل محدد</option>
        </select>
      </div>
      <div v-if="targetType === 'class'" class="form-group">
        <label>الفصل</label>
        <select v-model="selectedClassId" class="form-input">
          <option value="">اختر فصل...</option>
          <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }} ({{ c.student_count ?? 0 }} طلاب)</option>
        </select>
      </div>
      <div class="form-group">
        <label>نوع التنبيه</label>
        <select v-model="broadcastType" class="form-input">
          <option value="info">ℹ️ معلومة</option>
          <option value="warning">⚠️ تنبيه</option>
          <option value="success">✅ إيجابي</option>
          <option value="urgent">🚨 عاجل</option>
        </select>
      </div>
      <div class="form-group">
        <label>الرسالة</label>
        <textarea v-model="message" class="form-input" rows="3" placeholder="اكتب رسالتك هنا..."></textarea>
      </div>
      <div class="modal-actions">
        <button @click="send" class="btn-sm btn-success" :disabled="sending || !canSend">{{ sending ? '...' : 'إرسال' }}</button>
        <button @click="$emit('close')" class="btn-sm btn-warn">إلغاء</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { fetchJson } from '@/services/http'
import { useToast } from '@/composables/useToast'
import type { TeacherClass } from '@/services/core/teacher.api'

const props = defineProps<{ open: boolean; classes: TeacherClass[]; teacherName: string }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const toast = useToast()

const targetType = ref<'all' | 'class'>('all')
const selectedClassId = ref('')
const broadcastType = ref('info')
const message = ref('')
const sending = ref(false)

const canSend = computed(() => message.value.trim() && (targetType.value === 'all' || selectedClassId.value))

async function send() {
  if (!canSend.value) return
  sending.value = true
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/classes/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: targetType.value,
        class_id: selectedClassId.value || null,
        type: broadcastType.value,
        message: message.value.trim(),
      }),
    })
    if (res.success) {
      toast.success('تم إرسال البث الجماعي')
      message.value = ''
      emit('close')
    } else toast.error(res.message || 'فشل الإرسال')
  } catch (e: any) { toast.error(e?.message || 'فشل الإرسال') }
  finally { sending.value = false }
}
</script>
