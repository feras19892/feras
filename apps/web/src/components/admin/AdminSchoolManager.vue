<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  adminGetAllSchools, adminToggleSchool, adminGetSchoolDetail,
  adminUpdateSchool, adminDeleteSchool, adminGetSchoolUsers,
  adminGetSchoolClasses, adminGetSchoolReports,
  adminRemoveSchoolUser, adminBlockSchoolUser, adminUnblockSchoolUser,
  type AdminSchool,
} from '../../services/school.service';
import { fetchJson } from '../../services/http';
import { useI18n } from '../../composables/useI18n';
import AdminSchoolList from './schools/AdminSchoolList.vue';
import AdminSchoolOverview from './schools/AdminSchoolOverview.vue';
import AdminSchoolUsers from './schools/AdminSchoolUsers.vue';
import AdminSchoolClasses from './schools/AdminSchoolClasses.vue';
import AdminSchoolReports from './schools/AdminSchoolReports.vue';
import AdminSchoolEdit from './schools/AdminSchoolEdit.vue';

const { t } = useI18n();
const schools = ref<AdminSchool[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const selectedSchool = ref<AdminSchool | null>(null);
const detailLoading = ref(false);
const detailTab = ref<'overview' | 'users' | 'classes' | 'reports' | 'edit' | 'capacity'>('overview');
const capacityRequests = ref<any[]>([]);
const capacityLoading = ref(false);
const schoolUsers = ref<any[]>([]);
const schoolClasses = ref<any[]>([]);
const schoolReports = ref<any[]>([]);
const schoolStats = ref<any>(null);

async function loadSchools() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await adminGetAllSchools();
    if (res.success) schools.value = res.schools;
  } catch {
    errorMsg.value = 'Failed to load schools';
  } finally {
    loading.value = false;
  }
}

async function openDetail(s: AdminSchool) {
  selectedSchool.value = s;
  detailLoading.value = true;
  detailTab.value = 'overview';
  try {
    const [d, u, c, r] = await Promise.all([
      adminGetSchoolDetail(s.id), adminGetSchoolUsers(s.id),
      adminGetSchoolClasses(s.id), adminGetSchoolReports(s.id),
    ]);
    if (d.success) schoolStats.value = d.stats;
    if (u.success) schoolUsers.value = u.users;
    if (c.success) schoolClasses.value = c.classes;
    if (r.success) schoolReports.value = r.reports;
  } catch {
    errorMsg.value = 'Failed to load school details';
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  selectedSchool.value = null;
  schoolUsers.value = [];
  schoolClasses.value = [];
  schoolReports.value = [];
  schoolStats.value = null;
}

async function handleToggle(id: number) {
  const res = await adminToggleSchool(id);
  if (res.success) {
    const s = schools.value.find(s => s.id === id);
    if (s) s.is_active = !s.is_active;
  }
}

async function handleSaveEdit(data: { name: string; email: string; max_students: number; max_teachers: number }) {
  if (!selectedSchool.value) return;
  const res = await adminUpdateSchool(selectedSchool.value.id, data);
  if (res.success) {
    const s = schools.value.find(s => s.id === selectedSchool.value!.id);
    if (s) { s.name = data.name; s.email = data.email; s.max_students = data.max_students; s.max_teachers = data.max_teachers; }
    detailTab.value = 'overview';
  }
}

async function handleDelete() {
  if (!selectedSchool.value) return;
  if (!confirm(t('admin.schoolConfirmDelete', { name: selectedSchool.value.name }))) return;
  const res = await adminDeleteSchool(selectedSchool.value.id);
  if (res.success) {
    schools.value = schools.value.filter(s => s.id !== selectedSchool.value!.id);
    closeDetail();
  }
}

async function handleRemoveUser(userId: number) {
  if (!selectedSchool.value || !confirm(t('admin.schoolRemoveUser'))) return;
  const res = await adminRemoveSchoolUser(selectedSchool.value.id, userId);
  if (res.success) schoolUsers.value = schoolUsers.value.filter(u => u.id !== userId);
}

async function handleBlockUser(userId: number) {
  if (!selectedSchool.value) return;
  const res = await adminBlockSchoolUser(selectedSchool.value.id, userId);
  if (res.success) { const u = schoolUsers.value.find(u => u.id === userId); if (u) u.blocked_at = new Date().toISOString(); }
}

async function handleUnblockUser(userId: number) {
  if (!selectedSchool.value) return;
  const res = await adminUnblockSchoolUser(selectedSchool.value.id, userId);
  if (res.success) { const u = schoolUsers.value.find(u => u.id === userId); if (u) u.blocked_at = null; }
}

onMounted(loadSchools);

async function loadCapacityRequests() {
  capacityLoading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; requests: any[] }>('/api/school/admin/capacity-requests');
    if (res.success) capacityRequests.value = res.requests;
  } catch {
    // ignore
  }
  capacityLoading.value = false;
}

