<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../../composables/useI18n';
import { getAdminClassStudents, updateAdminClass, getAdminTeachers, createAdminClass } from '../../services/admin.service';

interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  teacher_email?: string;
  student_count: number;
  created_at?: string;
}

interface ClassStudent {
  id: number;
  name: string;
  email: string;
  joined_at: string;
  report_count: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

const props = defineProps<{ classes: AdminClassItem[] }>();
const emit = defineEmits<{ (e: 'delete', id: string): void; (e: 'refresh'): void }>();

const router = useRouter();
const { t } = useI18n();
const searchQuery = ref('');
const expandedClassId = ref<string | null>(null);
const students = ref<ClassStudent[]>([]);
const studentsLoading = ref(false);
const showEditModal = ref(false);
const editClass = ref<AdminClassItem | null>(null);
const editName = ref('');
const editTeacherId = ref<number | null>(null);
const teachers = ref<Teacher[]>([]);
const editLoading = ref(false);
const editError = ref('');
const showCreateModal = ref(false);
const newName = ref('');
const newCode = ref('');
const newTeacherId = ref<number | null>(null);
const createLoading = ref(false);
const createError = ref('');

const filteredClasses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.classes;
  return props.classes.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.code?.toLowerCase().includes(q) ||
    c.teacher_name?.toLowerCase().includes(q)
  );
});

async function toggleStudents(classId: string) {
  if (expandedClassId.value === classId) {
    expandedClassId.value = null;
    students.value = [];
    return;
  }
  expandedClassId.value = classId;
  studentsLoading.value = true;
  students.value = [];
  try {
    const res = await getAdminClassStudents(classId);
    if (res.success) students.value = res.students;
  } catch { /* ignore */ }
  finally { studentsLoading.value = false; }
}

async function openEditModal(cls: AdminClassItem) {
  editClass.value = cls;
  editName.value = cls.name;
  editTeacherId.value = null;
  editError.value = '';
  showEditModal.value = true;
  if (teachers.value.length === 0) {
    try {
      const res = await getAdminTeachers();
      if (res.success) teachers.value = res.teachers;
    } catch { /* ignore */ }
  }
}

