<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { adminGetEmailRequests, adminReviewEmailRequest, adminGetCapacityRequests, adminReviewCapacityRequest } from '../../services/school.service';
import { useI18n } from '../../composables/useI18n';

const { t } = useI18n();

const emailRequests = ref<any[]>([]);
const capacityRequests = ref<any[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const activeSub = ref<'email' | 'capacity'>('email');

async function loadRequests() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const [emailRes, capRes] = await Promise.all([
      adminGetEmailRequests(),
      adminGetCapacityRequests(),
    ]);
    if (emailRes.success) emailRequests.value = emailRes.requests;
    if (capRes.success) capacityRequests.value = capRes.requests;
  } catch (e) {
    errorMsg.value = 'Failed to load requests';
  } finally {
    loading.value = false;
  }
}

async function reviewEmail(id: number, status: 'approved' | 'rejected') {
  const res = await adminReviewEmailRequest(id, status);
  if (res.success) await loadRequests();
}

async function reviewCapacity(id: number, status: 'approved' | 'rejected') {
  const res = await adminReviewCapacityRequest(id, status);
  if (res.success) await loadRequests();
}

const pendingEmailCount = computed(() => emailRequests.value.filter(r => r.status === 'pending').length);
const pendingCapacityCount = computed(() => capacityRequests.value.filter(r => r.status === 'pending').length);

onMounted(loadRequests);
</script>

<template>
  <div class="requests-panel">
    <h2>📋 الطلبات</h2>

    <div class="sub-tabs">
      <button :class="['sub-tab', { active: activeSub === 'email' }]" @click="activeSub = 'email'">
        📧 تغيير البريد
        <span v-if="pendingEmailCount > 0" class="sub-badge">{{ pendingEmailCount }}</span>
      </button>
      <button :class="['sub-tab', { active: activeSub === 'capacity' }]" @click="activeSub = 'capacity'">
        📦 طلبات السعة
        <span v-if="pendingCapacityCount > 0" class="sub-badge">{{ pendingCapacityCount }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="errorMsg" class="error">❌ {{ errorMsg }}</div>

    <div v-else-if="activeSub === 'email'">
      <div v-if="emailRequests.length === 0" class="empty">
        <div class="empty-icon">📭</div>
        <p>لا توجد طلبات</p>
      </div>
      <table v-else class="req-table">
        <thead>
          <tr>
            <th>النوع</th>
            <th>البريد الحالي</th>
            <th>البريد الجديد</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in emailRequests" :key="r.id">
            <td><span class="type-tag" :class="r.requester_type">{{ r.requester_type === 'school' ? 'مدرسة' : 'مستخدم' }}</span></td>
            <td>{{ r.current_email }}</td>
            <td>{{ r.requested_email }}</td>
            <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
            <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
            <td v-if="r.status === 'pending'" class="action-cell">
              <button class="mini-btn approve" @click="reviewEmail(r.id, 'approved')" title="موافقة">✅</button>
              <button class="mini-btn reject" @click="reviewEmail(r.id, 'rejected')" title="رفض">❌</button>
            </td>
            <td v-else>—</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="activeSub === 'capacity'">
      <div v-if="capacityRequests.length === 0" class="empty">
        <div class="empty-icon">📭</div>
        <p>لا توجد طلبات سعة</p>
      </div>
      <table v-else class="req-table">
        <thead>
          <tr>
            <th>المدرسة</th>
            <th>الطلاب الحالي</th>
            <th>طلب الطلاب</th>
            <th>المدرسين الحالي</th>
            <th>طلب المدرسين</th>
            <th>السبب</th>
            <th>الحالة</th>
            <th>التاريخ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in capacityRequests" :key="r.id">
            <td>{{ r.school_name }}</td>
            <td>{{ r.current_max_students }}</td>
            <td>{{ r.requested_max_students || '—' }}</td>
            <td>{{ r.current_max_teachers }}</td>
            <td>{{ r.requested_max_teachers || '—' }}</td>
            <td class="reason-cell">{{ r.reason }}</td>
            <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
            <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
            <td v-if="r.status === 'pending'" class="action-cell">
              <button class="mini-btn approve" @click="reviewCapacity(r.id, 'approved')" title="موافقة">✅</button>
              <button class="mini-btn reject" @click="reviewCapacity(r.id, 'rejected')" title="رفض">❌</button>
            </td>
            <td v-else>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.requests-panel { color: #e2e8f0; }
.requests-panel h2 { font-size: 1.2rem; margin: 0 0 1rem; }
.loading, .error, .empty { text-align: center; padding: 2rem; color: #64748b; }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

.sub-tabs { display: flex; gap: 0.4rem; margin-bottom: 1rem; }
.sub-tab {
  padding: 0.4rem 0.9rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,23,42,0.6); color: #94a3b8; cursor: pointer; font-family: inherit;
  font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; transition: all 0.15s;
}
.sub-tab.active { background: rgba(239,68,68,0.12); color: #fca5a5; border-color: rgba(239,68,68,0.25); }
.sub-tab:hover { border-color: rgba(255,255,255,0.15); }
.sub-badge {
  background: rgba(239,68,68,0.25); color: #fca5a5; padding: 0.1rem 0.4rem;
  border-radius: 999px; font-size: 0.68rem; font-weight: 800;
}

.req-table { width: 100%; border-collapse: collapse; }
.req-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); }
.req-table td { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.req-table tr:hover { background: rgba(255,255,255,0.02); }
.reason-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #94a3b8; font-size: 0.78rem; }

.type-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.type-tag.school { background: rgba(6,182,212,0.15); color: #67e8f9; }
.type-tag.user { background: rgba(129,140,248,0.15); color: #a5b4fc; }

.status-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.status-tag.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status-tag.approved { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag.rejected { background: rgba(239,68,68,0.15); color: #f87171; }

.action-cell { display: flex; gap: 0.3rem; }
.mini-btn { width: 28px; height: 28px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.8rem; }
.mini-btn.approve:hover { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
.mini-btn.reject:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
</style>
