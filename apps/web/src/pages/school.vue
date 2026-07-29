<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getSchoolStats, getSchoolUsers, getSchoolClasses, getSchoolReports,
  removeSchoolUser, blockSchoolUser, unblockSchoolUser,
  updateSchoolName, changeSchoolPassword, requestEmailChange,
  logoutSchool,
  getSchoolSessions, getSchoolActivity, getSchoolWarnings,
  type School, type SchoolStats, type SchoolUser, type SchoolClass,
} from '../services/school.service';
import { fetchJson } from '../services/http';
import HelpModal from '../components/shared/HelpModal.vue';
import ApprovalPanel from '../components/shared/ApprovalPanel.vue';
import PanelShell from '../components/shared/PanelShell.vue';
import TeacherPerformance from '../components/school/TeacherPerformance.vue';
import type { DockItem } from '../components/shared/PanelShell.vue';

const router = useRouter();
const { t, locale } = useI18n();
const auth = useAuthStore();

const school = ref<School | null>(null);
const stats = ref<SchoolStats | null>(null);
const users = ref<SchoolUser[]>([]);
const classes = ref<SchoolClass[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const activeTab = ref<'overview' | 'users' | 'classes' | 'reports' | 'teachers' | 'sessions' | 'activity' | 'warnings' | 'approvals' | 'settings'>('overview');
const freezeReason = ref('');
const freezeLoading = ref(false);
const capacityForm = ref({ requested_max_students: null as number | null, requested_max_teachers: null as number | null, reason: '' });
const capacitySaving = ref(false);
const capacityMsg = ref('');
const capacityRequests = ref<any[]>([]);
const helpOpen = ref(false);

const dockItems = computed<DockItem[]>(() => [
  { id: 'overview', icon: '📊', label: 'نظرة عامة' },
  { id: 'users', icon: '👥', label: 'المستخدمون', badge: users.value.length || undefined },
  { id: 'classes', icon: '📚', label: 'الفصول', badge: classes.value.length || undefined },
  { id: 'reports', icon: '📄', label: 'التقارير', badge: reports.value.length || undefined },
  { id: 'teachers', icon: '📊', label: 'أداء المدرسين' },
  { id: 'sessions', icon: '🔑', label: 'الجلسات', badge: sessions.value.length || undefined },
  { id: 'activity', icon: '📝', label: 'النشاطات', badge: activityLog.value.length || undefined },
  { id: 'warnings', icon: '⚠️', label: 'التحذيرات', badge: schoolWarnings.value.length || undefined },
  { id: 'approvals', icon: '📋', label: 'الموافقات' },
  { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
]);

const barStats = computed(() => stats.value ? [
  { icon: '🎓', value: stats.value.students, label: 'طلاب' },
  { icon: '👨‍🏫', value: stats.value.teachers, label: 'مدرسين' },
  { icon: '🏫', value: stats.value.classes, label: 'فصول' },
  { icon: '📄', value: stats.value.reports, label: 'تقارير' },
] : []);

const activeLabel = computed(() => dockItems.value.find(d => d.id === activeTab.value)?.label || '');
const reports = ref<any[]>([]);
const sessions = ref<any[]>([]);
const activityLog = ref<any[]>([]);
const schoolWarnings = ref<any[]>([]);

const editName = ref('');
const savingName = ref(false);
const nameMsg = ref('');
const currentPwd = ref('');
const newPwd = ref('');
const savingPwd = ref(false);
const pwdMsg = ref('');
const newEmail = ref('');
const savingEmail = ref(false);
const emailMsg = ref('');

async function freezeClass(classId: string) {
  if (!freezeReason.value.trim()) {
    freezeReason.value = 'تم التجميد من قبل المدرسة';
  }
  freezeLoading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/school/freeze-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId, reason: freezeReason.value }),
    });
    if (res.success) {
      freezeReason.value = '';
      await loadAll();
    }
  } catch (err) {
    console.error('freeze failed:', err);
  }
  freezeLoading.value = false;
}

