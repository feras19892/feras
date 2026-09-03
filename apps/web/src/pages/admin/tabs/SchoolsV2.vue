<template>
  <div class="dash-page">
    <h2>المدارس</h2>
    <div class="toolbar-right">
      <button class="btn-add" @click="showAddModal = true">➕ مدرسة جديدة</button>
      <button class="btn-export" @click="handleExport">📊 تصدير CSV</button>
    </div>

    <div class="compact-toolbar" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px;">
      <input v-model="search" class="form-input search-input" placeholder="ابحث بالاسم..." style="max-width: 240px;" />
      <select v-model="statusFilter" class="form-input" style="min-width: 140px;">
        <option value="">كل الحالات</option>
        <option value="active">نشطة</option>
        <option value="inactive">غير نشطة</option>
      </select>
    </div>

    <SkeletonLoader v-if="store.dashLoading" type="cards" :count="3" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <div v-else>
      <SchoolActionBar v-if="activeSchool" :active="activeSchool.is_active !== false" @view="viewActive" @users="goToUsers" @classes="goToClasses" @reports="goToReports" @edit="openEdit(activeSchool)" @toggle="requestToggle(activeSchool)" @delete="handleDelete(activeSchool.id)" />

      <div v-if="pagedSchools.length" class="compact-list">
        <div v-for="s in pagedSchools" :key="s.id" class="compact-row" :class="{ 'row-selected': activeSchool?.id === s.id }" @click="selectSchool(s)">
          <span class="cr-icon">🏫</span>
          <span class="cr-name">{{ s.name }}</span>
          <span class="cr-meta">
            <span class="school-tag">{{ s.code }}</span>
            <span :class="['verify-badge', s.is_active === false ? 'unverified' : '']">{{ s.is_active !== false ? 'نشطة' : 'غير نشطة' }}</span>
            <span>{{ s.user_count ?? 0 }} مستخدم</span>
            <span>{{ s.class_count ?? 0 }} فصل</span>
            <span>{{ s.report_count ?? 0 }} تقرير</span>
          </span>
        </div>
      </div>
      <Pagination v-if="filteredSchools.length" :page="currentPage" :limit="pageLimit" :total="filteredSchools.length" @change="currentPage = $event" />
      <EmptyState v-else icon="🏫" title="لا توجد مدارس" />
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>إضافة مدرسة جديدة</h3>
        <div class="form-group"><label>الاسم</label><input v-model="newSchool.name" class="form-input" /></div>
        <div class="form-group"><label>الكود</label><input v-model="newSchool.code" class="form-input" /></div>
        <div class="form-group"><label>الحد الأقصى للطلاب</label><input v-model.number="newSchool.maxStudents" type="number" class="form-input" /></div>
        <div class="form-group"><label>الحد الأقصى للمعلمين</label><input v-model.number="newSchool.maxTeachers" type="number" class="form-input" /></div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="adding" @click="handleAdd">{{ adding ? '...' : 'إضافة' }}</button>
          <button class="btn-sm btn-warn" @click="showAddModal = false">إلغاء</button>
        </div>
      </div>
    </div>

    <div v-if="editTarget" class="modal-overlay" @click.self="editTarget = null">
      <div class="modal-content">
        <h3>تعديل المدرسة</h3>
        <div class="form-group"><label>الاسم</label><input v-model="editData.name" class="form-input" /></div>
        <div class="form-group"><label>الحد الأقصى للطلاب</label><input v-model.number="editData.maxStudents" type="number" class="form-input" /></div>
        <div class="form-group"><label>الحد الأقصى للمعلمين</label><input v-model.number="editData.maxTeachers" type="number" class="form-input" /></div>
        <div class="modal-actions">
          <button class="btn-sm btn-success" :disabled="editLoading" @click="confirmEdit">{{ editLoading ? '...' : 'حفظ' }}</button>
          <button class="btn-sm btn-warn" @click="editTarget = null">إلغاء</button>
        </div>
      </div>
    </div>

    <ConfirmModal :open="toggleTarget !== null" icon="🔄" title="تغيير الحالة" :message="toggleTarget ? `تغيير حالة ${toggleTarget.name}` : ''" confirm-label="تأكيد" cancel-label="إلغاء" variant="warning" :loading="toggleLoading" @confirm="confirmToggle" @cancel="toggleTarget = null" />
    <ConfirmModal :open="deleteTarget !== null" icon="🗑️" title="تأكيد الحذف" :message="deleteTarget ? `حذف ${deleteTarget.name}؟` : ''" confirm-label="حذف" cancel-label="إلغاء" variant="danger" :loading="deleteLoading" @confirm="confirmDelete" @cancel="deleteTarget = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useSelectedSchool } from '@/composables/shared/useSelectedSchool'
import { eventBus } from '@/composables/shared/useEventBus'
import { useToast } from '@/composables/useToast'
import { useAdminPasswordConfirm } from '@/composables/useAdminPasswordConfirm'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import Pagination from '@/components/shared/Pagination.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import SchoolActionBar from '@/components/admin/SchoolActionBar.vue'
import { exportToCSV } from '@/composables/shared/useExport'
import { createSchool, deleteSchool, updateSchool, toggleSchoolActive } from '@/services/core/admin.api'

