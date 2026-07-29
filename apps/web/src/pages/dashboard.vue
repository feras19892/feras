<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '../composables/useI18n'
import { useAuthStore } from '../modules/auth/stores/auth'
import BranchCard from '../components/ui/BranchCard.vue'
import ClassManager from '../components/teacher/ClassManager.vue'
import TeacherGrading from '../components/teacher/TeacherGrading.vue'
import TeacherStats from '../components/teacher/TeacherStats.vue'
import TeacherDashboard from '../components/teacher/TeacherDashboard.vue'
import StudentDashboard from '../components/student/StudentDashboard.vue'
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue'
import NotificationBell from '../components/shared/NotificationBell.vue'
import { fetchHomeCards } from '../services/home.service'
import { fetchJson } from '../services/http'
import type { HomeCard } from '../types/physics'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const auth = useAuthStore()

const activeTab = ref<'experiments' | 'classes' | 'settings'>('experiments')
const cards = ref<HomeCard[]>([])
const loading = ref(false)

// Settings state
const editName = ref('')
const savingName = ref(false)
const nameMsg = ref('')
const newPwd = ref('')
const savingPwd = ref(false)
const pwdMsg = ref('')
const newEmail = ref('')
const savingEmail = ref(false)
const emailMsg = ref('')

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US')

const translatedCards = computed(() => cards.value.map(card => ({
  ...card,
  title: t(`dashboard.${card.id}Title`),
  desc: t(`dashboard.${card.id}Desc`),
  stats: t(`dashboard.${card.id}Stats`),
})))

const goToBranch = (branchId: string) => {
  if (branchId === 'physics') router.push('/physics')
  if (branchId === 'chemistry') router.push('/chemistry')
  if (branchId === 'mathematics') router.push('/math')
  if (branchId === 'general') router.push('/biology')
}

const loadCards = async () => {
  loading.value = true
  try { cards.value = await fetchHomeCards() } catch { /* ignore */ } finally { loading.value = false }
}

async function handleSaveName() {
  if (editName.value.trim().length < 2) return
  savingName.value = true; nameMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean; user?: any }>('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.value.trim() }),
    })
    if (res.success) { nameMsg.value = '✅ تم الحفظ'; if (res.user) auth.user = res.user }
    else nameMsg.value = 'فشل الحفظ'
  } catch { nameMsg.value = 'فشل الحفظ' }
  savingName.value = false
}

async function handleChangePassword() {
  if (newPwd.value.length < 8) { pwdMsg.value = 'كلمة المرور قصيرة جداً'; return }
  savingPwd.value = true; pwdMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean }>('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: auth.user!.id, new_password: newPwd.value }),
    })
    if (res.success) { pwdMsg.value = '✅ تم التغيير'; newPwd.value = '' }
    else pwdMsg.value = 'فشل التغيير'
  } catch { pwdMsg.value = 'فشل التغيير' }
  savingPwd.value = false
}

async function handleEmailChange() {
  if (!newEmail.value.trim()) return
  savingEmail.value = true; emailMsg.value = ''
  try {
    const res = await fetchJson<{ success: boolean; message?: string }>('/api/auth/email-change-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_email: newEmail.value.trim() }),
    })
    if (res.success) { emailMsg.value = '✅ تم إرسال الطلب للأدمن'; newEmail.value = '' }
    else emailMsg.value = res.message || 'فشل الطلب'
  } catch (e: any) {
    emailMsg.value = e?.message || 'فشل الطلب'
  }
  savingEmail.value = false
}

onMounted(async () => {
  if (!auth.isGuest) { await auth.fetchMe() }
  if (auth.isAdmin && route.query.view !== 'experiments') { router.push('/admin'); return }
  if (auth.user) editName.value = auth.user.name
  await loadCards()
})
</script>

