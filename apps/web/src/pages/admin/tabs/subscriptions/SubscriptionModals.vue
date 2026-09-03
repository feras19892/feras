<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, reactive, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  updateSubscription,
  createSubscription,
  type AdminSubscription,
  type AdminPlan,
} from '@/services/core/admin.api'


const props = defineProps<{
  edit: AdminSubscription | null
  create: boolean
  plans: AdminPlan[]
}>()

const emit = defineEmits<{
  (e: 'update:edit', value: AdminSubscription | null): void
  (e: 'update:create', value: boolean): void
  (e: 'saved'): void
}>()

const toast = useToast()
const saving = ref(false)

const editData = reactive({
  status: 'ACTIVE' as any,
  plan_id: null as number | null,
  expires_at: '',
  next_billing_at: '',
  max_students: null as number | null,
  max_teachers: null as number | null,
})

const newData = reactive({
  owner_id: 0,
  owner_type: 'user' as 'user' | 'school',
  plan_id: null as number | null,
  status: 'ACTIVE' as any,
  expires_at: '',
  next_billing_at: '',
  max_students: null as number | null,
  max_teachers: null as number | null,
})

function toLocalInput(d?: string | null) {
  if (!d) return ''
  const date = new Date(d)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function resetEdit() {
  const s = props.edit
  if (!s) return
  editData.status = s.status
  editData.plan_id = s.plan_id ?? null
  editData.expires_at = toLocalInput(s.expires_at)
  editData.next_billing_at = toLocalInput(s.next_billing_at)
  editData.max_students = s.max_students ?? null
  editData.max_teachers = s.max_teachers ?? null
}

function resetNew() {
  newData.owner_id = 0
  newData.owner_type = 'user'
  newData.plan_id = null
  newData.status = 'ACTIVE'
  newData.expires_at = ''
  newData.next_billing_at = ''
  newData.max_students = null
  newData.max_teachers = null
}

watch(() => props.edit, resetEdit, { immediate: true })
watch(() => props.create, (v) => { if (v) resetNew() })

function close() {
  if (props.edit) emit('update:edit', null)
  if (props.create) emit('update:create', false)
}

async function save() {
  if (!props.edit) return
  saving.value = true
  try {
    const data: any = {
      status: editData.status,
      plan_id: editData.plan_id,
      max_students: editData.max_students,
      max_teachers: editData.max_teachers,
    }
    if (editData.expires_at) data.expires_at = new Date(editData.expires_at).toISOString()
    if (editData.next_billing_at) data.next_billing_at = new Date(editData.next_billing_at).toISOString()
    const res = await updateSubscription(props.edit.id, data)
    if (res.success) { toast.success('تم التحديث'); emit('saved') }
  } catch (e: any) { toast.error(e.message || 'فشل التحديث') } finally { saving.value = false }
}

async function doCreate() {
  if (!newData.owner_id) { toast.error('أدخل ID المالك'); return }
  saving.value = true
  try {
    const data: any = {
      owner_id: newData.owner_id,
      owner_type: newData.owner_type,
      plan_id: newData.plan_id,
      status: newData.status,
      max_students: newData.max_students,
      max_teachers: newData.max_teachers,
    }
    if (newData.expires_at) data.expires_at = new Date(newData.expires_at).toISOString()
    if (newData.next_billing_at) data.next_billing_at = new Date(newData.next_billing_at).toISOString()
    const res = await createSubscription(data)
    if (res.success) { toast.success('تم الإنشاء'); emit('saved') }
  } catch (e: any) { toast.error(e.message || 'فشل الإنشاء') } finally { saving.value = false }
}
</script>

<template>
  <div>
    <!-- Edit Modal -->
    <div v-if="edit" class="modal-overlay" @click.self="close">
      <div class="modal-content wide">
        <h3>تفاصيل الاشتراك #{{ edit.id }}</h3>
        <div class="detail-row"><span class="detail-label">المالك:</span><span>{{ edit.owner_name || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">البريد:</span><span>{{ edit.owner_email || '—' }}</span></div>
        <div class="detail-row"><span class="detail-label">الخطة الحالية:</span><span>{{ edit.plan_name || '—' }}</span></div>
        <div class="form-group">
          <label>تغيير الخطة</label>
          <select v-model="editData.plan_id" class="input-sm">
            <option :value="null">بدون خطة</option>
            <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }} ({{ p.type }})</option>
          </select>
        </div>
        <div class="form-group">
          <label>الحالة</label>
          <select v-model="editData.status" class="input-sm">
            <option value="ACTIVE">نشط</option>
            <option value="TRIAL">تجريبي</option>
            <option value="SUSPENDED">محظور</option>
            <option value="EXPIRED">منتهي</option>
            <option value="CANCELLED">ملغى</option>
            <option value="PENDING">معلق</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>تاريخ الانتهاء</label><input v-model="editData.expires_at" type="datetime-local" class="input-sm" /></div>
          <div class="form-group"><label>الفوترة التالية</label><input v-model="editData.next_billing_at" type="datetime-local" class="input-sm" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>حد الطلاب</label><input v-model.number="editData.max_students" type="number" class="input-sm" /></div>
          <div class="form-group"><label>حد المعلمين</label><input v-model.number="editData.max_teachers" type="number" class="input-sm" /></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-success" :disabled="saving" @click="save">{{ saving ? '...' : 'حفظ' }}</button>
          <button class="btn btn-warn" @click="close">إغلاق</button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="create" class="modal-overlay" @click.self="close">
      <div class="modal-content wide">
        <h3>➕ اشتراك جديد</h3>
        <div class="form-row">
          <select v-model="newData.owner_type" class="input-sm">
            <option value="user">مستخدم</option>
            <option value="school">مدرسة</option>
          </select>
          <input v-model.number="newData.owner_id" type="number" class="input-sm" placeholder="ID المالك" />
          <select v-model="newData.plan_id" class="input-sm">
            <option :value="null">بدون خطة</option>
            <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }} ({{ p.type }})</option>
          </select>
          <select v-model="newData.status" class="input-sm">
            <option value="ACTIVE">نشط</option>
            <option value="TRIAL">تجريبي</option>
            <option value="SUSPENDED">محظور</option>
            <option value="PENDING">معلق</option>
            <option value="EXPIRED">منتهي</option>
            <option value="CANCELLED">ملغى</option>
          </select>
        </div>
        <div class="form-row">
          <input v-model="newData.expires_at" type="datetime-local" class="input-sm" placeholder="انتهاء" />
          <input v-model="newData.next_billing_at" type="datetime-local" class="input-sm" placeholder="فوترة" />
          <input v-model.number="newData.max_students" type="number" class="input-sm" placeholder="حد طلاب" />
          <input v-model.number="newData.max_teachers" type="number" class="input-sm" placeholder="حد معلمين" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-success" :disabled="saving" @click="doCreate">إنشاء</button>
          <button class="btn btn-warn" @click="close">إغلاق</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-sm { padding: 0.55rem 0.8rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(15,23,42,0.8); color: #f1f5f9; font-size: 0.9rem; min-width: 120px; }
.input-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
.btn { padding: 0.55rem 1rem; border: none; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; cursor: pointer; font-weight: 700; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.btn-warn { background: linear-gradient(135deg, #64748b, #475569); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1200; padding: 1rem; backdrop-filter: blur(2px); }
.modal-content { background: linear-gradient(180deg, #0f172a, #111827); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.5rem; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 50px rgba(0,0,0,0.4); }
.modal-content h3 { margin: 0 0 1.2rem; color: #f1f5f9; font-size: 1.15rem; }
.detail-row { display: flex; gap: 0.6rem; margin-bottom: 0.6rem; color: #cbd5e1; font-size: 0.95rem; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.detail-label { color: #94a3b8; width: 110px; font-weight: 600; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
.form-group label { color: #94a3b8; font-size: 0.88rem; font-weight: 600; }
.form-row { display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
.form-row .form-group { flex: 1; min-width: 180px; }
.modal-actions { display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 1.2rem; }
</style>
