<template>
  <div class="dash-page">
    <h2>الفصول</h2>
    <div class="toolbar-right">
      <button class="btn-add" @click="showAddModal = true">➕ فصل جديد</button>
      <button class="btn-export" @click="handleExport">📊 تصدير CSV</button>
    </div>

    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بالاسم أو الكود..." style="max-width: 240px;" />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="active">نشط</option>
        <option value="frozen">مجمد</option>
      </select>
    </div>

    <SkeletonLoader v-if="store.dashLoading" type="cards" :count="3" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <div v-else>
      <ClassActionBar v-if="activeClass" :show-view="true" :show-reports="true" :show-freeze="true" :frozen="!!activeClass.is_frozen" :show-edit="true" :show-delete="true" @view="viewActive" @reports="goToReports" @freeze="handleFreeze" @edit="openEdit" @delete="handleDelete" />

      <div v-if="pagedClasses.length" class="compact-list">
        <div v-for="c in pagedClasses" :key="c.id" class="compact-row" :class="{ 'row-selected': activeClass?.id === c.id }" @click="selectClass(c)">
          <span class="cr-icon">📚</span>
          <span class="cr-name">{{ c.name }}</span>
          <span class="cr-meta">
            <span class="school-tag">{{ c.code }}</span>
            <span>{{ c.teacher_name }}</span>
            <span :class="['verify-badge', c.is_frozen ? 'unverified' : '']">{{ c.is_frozen ? 'مجمد' : 'نشط' }}</span>
            <span>{{ c.student_count ?? 0 }} طالب</span>
          </span>
        </div>
      </div>
      <Pagination v-if="filteredClasses.length" :page="currentPage" :limit="pageLimit" :total="filteredClasses.length" @change="currentPage = $event" />
      <EmptyState v-else icon="📚" title="لا توجد فصول" />
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>إضافة فصل جديد</h3>
        <div class="form-group"><label>اسم الفصل</label><input v-model="newClass.name" class="form-input" /></div>
        <div class="form-group"><label>الكود</label><input v-model="newClass.code" class="form-input" /></div>
        <div class="form-group"><label>المعلم</label>
          <select v-model.number="newTeacherId" class="form-input">
            <option :value="0">— اختر معلم —</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="adding" @click="handleAdd">{{ adding ? '...' : 'إضافة' }}</button>
          <button class="btn-sm btn-warn" @click="showAddModal = false">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
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
          <button class="btn-sm btn-warn" @click="editTarget = null">إلغاء</button>
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

    <ConfirmModal :open="unfreezeTarget !== null" icon="🔓" title="تأكيد إلغاء التجميد" :message="unfreezeTarget ? `إلغاء تجميد ${unfreezeTarget.name}؟` : ''" confirm-label="إلغاء التجميد" cancel-label="إلغاء" variant="danger" :loading="unfreezeLoading" @confirm="confirmUnfreeze" @cancel="unfreezeTarget = null" />

    <ConfirmModal :open="deleteTarget !== null" icon="🗑️" title="تأكيد الحذف" :message="deleteTarget ? `حذف ${deleteTarget.name}؟` : ''" confirm-label="حذف" cancel-label="إلغاء" variant="danger" :loading="deleteLoading" @confirm="confirmDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useSelectedClass } from '@/composables/shared/useSelectedClass'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import { eventBus } from '@/composables/shared/useEventBus'
import { useToast } from '@/composables/useToast'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import ClassActionBar from '@/components/admin/ClassActionBar.vue'
import { exportToCSV } from '@/composables/shared/useExport'
import { createAdminClass, updateAdminClass, deleteAdminClass, getAdminTeachers, freezeAdminClass, unfreezeAdminClass, type AdminClassItem } from '@/services/admin.service'

const store = useAdminStore()
const toast = useToast()

const { adminPasswordConfirm } = useAdminPasswordConfirm()
const { setSelectedClass } = useSelectedClass()
const { selectedSchoolId } = useSelectedSchool()

const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const activeClass = ref<AdminClassItem | null>(null)
const teachers = ref<{ id: number; name: string }[]>([])

const showAddModal = ref(false)
const adding = ref(false)
const newClass = ref({ name: '', code: '' })
const newTeacherId = ref(0)

const editTarget = ref<AdminClassItem | null>(null)
const editData = ref<{ name: string; teacher_id?: number }>({ name: '' })
const editLoading = ref(false)

const deleteTarget = ref<AdminClassItem | null>(null)
const deleteLoading = ref(false)

