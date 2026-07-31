<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { fetchJson } from '../../services/http';
import type { School, SchoolStats } from '../../services/school.service';

const props = defineProps<{
  school: School | null;
  stats: SchoolStats | null;
  dateLocaleStr: string;
}>();

const { t } = useI18n();

const capacityForm = ref({ requested_max_students: null as number | null, requested_max_teachers: null as number | null, reason: '' });
const capacitySaving = ref(false);
const capacityMsg = ref('');
interface CapacityRequest {
  id: number;
  requested_max_students: number | null;
  requested_max_teachers: number | null;
  reason: string;
  status: string;
  created_at: string;
}

const capacityRequests = ref<CapacityRequest[]>([]);

async function submitCapacityRequest() {
  if (!capacityForm.value.reason.trim()) return;
  capacitySaving.value = true;
  capacityMsg.value = '';
  try {
    const res = await fetchJson<{ success: boolean }>('/api/school/capacity-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(capacityForm.value),
    });
    if (res.success) {
      capacityMsg.value = t('school.capacitySuccess');
      capacityForm.value = { requested_max_students: null, requested_max_teachers: null, reason: '' };
      await loadCapacityRequests();
    }
  } catch (err) {
    capacityMsg.value = err instanceof Error ? err.message : t('school.capacityFailed');
  }
  capacitySaving.value = false;
}

async function loadCapacityRequests() {
  try {
    const res = await fetchJson<{ success: boolean; requests: CapacityRequest[] }>('/api/school/capacity-requests');
    if (res.success) capacityRequests.value = res.requests;
  } catch {
    // ignore
  }
}

onMounted(loadCapacityRequests);
</script>

<template>
  <div class="tab-panel">
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-val">{{ stats?.students || 0 }}</span><span class="stat-label">🎓 {{ t('school.students') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ stats?.teachers || 0 }}</span><span class="stat-label">👨‍🏫 {{ t('school.teachers') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ stats?.classes || 0 }}</span><span class="stat-label">🏫 {{ t('school.classes') }}</span></div>
      <div class="stat-card"><span class="stat-val">{{ stats?.reports || 0 }}</span><span class="stat-label">📄 {{ t('school.reports') }}</span></div>
    </div>
    <div class="capacity-bar" v-if="school && stats">
      <div class="cap-row">
        <span>🎓 {{ t('school.studentsCapacity') }}: {{ stats.students }} / {{ school.max_students }}</span>
        <div class="bar"><div class="bar-fill" :style="{ width: Math.min(100, (stats.students / school.max_students) * 100) + '%' }"></div></div>
      </div>
      <div class="cap-row">
        <span>👨‍🏫 {{ t('school.teachersCapacity') }}: {{ stats.teachers }} / {{ school.max_teachers }}</span>
        <div class="bar"><div class="bar-fill teacher" :style="{ width: Math.min(100, (stats.teachers / school.max_teachers) * 100) + '%' }"></div></div>
      </div>
    </div>

    <div class="capacity-request-section">
      <h4>{{ t('school.capacityRequestTitle') }}</h4>
      <div class="cap-form">
        <input
          v-model.number="capacityForm.requested_max_students"
          type="number"
          :placeholder="t('school.capacityStudentsPlaceholder', { max: school?.max_students || 0 })"
          class="cap-input"
        />
        <input
          v-model.number="capacityForm.requested_max_teachers"
          type="number"
          :placeholder="t('school.capacityTeachersPlaceholder', { max: school?.max_teachers || 0 })"
          class="cap-input"
        />
        <input
          v-model="capacityForm.reason"
          :placeholder="t('school.capacityReasonPlaceholder')"
          class="cap-input reason"
        />
        <button
          @click="submitCapacityRequest"
          :disabled="capacitySaving || !capacityForm.reason.trim()"
          class="cap-submit"
        >
          {{ capacitySaving ? t('school.capacitySaving') : t('school.capacitySubmit') }}
        </button>
      </div>
      <div v-if="capacityMsg" class="cap-msg">{{ capacityMsg }}</div>
      <div v-if="capacityRequests.length > 0" class="cap-requests-list">
        <div v-for="req in capacityRequests" :key="req.id" class="cap-req-item">
          <span class="cap-req-status" :class="req.status">{{ req.status }}</span>
          <span>{{ t('school.capacityReqStudents') }}: {{ req.requested_max_students || '—' }} | {{ t('school.capacityReqTeachers') }}: {{ req.requested_max_teachers || '—' }}</span>
          <span class="cap-req-date">{{ new Date(req.created_at).toLocaleDateString(dateLocaleStr) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; text-align: center; }
.stat-val { display: block; font-size: 2rem; font-weight: 800; color: #f1f5f9; }
.stat-label { font-size: 0.8rem; color: #64748b; }
.capacity-bar { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; }
.cap-row { margin-bottom: 1rem; }
.cap-row span { font-size: 0.85rem; color: #94a3b8; }
.bar { height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; margin-top: 0.3rem; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, #06b6d4, #0891b2); border-radius: 4px; transition: width 0.3s; }
.bar-fill.teacher { background: linear-gradient(90deg, #818cf8, #6366f1); }
.capacity-request-section { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; margin-top: 1rem; }
.capacity-request-section h4 { margin: 0 0 0.8rem; font-size: 0.9rem; color: #e2e8f0; }
.cap-form { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.cap-input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.4rem 0.6rem; color: #e2e8f0; font-size: 0.8rem; width: 160px; }
.cap-input.reason { flex: 1; min-width: 200px; }
.cap-submit { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; border-radius: 0.4rem; padding: 0.4rem 1rem; font-size: 0.8rem; font-weight: 700; cursor: pointer; }
.cap-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.cap-msg { margin-top: 0.5rem; font-size: 0.8rem; color: #22c55e; }
.cap-requests-list { margin-top: 0.8rem; display: flex; flex-direction: column; gap: 0.3rem; }
.cap-req-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.6rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 0.4rem; font-size: 0.78rem; color: #94a3b8; }
.cap-req-status { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.cap-req-status.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.cap-req-status.approved { background: rgba(34,197,94,0.15); color: #22c55e; }
.cap-req-status.rejected { background: rgba(239,68,68,0.15); color: #ef4444; }
.cap-req-date { margin-inline-start: auto; color: #64748b; font-size: 0.7rem; }
</style>