async function saveEdit() {
  if (!editClass.value) return;
  editLoading.value = true;
  editError.value = '';
  try {
    const data: { name?: string; teacher_id?: number } = {};
    if (editName.value.trim() && editName.value.trim() !== editClass.value.name) {
      data.name = editName.value.trim();
    }
    if (editTeacherId.value !== null) {
      data.teacher_id = editTeacherId.value;
    }
    if (Object.keys(data).length === 0) {
      showEditModal.value = false;
      return;
    }
    const res = await updateAdminClass(editClass.value.id, data);
    if (!res.success) {
      editError.value = res.message || 'Failed';
    } else {
      showEditModal.value = false;
      emit('refresh');
    }
  } catch (err: unknown) {
    editError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally {
    editLoading.value = false;
  }
}

function openReport(reportId: number) {
  router.push(`/report/${reportId}`);
}

async function openCreateModal() {
  newName.value = '';
  newCode.value = '';
  newTeacherId.value = null;
  createError.value = '';
  showCreateModal.value = true;
  if (teachers.value.length === 0) {
    try {
      const res = await getAdminTeachers();
      if (res.success) teachers.value = res.teachers;
    } catch { /* ignore */ }
  }
}

async function saveCreate() {
  if (!newName.value.trim() || !newTeacherId.value) { createError.value = t('admin.fillFields'); return; }
  createLoading.value = true;
  createError.value = '';
  try {
    const res = await createAdminClass(newName.value.trim(), newCode.value.trim() || undefined, newTeacherId.value);
    if (!res.success) { createError.value = res.message || 'Failed'; }
    else { showCreateModal.value = false; emit('refresh'); }
  } catch (err: unknown) {
    createError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally { createLoading.value = false; }
}
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.classes', { count: classes.length }) }}</h3>
      <div class="section-actions">
        <input v-model="searchQuery" class="search-input" :placeholder="t('admin.searchClasses')" />
        <button class="btn-primary" @click="openCreateModal">{{ t('admin.createClass') }}</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('admin.name') }}</th><th>{{ t('admin.code') }}</th><th>{{ t('admin.teacher') }}</th><th>{{ t('admin.students') }}</th><th>{{ t('admin.createdAt') }}</th><th>{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="c in filteredClasses" :key="c.id">
            <tr :class="{ 'row-expanded': expandedClassId === c.id }">
              <td>{{ c.name }}</td>
              <td><code>{{ c.code }}</code></td>
              <td>{{ c.teacher_name }}</td>
              <td>{{ c.student_count }}</td>
              <td>{{ c.created_at?.slice(0, 10) }}</td>
              <td class="action-cell">
                <button class="btn-view" @click="toggleStudents(c.id)">{{ t('admin.viewStudents') }}</button>
                <button class="btn-edit" @click="openEditModal(c)">{{ t('admin.editClass') }}</button>
                <button class="btn-danger" @click="$emit('delete', c.id)">{{ t('admin.delete') }}</button>
              </td>
            </tr>
            <tr v-if="expandedClassId === c.id" class="expanded-row">
              <td colspan="6">
                <div class="students-panel">
                  <div v-if="studentsLoading" class="loading-inline">{{ t('admin.loading') }}</div>
                  <div v-else-if="students.length === 0" class="empty-inline">{{ t('admin.noStudentsInClass') }}</div>
                  <table v-else class="students-table">
                    <thead>
                      <tr><th>{{ t('admin.name') }}</th><th>{{ t('adminUser.email') }}</th><th>{{ t('admin.reportCount') }}</th><th>{{ t('admin.createdAt') }}</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="s in students" :key="s.id">
                        <td>{{ s.name }}</td>
                        <td>{{ s.email }}</td>
                        <td>{{ s.report_count }}</td>
                        <td>{{ s.joined_at?.slice(0, 10) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-if="filteredClasses.length === 0" class="empty">{{ t('admin.noResults') }}</p>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <h4>{{ t('admin.editClass') }}</h4>
        <div class="form-row">
          <label>{{ t('admin.renameClass') }}</label>
          <input v-model="editName" />
        </div>
        <div class="form-row">
          <label>{{ t('admin.transferTeacher') }}</label>
          <select v-model="editTeacherId">
            <option :value="null">— {{ t('admin.selectTeacher') }} —</option>
            <option v-for="tc in teachers" :key="tc.id" :value="tc.id">{{ tc.name }} ({{ tc.email }})</option>
          </select>
        </div>
        <p v-if="editError" class="msg error">{{ editError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showEditModal = false">{{ t('admin.cancel') }}</button>
          <button class="btn-submit" :disabled="editLoading" @click="saveEdit">{{ editLoading ? '...' : t('admin.save') }}</button>
        </div>
      </div>
    </div>

    <!-- Create Class Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h4>{{ t('admin.createClass') }}</h4>
        <div class="form-row">
          <label>{{ t('admin.className') }}</label>
          <input v-model="newName" :placeholder="t('admin.classNamePlaceholder')" />
        </div>
        <div class="form-row">
          <label>{{ t('admin.classCode') }}</label>
          <input v-model="newCode" :placeholder="t('admin.classCodePlaceholder')" />
        </div>
        <div class="form-row">
          <label>{{ t('admin.teacher') }}</label>
          <select v-model="newTeacherId">
            <option :value="null">— {{ t('admin.selectTeacher') }} —</option>
            <option v-for="tc in teachers" :key="tc.id" :value="tc.id">{{ tc.name }} ({{ tc.email }})</option>
          </select>
        </div>
        <p v-if="createError" class="msg error">{{ createError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showCreateModal = false">{{ t('admin.cancel') }}</button>
          <button class="btn-submit" :disabled="createLoading" @click="saveCreate">{{ createLoading ? '...' : t('admin.create') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.section-actions { display: flex; gap: 0.5rem; align-items: center; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }
.search-input { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; min-width: 250px; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table tr.row-expanded { background: rgba(99,102,241,0.06); }
.data-table code { background: rgba(255,255,255,0.05); padding: 0.15rem 0.35rem; border-radius: 0.3rem; font-size: 0.8rem; }
.action-cell { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.btn-danger { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-view { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(59,130,246,0.15); color: #60a5fa; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-view:hover { background: rgba(59,130,246,0.25); }
.btn-edit { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(251,191,36,0.15); color: #fbbf24; cursor: pointer; font-family: inherit; font-size: 0.78rem; }
.btn-edit:hover { background: rgba(251,191,36,0.25); }
.expanded-row td { padding: 0; border-bottom: 1px solid rgba(99,102,241,0.1); }
.students-panel { padding: 0.8rem 1rem; background: rgba(15,23,42,0.4); }
.loading-inline, .empty-inline { text-align: center; color: #64748b; padding: 1rem; font-size: 0.82rem; }
.students-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.students-table th { text-align: end; padding: 0.4rem 0.6rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; }
.students-table td { padding: 0.4rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.03); color: #cbd5e1; }
.empty { text-align: center; color: #64748b; padding: 2rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; }
.modal-content h4 { margin: 0 0 1rem; color: #e2e8f0; font-size: 1rem; }
.form-row { margin-bottom: 0.75rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.form-row input, .form-row select { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.msg.error { color: #f87171; font-size: 0.85rem; margin: 0.5rem 0; }
</style>