const showFreezeModal = ref(false)
const freezeReason = ref('')
const freezeLoading = ref(false)
const unfreezeTarget = ref<AdminClassItem | null>(null)
const unfreezeLoading = ref(false)

function selectClass(c: AdminClassItem) { activeClass.value = activeClass.value?.id === c.id ? null : c }

const filteredClasses = computed(() => {
  let result = store.classes
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((c: AdminClassItem) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q))
  }
  if (statusFilter.value === 'active') result = result.filter((c: AdminClassItem) => !c.is_frozen)
  if (statusFilter.value === 'frozen') result = result.filter((c: AdminClassItem) => !!c.is_frozen)
  return result
})

const pagedClasses = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredClasses.value.slice(start, start + pageLimit.value)
})

watch([search, statusFilter], () => { currentPage.value = 1 })

async function loadTeachers() {
  try {
    const res = await getAdminTeachers(selectedSchoolId.value || undefined)
    if (res.success) teachers.value = res.teachers
  } catch { teachers.value = [] }
}

function viewActive() {
  if (activeClass.value) { setSelectedClass(activeClass.value.id); eventBus.emit('admin:switch-tab', { tabId: 'class-detail' }) }
}
function goToReports() { eventBus.emit('admin:switch-tab', { tabId: 'reports' }) }
function openEdit() {
  if (!activeClass.value) return
  editTarget.value = activeClass.value
  editData.value = { name: activeClass.value.name, teacher_id: activeClass.value.teacher_id }
}
function handleDelete() { if (activeClass.value) deleteTarget.value = activeClass.value }

async function handleAdd() {
  if (!newClass.value.name || !newClass.value.code || !newTeacherId.value) return
  adding.value = true
  try {
    await createAdminClass(newClass.value.name, newClass.value.code, newTeacherId.value)
    await store.loadAll()
    toast.success(t('admin.classAdded', 'تمت الإضافة'))
    showAddModal.value = false
    newClass.value = { name: '', code: '' }
    newTeacherId.value = 0
  } catch (e: any) { toast.error(e?.message || t('admin.classAddFailed', 'فشل الإضافة')) }
  finally { adding.value = false }
}

async function confirmEdit() {
  if (!editTarget.value || !editData.value.name) return
  editLoading.value = true
  try {
    const payload: { name: string; teacher_id?: number } = { name: editData.value.name }
    if (editData.value.teacher_id) payload.teacher_id = editData.value.teacher_id
    await updateAdminClass(editTarget.value.id, payload)
    await store.loadAll()
    toast.success(t('admin.classUpdated', 'تم التحديث'))
    editTarget.value = null
    activeClass.value = null
  } catch (e: any) { toast.error(e?.message || t('admin.classUpdateFailed', 'فشل التحديث')) }
  finally { editLoading.value = false }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد الحذف' })
  if (!adminPassword) return
  deleteLoading.value = true
  try {
    await deleteAdminClass(deleteTarget.value.id, adminPassword)
    await store.loadAll()
    toast.success(t('admin.classDeleted', 'تم الحذف'))
    deleteTarget.value = null
    activeClass.value = null
  } catch (e: any) { toast.error(e?.message || t('admin.classDeleteFailed', 'فشل الحذف')) }
  finally { deleteLoading.value = false }
}

function handleExport() {
  exportToCSV(filteredClasses.value.map((c: AdminClassItem) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    teacher: c.teacher_name,
    students: c.student_count,
    status: c.is_frozen ? 'مجمد' : 'نشط',
  })), 'admin-classes')
}

function handleFreeze() {
  if (!activeClass.value) return
  if (activeClass.value.is_frozen) { unfreezeTarget.value = activeClass.value }
  else { showFreezeModal.value = true; freezeReason.value = '' }
}

async function confirmFreeze() {
  if (!activeClass.value || !freezeReason.value.trim()) return
  freezeLoading.value = true
  try {
    await freezeAdminClass(activeClass.value.id, freezeReason.value.trim())
    await store.loadAll()
    toast.success('تم التجميد')
    showFreezeModal.value = false
    activeClass.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل التجميد') }
  finally { freezeLoading.value = false }
}

async function confirmUnfreeze() {
  if (!unfreezeTarget.value) return
  unfreezeLoading.value = true
  try {
    await unfreezeAdminClass(unfreezeTarget.value.id)
    await store.loadAll()
    toast.success('تم إلغاء التجميد')
    unfreezeTarget.value = null
    activeClass.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل إلغاء التجميد') }
  finally { unfreezeLoading.value = false }
}

async function load() { await store.loadAll(); await loadTeachers() }
onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
</style>