<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dash-header">
      <div class="dash-brand" @click="router.push('/home')">
        <span class="brand-icon">⚛️</span>
        <div class="brand-text-group">
          <h1>PhysLab</h1>
          <span class="subtitle">
            {{ t('dashboard.welcome') }}, {{ auth.user?.name }} 👋 ·
            {{ new Date().toLocaleDateString(dateLocaleStr, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
          </span>
        </div>
      </div>
      <div class="dash-header-right">
        <AccountSettingsModal />
        <NotificationBell />
        <div class="user-badge" :class="{ teacher: auth.isTeacher, student: auth.isStudent, admin: auth.isAdmin }">
          <span class="user-icon">{{ auth.isAdmin ? '🛡️' : auth.isTeacher ? '👨‍🏫' : '🎓' }}</span>
          <span class="user-role">{{ auth.isAdmin ? 'أدمن' : auth.isTeacher ? 'مدرس' : 'طالب' }}</span>
        </div>
        <button class="logout-btn" @click="auth.logout(); router.push('/')">{{ t('dashboard.logout') }}</button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="dash-tabs">
      <button :class="['tab', { active: activeTab === 'experiments' }]" @click="activeTab = 'experiments'">
        <span>🔬</span> التجارب
      </button>
      <button v-if="!auth.isAdmin" :class="['tab', { active: activeTab === 'classes' }]" @click="activeTab = 'classes'">
        <span>📚</span> فصولي
      </button>
      <button v-if="auth.isAdmin" class="tab admin-link" @click="router.push('/admin')">
        <span>🛡️</span> لوحة الأدمن
      </button>
      <button v-if="!auth.isAdmin" :class="['tab', { active: activeTab === 'settings' }]" @click="activeTab = 'settings'">
        <span>⚙️</span> الإعدادات
      </button>
    </div>

    <!-- Experiments Tab -->
    <div v-if="activeTab === 'experiments'" class="tab-panel">
      <p v-if="loading" class="loading-text">...</p>
      <div v-else class="cards-grid">
        <BranchCard
          v-for="card in translatedCards"
          :key="card.id"
          :id="card.id"
          :icon="card.icon"
          :title="card.title"
          :desc="card.desc"
          :stats="card.stats"
          :action="() => goToBranch(card.branchId)"
        />
      </div>
    </div>

    <!-- Classes Tab (teacher/student only) -->
    <div v-if="activeTab === 'classes' && !auth.isAdmin" class="tab-panel">
      <TeacherDashboard v-if="auth.isTeacher" @navigate="activeTab = 'experiments'" />
      <StudentDashboard v-else-if="auth.isStudent" @navigate="activeTab = 'experiments'" />
      <ClassManager v-if="auth.isTeacher" />
      <TeacherGrading v-if="auth.isTeacher" />
      <TeacherStats v-if="auth.isTeacher" />
    </div>

    <!-- Settings Tab -->
    <div v-if="activeTab === 'settings'" class="tab-panel">
      <div class="settings-grid">
        <div class="settings-card">
          <h3>📝 تعديل الاسم</h3>
          <input v-model="editName" type="text" class="settings-input" placeholder="الاسم" />
          <button class="settings-btn" :disabled="savingName" @click="handleSaveName">{{ savingName ? '...' : 'حفظ' }}</button>
          <p v-if="nameMsg" class="settings-msg">{{ nameMsg }}</p>
        </div>
        <div class="settings-card">
          <h3>🔑 تغيير كلمة المرور</h3>
          <input v-model="newPwd" type="password" class="settings-input" placeholder="كلمة المرور الجديدة" />
          <button class="settings-btn" :disabled="savingPwd" @click="handleChangePassword">{{ savingPwd ? '...' : 'تغيير' }}</button>
          <p v-if="pwdMsg" class="settings-msg">{{ pwdMsg }}</p>
        </div>
        <div class="settings-card">
          <h3>📧 طلب تغيير البريد</h3>
          <p class="settings-hint">البريد الحالي: <strong>{{ auth.user?.email }}</strong></p>
          <p class="settings-hint">تغيير البريد يتطلب موافقة الأدمن.</p>
          <input v-model="newEmail" type="email" class="settings-input" placeholder="البريد الجديد" />
          <button class="settings-btn" :disabled="savingEmail" @click="handleEmailChange">{{ savingEmail ? '...' : 'إرسال الطلب' }}</button>
          <p v-if="emailMsg" class="settings-msg">{{ emailMsg }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0f1c 0%, #111827 40%, #0f172a 100%);
  color: #e2e8f0;
  padding: 1.5rem;
}
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  gap: 1rem;
  flex-wrap: wrap;
}
.dash-brand { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; user-select: none; }
.brand-icon { font-size: 1.6rem; }
.brand-text-group { display: flex; flex-direction: column; gap: 0.1rem; }
.dash-header h1 { font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.subtitle { font-size: 0.8rem; color: #64748b; }
.dash-header-right { display: flex; align-items: center; gap: 0.75rem; }
.user-badge { display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.7rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); font-size: 0.8rem; }
.user-badge.teacher { color: #a5b4fc; border-color: rgba(165,180,252,0.2); }
.user-badge.student { color: #4ade80; border-color: rgba(74,222,128,0.2); }
.user-badge.admin { color: #f87171; border-color: rgba(248,113,113,0.2); }
.tab.admin-link { color: #f87171; border-color: rgba(248,113,113,0.2); }
.tab.admin-link:hover { background: rgba(248,113,113,0.1); }
.logout-btn { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.08); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.82rem; font-weight: 600; }
.logout-btn:hover { background: rgba(239,68,68,0.15); }

.dash-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.tab { padding: 0.5rem 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(15,23,42,0.6); color: #94a3b8; cursor: pointer; font-family: inherit; font-weight: 600; transition: all 0.2s; display: flex; align-items: center; gap: 0.3rem; }
.tab.active { background: rgba(99,102,241,0.15); color: #a5b4fc; border-color: rgba(99,102,241,0.3); }

.tab-panel { animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.loading-text { text-align: center; color: #94a3b8; font-size: 1.1rem; }
.cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; justify-items: center; max-width: 1000px; width: 100%; margin: 0 auto; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; max-width: 900px; }
.settings-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
.settings-card h3 { margin: 0 0 0.3rem; font-size: 1rem; color: #e2e8f0; }
.settings-input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 0.5rem; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 0.85rem; box-sizing: border-box; }
.settings-input:focus { outline: none; border-color: #818cf8; }
.settings-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; font-weight: 700; cursor: pointer; font-family: inherit; font-size: 0.85rem; }
.settings-btn:disabled { opacity: 0.6; cursor: wait; }
.settings-msg { font-size: 0.8rem; margin: 0; }
.settings-hint { font-size: 0.78rem; color: #94a3b8; margin: 0; }
</style>
