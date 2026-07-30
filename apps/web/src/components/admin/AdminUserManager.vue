<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from '../../composables/useI18n';

interface AdminUser { id: number; name: string; email: string; role: string; created_at?: string }

const props = defineProps<{
  users: AdminUser[];
  currentUserId?: number;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'delete', id: number): void;
  (e: 'change-role', id: number, role: string): void;
  (e: 'add', name: string, email: string, password: string, role: string): void;
  (e: 'view', id: number): void;
}>();

const { t } = useI18n();
const searchQuery = ref('');
const showAddUser = ref(false);
const newUser = ref({ name: '', email: '', password: '', role: 'student' as string });
const addUserLoading = ref(false);
const addUserError = ref('');
const selectedIds = ref<Set<number>>(new Set());
const bulkRole = ref<string>('');

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const list = props.currentUserId
    ? props.users.filter((u) => u.id !== props.currentUserId)
    : props.users;
  if (!q) return list;
  return list.filter((u) =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    String(u.id).includes(q)
  );
});

const allSelected = computed(() => filteredUsers.value.length > 0 && filteredUsers.value.every(u => selectedIds.value.has(u.id)));

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(filteredUsers.value.map(u => u.id));
  }
}

function toggleOne(id: number) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id); else next.add(id);
  selectedIds.value = next;
}

function bulkDelete() {
  if (selectedIds.value.size === 0) return;
  if (!confirm(t('admin.confirmBulkDelete', { count: selectedIds.value.size }))) return;
  for (const id of selectedIds.value) emit('delete', id);
  selectedIds.value = new Set();
}

function bulkChangeRole() {
  if (selectedIds.value.size === 0 || !bulkRole.value) return;
  for (const id of selectedIds.value) emit('change-role', id, bulkRole.value);
  selectedIds.value = new Set();
  bulkRole.value = '';
}

