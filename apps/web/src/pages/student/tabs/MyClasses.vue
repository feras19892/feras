<template>
  <div class="dash-page">
    <h2>فصولي</h2>
    <div class="toolbar-right">
      <button @click="showJoinModal = true" class="btn-add">+ الانضمام لفصل</button>
    </div>

    <SkeletonLoader v-if="store.loading" type="cards" :count="3" />
    <ErrorState v-else-if="store.error" :error="store.error" show-retry @retry="load" />
    <div v-else-if="store.classes.length" class="class-toolbar">
      <button class="toolbar-btn" :disabled="!activeClass" :title="activeClass ? '' : 'اختر فصلاً أولاً'" @click="onView">👥 عرض الطلاب</button>
      <button class="toolbar-btn toolbar-danger" :disabled="!activeClass" :title="activeClass ? '' : 'اختر فصلاً أولاً'" @click="onLeave">🚪 مغادرة</button>
    </div>

    <div v-if="store.classes.length" class="compact-list">
      <div
        v-for="cls in store.classes"
        :key="cls.id"
        class="compact-row"
        :class="{ 'row-selected': activeClass?.id === cls.id, 'class-frozen': !isActive(cls) }"
        @click="selectClass(cls)"
      >
        <span class="cr-icon">{{ isActive(cls) ? '📚' : '🔒' }}</span>
        <span class="cr-name">{{ cls.name }}<span v-if="!isActive(cls)" class="frozen-badge">مجمد</span></span>
        <span class="cr-meta">
          <span>الطلاب: {{ cls.student_count ?? 0 }}</span>
        </span>
        <span class="cr-action" @click.stop>
          <span class="code-with-copy">
            {{ cls.code }}
            <button class="copy-btn" @click.stop="copyCode(cls.code)" title="نسخ الكود">📋</button>
          </span>
        </span>
        <div v-if="expandedClass?.id === cls.id" @click.stop class="students-inline">
          <table v-if="students.length" class="detail-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>الانضمام</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in students" :key="s.id" class="student-row">
                <td>{{ s.name }}</td>
                <td>{{ formatDate(s.joined_at) }}</td>
                <td><span :class="['status-pill', s.blocked_at ? 'inactive' : 'active']">{{ s.blocked_at ? 'محظور' : 'نشط' }}</span></td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-else icon="👥" title="لا يوجد طلاب" />
        </div>
      </div>
    </div>
    <EmptyState v-else icon="📚" title="لا توجد فصول" />

    <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
      <div class="modal-content">
        <h3>الانضمام لفصل</h3>
        <div class="form-group"><label>كود الفصل</label><input v-model="joinCode" class="form-input" maxlength="8" @keyup.enter="handleJoin" /></div>
        <p v-if="joinError" class="join-error">{{ joinError }}</p>
        <div class="modal-actions">
          <button @click="handleJoin" class="btn btn-primary" :disabled="joinLoading">{{ joinLoading ? '...' : 'انضمام' }}</button>
          <button @click="showJoinModal = false" class="btn btn-ghost">إلغاء</button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="leaveTarget !== null"
      icon="🚪"
      title="تأكيد المغادرة"
      :message="`هل تريد مغادرة ${leaveTarget?.name || ''}؟`"
      confirm-label="مغادرة"
      cancel-label="إلغاء"
      variant="danger"
      :loading="leaveLoading"
      @confirm="confirmLeave"
      @cancel="leaveTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStudentStore } from '@/stores/student.store'
import { getClassDetails, joinClass, leaveClass } from '@/services/class.service'
import type { ClassStudent } from '@/services/class.service'
import type { StudentClass } from '@/services/core/student.api'
import EmptyState from '@/components/shared/EmptyState.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'
import { useToast } from '@/composables/useToast'
import { eventBus } from '@/composables/shared/useEventBus'

const store = useStudentStore()
const toast = useToast()
const activeClass = ref<StudentClass | null>(null)
const expandedClass = ref<StudentClass | null>(null)
const students = ref<ClassStudent[]>([])
const showJoinModal = ref(false)
const joinCode = ref('')
const joinError = ref('')
const joinLoading = ref(false)
const leaveTarget = ref<StudentClass | null>(null)
const leaveLoading = ref(false)

function isActive(c: StudentClass) { return Number(c.is_active) === 1 }

function selectClass(c: StudentClass) {
  if (activeClass.value?.id === c.id) {
    activeClass.value = null
    expandedClass.value = null
  } else {
    activeClass.value = c
    expandedClass.value = null
  }
}

async function onView() {
  if (!activeClass.value) return
  if (expandedClass.value?.id === activeClass.value.id) {
    expandedClass.value = null
    return
  }
  expandedClass.value = activeClass.value
  try {
    const res = await getClassDetails(activeClass.value.id)
    students.value = res.success ? res.students : []
  } catch { students.value = [] }
}

function onLeave() { if (activeClass.value) leaveTarget.value = activeClass.value }

async function confirmLeave() {
  if (!leaveTarget.value) return
  leaveLoading.value = true
  try {
    const res = await leaveClass(leaveTarget.value.id)
    if (res.success) {
      toast.success('تمت المغادرة')
      activeClass.value = null
      expandedClass.value = null
      await store.fetchClasses(true)
      eventBus.emit('class:updated', { classId: leaveTarget.value.id })
    } else { toast.error(res.message || 'فشل المغادرة') }
  } catch (e: any) { toast.error(e?.message || 'فشل المغادرة') }
  finally { leaveLoading.value = false; leaveTarget.value = null }
}

async function handleJoin() {
  const code = joinCode.value.trim().toUpperCase()
  if (!code) { joinError.value = 'أدخل الكود'; return }
  joinLoading.value = true
  joinError.value = ''
  try {
    const res = await joinClass(code)
    if (res.success) {
      toast.success('تم الانضمام')
      showJoinModal.value = false
      joinCode.value = ''
      await store.fetchClasses(true)
      eventBus.emit('class:updated', { classId: res.class_id || '' })
    } else { joinError.value = res.message || 'كود غير صالح' }
  } catch (e: any) { joinError.value = e?.message || 'فشل' }
  finally { joinLoading.value = false }
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    toast.success('تم نسخ الكود')
  } catch { toast.error('فشل نسخ الكود') }
}

function formatDate(d: string) {
  return d ? new Date(d).toLocaleDateString('ar') : '—'
}

async function load() { await store.fetchClasses(true) }

onMounted(() => { store.fetchClasses() })
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background: var(--as-surface, #1f2937); color: var(--as-text, #f8fafc); border: 1px solid var(--as-border, rgba(255,255,255,0.08)); border-radius: 14px; padding: 20px; width: 90%; max-width: 420px; }
.modal-content h3 { margin: 0 0 16px; font-size: 16px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 12px; color: var(--as-text-muted, #94a3b8); margin-bottom: 4px; }
.form-input { width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--as-border, rgba(255,255,255,0.08)); background: var(--as-raised, #1f2937); color: var(--as-text, #f8fafc); }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.join-error { color: var(--as-danger, #ef4444); font-size: 12px; margin: 4px 0 0; }
.status-pill { padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
.status-pill.active { background: rgba(34,197,94,0.15); color: #22c55e; }
.status-pill.inactive { background: rgba(239,68,68,0.15); color: #ef4444; }
</style>
