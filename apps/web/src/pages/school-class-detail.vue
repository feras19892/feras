<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import { getSchoolClassDetail } from '../services/school.service';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import NotificationBell from '../components/shared/NotificationBell.vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const auth = useAuthStore();

const classId = route.params.id as string;
const loading = ref(true);
const error = ref('');

const cls = ref<any>(null);
const students = ref<any[]>([]);
const messages = ref<any[]>([]);
const reports = ref<any[]>([]);
const stats = ref<any>({});

const activeTab = ref<'overview' | 'students' | 'chat' | 'reports'>('overview');

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getSchoolClassDetail(classId);
    if (res.success) {
      cls.value = res.class;
      students.value = res.students || [];
      messages.value = res.messages || [];
      reports.value = res.reports || [];
      stats.value = res.stats || {};
    } else {
      error.value = (res as any).message || 'Failed to load';
    }
  } catch (err) {
    error.value = 'Failed to load class data';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function fmtDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(dateLocaleStr.value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

onMounted(loadData);
</script>

<template>
  <div class="scd-page">
    <!-- Header -->
    <div class="scd-header">
      <div class="scd-back" @click="router.push('/school')">
        <span>← رجوع</span>
      </div>
      <div class="scd-header-right">
        <AccountSettingsModal />
        <NotificationBell />
        <button class="logout-btn" @click="auth.clearSchoolSession(); router.push('/')">خروج</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="scd-loading"><div class="spinner"></div></div>
    <div v-else-if="error" class="scd-error">❌ {{ error }}</div>

    <div v-else>
      <!-- Class Info Card -->
      <div class="scd-class-card">
        <div class="scd-class-icon">📚</div>
        <div class="scd-class-info">
          <h2>{{ cls?.name }}</h2>
          <div class="scd-class-meta">
            <span class="meta-item"><strong>الكود:</strong> <code>{{ cls?.code }}</code></span>
            <span class="meta-item"><strong>المدرس:</strong> {{ cls?.teacher_name }}</span>
            <span class="meta-item"><strong>الحالة:</strong> {{ cls?.is_active ? '✅ نشط' : '🔴 مغلق' }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="scd-stats-strip">
        <div class="stat-item"><span class="stat-icon">🎓</span><span class="stat-val">{{ stats.studentCount || 0 }}</span><span class="stat-lab">طلاب</span></div>
        <div class="stat-item"><span class="stat-icon">💬</span><span class="stat-val">{{ stats.messageCount || 0 }}</span><span class="stat-lab">رسائل</span></div>
        <div class="stat-item"><span class="stat-icon">🚩</span><span class="stat-val">{{ stats.flaggedCount || 0 }}</span><span class="stat-lab">مخالفة</span></div>
        <div class="stat-item"><span class="stat-icon">📄</span><span class="stat-val">{{ stats.reportCount || 0 }}</span><span class="stat-lab">تقارير</span></div>
        <div class="stat-item"><span class="stat-icon">✅</span><span class="stat-val">{{ stats.gradedCount || 0 }}</span><span class="stat-lab">مصححة</span></div>
      </div>

      <!-- Tabs -->
      <div class="scd-tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'"><span>📊</span> نظرة عامة</button>
        <button :class="['tab', { active: activeTab === 'students' }]" @click="activeTab = 'students'"><span>🎓</span> الطلاب <span v-if="students.length" class="tab-badge">{{ students.length }}</span></button>
        <button :class="['tab', { active: activeTab === 'chat' }]" @click="activeTab = 'chat'"><span>💬</span> المحادثات <span v-if="messages.length" class="tab-badge">{{ messages.length }}</span></button>
        <button :class="['tab', { active: activeTab === 'reports' }]" @click="activeTab = 'reports'"><span>📄</span> التقارير <span v-if="reports.length" class="tab-badge">{{ reports.length }}</span></button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="scd-tab-panel">
        <div class="scd-grid">
          <div class="scd-card">
            <h3>📋 معلومات الفصل</h3>
            <div class="info-row"><span>الاسم:</span><strong>{{ cls?.name }}</strong></div>
            <div class="info-row"><span>الكود:</span><strong><code>{{ cls?.code }}</code></strong></div>
            <div class="info-row"><span>المدرس:</span><strong>{{ cls?.teacher_name }}</strong></div>
            <div class="info-row"><span>بريد المدرس:</span><strong>{{ cls?.teacher_email }}</strong></div>
            <div class="info-row"><span>الحالة:</span><strong>{{ cls?.is_active ? 'نشط' : 'مغلق' }}</strong></div>
            <div class="info-row"><span>تاريخ الإنشاء:</span><strong>{{ fmtDate(cls?.created_at) }}</strong></div>
          </div>
          <div class="scd-card">
            <h3>📊 الإحصائيات</h3>
            <div class="mini-stat"><span>🎓 عدد الطلاب:</span><strong>{{ stats.studentCount || 0 }}</strong></div>
            <div class="mini-stat"><span>💬 إجمالي الرسائل:</span><strong>{{ stats.messageCount || 0 }}</strong></div>
            <div class="mini-stat"><span>🚩 رسائل مخالفة:</span><strong>{{ stats.flaggedCount || 0 }}</strong></div>
            <div class="mini-stat"><span>📄 إجمالي التقارير:</span><strong>{{ stats.reportCount || 0 }}</strong></div>
            <div class="mini-stat"><span>✅ تقارير مصححة:</span><strong>{{ stats.gradedCount || 0 }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Students Tab -->
      <div v-if="activeTab === 'students'" class="scd-tab-panel">
        <div v-if="students.length === 0" class="scd-empty">لا يوجد طلاب في هذا الفصل</div>
        <div v-else class="scd-table-wrap">
          <table class="scd-table">
            <thead><tr><th>الاسم</th><th>البريد</th><th>التقارير</th><th>تاريخ الانضمام</th></tr></thead>
            <tbody>
              <tr v-for="s in students" :key="s.id" class="clickable-row" @click="router.push(`/school/user/${s.id}`)">
                <td>{{ s.name }}</td>
                <td>{{ s.email }}</td>
                <td>{{ s.report_count }}</td>
                <td>{{ fmtDate(s.joined_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Chat Tab -->
      <div v-if="activeTab === 'chat'" class="scd-tab-panel">
        <div v-if="messages.length === 0" class="scd-empty">لا توجد رسائل في هذا الفصل</div>
        <div v-else class="scd-chat">
          <div v-for="m in messages" :key="m.id" class="chat-msg" :class="{ flagged: m.is_flagged }">
            <div class="chat-msg-header">
              <span class="chat-author" :class="m.user_role">{{ m.user_name }}</span>
              <span class="chat-role">{{ m.user_role === 'teacher' ? '👨‍🏫' : '🎓' }}</span>
              <span v-if="m.is_flagged" class="chat-flag">🚩 مخالفة: {{ m.flagged_reason }}</span>
              <span class="chat-date">{{ fmtDate(m.created_at) }}</span>
            </div>
            <p class="chat-content">{{ m.content }}</p>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="scd-tab-panel">
        <div v-if="reports.length === 0" class="scd-empty">لا توجد تقارير في هذا الفصل</div>
        <div v-else class="scd-table-wrap">
          <table class="scd-table">
            <thead><tr><th>التجربة</th><th>الطالب</th><th>الحالة</th><th>الدرجة</th><th>التاريخ</th></tr></thead>
            <tbody>
              <tr v-for="r in reports" :key="r.id">
                <td>{{ r.experiment_name }}</td>
                <td>{{ r.student_name }}</td>
                <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
                <td>{{ r.grade != null ? r.grade : '—' }}</td>
                <td>{{ fmtDate(r.submitted_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scd-page { min-height: 100vh; background: #0a0f1e; color: #e2e8f0; padding: 1rem; max-width: 1100px; margin: 0 auto; }
.scd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.scd-back { cursor: pointer; color: #94a3b8; font-size: 0.85rem; transition: color 0.15s; }
.scd-back:hover { color: #c7d2fe; }
.scd-header-right { display: flex; align-items: center; gap: 0.6rem; }
.logout-btn { padding: 0.4rem 0.8rem; border-radius: 0.4rem; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); color: #f87171; font-size: 0.78rem; cursor: pointer; font-family: inherit; }
.scd-loading { display: flex; justify-content: center; padding: 3rem; }
.spinner { width: 32px; height: 32px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.scd-error { text-align: center; color: #f87171; padding: 2rem; }

.scd-class-card { display: flex; align-items: center; gap: 1rem; background: rgba(15,23,42,0.6); border: 1px solid rgba(99,102,241,0.12); border-radius: 0.8rem; padding: 1.2rem; margin-bottom: 1rem; }
.scd-class-icon { font-size: 2rem; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); flex-shrink: 0; }
.scd-class-info { flex: 1; }
.scd-class-info h2 { margin: 0 0 0.3rem; font-size: 1.1rem; color: #f1f5f9; }
.scd-class-meta { display: flex; gap: 1rem; flex-wrap: wrap; }
.meta-item { font-size: 0.78rem; color: #64748b; }
.meta-item strong { color: #94a3b8; }
.meta-item code { background: rgba(99,102,241,0.1); padding: 0.1rem 0.3rem; border-radius: 0.2rem; color: #a5b4fc; font-size: 0.75rem; }

.scd-stats-strip { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; background: rgba(15,23,42,0.4); border-radius: 0.6rem; padding: 0.8rem; }
.stat-item { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 80px; }
.stat-icon { font-size: 1rem; }
.stat-val { font-size: 1.2rem; font-weight: 800; color: #f1f5f9; }
.stat-lab { font-size: 0.68rem; color: #64748b; }

.scd-tabs { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.5rem; }
.tab { padding: 0.5rem 0.8rem; border: none; background: transparent; color: #64748b; font-size: 0.78rem; font-weight: 600; cursor: pointer; border-radius: 0.4rem; font-family: inherit; transition: all 0.15s; display: flex; align-items: center; gap: 0.3rem; }
.tab:hover { background: rgba(99,102,241,0.06); color: #c7d2fe; }
.tab.active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.tab-badge { background: rgba(99,102,241,0.2); color: #a5b4fc; font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 0.3rem; }

.scd-tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.scd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
@media (max-width: 700px) { .scd-grid { grid-template-columns: 1fr; } }
.scd-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.6rem; padding: 1rem; }
.scd-card h3 { margin: 0 0 0.6rem; font-size: 0.9rem; color: #c7d2fe; }
.info-row { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.8rem; }
.info-row span { color: #64748b; }
.info-row strong { color: #e2e8f0; }
.mini-stat { display: flex; justify-content: space-between; padding: 0.3rem 0; font-size: 0.8rem; }
.mini-stat span { color: #64748b; }
.mini-stat strong { color: #e2e8f0; }

.scd-empty { text-align: center; color: #475569; padding: 1.5rem; font-size: 0.82rem; }

.scd-table-wrap { overflow-x: auto; }
.scd-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.scd-table th { text-align: right; padding: 0.5rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.scd-table td { padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.03); color: #cbd5e1; }
.clickable-row { cursor: pointer; transition: background 0.12s; }
.clickable-row:hover { background: rgba(99,102,241,0.06); }

.status-tag { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.68rem; font-weight: 600; }
.status-tag.graded { background: rgba(34,197,94,0.15); color: #86efac; }
.status-tag.submitted { background: rgba(245,158,11,0.15); color: #fcd34d; }
.status-tag.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }
.status-tag.resubmitted { background: rgba(168,85,247,0.15); color: #c4b5fd; }

.scd-chat { display: flex; flex-direction: column; gap: 0.4rem; max-height: 600px; overflow-y: auto; }
.chat-msg { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.04); border-radius: 0.5rem; padding: 0.6rem 0.8rem; }
.chat-msg.flagged { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.04); }
.chat-msg-header { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.2rem; }
.chat-author { font-size: 0.8rem; font-weight: 700; color: #c7d2fe; }
.chat-author.teacher { color: #93c5fd; }
.chat-author.student { color: #86efac; }
.chat-role { font-size: 0.75rem; }
.chat-flag { font-size: 0.68rem; color: #fca5a5; background: rgba(239,68,68,0.1); padding: 0.1rem 0.3rem; border-radius: 0.2rem; }
.chat-date { font-size: 0.68rem; color: #475569; margin-inline-start: auto; }
.chat-content { font-size: 0.8rem; color: #cbd5e1; margin: 0.2rem 0 0; }
</style>