const store = useAdminStore()
const toast = useToast()
const { adminPasswordConfirm } = useAdminPasswordConfirm()
const { setSelectedSchool, clearSelectedSchool } = useSelectedSchool()

const search = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)
const activeSchool = ref<any>(null)

const showAddModal = ref(false)
const adding = ref(false)
const newSchool = ref({ name: '', code: '', maxStudents: 100, maxTeachers: 10 })

const editTarget = ref<any>(null)
const editData = ref({ name: '', maxStudents: 0, maxTeachers: 0 })
const editLoading = ref(false)

const toggleTarget = ref<{ id: number; name: string } | null>(null)
const toggleLoading = ref(false)
const deleteTarget = ref<{ id: number; name: string } | null>(null)
const deleteLoading = ref(false)

function selectSchool(s: any) { activeSchool.value = activeSchool.value?.id === s.id ? null : s }
function viewActive() { if (activeSchool.value) { setSelectedSchool(activeSchool.value.id); eventBus.emit('admin:switch-tab', { tabId: 'school-detail' }) } }
function goToUsers() { if (activeSchool.value) { setSelectedSchool(activeSchool.value.id); eventBus.emit('admin:switch-tab', { tabId: 'users' }) } }
function goToClasses() { if (activeSchool.value) { setSelectedSchool(activeSchool.value.id); eventBus.emit('admin:switch-tab', { tabId: 'classes' }) } }
function goToReports() { if (activeSchool.value) { setSelectedSchool(activeSchool.value.id); eventBus.emit('admin:switch-tab', { tabId: 'reports' }) } }

const filteredSchools = computed(() => {
  let result = (store.activeSchools ?? []) as any[]
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((s: any) => s.name?.toLowerCase().includes(q))
  }
  if (statusFilter.value === 'active') result = result.filter((s: any) => s.is_active !== false)
  if (statusFilter.value === 'inactive') result = result.filter((s: any) => s.is_active === false)
  return result
})

const pagedSchools = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredSchools.value.slice(start, start + pageLimit.value)
})

watch([search, statusFilter], () => { currentPage.value = 1 })

function openEdit(s: any) { editTarget.value = s; editData.value = { name: s.name, maxStudents: s.max_students ?? 100, maxTeachers: s.max_teachers ?? 10 } }
function requestToggle(s: any) { toggleTarget.value = { id: s.id, name: s.name } }
function handleDelete(id: number) { const s = activeSchool.value; if (s) deleteTarget.value = { id, name: s.name } }

async function handleAdd() {
  if (!newSchool.value.name || !newSchool.value.code) return
  adding.value = true
  try {
    await createSchool(newSchool.value.name, newSchool.value.code, newSchool.value.maxStudents, newSchool.value.maxTeachers)
    await store.fetchSchools()
    toast.success('تمت الإضافة')
    showAddModal.value = false
    newSchool.value = { name: '', code: '', maxStudents: 100, maxTeachers: 10 }
  } catch (e: any) { toast.error(e?.message || 'فشل الإضافة') }
  finally { adding.value = false }
}

async function confirmEdit() {
  if (!editTarget.value || !editData.value.name) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد التعديل' })
  if (!adminPassword) return
  editLoading.value = true
  try {
    await updateSchool(editTarget.value.id, { name: editData.value.name, max_students: editData.value.maxStudents, max_teachers: editData.value.maxTeachers }, adminPassword)
    await store.fetchSchools()
    toast.success('تم التحديث')
    editTarget.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل التحديث') }
  finally { editLoading.value = false }
}

async function confirmToggle() {
  if (!toggleTarget.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد تغيير الحالة' })
  if (!adminPassword) return
  toggleLoading.value = true
  try {
    await toggleSchoolActive(toggleTarget.value.id, adminPassword)
    await store.fetchSchools()
    toast.success('تم تغيير الحالة')
    toggleTarget.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل التبديل') }
  finally { toggleLoading.value = false }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const adminPassword = await adminPasswordConfirm({ message: 'أدخل كلمة مرور الأدمن لتأكيد الحذف' })
  if (!adminPassword) return
  deleteLoading.value = true
  try {
    await deleteSchool(deleteTarget.value.id, adminPassword)
    await store.fetchSchools()
    clearSelectedSchool()
    toast.success('تم الحذف')
    deleteTarget.value = null
    activeSchool.value = null
  } catch (e: any) { toast.error(e?.message || 'فشل الحذف') }
  finally { deleteLoading.value = false }
}

function handleExport() {
  exportToCSV(filteredSchools.value.map((s: any) => ({
    id: s.id, name: s.name, code: s.code, users: s.user_count, classes: s.class_count, reports: s.report_count,
    status: s.is_active !== false ? 'نشطة' : 'غير نشطة',
  })), 'admin-schools')
}

async function load() { await store.fetchSchools() }
onMounted(load)
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
</style>
