<template>
  <div class="dash-page">
    <button class="link-btn" @click="goBack">← رجوع للفصول</button>
    <SkeletonLoader v-if="store.dashLoading" type="cards" :count="3" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <template v-else-if="cls">
      <ClassActionBar :show-view="false" :show-reports="true" :show-freeze="true" :frozen="!!cls.is_frozen" :show-edit="true" :show-delete="true" @reports="goToReports" @freeze="handleFreeze" @edit="openEdit" @delete="requestDelete" />

      <section class="dash-welcome">
        <div class="dash-welcome__text">
          <h1 class="dash-welcome__title">{{ cls.name }}</h1>
          <p class="dash-welcome__subtitle">{{ cls.code }}</p>
          <p class="dash-welcome__subtitle">
            <span class="badge" :class="cls.is_frozen ? 'badge-danger' : 'badge-success'">{{ cls.is_frozen ? 'مجمد' : 'نشط' }}</span>
          </p>
        </div>
      </section>

      <section class="stat-cards-grid">
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#3b82f622;color:#3b82f6">👨‍🎓</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#3b82f6">{{ students.length }}</div><div class="stat-card-modern__label">الطلاب</div></div></div>
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#22c55e22;color:#22c55e">📝</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#22c55e">{{ totalReports }}</div><div class="stat-card-modern__label">التقارير</div></div></div>
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#6366f122;color:#6366f1">👨‍🏫</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#6366f1">{{ cls.teacher_name }}</div><div class="stat-card-modern__label">المعلم</div></div></div>
        <div class="stat-card-modern"><div class="stat-card-modern__icon" style="background:#6b728022;color:#6b7280">🕒</div><div class="stat-card-modern__body"><div class="stat-card-modern__value" style="color:#6b7280">{{ formatDate(cls.created_at) }}</div><div class="stat-card-modern__label">تاريخ الإنشاء</div></div></div>
      </section>

      <section class="lists-grid">
        <div class="list-card">
          <div class="list-header"><h3>معلومات أساسية</h3></div>
          <div class="list-row"><span>الرقم</span><strong>{{ cls.id }}</strong></div>
          <div class="list-row"><span>الاسم</span><strong>{{ cls.name }}</strong></div>
          <div class="list-row"><span>الكود</span><strong>{{ cls.code }}</strong></div>
          <div class="list-row"><span>المعلم</span><strong>{{ cls.teacher_name }}</strong></div>
          <div class="list-row"><span>الحالة</span><strong>{{ cls.is_frozen ? 'مجمد' : 'نشط' }}</strong></div>
          <div class="list-row"><span>تاريخ الإنشاء</span><strong>{{ formatDate(cls.created_at) }}</strong></div>
        </div>

        <div class="list-card">
          <div class="list-header"><h3>الطلاب ({{ students.length }})</h3></div>
          <div v-if="students.length" class="compact-list">
            <div v-for="s in students" :key="s.id" class="compact-row">
              <span class="cr-name">{{ s.name }}</span>
              <span class="cr-meta">{{ s.report_count ?? 0 }} تقرير</span>
            </div>
          </div>
          <EmptyState v-else icon="👥" title="لا يوجد طلاب" />
        </div>
      </section>
    </template>
    <EmptyState v-else icon="📚" title="لم يتم اختيار فصل" />

    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <h3>تعديل الفصل</h3>
        <div class="form-group"><label>اسم الفصل</label><input v-model="editData.name" class="form-input" /></div>
        <div class="form-group"><label>المعلم</label>
          <select v-model.number="editData.teacher_id" class="form-input">
            <option :value="undefined">— بدون تغيير —</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="editLoading" @click="confirmEdit">{{ editLoading ? '...' : 'حفظ' }}</button>
          <button class="btn-sm btn-warn" @click="showEditModal = false">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="showFreezeModal" class="modal-overlay" @click.self="showFreezeModal = false">
      <div class="modal-content">
        <h3>تجميد الفصل</h3>
        <div class="form-group"><label>السبب</label><textarea v-model="freezeReason" class="form-input" rows="3" /></div>
        <div class="modal-actions">
          <button class="btn-sm btn-warn" :disabled="freezeLoading" @click="confirmFreeze">{{ freezeLoading ? '...' : 'تجميد' }}</button>
          <button class="btn-sm btn-success" @click="showFreezeModal = false">إلغاء</button>
        </div>
      </div>
    </div>

    <ConfirmModal :open="showUnfreeze" icon="🔓" title="تأكيد إلغاء التجميد" :message="`إلغاء تجميد ${cls?.name}؟`" confirm-label="إلغاء التجميد" cancel-label="إلغاء" variant="danger" :loading="unfreezeLoading" @confirm="confirmUnfreeze" @cancel="showUnfreeze = false" />

    <ConfirmModal :open="showDelete" icon="🗑️" title="تأكيد الحذف" :message="`حذف ${cls?.name}؟`" confirm-label="حذف" cancel-label="إلغاء" variant="danger" :loading="deleteLoading" @confirm="confirmDelete" @cancel="showDelete = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useSelectedClass } from '@/composables/shared/useSelectedClass'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import { eventBus } from '@/composables/shared/useEventBus'
