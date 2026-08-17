<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from '../../../composables/useI18n';
import { getAdminTeachers, updateAdminClass, createAdminClass } from '../../../services/admin.service';

interface AdminClassItem {
  id: string; name: string; code: string;
  teacher_name: string; student_count: number; created_at?: string;
}
interface Teacher { id: number; name: string; email: string }

const props = defineProps<{
  editClass: AdminClassItem | null
  showEdit: boolean
  showCreate: boolean
}>();

const emit = defineEmits<{
  (e: 'close-edit'): void
  (e: 'close-create'): void
  (e: 'saved'): void
}>();

const { t } = useI18n();
const teachers = ref<Teacher[]>([]);
const editName = ref('');
const editTeacherId = ref<number | null>(null);
const editLoading = ref(false);
const editError = ref('');
const newName = ref('');
const newCode = ref('');
const newTeacherId = ref<number | null>(null);
const createLoading = ref(false);
const createError = ref('');

async function loadTeachers() {
  if (teachers.value.length > 0) return;
  try {
    const res = await getAdminTeachers();
    if (res.success) teachers.value = res.teachers;
  } catch { /* ignore */ }
}

function onOpenEdit() {
  if (props.editClass) {
    editName.value = props.editClass.name;
    editTeacherId.value = null;
  }
  editError.value = '';
  loadTeachers();
}

function onOpenCreate() {
  newName.value = '';
  newCode.value = '';
  newTeacherId.value = null;
  createError.value = '';
  loadTeachers();
}

async function saveEdit() {
  if (!props.editClass) return;
  editLoading.value = true;
  editError.value = '';
  try {
    const data: { name?: string; teacher_id?: number } = {};
    if (editName.value.trim() && editName.value.trim() !== props.editClass.name) data.name = editName.value.trim();
    if (editTeacherId.value !== null) data.teacher_id = editTeacherId.value;
    if (Object.keys(data).length === 0) { emit('close-edit'); return; }
    const res = await updateAdminClass(props.editClass.id, data);
    if (!res.success) editError.value = res.message || 'Failed';
    else { emit('close-edit'); emit('saved'); }
  } catch (err: unknown) {
    editError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally { editLoading.value = false; }
}

async function saveCreate() {
  if (!newName.value.trim() || !newTeacherId.value) { createError.value = t('admin.fillFields'); return; }
  createLoading.value = true;
  createError.value = '';
  try {
    const res = await createAdminClass(newName.value.trim(), newCode.value.trim() || undefined, newTeacherId.value);
    if (!res.success) createError.value = res.message || 'Failed';
    else { emit('close-create'); emit('saved'); }
  } catch (err: unknown) {
    createError.value = (err instanceof Error ? err.message : '') || 'Failed';
  } finally { createLoading.value = false; }
}

watch(() => props.showEdit, (v) => { if (v) onOpenEdit(); });
watch(() => props.showCreate, (v) => { if (v) onOpenCreate(); });
</script>

<template>
  <!-- Edit Modal -->
  <div v-if="showEdit" class="modal-overlay" @click.self="emit('close-edit')">
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
        <button class="btn-cancel" @click="emit('close-edit')">{{ t('admin.cancel') }}</button>
        <button class="btn-submit" :disabled="editLoading" @click="saveEdit">{{ editLoading ? '...' : t('admin.save') }}</button>
      </div>
    </div>
  </div>

  <!-- Create Modal -->
  <div v-if="showCreate" class="modal-overlay" @click.self="emit('close-create')">
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
        <button class="btn-cancel" @click="emit('close-create')">{{ t('admin.cancel') }}</button>
        <button class="btn-submit" :disabled="createLoading" @click="saveCreate">{{ createLoading ? '...' : t('admin.create') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