async function unfreezeClass(classId: string) {
  freezeLoading.value = true;
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/school/unfreeze-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: classId }),
    });
    if (res.success) await loadAll();
  } catch (err) {
    console.error('unfreeze failed:', err);
  }
  freezeLoading.value = false;
}

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
      capacityMsg.value = 'تم إرسال الطلب بنجاح';
      capacityForm.value = { requested_max_students: null, requested_max_teachers: null, reason: '' };
      await loadCapacityRequests();
    }
  } catch (err) {
    capacityMsg.value = err instanceof Error ? err.message : 'فشل الإرسال';
  }
  capacitySaving.value = false;
}

async function loadCapacityRequests() {
  try {
    const res = await fetchJson<{ success: boolean; requests: any[] }>('/api/school/capacity-requests');
    if (res.success) capacityRequests.value = res.requests;
  } catch {
    // ignore
  }
}

const helpSections = [
  {
    heading: '🏫 لوحة تحكم المدرسة',
    items: [
      { label: 'كود المدرسة', desc: 'شاركه مع المدرسين والطلاب للانضمام.' },
      { label: 'السعة', desc: 'الحد الأقصى للطلاب والمدرسين.' },
      { label: 'المستخدمون', desc: 'إدارة المدرسين والطلاب المنضمين.' },
      { label: 'الفصول', desc: 'عرض جميع الفصول المنشأة.' },
      { label: 'التقارير', desc: 'عرض تقارير طلاب المدرسة.' },
      { label: 'الإعدادات', desc: 'تعديل الاسم، كلمة المرور، طلب تغيير البريد.' },
    ],
  },
];

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

