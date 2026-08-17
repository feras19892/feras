<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { getAdminClassStudents } from '../../services/admin.service';
import ClassModals from './classes/ClassModals.vue';

interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  student_count: number;
  created_at?: string;
  is_frozen?: number;
}

interface ClassStudent {
  id: number;
  name: string;
  email: string;
  joined_at: string;
  report_count: number;
}

const props = defineProps<{ classes: AdminClassItem[]; initialSearch?: string }>();
const emit = defineEmits<{ (e: 'delete', id: string): void; (e: 'refresh'): void }>();

const { t } = useI18n();
const searchQuery = ref(props.initialSearch || '');
watch(() => props.initialSearch, (v) => { if (v !== undefined) searchQuery.value = v; });
const expandedClassId = ref<string | null>(null);
const students = ref<ClassStudent[]>([]);
const studentsLoading = ref(false);
const showEditModal = ref(false);
const showCreateModal = ref(false);
const editClass = ref<AdminClassItem | null>(null);

const filteredClasses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.classes;
  return props.classes.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.code?.toLowerCase().includes(q) ||
    c.teacher_name?.toLowerCase().includes(q)
  );
});

const { confirmDialog } = useConfirmDialog();

function confirmDeleteClass(id: string) {
  confirmDialog({ message: t('admin.confirmDeleteClassShort'), variant: 'danger' }).then(ok => {
    if (ok) emit('delete', id);
  });
}

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

function openEditModal(cls: AdminClassItem) {
  editClass.value = cls;
  showEditModal.value = true;
}

function openCreateModal() {
  showCreateModal.value = true;
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
              <td>{{ c.name }} <span v-if="c.is_frozen" class="freeze-badge">🧊 مُجمّد</span></td>
              <td><code>{{ c.code }}</code></td>
              <td>{{ c.teacher_name }}</td>
              <td>{{ c.student_count }}</td>
              <td>{{ c.created_at?.slice(0, 10) }}</td>
              <td class="action-cell">
                <button class="btn-view" @click="toggleStudents(c.id)">{{ t('admin.viewStudents') }}</button>
                <button class="btn-edit" @click="openEditModal(c)">{{ t('admin.editClass') }}</button>
                <button class="btn-danger" @click="confirmDeleteClass(c.id)">{{ t('admin.delete') }}</button>
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

    <ClassModals
      :edit-class="editClass"
      :show-edit="showEditModal"
      :show-create="showCreateModal"
      @close-edit="showEditModal = false"
      @close-create="showCreateModal = false"
      @saved="emit('refresh')"
    />
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
.freeze-badge { display: inline-flex; align-items: center; gap: 0.2rem; padding: 0.1rem 0.4rem; border-radius: 4px; background: rgba(6,182,212,0.15); color: #67e8f9; font-size: 0.65rem; font-weight: 700; margin-inline-start: 0.4rem; }
</style>