async function reviewCapacityRequest(id: number, status: 'approved' | 'rejected') {
  try {
    const res = await fetchJson<{ success: boolean }>(`/api/school/admin/capacity-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.success) await loadCapacityRequests();
  } catch {
    // ignore
  }
}
</script>

<template>
  <div class="school-manager">
    <!-- List View -->
    <AdminSchoolList
      v-if="!selectedSchool"
      :schools="schools"
      :loading="loading"
      :error-msg="errorMsg"
      @open="openDetail"
      @toggle="handleToggle"
      @refresh="loadSchools"
    />

    <!-- Detail View -->
    <template v-else>
      <div class="detail-header">
        <button class="btn-back" @click="closeDetail">{{ t('admin.schoolBack') }}</button>
        <h2>🏫 {{ selectedSchool.name }}</h2>
        <code class="school-code-lg">{{ selectedSchool.code }}</code>
      </div>

      <div class="detail-tabs">
        <button :class="{ active: detailTab === 'overview' }" @click="detailTab = 'overview'">{{ t('admin.schoolOverview') }}</button>
        <button :class="{ active: detailTab === 'users' }" @click="detailTab = 'users'">👥 {{ t('admin.schoolUsersTab') }} ({{ schoolUsers.length }})</button>
        <button :class="{ active: detailTab === 'classes' }" @click="detailTab = 'classes'">📚 {{ t('admin.schoolClassesTab') }} ({{ schoolClasses.length }})</button>
        <button :class="{ active: detailTab === 'reports' }" @click="detailTab = 'reports'">📄 {{ t('admin.schoolReportsTab') }} ({{ schoolReports.length }})</button>
        <button :class="{ active: detailTab === 'edit' }" @click="detailTab = 'edit'">{{ t('admin.schoolEditTab') }}</button>
        <button :class="{ active: detailTab === 'capacity' }" @click="detailTab = 'capacity'; loadCapacityRequests()">📦 طلبات السعة ({{ capacityRequests.filter(r => r.status === 'pending').length }})</button>
      </div>

      <div v-if="detailLoading" class="loading-state">{{ t('admin.loading') }}</div>

      <AdminSchoolOverview v-else-if="detailTab === 'overview'" :school="selectedSchool" :stats="schoolStats" @delete="handleDelete" @toggle="handleToggle" />
      <AdminSchoolUsers v-else-if="detailTab === 'users'" :users="schoolUsers" @remove="handleRemoveUser" @block="handleBlockUser" @unblock="handleUnblockUser" />
      <AdminSchoolClasses v-else-if="detailTab === 'classes'" :classes="schoolClasses" />
      <AdminSchoolReports v-else-if="detailTab === 'reports'" :reports="schoolReports" />
      <AdminSchoolEdit v-else-if="detailTab === 'edit'" :school="selectedSchool" @save="handleSaveEdit" />

      <!-- Capacity Requests Tab -->
      <div v-else-if="detailTab === 'capacity'" class="capacity-admin">
        <div v-if="capacityLoading" class="loading-state">...</div>
        <div v-else-if="capacityRequests.length === 0" class="loading-state">لا توجد طلبات</div>
        <table v-else class="data-table">
          <thead>
            <tr><th>المدرسة</th><th>الطلاب</th><th>المدرسين</th><th>السبب</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr>
          </thead>
          <tbody>
            <tr v-for="req in capacityRequests" :key="req.id">
              <td>{{ req.school_name }}</td>
              <td>{{ req.current_max_students }} → {{ req.requested_max_students || '—' }}</td>
              <td>{{ req.current_max_teachers }} → {{ req.requested_max_teachers || '—' }}</td>
              <td>{{ req.reason }}</td>
              <td><span class="cap-status" :class="req.status">{{ req.status }}</span></td>
              <td>{{ new Date(req.created_at).toLocaleDateString('ar-SA') }}</td>
              <td v-if="req.status === 'pending'">
                <button class="approve-btn" @click="reviewCapacityRequest(req.id, 'approved')">✓ موافقة</button>
                <button class="reject-btn" @click="reviewCapacityRequest(req.id, 'rejected')">✕ رفض</button>
              </td>
              <td v-else>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.school-manager { padding: 0.5rem 0; }
.loading-state { text-align: center; padding: 2rem; color: #64748b; }

.detail-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.btn-back { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.4rem 0.8rem; cursor: pointer; color: #94a3b8; font-size: 0.85rem; }
.btn-back:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
.detail-header h2 { font-size: 1.2rem; color: #e2e8f0; margin: 0; }
.school-code-lg { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); border-radius: 0.4rem; padding: 0.3rem 0.6rem; font-size: 0.9rem; color: #67e8f9; }

.detail-tabs { display: flex; gap: 0.4rem; margin-bottom: 1rem; flex-wrap: wrap; }
.detail-tabs button { padding: 0.5rem 0.9rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 0.4rem; background: rgba(255,255,255,0.03); color: #94a3b8; cursor: pointer; font-size: 0.82rem; transition: all 0.15s; }
.detail-tabs button:hover { background: rgba(255,255,255,0.06); color: #cbd5e1; }
.detail-tabs button.active { background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.3); color: #67e8f9; }

.capacity-admin { padding: 0.5rem 0; }
.capacity-admin .data-table { width: 100%; border-collapse: collapse; }
.capacity-admin .data-table th { text-align: start; padding: 0.5rem 0.7rem; font-size: 0.78rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); }
.capacity-admin .data-table td { padding: 0.5rem 0.7rem; font-size: 0.8rem; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.cap-status { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.cap-status.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.cap-status.approved { background: rgba(34,197,94,0.15); color: #22c55e; }
.cap-status.rejected { background: rgba(239,68,68,0.15); color: #ef4444; }
.approve-btn { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; margin-inline-end: 0.3rem; }
.approve-btn:hover { background: rgba(34,197,94,0.25); }
.reject-btn { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }
.reject-btn:hover { background: rgba(239,68,68,0.25); }
</style>