import { useToast } from '@/composables/useToast'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import ClassActionBar from '@/components/admin/ClassActionBar.vue'
import { getAdminClassStudents, getAdminTeachers, updateAdminClass, deleteAdminClass, freezeAdminClass, unfreezeAdminClass, type AdminClassItem } from '@/services/admin.service'

const store = useAdminStore()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const { selectedClassId, clearSelectedClass } = useSelectedClass()
const { selectedSchoolId } = useSelectedSchool()

const students = ref<{ id: number; name: string; email: string; joined_at: string; report_count: number }[]>([])
const teachers = ref<{ id: number; name: string }[]>([])

const showEditModal = ref(false)
const editData = ref<{ name: string; teacher_id?: number }>({ name: '' })
const editLoading = ref(false)

const showDelete = ref(false)
const deleteLoading = ref(false)

const showFreezeModal = ref(false)
const freezeReason = ref('')
const freezeLoading = ref(false)
const showUnfreeze = ref(false)
const unfreezeLoading = ref(false)

const cls = computed<AdminClassItem | undefined>(() => store.classes.find((c: AdminClassItem) => c.id === selectedClassId.value))
const totalReports = computed(() => students.value.reduce((sum, s) => sum + (s.report_count ?? 0), 0))

async function loadStudents() {
  if (!selectedClassId.value) { students.value = []; return }
  try {
    const res = await getAdminClassStudents(selectedClassId.value)
    students.value = res.students || []
  } catch (e: any) { toast.error(e?.message || 'فشل تحميل الطلاب'); students.value = [] }
}

async function loadTeachers() {
  try {
    const res = await getAdminTeachers(selectedSchoolId.value || undefined)
    if (res.success) teachers.value = res.teachers
  } catch (e: any) { toast.error(e?.message || 'فشل تحميل المعلمين'); teachers.value = [] }
}

function formatDate(d?: string) { return d ? new Date(d).toLocaleDateString() : '—' }
function goToReports() { eventBus.emit('admin:switch-tab', { tabId: 'reports' }) }
function goBack() { clearSelectedClass(); eventBus.emit('admin:switch-tab', { tabId: 'classes' }) }
function openEdit() {
  if (!cls.value) return
  editData.value = { name: cls.value.name, teacher_id: cls.value.teacher_id }
  showEditModal.value = true
}
function requestDelete() { showDelete.value = true }
function handleFreeze() {
  if (!cls.value) return
  if (cls.value.is_frozen) { showUnfreeze.value = true }
  else { showFreezeModal.value = true; freezeReason.value = '' }
}

async function confirmFreeze() {
  if (!cls.value || !freezeReason.value.trim()) return
  freezeLoading.value = true
  try {
    await freezeAdminClass(cls.value.id, freezeReason.value.trim())
    await store.loadAll(); await loadStudents()
    toast.success('تم التجميد')
    showFreezeModal.value = false
  } catch (e: any) { toast.error(e?.message || 'فشل التجميد') }
  finally { freezeLoading.value = false }
}

async function confirmUnfreeze() {
  if (!cls.value) return
  unfreezeLoading.value = true
  try {
    await unfreezeAdminClass(cls.value.id)
    await store.loadAll(); await loadStudents()
    toast.success('تم إلغاء التجميد')
    showUnfreeze.value = false
  } catch (e: any) { toast.error(e?.message || 'فشل إلغاء التجميد') }
  finally { unfreezeLoading.value = false }
}

async function confirmEdit() {
  if (!cls.value || !editData.value.name) return
  editLoading.value = true
  try {
    const payload: { name: string; teacher_id?: number } = { name: editData.value.name }
    if (editData.value.teacher_id) payload.teacher_id = editData.value.teacher_id
    await updateAdminClass(cls.value.id, payload)
    await store.loadAll()
    toast.success('تم التحديث')
    showEditModal.value = false
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
  finally { editLoading.value = false }
}

async function confirmDelete() {
  if (!cls.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد الحذف' })
  if (!adminPassword) return
  deleteLoading.value = true
  try {
    await deleteAdminClass(cls.value.id, adminPassword)
    await store.loadAll()
    toast.success('تم الحذف')
    showDelete.value = false
    goBack()
  } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
  finally { deleteLoading.value = false }
}

async function load() { await store.loadAll(); await loadStudents(); await loadTeachers() }
onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
</style>
