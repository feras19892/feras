<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <h3>تعديل: {{ user.name }}</h3>
      <div class="form-group"><label>الاسم</label><input v-model="form.name" class="form-input" /></div>
      <div class="form-group"><label>البريد</label><input v-model="form.email" class="form-input" /></div>
      <div class="form-group"><label>الدور</label>
        <select v-model="form.role" class="form-input">
          <option value="admin">مشرف</option>
          <option value="teacher">معلم</option>
          <option value="student">طالب</option>
          <option value="school">مدرسة</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn-sm btn-success" :disabled="saving" @click="save">{{ saving ? '...' : 'حفظ' }}</button>
        <button class="btn-sm btn-warn" @click="emit('close')">إلغاء</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { updateAdminUser, updateUserRole } from '@/services/admin.service'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import { useToast } from '@/composables/useToast'

const props = defineProps<{ user: { id: number; name: string; email: string; role: string } }>()
const emit = defineEmits<{ close: []; saved: [] }>()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const saving = ref(false)
const form = reactive({ name: props.user.name, email: props.user.email, role: props.user.role })

async function save() {
  if (!form.name.trim() || !form.email.trim()) return
  let adminPassword: string | null = null
  if (form.role !== props.user.role) {
    adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد تغيير الدور' })
    if (!adminPassword) return
  }
  try {
    saving.value = true
    const nameEmailRes = await updateAdminUser(props.user.id, { name: form.name.trim(), email: form.email.trim() })
    if (!nameEmailRes.success) throw new Error(nameEmailRes.message || 'فشل تحديث البيانات')
    if (form.role !== props.user.role && adminPassword) {
      const roleRes = await updateUserRole(props.user.id, form.role, adminPassword)
      if (!roleRes.success) throw new Error(roleRes.message || 'فشل تغيير الدور')
    }
    toast.success('تم حفظ التغييرات')
    emit('saved')
    emit('close')
  } catch (e: any) { toast.error(e?.message || 'فشل الحفظ') }
  finally { saving.value = false }
}
</script>