async function loadAll() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const results = await Promise.allSettled([
      getSchoolStats(),
      getSchoolUsers(),
      getSchoolClasses(),
      getSchoolReports(),
      getSchoolSessions(),
      getSchoolActivity(),
      getSchoolWarnings(),
    ]);
    if (results[0].status === 'fulfilled' && results[0].value.success) {
      school.value = results[0].value.school;
      stats.value = results[0].value.stats;
      editName.value = results[0].value.school.name;
    }
    if (results[1].status === 'fulfilled' && results[1].value.success) users.value = results[1].value.users;
    if (results[2].status === 'fulfilled' && results[2].value.success) classes.value = results[2].value.classes;
    if (results[3].status === 'fulfilled' && results[3].value.success) reports.value = results[3].value.reports;
    if (results[4].status === 'fulfilled' && results[4].value.success) sessions.value = results[4].value.sessions;
    if (results[5].status === 'fulfilled' && results[5].value.success) activityLog.value = results[5].value.activity;
    if (results[6].status === 'fulfilled' && results[6].value.success) schoolWarnings.value = results[6].value.warnings;
    await loadCapacityRequests();
  } catch (err) {
    errorMsg.value = 'Failed to load data';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function handleRemoveUser(userId: number) {
  if (!confirm(t('school.confirmRemoveUser'))) return;
  const res = await removeSchoolUser(userId);
  if (res.success) users.value = users.value.filter(u => u.id !== userId);
}

async function handleBlockUser(userId: number) {
  const res = await blockSchoolUser(userId);
  if (res.success) await loadAll();
}

async function handleUnblockUser(userId: number) {
  const res = await unblockSchoolUser(userId);
  if (res.success) await loadAll();
}

async function handleSaveName() {
  if (editName.value.trim().length < 2) return;
  savingName.value = true; nameMsg.value = '';
  const res = await updateSchoolName(editName.value.trim());
  savingName.value = false;
  if (res.success && res.school) { school.value = res.school; nameMsg.value = '✅ تم الحفظ'; }
  else nameMsg.value = res.message || 'فشل الحفظ';
}

async function handleChangePassword() {
  if (newPwd.value.length < 8) { pwdMsg.value = 'كلمة المرور قصيرة جداً'; return; }
  savingPwd.value = true; pwdMsg.value = '';
  const res = await changeSchoolPassword(currentPwd.value, newPwd.value);
  savingPwd.value = false;
  if (res.success) { pwdMsg.value = '✅ تم التغيير'; currentPwd.value = ''; newPwd.value = ''; }
  else pwdMsg.value = res.message || 'فشل التغيير';
}

async function handleEmailChange() {
  if (!newEmail.value.trim()) return;
  savingEmail.value = true; emailMsg.value = '';
  const res = await requestEmailChange(newEmail.value.trim());
  savingEmail.value = false;
  if (res.success) { emailMsg.value = '✅ تم إرسال الطلب للأدمن'; newEmail.value = ''; }
  else emailMsg.value = res.message || 'فشل الطلب';
}

async function handleLogout() {
  await logoutSchool();
  auth.clearSchoolSession();
  router.push('/');
}

onMounted(loadAll);
</script>

<template>
  <PanelShell
    :dock-items="dockItems"
    :active-id="activeTab"
    :title="activeLabel"
    role="school"
    :user-name="school?.name || ''"
    :stats="barStats"
    @select="activeTab = $event as any"
    @home="router.push('/')"
    @logout="handleLogout"
  >
    <!-- School Code Box -->
    <div v-if="school" class="code-box">
      <span class="code-label">{{ t('school.yourCode') }}:</span>
      <span class="code-value">{{ school.code }}</span>
      <span class="code-hint">{{ t('school.codeHint') }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading"><div class="spinner"></div></div>
    <div v-else-if="errorMsg" class="error-box">❌ {{ errorMsg }}</div>

    <template v-else>
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-panel">
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

        <!-- Capacity increase request -->
        <div class="capacity-request-section">
          <h4>📦 طلب زيادة السعة</h4>
          <div class="cap-form">
            <input
              v-model.number="capacityForm.requested_max_students"
              type="number"
              :placeholder="`حد الطلاب (الحالي: ${school?.max_students || 0})`"
              class="cap-input"
            />
            <input
              v-model.number="capacityForm.requested_max_teachers"
              type="number"
              :placeholder="`حد المدرسين (الحالي: ${school?.max_teachers || 0})`"
              class="cap-input"
            />
            <input
              v-model="capacityForm.reason"
              placeholder="سبب الطلب"
              class="cap-input reason"
            />
            <button
              @click="submitCapacityRequest"
              :disabled="capacitySaving || !capacityForm.reason.trim()"
              class="cap-submit"
            >
              {{ capacitySaving ? 'جاري...' : 'إرسال الطلب' }}
            </button>
          </div>
          <div v-if="capacityMsg" class="cap-msg">{{ capacityMsg }}</div>
          <div v-if="capacityRequests.length > 0" class="cap-requests-list">
            <div v-for="req in capacityRequests" :key="req.id" class="cap-req-item">
              <span class="cap-req-status" :class="req.status">{{ req.status }}</span>
              <span>طلاب: {{ req.requested_max_students || '—' }} | مدرسين: {{ req.requested_max_teachers || '—' }}</span>
              <span class="cap-req-date">{{ new Date(req.created_at).toLocaleDateString('ar-SA') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Teachers Performance Tab -->
      <div v-if="activeTab === 'teachers'" class="tab-panel">
        <TeacherPerformance />
      </div>

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'" class="tab-panel">
        <div v-if="users.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <p>{{ t('school.noUsers') }}</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th>انضم في</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="clickable-row" @click="router.push(`/school/user/${u.id}`)">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td><span class="role-tag" :class="u.role">{{ u.role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ u.role }}</span></td>
              <td><span v-if="(u as any).blocked_at" class="status-tag blocked">🚫 محظور</span><span v-else class="status-tag active">✅ نشط</span></td>
              <td>{{ new Date(u.created_at).toLocaleDateString(dateLocaleStr) }}</td>
              <td class="action-cell" @click.stop>
                <button class="mini-btn view" @click="router.push(`/school/user/${u.id}`)" title="عرض">👁️</button>
                <button v-if="(u as any).blocked_at" class="mini-btn unblock" @click="handleUnblockUser(u.id)" title="إلغاء الحظر">🔓</button>
                <button v-else class="mini-btn block" @click="handleBlockUser(u.id)" title="حظر">🚫</button>
                <button class="mini-btn remove" @click="handleRemoveUser(u.id)" title="إزالة">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Classes Tab -->
      <div v-if="activeTab === 'classes'" class="tab-panel">
        <div v-if="classes.length === 0" class="empty-state">
          <div class="empty-icon">🏫</div>
          <p>{{ t('school.noClasses') }}</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>الفصل</th>
              <th>الكود</th>
              <th>المدرس</th>
              <th>الطلاب</th>
              <th>أنشئ في</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in classes" :key="c.id" class="clickable-row" @click="router.push(`/school/class/${c.id}`)">
              <td>{{ c.name }}</td>
              <td><code>{{ c.code }}</code></td>
              <td>{{ c.teacher_name }}</td>
              <td>{{ c.student_count }}</td>
              <td>{{ new Date(c.created_at).toLocaleDateString(dateLocaleStr) }}</td>
              <td @click.stop>
                <button
                  v-if="!c.is_frozen"
                  class="freeze-btn"
                  :disabled="freezeLoading"
                  @click="freezeClass(c.id)"
                  title="تجميد الفصل"
                >❄️ تجميد</button>
                <button
                  v-else
                  class="unfreeze-btn"
                  :disabled="freezeLoading"
                  @click="unfreezeClass(c.id)"
                  title="إلغاء التجميد"
                >🔥 إلغاء التجميد</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="tab-panel">
        <div v-if="reports.length === 0" class="empty-state"><div class="empty-icon">📄</div><p>لا توجد تقارير</p></div>
        <table v-else class="data-table">
          <thead><tr><th>التجربة</th><th>الطالب</th><th>الفصل</th><th>الحالة</th><th>الدرجة</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr v-for="r in reports" :key="r.id">
              <td>{{ r.experiment_name }}</td>
              <td>{{ r.student_name }}</td>
              <td>{{ r.class_name || '—' }}</td>
              <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
              <td>{{ r.grade != null ? r.grade : '—' }}</td>
              <td>{{ new Date(r.created_at).toLocaleDateString(dateLocaleStr) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sessions Tab -->
      <div v-if="activeTab === 'sessions'" class="tab-panel">
        <div v-if="sessions.length === 0" class="empty-state"><div class="empty-icon">🔑</div><p>لا توجد جلسات مسجلة</p></div>
        <table v-else class="data-table">
          <thead><tr><th>المستخدم</th><th>الدور</th><th>IP</th><th>المتصفح</th><th>تسجيل الدخول</th><th>تسجيل الخروج</th></tr></thead>
          <tbody>
            <tr v-for="s in sessions" :key="s.id">
              <td>{{ s.user_name }}</td>
              <td><span class="role-tag" :class="s.user_role">{{ s.user_role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ s.user_role }}</span></td>
              <td>{{ s.ip || '—' }}</td>
              <td class="ua-cell">{{ s.user_agent || '—' }}</td>
              <td>{{ new Date(s.login_at).toLocaleString(dateLocaleStr) }}</td>
              <td>{{ s.logout_at ? new Date(s.logout_at).toLocaleString(dateLocaleStr) : '🟢 نشط' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Activity Tab -->
      <div v-if="activeTab === 'activity'" class="tab-panel">
        <div v-if="activityLog.length === 0" class="empty-state"><div class="empty-icon">📝</div><p>لا توجد نشاطات</p></div>
        <div v-else class="activity-list">
          <div v-for="a in activityLog" :key="a.id" class="activity-item">
            <div class="activity-dot"></div>
            <div class="activity-body">
              <span class="activity-action">{{ a.action }}</span>
              <span class="activity-actor">{{ a.actor_name }}</span>
              <span class="activity-details">{{ a.details }}</span>
              <span class="activity-date">{{ new Date(a.created_at).toLocaleString(dateLocaleStr) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Warnings Tab -->
      <div v-if="activeTab === 'warnings'" class="tab-panel">
        <div v-if="schoolWarnings.length === 0" class="empty-state"><div class="empty-icon">⚠️</div><p>لا توجد تحذيرات</p></div>
        <div v-else class="warnings-list">
          <div v-for="w in schoolWarnings" :key="w.id" class="warning-card" :class="w.severity">
            <div class="warning-header">
              <span class="warning-sev" :class="w.severity">{{ w.severity }}</span>
              <span class="warning-title">{{ w.title }}</span>
              <span class="warning-user">{{ w.user_name }} ({{ w.user_role }})</span>
            </div>
            <p class="warning-msg">{{ w.message }}</p>
            <span class="warning-date">{{ new Date(w.created_at).toLocaleString(dateLocaleStr) }}</span>
          </div>
        </div>
      </div>

      <!-- Approvals Tab -->
      <div v-if="activeTab === 'approvals'" class="tab-panel">
        <ApprovalPanel mode="school" />
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-panel">
        <div class="settings-grid">
          <div class="settings-card">
            <h3>📝 تعديل الاسم</h3>
            <input v-model="editName" type="text" class="settings-input" placeholder="اسم المدرسة" />
            <button class="settings-btn" :disabled="savingName" @click="handleSaveName">{{ savingName ? '...' : 'حفظ' }}</button>
            <p v-if="nameMsg" class="settings-msg">{{ nameMsg }}</p>
          </div>
          <div class="settings-card">
            <h3>🔑 تغيير كلمة المرور</h3>
            <input v-model="currentPwd" type="password" class="settings-input" placeholder="كلمة المرور الحالية" />
            <input v-model="newPwd" type="password" class="settings-input" placeholder="كلمة المرور الجديدة" />
            <button class="settings-btn" :disabled="savingPwd" @click="handleChangePassword">{{ savingPwd ? '...' : 'تغيير' }}</button>
            <p v-if="pwdMsg" class="settings-msg">{{ pwdMsg }}</p>
          </div>
          <div class="settings-card">
            <h3>📧 طلب تغيير البريد</h3>
            <p class="settings-hint">البريد الحالي: <strong>{{ school?.email }}</strong></p>
            <p class="settings-hint">تغيير البريد يتطلب موافقة الأدمن.</p>
            <input v-model="newEmail" type="email" class="settings-input" placeholder="البريد الجديد" />
            <button class="settings-btn" :disabled="savingEmail" @click="handleEmailChange">{{ savingEmail ? '...' : 'إرسال الطلب' }}</button>
            <p v-if="emailMsg" class="settings-msg">{{ emailMsg }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- Help Modal -->
    <HelpModal v-if="helpOpen" :title="t('school.helpTitle')" :sections="helpSections" @close="helpOpen = false" />
  </PanelShell>
</template>

<style scoped>
.code-box {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1.2rem;
  margin-bottom: 1.5rem;
  border-radius: 0.8rem;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
}
.code-label { font-size: 0.85rem; color: #94a3b8; }
.code-value { font-size: 1.4rem; font-weight: 800; color: #67e8f9; font-family: monospace; letter-spacing: 0.15rem; }
.code-hint { font-size: 0.75rem; color: #64748b; }

.loading { text-align: center; padding: 3rem; }
.spinner { width: 36px; height: 36px; border: 3px solid rgba(99,102,241,0.2); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-box { background: rgba(239,68,68,0.1); color: #f87171; padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); text-align: center; }

.school-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tab { padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); color: #94a3b8; cursor: pointer; font-family: inherit; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 0.3rem; }
.tab.active { background: rgba(6,182,212,0.15); color: #67e8f9; border-color: rgba(6,182,212,0.3); }
.tab-badge { background: rgba(99,102,241,0.3); color: #a5b4fc; padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.7rem; }

.tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

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
.freeze-btn { background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }
.freeze-btn:hover { background: rgba(59,130,246,0.25); }
.freeze-btn:disabled { opacity: 0.4; }
.unfreeze-btn { background: rgba(249,115,22,0.15); color: #fb923c; border: 1px solid rgba(249,115,22,0.3); border-radius: 0.3rem; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }
.unfreeze-btn:hover { background: rgba(249,115,22,0.25); }
.unfreeze-btn:disabled { opacity: 0.4; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.8rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); }
.data-table td { padding: 0.6rem 0.8rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.clickable-row { cursor: pointer; transition: background 0.12s; }
.clickable-row:hover { background: rgba(6,182,212,0.06); }
.role-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.role-tag.teacher { background: rgba(129,140,248,0.15); color: #a5b4fc; }
.role-tag.student { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag { padding: 0.15rem 0.5rem; border-radius: 0.3rem; font-size: 0.75rem; }
.status-tag.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-tag.blocked { background: rgba(239,68,68,0.15); color: #f87171; }
.status-tag.submitted { background: rgba(59,130,246,0.15); color: #60a5fa; }
.status-tag.graded { background: rgba(168,85,247,0.15); color: #c084fc; }
.status-tag.draft { background: rgba(100,116,139,0.15); color: #94a3b8; }

.action-cell { display: flex; gap: 0.3rem; }
.mini-btn { width: 28px; height: 28px; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); cursor: pointer; font-size: 0.8rem; }
.mini-btn.view:hover { background: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.3); }
.mini-btn.block:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }
.mini-btn.unblock:hover { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.3); }
.mini-btn.remove:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); }

.ua-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #475569; font-size: 0.72rem; }

.activity-list { display: flex; flex-direction: column; gap: 0.5rem; }
.activity-item { display: flex; gap: 0.6rem; align-items: flex-start; }
.activity-dot { width: 8px; height: 8px; border-radius: 50%; background: #06b6d4; margin-top: 0.35rem; flex-shrink: 0; }
.activity-body { flex: 1; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.04); border-radius: 0.4rem; padding: 0.5rem 0.7rem; }
.activity-action { font-size: 0.82rem; font-weight: 700; color: #67e8f9; display: block; }
.activity-actor { font-size: 0.75rem; color: #94a3b8; display: inline-block; margin-inline-start: 0.3rem; }
.activity-details { font-size: 0.78rem; color: #94a3b8; display: block; margin-top: 0.15rem; }
.activity-date { font-size: 0.68rem; color: #475569; display: block; margin-top: 0.2rem; }

.warnings-list { display: flex; flex-direction: column; gap: 0.5rem; }
.warning-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.7rem; }
.warning-card.high { border-color: rgba(245,158,11,0.2); }
.warning-card.critical { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.04); }
.warning-header { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.3rem; }
.warning-sev { padding: 0.1rem 0.4rem; border-radius: 0.3rem; font-size: 0.65rem; font-weight: 700; }
.warning-sev.low { background: rgba(100,116,139,0.2); color: #94a3b8; }
.warning-sev.normal { background: rgba(6,182,212,0.15); color: #67e8f9; }
.warning-sev.high { background: rgba(245,158,11,0.15); color: #fcd34d; }
.warning-sev.critical { background: rgba(239,68,68,0.15); color: #fca5a5; }
.warning-title { font-size: 0.82rem; font-weight: 700; color: #f1f5f9; }
.warning-user { font-size: 0.72rem; color: #64748b; margin-inline-start: auto; }
.warning-msg { font-size: 0.78rem; color: #94a3b8; margin: 0.2rem 0; }
.warning-date { font-size: 0.68rem; color: #475569; }

.empty-state { text-align: center; padding: 3rem; color: #64748b; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
.settings-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.settings-card h3 { margin: 0 0 0.3rem; font-size: 1rem; color: #e2e8f0; }
.settings-input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; box-sizing: border-box; }
.settings-input:focus { outline: none; border-color: #06b6d4; }
.settings-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.settings-btn:disabled { opacity: 0.6; cursor: wait; }
.settings-msg { font-size: 0.8rem; margin: 0; }
.settings-hint { font-size: 0.78rem; color: #94a3b8; margin: 0; }
</style>