async function addUser() {
  addUserLoading.value = true;
  addUserError.value = '';
  try {
    emit('add', newUser.value.name, newUser.value.email, newUser.value.password, newUser.value.role);
    showAddUser.value = false;
    newUser.value = { name: '', email: '', password: '', role: 'student' };
  } catch (err: unknown) {
    addUserError.value = (err instanceof Error ? err.message : '') || t('adminUser.createFailed');
  } finally {
    addUserLoading.value = false;
  }
}
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>{{ t('admin.users', { count: users.length }) }}</h3>
      <div class="section-actions">
        <input v-model="searchQuery" class="search-input" :placeholder="t('adminUser.search')" />
        <button class="btn-primary" @click="showAddUser = true">{{ t('adminUser.addUser') }}</button>
      </div>
    </div>

    <div v-if="showAddUser" class="modal-overlay" @click.self="showAddUser = false">
      <div class="modal-content">
        <h4>{{ t('adminUser.addUserTitle') }}</h4>
        <div class="form-row">
          <label>{{ t('admin.name') }}</label>
          <input v-model="newUser.name" :placeholder="t('adminUser.fullName')" />
        </div>
        <div class="form-row">
          <label>{{ t('adminUser.email') }}</label>
          <input v-model="newUser.email" type="email" placeholder="email@example.com" />
        </div>
        <div class="form-row">
          <label>{{ t('adminUser.passwordLabel') }}</label>
          <input v-model="newUser.password" type="password" placeholder="********" />
        </div>
        <div class="form-row">
          <label>{{ t('adminUser.role') }}</label>
          <select v-model="newUser.role">
            <option value="student">{{ t('admin.roleStudent') }}</option>
            <option value="teacher">{{ t('admin.roleTeacher') }}</option>
            <option value="admin">{{ t('admin.roleAdmin') }}</option>
          </select>
        </div>
        <p v-if="addUserError" class="msg error">{{ addUserError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddUser = false">{{ t('common.cancel') }}</button>
          <button class="btn-submit" :disabled="addUserLoading" @click="addUser">{{ addUserLoading ? '...' : t('adminUser.create') }}</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
            <th>ID</th><th>{{ t('admin.name') }}</th><th>{{ t('adminUser.email') }}</th><th>{{ t('adminUser.role') }}</th><th>{{ t('adminUser.from') }}</th><th>{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-selected': selectedIds.has(u.id) }">
            <td class="col-check"><input type="checkbox" :checked="selectedIds.has(u.id)" @change="toggleOne(u.id)" /></td>
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select :value="u.role" @change="emit('change-role', u.id, ($event.target as HTMLSelectElement).value)">
                <option value="student">{{ t('admin.roleStudent') }}</option>
                <option value="teacher">{{ t('admin.roleTeacher') }}</option>
                <option value="admin">{{ t('admin.roleAdmin') }}</option>
              </select>
              <span v-if="u.role === 'admin'" class="admin-badge">Admin</span>
            </td>
            <td>{{ u.created_at?.slice(0, 10) }}</td>
            <td>
              <button class="btn-view" @click="emit('view', u.id)">{{ t('adminUser.view') }}</button>
              <button class="btn-danger" @click="emit('delete', u.id)">{{ t('admin.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredUsers.length === 0" class="empty">{{ t('admin.noResults') }}</p>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="selectedIds.size > 0" class="bulk-bar">
      <span class="bulk-count">{{ selectedIds.size }} {{ t('admin.selected') }}</span>
      <select v-model="bulkRole" class="bulk-select">
        <option value="">— {{ t('adminUser.role') }} —</option>
        <option value="student">{{ t('admin.roleStudent') }}</option>
        <option value="teacher">{{ t('admin.roleTeacher') }}</option>
        <option value="admin">{{ t('admin.roleAdmin') }}</option>
      </select>
      <button v-if="bulkRole" class="btn-bulk-role" @click="bulkChangeRole">{{ t('admin.applyRole') }}</button>
      <button class="btn-bulk-delete" @click="bulkDelete">{{ t('admin.deleteSelected') }}</button>
      <button class="btn-clear" @click="selectedIds = new Set()">✕</button>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.section-header h3 { margin: 0; font-size: 1.1rem; }
.section-actions { display: flex; gap: 0.5rem; align-items: center; }
.search-input { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; min-width: 200px; }
.btn-primary { padding: 0.45rem 0.9rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; cursor: pointer; font-family: inherit; font-weight: 700; font-size: 0.85rem; }
.empty { text-align: center; color: #64748b; padding: 2rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: end; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table select { padding: 0.2rem 0.4rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; }
.btn-danger { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.admin-badge { display: inline-block; margin-inline-start: 0.4rem; padding: 0.1rem 0.4rem; border-radius: 0.25rem; background: rgba(99,102,241,0.15); color: #a5b4fc; font-size: 0.7rem; font-weight: 700; }
.btn-view { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(59,130,246,0.15); color: #60a5fa; cursor: pointer; font-family: inherit; font-size: 0.8rem; margin-inline-start: 0.3rem; }
.btn-view:hover { background: rgba(59,130,246,0.25); }

.data-table tr.row-selected { background: rgba(99,102,241,0.08); }
.col-check { width: 32px; text-align: center; }
.col-check input { cursor: pointer; }

.bulk-bar { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; padding: 0.6rem 0.8rem; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); border-radius: 0.5rem; flex-wrap: wrap; }
.bulk-count { font-size: 0.85rem; font-weight: 700; color: #a5b4fc; }
.bulk-select { padding: 0.3rem 0.5rem; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.8rem; }
.btn-bulk-role { padding: 0.3rem 0.7rem; border-radius: 0.35rem; border: none; background: rgba(251,191,36,0.15); color: #fbbf24; cursor: pointer; font-family: inherit; font-size: 0.8rem; font-weight: 700; }
.btn-bulk-role:hover { background: rgba(251,191,36,0.25); }
.btn-bulk-delete { padding: 0.3rem 0.7rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.8rem; font-weight: 700; }
.btn-bulk-delete:hover { background: rgba(239,68,68,0.25); }
.btn-clear { width: 28px; height: 28px; border-radius: 0.35rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; cursor: pointer; font-size: 0.8rem; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; width: 100%; max-width: 420px; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
.modal-content h4 { margin: 0 0 1rem; color: #e2e8f0; font-size: 1rem; }
.form-row { margin-bottom: 0.75rem; }
.form-row label { display: block; font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.25rem; }
.form-row input, .form-row select { width: 100%; padding: 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.85rem; box-sizing: border-box; }
.modal-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.modal-actions button { flex: 1; padding: 0.55rem; border-radius: 0.5rem; font-family: inherit; font-weight: 700; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
.btn-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; }
.msg.error { color: #f87171; font-size: 0.85rem; margin: 0.5rem 0; }
</style>
