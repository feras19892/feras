<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  users: any[];
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'delete', id: number): void;
  (e: 'changeRole', id: number, role: string): void;
  (e: 'add', name: string, email: string, password: string, role: string): void;
  (e: 'view', id: number): void;
}>();

const searchQuery = ref('');
const showAddUser = ref(false);
const newUser = ref({ name: '', email: '', password: '', role: 'student' as string });
const addUserLoading = ref(false);
const addUserError = ref('');

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.users;
  return props.users.filter((u: any) =>
    u.name?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    String(u.id).includes(q)
  );
});

async function addUser() {
  addUserLoading.value = true;
  addUserError.value = '';
  try {
    emit('add', newUser.value.name, newUser.value.email, newUser.value.password, newUser.value.role);
    showAddUser.value = false;
    newUser.value = { name: '', email: '', password: '', role: 'student' };
  } catch (err: any) {
    addUserError.value = err?.message || 'فشل الإنشاء';
  } finally {
    addUserLoading.value = false;
  }
}
</script>

<template>
  <div class="section">
    <div class="section-header">
      <h3>👥 المستخدمين ({{ users.length }})</h3>
      <div class="section-actions">
        <input v-model="searchQuery" class="search-input" placeholder="🔍 بحث..." />
        <button class="btn-primary" @click="showAddUser = true">➕ إضافة</button>
      </div>
    </div>

    <div v-if="showAddUser" class="modal-overlay" @click.self="showAddUser = false">
      <div class="modal-content">
        <h4>➕ إضافة مستخدم جديد</h4>
        <div class="form-row">
          <label>الاسم</label>
          <input v-model="newUser.name" placeholder="الاسم الكامل" />
        </div>
        <div class="form-row">
          <label>البريد</label>
          <input v-model="newUser.email" type="email" placeholder="email@example.com" />
        </div>
        <div class="form-row">
          <label>كلمة المرور</label>
          <input v-model="newUser.password" type="password" placeholder="********" />
        </div>
        <div class="form-row">
          <label>الدور</label>
          <select v-model="newUser.role">
            <option value="student">طالب</option>
            <option value="teacher">مدرس</option>
            <option value="admin">أدمن</option>
          </select>
        </div>
        <p v-if="addUserError" class="msg error">{{ addUserError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddUser = false">إلغاء</button>
          <button class="btn-submit" :disabled="addUserLoading" @click="addUser">{{ addUserLoading ? '...' : 'إنشاء' }}</button>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>الاسم</th><th>البريد</th><th>الدور</th><th>منذ</th><th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select :value="u.role" @change="emit('changeRole', u.id, ($event.target as HTMLSelectElement).value)">
                <option value="student">طالب</option>
                <option value="teacher">مدرس</option>
                <option value="admin">أدمن</option>
              </select>
            </td>
            <td>{{ u.created_at?.slice(0, 10) }}</td>
            <td>
              <button class="btn-view" @click="emit('view', u.id)">👁️ عرض</button>
              <button class="btn-danger" @click="emit('delete', u.id)">🗑️ حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredUsers.length === 0" class="empty">لا توجد نتائج</p>
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
.data-table th { text-align: right; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table select { padding: 0.2rem 0.4rem; border-radius: 0.3rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; }
.btn-danger { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.btn-view { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(59,130,246,0.15); color: #60a5fa; cursor: pointer; font-family: inherit; font-size: 0.8rem; margin-left: 0.3rem; }
.btn-view:hover { background: rgba(59,130,246,0.25); }

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
